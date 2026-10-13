(function(){
  if (typeof App === 'undefined') return;

  var pollingTimer = null;
  var lastIds = {};
  var initialLoad = false;

  function timeAgo(s) {
    if (!s) return '';
    try {
      var t = new Date(String(s).replace(' ', 'T') + 'Z').getTime();
      var diff = Date.now() - t;
      if (diff < 60000) return 'now';
      var m = Math.floor(diff / 60000);
      if (m < 60) return m + 'm';
      var h = Math.floor(m / 60);
      if (h < 24) return h + 'h';
      return Math.floor(h / 24) + 'd';
    } catch (e) { return ''; }
  }

  function closeTime(a, b) {
    try {
      var ta = new Date(String(a).replace(' ', 'T') + 'Z').getTime();
      var tb = new Date(String(b).replace(' ', 'T') + 'Z').getTime();
      return Math.abs(ta - tb) < 120000;
    } catch (e) { return false; }
  }

  function renderMessage(msg, selfId, isFirst, isLast) {
    var isSelf = msg.user_id === selfId;
    var name = msg.name || msg.username || 'User';
    var initial = (name.charAt(0) || 'U').toUpperCase();
    var avatar = msg.avatar_url
      ? '<img src="' + msg.avatar_url + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%">'
      : initial;

    var bubbleContent = '';
    if (msg.image_data) {
      bubbleContent += '<div style="margin-bottom:' + (msg.message ? '6px' : '0') + '"><img src="' + msg.image_data + '" style="max-width:220px;max-height:260px;border-radius:12px;display:block;cursor:pointer" onclick="window.open(this.src,\'_blank\')" loading="lazy"></div>';
    }
    if (msg.message) {
      bubbleContent += '<div style="font-size:14.5px;line-height:1.4;color:' + (isSelf ? '#1a1208' : 'var(--bone)') + ';word-wrap:break-word;white-space:pre-wrap">' + escHtml(msg.message) + '</div>';
    }

    var r = '18px';
    var corner = '6px';
    var br;
    if (isSelf) {
      br = (isFirst ? r : corner) + ' ' + r + ' ' + r + ' ' + (isLast ? r : corner);
    } else {
      br = r + ' ' + (isFirst ? r : corner) + ' ' + (isLast ? r : corner) + ' ' + r;
    }

    var avatarHtml = isLast
      ? '<div style="width:28px;height:28px;border-radius:50%;background:var(--panel);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;font-weight:600;font-size:12px;color:var(--copper)">' + avatar + '</div>'
      : '<div style="width:28px;flex-shrink:0"></div>';

    var bottom = isLast ? '10px' : '3px';

    return '<div style="display:flex;gap:8px;align-items:flex-end;flex-direction:' + (isSelf ? 'row-reverse' : 'row') + ';padding-bottom:' + bottom + '">' +
      avatarHtml +
      '<div style="max-width:calc(100% - 70px);padding:9px 14px;border-radius:' + br + ';background:' + (isSelf ? 'var(--copper)' : 'var(--panel)') + ';border:1px solid ' + (isSelf ? 'var(--copper)' : 'var(--border2)') + '">' + bubbleContent + '</div>' +
    '</div>';
  }

  function renderAllMessages(msgs, selfId) {
    if (!msgs.length) return '<div style="text-align:center;color:var(--ash);font-size:13px;padding:40px 20px">No messages yet. Start the conversation!</div>';
    var html = '';
    for (var i = 0; i < msgs.length; i++) {
      var m = msgs[i];
      var p = msgs[i - 1];
      var n = msgs[i + 1];
      var isFirst = !p || p.user_id !== m.user_id || !closeTime(p.created_at, m.created_at);
      var isLast = !n || n.user_id !== m.user_id || !closeTime(m.created_at, n.created_at);
      html += renderMessage(m, selfId, isFirst, isLast);
    }
    return html;
  }

  App.pageChat = async function(){
    document.body.classList.add('chat-fullscreen');
    var c = document.getElementById('content');
    c.innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
    try {
      var sess = await fetch('/api/auth/session').then(function(r){ return r.json(); });
      if (!sess.ok || !sess.authenticated) throw new Error('Not logged in');
      var selfId = sess.user.id;

      var r = await fetch('/api/chat');
      var d = await r.json();
      if (!d.ok) throw new Error(d.error);
      var messages = d.messages || [];

      // Clear container
      c.innerHTML =
        '<div style="display:flex;flex-direction:column;height:calc(100vh - 60px);max-width:900px;margin:0 auto;width:100%;padding:20px 20px 0">' +
          '<div style="margin-bottom:14px">' +
            '<div class="eyebrow">Community</div>' +
            '<h1 class="page-title" style="margin-bottom:4px">Chat</h1>' +
            '<p class="page-sub" style="font-size:13px">Global room — everyone sees your messages. New members start fresh.</p>' +
          '</div>' +
          '<div id="chatScroll" style="flex:1;overflow-y:auto;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px;display:flex;flex-direction:column;gap:14px;margin-bottom:14px"></div>' +
          '<div style="padding-bottom:20px">' +
            '<div id="chatImgPreview" style="display:none;margin-bottom:10px;padding:10px;background:var(--panel);border:1px solid var(--border2);border-radius:10px;position:relative">' +
              '<img id="chatImgThumb" style="max-height:120px;border-radius:6px;display:block">' +
              '<button id="chatImgRemove" style="position:absolute;top:6px;right:6px;width:24px;height:24px;border-radius:50%;background:rgba(0,0,0,.7);border:0;color:#fff;cursor:pointer;font-size:14px;line-height:1">×</button>' +
            '</div>' +
            '<div style="display:flex;gap:8px;align-items:flex-end;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:8px">' +
              '<button id="chatImgBtn" style="width:38px;height:38px;border-radius:10px;background:var(--panel);border:1px solid var(--border2);color:var(--copper);cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></button>' +
              '<textarea id="chatInput" placeholder="Message everyone..." style="flex:1;background:transparent;border:0;color:var(--white);font-size:14px;font-family:inherit;outline:none;resize:none;max-height:120px;padding:9px 4px;line-height:1.4" rows="1"></textarea>' +
              '<button id="chatSendBtn" style="width:38px;height:38px;border-radius:10px;background:var(--copper);border:0;color:#000;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>' +
              '<input type="file" id="chatFileInput" accept="image/*" style="display:none">' +
            '</div>' +
          '</div>' +
        '</div>';

      var scroll = document.getElementById('chatScroll');
      var input = document.getElementById('chatInput');
      var sendBtn = document.getElementById('chatSendBtn');
      var imgBtn = document.getElementById('chatImgBtn');
      var fileInp = document.getElementById('chatFileInput');
      var imgPreview = document.getElementById('chatImgPreview');
      var imgThumb = document.getElementById('chatImgThumb');
      var imgRemove = document.getElementById('chatImgRemove');
      var pendingImage = null;

      function renderAll(msgs, scrollBottom) {
        if (!msgs.length) {
          scroll.innerHTML = '<div style="text-align:center;color:var(--ash);font-size:13px;padding:40px 20px">No messages yet. Start the conversation!</div>';
          return;
        }
        scroll.innerHTML = renderAllMessages(msgs, selfId);
        if (scrollBottom !== false) scroll.scrollTop = scroll.scrollHeight;
        lastIds = {};
        msgs.forEach(function(m){ lastIds[m.id] = true; });
      }

      renderAll(messages);
      if (d.just_joined) {
        scroll.innerHTML = '<div style="text-align:center;color:var(--fog);font-size:13px;padding:40px 20px;line-height:1.6">👋 Welcome to the community chat!<br><span style="font-size:11px;color:var(--ash)">You joined just now — previous messages aren\'t shown.</span></div>';
      }

      function autoResize() {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
      }
      input.addEventListener('input', autoResize);

      imgBtn.onclick = function(){ fileInp.click(); };
      fileInp.onchange = function(e) {
        var f = e.target.files[0];
        if (!f) return;
        if (f.size > 600 * 1024) { toast('Image too large (max 600KB)', 'error'); fileInp.value = ''; return; }
        var reader = new FileReader();
        reader.onload = function(ev) {
          pendingImage = { data: ev.target.result, mime: f.type };
          imgThumb.src = ev.target.result;
          imgPreview.style.display = 'block';
        };
        reader.readAsDataURL(f);
        fileInp.value = '';
      };
      imgRemove.onclick = function(){ pendingImage = null; imgPreview.style.display = 'none'; imgThumb.src = ''; };

      async function sendMessage() {
        var txt = input.value.trim();
        if (!txt && !pendingImage) return;
        sendBtn.disabled = true;
        try {
          var payload = { message: txt };
          if (pendingImage) { payload.image_data = pendingImage.data; payload.image_mime = pendingImage.mime; }
          var r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          var d = await r.json();
          if (d.ok) {
            input.value = '';
            autoResize();
            pendingImage = null;
            imgPreview.style.display = 'none';
            await pollChat();
          } else toast(d.error || 'Failed', 'error');
        } catch (e) { toast('Error: ' + e.message, 'error'); }
        sendBtn.disabled = false;
      }

      sendBtn.onclick = sendMessage;
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
      });

      async function pollChat() {
        try {
          var r = await fetch('/api/chat');
          var d = await r.json();
          if (!d.ok) return;
          var msgs = d.messages || [];
          var hasNew = msgs.some(function(m){ return !lastIds[m.id]; });
          if (hasNew) {
            var wasAtBottom = scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight < 80;
            renderAll(msgs, wasAtBottom);
          }
        } catch (e) {}
      }

      if (pollingTimer) clearInterval(pollingTimer);
      pollingTimer = setInterval(pollChat, 3000);

      input.focus();
    } catch (e) {
      c.innerHTML = '<div class="card" style="text-align:center;padding:40px"><p style="color:#f87171">Error: ' + escHtml(e.message) + '</p></div>';
    }
  };

  // Cleanup polling bila keluar page
  var origLoad = App.load.bind(App);
  App.load = function(id){
    if (id !== 'chat') { document.body.classList.remove('chat-fullscreen'); }
    if (id !== 'chat' && pollingTimer) { clearInterval(pollingTimer); pollingTimer = null; }
    if (id === 'chat') {
      document.getElementById('content').innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
      return this.pageChat();
    }
    return origLoad(id);
  };
})();

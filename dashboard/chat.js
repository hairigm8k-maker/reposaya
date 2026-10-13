(function(){
  if (typeof App === 'undefined') return;
  var pollingTimer = null;
  var lastIds = {};

  function fmtTime(s) {
    if (!s) return '';
    try {
      var d = new Date(String(s).replace(' ', 'T') + 'Z');
      return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
    } catch (e) { return ''; }
  }

  function dayLabel(s) {
    try {
      var d = new Date(String(s).replace(' ', 'T') + 'Z');
      var today = new Date();
      var yest = new Date(); yest.setDate(today.getDate() - 1);
      if (d.toDateString() === today.toDateString()) return 'Today';
      if (d.toDateString() === yest.toDateString()) return 'Yesterday';
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) { return ''; }
  }

  function sameDay(a, b) {
    try {
      var da = new Date(String(a).replace(' ', 'T') + 'Z');
      var db = new Date(String(b).replace(' ', 'T') + 'Z');
      return da.toDateString() === db.toDateString();
    } catch (e) { return false; }
  }

  function closeTime(a, b) {
    try {
      var ta = new Date(String(a).replace(' ', 'T') + 'Z').getTime();
      var tb = new Date(String(b).replace(' ', 'T') + 'Z').getTime();
      return Math.abs(ta - tb) < 300000;
    } catch (e) { return false; }
  }
  function renderBubble(msg, selfId, isFirst, isLast) {
    var isSelf = msg.user_id === selfId;
    var name = msg.name || msg.username || 'User';
    var initial = (name.charAt(0) || 'U').toUpperCase();
    var avatar = msg.avatar_url
      ? '<img src="' + msg.avatar_url + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%">'
      : initial;

    var content = '';
    if (msg.image_data) {
      content += '<div style="' + (msg.message ? 'margin-bottom:6px;' : '') + '"><img src="' + msg.image_data + '" style="max-width:220px;max-height:280px;border-radius:10px;display:block;cursor:pointer" onclick="window.open(this.src)" loading="lazy"></div>';
    }
    if (msg.message) {
      content += '<div style="font-size:14.5px;line-height:1.45;color:' + (isSelf ? '#1a1208' : 'var(--bone)') + ';word-wrap:break-word;white-space:pre-wrap">' + escHtml(msg.message) + '</div>';
    }

    var r = '18px', c = '6px';
    var br;
    if (isSelf) br = (isFirst ? r : c) + ' ' + r + ' ' + r + ' ' + (isLast ? r : c);
    else br = r + ' ' + (isFirst ? r : c) + ' ' + (isLast ? r : c) + ' ' + r;

    var timeHtml = isLast
      ? '<div style="font-size:10px;color:var(--ash);margin-top:4px;text-align:' + (isSelf ? 'right' : 'left') + ';padding-' + (isSelf ? 'right' : 'left') + ':4px">' + fmtTime(msg.created_at) + '</div>'
      : '';

    var avatarSlot = isLast
      ? '<div style="width:28px;height:28px;border-radius:50%;background:var(--panel);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;font-weight:600;font-size:12px;color:var(--copper)">' + avatar + '</div>'
      : '<div style="width:28px;flex-shrink:0"></div>';

    var nameHtml = (!isSelf && isFirst)
      ? '<div style="font-size:11.5px;color:var(--copper);font-weight:600;margin-bottom:5px;padding-left:4px">' + escHtml(name) + '</div>'
      : '';

    return '<div style="display:flex;gap:8px;align-items:flex-end;flex-direction:' + (isSelf ? 'row-reverse' : 'row') + ';margin-bottom:' + (isLast ? '12px' : '2px') + '">' +
      avatarSlot +
      '<div style="max-width:calc(100% - 70px);min-width:0;display:flex;flex-direction:column;align-items:' + (isSelf ? 'flex-end' : 'flex-start') + '">' +
        nameHtml +
        '<div style="padding:9px 14px;border-radius:' + br + ';background:' + (isSelf ? 'var(--copper)' : 'var(--panel)') + ';border:1px solid ' + (isSelf ? 'var(--copper)' : 'var(--border2)') + ';max-width:100%">' + content + '</div>' +
        timeHtml +
      '</div>' +
    '</div>';
  }

  function renderMessages(msgs, selfId) {
    if (!msgs.length) return '<div style="text-align:center;color:var(--ash);font-size:13px;padding:60px 20px;line-height:1.6">No messages yet.<br><span style="font-size:11px;color:var(--ash)">Start the conversation!</span></div>';
    var html = '';
    for (var i = 0; i < msgs.length; i++) {
      var m = msgs[i], p = msgs[i - 1], n = msgs[i + 1];
      if (!p || !sameDay(p.created_at, m.created_at)) {
        html += '<div style="display:flex;align-items:center;gap:12px;margin:20px 0 16px"><div style="flex:1;height:1px;background:var(--border)"></div><span style="font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--ash);padding:4px 10px;background:var(--panel);border:1px solid var(--border2);border-radius:9999px">' + dayLabel(m.created_at) + '</span><div style="flex:1;height:1px;background:var(--border)"></div></div>';
      }
      var isFirst = !p || p.user_id !== m.user_id || !closeTime(p.created_at, m.created_at) || !sameDay(p.created_at, m.created_at);
      var isLast = !n || n.user_id !== m.user_id || !closeTime(m.created_at, n.created_at) || !sameDay(m.created_at, n.created_at);
      html += renderBubble(m, selfId, isFirst, isLast);
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

      c.innerHTML =
        '<div style="position:fixed;top:60px;left:0;right:0;bottom:0;display:flex;flex-direction:column;background:var(--bg)">' +
          '<div style="background:var(--card);border-bottom:1px solid var(--border);padding:12px 20px;display:flex;align-items:center;gap:12px">' +
            '<div style="width:36px;height:36px;border-radius:50%;background:var(--panel);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--copper);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>' +
            '<div style="flex:1;min-width:0">' +
              '<div style="font-size:15px;font-weight:600;color:var(--white)">Community</div>' +
              '<div style="font-size:11px;color:var(--ash)">Global room · everyone can see</div>' +
            '</div>' +
          '</div>' +
          '<div id="chatScroll" style="flex:1;overflow-y:auto;padding:20px;scroll-behavior:smooth"></div>' +
          '<div style="background:var(--card);border-top:1px solid var(--border);padding:12px 16px">' +
            '<div id="chatImgPreview" style="display:none;margin-bottom:10px;padding:10px;background:var(--panel);border:1px solid var(--border2);border-radius:10px;position:relative;max-width:200px">' +
              '<img id="chatImgThumb" style="max-height:100px;border-radius:6px;display:block">' +
              '<button id="chatImgRemove" style="position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,.8);border:0;color:#fff;cursor:pointer;font-size:13px;line-height:1">×</button>' +
            '</div>' +
            '<div style="display:flex;gap:8px;align-items:flex-end;background:var(--panel);border:1px solid var(--border2);border-radius:22px;padding:6px 6px 6px 4px">' +
              '<button id="chatImgBtn" style="width:36px;height:36px;border-radius:50%;background:transparent;border:0;color:var(--fog);cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></button>' +
              '<textarea id="chatInput" placeholder="Message..." style="flex:1;background:transparent;border:0;color:var(--white);font-size:14.5px;font-family:inherit;outline:none;resize:none;max-height:120px;padding:9px 4px;line-height:1.4" rows="1"></textarea>' +
              '<button id="chatSendBtn" style="width:36px;height:36px;border-radius:50%;background:var(--copper);border:0;color:#000;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:opacity .15s"><svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>' +
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
        var wasAtBottom = scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight < 100;
        scroll.innerHTML = renderMessages(msgs, selfId);
        if (scrollBottom !== false && (scrollBottom === true || wasAtBottom)) scroll.scrollTop = scroll.scrollHeight;
        lastIds = {};
        msgs.forEach(function(m){ lastIds[m.id] = true; });
      }

      if (d.just_joined) {
        scroll.innerHTML = '<div style="text-align:center;color:var(--fog);font-size:13px;padding:60px 20px;line-height:1.7"><div style="font-size:36px;margin-bottom:12px">👋</div><strong style="color:var(--bone)">Welcome to the community chat!</strong><br><span style="font-size:11.5px;color:var(--ash)">You joined just now. Previous messages aren\'t shown.</span></div>';
      } else {
        renderAll(messages, true);
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
        sendBtn.disabled = true; sendBtn.style.opacity = '0.5';
        try {
          var payload = { message: txt };
          if (pendingImage) { payload.image_data = pendingImage.data; payload.image_mime = pendingImage.mime; }
          var r2 = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          var d2 = await r2.json();
          if (d2.ok) {
            input.value = ''; autoResize();
            pendingImage = null; imgPreview.style.display = 'none';
            await pollChat(true);
          } else toast(d2.error || 'Failed', 'error');
        } catch (e) { toast('Error: ' + e.message, 'error'); }
        sendBtn.disabled = false; sendBtn.style.opacity = '1';
      }

      sendBtn.onclick = sendMessage;
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
      });

      async function pollChat(force) {
        try {
          var r3 = await fetch('/api/chat');
          var d3 = await r3.json();
          if (!d3.ok) return;
          var msgs = d3.messages || [];
          var hasNew = msgs.some(function(m){ return !lastIds[m.id]; });
          if (hasNew || force) renderAll(msgs, force === true);
        } catch (e) {}
      }

      if (pollingTimer) clearInterval(pollingTimer);
      pollingTimer = setInterval(pollChat, 3000);

      setTimeout(function(){
        scroll.scrollTop = scroll.scrollHeight;
        input.focus();
      }, 100);
    } catch (e) {
      document.body.classList.remove('chat-fullscreen');
      c.innerHTML = '<div class="card" style="text-align:center;padding:40px"><p style="color:#f87171">Error: ' + escHtml(e.message) + '</p></div>';
    }
  };

  var origLoad = App.load.bind(App);
  App.load = function(id){
    if (id !== 'chat') document.body.classList.remove('chat-fullscreen');
    if (id !== 'chat' && pollingTimer) { clearInterval(pollingTimer); pollingTimer = null; }
    if (id === 'chat') {
      document.getElementById('content').innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
      return this.pageChat();
    }
    return origLoad(id);
  };
})();

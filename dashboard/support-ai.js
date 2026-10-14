(function(){
  if (typeof App === 'undefined') return;

  var history = [];
  var isOpen = false;
  var isSending = false;

  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function ensureWidget(){
    if (document.getElementById('csWidget')) return;

    var w = document.createElement('div');
    w.id = 'csWidget';
    w.innerHTML =
      '<button id="csBtn" style="position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;background:#cc9166;border:0;cursor:pointer;box-shadow:0 8px 24px rgba(204,145,102,.4);display:flex;align-items:center;justify-content:center;z-index:99998;transition:transform .2s" onmouseover="this.style.transform=\'scale(1.08)\'" onmouseout="this.style.transform=\'scale(1)\'">' +
        '<svg viewBox="0 0 24 24" style="width:24px;height:24px;stroke:#000;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' +
      '</button>' +
      '<div id="csPanel" style="display:none;position:fixed;bottom:92px;right:24px;width:380px;max-width:calc(100vw - 48px);height:560px;max-height:calc(100vh - 120px);background:var(--card);border:1px solid var(--border2);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.5);z-index:99997;flex-direction:column;overflow:hidden">' +
        '<div style="padding:16px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;background:var(--panel)">' +
          '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#cc9166,#5e616e);display:flex;align-items:center;justify-content:center;font-weight:700;color:#000;font-size:14px;flex-shrink:0">H</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-size:14px;font-weight:600;color:var(--white)">Hairi Support</div>' +
            '<div style="font-size:11px;color:#4ade80;display:flex;align-items:center;gap:4px"><span style="width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block"></span>Online — AI assistant</div>' +
          '</div>' +
          '<button id="csClose" style="background:transparent;border:0;color:var(--fog);cursor:pointer;font-size:20px;line-height:1;padding:4px 8px">×</button>' +
        '</div>' +
        '<div id="csMessages" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px"></div>' +
        '<div style="padding:12px;border-top:1px solid var(--border);background:var(--panel)">' +
          '<div style="display:flex;gap:8px;align-items:flex-end">' +
            '<textarea id="csInput" placeholder="Taip mesej..." style="flex:1;background:var(--bg);border:1px solid var(--border2);border-radius:14px;padding:10px 14px;font-size:13.5px;color:var(--white);font-family:inherit;outline:none;resize:none;max-height:100px;line-height:1.4;min-height:22px" rows="1"></textarea>' +
            '<button id="csSend" style="width:36px;height:36px;border-radius:50%;background:#cc9166;border:0;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center">' +
              '<svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:#000;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(w);

    document.getElementById('csBtn').onclick = toggle;
    document.getElementById('csClose').onclick = toggle;
    var inp = document.getElementById('csInput');
    inp.addEventListener('input', function(){ inp.style.height = 'auto'; inp.style.height = Math.min(inp.scrollHeight, 100) + 'px'; });
    inp.addEventListener('keydown', function(e){ if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } });
    document.getElementById('csSend').onclick = sendMsg;
  }

  function toggle(){
    isOpen = !isOpen;
    var panel = document.getElementById('csPanel');
    panel.style.display = isOpen ? 'flex' : 'none';
    if (isOpen) {
      if (!history.length) {
        renderGreeting();
      }
      setTimeout(function(){ document.getElementById('csInput').focus(); }, 100);
    }
  }

  function renderGreeting(){
    var el = document.getElementById('csMessages');
    el.innerHTML = '';
    addBubble('assistant', 'Hi! 👋 Saya Hairi, AI assistant. Boleh saya tolong anda?');
    addBubble('assistant', 'Contoh soalan: "macam mana nak deploy CLI?", "berapa harga Pro?", "macam mana nak setup custom domain?"');
  }

  function addBubble(role, text){
    var el = document.getElementById('csMessages');
    var isMe = role === 'user';
    var div = document.createElement('div');
    div.style.cssText = 'display:flex;flex-direction:' + (isMe ? 'row-reverse' : 'row') + ';gap:8px;align-items:flex-end';
    div.innerHTML =
      (isMe ? '' : '<div style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#cc9166,#5e616e);display:flex;align-items:center;justify-content:center;font-weight:700;color:#000;font-size:11px;flex-shrink:0">H</div>') +
      '<div style="max-width:78%;padding:9px 13px;border-radius:' + (isMe ? '14px 4px 14px 14px' : '4px 14px 14px 14px') + ';background:' + (isMe ? 'var(--copper)' : 'var(--panel)') + ';border:1px solid ' + (isMe ? 'var(--copper)' : 'var(--border2)') + ';font-size:13.5px;line-height:1.5;color:' + (isMe ? '#000' : 'var(--bone)') + ';white-space:pre-wrap;word-break:break-word">' + esc(text) + '</div>';
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
  }

  function addTyping(){
    var el = document.getElementById('csMessages');
    var div = document.createElement('div');
    div.id = 'csTyping';
    div.style.cssText = 'display:flex;gap:8px;align-items:flex-end';
    div.innerHTML =
      '<div style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#cc9166,#5e616e);display:flex;align-items:center;justify-content:center;font-weight:700;color:#000;font-size:11px;flex-shrink:0">H</div>' +
      '<div style="padding:10px 14px;border-radius:4px 14px 14px 14px;background:var(--panel);border:1px solid var(--border2);display:flex;gap:4px;align-items:center">' +
        '<span style="width:6px;height:6px;border-radius:50%;background:var(--fog);animation:csDot 1.4s infinite ease-in-out both;animation-delay:-0.32s"></span>' +
        '<span style="width:6px;height:6px;border-radius:50%;background:var(--fog);animation:csDot 1.4s infinite ease-in-out both;animation-delay:-0.16s"></span>' +
        '<span style="width:6px;height:6px;border-radius:50%;background:var(--fog);animation:csDot 1.4s infinite ease-in-out both"></span>' +
      '</div>';
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
  }

  function removeTyping(){
    var el = document.getElementById('csTyping');
    if (el) el.remove();
  }

  async function sendMsg(){
    if (isSending) return;
    var inp = document.getElementById('csInput');
    var text = inp.value.trim();
    if (!text) return;
    inp.value = '';
    inp.style.height = '22px';
    addBubble('user', text);
    history.push({ role: 'user', content: text });
    isSending = true;
    addTyping();
    try {
      var r = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });
      var d = await r.json();
      removeTyping();
      if (d.ok) {
        addBubble('assistant', d.reply);
        history.push({ role: 'assistant', content: d.reply });
      } else {
        addBubble('assistant', 'Maaf, ada error: ' + (d.error || 'unknown') + '. Cuba lagi atau hubungi WhatsApp +60 17-213 1814.');
      }
    } catch(e) {
      removeTyping();
      addBubble('assistant', 'Connection error. Cuba lagi.');
    }
    isSending = false;
  }

  // Add keyframes
  var style = document.createElement('style');
  style.textContent = '@keyframes csDot{0%,80%,100%{opacity:.4;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}';
  document.head.appendChild(style);

  // Init widget bila page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureWidget);
  } else {
    ensureWidget();
  }
})();

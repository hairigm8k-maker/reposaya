(function () {
  if (window.__aiChatLoaded) return;
  window.__aiChatLoaded = true;

  var WA_LINK = 'https://wa.me/60172131814';
  var LOGO = 'assets/iconcs.png';
  var history = [];
  var heroShown = true;

  function getLang() {
    return document.documentElement.dataset.currentLang === 'en' ? 'en' : 'bm';
  }
  function t(bm, en) {
    return getLang() === 'en' ? en : bm;
  }

  var suggestions = {
    bm: ['Berapa harga?', 'Nak order', 'Siap bila?', 'Ada contoh?'],
    en: ['How much?', 'Order', 'When done?', 'Samples?']
  };

  // ============ BUBBLE ============
  var bubble = document.createElement('button');
  bubble.id = 'ai-chat-bubble';
  bubble.setAttribute('aria-label', 'Chat');
  bubble.innerHTML = '<img src="' + LOGO + '" alt="Chat" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;">';

  // ============ PANEL ============
  var panel = document.createElement('div');
  panel.id = 'ai-chat-panel';
  panel.innerHTML = [
    '<div class="ai-chat-head" id="ai-chat-head">',
    '  <img src="' + LOGO + '" alt="" class="ai-chat-head-logo">',
    '  <div class="ai-chat-title">Herry</div>',
    '  <button class="ai-chat-close" aria-label="Close">✕</button>',
    '</div>',
    '<div class="ai-chat-body">',
    '  <div class="ai-chat-hero" id="ai-chat-hero">',
    '    <div class="ai-orb"></div>',
    '    <h2 class="ai-chat-greet" id="ai-greet">Ha? Apa kau nak?</h2>',
    '    <p class="ai-chat-sub" id="ai-sub">Tanya laju, aku busy.</p>',
    '    <div class="ai-suggestions" id="ai-suggestions"></div>',
    '  </div>',
    '  <div class="ai-chat-messages" id="ai-chat-messages"></div>',
    '</div>',
    '<div class="ai-chat-foot">',
    '  <div class="ai-chat-input-wrap">',
    '    <textarea class="ai-chat-input" id="ai-chat-input" rows="1" placeholder="Taip mesej..."></textarea>',
    '    <button class="ai-chat-send" id="ai-chat-send" aria-label="Send">',
    '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>',
    '    </button>',
    '  </div>',
    '</div>',
    '<a class="ai-chat-wa-link" href="' + WA_LINK + '" target="_blank" id="ai-wa-link">Atau chat kami di WhatsApp →</a>'
  ].join('');

  document.body.appendChild(bubble);
  document.body.appendChild(panel);

  var head = panel.querySelector('#ai-chat-head');
  var hero = panel.querySelector('#ai-chat-hero');
  var messagesEl = panel.querySelector('#ai-chat-messages');
  var input = panel.querySelector('#ai-chat-input');
  var sendBtn = panel.querySelector('#ai-chat-send');
  var suggestEl = panel.querySelector('#ai-suggestions');
  var greetEl = panel.querySelector('#ai-greet');
  var subEl = panel.querySelector('#ai-sub');
  var waLink = panel.querySelector('#ai-wa-link');

  // ============ SUGGESTIONS ============
  function renderSuggestions() {
    suggestEl.innerHTML = '';
    var list = suggestions[getLang()] || suggestions.bm;
    list.forEach(function (text) {
      var btn = document.createElement('button');
      btn.className = 'ai-suggestion';
      btn.textContent = text;
      btn.addEventListener('click', function () {
        input.value = text;
        send();
      });
      suggestEl.appendChild(btn);
    });
  }

  // ============ LANGUAGE ============
  function updateLang() {
    greetEl.textContent = t('Ha? Apa kau nak?', 'What do you want?');
    subEl.textContent = t('Tanya laju, aku busy.', "Ask fast, I'm busy.");
    input.placeholder = t('Taip laju...', 'Type fast...');
    waLink.textContent = t('Atau chat kami di WhatsApp →', 'Or chat us on WhatsApp →');
    renderSuggestions();
  }

  // ============ ADD MESSAGE ============
  function addMsg(text, who) {
    var el = document.createElement('div');
    el.className = 'ai-msg ' + who;

    var clean = String(text)
      .replace(/https?:\/\/wa\.me\/[^\s]+/gi, '')
      .replace(/wa\.me\/[^\s]+/gi, '')
      .trim();

    clean = clean.replace(/(https?:\/\/(?!wa\.me)[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

    el.innerHTML = clean;

    // WA button untuk setiap bot reply
    if (who === 'bot') {
      var btn = document.createElement('a');
      btn.className = 'ai-inline-wa';
      btn.href = WA_LINK;
      btn.target = '_blank';
      btn.rel = 'noopener';
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;flex-shrink:0;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg><span>Chat di WhatsApp</span>';
      el.appendChild(btn);
    }

    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  function showTyping() {
    var el = document.createElement('div');
    el.className = 'ai-typing';
    el.id = 'ai-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function hideTyping() {
    var el = document.getElementById('ai-typing');
    if (el) el.parentNode.removeChild(el);
  }

  function hideHero() {
    if (!heroShown) return;
    heroShown = false;
    hero.classList.add('hide');
  }

  // ============ SEND ============
  function send() {
    var msg = input.value.trim();
    if (!msg) return;

    hideHero();
    addMsg(msg, 'user');
    history.push({ role: 'user', content: msg });
    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;
    showTyping();

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msg,
        history: history.slice(0, -1),
        lang: getLang()
      })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        hideTyping();
        var reply = data.reply || t('Maaf, cuba lagi.', 'Sorry, try again.');
        addMsg(reply, 'bot');
        history.push({ role: 'assistant', content: reply });
      })
      .catch(function () {
        hideTyping();
        addMsg(t('Maaf, ada masalah. Cuba lagi.', 'Sorry, there is an issue. Try again.'), 'bot');
      })
      .then(function () {
        sendBtn.disabled = false;
      });
  }

  // ============ EVENTS ============
  bubble.addEventListener('click', function () {
    resetDrag();
    panel.classList.add('open');
    updateLang();
    if (messagesEl.children.length === 0) {
      addMsg(t(
        'Hai! 👋 Aku Herry. Tanya apa-apa pasal servis landing page RM99 kami.',
        "Hi! 👋 I'm Herry. Ask me anything about our RM99 landing page service."
      ), 'bot');
    }
  });

  panel.querySelector('.ai-chat-close').addEventListener('click', function () {
    panel.classList.remove('open');
    resetDrag();
  });

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
  input.addEventListener('input', function () {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
  });

  // ============ DRAG (desktop) ============
  var isDragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;

  function isDesktop() { return window.innerWidth >= 520; }

  head.addEventListener('mousedown', function (e) {
    if (!isDesktop()) return;
    if (e.target.closest('.ai-chat-close')) return;
    e.preventDefault();
    var r = panel.getBoundingClientRect();
    panel.style.left = r.left + 'px';
    panel.style.top = r.top + 'px';
    panel.style.transform = 'none';
    panel.classList.add('dragged', 'dragging');
    startX = e.clientX; startY = e.clientY;
    startLeft = r.left; startTop = r.top;
    isDragging = true;
  });
  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    var w = panel.offsetWidth, h = panel.offsetHeight;
    var nl = startLeft + (e.clientX - startX);
    var nt = startTop + (e.clientY - startY);
    nl = Math.max(4, Math.min(window.innerWidth - w - 4, nl));
    nt = Math.max(4, Math.min(window.innerHeight - h - 4, nt));
    panel.style.left = nl + 'px';
    panel.style.top = nt + 'px';
  });
  document.addEventListener('mouseup', function () {
    isDragging = false;
    panel.classList.remove('dragging');
  });

  function resetDrag() {
    panel.classList.remove('dragged', 'dragging');
    panel.style.left = '';
    panel.style.top = '';
    panel.style.transform = '';
  }

  // ============ LANGUAGE OBSERVER ============
  var observer = new MutationObserver(updateLang);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-current-lang'] });

  updateLang();
})();

(function () {
  if (window.__aiChatLoaded) return;
  window.__aiChatLoaded = true;

  var LOGO = 'assets/iconcs.png';
  var history = [];
  var heroShown = true;

  function getLang() {
    return document.documentElement.dataset.currentLang === 'en' ? 'en' : 'bm';
  }
  function t(bm, en) {
    return getLang() === 'en' ? en : bm;
  }
  function getGreeting() {
    var hour = new Date().getHours();
    var label = 'Morning';
    if (hour >= 12 && hour < 18) label = 'Afternoon';
    else if (hour >= 18) label = 'Evening';
    else if (hour < 5) label = 'Hello';
    if (getLang() === 'en') return label;
    if (hour >= 5 && hour < 12) return 'Selamat pagi';
    if (hour >= 12 && hour < 15) return 'Selamat tengah hari';
    if (hour >= 15 && hour < 19) return 'Selamat petang';
    return 'Selamat malam';
  }

  var suggestions = {
    bm: ['Berapa harga?', 'Nak order', 'Siap bila?', 'Ada contoh?'],
    en: ['Price?', 'Order', 'Delivery?', 'Samples?']
  };

  // Bubble
  var bubble = document.createElement('button');
  bubble.id = 'ai-chat-bubble';
  bubble.setAttribute('aria-label', 'Chat');
  bubble.innerHTML = '<img src="' + LOGO + '" alt="Chat">';

  // Panel
  var panel = document.createElement('div');
  panel.id = 'ai-chat-panel';
  panel.innerHTML = [
    '<div class="ai-chat-head">',
    '  <div class="ai-chat-head-info">',
    '    <div class="ai-chat-head-name">Alina</div>',
    '    <div class="ai-chat-head-sub" id="ai-head-sub">How can I help you today?</div>',
    '  </div>',
    '  <div class="ai-chat-head-actions">',
    '    <button class="ai-chat-head-btn" id="ai-refresh" aria-label="New chat" title="Mula chat baru">',
    '      <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"></path><polyline points="21 3 21 9 15 9"></polyline></svg>',
    '    </button>',
    '    <button class="ai-chat-head-btn" id="ai-close" aria-label="Close">',
    '      <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    '    </button>',
    '  </div>',
    '</div>',
    '<div class="ai-chat-body" id="ai-chat-body">',
    '  <div class="ai-chat-hero" id="ai-chat-hero">',
    '    <div class="ai-chat-hero-icon">',
    '      <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.8 5.9 1.9-5.9 1.9L12 18l-1.9-5.4L4.2 10.7l5.9-1.9z"></path><path d="M19 4v3"></path><path d="M20.5 5.5h-3"></path></svg>',
    '    </div>',
    '    <h2 class="ai-chat-greet" id="ai-greet">Morning, user.</h2>',
    '    <p class="ai-chat-sub" id="ai-sub">What are we working on today? Press send to start a new conversation.</p>',
    '    <div class="ai-suggestions" id="ai-suggestions"></div>',
    '  </div>',
    '  <div class="ai-chat-messages" id="ai-chat-messages"></div>',
    '</div>',
    '<div class="ai-chat-foot">',
    '  <div class="ai-chat-input-wrap">',
    '    <textarea class="ai-chat-input" id="ai-chat-input" rows="1" placeholder="Taip mesej..."></textarea>',
    '    <div class="ai-chat-input-actions">',
    '      <button class="ai-chat-plus" aria-label="Attach" type="button">',
    '        <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
    '      </button>',
    '      <button class="ai-chat-send" id="ai-chat-send" aria-label="Send">',
    '        <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>',
    '      </button>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join('');

  document.body.appendChild(bubble);
  document.body.appendChild(panel);

  var hero = panel.querySelector('#ai-chat-hero');
  var messagesEl = panel.querySelector('#ai-chat-messages');
  var input = panel.querySelector('#ai-chat-input');
  var sendBtn = panel.querySelector('#ai-chat-send');
  var suggestEl = panel.querySelector('#ai-suggestions');
  var greetEl = panel.querySelector('#ai-greet');
  var subEl = panel.querySelector('#ai-sub');
  var headSubEl = panel.querySelector('#ai-head-sub');
  var refreshBtn = panel.querySelector('#ai-refresh');

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

  function updateLang() {
    var greet = getGreeting();
    greetEl.textContent = getLang() === 'en'
      ? greet + ', user.'
      : greet + ', user.';
    subEl.textContent = t(
      'Apa yang kita nak buat hari ini? Tekan hantar untuk mula perbualan baru.',
      'What are we working on today? Press send to start a new conversation.'
    );
    headSubEl.textContent = t('Boleh saya bantu?', 'How can I help you today?');
    input.placeholder = t('Taip mesej...', 'Type a message...');
    renderSuggestions();
  }

  function addMsg(text, who) {
    var el = document.createElement('div');
    el.className = 'ai-msg ' + who;

    var clean = String(text)
      .replace(/https?:\/\/wa\.me\/[^\s]+/gi, '')
      .trim();

    clean = clean.replace(/(https?:\/\/(?!wa\.me)[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    el.innerHTML = clean;

    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  function showTyping() {
    var label = t('Alina sedang menaip', 'Alina is typing');
    var el = document.createElement('div');
    el.className = 'ai-typing';
    el.id = 'ai-typing';
    el.innerHTML = '<div class="ai-typing-dots"><span></span><span></span><span></span></div><div class="ai-typing-label">' + label + '</div>';
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

  function showHero() {
    heroShown = true;
    hero.classList.remove('hide');
  }

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

  bubble.addEventListener('click', function () {
    panel.classList.add('open');
    updateLang();
  });

  panel.querySelector('#ai-close').addEventListener('click', function () {
    panel.classList.remove('open');
  });

  refreshBtn.addEventListener('click', function () {
    refreshBtn.classList.add('spinning');
    setTimeout(function () { refreshBtn.classList.remove('spinning'); }, 600);

    messagesEl.innerHTML = '';
    history = [];
    showHero();
    updateLang();
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

  var observer = new MutationObserver(updateLang);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-current-lang'] });

  updateLang();
})();

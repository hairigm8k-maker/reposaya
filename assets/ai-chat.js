(function () {
  if (window.__aiChatLoaded) return;
  window.__aiChatLoaded = true;

  const WA_LINK = 'https://wa.me/60172131814';
  const LOGO = 'assets/iconcs.png';
  let history = [];
  let heroShown = true;

  function getLang() {
    return document.documentElement.dataset.currentLang === 'en' ? 'en' : 'bm';
  }
  function t(bm, en) { return getLang() === 'en' ? en : bm; }

  const suggestions = {
    bm: ['Berapa harga?', 'Cara nak order', 'Berapa hari siap?', 'Ada portfolio?'],
    en: ['How much?', 'How to order', 'Delivery time?', 'Portfolio?']
  };

  const bubble = document.createElement('button');
  bubble.id = 'ai-chat-bubble';
  bubble.setAttribute('aria-label', 'Chat');
  bubble.innerHTML = `<img src="assets/iconcs.png" alt="Chat" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;">`;

  const panel = document.createElement('div');
  panel.id = 'ai-chat-panel';
  panel.innerHTML = `
    <div class="ai-chat-head" id="ai-chat-head">
      <img src="${LOGO}" alt="Logo" class="ai-chat-head-logo">
      <div class="ai-chat-title">hairiamri.buzz</div>
      <button class="ai-chat-close" aria-label="Close">✕</button>
    </div>
    <div class="ai-chat-body" id="ai-chat-body">
      <div class="ai-chat-hero" id="ai-chat-hero">
        <div class="ai-orb"></div>
        <h2 class="ai-chat-greet" data-greet>Hi! 👋</h2>
        <p class="ai-chat-sub" data-sub>Bagaimana saya boleh bantu anda hari ini?</p>
        <div class="ai-suggestions" id="ai-suggestions"></div>
      </div>
      <div class="ai-chat-messages" id="ai-chat-messages"></div>
    </div>
    <div class="ai-chat-foot">
      <div class="ai-chat-input-wrap">
        <textarea class="ai-chat-input" id="ai-chat-input" rows="1" placeholder="Taip mesej..."></textarea>
        <button class="ai-chat-send" id="ai-chat-send" aria-label="Send">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
        </button>
      </div>
    </div>
    <a class="ai-chat-wa-link" href="${WA_LINK}" target="_blank">${t('Atau chat kami di WhatsApp →', 'Or chat us on WhatsApp →')}</a>
  `;

  document.body.appendChild(bubble);
  document.body.appendChild(panel);

  const head = panel.querySelector('#ai-chat-head');
  const hero = panel.querySelector('#ai-chat-hero');
  const messagesEl = panel.querySelector('#ai-chat-messages');
  const input = panel.querySelector('#ai-chat-input');
  const sendBtn = panel.querySelector('#ai-chat-send');
  const suggestEl = panel.querySelector('#ai-suggestions');
  const greetEl = panel.querySelector('[data-greet]');
  const subEl = panel.querySelector('[data-sub]');
  const waLink = panel.querySelector('.ai-chat-wa-link');

  // ===== SUGGESTIONS =====
  function renderSuggestions() {
    suggestEl.innerHTML = '';
    suggestions[getLang()].forEach(text => {
      const btn = document.createElement('button');
      btn.className = 'ai-suggestion';
      btn.textContent = text;
      btn.addEventListener('click', () => {
        input.value = text;
        send();
      });
      suggestEl.appendChild(btn);
    });
  }

  // ===== LANGUAGE =====
  function updateLang() {
    greetEl.textContent = t('Hi! 👋', 'Hi! 👋');
    subEl.textContent = t('Bagaimana saya boleh bantu anda hari ini?', 'How can I help you today?');
    input.placeholder = t('Taip mesej...', 'Type a message...');
    waLink.textContent = t('Atau chat kami di WhatsApp →', 'Or chat us on WhatsApp →');
    renderSuggestions();
  }

  // ===== MESSAGES =====
  function addMsg(text, who) {
    const el = document.createElement('div');
    el.className = 'ai-msg ' + who;
    el.innerHTML = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }
  function showTyping() {
    const el = document.createElement('div');
    el.className = 'ai-typing';
    el.id = 'ai-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function hideTyping() {
    const el = document.getElementById('ai-typing');
    if (el) el.remove();
  }

  function hideHero() {
    if (!heroShown) return;
    heroShown = false;
    hero.classList.add('hide');
  }

  async function send() {
    const msg = input.value.trim();
    if (!msg) return;
    hideHero();
    addMsg(msg, 'user');
    history.push({ role: 'user', content: msg });
    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;
    showTyping();
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: history.slice(0, -1), lang: getLang() })
      });
      const data = await res.json();
      hideTyping();
      addMsg(data.reply || t('Maaf, cuba lagi.', 'Sorry, try again.'), 'bot');
      history.push({ role: 'assistant', content: data.reply || '' });
    } catch (e) {
      hideTyping();
      addMsg(t(`Maaf, ada masalah. Sila WhatsApp: ${WA_LINK}`, `Sorry, there's an issue. Please WhatsApp: ${WA_LINK}`), 'bot');
    }
    sendBtn.disabled = false;
    input.focus();
  }

  // ===== DRAG (desktop only) =====
  let isDragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;

  function isDesktop() { return window.innerWidth >= 520; }

  head.addEventListener('mousedown', (e) => {
    if (!isDesktop()) return;
    if (e.target.closest('.ai-chat-close')) return;
    e.preventDefault();
    const r = panel.getBoundingClientRect();
    panel.style.left = r.left + 'px';
    panel.style.top = r.top + 'px';
    panel.style.transform = 'none';
    panel.classList.add('dragged', 'dragging');
    startX = e.clientX; startY = e.clientY;
    startLeft = r.left; startTop = r.top;
    isDragging = true;
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const w = panel.offsetWidth, h = panel.offsetHeight;
    let nl = startLeft + (e.clientX - startX);
    let nt = startTop + (e.clientY - startY);
    nl = Math.max(4, Math.min(window.innerWidth - w - 4, nl));
    nt = Math.max(4, Math.min(window.innerHeight - h - 4, nt));
    panel.style.left = nl + 'px';
    panel.style.top = nt + 'px';
  });
  document.addEventListener('mouseup', () => {
    isDragging = false;
    panel.classList.remove('dragging');
  });

  function resetDrag() {
    panel.classList.remove('dragged', 'dragging');
    panel.style.left = '';
    panel.style.top = '';
    panel.style.transform = '';
  }

  // ===== EVENTS =====
  bubble.addEventListener('click', () => {
    resetDrag();
    panel.classList.add('open');
    updateLang();
    setTimeout(() => {
      if (window.innerWidth >= 520) input.focus();
    }, 300);
  });

  panel.querySelector('.ai-chat-close').addEventListener('click', () => {
    panel.classList.remove('open');
    resetDrag();
  });

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
  });

  const observer = new MutationObserver(updateLang);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-current-lang'] });

  updateLang();
})();

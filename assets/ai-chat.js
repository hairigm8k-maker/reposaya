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
    bm: ['Berapa harga?', 'Nak order', 'Siap bila?', 'Ada contoh?'],
    en: ['How much?', 'Order', 'When done?', 'Samples?']
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
      <div class="ai-chat-title">Herry</div>
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
    greetEl.textContent = t('Ha? Apa kau nak?', 'What do you want?');
    subEl.textContent = t('Tanya cptla bodoh, aku busy.', 'Ask fast, I\'m busy.');
    input.placeholder = t('Taip cpt lansial...', 'Type fast...');
    waLink.textContent = t('Kalau malas taip, WhatsApp je →', 'Can\'t be bothered? WhatsApp →');
    renderSuggestions();
  }

  // ===== MESSAGES =====
  function addMsg(text, who) {
    const el = document.createElement('div');
    el.className = 'ai-msg ' + who;
    
    // Strip WhatsApp URLs dari reply
    let clean = text
      .replace(/https?:\/\/wa\.me\/[^\s]+/gi, '')
      .replace(/wa\.me\/[^\s]+/gi, '')
      .trim();
    
    // Replace other URLs jadi clickable
    clean = clean.replace(/(https?:\/\/(?!wa\.me)[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    
    // Detect WhatsApp mention untuk tunjuk button
    const mentionsWA = /whatsapp|tekan butang|klik butang|hubungi kami|order|tempah|pesan/i.test(clean);
    
    el.innerHTML = clean;
    
    if (who === 'bot') {
      const btn = document.createElement('a');
      btn.className = 'ai-inline-wa';
      btn.href = 'https://wa.me/60172131814';
      btn.target = '_blank';
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;flex-shrink:0;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg><span>Chat di WhatsApp</span>';
      el.appendChild(btn);
    }
    
    // Append ke container yang betul
    const container = document.getElementById('ai-chat-messages') || document.getElementById('ai-chat-body');
    if (container) {
      container.appendChild(el);
      container.scrollTop = container.scrollHeight;
    }
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
    // Tutup keyboard kat mobile bila hantar mesej
    if ('ontouchstart' in window) input.blur();
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
      // Auto-focus dibuang — elak keyboard naik sendiri kat mobile
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

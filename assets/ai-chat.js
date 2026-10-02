(function () {
  if (window.__aiChatLoaded) return;
  window.__aiChatLoaded = true;

  const WA_LINK = 'https://wa.me/60172131814';
  const LOGO = 'assets/logoUtama/logoUtama.png';
  let history = [];

  function getLang() {
    return document.documentElement.dataset.currentLang === 'en' ? 'en' : 'bm';
  }
  function t(bm, en) { return getLang() === 'en' ? en : bm; }

  const bubble = document.createElement('button');
  bubble.id = 'ai-chat-bubble';
  bubble.setAttribute('aria-label', 'Chat');
  bubble.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;

  const panel = document.createElement('div');
  panel.id = 'ai-chat-panel';
  panel.innerHTML = `
    <div class="ai-chat-head" id="ai-chat-head">
      <img src="${LOGO}" alt="Logo" class="ai-chat-head-logo">
      <div class="ai-chat-head-info">
        <span data-ai-title>CS Assistant</span>
        <small data-ai-sub>Biasanya reply dalam beberapa saat</small>
      </div>
      <button class="ai-chat-close" aria-label="Close">✕</button>
    </div>
    <div class="ai-chat-body" id="ai-chat-body"></div>
    <div class="ai-chat-foot">
      <textarea class="ai-chat-input" id="ai-chat-input" rows="1" placeholder="Taip mesej..."></textarea>
      <button class="ai-chat-send" id="ai-chat-send">→</button>
    </div>
    <a class="ai-chat-wa" href="${WA_LINK}" target="_blank" data-ai-wa>Chat dengan kami di WhatsApp →</a>
  `;

  document.body.appendChild(bubble);
  document.body.appendChild(panel);

  const head = panel.querySelector('#ai-chat-head');
  const body = panel.querySelector('#ai-chat-body');
  const input = panel.querySelector('#ai-chat-input');
  const sendBtn = panel.querySelector('#ai-chat-send');

  // ===== DRAG LOGIC =====
  let isDragging = false;
  let startX = 0, startY = 0;
  let startLeft = 0, startTop = 0;

  function getPanelPos() {
    const r = panel.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }

  function onDragStart(x, y) {
    const pos = getPanelPos();
    // Freeze position as pixel values
    panel.style.left = pos.left + 'px';
    panel.style.top = pos.top + 'px';
    panel.style.transform = 'none';
    panel.classList.add('dragged', 'dragging');

    startX = x;
    startY = y;
    startLeft = pos.left;
    startTop = pos.top;
    isDragging = true;
  }

  function onDragMove(x, y) {
    if (!isDragging) return;
    const dx = x - startX;
    const dy = y - startY;
    const w = panel.offsetWidth;
    const h = panel.offsetHeight;

    let newLeft = startLeft + dx;
    let newTop = startTop + dy;

    // Keep in viewport
    newLeft = Math.max(4, Math.min(window.innerWidth - w - 4, newLeft));
    newTop = Math.max(4, Math.min(window.innerHeight - h - 4, newTop));

    panel.style.left = newLeft + 'px';
    panel.style.top = newTop + 'px';
  }

  function onDragEnd() {
    isDragging = false;
    panel.classList.remove('dragging');
  }

  // Mouse
  head.addEventListener('mousedown', (e) => {
    if (e.target.closest('.ai-chat-close')) return;
    e.preventDefault();
    onDragStart(e.clientX, e.clientY);
  });
  document.addEventListener('mousemove', (e) => {
    if (isDragging) onDragMove(e.clientX, e.clientY);
  });
  document.addEventListener('mouseup', onDragEnd);

  // Touch
  head.addEventListener('touchstart', (e) => {
    if (e.target.closest('.ai-chat-close')) return;
    const t0 = e.touches[0];
    onDragStart(t0.clientX, t0.clientY);
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (isDragging) {
      const t0 = e.touches[0];
      onDragMove(t0.clientX, t0.clientY);
    }
  }, { passive: true });
  document.addEventListener('touchend', onDragEnd);

  // Reset position bila close
  function resetPosition() {
    panel.classList.remove('dragged');
    panel.style.left = '';
    panel.style.top = '';
    panel.style.transform = '';
  }

  // ===== END DRAG =====

  function updateLang() {
    panel.querySelector('[data-ai-sub]').textContent = t('Biasanya reply dalam beberapa saat', 'Usually replies in seconds');
    panel.querySelector('[data-ai-wa]').textContent = t('Chat dengan kami di WhatsApp →', 'Chat with us on WhatsApp →');
    input.placeholder = t('Taip mesej...', 'Type a message...');
  }

  function addMsg(text, who) {
    const el = document.createElement('div');
    el.className = 'ai-msg ' + who;
    el.innerHTML = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }
  function showTyping() {
    const el = document.createElement('div');
    el.className = 'ai-typing';
    el.id = 'ai-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }
  function hideTyping() {
    const el = document.getElementById('ai-typing');
    if (el) el.remove();
  }

  async function send() {
    const msg = input.value.trim();
    if (!msg) return;
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

  bubble.addEventListener('click', () => {
    resetPosition();
    panel.classList.add('open');
    updateLang();
    setTimeout(() => input.focus(), 250);
    if (body.children.length === 0) {
      addMsg(t(
        `Hi! 👋 Saya AI assistant untuk hairiamri.buzz. Tanya apa-apa tentang servis landing page RM99 kami.`,
        `Hi! 👋 I'm the AI assistant for hairiamri.buzz. Ask me anything about our RM99 landing page service.`
      ), 'bot');
    }
  });
  panel.querySelector('.ai-chat-close').addEventListener('click', () => {
    panel.classList.remove('open');
    resetPosition();
  });
  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 80) + 'px';
  });

  const observer = new MutationObserver(updateLang);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-current-lang'] });
  updateLang();
})();

// HairiHosting — Common utilities

window.HHT = {
  // Toast notification
  toast(message, type = 'info', duration = 4000) {
    const wrap = document.getElementById('toastWrap');
    if (!wrap) return;

    const el = document.createElement('div');
    el.className = 'hh-toast ' + type;
    el.textContent = message;
    wrap.appendChild(el);

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(20px)';
      el.style.transition = 'all 0.2s ease';
      setTimeout(() => el.remove(), 200);
    }, duration);
  },

  // Format date
  formatDate(date) {
    return new Date(date).toLocaleString('ms-MY', {
      timeZone: 'Asia/Kuala_Lumpur',
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  },

  // Escape HTML
  esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  // Format bytes
  formatBytes(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};


// ============================================================
// COOKIE CONSENT BANNER
// ============================================================
(function initCookieBanner() {
  if (localStorage.getItem('hh_cookie_consent') === 'accepted') return;

  function show() {
    if (document.getElementById('hhCookieBanner')) return;

    // Inject CSS
    var css = document.createElement('style');
    css.textContent =
      '#hhCookieBanner{position:fixed;bottom:0;left:0;right:0;z-index:99999;padding:0 16px calc(16px + env(safe-area-inset-bottom));pointer-events:none;animation:hhCkIn .3s ease}' +
      '@keyframes hhCkIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}' +
      '#hhCookieBanner.hh-ck-out{opacity:0;transform:translateY(20px);transition:all .25s}' +
      '.hh-ck-content{pointer-events:auto;max-width:520px;margin:0 auto;background:#121317;border:1px solid #1c1d22;border-radius:14px;padding:16px;display:flex;gap:14px;align-items:flex-start;box-shadow:0 12px 40px rgba(0,0,0,0.5);font-family:-apple-system,BlinkMacSystemFont,Inter,system-ui,sans-serif}' +
      '.hh-ck-icon{flex-shrink:0;width:36px;height:36px;border-radius:10px;background:rgba(204,145,102,0.12);display:flex;align-items:center;justify-content:center}' +
      '.hh-ck-icon svg{width:18px;height:18px;stroke:#cc9166;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
      '.hh-ck-body{flex:1;min-width:0}' +
      '.hh-ck-title{font-size:13px;font-weight:600;color:#ffffff;margin:0 0 4px;line-height:1.3}' +
      '.hh-ck-desc{font-size:12px;color:#9194a1;margin:0;line-height:1.5}' +
      '.hh-ck-actions{display:flex;gap:8px;margin-top:14px;align-items:center}' +
      '.hh-ck-accept{background:#cc9166;color:#08080a;border:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:transform .1s}' +
      '.hh-ck-accept:active{transform:scale(0.97)}' +
      '.hh-ck-link{background:transparent;color:#9194a1;font-size:12px;text-decoration:none;padding:10px 8px;font-family:inherit}' +
      '.hh-ck-link:hover{color:#cc9166}' +
      '@media(max-width:600px){.hh-ck-content{flex-direction:column;gap:10px}.hh-ck-actions{width:100%}.hh-ck-accept{flex:1}}';
    document.head.appendChild(css);

    // Inject HTML
    var banner = document.createElement('div');
    banner.id = 'hhCookieBanner';
    banner.innerHTML =
      '<div class="hh-ck-content">' +
        '<div class="hh-ck-icon">' +
          '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="9" cy="10" r="1" fill="#cc9166"/><circle cx="15" cy="9" r="1" fill="#cc9166"/><circle cx="14" cy="15" r="1" fill="#cc9166"/><circle cx="9" cy="15" r="1" fill="#cc9166"/></svg>' +
        '</div>' +
        '<div class="hh-ck-body">' +
          '<div class="hh-ck-title">We use cookies</div>' +
          '<p class="hh-ck-desc">HairiHosting uses cookies to keep you signed in and improve your experience. By continuing, you agree to our use of cookies.</p>' +
          '<div class="hh-ck-actions">' +
            '<button class="hh-ck-accept" id="hhCkAccept">Accept</button>' +
            '<a class="hh-ck-link" href="/privacy.html" target="_blank" rel="noopener">Learn more</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);

    document.getElementById('hhCkAccept').onclick = function() {
      localStorage.setItem('hh_cookie_consent', 'accepted');
      banner.classList.add('hh-ck-out');
      setTimeout(function(){ banner.remove(); }, 300);
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(show, 1500); });
  } else {
    setTimeout(show, 1500);
  }
})();

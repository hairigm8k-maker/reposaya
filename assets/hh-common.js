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
  if (localStorage.getItem('hh_cookie_consent') === 'accepted' || localStorage.getItem('hh_cookie_consent') === 'rejected') return;

  function show() {
    if (document.getElementById('hhCookieBanner')) return;

    // Inject CSS
    var css = document.createElement('style');
    css.textContent =
      '#hhCookieBanner{position:fixed;bottom:0;left:0;right:0;z-index:99999;padding:0 16px calc(16px + env(safe-area-inset-bottom));pointer-events:none;animation:hhCkIn .3s ease}' +
      '@keyframes hhCkIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}' +
      '#hhCookieBanner.hh-ck-out{opacity:0;transform:translateY(20px);transition:all .25s}' +
      '.hh-ck-content{pointer-events:auto;max-width:560px;margin:0 auto;background:#121317;border:1px solid #1c1d22;border-radius:14px;padding:18px;box-shadow:0 12px 40px rgba(0,0,0,0.5);font-family:-apple-system,BlinkMacSystemFont,Inter,system-ui,sans-serif}' +
      '.hh-ck-head{display:flex;gap:12px;align-items:flex-start;margin-bottom:14px}' +
      '.hh-ck-icon{flex-shrink:0;width:36px;height:36px;border-radius:10px;background:rgba(204,145,102,0.12);display:flex;align-items:center;justify-content:center}' +
      '.hh-ck-icon svg{width:18px;height:18px;stroke:#cc9166;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
      '.hh-ck-body{flex:1;min-width:0}' +
      '.hh-ck-title{font-size:13.5px;font-weight:600;color:#ffffff;margin:0 0 4px;line-height:1.3}' +
      '.hh-ck-desc{font-size:12.5px;color:#9194a1;margin:0;line-height:1.5}' +
      '.hh-ck-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}' +
      '.hh-ck-btn{display:flex;align-items:center;justify-content:center;padding:11px 14px;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .12s;text-decoration:none;border:1px solid transparent;white-space:nowrap}' +
      '.hh-ck-btn:active{transform:scale(0.97)}' +
      '.hh-ck-accept{grid-column:1/-1;background:#cc9166;color:#08080a;font-size:13.5px;padding:12px 14px}' +
      '.hh-ck-accept:hover{background:#d9a377}' +
      '.hh-ck-reject{background:transparent;color:#9194a1;border-color:#1c1d22}' +
      '.hh-ck-reject:hover{color:#e2e3e9;border-color:#3a3b42}' +
      '.hh-ck-learn{background:transparent;color:#cc9166;border-color:rgba(204,145,102,0.3);text-align:center}' +
      '.hh-ck-learn:hover{background:rgba(204,145,102,0.08);border-color:#cc9166}' +
      '@media(min-width:520px){.hh-ck-actions{grid-template-columns:1fr 1fr 1fr}.hh-ck-accept{grid-column:auto;order:2}.hh-ck-learn{order:1}.hh-ck-reject{order:3}}';
    document.head.appendChild(css);

    // Inject HTML
    var banner = document.createElement('div');
    banner.id = 'hhCookieBanner';
    banner.innerHTML =
      '<div class="hh-ck-content">' +
        '<div class="hh-ck-head">' +
          '<div class="hh-ck-icon">' +
            '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="9" cy="10" r="1" fill="#cc9166"/><circle cx="15" cy="9" r="1" fill="#cc9166"/><circle cx="14" cy="15" r="1" fill="#cc9166"/><circle cx="9" cy="15" r="1" fill="#cc9166"/></svg>' +
          '</div>' +
          '<div class="hh-ck-body">' +
            '<div class="hh-ck-title">We use cookies</div>' +
            '<p class="hh-ck-desc">HairiHosting uses cookies to keep you signed in and improve your experience.</p>' +
          '</div>' +
        '</div>' +
        '<div class="hh-ck-actions">' +
          '<button class="hh-ck-btn hh-ck-learn" id="hhCkLearn">Learn more</button>' +
          '<button class="hh-ck-btn hh-ck-accept" id="hhCkAccept">Accept all</button>' +
          '<button class="hh-ck-btn hh-ck-reject" id="hhCkReject">Reject all</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);

    function dismiss(choice) {
      localStorage.setItem('hh_cookie_consent', choice);
      banner.classList.add('hh-ck-out');
      setTimeout(function(){ banner.remove(); }, 300);
    }

    document.getElementById('hhCkAccept').onclick = function(){ dismiss('accepted'); };
    document.getElementById('hhCkReject').onclick = function(){ dismiss('rejected'); };
    document.getElementById('hhCkLearn').onclick = function(){ window.location.href = '/privacy.html'; };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(show, 1500); });
  } else {
    setTimeout(show, 1500);
  }
})();

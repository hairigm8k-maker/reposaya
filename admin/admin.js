// ============================================
// HAIRIAMRI ADMIN — Shared Layout (Classic Script)
// ============================================

window.ADMIN_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid', href: 'dashboard.html' },
  { id: 'articles', label: 'Artikel', icon: 'file-text', href: 'articles.html' },
  { id: 'sections', label: 'Sections', icon: 'layout', href: 'sections.html' },
  { id: 'feedback', label: 'Feedback', icon: 'message-circle', href: 'feedback.html' },
  { id: 'media', label: 'Media', icon: 'image', href: 'media.html' },
  { id: 'users', label: 'Pengguna', icon: 'users', href: 'users.html' },
  { id: 'analytics', label: 'Analytics', icon: 'bar-chart', href: 'analytics.html' },
  { id: 'settings', label: 'Settings', icon: 'settings', href: 'settings.html' },
];

window.ADMIN_ICONS = {
  'grid': '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  'layout': '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
  'message-circle': '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  'image': '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  'users': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 0 0 7.75"/>',
  'bar-chart': '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
  'settings': '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  'external': '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
};

window.adminIcon = function(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${window.ADMIN_ICONS[name] || ''}</svg>`;
};

window.renderAdminLayout = function(activePage, pageTitle) {
  const navHTML = window.ADMIN_NAV.map(item => `
    <a href="${item.href}" class="admin-nav-item ${item.id === activePage ? 'active' : ''}">
      ${window.adminIcon(item.icon)}
      <span>${item.label}</span>
    </a>
  `).join('');

  const bottomNavHTML = window.ADMIN_NAV.slice(0, 5).map(item => `
    <a href="${item.href}" class="admin-bottom-item ${item.id === activePage ? 'active' : ''}">
      ${window.adminIcon(item.icon)}
      <span>${item.label}</span>
    </a>
  `).join('');

  return `
    <aside class="admin-sidebar" id="adminSidebar">
      <div class="admin-sidebar-head">
        <img src="/assets/logoUtama/logoUtama.png" alt="hairiamri.buzz" class="admin-logo">
        <span class="admin-badge">ADMIN</span>
      </div>
      <nav class="admin-nav">${navHTML}</nav>
      <div class="admin-sidebar-foot">
        <div class="admin-user">
          <div class="admin-user-avatar" id="adminAvatar">A</div>
          <div class="admin-user-info">
            <div class="admin-user-name" id="adminUserName">—</div>
            <div class="admin-user-email" id="adminUserEmail">—</div>
          </div>
        </div>
        <button id="adminLogoutBtn" class="admin-logout-btn">
          ${window.adminIcon('log-out')}
          <span>Log Keluar</span>
        </button>
      </div>
    </aside>

    <header class="admin-topbar">
      <button class="admin-menu-toggle" id="adminMenuToggle">
        ${window.adminIcon('grid')}
      </button>
      <h1 class="admin-page-title">${pageTitle || 'Admin'}</h1>
      <div class="admin-topbar-actions">
        <a href="/index.html" target="_blank" class="admin-topbar-link">
          ${window.adminIcon('external')}
          <span>Lihat Website</span>
        </a>
      </div>
    </header>

    <nav class="admin-bottomnav">
      ${bottomNavHTML}
    </nav>
  `;
};

window.adminSetup = function(user, signOutFn) {
  const uName = document.getElementById('adminUserName');
  const uEmail = document.getElementById('adminUserEmail');
  const uAvatar = document.getElementById('adminAvatar');
  const logoutBtn = document.getElementById('adminLogoutBtn');
  const menuToggle = document.getElementById('adminMenuToggle');
  const overlay = document.getElementById('adminOverlay');

  if (uName) uName.textContent = user.displayName || 'Admin';
  if (uEmail) uEmail.textContent = user.email || '—';
  if (uAvatar) uAvatar.textContent = ((user.displayName || 'A').charAt(0) || 'A').toUpperCase();
  if (logoutBtn && signOutFn) logoutBtn.onclick = signOutFn;
  if (menuToggle) menuToggle.onclick = () => {
    document.getElementById('adminSidebar').classList.toggle('open');
    if (overlay) overlay.classList.toggle('show');
  };
  if (overlay) overlay.onclick = () => {
    document.getElementById('adminSidebar').classList.remove('open');
    overlay.classList.remove('show');
  };
};

window.adminToast = function(msg, type) {
  let t = document.getElementById('adminToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'adminToast';
    t.className = 'admin-toast';
    document.body.appendChild(t);
  }
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  t.innerHTML = `<span class="admin-toast-icon">${icons[type]||'✓'}</span><span>${msg}</span>`;
  t.className = `admin-toast admin-toast-${type||'info'} show`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3500);
};

window.timeAgo = function(timestamp) {
  if (!timestamp) return '—';
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru je';
  if (mins < 60) return `${mins} minit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} bulan lalu`;
  return `${Math.floor(months / 12)} tahun lalu`;
};

console.log('[ADMIN] admin.js loaded');

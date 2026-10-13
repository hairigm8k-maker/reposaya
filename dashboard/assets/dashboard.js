// ═══════════════════════════════════════════
// HAIRIHOSTING — Dashboard Core
// ═══════════════════════════════════════════

(function() {
  'use strict';

  // ═══ AUTH CHECK ═══
  const userRaw = localStorage.getItem('hh_user');
  if (!userRaw) {
    window.location.href = '/';
    return;
  }

  const user = JSON.parse(userRaw);
  window.HH_USER = user;

  // ═══ SIDEBAR MENU (30 FUNCTIONS) ═══
  const MENU = [
    {
      title: 'Overview',
      items: [
        { id: 'home',        label: 'Dashboard',       icon: 'home' },
        { id: 'activity',    label: 'Aktiviti',        icon: 'activity' },
        { id: 'notifications', label: 'Notifikasi',    icon: 'bell', badge: '3' },
        { id: 'status',      label: 'System Status',   icon: 'pulse' }
      ]
    },
    {
      title: 'Sites',
      items: [
        { id: 'sites',       label: 'My Sites',        icon: 'globe' },
        { id: 'sites-new',   label: 'Buat Site Baru',  icon: 'plus' },
        { id: 'templates',   label: 'Templates',       icon: 'grid' },
        { id: 'archived',    label: 'Archived',        icon: 'archive' }
      ]
    },
    {
      title: 'Editor',
      items: [
        { id: 'editor-html', label: 'HTML Editor',     icon: 'code' },
        { id: 'editor-css',  label: 'CSS Editor',      icon: 'palette' },
        { id: 'editor-js',   label: 'JS Editor',       icon: 'braces' },
        { id: 'assets',      label: 'Asset Upload',    icon: 'upload' },
        { id: 'preview',     label: 'Live Preview',    icon: 'eye' }
      ]
    },
    {
      title: 'Files',
      items: [
        { id: 'files',       label: 'File Browser',    icon: 'folder' },
        { id: 'zip-import',  label: 'Import ZIP',      icon: 'file-plus' },
        { id: 'zip-export',  label: 'Export ZIP',      icon: 'download' }
      ]
    },
    {
      title: 'Publishing',
      items: [
        { id: 'publish',     label: 'Publish',         icon: 'rocket' },
        { id: 'deployments', label: 'Deployments',     icon: 'layers' },
        { id: 'subdomains',  label: 'Subdomains',      icon: 'link' },
        { id: 'domains',     label: 'Custom Domains',  icon: 'external' }
      ]
    },
    {
      title: 'Analytics',
      items: [
        { id: 'stats',       label: 'Visitor Stats',   icon: 'chart' },
        { id: 'traffic',     label: 'Traffic Sources', icon: 'compass' },
        { id: 'devices',     label: 'Devices',         icon: 'device' }
      ]
    },
    {
      title: 'Account',
      items: [
        { id: 'billing',     label: 'Billing & Plan',  icon: 'card' },
        { id: 'profile',     label: 'Profil',          icon: 'user' },
        { id: 'security',    label: 'Keselamatan',     icon: 'shield' },
        { id: 'support',     label: 'Support',         icon: 'help' }
      ]
    }
  ];

  // ═══ ICONS ═══
  const ICONS = {
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    pulse: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    archive: '<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    palette: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
    braces: '<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
    'file-plus': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    device: '<rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
    card: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
  };

  function svg(name) {
    const path = ICONS[name] || ICONS.home;
    return `<svg class="sb-icon" viewBox="0 0 24 24">${path}</svg>`;
  }

  // ═══ RENDER SIDEBAR ═══
  function renderSidebar() {
    const nav = document.getElementById('sbNav');
    if (!nav) return;

    const hash = window.location.hash.replace('#/', '') || 'home';

    let html = '';
    MENU.forEach(section => {
      html += `<div class="sb-section">`;
      html += `<div class="sb-section-title">${section.title}</div>`;
      section.items.forEach(item => {
        const active = item.id === hash ? 'active' : '';
        const badge = item.badge ? `<span class="sb-badge">${item.badge}</span>` : '';
        html += `<a class="sb-item ${active}" href="#/${item.id}" data-id="${item.id}">
          ${svg(item.icon)}
          <span class="sb-label">${item.label}</span>
          ${badge}
        </a>`;
      });
      html += `</div>`;
    });

    nav.innerHTML = html;
  }

  // ═══ ROUTER ═══
  function route() {
    const hash = window.location.hash.replace('#/', '') || 'home';
    renderSidebar();
    loadModule(hash);
    closeSidebar();
  }

  function loadModule(id) {
    const content = document.getElementById('content');
    if (!content) return;

    content.innerHTML = `<div class="loading-state"><div class="hh-spinner"></div></div>`;

    // Simulate loading
    setTimeout(() => {
      content.innerHTML = renderModule(id);
    }, 200);
  }

  function renderModule(id) {
    switch(id) {
      case 'home': return moduleHome();
      case 'sites': return moduleSites();
      case 'sites-new': return moduleSitesNew();
      default: return modulePlaceholder(id);
    }
  }

  // ═══ MODULES ═══

  function moduleHome() {
    return `
      <div class="page-head">
        <div class="page-eyebrow">Overview</div>
        <h1 class="page-title">Selamat kembali, ${HHT.esc(user.name || 'User')}</h1>
        <p class="page-sub">Ni ringkasan akaun anda hari ini</p>
      </div>

      <div class="grid grid-4" style="margin-bottom: 32px;">
        <div class="card">
          <div class="card-title">Total Sites</div>
          <div class="card-value">0</div>
          <div class="card-meta">Belum ada site</div>
        </div>
        <div class="card">
          <div class="card-title">Visitors</div>
          <div class="card-value">0</div>
          <div class="card-meta">7 hari lepas</div>
        </div>
        <div class="card">
          <div class="card-title">Storage</div>
          <div class="card-value">0 B</div>
          <div class="card-meta">Dari 100 MB</div>
        </div>
        <div class="card">
          <div class="card-title">Plan</div>
          <div class="card-value" style="font-size: 28px;">Free</div>
          <div class="card-meta">3 site max</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title" style="font-size: 16px; color: var(--hh-white); margin-bottom: 20px;">
          Aktiviti Terkini
        </div>
        <div style="text-align: center; padding: 40px 20px; color: var(--hh-ash); font-size: 14px;">
          Belum ada aktiviti
        </div>
      </div>
    `;
  }

  function moduleSites() {
    return `
      <div class="page-head" style="display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <div class="page-eyebrow">Sites</div>
          <h1 class="page-title">My Sites</h1>
          <p class="page-sub">Senarai semua website anda</p>
        </div>
        <button class="hh-btn hh-btn-primary" style="width: auto; padding: 10px 20px;" onclick="window.location.hash='#/sites-new'">
          + Buat Site Baru
        </button>
      </div>

      <div class="card" style="text-align: center; padding: 60px 40px;">
        <div style="font-family: var(--hh-serif); font-size: 28px; color: var(--hh-white); margin-bottom: 12px;">
          Belum ada website
        </div>
        <p style="color: var(--hh-fog); font-size: 15px; margin-bottom: 24px; max-width: 400px; margin-left: auto; margin-right: auto;">
          Mula dengan buat website pertama anda. Ambil masa 2 minit je.
        </p>
        <button class="hh-btn hh-btn-primary" style="width: auto; padding: 12px 28px;" onclick="window.location.hash='#/sites-new'">
          + Buat Website Baru
        </button>
      </div>
    `;
  }

  function moduleSitesNew() {
    return `
      <div class="page-head">
        <div class="page-eyebrow">Sites</div>
        <h1 class="page-title">Buat Site Baru</h1>
        <p class="page-sub">Isi maklumat website anda</p>
      </div>

      <div class="card" style="max-width: 520px;">
        <div class="hh-field">
          <label class="hh-label">Nama Website</label>
          <input type="text" class="hh-input" id="siteName" placeholder="Contoh: mybiz">
          <div class="card-meta" style="margin-top: 8px;">Subdomain: <strong style="color: var(--hh-copper);" id="siteSubPreview">mybiz</strong>.hairiamri.buzz</div>
        </div>

        <div class="hh-field">
          <label class="hh-label">Deskripsi (optional)</label>
          <input type="text" class="hh-input" id="siteDesc" placeholder="Contoh: Website bisnes saya">
        </div>

        <button class="hh-btn hh-btn-primary" id="createSiteBtn" style="margin-top: 12px;">
          Buat Site
        </button>
      </div>
    `;
  }

  function modulePlaceholder(id) {
    const label = id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `
      <div class="page-head">
        <div class="page-eyebrow">Coming Soon</div>
        <h1 class="page-title">${HHT.esc(label)}</h1>
        <p class="page-sub">Module ni akan datang dalam fasa seterusnya</p>
      </div>

      <div class="card" style="text-align: center; padding: 60px 40px;">
        <div style="font-size: 40px; margin-bottom: 16px;">🚧</div>
        <div style="font-family: var(--hh-serif); font-size: 24px; color: var(--hh-white); margin-bottom: 8px;">
          Belum siap
        </div>
        <p style="color: var(--hh-fog); font-size: 14px;">
          Function <code style="background: var(--hh-carbon); padding: 2px 8px; border-radius: 4px; font-family: var(--hh-mono); font-size: 13px; color: var(--hh-copper);">${id}</code> akan dibina kemudian.
        </p>
      </div>
    `;
  }

  // ═══ SIDEBAR TOGGLE ═══
  function openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('overlay').classList.add('show');
  }

  function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('show');
  }

  // ═══ INIT ═══
  document.addEventListener('DOMContentLoaded', () => {
    // Set user initial
    document.getElementById('userInitial').textContent =
      (user.name || user.email).charAt(0).toUpperCase();

    // Event listeners
    document.getElementById('tbMenu').addEventListener('click', openSidebar);
    document.getElementById('sbClose').addEventListener('click', closeSidebar);
    document.getElementById('overlay').addEventListener('click', closeSidebar);

    // User menu
    document.getElementById('tbUser').addEventListener('click', () => {
      if (confirm('Log keluar?')) {
        localStorage.removeItem('hh_user');
        window.location.href = '/';
      }
    });

    // Router
    window.addEventListener('hashchange', route);
    route();
  });

  // ═══ PUBLIC API ═══
  window.HHD = {
    quickCreate: () => { window.location.hash = '#/sites-new'; }
  };

})();

function toast(msg, type) {
  type = type || 'info';
  var w = document.getElementById('toastWrap');
  var e = document.createElement('div');
  e.className = 'toast ' + type;
  e.textContent = msg;
  w.appendChild(e);
  setTimeout(function(){ e.style.opacity = '0'; e.style.transition = 'opacity .2s'; setTimeout(function(){ e.remove(); }, 200); }, 4000);
}
function escHtml(s) {
  return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function fmtBytes(b) {
  if (!b) return '0 B';
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  if (b < 1073741824) return (b / 1048576).toFixed(2) + ' MB';
  return (b / 1073741824).toFixed(2) + ' GB';
}
function timeAgo(s) {
  if (!s) return '-';
  try {
    var t = new Date(String(s).replace(' ', 'T') + 'Z').getTime();
    var d = Date.now() - t;
    if (d < 60000) return 'Just now';
    var m = Math.floor(d / 60000);
    if (m < 60) return m + 'm ago';
    var h = Math.floor(m / 60);
    if (h < 24) return h + 'h ago';
    var dd = Math.floor(h / 24);
    if (dd < 30) return dd + 'd ago';
    return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) { return s; }
}

var MENU = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'sites', label: 'Sites' },
  { id: 'tokens', label: 'Login Tokens' },
  { id: 'notify', label: 'Broadcast' },
  { id: 'logs', label: 'Audit Log' }
];

var AdminUI = {
  user: null,
  renderSidebar: function(current) {
    var nav = document.getElementById('sbNav');
    nav.innerHTML = MENU.map(function(m) {
      return '<div class="sb-link' + (m.id === current ? ' active' : '') + '" onclick="AdminUI.go(\'' + m.id + '\')">' +
        '<span>' + m.label + '</span></div>';
    }).join('');
  },
  go: function(id) { window.location.hash = '#/' + id; },
  goDashboard: function() { window.location.href = '/dashboard/'; },
  route: async function() {
    var hash = window.location.hash.replace('#/', '') || 'overview';
    this.renderSidebar(hash);
    var c = document.getElementById('content');
    c.innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
    try {
      if (hash === 'overview') return await this.pageOverview();
      if (hash === 'users' && this.pageUsers) return await this.pageUsers();
      if (hash === 'sites' && this.pageSites) return await this.pageSites();
      if (hash === 'tokens' && this.pageTokens) return await this.pageTokens();
      if (hash === 'notify' && this.pageNotify) return await this.pageNotify();
      if (hash === 'logs' && this.pageLogs) return await this.pageLogs();
      return await this.pageOverview();
    } catch (e) {
      c.innerHTML = '<div class="card" style="text-align:center;padding:40px;color:#f87171">Error: ' + escHtml(e.message) + '</div>';
    }
  },
  init: async function() {
    try {
      var r = await fetch('/api/auth/session');
      var d = await r.json();
      if (!d.ok || !d.authenticated) { window.location.href = '/'; return; }
      if (d.user.role !== 'admin' && d.user.role !== 'superadmin') { window.location.href = '/dashboard/'; return; }
      this.user = d.user;
      document.getElementById('tbLogout').onclick = function() {
        if (confirm('Log out?')) fetch('/api/auth/logout', { method: 'POST' }).finally(function(){ window.location.href = '/'; });
      };
      window.addEventListener('hashchange', function(){ AdminUI.route(); });
      this.route();
    } catch (e) { window.location.href = '/'; }
  },
  pageOverview: async function() {
    var c = document.getElementById('content');
    var r = await fetch('/api/admin/stats');
    var d = await r.json();
    if (!d.ok) throw new Error(d.error);
    var s = d.stats;
    c.innerHTML =
      '<div class="eyebrow">Admin</div>' +
      '<h1 class="page-title">Overview</h1>' +
      '<p class="page-sub">Global stats across HairiHosting</p>' +
      '<div class="grid-4">' +
        '<div class="card"><div class="card-title">Users</div><div class="card-value">' + s.users + '</div><div class="card-meta">' + s.active_users + ' active</div></div>' +
        '<div class="card"><div class="card-title">Sites</div><div class="card-value">' + s.sites + '</div><div class="card-meta">' + s.live_sites + ' live</div></div>' +
        '<div class="card"><div class="card-title">Files</div><div class="card-value">' + s.files + '</div><div class="card-meta">' + fmtBytes(s.storage_bytes) + '</div></div>' +
        '<div class="card"><div class="card-title">Visitors</div><div class="card-value">' + s.visitors + '</div><div class="card-meta">All time</div></div>' +
      '</div>' +
      '<div class="grid-4">' +
        '<div class="card"><div class="card-title">Active Tokens</div><div class="card-value">' + s.active_tokens + '</div><div class="card-meta">Unused, not expired</div></div>' +
      '</div>' +
      '<div class="grid-2" style="margin-top:20px">' +
        '<div class="card"><div class="card-title">Recent Users</div>' +
          (d.recent_users.length ? '<table><tbody>' + d.recent_users.map(function(u){ return '<tr><td><div style="font-size:13px;color:var(--white)">' + escHtml(u.name || '-') + '</div><div style="font-size:11px;color:var(--fog);font-family:var(--mono)">' + escHtml(u.email) + '</div></td><td style="text-align:right;font-size:11px;color:var(--ash)">' + timeAgo(u.created_at) + '</td></tr>'; }).join('') + '</tbody></table>' : '<p style="color:var(--ash);font-size:13px;padding:20px 0;text-align:center">No users yet</p>') +
        '</div>' +
        '<div class="card"><div class="card-title">Recent Sites</div>' +
          (d.recent_sites.length ? '<table><tbody>' + d.recent_sites.map(function(s2){ return '<tr><td><div style="font-size:13px;color:var(--white)">' + escHtml(s2.name) + '</div><div style="font-size:11px;color:var(--fog);font-family:var(--mono)">' + escHtml(s2.subdomain) + '</div></td><td style="text-align:right"><span class="badge badge-' + (s2.status === 'live' ? 'live' : 'draft') + '">' + s2.status + '</span></td></tr>'; }).join('') + '</tbody></table>' : '<p style="color:var(--ash);font-size:13px;padding:20px 0;text-align:center">No sites yet</p>') +
        '</div>' +
      '</div>';
  }
};
window.AdminUI = AdminUI;
document.addEventListener('DOMContentLoaded', function(){ AdminUI.init(); });

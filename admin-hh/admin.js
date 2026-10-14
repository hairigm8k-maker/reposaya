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

var AdminUI = {
  user: null,
  init: async function() {
    try {
      var r = await fetch('/api/auth/session');
      var d = await r.json();
      if (!d.ok || !d.authenticated) {
        window.location.href = '/';
        return;
      }
      if (d.user.role !== 'admin' && d.user.role !== 'superadmin') {
        document.getElementById('content').innerHTML =
          '<div style="text-align:center;padding:80px 20px">' +
          '<h2 style="font-size:22px;color:#1a2456;margin-bottom:12px">Access Denied</h2>' +
          '<p style="color:#6b7280;margin-bottom:20px">You do not have permission to view this page.</p>' +
          '<a href="/dashboard/" style="display:inline-block;background:#2d5bff;color:#fff;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:600">Go to Dashboard</a>' +
          '</div>';
        return;
      }
      this.user = d.user;
      window.addEventListener('hashchange', function(){ AdminUI.route(); });
      this.route();
    } catch (e) {
      document.getElementById('content').innerHTML = '<div style="text-align:center;padding:60px;color:#ff5757">Error: ' + escHtml(e.message) + '</div>';
    }
  },
  go: function(id) { window.location.hash = '#/' + id; },
  route: async function() {
    var hash = window.location.hash.replace('#/', '') || 'overview';
    document.querySelectorAll('.sb-link').forEach(function(el, i){
      var labels = ['overview','users','sites','tokens','notify','logs','dashboard','logout'];
      el.classList.toggle('active', labels[i] === hash);
    });
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
      c.innerHTML = '<div class="card" style="text-align:center;padding:40px;color:#ff5757">Error: ' + escHtml(e.message) + '</div>';
    }
  }
};
window.AdminUI = AdminUI;
AdminUI.pageOverview = async function() {
  var c = document.getElementById('content');
  var r = await fetch('/api/admin/stats');
  var d = await r.json();
  if (!d.ok) throw new Error(d.error);
  var s = d.stats;

  c.innerHTML =
    '<div class="page-head"><h1>Dashboard</h1><p>Welcome back, ' + escHtml(AdminUI.user.name || 'Admin') + '</p></div>' +
    '<div class="hero"><h2>What are you looking for?</h2><p>Overview of everything happening on HairiHosting</p></div>' +
    '<div class="icon-grid">' +
      '<div class="icon-card" onclick="AdminUI.go(\'users\')"><div class="ico"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></div><div class="label">Users</div><div class="sub">' + s.users + ' total</div></div>' +
      '<div class="icon-card" onclick="AdminUI.go(\'sites\')"><div class="ico"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg></div><div class="label">Sites</div><div class="sub">' + s.sites + ' total</div></div>' +
      '<div class="icon-card" onclick="AdminUI.go(\'tokens\')"><div class="ico"><svg viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg></div><div class="label">Tokens</div><div class="sub">' + s.active_tokens + ' active</div></div>' +
      '<div class="icon-card" onclick="AdminUI.go(\'notify\')"><div class="ico"><svg viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 010 7.07"/><path d="M19.07 4.93a10 10 0 010 14.14"/></svg></div><div class="label">Broadcast</div><div class="sub">Send notification</div></div>' +
      '<div class="icon-card" onclick="AdminUI.go(\'logs\')"><div class="ico"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div class="label">Audit Log</div><div class="sub">Track actions</div></div>' +
      '<div class="icon-card" onclick="window.location.href=\'/dashboard/\'"><div class="ico"><svg viewBox="0 0 24 24"><path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg></div><div class="label">Main Dashboard</div><div class="sub">Go back</div></div>' +
    '</div>' +
    '<div class="grid-4">' +
      '<div class="card"><div class="card-title">Total Users</div><div class="card-value">' + s.users + '</div><div class="card-meta">' + s.active_users + ' active</div></div>' +
      '<div class="card"><div class="card-title">Total Sites</div><div class="card-value">' + s.sites + '</div><div class="card-meta">' + s.live_sites + ' live</div></div>' +
      '<div class="card"><div class="card-title">Files</div><div class="card-value">' + s.files + '</div><div class="card-meta">' + fmtBytes(s.storage_bytes) + '</div></div>' +
      '<div class="card"><div class="card-title">Visitors</div><div class="card-value">' + s.visitors + '</div><div class="card-meta">All time</div></div>' +
    '</div>' +
    '<div class="grid-2">' +
      '<div class="card"><div class="card-title">Recent Users</div>' +
        (d.recent_users.length ? '<table><tbody>' + d.recent_users.map(function(u){
          return '<tr><td><div style="font-size:13px;color:#1a1a2e;font-weight:600">' + escHtml(u.name || '-') + '</div><div style="font-size:11px;color:#6b7280;font-family:monospace">' + escHtml(u.email) + '</div></td><td style="text-align:right;font-size:11px;color:#9ca3af">' + timeAgo(u.created_at) + '</td></tr>';
        }).join('') + '</tbody></table>' : '<p style="color:#9ca3af;font-size:13px;padding:20px 0;text-align:center">No users yet</p>') +
      '</div>' +
      '<div class="card"><div class="card-title">Recent Sites</div>' +
        (d.recent_sites.length ? '<table><tbody>' + d.recent_sites.map(function(s2){
          return '<tr><td><div style="font-size:13px;color:#1a1a2e;font-weight:600">' + escHtml(s2.name) + '</div><div style="font-size:11px;color:#6b7280;font-family:monospace">' + escHtml(s2.subdomain) + '</div></td><td style="text-align:right"><span class="badge badge-' + (s2.status === 'live' ? 'live' : 'draft') + '">' + s2.status + '</span></td></tr>';
        }).join('') + '</tbody></table>' : '<p style="color:#9ca3af;font-size:13px;padding:20px 0;text-align:center">No sites yet</p>') +
      '</div>' +
    '</div>';
};

document.addEventListener('DOMContentLoaded', function(){ AdminUI.init(); });

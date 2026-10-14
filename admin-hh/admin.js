(function(){
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function fmtBytes(b){
    if(!b) return '0 B';
    if(b<1024) return b+' B';
    if(b<1048576) return (b/1024).toFixed(1)+' KB';
    if(b<1073741824) return (b/1048576).toFixed(2)+' MB';
    return (b/1073741824).toFixed(2)+' GB';
  }
  function timeAgo(s){
    if(!s) return '-';
    try {
      var t = new Date(String(s).replace(' ','T')+'Z').getTime();
      var d = Date.now()-t;
      if(d<60000) return 'Just now';
      var m = Math.floor(d/60000);
      if(m<60) return m+'m ago';
      var h = Math.floor(m/60);
      if(h<24) return h+'h ago';
      return Math.floor(h/24)+'d ago';
    } catch(e){ return s; }
  }

  var App = {
    user: null,
    init: async function(){
      try {
        var r = await fetch('/api/auth/session');
        var d = await r.json();
        if (!d.ok || !d.authenticated) {
          document.getElementById('main').innerHTML = '<div class="loading">Not logged in. <a href="/" style="color:#2d5bff">Sign in</a></div>';
          return;
        }
        if (d.user.role !== 'admin' && d.user.role !== 'superadmin') {
          document.getElementById('main').innerHTML = '<div class="loading">Access denied.</div>';
          return;
        }
        this.user = d.user;
        this.bindMenu();
        this.render('overview');
      } catch(e) {
        document.getElementById('main').innerHTML = '<div class="loading" style="color:#ef4444">Error: ' + esc(e.message) + '</div>';
      }
    },
    bindMenu: function(){
      var self = this;
      document.querySelectorAll('.sb-link[data-id]').forEach(function(el){
        el.onclick = function(){
          document.querySelectorAll('.sb-link[data-id]').forEach(function(x){ x.classList.remove('active'); });
          el.classList.add('active');
          self.render(el.dataset.id);
        };
      });
      document.getElementById('navDashboard').onclick = function(){ window.location.href = '/dashboard/'; };
      document.getElementById('navLogout').onclick = function(){
        if (confirm('Log out?')) fetch('/api/auth/logout',{method:'POST'}).finally(function(){ window.location.href='/'; });
      };
    },
    render: async function(page){
      var main = document.getElementById('main');
      main.innerHTML = '<div class="loading">Loading...</div>';
      try {
        if (page === 'overview') return await this.pageOverview(main);
        main.innerHTML = '<div class="loading">' + page + ' — coming soon</div>';
      } catch(e){
        main.innerHTML = '<div class="loading" style="color:#ef4444">Error: ' + esc(e.message) + '</div>';
      }
    },
    pageOverview: async function(main){
      var r = await fetch('/api/admin/stats');
      var d = await r.json();
      if (!d.ok) throw new Error(d.error || 'Stats API failed');
      var s = d.stats;
      main.innerHTML =
        '<div class="page-head"><h1>Dashboard</h1><p>Welcome back, ' + esc(this.user.name || 'Admin') + '</p></div>' +
        '<div class="hero"><h2>HairiHosting Admin Console</h2><p>Manage users, sites, tokens and system activity</p></div>' +
        '<div class="grid-4">' +
          '<div class="card"><div class="card-title">Total Users</div><div class="card-value">' + s.users + '</div><div class="card-meta">' + s.active_users + ' active</div></div>' +
          '<div class="card"><div class="card-title">Total Sites</div><div class="card-value">' + s.sites + '</div><div class="card-meta">' + s.live_sites + ' live</div></div>' +
          '<div class="card"><div class="card-title">Files</div><div class="card-value">' + s.files + '</div><div class="card-meta">' + fmtBytes(s.storage_bytes) + '</div></div>' +
          '<div class="card"><div class="card-title">Visitors</div><div class="card-value">' + s.visitors + '</div><div class="card-meta">All time</div></div>' +
        '</div>' +
        '<div class="grid-4">' +
          '<div class="card"><div class="card-title">Active Tokens</div><div class="card-value">' + s.active_tokens + '</div><div class="card-meta">Unused, not expired</div></div>' +
        '</div>' +
        '<div class="grid-2">' +
          '<div class="card"><div class="card-title">Recent Users</div>' +
            (d.recent_users.length ? '<table><tbody>' + d.recent_users.map(function(u){
              return '<tr><td><div style="font-weight:600">' + esc(u.name || '-') + '</div><div style="font-size:11px;color:#6b7280;font-family:monospace">' + esc(u.email) + '</div></td><td style="text-align:right;font-size:11px;color:#9ca3af">' + timeAgo(u.created_at) + '</td></tr>';
            }).join('') + '</tbody></table>' : '<p style="color:#9ca3af;text-align:center;padding:20px">No users yet</p>') +
          '</div>' +
          '<div class="card"><div class="card-title">Recent Sites</div>' +
            (d.recent_sites.length ? '<table><tbody>' + d.recent_sites.map(function(s2){
              return '<tr><td><div style="font-weight:600">' + esc(s2.name) + '</div><div style="font-size:11px;color:#6b7280;font-family:monospace">' + esc(s2.subdomain) + '</div></td><td style="text-align:right"><span class="badge badge-' + (s2.status === 'live' ? 'live' : 'draft') + '">' + s2.status + '</span></td></tr>';
            }).join('') + '</tbody></table>' : '<p style="color:#9ca3af;text-align:center;padding:20px">No sites yet</p>') +
          '</div>' +
        '</div>';
    }
  };

  window.AdminApp = App;
  document.addEventListener('DOMContentLoaded', function(){ App.init(); });
})();

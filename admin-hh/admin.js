(function(){
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function fmtBytes(b){ if(!b) return '0 B'; if(b<1024) return b+' B'; if(b<1048576) return (b/1024).toFixed(1)+' KB'; if(b<1073741824) return (b/1048576).toFixed(2)+' MB'; return (b/1073741824).toFixed(2)+' GB'; }
  function timeAgo(s){
    if(!s) return '-';
    try {
      var t = new Date(String(s).replace(' ','T')+'Z').getTime();
      var d = Date.now()-t;
      if(d<60000) return 'just now';
      var m = Math.floor(d/60000);
      if(m<60) return m+'m ago';
      var h = Math.floor(m/60);
      if(h<24) return h+'h ago';
      return Math.floor(h/24)+'d ago';
    } catch(e){ return s; }
  }
  function toast(msg, type){
    type = type || 'info';
    var w = document.getElementById('toastWrap');
    var e = document.createElement('div');
    e.className = 'toast ' + type;
    e.textContent = msg;
    w.appendChild(e);
    setTimeout(function(){ e.style.transition = 'opacity .3s'; e.style.opacity = '0'; setTimeout(function(){ e.remove(); }, 300); }, 3500);
  }

  var App = {
    user: null,
    page: 'overview',
    init: async function(){
      try {
        var r = await fetch('/api/auth/session');
        var d = await r.json();
        if (!d.ok || !d.authenticated) { document.getElementById('main').innerHTML = '<div class="loading">Not logged in. <a href="/" style="color:#34e8bb">Sign in</a></div>'; return; }
        if (d.user.role !== 'admin' && d.user.role !== 'superadmin') { document.getElementById('main').innerHTML = '<div class="loading">Access denied.</div>'; return; }
        this.user = d.user;
        this.bindNav();
        this.render('overview');
      } catch(e) { document.getElementById('main').innerHTML = '<div class="loading" style="color:#ff8a8a">Error: ' + esc(e.message) + '</div>'; }
    },
    bindNav: function(){
      var self = this;

      // Close all dropdowns
      function closeAll(){
        document.querySelectorAll('.nav-group').forEach(function(g){ g.classList.remove('open'); });
      }

      // Tab clicks (Dashboard)
      document.querySelectorAll('.nav-tab[data-id]').forEach(function(el){
        el.onclick = function(){
          closeAll();
          document.querySelectorAll('.nav-tab').forEach(function(x){ x.classList.remove('active'); });
          document.querySelectorAll('.dropdown-item').forEach(function(x){ x.classList.remove('active'); });
          el.classList.add('active');
          self.page = el.dataset.id;
          self.render(el.dataset.id);
        };
      });

      // Toggle dropdowns
      document.querySelectorAll('.nav-tab[data-toggle]').forEach(function(el){
        el.onclick = function(e){
          e.stopPropagation();
          var group = el.closest('.nav-group');
          var wasOpen = group.classList.contains('open');
          closeAll();
          if (!wasOpen) group.classList.add('open');
        };
      });

      // Dropdown item clicks
      document.querySelectorAll('.dropdown-item[data-id]').forEach(function(el){
        el.onclick = function(){
          var id = el.dataset.id;
          closeAll();
          document.querySelectorAll('.nav-tab').forEach(function(x){ x.classList.remove('active'); });
          document.querySelectorAll('.dropdown-item').forEach(function(x){ x.classList.remove('active'); });
          el.classList.add('active');
          // Highlight parent group tab
          var parentGroup = el.closest('.nav-group');
          if (parentGroup) {
            var parentTab = parentGroup.querySelector('.nav-tab.has-dropdown');
            if (parentTab) parentTab.classList.add('active');
          }
          self.page = id;
          self.render(id);
        };
      });

      // Click outside closes dropdowns
      document.addEventListener('click', function(e){
        if (!e.target.closest('.nav-group')) closeAll();
      });

      // Log out
      var lo = document.getElementById('navLogout');
      if (lo) lo.onclick = function(){ if (confirm('Log out?')) fetch('/api/auth/logout',{method:'POST'}).finally(function(){ window.location.href='/'; }); };
    },
    setPage: function(id){
      this.page = id;
      document.querySelectorAll('.nav-tab[data-id]').forEach(function(x){ x.classList.toggle('active', x.dataset.id === id); });
      this.render(id);
    },
    render: async function(page){
      var main = document.getElementById('main');
      main.innerHTML = '<div class="loading">Loading...</div>';
      try {
        if (page === 'overview') return await this.pageOverview(main);
        if (page === 'users') return await this.pageUsers(main);
        if (page === 'sites') return await this.pageSites(main);
        if (page === 'tokens') return await this.pageTokens(main);
        if (page === 'notify') return await this.pageNotify(main);
        if (page === 'logs') return await this.pageLogs(main);
        if (page === 'settings') return await this.pageSettings(main);
        if (page === 'admins') return await this.pageAdmins(main);
        if (page === 'admin-sessions') return await this.pageAdminSessions(main);
        if (page === 'security-log') return await this.pageSecurityLog(main);
      } catch(e){ main.innerHTML = '<div class="loading" style="color:#ff8a8a">Error: ' + esc(e.message) + '</div>'; }
    }
  };
  window.AdminApp = App;
  App.pageOverview = async function(main){
    var r = await fetch('/api/admin/stats');
    var d = await r.json();
    if (!d.ok) throw new Error(d.error);
    var s = d.stats;
    main.innerHTML =
      '<div class="eyebrow">Overview</div>' +
      '<h1 class="page-title">Command Center</h1>' +
      '<p class="page-sub">Welcome back, ' + esc(this.user.name || 'Admin') + '. Here\'s what\'s happening across LogoUtama.</p>' +

      '<div class="grid">' +
        '<div class="card card-teal hoverable" onclick="AdminApp.setPage(\'users\')">' +
          '<div class="card-title">Users</div>' +
          '<div class="card-value">' + s.users + '</div>' +
          '<div class="card-meta">' + s.active_users + ' active</div>' +
        '</div>' +
        '<div class="card card-lav hoverable" onclick="AdminApp.setPage(\'sites\')">' +
          '<div class="card-title">Sites</div>' +
          '<div class="card-value">' + s.sites + '</div>' +
          '<div class="card-meta">' + s.live_sites + ' live</div>' +
        '</div>' +
        '<div class="card card-pink hoverable" onclick="AdminApp.setPage(\'tokens\')">' +
          '<div class="card-title">Tokens</div>' +
          '<div class="card-value">' + s.active_tokens + '</div>' +
          '<div class="card-meta">active now</div>' +
        '</div>' +
        '<div class="card card-blue hoverable" onclick="AdminApp.setPage(\'logs\')">' +
          '<div class="card-title">Visitors</div>' +
          '<div class="card-value">' + s.visitors + '</div>' +
          '<div class="card-meta">all time</div>' +
        '</div>' +
      '</div>' +

      '<div class="hero">' +
        '<h2>System Status</h2>' +
        '<p>' + fmtBytes(s.storage_bytes) + ' storage used across ' + s.files + ' files · Cloudflare edge network</p>' +
      '</div>' +

      '<div class="grid-2">' +
        '<div class="card"><div class="card-title">Recent Users</div>' +
          (d.recent_users.length ? '<table><tbody>' + d.recent_users.map(function(u){ return '<tr><td><div style="font-weight:600">' + esc(u.name || '-') + '</div><div style="font-size:11px;color:#c0c1c6;font-family:var(--mono)">' + esc(u.email) + '</div></td><td style="text-align:right;font-size:11px;color:#c0c1c6;font-family:var(--mono);white-space:nowrap">' + timeAgo(u.created_at) + '</td></tr>'; }).join('') + '</tbody></table>' : '<p style="color:#c0c1c6;text-align:center;padding:20px;font-size:13px">No users yet</p>') +
        '</div>' +
        '<div class="card"><div class="card-title">Recent Sites</div>' +
          (d.recent_sites.length ? '<table><tbody>' + d.recent_sites.map(function(x){ return '<tr><td><div style="font-weight:600">' + esc(x.name) + '</div><div style="font-size:11px;color:#c0c1c6;font-family:var(--mono)">' + esc(x.subdomain) + '</div></td><td style="text-align:right"><span class="badge badge-' + (x.status === 'live' ? 'live' : 'draft') + '">' + x.status + '</span></td></tr>'; }).join('') + '</tbody></table>' : '<p style="color:#c0c1c6;text-align:center;padding:20px;font-size:13px">No sites yet</p>') +
        '</div>' +
      '</div>';
  };

  App.pageUsers = async function(main){
    main.innerHTML =
      '<div class="eyebrow">Manage</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:32px"><div><h1 class="page-title">Users</h1><p class="page-sub" style="margin-bottom:0">Manage all LogoUtama accounts</p></div><button class="btn btn-primary" id="btnNewUser">+ New User</button></div>' +
      '<div class="card" style="margin-bottom:16px;padding:16px"><input class="input" id="userSearch" placeholder="Search by name, email or username..."></div>' +
      '<div class="card" style="padding:0;overflow:hidden"><div id="userList"><div class="loading">Loading...</div></div></div>';
    document.getElementById('btnNewUser').onclick = function(){ App.showNewUserModal(); };
    var s = document.getElementById('userSearch');
    var t = null;
    s.oninput = function(){ clearTimeout(t); t = setTimeout(function(){ App.loadUsers(s.value); }, 300); };
    App.loadUsers('');
  };

  App.loadUsers = async function(q){
    var el = document.getElementById('userList');
    el.innerHTML = '<div class="loading">Loading...</div>';
    var r = await fetch('/api/admin/users?q=' + encodeURIComponent(q || ''));
    var d = await r.json();
    if (!d.ok) { el.innerHTML = '<div class="loading" style="color:#ff9592">' + esc(d.error) + '</div>'; return; }
    if (!d.users.length) { el.innerHTML = '<div class="loading">No users found</div>'; return; }
    el.innerHTML = '<div class="table-wrap"><table><thead><tr><th>User</th><th>Plan</th><th>Expires</th><th>Status</th><th>Sites</th><th style="text-align:right">Actions</th></tr></thead><tbody>' +
      d.users.map(function(u){
        var planLabel = u.plan === 'bisnes' ? 'BISNES' : 'PRO';
        var planCls = u.plan === 'bisnes' ? 'badge-live' : 'badge-draft';
        var expiresAt = u.plan_expires_at ? new Date(u.plan_expires_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '-';
        var expired = u.plan_expires_at && new Date(u.plan_expires_at).getTime() < Date.now();
        return '<tr><td><div style="font-weight:600">' + esc(u.name || '-') + '</div><div style="font-size:11px;color:#a1a4a5;font-family:var(--mono)">' + esc(u.email) + '</div>' + (u.username ? '<div style="font-size:10px;color:#a1a4a5;opacity:.7">@' + esc(u.username) + '</div>' : '') + '</td>' +
          '<td><span class="badge ' + planCls + '">' + planLabel + '</span></td>' +
          '<td style="font-family:var(--mono);font-size:12px;' + (expired ? 'color:#ff9592;' : 'color:#a1a4a5;') + '">' + expiresAt + '</td>' +
          '<td><span class="badge badge-' + (u.status === 'active' ? 'active' : 'suspended') + '">' + u.status + '</span></td>' +
          '<td style="font-family:var(--mono);font-size:13px">' + u.site_count + '</td>' +
          '<td style="text-align:right;white-space:nowrap"><button class="btn btn-sm" onclick="AdminApp.extendUser(' + u.id + ',\'' + esc(u.name || u.email) + '\')">Extend</button> ' +
          '<button class="btn btn-sm" onclick="AdminApp.changePlan(' + u.id + ',\'' + u.plan + '\',\'' + esc(u.name || u.email) + '\')">Plan</button> ' +
          '<button class="btn btn-sm" onclick="AdminApp.toggleUser(' + u.id + ',\'' + u.status + '\',\'' + esc(u.email) + '\')">' + (u.status === 'active' ? 'Suspend' : 'Activate') + '</button> ' +
          '<button class="btn btn-sm btn-danger" onclick="AdminApp.deleteUser(' + u.id + ',\'' + esc(u.email) + '\')">Delete</button></td></tr>';
      }).join('') + '</tbody></table></div>';
  };

  App.changePlan = function(id, current, name){
    var newPlan = current === 'bisnes' ? 'pro' : 'bisnes';
    var label = newPlan === 'bisnes' ? 'Bisnes (2 tahun)' : 'Pro (5 bulan)';
    if (!confirm('Tukar ' + name + ' ke ' + label + '?\n\nExpiry akan reset.')) return;
    (async function(){
      var r = await fetch('/api/admin/users?id=' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: newPlan }) });
      var d = await r.json();
      if (d.ok) { toast('Plan updated','success'); App.loadUsers(document.getElementById('userSearch').value); }
      else toast(d.error,'error');
    })();
  };

  App.extendUser = function(id, name){
    if (!confirm('Extend plan untuk ' + name + '?\n\nTempoh sama dengan plan semasa.')) return;
    (async function(){
      var r = await fetch('/api/admin/users?id=' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ extend: true }) });
      var d = await r.json();
      if (d.ok) { toast('Plan extended','success'); App.loadUsers(document.getElementById('userSearch').value); }
      else toast(d.error,'error');
    })();
  };

  App.showNewUserModal = function(){
    var m = document.createElement('div');
    m.id = 'modalOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
    m.innerHTML = '<div style="background:#000;border:1px solid #292d30;border-radius:16px;padding:32px;max-width:480px;width:100%">' +
      '<div class="eyebrow">Create</div>' +
      '<h3 style="font-family:var(--serif);font-weight:400;font-size:28px;letter-spacing:-.04em;margin-bottom:24px;color:#fff">New User</h3>' +
      '<div style="margin-bottom:16px"><label style="font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#a1a4a5;display:block;margin-bottom:8px">Name</label><input class="input" id="nName" placeholder="Full name"></div>' +
      '<div style="margin-bottom:16px"><label style="font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#a1a4a5;display:block;margin-bottom:8px">Email</label><input class="input" id="nEmail" type="email" placeholder="user@example.com"></div>' +
      '<div style="margin-bottom:24px"><label style="font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#a1a4a5;display:block;margin-bottom:8px">Plan</label>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
          '<label style="cursor:pointer;padding:12px;border:1px solid #292d30;border-radius:6px"><input type="radio" name="nPlan" value="pro" checked style="margin-right:8px"><span style="font-size:14px;color:#f0f0f0">Pro</span><div style="font-size:11px;color:#a1a4a5;font-family:var(--mono);margin-left:22px">5 bulan</div></label>' +
          '<label style="cursor:pointer;padding:12px;border:1px solid #292d30;border-radius:6px"><input type="radio" name="nPlan" value="bisnes" style="margin-right:8px"><span style="font-size:14px;color:#f0f0f0">Bisnes</span><div style="font-size:11px;color:#a1a4a5;font-family:var(--mono);margin-left:22px">2 tahun</div></label>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn" id="nCancel">Cancel</button><button class="btn btn-primary" id="nCreate">Create User</button></div>' +
    '</div>';
    document.body.appendChild(m);
    document.getElementById('nCancel').onclick = function(){ m.remove(); };
    document.getElementById('nCreate').onclick = function(){ App.createUser(); };
    setTimeout(function(){ document.getElementById('nName').focus(); }, 100);
  };

  App.createUser = async function(){
    var name = document.getElementById('nName').value.trim();
    var email = document.getElementById('nEmail').value.trim();
    var planEl = document.querySelector('input[name="nPlan"]:checked');
    var plan = planEl ? planEl.value : 'pro';
    if (!name || !email) { toast('Name and email required','error'); return; }
    var btn = document.getElementById('nCreate');
    btn.disabled = true; btn.textContent = 'Creating...';
    try {
      var r = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name, email: email, plan: plan }) });
      var d = await r.json();
      if (!d.ok) { toast(d.error,'error'); btn.disabled = false; btn.textContent = 'Create User'; return; }
      document.getElementById('modalOverlay').remove();
      App.showTempPassword(d.user.email, d.user.temp_password, d.user.plan);
    } catch(e) { toast('Error: ' + e.message,'error'); btn.disabled = false; btn.textContent = 'Create User'; }
  };

  App.showTempPassword = function(email, pass, plan){
    var planLabel = plan === 'bisnes' ? 'Bisnes (2 tahun)' : 'Pro (5 bulan)';
    var m = document.createElement('div');
    m.id = 'modalOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
    m.innerHTML = '<div style="background:#000;border:1px solid #292d30;border-radius:16px;padding:32px;max-width:480px;width:100%">' +
      '<div class="eyebrow" style="color:#3ad389">User Created</div>' +
      '<h3 style="font-family:var(--serif);font-weight:400;font-size:24px;letter-spacing:-.04em;margin-bottom:8px;color:#fff">Save credentials</h3>' +
      '<p style="font-size:13px;color:#a1a4a5;margin-bottom:20px">Share with the user. They can change password after login.</p>' +
      '<div style="background:#0b0e14;border:1px solid #292d30;border-radius:6px;padding:16px;margin-bottom:20px">' +
        '<div style="font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#a1a4a5;margin-bottom:6px">Email</div>' +
        '<div style="font-family:var(--mono);font-size:13px;margin-bottom:14px;color:#f0f0f0;word-break:break-all">' + esc(email) + '</div>' +
        '<div style="font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#a1a4a5;margin-bottom:6px">Plan</div>' +
        '<div style="font-size:14px;color:#f0f0f0;margin-bottom:14px">' + esc(planLabel) + '</div>' +
        '<div style="font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#a1a4a5;margin-bottom:6px">Temp Password</div>' +
        '<div style="font-family:var(--mono);font-size:16px;font-weight:500;color:#9281f7;word-break:break-all">' + esc(pass) + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn" id="tpCopy">Copy</button><button class="btn btn-primary" id="tpDone">Done</button></div>' +
    '</div>';
    document.body.appendChild(m);
    document.getElementById('tpCopy').onclick = function(){ navigator.clipboard.writeText('Email: ' + email + '\nPlan: ' + planLabel + '\nPassword: ' + pass).then(function(){ toast('Copied','success'); }); };
    document.getElementById('tpDone').onclick = function(){ m.remove(); App.loadUsers(''); };
  };

  App.toggleUser = async function(id, status, email){
    var newStatus = status === 'active' ? 'suspended' : 'active';
    if (!confirm((status === 'active' ? 'Suspend' : 'Activate') + ' user ' + email + '?')) return;
    var r = await fetch('/api/admin/users?id=' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    var d = await r.json();
    if (d.ok) { toast('User ' + newStatus,'success'); App.loadUsers(document.getElementById('userSearch').value); }
    else toast(d.error,'error');
  };

  App.deleteUser = async function(id, email){
    if (!confirm('DELETE user ' + email + '?\n\nPermanently removes ALL their data. Cannot be undone.')) return;
    if (!confirm('Final confirm?')) return;
    var r = await fetch('/api/admin/users?id=' + id, { method: 'DELETE' });
    var d = await r.json();
    if (d.ok) { toast('User deleted','success'); App.loadUsers(document.getElementById('userSearch').value); }
    else toast(d.error,'error');
  };

  App.pageTokens = async function(main){
    main.innerHTML =
      '<div class="eyebrow">Manage</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:32px"><div><h1 class="page-title">Login Tokens</h1><p class="page-sub" style="margin-bottom:0">Single-use tokens for user access</p></div><button class="btn btn-primary" id="btnNewToken">+ Generate</button></div>' +
      '<div class="card" style="padding:0;overflow:hidden"><div id="tokenList"><div class="loading">Loading...</div></div></div>';
    document.getElementById('btnNewToken').onclick = function(){ App.showNewTokenModal(); };
    App.loadTokens();
  };

  App.loadTokens = async function(){
    var el = document.getElementById('tokenList');
    el.innerHTML = '<div class="loading">Loading...</div>';
    var r = await fetch('/api/admin/tokens');
    var d = await r.json();
    if (!d.ok) { el.innerHTML = '<div class="loading" style="color:#ff8a8a">' + esc(d.error) + '</div>'; return; }
    if (!d.tokens.length) { el.innerHTML = '<div class="loading">No tokens yet</div>'; return; }
    var now = Date.now();
    el.innerHTML = '<div class="table-wrap"><table><thead><tr><th>User</th><th>Label</th><th>Prefix</th><th>Status</th><th>Expires</th><th style="text-align:right">Actions</th></tr></thead><tbody>' +
      d.tokens.map(function(t){
        var status = t.used_at ? 'USED' : (new Date(t.expires_at).getTime() < now ? 'EXPIRED' : 'ACTIVE');
        var cls = status === 'ACTIVE' ? 'active' : (status === 'USED' ? 'used' : 'suspended');
        return '<tr><td><div style="font-weight:600">' + esc(t.name || '-') + '</div><div style="font-size:11px;color:#c0c1c6;font-family:var(--mono)">' + esc(t.email) + '</div></td>' +
          '<td>' + esc(t.label || '-') + '</td>' +
          '<td style="font-family:var(--mono);font-size:12px;color:#c0c1c6">' + esc(t.token_prefix) + '...</td>' +
          '<td><span class="badge badge-' + cls + '">' + status + '</span></td>' +
          '<td style="font-family:var(--mono);font-size:11px;color:#c0c1c6;white-space:nowrap">' + timeAgo(t.expires_at) + '</td>' +
          '<td style="text-align:right"><button class="btn btn-sm btn-danger" onclick="AdminApp.revokeToken(' + t.id + ')">Revoke</button></td></tr>';
      }).join('') + '</tbody></table></div>';
  };

  App.showNewTokenModal = async function(){
    var r = await fetch('/api/admin/users');
    var d = await r.json();
    if (!d.ok) { toast(d.error,'error'); return; }
    var opts = d.users.map(function(u){ return '<option value="' + u.id + '">' + esc(u.name || u.email) + ' — ' + esc(u.email) + '</option>'; }).join('');
    var m = document.createElement('div');
    m.id = 'modalOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(1,28,66,.85);backdrop-filter:blur(8px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
    m.innerHTML = '<div style="background:#0a2757;border:1px solid rgba(52,232,187,.3);border-radius:6px;padding:32px;max-width:460px;width:100%">' +
      '<div class="eyebrow">Generate</div>' +
      '<h3 style="font-family:var(--display);font-weight:300;font-size:28px;letter-spacing:-.56px;margin-bottom:24px">Login Token</h3>' +
      '<div style="margin-bottom:16px"><label style="font-family:var(--mono);font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#c0c1c6;display:block;margin-bottom:6px">User</label><select class="input" id="tkUser">' + opts + '</select></div>' +
      '<div style="margin-bottom:16px"><label style="font-family:var(--mono);font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#c0c1c6;display:block;margin-bottom:6px">Label (optional)</label><input class="input" id="tkLabel" placeholder="e.g. First login"></div>' +
      '<div style="margin-bottom:24px"><label style="font-family:var(--mono);font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#c0c1c6;display:block;margin-bottom:6px">Expires in</label><select class="input" id="tkExp"><option value="1">1 day</option><option value="7" selected>7 days</option><option value="30">30 days</option></select></div>' +
      '<div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-ghost" id="tkCancel">Cancel</button><button class="btn btn-primary" id="tkGen">Generate</button></div>' +
    '</div>';
    document.body.appendChild(m);
    document.getElementById('tkCancel').onclick = function(){ m.remove(); };
    document.getElementById('tkGen').onclick = function(){ App.createToken(); };
  };

  App.createToken = async function(){
    var uid = document.getElementById('tkUser').value;
    var label = document.getElementById('tkLabel').value.trim();
    var exp = document.getElementById('tkExp').value;
    var btn = document.getElementById('tkGen');
    btn.disabled = true; btn.textContent = 'Generating...';
    try {
      var r = await fetch('/api/admin/tokens', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: parseInt(uid), label: label, expires_days: parseInt(exp) }) });
      var d = await r.json();
      if (!d.ok) { toast(d.error,'error'); btn.disabled = false; btn.textContent = 'Generate'; return; }
      document.getElementById('modalOverlay').remove();
      App.showTokenResult(d.token, d.expires_at);
    } catch(e) { toast('Error: ' + e.message,'error'); btn.disabled = false; btn.textContent = 'Generate'; }
  };

  App.showTokenResult = function(token, expiresAt){
    var m = document.createElement('div');
    m.id = 'modalOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(1,28,66,.85);backdrop-filter:blur(8px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
    m.innerHTML = '<div style="background:#0a2757;border:1px solid rgba(52,232,187,.3);border-radius:6px;padding:32px;max-width:540px;width:100%">' +
      '<div class="eyebrow" style="color:#34e8bb">✓ Token Generated</div>' +
      '<h3 style="font-family:var(--display);font-weight:300;font-size:24px;letter-spacing:-.5px;margin-bottom:8px">Copy now</h3>' +
      '<p style="font-size:13px;color:#c0c1c6;margin-bottom:20px">Only shown once. User pastes this on the login page.</p>' +
      '<div style="background:rgba(52,232,187,.06);border:1px solid rgba(52,232,187,.3);border-radius:6px;padding:16px;margin-bottom:16px;word-break:break-all;font-family:var(--mono);font-size:13px;color:#34e8bb">' + esc(token) + '</div>' +
      '<p style="font-family:var(--mono);font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:#c0c1c6;margin-bottom:20px">Expires ' + new Date(expiresAt).toLocaleString() + '</p>' +
      '<div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-ghost" id="tkCopy">Copy</button><button class="btn btn-primary" id="tkDone">Done</button></div>' +
    '</div>';
    document.body.appendChild(m);
    document.getElementById('tkCopy').onclick = function(){ navigator.clipboard.writeText(token).then(function(){ toast('Copied','success'); }); };
    document.getElementById('tkDone').onclick = function(){ m.remove(); App.loadTokens(); };
  };

  App.revokeToken = async function(id){
    if (!confirm('Revoke this token?')) return;
    var r = await fetch('/api/admin/tokens?id=' + id, { method: 'DELETE' });
    var d = await r.json();
    if (d.ok) { toast('Token revoked','success'); App.loadTokens(); }
    else toast(d.error,'error');
  };

  App.pageSites = async function(main){
    main.innerHTML =
      '<div class="eyebrow">Manage</div>' +
      '<h1 class="page-title">Sites</h1>' +
      '<p class="page-sub">All websites across all users</p>' +
      '<div class="card" style="margin-bottom:16px;padding:16px"><input class="input" id="siteSearch" placeholder="Search name, subdomain or owner..."></div>' +
      '<div class="card" style="padding:0;overflow:hidden"><div id="siteList"><div class="loading">Loading...</div></div></div>';
    var s = document.getElementById('siteSearch');
    var t = null;
    s.oninput = function(){ clearTimeout(t); t = setTimeout(function(){ App.loadSites(s.value); }, 300); };
    App.loadSites('');
  };

  App.loadSites = async function(q){
    var el = document.getElementById('siteList');
    el.innerHTML = '<div class="loading">Loading...</div>';
    var r = await fetch('/api/admin/sites?q=' + encodeURIComponent(q || ''));
    var d = await r.json();
    if (!d.ok) { el.innerHTML = '<div class="loading" style="color:#ff8a8a">' + esc(d.error) + '</div>'; return; }
    if (!d.sites.length) { el.innerHTML = '<div class="loading">No sites found</div>'; return; }
    el.innerHTML = '<div class="table-wrap"><table><thead><tr><th>Site</th><th>Owner</th><th>Status</th><th>Updated</th><th style="text-align:right">Actions</th></tr></thead><tbody>' +
      d.sites.map(function(x){
        return '<tr><td><div style="font-weight:600">' + esc(x.name) + '</div><div style="font-size:11px;color:#c0c1c6;font-family:var(--mono)">' + esc(x.subdomain) + '.hairiamri.buzz</div></td>' +
          '<td><div style="font-size:13px">' + esc(x.owner_name || '-') + '</div><div style="font-size:11px;color:#c0c1c6;font-family:var(--mono)">' + esc(x.owner_email) + '</div></td>' +
          '<td><span class="badge badge-' + (x.status === 'live' ? 'live' : 'draft') + '">' + x.status + '</span></td>' +
          '<td style="font-family:var(--mono);font-size:11px;color:#c0c1c6;white-space:nowrap">' + timeAgo(x.updated_at) + '</td>' +
          '<td style="text-align:right"><button class="btn btn-sm btn-danger" onclick="AdminApp.deleteSite(' + x.id + ',\'' + esc(x.subdomain) + '\')">Delete</button></td></tr>';
      }).join('') + '</tbody></table></div>';
  };

  App.deleteSite = async function(id, sub){
    if (!confirm('DELETE site ' + sub + '?\n\nRemoves site and all its files. Cannot be undone.')) return;
    var r = await fetch('/api/admin/sites?id=' + id, { method: 'DELETE' });
    var d = await r.json();
    if (d.ok) { toast('Site deleted','success'); App.loadSites(document.getElementById('siteSearch').value); }
    else toast(d.error,'error');
  };

  App.pageNotify = async function(main){
    main.innerHTML =
      '<div class="eyebrow">Manage</div>' +
      '<h1 class="page-title">Broadcast</h1>' +
      '<p class="page-sub">Send a notification to all users or a specific user</p>' +
      '<div class="card" style="max-width:680px">' +
        '<div style="margin-bottom:18px"><label style="font-family:var(--mono);font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#c0c1c6;display:block;margin-bottom:6px">Target</label><select class="input" id="nTarget"><option value="all">All Users</option></select></div>' +
        '<div style="margin-bottom:18px"><label style="font-family:var(--mono);font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#c0c1c6;display:block;margin-bottom:6px">Title</label><input class="input" id="nTitle" placeholder="Notification title" maxlength="120"></div>' +
        '<div style="margin-bottom:24px"><label style="font-family:var(--mono);font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#c0c1c6;display:block;margin-bottom:6px">Body (HTML allowed)</label><textarea class="input" id="nBody" style="min-height:160px;font-family:var(--mono);font-size:12.5px;resize:vertical;line-height:1.6" placeholder="&#60;p&#62;Message...&#60;/p&#62;"></textarea></div>' +
        '<button class="btn btn-primary" id="btnSend">Send Notification</button>' +
      '</div>';
    try {
      var r = await fetch('/api/admin/users');
      var d = await r.json();
      if (d.ok) {
        var sel = document.getElementById('nTarget');
        d.users.forEach(function(u){
          var opt = document.createElement('option');
          opt.value = 'user:' + u.id;
          opt.textContent = 'User — ' + (u.name || u.email);
          sel.appendChild(opt);
        });
      }
    } catch(e) {}
    document.getElementById('btnSend').onclick = function(){ App.sendNotify(); };
  };

  App.sendNotify = async function(){
    var target = document.getElementById('nTarget').value;
    var title = document.getElementById('nTitle').value.trim();
    var body = document.getElementById('nBody').value.trim();
    if (!title || !body) { toast('Title and body required','error'); return; }
    var payload = { title: title, body: body, target: 'all' };
    if (target.indexOf('user:') === 0) { payload.target = 'user'; payload.user_id = parseInt(target.slice(5)); }
    var btn = document.getElementById('btnSend');
    btn.disabled = true; btn.textContent = 'Sending...';
    try {
      var r = await fetch('/api/admin/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      var d = await r.json();
      if (d.ok) { toast('Sent to ' + d.sent + ' user(s)','success'); document.getElementById('nTitle').value = ''; document.getElementById('nBody').value = ''; }
      else toast(d.error,'error');
    } catch(e) { toast('Error: ' + e.message,'error'); }
    btn.disabled = false; btn.textContent = 'Send Notification';
  };

  App.pageLogs = async function(main){
    main.innerHTML =
      '<div class="eyebrow">System</div>' +
      '<h1 class="page-title">Audit Log</h1>' +
      '<p class="page-sub">Recent admin actions</p>' +
      '<div class="card" style="padding:0;overflow:hidden"><div id="logList"><div class="loading">Loading...</div></div></div>';
    var el = document.getElementById('logList');
    var r = await fetch('/api/admin/logs');
    var d = await r.json();
    if (!d.ok) { el.innerHTML = '<div class="loading" style="color:#ff8a8a">' + esc(d.error) + '</div>'; return; }
    if (!d.logs.length) { el.innerHTML = '<div class="loading">No logs yet</div>'; return; }
    el.innerHTML = '<div class="table-wrap"><table><thead><tr><th>Time</th><th>Admin</th><th>Action</th><th>Target</th><th>Details</th></tr></thead><tbody>' +
      d.logs.map(function(l){
        return '<tr><td style="font-family:var(--mono);font-size:11px;color:#c0c1c6;white-space:nowrap">' + timeAgo(l.created_at) + '</td>' +
          '<td style="font-size:13px">' + esc(l.admin_name || l.admin_email || '-') + '</td>' +
          '<td><span class="badge" style="background:rgba(52,232,187,.12);color:#34e8bb">' + esc(l.action) + '</span></td>' +
          '<td style="font-family:var(--mono);font-size:11px;color:#c0c1c6">' + esc(l.target_type || '-') + (l.target_id ? ' #' + l.target_id : '') + '</td>' +
          '<td style="font-size:12.5px;color:#c0c1c6">' + esc(l.details || '-') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  };

  App.pageSettings = async function(main){
    var r = await fetch('/api/admin/settings');
    var d = await r.json();
    if (!d.ok) throw new Error(d.error);
    var s = d.settings;
    main.innerHTML =
      '<div class="eyebrow">System</div>' +
      '<h1 class="page-title">Settings</h1>' +
      '<p class="page-sub">Global configuration for LogoUtama</p>' +
      '<div class="card" style="max-width:640px">' +
        '<div style="margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid var(--graphite)">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:16px">' +
            '<div><div style="font-size:14px;color:var(--bone);margin-bottom:4px">Maintenance Mode</div><div style="font-size:12px;color:var(--ash);font-family:var(--mono)">Block new signups + show maintenance banner</div></div>' +
            '<select class="input" id="sMaint" style="max-width:120px"><option value="off"' + (s.maintenance_mode === 'off' ? ' selected' : '') + '>OFF</option><option value="on"' + (s.maintenance_mode === 'on' ? ' selected' : '') + '>ON</option></select>' +
          '</div>' +
        '</div>' +
        '<div style="margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid var(--graphite)">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:16px">' +
            '<div><div style="font-size:14px;color:var(--bone);margin-bottom:4px">Signups Enabled</div><div style="font-size:12px;color:var(--ash);font-family:var(--mono)">Allow new user registration</div></div>' +
            '<select class="input" id="sSignup" style="max-width:120px"><option value="on"' + (s.signup_enabled === 'on' ? ' selected' : '') + '>ON</option><option value="off"' + (s.signup_enabled === 'off' ? ' selected' : '') + '>OFF</option></select>' +
          '</div>' +
        '</div>' +
        '<div style="margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid var(--graphite)">' +
          '<div style="font-size:14px;color:var(--bone);margin-bottom:8px">Max Sites per User</div>' +
          '<input class="input" id="sMaxSites" type="number" value="' + esc(s.max_sites_per_user) + '" style="max-width:120px">' +
        '</div>' +
        '<div style="margin-bottom:24px">' +
          '<div style="font-size:14px;color:var(--bone);margin-bottom:8px">Announcement Banner</div>' +
          '<textarea class="input" id="sAnnounce" placeholder="HTML allowed. Kosongkan untuk tutup." style="min-height:100px">' + esc(s.announcement || '') + '</textarea>' +
        '</div>' +
        '<button class="btn btn-primary" id="sSave">Save Settings</button>' +
      '</div>';
    document.getElementById('sSave').onclick = async function(){
      var payload = {
        maintenance_mode: document.getElementById('sMaint').value,
        signup_enabled: document.getElementById('sSignup').value,
        max_sites_per_user: document.getElementById('sMaxSites').value,
        announcement: document.getElementById('sAnnounce').value
      };
      var r = await fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      var d = await r.json();
      if (d.ok) toast('Settings saved','success');
      else toast(d.error,'error');
    };
  };

  App.pageAdmins = async function(main){
    main.innerHTML =
      '<div class="eyebrow">Security</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:32px"><div><h1 class="page-title">Admin Users</h1><p class="page-sub" style="margin-bottom:0">Manage who has admin access</p></div><button class="btn btn-primary" id="btnNewAdmin">+ New Admin</button></div>' +
      '<div class="card" style="padding:0;overflow:hidden"><div id="adminList"><div class="loading">Loading...</div></div></div>';
    document.getElementById('btnNewAdmin').onclick = function(){ App.showNewAdminModal(); };
    App.loadAdmins();
  };

  App.loadAdmins = async function(){
    var el = document.getElementById('adminList');
    el.innerHTML = '<div class="loading">Loading...</div>';
    var r = await fetch('/api/admin/admins');
    var d = await r.json();
    if (!d.ok) { el.innerHTML = '<div class="loading" style="color:#ff9592">' + esc(d.error) + '</div>'; return; }
    if (!d.admins.length) { el.innerHTML = '<div class="loading">No admins yet</div>'; return; }
    el.innerHTML = '<div class="table-wrap"><table><thead><tr><th>Admin</th><th>Role</th><th>Status</th><th>Joined</th><th style="text-align:right">Actions</th></tr></thead><tbody>' +
      d.admins.map(function(a){
        var isMe = a.id === App.user.id;
        return '<tr><td><div style="font-weight:600">' + esc(a.name || '-') + (isMe ? ' <span style="font-size:11px;color:#9281f7">(you)</span>' : '') + '</div><div style="font-size:11px;color:#a1a4a5;font-family:var(--mono)">' + esc(a.email) + '</div></td>' +
          '<td><span class="badge badge-violet">' + esc(a.role) + '</span></td>' +
          '<td><span class="badge badge-' + a.status + '">' + a.status + '</span></td>' +
          '<td style="font-family:var(--mono);font-size:11px;color:#a1a4a5">' + timeAgo(a.created_at) + '</td>' +
          '<td style="text-align:right">' + (isMe ? '<span style="font-size:11px;color:#a1a4a5;font-family:var(--mono)">—</span>' : '<button class="btn btn-sm btn-danger" onclick="AdminApp.demoteAdmin(' + a.id + ',\'' + esc(a.email) + '\')">Demote</button>') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  };

  App.showNewAdminModal = function(){
    var m = document.createElement('div');
    m.id = 'modalOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
    m.innerHTML = '<div style="background:#000;border:1px solid #292d30;border-radius:16px;padding:32px;max-width:480px;width:100%">' +
      '<div class="eyebrow">Create</div>' +
      '<h3 style="font-family:var(--serif);font-weight:400;font-size:28px;letter-spacing:-.04em;margin-bottom:24px;color:#fff">New Admin</h3>' +
      '<div style="margin-bottom:16px"><label style="font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#a1a4a5;display:block;margin-bottom:8px">Name</label><input class="input" id="aName" placeholder="Full name"></div>' +
      '<div style="margin-bottom:24px"><label style="font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#a1a4a5;display:block;margin-bottom:8px">Email</label><input class="input" id="aEmail" type="email" placeholder="admin@example.com"></div>' +
      '<div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn" id="aCancel">Cancel</button><button class="btn btn-primary" id="aCreate">Create Admin</button></div>' +
    '</div>';
    document.body.appendChild(m);
    document.getElementById('aCancel').onclick = function(){ m.remove(); };
    document.getElementById('aCreate').onclick = async function(){
      var name = document.getElementById('aName').value.trim();
      var email = document.getElementById('aEmail').value.trim();
      if (!name || !email) { toast('Name and email required','error'); return; }
      var btn = this;
      btn.disabled = true; btn.textContent = 'Creating...';
      var r = await fetch('/api/admin/admins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name, email: email }) });
      var d = await r.json();
      if (!d.ok) { toast(d.error,'error'); btn.disabled = false; btn.textContent = 'Create Admin'; return; }
      m.remove();
      if (d.promoted) { toast('User promoted to admin','success'); App.loadAdmins(); }
      else {
        alert('Admin created!\n\nEmail: ' + d.admin.email + '\nPassword: ' + d.admin.temp_password);
        App.loadAdmins();
      }
    };
    setTimeout(function(){ document.getElementById('aName').focus(); }, 100);
  };

  App.demoteAdmin = async function(id, email){
    if (!confirm('Demote ' + email + ' to regular user?\n\nTheir sessions will be revoked.')) return;
    var r = await fetch('/api/admin/admins?id=' + id, { method: 'DELETE' });
    var d = await r.json();
    if (d.ok) { toast('Admin demoted','success'); App.loadAdmins(); }
    else toast(d.error,'error');
  };

  App.pageAdminSessions = async function(main){
    main.innerHTML =
      '<div class="eyebrow">Security</div>' +
      '<h1 class="page-title">Active Admin Sessions</h1>' +
      '<p class="page-sub">Devices currently signed in as admin</p>' +
      '<div class="card" style="padding:0;overflow:hidden"><div id="sessionsList"><div class="loading">Loading...</div></div></div>';
    var el = document.getElementById('sessionsList');
    var r = await fetch('/api/admin/admin-sessions');
    var d = await r.json();
    if (!d.ok) { el.innerHTML = '<div class="loading" style="color:#ff9592">' + esc(d.error) + '</div>'; return; }
    if (!d.sessions.length) { el.innerHTML = '<div class="loading">No active sessions</div>'; return; }
    function deviceIcon(ua){
      if (!ua) return 'Unknown';
      var u = ua.toLowerCase();
      if (/ipad|tablet/.test(u)) return 'Tablet';
      if (/mobile|iphone|android/.test(u)) return 'Mobile';
      return 'Desktop';
    }
    function browser(ua){
      if (!ua) return 'Unknown';
      if (/edg\//i.test(ua)) return 'Edge';
      if (/chrome\//i.test(ua)) return 'Chrome';
      if (/firefox\//i.test(ua)) return 'Firefox';
      if (/safari\//i.test(ua)) return 'Safari';
      return 'Browser';
    }
    el.innerHTML = '<div class="table-wrap"><table><thead><tr><th>Admin</th><th>Device</th><th>IP</th><th>Last Active</th><th style="text-align:right">Actions</th></tr></thead><tbody>' +
      d.sessions.map(function(s){
        var isMe = s.token_prefix + '' === '' ? false : false;
        return '<tr><td><div style="font-weight:600">' + esc(s.name || '-') + '</div><div style="font-size:11px;color:#a1a4a5;font-family:var(--mono)">' + esc(s.email) + '</div></td>' +
          '<td><div style="font-size:13px">' + esc(browser(s.user_agent)) + ' on ' + esc(deviceIcon(s.user_agent)) + '</div></td>' +
          '<td style="font-family:var(--mono);font-size:11px;color:#a1a4a5">' + esc(s.ip) + '</td>' +
          '<td style="font-family:var(--mono);font-size:11px;color:#a1a4a5">' + timeAgo(s.last_active) + '</td>' +
          '<td style="text-align:right"><button class="btn btn-sm btn-danger" onclick="AdminApp.revokeAdminSession(\'' + s.token_prefix + '\')">Revoke</button></td></tr>';
      }).join('') + '</tbody></table></div>';
  };

  App.revokeAdminSession = async function(prefix){
    if (!confirm('Revoke this admin session?')) return;
    var r = await fetch('/api/admin/admin-sessions?prefix=' + encodeURIComponent(prefix), { method: 'DELETE' });
    var d = await r.json();
    if (d.ok) { toast('Session revoked','success'); App.render('admin-sessions'); }
    else toast(d.error,'error');
  };

  App.pageSecurityLog = async function(main){
    main.innerHTML =
      '<div class="eyebrow">Security</div>' +
      '<h1 class="page-title">Security Log</h1>' +
      '<p class="page-sub">All login attempts — success and failed</p>' +
      '<div class="card" style="margin-bottom:16px;padding:16px;display:flex;gap:10px">' +
        '<button class="btn btn-sm" id="filterAll">All</button>' +
        '<button class="btn btn-sm" id="filterSuccess">Success</button>' +
        '<button class="btn btn-sm" id="filterFailed">Failed</button>' +
      '</div>' +
      '<div class="card" style="padding:0;overflow:hidden"><div id="secLogList"><div class="loading">Loading...</div></div></div>';
    document.getElementById('filterAll').onclick = function(){ App.loadSecurityLog('all'); };
    document.getElementById('filterSuccess').onclick = function(){ App.loadSecurityLog('success'); };
    document.getElementById('filterFailed').onclick = function(){ App.loadSecurityLog('failed'); };
    App.loadSecurityLog('all');
  };

  App.loadSecurityLog = async function(filter){
    var el = document.getElementById('secLogList');
    el.innerHTML = '<div class="loading">Loading...</div>';
    var r = await fetch('/api/admin/security?filter=' + filter);
    var d = await r.json();
    if (!d.ok) { el.innerHTML = '<div class="loading" style="color:#ff9592">' + esc(d.error) + '</div>'; return; }
    if (!d.logs.length) { el.innerHTML = '<div class="loading">No entries</div>'; return; }
    el.innerHTML = '<div class="table-wrap"><table><thead><tr><th>Time</th><th>Email</th><th>Status</th><th>Reason</th><th>IP</th></tr></thead><tbody>' +
      d.logs.map(function(l){
        var isSuccess = l.status === 'success';
        return '<tr><td style="font-family:var(--mono);font-size:11px;color:#a1a4a5;white-space:nowrap">' + timeAgo(l.created_at) + '</td>' +
          '<td style="font-family:var(--mono);font-size:12px">' + esc(l.email || '-') + '</td>' +
          '<td><span class="badge badge-' + (isSuccess ? 'active' : 'suspended') + '">' + l.status + '</span></td>' +
          '<td style="font-size:12px;color:#a1a4a5;font-family:var(--mono)">' + esc(l.reason || '-') + '</td>' +
          '<td style="font-family:var(--mono);font-size:11px;color:#a1a4a5">' + esc(l.ip || '-') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  };

  document.addEventListener('DOMContentLoaded', function(){ App.init(); });
})();

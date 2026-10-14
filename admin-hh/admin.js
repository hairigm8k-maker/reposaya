(function(){
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
        if (!d.ok || !d.authenticated) { document.getElementById('main').innerHTML = '<div class="loading">Not logged in. <a href="/" style="color:#2d5bff">Sign in</a></div>'; return; }
        if (d.user.role !== 'admin' && d.user.role !== 'superadmin') { document.getElementById('main').innerHTML = '<div class="loading">Access denied.</div>'; return; }
        this.user = d.user;
        this.bindMenu();
        this.render('overview');
      } catch(e) { document.getElementById('main').innerHTML = '<div class="loading" style="color:#ef4444">Error: ' + esc(e.message) + '</div>'; }
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
      document.getElementById('navLogout').onclick = function(){ if (confirm('Log out?')) fetch('/api/auth/logout',{method:'POST'}).finally(function(){ window.location.href='/'; }); };
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
      } catch(e){ main.innerHTML = '<div class="loading" style="color:#ef4444">Error: ' + esc(e.message) + '</div>'; }
    }
  };
  window.AdminApp = App;
  App.pageOverview = async function(main){
    var r = await fetch('/api/admin/stats');
    var d = await r.json();
    if (!d.ok) throw new Error(d.error);
    var s = d.stats;
    main.innerHTML =
      '<div class="page-head"><h1>Dashboard</h1><p>Welcome back, ' + esc(this.user.name || 'Admin') + '</p></div>' +
      '<div class="hero"><h2>HairiHosting Admin Console</h2><p>Manage users, sites, tokens and system activity</p></div>' +
      '<div class="grid-4">' +
        '<div class="card"><div class="card-title">Users</div><div class="card-value">' + s.users + '</div><div class="card-meta">' + s.active_users + ' active</div></div>' +
        '<div class="card"><div class="card-title">Sites</div><div class="card-value">' + s.sites + '</div><div class="card-meta">' + s.live_sites + ' live</div></div>' +
        '<div class="card"><div class="card-title">Files</div><div class="card-value">' + s.files + '</div><div class="card-meta">' + fmtBytes(s.storage_bytes) + '</div></div>' +
        '<div class="card"><div class="card-title">Visitors</div><div class="card-value">' + s.visitors + '</div><div class="card-meta">All time</div></div>' +
      '</div>' +
      '<div class="grid-2">' +
        '<div class="card"><div class="card-title">Recent Users</div>' +
          (d.recent_users.length ? '<table><tbody>' + d.recent_users.map(function(u){ return '<tr><td><div style="font-weight:600">' + esc(u.name || '-') + '</div><div style="font-size:11px;color:#6b7280;font-family:monospace">' + esc(u.email) + '</div></td><td style="text-align:right;font-size:11px;color:#9ca3af">' + timeAgo(u.created_at) + '</td></tr>'; }).join('') + '</tbody></table>' : '<p style="color:#9ca3af;text-align:center;padding:20px">No users</p>') +
        '</div>' +
        '<div class="card"><div class="card-title">Recent Sites</div>' +
          (d.recent_sites.length ? '<table><tbody>' + d.recent_sites.map(function(x){ return '<tr><td><div style="font-weight:600">' + esc(x.name) + '</div><div style="font-size:11px;color:#6b7280;font-family:monospace">' + esc(x.subdomain) + '</div></td><td style="text-align:right"><span class="badge badge-' + (x.status === 'live' ? 'live' : 'draft') + '">' + x.status + '</span></td></tr>'; }).join('') + '</tbody></table>' : '<p style="color:#9ca3af;text-align:center;padding:20px">No sites</p>') +
        '</div>' +
      '</div>';
  };

  App.pageUsers = async function(main){
    main.innerHTML =
      '<div class="page-head" style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap"><div><h1>Users</h1><p>Manage all HairiHosting accounts</p></div><button class="btn btn-primary" id="btnNewUser">+ New User</button></div>' +
      '<div class="card" style="margin-bottom:16px"><input class="input" id="userSearch" placeholder="Search by name, email or username..."></div>' +
      '<div class="card"><div id="userList"><div class="loading">Loading...</div></div></div>';
    document.getElementById('btnNewUser').onclick = function(){ App.showNewUserModal(); };
    var searchEl = document.getElementById('userSearch');
    var timer = null;
    searchEl.oninput = function(){ clearTimeout(timer); timer = setTimeout(function(){ App.loadUsers(searchEl.value); }, 300); };
    App.loadUsers('');
  };

  App.loadUsers = async function(q){
    var el = document.getElementById('userList');
    el.innerHTML = '<div class="loading">Loading...</div>';
    var r = await fetch('/api/admin/users?q=' + encodeURIComponent(q || ''));
    var d = await r.json();
    if (!d.ok) { el.innerHTML = '<div class="loading" style="color:#ef4444">' + esc(d.error) + '</div>'; return; }
    if (!d.users.length) { el.innerHTML = '<div class="loading">No users found</div>'; return; }
    el.innerHTML = '<table><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Sites</th><th>Joined</th><th style="text-align:right">Actions</th></tr></thead><tbody>' +
      d.users.map(function(u){
        var badge = u.status === 'active' ? 'active' : 'suspended';
        return '<tr><td><div style="font-weight:600">' + esc(u.name || '-') + '</div><div style="font-size:11px;color:#6b7280;font-family:monospace">' + esc(u.email) + '</div>' + (u.username ? '<div style="font-size:10px;color:#9ca3af">@' + esc(u.username) + '</div>' : '') + '</td>' +
          '<td><span class="badge" style="background:' + (u.role === 'admin' ? '#dbeafe' : '#f3f4f6') + ';color:' + (u.role === 'admin' ? '#1e40af' : '#374151') + '">' + u.role + '</span></td>' +
          '<td><span class="badge badge-' + badge + '">' + u.status + '</span></td>' +
          '<td>' + u.site_count + '</td>' +
          '<td style="font-size:11px;color:#9ca3af">' + timeAgo(u.created_at) + '</td>' +
          '<td style="text-align:right"><button class="btn btn-sm ' + (u.status === 'active' ? 'btn-ghost' : 'btn-success') + '" onclick="AdminApp.toggleUser(' + u.id + ',\'' + u.status + '\',\'' + esc(u.email) + '\')">' + (u.status === 'active' ? 'Suspend' : 'Activate') + '</button> ' +
          '<button class="btn btn-sm btn-danger" onclick="AdminApp.deleteUser(' + u.id + ',\'' + esc(u.email) + '\')">Delete</button></td></tr>';
      }).join('') + '</tbody></table>';
  };

  App.showNewUserModal = function(){
    var m = document.createElement('div');
    m.id = 'modalOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
    m.innerHTML = '<div style="background:#fff;border-radius:12px;padding:24px;max-width:440px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.3)">' +
      '<h3 style="font-size:18px;font-weight:700;margin-bottom:16px;color:#1a2456">Create New User</h3>' +
      '<div style="margin-bottom:12px"><label style="font-size:12px;font-weight:600;color:#6b7280;display:block;margin-bottom:6px">Name</label><input class="input" id="nName" placeholder="Full name"></div>' +
      '<div style="margin-bottom:12px"><label style="font-size:12px;font-weight:600;color:#6b7280;display:block;margin-bottom:6px">Email</label><input class="input" id="nEmail" type="email" placeholder="user@example.com"></div>' +
      '<div style="margin-bottom:18px"><label style="font-size:12px;font-weight:600;color:#6b7280;display:block;margin-bottom:6px">Role</label><select class="input" id="nRole"><option value="user">User</option><option value="admin">Admin</option></select></div>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn btn-ghost" id="nCancel">Cancel</button><button class="btn btn-primary" id="nCreate">Create User</button></div>' +
    '</div>';
    document.body.appendChild(m);
    document.getElementById('nCancel').onclick = function(){ m.remove(); };
    document.getElementById('nCreate').onclick = function(){ App.createUser(); };
  };

  App.createUser = async function(){
    var name = document.getElementById('nName').value.trim();
    var email = document.getElementById('nEmail').value.trim();
    var role = document.getElementById('nRole').value;
    if (!name || !email) { alert('Name and email required'); return; }
    var btn = document.getElementById('nCreate');
    btn.disabled = true; btn.textContent = 'Creating...';
    try {
      var r = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name, email: email, role: role }) });
      var d = await r.json();
      if (!d.ok) { alert(d.error); btn.disabled = false; btn.textContent = 'Create User'; return; }
      document.getElementById('modalOverlay').remove();
      App.showTempPassword(d.user.email, d.user.temp_password);
    } catch(e) { alert('Error: ' + e.message); btn.disabled = false; btn.textContent = 'Create User'; }
  };

  App.showTempPassword = function(email, pass){
    var m = document.createElement('div');
    m.id = 'modalOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
    m.innerHTML = '<div style="background:#fff;border-radius:12px;padding:24px;max-width:440px;width:100%">' +
      '<h3 style="font-size:18px;font-weight:700;margin-bottom:8px;color:#065f46">User Created</h3>' +
      '<p style="font-size:13px;color:#6b7280;margin-bottom:16px">Save this temporary password. User can change after login.</p>' +
      '<div style="background:#f5f7fb;border-radius:8px;padding:14px;margin-bottom:16px"><div style="font-size:11px;color:#6b7280;margin-bottom:4px">Email</div><div style="font-family:monospace;font-size:13px;margin-bottom:12px">' + esc(email) + '</div><div style="font-size:11px;color:#6b7280;margin-bottom:4px">Temp Password</div><div style="font-family:monospace;font-size:14px;font-weight:700;color:#1a2456" id="tpText">' + esc(pass) + '</div></div>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn btn-ghost" onclick="navigator.clipboard.writeText(\'' + esc(pass) + '\').then(function(){alert(\'Copied!\')})">Copy Password</button><button class="btn btn-primary" id="tpDone">Done</button></div>' +
    '</div>';
    document.body.appendChild(m);
    document.getElementById('tpDone').onclick = function(){ m.remove(); App.loadUsers(''); };
  };

  App.toggleUser = async function(id, status, email){
    var action = status === 'active' ? 'suspend' : 'activate';
    if (!confirm(action.toUpperCase() + ' user ' + email + '?')) return;
    var newStatus = status === 'active' ? 'suspended' : 'active';
    var r = await fetch('/api/admin/users?id=' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    var d = await r.json();
    if (d.ok) App.loadUsers(document.getElementById('userSearch').value);
    else alert(d.error);
  };

  App.deleteUser = async function(id, email){
    if (!confirm('DELETE user ' + email + '?\n\nThis will permanently delete ALL data — sites, files, analytics, sessions. Cannot be undone.')) return;
    if (!confirm('Final confirm — really delete ' + email + '?')) return;
    var r = await fetch('/api/admin/users?id=' + id, { method: 'DELETE' });
    var d = await r.json();
    if (d.ok) App.loadUsers(document.getElementById('userSearch').value);
    else alert(d.error);
  };

  App.pageTokens = async function(main){
    main.innerHTML =
      '<div class="page-head" style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap"><div><h1>Login Tokens</h1><p>Single-use tokens for user login</p></div><button class="btn btn-primary" id="btnNewToken">+ Generate Token</button></div>' +
      '<div class="card"><div id="tokenList"><div class="loading">Loading...</div></div></div>';
    document.getElementById('btnNewToken').onclick = function(){ App.showNewTokenModal(); };
    App.loadTokens();
  };

  App.loadTokens = async function(){
    var el = document.getElementById('tokenList');
    el.innerHTML = '<div class="loading">Loading...</div>';
    var r = await fetch('/api/admin/tokens');
    var d = await r.json();
    if (!d.ok) { el.innerHTML = '<div class="loading" style="color:#ef4444">' + esc(d.error) + '</div>'; return; }
    if (!d.tokens.length) { el.innerHTML = '<div class="loading">No tokens yet</div>'; return; }
    var now = Date.now();
    el.innerHTML = '<table><thead><tr><th>User</th><th>Label</th><th>Prefix</th><th>Status</th><th>Expires</th><th style="text-align:right">Actions</th></tr></thead><tbody>' +
      d.tokens.map(function(t){
        var status = t.used_at ? 'USED' : (new Date(t.expires_at).getTime() < now ? 'EXPIRED' : 'ACTIVE');
        var badgeCls = status === 'ACTIVE' ? 'active' : (status === 'USED' ? 'draft' : 'suspended');
        return '<tr><td><div style="font-weight:600">' + esc(t.name || '-') + '</div><div style="font-size:11px;color:#6b7280;font-family:monospace">' + esc(t.email) + '</div></td>' +
          '<td>' + esc(t.label || '-') + '</td>' +
          '<td style="font-family:monospace;font-size:12px;color:#9ca3af">' + esc(t.token_prefix) + '...</td>' +
          '<td><span class="badge badge-' + badgeCls + '">' + status + '</span></td>' +
          '<td style="font-size:11px;color:#9ca3af">' + timeAgo(t.expires_at) + '</td>' +
          '<td style="text-align:right"><button class="btn btn-sm btn-danger" onclick="AdminApp.revokeToken(' + t.id + ')">Revoke</button></td></tr>';
      }).join('') + '</tbody></table>';
  };

  App.showNewTokenModal = async function(){
    var r = await fetch('/api/admin/users');
    var d = await r.json();
    if (!d.ok) { alert(d.error); return; }
    var opts = d.users.map(function(u){ return '<option value="' + u.id + '">' + esc(u.name || u.email) + ' (' + esc(u.email) + ')</option>'; }).join('');
    var m = document.createElement('div');
    m.id = 'modalOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
    m.innerHTML = '<div style="background:#fff;border-radius:12px;padding:24px;max-width:440px;width:100%">' +
      '<h3 style="font-size:18px;font-weight:700;margin-bottom:16px;color:#1a2456">Generate Login Token</h3>' +
      '<div style="margin-bottom:12px"><label style="font-size:12px;font-weight:600;color:#6b7280;display:block;margin-bottom:6px">User</label><select class="input" id="tkUser">' + opts + '</select></div>' +
      '<div style="margin-bottom:12px"><label style="font-size:12px;font-weight:600;color:#6b7280;display:block;margin-bottom:6px">Label (optional)</label><input class="input" id="tkLabel" placeholder="e.g. First login"></div>' +
      '<div style="margin-bottom:18px"><label style="font-size:12px;font-weight:600;color:#6b7280;display:block;margin-bottom:6px">Expires in</label><select class="input" id="tkExp"><option value="1">1 day</option><option value="7" selected>7 days</option><option value="30">30 days</option></select></div>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn btn-ghost" id="tkCancel">Cancel</button><button class="btn btn-primary" id="tkGen">Generate</button></div>' +
    '</div>';
    document.body.appendChild(m);
    document.getElementById('tkCancel').onclick = function(){ m.remove(); };
    document.getElementById('tkGen').onclick = function(){ App.createToken(); };
  };

  App.createToken = async function(){
    var uid = document.getElementById('tkUser').value;
    var label = document.getElementById('tkLabel').value.trim();
    var exp = document.getElementById('tkExp').value;
    if (!uid) { alert('Select user'); return; }
    var btn = document.getElementById('tkGen');
    btn.disabled = true; btn.textContent = 'Generating...';
    try {
      var r = await fetch('/api/admin/tokens', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: parseInt(uid), label: label, expires_days: parseInt(exp) }) });
      var d = await r.json();
      if (!d.ok) { alert(d.error); btn.disabled = false; btn.textContent = 'Generate'; return; }
      document.getElementById('modalOverlay').remove();
      App.showTokenResult(d.token, d.expires_at);
    } catch(e) { alert('Error: ' + e.message); btn.disabled = false; btn.textContent = 'Generate'; }
  };

  App.showTokenResult = function(token, expiresAt){
    var m = document.createElement('div');
    m.id = 'modalOverlay';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
    m.innerHTML = '<div style="background:#fff;border-radius:12px;padding:24px;max-width:520px;width:100%">' +
      '<h3 style="font-size:18px;font-weight:700;margin-bottom:8px;color:#065f46">Token Generated</h3>' +
      '<p style="font-size:13px;color:#6b7280;margin-bottom:16px">Copy now. Only shown once. User pastes this on the login page.</p>' +
      '<div style="background:#f5f7fb;border-radius:8px;padding:14px;margin-bottom:12px;word-break:break-all;font-family:monospace;font-size:13px;font-weight:700;color:#1a2456">' + esc(token) + '</div>' +
      '<p style="font-size:11px;color:#9ca3af;margin-bottom:16px">Expires: ' + new Date(expiresAt).toLocaleString() + '</p>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn btn-ghost" id="tkCopy">Copy</button><button class="btn btn-primary" id="tkDone">Done</button></div>' +
    '</div>';
    document.body.appendChild(m);
    document.getElementById('tkCopy').onclick = function(){ navigator.clipboard.writeText(token).then(function(){ alert('Copied!'); }); };
    document.getElementById('tkDone').onclick = function(){ m.remove(); App.loadTokens(); };
  };

  App.revokeToken = async function(id){
    if (!confirm('Revoke this token?')) return;
    var r = await fetch('/api/admin/tokens?id=' + id, { method: 'DELETE' });
    var d = await r.json();
    if (d.ok) App.loadTokens();
    else alert(d.error);
  };

  App.pageSites = async function(main){
    main.innerHTML =
      '<div class="page-head"><h1>Sites</h1><p>All websites across all users</p></div>' +
      '<div class="card" style="margin-bottom:16px"><input class="input" id="siteSearch" placeholder="Search name, subdomain or owner..."></div>' +
      '<div class="card"><div id="siteList"><div class="loading">Loading...</div></div></div>';
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
    if (!d.ok) { el.innerHTML = '<div class="loading" style="color:#ef4444">' + esc(d.error) + '</div>'; return; }
    if (!d.sites.length) { el.innerHTML = '<div class="loading">No sites found</div>'; return; }
    el.innerHTML = '<table><thead><tr><th>Site</th><th>Owner</th><th>Status</th><th>Updated</th><th style="text-align:right">Actions</th></tr></thead><tbody>' +
      d.sites.map(function(x){
        return '<tr><td><div style="font-weight:600">' + esc(x.name) + '</div><div style="font-size:11px;color:#6b7280;font-family:monospace">' + esc(x.subdomain) + '.hairiamri.buzz</div></td>' +
          '<td><div style="font-size:12px">' + esc(x.owner_name || '-') + '</div><div style="font-size:11px;color:#6b7280;font-family:monospace">' + esc(x.owner_email) + '</div></td>' +
          '<td><span class="badge badge-' + (x.status === 'live' ? 'live' : 'draft') + '">' + x.status + '</span></td>' +
          '<td style="font-size:11px;color:#9ca3af">' + timeAgo(x.updated_at) + '</td>' +
          '<td style="text-align:right"><button class="btn btn-sm btn-danger" onclick="AdminApp.deleteSite(' + x.id + ',\'' + esc(x.subdomain) + '\')">Delete</button></td></tr>';
      }).join('') + '</tbody></table>';
  };

  App.deleteSite = async function(id, sub){
    if (!confirm('DELETE site ' + sub + '?\n\nThis will remove the site and all its files. Cannot be undone.')) return;
    var r = await fetch('/api/admin/sites?id=' + id, { method: 'DELETE' });
    var d = await r.json();
    if (d.ok) App.loadSites(document.getElementById('siteSearch').value);
    else alert(d.error);
  };

  App.pageNotify = async function(main){
    main.innerHTML =
      '<div class="page-head"><h1>Broadcast</h1><p>Send a notification to all users or a single user</p></div>' +
      '<div class="card" style="max-width:640px">' +
        '<div style="margin-bottom:14px"><label style="font-size:12px;font-weight:600;color:#6b7280;display:block;margin-bottom:6px">Target</label><select class="input" id="nTarget"><option value="all">All Users</option></select></div>' +
        '<div style="margin-bottom:14px"><label style="font-size:12px;font-weight:600;color:#6b7280;display:block;margin-bottom:6px">Title</label><input class="input" id="nTitle" placeholder="Notification title" maxlength="120"></div>' +
        '<div style="margin-bottom:14px"><label style="font-size:12px;font-weight:600;color:#6b7280;display:block;margin-bottom:6px">Body (HTML allowed)</label><textarea class="input" id="nBody" style="min-height:140px;font-family:monospace;font-size:12.5px;resize:vertical" placeholder="<p>Message...</p>"></textarea></div>' +
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
    if (!title || !body) { alert('Title and body required'); return; }
    var payload = { title: title, body: body, target: 'all' };
    if (target.indexOf('user:') === 0) {
      payload.target = 'user';
      payload.user_id = parseInt(target.slice(5));
    }
    var btn = document.getElementById('btnSend');
    btn.disabled = true; btn.textContent = 'Sending...';
    try {
      var r = await fetch('/api/admin/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      var d = await r.json();
      if (d.ok) { alert('Sent to ' + d.sent + ' user(s)'); document.getElementById('nTitle').value = ''; document.getElementById('nBody').value = ''; }
      else alert(d.error);
    } catch(e) { alert('Error: ' + e.message); }
    btn.disabled = false; btn.textContent = 'Send Notification';
  };

  App.pageLogs = async function(main){
    main.innerHTML = '<div class="page-head"><h1>Audit Log</h1><p>Recent admin actions</p></div><div class="card"><div id="logList"><div class="loading">Loading...</div></div></div>';
    var el = document.getElementById('logList');
    var r = await fetch('/api/admin/logs');
    var d = await r.json();
    if (!d.ok) { el.innerHTML = '<div class="loading" style="color:#ef4444">' + esc(d.error) + '</div>'; return; }
    if (!d.logs.length) { el.innerHTML = '<div class="loading">No logs yet</div>'; return; }
    el.innerHTML = '<table><thead><tr><th>Time</th><th>Admin</th><th>Action</th><th>Target</th><th>Details</th></tr></thead><tbody>' +
      d.logs.map(function(l){
        return '<tr><td style="font-size:11px;color:#9ca3af;white-space:nowrap">' + timeAgo(l.created_at) + '</td>' +
          '<td style="font-size:12px">' + esc(l.admin_name || l.admin_email || '-') + '</td>' +
          '<td><span class="badge" style="background:#eff6ff;color:#1e40af">' + esc(l.action) + '</span></td>' +
          '<td style="font-size:12px;color:#6b7280">' + esc(l.target_type || '-') + (l.target_id ? ' #' + l.target_id : '') + '</td>' +
          '<td style="font-size:12px">' + esc(l.details || '-') + '</td></tr>';
      }).join('') + '</tbody></table>';
  };

  document.addEventListener('DOMContentLoaded', function(){ App.init(); });
})();

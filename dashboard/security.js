(function(){
  if (typeof App === 'undefined') { console.error('App not found'); return; }

  function passwordStrength(p) {
    if (!p) return { score: 0, label: '', color: '' };
    var score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    if (score <= 2) return { score: 1, label: 'Weak', color: '#f87171' };
    if (score <= 3) return { score: 2, label: 'Medium', color: '#fbbf24' };
    return { score: 3, label: 'Strong', color: '#4ade80' };
  }

  App.pageSecurity = async function(){
    var c = document.getElementById('content');
    c.innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
    try {
      var r = await fetch('/api/auth/session');
      var d = await r.json();
      if (!d.ok || !d.authenticated) throw new Error('Not logged in');
      var u = d.user;

      var sessionR = await fetch('/api/auth/sessions');
      var sessionD = await sessionR.json();
      var sessions = (sessionD.ok && sessionD.sessions) ? sessionD.sessions : [];

      function deviceIcon(type) {
        if (type === 'Mobile') return '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>';
        if (type === 'Tablet') return '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>';
        return '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>';
      }

      function timeAgo(s) {
        if (!s) return 'Just now';
        try {
          var t = new Date(String(s).replace(' ', 'T') + 'Z').getTime();
          var diff = Date.now() - t;
          if (diff < 60000) return 'Just now';
          var m = Math.floor(diff / 60000);
          if (m < 60) return m + 'm ago';
          var h = Math.floor(m / 60);
          if (h < 24) return h + 'h ago';
          var dd = Math.floor(h / 24);
          return dd + 'd ago';
        } catch (e) { return s; }
      }

      var sessionsHtml = sessions.map(function(s) {
        var badge = s.is_current ? '<span class="badge badge-live" style="font-size:10px">Current</span>' : '';
        var btn = s.is_current ? '' : '<button class="btn btn-danger btn-sm" onclick="App.revokeSession(\'' + s.token_prefix.replace('...','') + '\')">Revoke</button>';
        return '<div style="display:flex;gap:14px;align-items:center;padding:14px 0;border-bottom:1px solid var(--border)">' +
          '<svg viewBox="0 0 24 24" style="width:28px;height:28px;stroke:var(--copper);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0">' + deviceIcon(s.device) + '</svg>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-size:14px;color:var(--white);font-weight:500;margin-bottom:2px">' + escHtml(s.browser) + ' on ' + escHtml(s.os) + ' ' + badge + '</div>' +
            '<div style="font-family:var(--mono);font-size:11px;color:var(--ash)">' + escHtml(s.ip) + ' · ' + timeAgo(s.last_active) + '</div>' +
          '</div>' + btn + '</div>';
      }).join('');

      if (!sessions.length) sessionsHtml = '<p style="color:var(--ash);font-size:13px;padding:16px 0">No active sessions</p>';

      c.innerHTML =
        '<div class="page-head"><div class="eyebrow">Account</div><h1 class="page-title">Security</h1><p class="page-sub">Manage your account security</p></div>' +
        '<div style="display:grid;gap:20px;max-width:720px">' +

        '<div class="card"><div class="card-title" style="margin-bottom:20px;font-size:14px;color:var(--white)">Change Password</div>' +
          '<div class="field"><label class="label">Current Password</label><input type="password" class="input" id="secCur" autocomplete="current-password"></div>' +
          '<div class="field"><label class="label">New Password</label><input type="password" class="input" id="secNew" autocomplete="new-password">' +
            '<div id="secStrength" style="margin-top:8px;font-size:12px;display:none"><div style="height:4px;background:var(--panel);border-radius:2px;overflow:hidden;margin-bottom:4px"><div id="secBar" style="height:100%;width:0;transition:all .2s"></div></div><span id="secLabel"></span></div></div>' +
          '<div class="field"><label class="label">Confirm New Password</label><input type="password" class="input" id="secConfirm" autocomplete="new-password"></div>' +
          '<div class="card-meta" style="margin-bottom:16px">Min 8 characters, must contain letters and numbers. All other devices will be logged out.</div>' +
          '<button class="btn btn-primary" id="secSavePw" style="width:100%">Update Password</button>' +
        '</div>' +

        '<div class="card"><div class="card-title" style="margin-bottom:8px;font-size:14px;color:var(--white)">Active Sessions</div>' +
          '<p style="color:var(--fog);font-size:12px;margin-bottom:16px">Devices currently signed in to your account</p>' +
          '<div>' + sessionsHtml + '</div>' +
          '<button class="btn btn-ghost btn-sm" id="secLogoutAll" style="margin-top:16px">Logout All Other Devices</button>' +
        '</div>' +

        '<div class="card" style="border:1px solid rgba(220,38,38,.4);background:linear-gradient(180deg,rgba(220,38,38,.05) 0%,var(--card) 100%)">' +
          '<div class="card-title" style="margin-bottom:8px;font-size:14px;color:#f87171">Danger Zone</div>' +
          '<p style="color:var(--fog);font-size:13px;line-height:1.6;margin-bottom:16px">Permanently delete your account and all associated data — sites, files, analytics, domains. This action cannot be undone.</p>' +
          '<button class="btn btn-danger" id="secDeleteBtn">Delete Account</button>' +
        '</div>' +

        '</div>';

      // Password strength
      var newEl = document.getElementById('secNew');
      var strengthEl = document.getElementById('secStrength');
      var barEl = document.getElementById('secBar');
      var labelEl = document.getElementById('secLabel');
      newEl.addEventListener('input', function(){
        var s = passwordStrength(newEl.value);
        if (!newEl.value) { strengthEl.style.display = 'none'; return; }
        strengthEl.style.display = 'block';
        barEl.style.width = (s.score * 33.3) + '%';
        barEl.style.background = s.color;
        labelEl.textContent = s.label;
        labelEl.style.color = s.color;
      });

      // Change password
      document.getElementById('secSavePw').onclick = function(){ App.changePassword(); };

      // Logout all
      document.getElementById('secLogoutAll').onclick = function(){ App.logoutAllDevices(); };

      // Delete account
      document.getElementById('secDeleteBtn').onclick = function(){ App.deleteAccount(); };
    } catch (e) {
      c.innerHTML = '<div class="card" style="text-align:center;padding:40px"><p style="color:#f87171">Error: ' + escHtml(e.message) + '</p></div>';
    }
  };

  App.changePassword = async function(){
    var cur = document.getElementById('secCur').value;
    var nw = document.getElementById('secNew').value;
    var cf = document.getElementById('secConfirm').value;
    if (!cur || !nw || !cf) { toast('All fields required', 'error'); return; }
    if (nw !== cf) { toast('Passwords do not match', 'error'); return; }
    if (nw.length < 8) { toast('Min 8 characters', 'error'); return; }
    var btn = document.getElementById('secSavePw');
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
    try {
      var r = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: cur, new_password: nw, confirm_password: cf })
      });
      var d = await r.json();
      if (d.ok) {
        toast('Password updated', 'success');
        document.getElementById('secCur').value = '';
        document.getElementById('secNew').value = '';
        document.getElementById('secConfirm').value = '';
        document.getElementById('secStrength').style.display = 'none';
        App.load('security');
      } else toast(d.error || 'Failed', 'error');
    } catch (e) { toast('Error: ' + e.message, 'error'); }
    btn.disabled = false; btn.textContent = 'Update Password';
  };

  App.revokeSession = async function(prefix){
    if (!confirm('Revoke this session? The device will be logged out.')) return;
    try {
      var r = await fetch('/api/auth/sessions?prefix=' + encodeURIComponent(prefix), { method: 'DELETE' });
      var d = await r.json();
      if (d.ok) { toast('Session revoked', 'success'); App.load('security'); }
      else toast(d.error || 'Failed', 'error');
    } catch (e) { toast('Error: ' + e.message, 'error'); }
  };

  App.logoutAllDevices = async function(){
    if (!confirm('Logout all other devices? You will stay signed in on this device.')) return;
    try {
      var r = await fetch('/api/auth/sessions?all=1', { method: 'DELETE' });
      var d = await r.json();
      if (d.ok) { toast('All other devices logged out', 'success'); App.load('security'); }
      else toast(d.error || 'Failed', 'error');
    } catch (e) { toast('Error: ' + e.message, 'error'); }
  };

  App.deleteAccount = function(){
    var email = prompt('Type your email to confirm account deletion:\n\nThis will permanently delete all your sites, files, analytics, and data. Cannot be undone.');
    if (!email) return;
    if (!confirm('FINAL WARNING: Delete account permanently?')) return;
    (async function(){
      try {
        var r = await fetch('/api/auth/delete-account', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ confirm_email: email })
        });
        var d = await r.json();
        if (d.ok) {
          toast('Account deleted', 'success');
          setTimeout(function(){ window.location.href = '/'; }, 1000);
        } else toast(d.error || 'Failed', 'error');
      } catch (e) { toast('Error: ' + e.message, 'error'); }
    })();
  };

  // Wrap App.load untuk handle 'security'
  var origLoad = App.load.bind(App);
  App.load = function(id){
    if (id === 'security') {
      document.getElementById('content').innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
      return this.pageSecurity();
    }
    return origLoad(id);
  };
})();

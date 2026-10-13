(function(){
  if (typeof App === 'undefined') return;

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
      return Math.floor(h / 24) + 'd ago';
    } catch (e) { return s; }
  }

  function card(title, sub, body, extraStyle) {
    return '<div class="card"' + (extraStyle ? ' style="' + extraStyle + '"' : '') + '>' +
      '<div style="font-family:var(--serif);font-size:20px;color:var(--white);margin-bottom:6px">' + title + '</div>' +
      '<p style="color:var(--fog);font-size:13px;margin-bottom:20px;line-height:1.6">' + sub + '</p>' +
      body +
    '</div>';
  }

  App.pageSecurity = async function(){
    var c = document.getElementById('content');
    c.innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
    try {
      var results = await Promise.all([
        fetch('/api/auth/session').then(function(r){ return r.json(); }),
        fetch('/api/auth/sessions').then(function(r){ return r.json(); }),
        fetch('/api/auth/login-history').then(function(r){ return r.json(); })
      ]);
      if (!results[0].ok || !results[0].authenticated) throw new Error('Not logged in');
      var sessions = (results[1].ok && results[1].sessions) ? results[1].sessions : [];
      var logs = (results[2].ok && results[2].logs) ? results[2].logs : [];

      var sessionsHtml = sessions.map(function(s) {
        var badge = s.is_current ? '<span class="badge badge-live" style="font-size:10px;margin-left:6px">Current</span>' : '';
        var btn = s.is_current ? '' : '<button class="btn btn-danger btn-sm" onclick="App.revokeSession(\'' + s.token_prefix.replace('...','') + '\')">Revoke</button>';
        return '<div style="display:flex;gap:14px;align-items:center;padding:14px 0;border-bottom:1px solid var(--border)">' +
          '<svg viewBox="0 0 24 24" style="width:28px;height:28px;stroke:var(--copper);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0">' + deviceIcon(s.device) + '</svg>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-size:14px;color:var(--white);font-weight:500;margin-bottom:2px">' + escHtml(s.browser) + ' on ' + escHtml(s.os) + badge + '</div>' +
            '<div style="font-family:var(--mono);font-size:11px;color:var(--ash)">' + escHtml(s.ip) + ' · ' + timeAgo(s.last_active) + '</div>' +
          '</div>' + btn + '</div>';
      }).join('');
      if (!sessions.length) sessionsHtml = '<p style="color:var(--ash);font-size:13px;padding:16px 0">No active sessions</p>';

      var logsHtml = logs.length ? logs.map(function(l){
        var ok = l.status === 'success';
        var icon = ok
          ? '<svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:#4ade80;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0"><polyline points="20 6 9 17 4 12"/></svg>'
          : '<svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:#f87171;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
        return '<div style="display:flex;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">' +
          icon +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-size:13px;color:var(--white)">' + escHtml(l.browser) + ' on ' + escHtml(l.os) + '</div>' +
            '<div style="font-family:var(--mono);font-size:11px;color:var(--ash)">' + escHtml(l.ip) + (l.reason ? ' · ' + escHtml(l.reason) : '') + '</div>' +
          '</div>' +
          '<span style="font-size:11px;color:var(--ash);font-family:var(--mono);flex-shrink:0">' + timeAgo(l.created_at) + '</span>' +
        '</div>';
      }).join('') : '<p style="color:var(--ash);font-size:13px;padding:16px 0">No login history yet</p>';

      var banner = '';
      if (results[0].user && results[0].user.deactivated_at) {
        banner = '<div style="background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.35);border-radius:10px;padding:20px;margin-bottom:20px">' +
          '<div style="font-size:14px;color:#fbbf24;font-weight:600;margin-bottom:6px">Account is deactivated</div>' +
          '<p style="color:var(--fog);font-size:13px;margin-bottom:14px">Your account is currently deactivated. Sites may not be accessible.</p>' +
          '<button class="btn btn-primary btn-sm" onclick="App.reactivateAccount()">Reactivate Account</button>' +
        '</div>';
      }

      c.innerHTML =
        '<div class="page-head"><div class="eyebrow">Account</div><h1 class="page-title">Security</h1><p class="page-sub">Manage your account security</p></div>' +
        '<div style="max-width:720px">' + banner +
        '<div style="display:flex;flex-direction:column;gap:20px">' +

          card('Change Password', 'Update your password. All other devices will be signed out.',
            '<div id="secAlert"></div>' +
            '<div class="field"><label class="label">Current Password</label><input type="password" class="input" id="secCur" autocomplete="current-password" placeholder="Enter current password"></div>' +
            '<div class="field"><label class="label">New Password</label>' +
              '<input type="password" class="input" id="secNew" autocomplete="new-password" placeholder="Min 8 characters">' +
              '<div id="secStrength" style="margin-top:8px;font-size:12px;display:none">' +
                '<div style="height:4px;background:var(--panel);border-radius:2px;overflow:hidden;margin-bottom:6px"><div id="secBar" style="height:100%;width:0;transition:all .2s"></div></div>' +
                '<span id="secLabel"></span>' +
              '</div>' +
            '</div>' +
            '<div class="field"><label class="label">Confirm New Password</label><input type="password" class="input" id="secConfirm" autocomplete="new-password" placeholder="Re-enter new password"></div>' +
            '<div style="margin-top:20px"><button class="btn btn-primary" id="secSavePw" style="width:100%">Update Password</button></div>'
          ) +

          card('Active Sessions', 'Devices currently signed in to your account',
            '<div>' + sessionsHtml + '</div>' +
            '<div style="margin-top:20px"><button class="btn btn-ghost btn-sm" id="secLogoutAll">Logout All Other Devices</button></div>'
          ) +

          card('Login History', 'Recent login attempts — successful and failed',
            '<div>' + logsHtml + '</div>'
          ) +

          card('Export Data', 'Download all your data as JSON — sites, files metadata, domains, and analytics summary.',
            '<button class="btn btn-ghost btn-sm" id="secExportBtn">Download JSON</button>'
          ) +

          card('Danger Zone', 'Permanently delete your account and all associated data — sites, files, analytics, domains. This action cannot be undone.',
            '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
              '<button class="btn btn-danger btn-sm" id="secDeactivateBtn">Deactivate Account</button>' +
              '<button class="btn btn-danger btn-sm" id="secDeleteBtn" style="background:rgba(220,38,38,.15)">Delete Account</button>' +
            '</div>',
            'border-color:rgba(220,38,38,.35);background:linear-gradient(180deg,rgba(220,38,38,.04) 0%,var(--card) 100%)'
          ) +

        '</div></div>';

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
        labelEl.textContent = s.label + ' password';
        labelEl.style.color = s.color;
      });

      document.getElementById('secSavePw').onclick = function(){ App.changePassword(); };
      document.getElementById('secLogoutAll').onclick = function(){ App.logoutAllDevices(); };
      document.getElementById('secExportBtn').onclick = function(){ App.exportData(); };
      document.getElementById('secDeactivateBtn').onclick = function(){ App.deactivateAccount(); };
      document.getElementById('secDeleteBtn').onclick = function(){ App.deleteAccount(); };
    } catch (e) {
      c.innerHTML = '<div class="card" style="text-align:center;padding:40px"><p style="color:#f87171">Error: ' + escHtml(e.message) + '</p></div>';
    }
  };

  function showAlert(html, type) {
    var el = document.getElementById('secAlert'); if (!el) return;
    var col = { error: { bg: 'rgba(220,38,38,.08)', border: 'rgba(220,38,38,.3)', text: '#f87171' }, success: { bg: 'rgba(74,222,128,.08)', border: 'rgba(74,222,128,.3)', text: '#4ade80' } }[type] || { bg: 'rgba(220,38,38,.08)', border: 'rgba(220,38,38,.3)', text: '#f87171' };
    el.innerHTML = '<div style="background:' + col.bg + ';border:1px solid ' + col.border + ';color:' + col.text + ';padding:12px 16px;border-radius:10px;font-size:13px;line-height:1.5;margin-bottom:16px">' + html + '</div>';
  }

  App.changePassword = async function(){
    var el = document.getElementById('secAlert'); if (el) el.innerHTML = '';
    var cur = document.getElementById('secCur').value;
    var nw = document.getElementById('secNew').value;
    var cf = document.getElementById('secConfirm').value;
    var errors = [];
    if (!cur) errors.push('Current password is required');
    if (!nw) errors.push('New password is required');
    if (!cf) errors.push('Confirm password is required');
    if (nw && nw.length < 8) errors.push('Password must be at least 8 characters');
    if (nw && (!/[a-zA-Z]/.test(nw) || !/[0-9]/.test(nw))) errors.push('Password must contain letters and numbers');
    if (nw && cf && nw !== cf) errors.push('New passwords do not match');
    if (nw && cur && nw === cur) errors.push('New password must be different from current');
    if (errors.length) { showAlert('<strong>Please fix:</strong><ul style="margin:6px 0 0 18px;padding:0">' + errors.map(function(e){ return '<li>' + escHtml(e) + '</li>'; }).join('') + '</ul>', 'error'); return; }
    var btn = document.getElementById('secSavePw');
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
    try {
      var r = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ current_password: cur, new_password: nw, confirm_password: cf }) });
      var d = await r.json();
      if (d.ok) {
        showAlert('<strong>Password updated.</strong> All other devices have been signed out.', 'success');
        document.getElementById('secCur').value = '';
        document.getElementById('secNew').value = '';
        document.getElementById('secConfirm').value = '';
        document.getElementById('secStrength').style.display = 'none';
      } else showAlert(escHtml(d.error || 'Failed'), 'error');
    } catch (e) { showAlert('Error: ' + escHtml(e.message), 'error'); }
    btn.disabled = false; btn.textContent = 'Update Password';
  };

  App.revokeSession = async function(prefix){
    if (!confirm('Revoke this session? The device will be signed out.')) return;
    try { var r = await fetch('/api/auth/sessions?prefix=' + encodeURIComponent(prefix), { method: 'DELETE' }); var d = await r.json();
      if (d.ok) { toast('Session revoked', 'success'); App.load('security'); } else toast(d.error || 'Failed', 'error');
    } catch (e) { toast('Error: ' + e.message, 'error'); }
  };

  App.logoutAllDevices = async function(){
    if (!confirm('Sign out all other devices?\n\nYou will stay signed in on this device.')) return;
    try { var r = await fetch('/api/auth/sessions?all=1', { method: 'DELETE' }); var d = await r.json();
      if (d.ok) { toast('All other devices signed out', 'success'); App.load('security'); } else toast(d.error || 'Failed', 'error');
    } catch (e) { toast('Error: ' + e.message, 'error'); }
  };

  App.reactivateAccount = async function(){
    if (!confirm('Reactivate your account?')) return;
    try { var r = await fetch('/api/auth/deactivate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reactivate' }) }); var d = await r.json();
      if (d.ok) { toast('Account reactivated', 'success'); App.load('security'); } else toast(d.error || 'Failed', 'error');
    } catch (e) { toast('Error: ' + e.message, 'error'); }
  };

  App.exportData = async function(){
    toast('Preparing export...', 'info');
    try {
      var r = await fetch('/api/auth/export'); var d = await r.json();
      if (!d.ok) throw new Error(d.error || 'Failed');
      var blob = new Blob([JSON.stringify(d.data, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a'); a.href = url; a.download = 'hairihosting-export-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
      toast('Data exported', 'success');
    } catch (e) { toast('Export failed: ' + e.message, 'error'); }
  };

  App.deactivateAccount = function(){
    if (!confirm('Deactivate your account?\n\nYou will be signed out. Your sites will not be accessible until you sign in again and reactivate.')) return;
    (async function(){
      try { var r = await fetch('/api/auth/deactivate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'deactivate' }) }); var d = await r.json();
        if (d.ok) { toast('Account deactivated', 'success'); setTimeout(function(){ window.location.href = '/'; }, 1000); } else toast(d.error || 'Failed', 'error');
      } catch (e) { toast('Error: ' + e.message, 'error'); }
    })();
  };

  App.deleteAccount = function(){
    var email = prompt('Type your email to confirm account deletion:\n\nThis will permanently delete all your sites, files, analytics, and data. This cannot be undone.');
    if (!email) return;
    if (!confirm('FINAL WARNING: Permanently delete your account?')) return;
    (async function(){
      try { var r = await fetch('/api/auth/delete-account', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirm_email: email }) }); var d = await r.json();
        if (d.ok) { toast('Account deleted', 'success'); setTimeout(function(){ window.location.href = '/'; }, 1000); } else toast(d.error || 'Failed', 'error');
      } catch (e) { toast('Error: ' + e.message, 'error'); }
    })();
  };

  var origLoad = App.load.bind(App);
  App.load = function(id){
    if (id === 'security') {
      document.getElementById('content').innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
      return this.pageSecurity();
    }
    return origLoad(id);
  };
})();

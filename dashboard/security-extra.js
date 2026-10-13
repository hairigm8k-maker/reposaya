(function(){
  if (typeof App === 'undefined') { console.error('App not found'); return; }

  // Simpan original pageSecurity
  var origPageSecurity = App.pageSecurity;

  App.pageSecurity = async function(){
    // Panggil original dulu
    var result = await origPageSecurity.call(this);

    // Lepas render siap, append section baru
    setTimeout(async function(){
      var container = document.querySelector('.content > div[style*="grid"]');
      if (!container) return;

      // 1. Deactivate banner (kalau active)
      try {
        var sess = await fetch('/api/auth/session');
        var sd = await sess.json();
        if (sd.ok && sd.user && sd.user.deactivated_at) {
          var banner = document.createElement('div');
          banner.style.cssText = 'background:linear-gradient(180deg,rgba(251,191,36,.08) 0%,var(--card) 100%);border:1px solid rgba(251,191,36,.4);border-radius:10px;padding:20px;margin-bottom:20px';
          banner.innerHTML = '<div style="font-size:14px;color:#fbbf24;font-weight:600;margin-bottom:6px">Account is deactivated</div><p style="color:var(--fog);font-size:13px;margin-bottom:14px">Your account is currently deactivated. Sites may not be accessible.</p><button class="btn btn-primary btn-sm" onclick="App.reactivateAccount()">Reactivate Account</button>';
          document.querySelector('.content').insertBefore(banner, document.querySelector('.content > div[style*="grid"]'));
        }
      } catch (e) {}

      // 2. Login History
      try {
        var r = await fetch('/api/auth/login-history');
        var d = await r.json();
        if (d.ok) {
          var logs = d.logs || [];
          var logsHtml = logs.length ? logs.map(function(l){
            var ok = l.status === 'success';
            var icon = ok ? '<svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:#4ade80;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round"><polyline points="20 6 9 17 4 12"/></svg>' : '<svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:#f87171;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
            return '<div style="display:flex;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">' +
              icon +
              '<div style="flex:1;min-width:0">' +
                '<div style="font-size:13px;color:var(--white)">' + escHtml(l.browser) + ' on ' + escHtml(l.os) + '</div>' +
                '<div style="font-family:var(--mono);font-size:11px;color:var(--ash)">' + escHtml(l.ip) + (l.reason ? ' · ' + escHtml(l.reason) : '') + '</div>' +
              '</div>' +
              '<span style="font-size:11px;color:var(--ash);font-family:var(--mono)">' + App.timeAgo(l.created_at) + '</span>' +
            '</div>';
          }).join('') : '<p style="color:var(--ash);font-size:13px;padding:16px 0">No login history</p>';

          var card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = '<div class="card-title" style="margin-bottom:8px;font-size:14px;color:var(--white)">Login History</div><p style="color:var(--fog);font-size:12px;margin-bottom:16px">Recent login attempts (successful and failed)</p>' + logsHtml;
          container.appendChild(card);
        }
      } catch (e) {}

      // 3. Export Data
      var exportCard = document.createElement('div');
      exportCard.className = 'card';
      exportCard.innerHTML = '<div class="card-title" style="margin-bottom:8px;font-size:14px;color:var(--white)">Export Data</div><p style="color:var(--fog);font-size:13px;line-height:1.6;margin-bottom:16px">Download all your data as JSON — sites, files metadata, domains, and analytics summary.</p><button class="btn btn-ghost btn-sm" onclick="App.exportData()">Download JSON</button>';
      container.appendChild(exportCard);
    }, 100);
  };

  App.reactivateAccount = async function(){
    if (!confirm('Reactivate your account?')) return;
    try {
      var r = await fetch('/api/auth/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reactivate' })
      });
      var d = await r.json();
      if (d.ok) { toast('Account reactivated', 'success'); App.load('security'); }
      else toast(d.error || 'Failed', 'error');
    } catch (e) { toast('Error: ' + e.message, 'error'); }
  };

  App.deactivateAccount = function(){
    if (!confirm('Deactivate your account?\n\nYou will be logged out. Your sites will not be accessible until you reactivate.')) return;
    (async function(){
      try {
        var r = await fetch('/api/auth/deactivate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'deactivate' })
        });
        var d = await r.json();
        if (d.ok) {
          toast('Account deactivated', 'success');
          setTimeout(function(){ window.location.href = '/'; }, 1000);
        } else toast(d.error || 'Failed', 'error');
      } catch (e) { toast('Error: ' + e.message, 'error'); }
    })();
  };

  App.exportData = async function(){
    toast('Preparing export...', 'info');
    try {
      var r = await fetch('/api/auth/export');
      var d = await r.json();
      if (!d.ok) throw new Error(d.error || 'Failed');
      var blob = new Blob([JSON.stringify(d.data, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'hairihosting-export-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
      toast('Data exported', 'success');
    } catch (e) { toast('Export failed: ' + e.message, 'error'); }
  };

  // Update delete-account modal untuk tambah Deactivate button dalam Danger Zone
  setTimeout(function(){
    var origDeleteBtn = document.getElementById('secDeleteBtn');
    if (origDeleteBtn && !document.getElementById('secDeactivateBtn')) {
      var deactivateBtn = document.createElement('button');
      deactivateBtn.id = 'secDeactivateBtn';
      deactivateBtn.className = 'btn btn-ghost btn-sm';
      deactivateBtn.style.marginTop = '10px';
      deactivateBtn.textContent = 'Deactivate Account';
      deactivateBtn.onclick = function(){ App.deactivateAccount(); };
      origDeleteBtn.parentNode.appendChild(deactivateBtn);
    }
  }, 200);
})();

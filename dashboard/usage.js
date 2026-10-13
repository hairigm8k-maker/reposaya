(function(){
  if (typeof App === 'undefined') return;

  function fmtSize(b) {
    if (!b || b < 1024) return (b || 0) + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    if (b < 1024 * 1024 * 1024) return (b / 1024 / 1024).toFixed(2) + ' MB';
    return (b / 1024 / 1024 / 1024).toFixed(2) + ' GB';
  }

  App.pageUsage = async function(){
    var c = document.getElementById('content');
    c.innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
    try {
      var r = await fetch('/api/usage');
      var d = await r.json();
      if (!d.ok) throw new Error(d.error);

      var maxBytes = 0;
      (d.per_site || []).forEach(function(s){ if (s.bytes > maxBytes) maxBytes = s.bytes; });

      var perSiteHtml = (d.per_site || []).length ? d.per_site.map(function(s){
        var pct = maxBytes ? Math.max(2, (s.bytes / maxBytes) * 100) : 0;
        return '<div style="padding:14px 0;border-bottom:1px solid var(--border)">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:8px">' +
            '<div style="min-width:0;flex:1">' +
              '<div style="font-size:14px;color:var(--white);font-weight:500;margin-bottom:2px">' + escHtml(s.name) + '</div>' +
              '<div style="font-family:var(--mono);font-size:11px;color:var(--copper)">' + escHtml(s.subdomain) + '.hairiamri.buzz</div>' +
            '</div>' +
            '<span style="font-family:var(--mono);font-size:12px;color:var(--fog);flex-shrink:0">' + fmtSize(s.bytes) + '</span>' +
          '</div>' +
          '<div style="height:4px;background:var(--panel);border-radius:2px;overflow:hidden"><div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--copper),#e0a97f);border-radius:2px"></div></div>' +
        '</div>';
      }).join('') : '<p style="color:var(--ash);font-size:13px;padding:24px 0;text-align:center">No sites yet</p>';

      c.innerHTML =
        '<div class="page-head"><div class="eyebrow">Account</div><h1 class="page-title">Usage & Storage</h1><p class="page-sub">Track your resource usage</p></div>' +
        '<div style="max-width:720px;display:flex;flex-direction:column;gap:20px">' +

          // Big total card
          '<div class="card" style="background:linear-gradient(135deg,rgba(204,145,102,.08) 0%,var(--card) 60%);border-color:rgba(204,145,102,.3)">' +
            '<div style="font-size:12px;color:var(--fog);text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">Total Storage</div>' +
            '<div style="font-family:var(--serif);font-size:48px;color:var(--white);line-height:1;margin-bottom:14px">' + fmtSize(d.total_bytes) + '</div>' +
            '<div style="display:flex;gap:24px;flex-wrap:wrap;font-size:13px;color:var(--fog)">' +
              '<div><span style="color:var(--copper);font-family:var(--mono)">' + fmtSize(d.files_bytes) + '</span> images</div>' +
              '<div><span style="color:var(--copper);font-family:var(--mono)">' + fmtSize(d.code_bytes) + '</span> code</div>' +
            '</div>' +
          '</div>' +

          // Stats grid
          '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">' +
            '<div class="card" style="padding:18px;text-align:center"><div style="font-family:var(--serif);font-size:28px;color:var(--white);line-height:1">' + d.sites + '</div><div style="font-size:11px;color:var(--ash);text-transform:uppercase;letter-spacing:.08em;margin-top:6px">Sites</div></div>' +
            '<div class="card" style="padding:18px;text-align:center"><div style="font-family:var(--serif);font-size:28px;color:#4ade80;line-height:1">' + d.live_sites + '</div><div style="font-size:11px;color:var(--ash);text-transform:uppercase;letter-spacing:.08em;margin-top:6px">Live</div></div>' +
            '<div class="card" style="padding:18px;text-align:center"><div style="font-family:var(--serif);font-size:28px;color:var(--copper);line-height:1">' + d.files + '</div><div style="font-size:11px;color:var(--ash);text-transform:uppercase;letter-spacing:.08em;margin-top:6px">Files</div></div>' +
            '<div class="card" style="padding:18px;text-align:center"><div style="font-family:var(--serif);font-size:28px;color:#a78bfa;line-height:1">' + d.visitors + '</div><div style="font-size:11px;color:var(--ash);text-transform:uppercase;letter-spacing:.08em;margin-top:6px">Visitors</div></div>' +
          '</div>' +

          // Breakdown per site
          '<div class="card"><div style="font-family:var(--serif);font-size:20px;color:var(--white);margin-bottom:6px">Storage Breakdown</div><p style="color:var(--fog);font-size:13px;margin-bottom:12px">Per-site usage</p>' + perSiteHtml + '</div>' +

          // Info
          '<div class="card" style="background:var(--panel);border-color:var(--border2)">' +
            '<div style="display:flex;gap:10px;align-items:start">' +
              '<svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:#cc9166;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;margin-top:2px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' +
              '<div style="font-size:12px;color:var(--fog);line-height:1.7">' +
                '<strong style="color:var(--bone)">Unlimited storage & sites.</strong> Fair-use policy applies. Analytics retained for 90 days. ' +
                'Individual file upload limit: <span style="color:var(--copper);font-family:var(--mono)">1.5 MB</span>.' +
              '</div>' +
            '</div>' +
          '</div>' +

        '</div>';
    } catch (e) {
      c.innerHTML = '<div class="card" style="text-align:center;padding:40px"><p style="color:#f87171">Error: ' + escHtml(e.message) + '</p></div>';
    }
  };

  var origLoad = App.load.bind(App);
  App.load = function(id){
    if (id === 'usage') {
      document.getElementById('content').innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
      return this.pageUsage();
    }
    return origLoad(id);
  };
})();

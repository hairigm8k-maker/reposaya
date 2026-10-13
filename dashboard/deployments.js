(function(){
  if (typeof App === 'undefined') { console.error('App not found'); return; }

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
      if (dd < 30) return dd + 'd ago';
      return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) { return s; }
  }

  App.pageDeployments = async function(){
    var c = document.getElementById('content');
    c.innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
    try {
      var r = await fetch('/api/deployments');
      var d = await r.json();
      if (!d.ok) throw new Error(d.error);
      var rows = d.deployments || [];

      var listHtml = rows.length ? rows.map(function(dp){
        var isDeleted = dp.site_deleted === 1;
        var icon = isDeleted
          ? '<svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:#5e616e;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
          : '<svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:#4ade80;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>';

        var url = 'https://' + dp.site_subdomain + '.hairiamri.buzz';
        var openBtn = isDeleted
          ? '<span style="font-family:var(--mono);font-size:11px;color:var(--ash);padding:6px 12px;border:1px solid var(--border);border-radius:9999px">Site deleted</span>'
          : '<button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();App.openPreview(\'' + escHtml(dp.site_subdomain) + '\')">Open Site</button>';

        var badge = isDeleted
          ? '<span style="font-size:10px;padding:2px 8px;border-radius:9999px;background:rgba(94,97,110,.15);color:#9194a1;font-weight:600;font-family:var(--mono)">DELETED</span>'
          : '<span style="font-size:10px;padding:2px 8px;border-radius:9999px;background:rgba(74,222,128,.15);color:#4ade80;font-weight:600;font-family:var(--mono)">LIVE</span>';

        return '<div class="card" style="padding:18px 22px;display:flex;gap:16px;align-items:center;' + (isDeleted ? 'opacity:.75' : '') + '">' +
          icon +
          '<div style="flex:1;min-width:0">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap">' +
              '<span style="font-size:15px;font-weight:600;color:var(--white)">' + escHtml(dp.site_name) + '</span>' +
              badge +
            '</div>' +
            '<div style="font-family:var(--mono);font-size:12px;color:var(--copper);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(dp.site_subdomain) + '.hairiamri.buzz</div>' +
            '<div style="font-size:11px;color:var(--ash);margin-top:4px;font-family:var(--mono)">' + timeAgo(dp.created_at) + '</div>' +
          '</div>' +
          openBtn +
        '</div>';
      }).join('') : '<div class="card" style="text-align:center;padding:60px 40px"><div style="font-family:var(--serif);font-size:22px;color:white;margin-bottom:8px">No deployments yet</div><p style="color:var(--ash);font-size:13px">Publish a site to see it here</p></div>';

      c.innerHTML =
        '<div class="page-head">' +
          '<div class="eyebrow">Publishing</div>' +
          '<h1 class="page-title">Deployments</h1>' +
          '<p class="page-sub">Permanent history of every publish</p>' +
        '</div>' +

        '<div style="max-width:800px">' +
          '<div class="card" style="background:var(--panel);border-color:var(--border2);margin-bottom:20px;padding:14px 18px">' +
            '<div style="display:flex;gap:10px;align-items:start">' +
              '<svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:#cc9166;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;margin-top:2px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' +
              '<div style="font-size:12px;color:var(--fog);line-height:1.6">Deployment history is <strong style="color:var(--bone)">permanent</strong> and cannot be deleted. Records stay even after the site is removed for audit purposes.</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;flex-direction:column;gap:10px">' + listHtml + '</div>' +
        '</div>';
    } catch (e) {
      c.innerHTML = '<div class="card" style="text-align:center;padding:40px"><p style="color:#f87171">Error: ' + escHtml(e.message) + '</p></div>';
    }
  };

  // Wrap App.load untuk handle 'deployments'
  var origLoad = App.load.bind(App);
  App.load = function(id){
    if (id === 'deployments') {
      document.getElementById('content').innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
      return this.pageDeployments();
    }
    return origLoad(id);
  };
})();

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
      return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch (e) { return s; }
  }

  var ICONS = {
    publish: { color: '#4ade80', svg: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>' },
    login: { color: '#cc9166', svg: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>' },
    site_created: { color: '#60a5fa', svg: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' },
    upload: { color: '#a78bfa', svg: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>' }
  };

  App.pageActivity = async function(){
    var c = document.getElementById('content');
    c.innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
    try {
      var r = await fetch('/api/activity?limit=50');
      var d = await r.json();
      if (!d.ok) throw new Error(d.error);
      var events = d.events || [];

      var listHtml = events.length ? events.map(function(ev){
        var ic = ICONS[ev.type] || ICONS.login;
        return '<div style="display:flex;gap:16px;align-items:start;padding:16px 0;border-bottom:1px solid var(--border)">' +
          '<div style="width:36px;height:36px;border-radius:10px;background:var(--panel);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
            '<svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:' + ic.color + ';fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round">' + ic.svg + '</svg>' +
          '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-size:14px;color:var(--white);font-weight:500;margin-bottom:3px">' + escHtml(ev.title) + '</div>' +
            (ev.subtitle ? '<div style="font-family:var(--mono);font-size:11px;color:var(--copper);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px">' + escHtml(ev.subtitle) + '</div>' : '') +
            '<div style="font-size:11px;color:var(--ash);display:flex;gap:10px;flex-wrap:wrap">' +
              '<span>' + timeAgo(ev.created_at) + '</span>' +
              (ev.meta ? '<span>·</span><span style="font-family:var(--mono)">' + escHtml(ev.meta) + '</span>' : '') +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('') : '<div class="card" style="text-align:center;padding:60px 40px"><div style="font-family:var(--serif);font-size:22px;color:white;margin-bottom:8px">No activity yet</div><p style="color:var(--ash);font-size:13px">Start creating sites to see activity here</p></div>';

      c.innerHTML =
        '<div class="page-head">' +
          '<div class="eyebrow">Overview</div>' +
          '<h1 class="page-title">Activity</h1>' +
          '<p class="page-sub">Your recent actions and events</p>' +
        '</div>' +
        '<div style="max-width:720px"><div class="card" style="padding:20px 24px">' + listHtml + '</div></div>';
    } catch (e) {
      c.innerHTML = '<div class="card" style="text-align:center;padding:40px"><p style="color:#f87171">Error: ' + escHtml(e.message) + '</p></div>';
    }
  };

  var origLoad = App.load.bind(App);
  App.load = function(id){
    if (id === 'activity') {
      document.getElementById('content').innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
      return this.pageActivity();
    }
    return origLoad(id);
  };
})();

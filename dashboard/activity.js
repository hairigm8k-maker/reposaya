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

  function dateGroup(s) {
    try {
      var t = new Date(String(s).replace(' ', 'T') + 'Z');
      var today = new Date();
      var yest = new Date();
      yest.setDate(today.getDate() - 1);
      if (t.toDateString() === today.toDateString()) return 'Today';
      if (t.toDateString() === yest.toDateString()) return 'Yesterday';
      return t.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return 'Earlier'; }
  }

  var META = {
    publish: { color: '#4ade80', bg: 'rgba(74,222,128,.1)', label: 'Publish', svg: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>' },
    login: { color: '#cc9166', bg: 'rgba(204,145,102,.1)', label: 'Sign in', svg: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>' },
    site_created: { color: '#60a5fa', bg: 'rgba(96,165,250,.1)', label: 'New site', svg: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' },
    upload: { color: '#a78bfa', bg: 'rgba(167,139,250,.1)', label: 'Upload', svg: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>' }
  };

  App.pageActivity = async function(){
    var c = document.getElementById('content');
    c.innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
    try {
      var r = await fetch('/api/activity?limit=50');
      var d = await r.json();
      if (!d.ok) throw new Error(d.error);
      var events = d.events || [];

      // Group by date
      var groups = [];
      var lastDate = null;
      events.forEach(function(ev){
        var g = dateGroup(ev.created_at);
        if (g !== lastDate) { groups.push({ label: g, items: [] }); lastDate = g; }
        groups[groups.length - 1].items.push(ev);
      });

      var bodyHtml = '';
      if (!events.length) {
        bodyHtml = '<div class="card" style="text-align:center;padding:80px 40px"><div style="font-family:var(--serif);font-size:24px;color:white;margin-bottom:8px">No activity yet</div><p style="color:var(--ash);font-size:13px">Start creating sites and publishing to see your timeline</p></div>';
      } else {
        groups.forEach(function(group){
          bodyHtml += '<div style="margin-bottom:32px">' +
            '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">' +
              '<span style="font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--copper)">' + escHtml(group.label) + '</span>' +
              '<div style="flex:1;height:1px;background:var(--border)"></div>' +
            '</div>' +
            '<div style="position:relative;padding-left:4px">';

          group.items.forEach(function(ev, idx){
            var m = META[ev.type] || META.login;
            var isLast = idx === group.items.length - 1;
            bodyHtml += '<div style="position:relative;display:flex;gap:16px;padding-bottom:' + (isLast ? '0' : '20px') + '">' +
              // Timeline connector
              (!isLast ? '<div style="position:absolute;left:19px;top:40px;bottom:0;width:1px;background:var(--border)"></div>' : '') +
              // Icon circle
              '<div style="position:relative;z-index:1;width:40px;height:40px;border-radius:50%;background:' + m.bg + ';border:1px solid ' + m.color + '33;display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
                '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:' + m.color + ';fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round">' + m.svg + '</svg>' +
              '</div>' +
              // Content
              '<div style="flex:1;min-width:0;padding-top:2px">' +
                '<div style="display:flex;justify-content:space-between;align-items:start;gap:12px;margin-bottom:2px">' +
                  '<div style="font-size:14px;color:var(--white);font-weight:500;line-height:1.4">' + escHtml(ev.title) + '</div>' +
                  '<span style="font-size:11px;color:var(--ash);font-family:var(--mono);flex-shrink:0">' + timeAgo(ev.created_at) + '</span>' +
                '</div>' +
                (ev.subtitle ? '<div style="font-family:var(--mono);font-size:11.5px;color:var(--copper);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px">' + escHtml(ev.subtitle) + '</div>' : '') +
                (ev.meta ? '<div style="font-family:var(--mono);font-size:10.5px;color:var(--ash)">' + escHtml(ev.meta) + '</div>' : '') +
              '</div>' +
            '</div>';
          });

          bodyHtml += '</div></div>';
        });
      }

      // Stats bar
      var counts = { publish: 0, login: 0, site_created: 0, upload: 0 };
      events.forEach(function(ev){ if (counts[ev.type] !== undefined) counts[ev.type]++; });

      c.innerHTML =
        '<div class="page-head">' +
          '<div class="eyebrow">Overview</div>' +
          '<h1 class="page-title">Activity</h1>' +
          '<p class="page-sub">Your recent actions and events</p>' +
        '</div>' +

        '<div style="max-width:720px">' +
          '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:28px">' +
            '<div class="card" style="padding:16px;text-align:center">' +
              '<div style="font-family:var(--serif);font-size:24px;color:#4ade80;line-height:1">' + counts.publish + '</div>' +
              '<div style="font-size:10px;color:var(--ash);text-transform:uppercase;letter-spacing:.08em;margin-top:6px">Publishes</div>' +
            '</div>' +
            '<div class="card" style="padding:16px;text-align:center">' +
              '<div style="font-family:var(--serif);font-size:24px;color:#cc9166;line-height:1">' + counts.login + '</div>' +
              '<div style="font-size:10px;color:var(--ash);text-transform:uppercase;letter-spacing:.08em;margin-top:6px">Sign ins</div>' +
            '</div>' +
            '<div class="card" style="padding:16px;text-align:center">' +
              '<div style="font-family:var(--serif);font-size:24px;color:#60a5fa;line-height:1">' + counts.site_created + '</div>' +
              '<div style="font-size:10px;color:var(--ash);text-transform:uppercase;letter-spacing:.08em;margin-top:6px">Sites</div>' +
            '</div>' +
            '<div class="card" style="padding:16px;text-align:center">' +
              '<div style="font-family:var(--serif);font-size:24px;color:#a78bfa;line-height:1">' + counts.upload + '</div>' +
              '<div style="font-size:10px;color:var(--ash);text-transform:uppercase;letter-spacing:.08em;margin-top:6px">Uploads</div>' +
            '</div>' +
          '</div>' +
          bodyHtml +
        '</div>';
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

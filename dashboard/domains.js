(function(){
  if (typeof App === 'undefined') return;

  function timeAgo(s) {
    if (!s) return '-';
    try {
      var t = new Date(String(s).replace(' ', 'T') + 'Z').getTime();
      var d = Date.now() - t;
      if (d < 60000) return 'Just now';
      var m = Math.floor(d / 60000);
      if (m < 60) return m + 'm ago';
      var h = Math.floor(m / 60);
      if (h < 24) return h + 'h ago';
      return Math.floor(h / 24) + 'd ago';
    } catch(e) { return s; }
  }

  App.pageDomains = async function(){
    var c = document.getElementById('content');
    c.innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';

    try {
      var results = await Promise.all([
        fetch('/api/custom-domain').then(function(r){ return r.json(); }),
        fetch('/api/site').then(function(r){ return r.json(); })
      ]);
      var d = results[0];
      var d2 = results[1];
      if (!d.ok) throw new Error(d.error);
      var sites = (d2.ok && d2.sites) ? d2.sites : [];
      var domains = d.domains || [];

      var verifiedCount = domains.filter(function(x){ return x.verified; }).length;
      var pendingCount = domains.length - verifiedCount;

      // Stats cards
      var statsHtml =
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:28px">' +
          '<div class="card" style="padding:20px">' +
            '<div class="card-title" style="font-size:11px">Total Domains</div>' +
            '<div class="card-value" style="font-size:28px">' + domains.length + '</div>' +
            '<div class="card-meta">Connected</div>' +
          '</div>' +
          '<div class="card" style="padding:20px">' +
            '<div class="card-title" style="font-size:11px">Verified</div>' +
            '<div class="card-value" style="font-size:28px;color:#4ade80">' + verifiedCount + '</div>' +
            '<div class="card-meta">Ready to serve</div>' +
          '</div>' +
          '<div class="card" style="padding:20px">' +
            '<div class="card-title" style="font-size:11px">Pending</div>' +
            '<div class="card-value" style="font-size:28px;color:#fbbf24">' + pendingCount + '</div>' +
            '<div class="card-meta">Awaiting DNS</div>' +
          '</div>' +
        '</div>';

      // Add domain card
      var siteOptions = sites.map(function(s){
        return '<option value="' + s.id + '">' + escHtml(s.name) + ' — ' + escHtml(s.subdomain) + '.hairiamri.buzz</option>';
      }).join('');

      var addCardHtml =
        '<div class="card" style="margin-bottom:24px">' +
          '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">' +
            '<div style="width:40px;height:40px;border-radius:12px;background:rgba(204,145,102,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
              '<svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:var(--copper);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>' +
            '</div>' +
            '<div style="flex:1;min-width:0">' +
              '<div style="font-family:var(--serif);font-size:20px;color:var(--white);margin-bottom:2px">Connect New Domain</div>' +
              '<div style="font-size:12.5px;color:var(--fog)">Point your own domain to any HairiHosting site</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">' +
            '<div class="field" style="margin-bottom:0"><label class="label">Site</label>' +
              '<select class="select" id="domSite">' + (siteOptions || '<option value="">No sites yet</option>') + '</select></div>' +
            '<div class="field" style="margin-bottom:0"><label class="label">Domain</label>' +
              '<input type="text" class="input" id="domInput" placeholder="example.com" autocomplete="off"></div>' +
          '</div>' +
          '<button class="btn btn-primary" id="domAdd" style="width:100%">+ Add Domain</button>' +
        '</div>';

      // Domain list
      var listHtml;
      if (!domains.length) {
        listHtml =
          '<div class="card" style="text-align:center;padding:64px 32px">' +
            '<div style="width:64px;height:64px;border-radius:50%;background:var(--panel);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;margin:0 auto 20px">' +
              '<svg viewBox="0 0 24 24" style="width:28px;height:28px;stroke:var(--ash);fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>' +
            '</div>' +
            '<div style="font-family:var(--serif);font-size:22px;color:var(--white);margin-bottom:8px">No domains yet</div>' +
            '<p style="color:var(--fog);font-size:13.5px;line-height:1.6;max-width:380px;margin:0 auto 4px">Connect your own domain (contoh: <span style="font-family:var(--mono);color:var(--copper)">hery.com</span>) untuk gantikan subdomain HairiHosting.</p>' +
          '</div>';
      } else {
        listHtml = '<div style="display:flex;flex-direction:column;gap:10px">' +
          domains.map(function(dom){
            var status = dom.verified
              ? '<span class="badge badge-live" style="font-size:10px;padding:4px 10px">● VERIFIED</span>'
              : '<span class="badge badge-draft" style="font-size:10px;padding:4px 10px">○ PENDING</span>';

            var dnsBox = dom.verified ? '' :
              '<div style="background:var(--panel);border:1px solid var(--border2);border-radius:10px;padding:14px;margin-top:14px">' +
                '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">' +
                  '<svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:var(--copper);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' +
                  '<span style="font-size:11px;color:var(--copper);text-transform:uppercase;letter-spacing:.08em;font-weight:600">DNS Setup Required</span>' +
                '</div>' +
                '<div style="font-family:var(--mono);font-size:12px;color:var(--fog);line-height:1.9;margin-bottom:12px">' +
                  '<div><span style="color:var(--ash);display:inline-block;width:52px">Type</span> <strong style="color:var(--bone)">TXT</strong></div>' +
                  '<div><span style="color:var(--ash);display:inline-block;width:52px">Name</span> <strong style="color:var(--bone)">@</strong></div>' +
                  '<div><span style="color:var(--ash);display:inline-block;width:52px">Value</span> <span style="color:var(--copper);word-break:break-all">' + escHtml(dom.verification_token || '') + '</span></div>' +
                '</div>' +
                '<button class="btn btn-ghost btn-sm" onclick="copyText(\'' + escHtml(dom.verification_token || '') + '\')">Copy Value</button>' +
              '</div>';

            return '<div class="card" style="padding:20px 24px">' +
              '<div style="display:flex;justify-content:space-between;align-items:start;gap:16px;flex-wrap:wrap">' +
                '<div style="flex:1;min-width:0">' +
                  '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap">' +
                    '<span style="font-size:16px;font-weight:600;color:var(--white);font-family:var(--mono);letter-spacing:-.01em">' + escHtml(dom.domain) + '</span>' +
                    status +
                  '</div>' +
                  '<div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--fog);font-family:var(--mono);margin-bottom:4px">' +
                    '<svg viewBox="0 0 24 24" style="width:11px;height:11px;stroke:var(--ash);fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
                    escHtml(dom.subdomain || 'site') + '.hairiamri.buzz' +
                  '</div>' +
                  '<div style="font-size:11px;color:var(--ash);font-family:var(--mono)">Added ' + timeAgo(dom.created_at) + '</div>' +
                  dnsBox +
                '</div>' +
                '<div style="display:flex;gap:6px;flex-shrink:0">' +
                  (dom.verified
                    ? '<button class="btn btn-ghost btn-sm" onclick="window.open(\'https://' + escHtml(dom.domain) + '\',\'_blank\')">Open</button>'
                    : '<button class="btn btn-primary btn-sm" onclick="App.verifyDomain(' + dom.id + ', this)">Verify</button>') +
                  '<button class="btn btn-danger btn-sm" onclick="App.deleteDomain(' + dom.id + ',\'' + escHtml(dom.domain) + '\')">Delete</button>' +
                '</div>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>';
      }

      c.innerHTML =
        '<div class="page-head">' +
          '<div class="eyebrow">Publishing</div>' +
          '<h1 class="page-title">Custom Domains</h1>' +
          '<p class="page-sub">Guna domain sendiri untuk gantikan subdomain HairiHosting</p>' +
        '</div>' +
        '<div style="max-width:820px">' +
          statsHtml +
          addCardHtml +
          '<div style="font-size:12px;color:var(--fog);text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:14px">Your Domains</div>' +
          listHtml +
        '</div>';

      var addBtn = document.getElementById('domAdd');
      if (addBtn) addBtn.onclick = function(){ App.addDomain(); };
    } catch(e) {
      c.innerHTML = '<div class="card" style="text-align:center;padding:40px"><p style="color:#f87171">Error: ' + escHtml(e.message) + '</p></div>';
    }
  };

  App.addDomain = async function(){
    var siteId = document.getElementById('domSite').value;
    var domain = document.getElementById('domInput').value.trim().toLowerCase();
    if (!domain) { toast('Enter a domain', 'error'); return; }
    if (domain.indexOf('http') === 0 || domain.indexOf('/') >= 0) {
      toast('Enter domain only (no http://, no path)', 'error');
      return;
    }
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
      toast('Invalid domain format', 'error');
      return;
    }
    var btn = document.getElementById('domAdd');
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
    try {
      var r = await fetch('/api/custom-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain, siteId: parseInt(siteId) })
      });
      var d = await r.json();
      if (d.ok) {
        toast('Domain added — setup DNS to verify', 'success');
        App.load('domains');
      } else {
        toast(d.error || 'Failed', 'error');
        btn.disabled = false; btn.textContent = '+ Add Domain';
      }
    } catch(e) {
      toast('Error: ' + e.message, 'error');
      btn.disabled = false; btn.textContent = '+ Add Domain';
    }
  };

  App.verifyDomain = async function(id, btnEl){
    var btn = btnEl || event.target;
    var orig = btn.innerHTML;
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
    try {
      var r = await fetch('/api/custom-domain/verify?id=' + id, { method: 'POST' });
      var d = await r.json();
      if (d.ok) {
        toast('Domain verified!', 'success');
        App.load('domains');
      } else {
        toast(d.error || 'DNS record not found. Wait 5-30 min and retry.', 'error');
        btn.disabled = false; btn.innerHTML = orig;
      }
    } catch(e) {
      toast('Error: ' + e.message, 'error');
      btn.disabled = false; btn.innerHTML = orig;
    }
  };

  App.deleteDomain = function(id, domain){
    App.openModal('Delete Domain', 'Remove "' + domain + '"? Site akan tetap di ' + domain + ', cuma tak accessible via domain ni.', async function(){
      try {
        var r = await fetch('/api/custom-domain?id=' + id, { method: 'DELETE' });
        var d = await r.json();
        if (d.ok) {
          toast('Domain removed', 'success');
          App.closeModal();
          App.load('domains');
        } else toast(d.error || 'Failed', 'error');
      } catch(e) { toast('Error: ' + e.message, 'error'); }
    });
  };

  var origLoad = App.load.bind(App);
  App.load = function(id){
    if (id === 'domains') {
      document.getElementById('content').innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
      return this.pageDomains();
    }
    return origLoad(id);
  };
})();

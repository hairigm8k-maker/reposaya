(function(){
  if (typeof App === 'undefined') return;

  function card(title, sub, body) {
    return '<div class="card"><div style="font-family:var(--serif);font-size:20px;color:var(--white);margin-bottom:6px">' + title + '</div>' +
      '<p style="color:var(--fog);font-size:13px;margin-bottom:20px;line-height:1.6">' + sub + '</p>' + body + '</div>';
  }

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
      var r = await fetch('/api/custom-domain');
      var d = await r.json();
      if (!d.ok) throw new Error(d.error);

      var r2 = await fetch('/api/site');
      var d2 = await r2.json();
      var sites = (d2.ok && d2.sites) ? d2.sites : [];

      var domains = d.domains || [];

      var domainsHtml = domains.length ? domains.map(function(dom){
        var status = dom.verified
          ? '<span class="badge badge-live" style="font-size:10px">● VERIFIED</span>'
          : '<span class="badge badge-draft" style="font-size:10px">○ PENDING</span>';

        var dnsBox = dom.verified ? '' :
          '<div style="background:var(--panel);border:1px solid var(--border2);border-radius:10px;padding:14px;margin-top:14px">' +
            '<div style="font-size:11px;color:var(--ash);text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:10px">DNS Setup Required</div>' +
            '<div style="font-family:var(--mono);font-size:12px;color:var(--fog);line-height:1.9">' +
              '<div><strong style="color:var(--bone)">Type:</strong> TXT</div>' +
              '<div><strong style="color:var(--bone)">Name:</strong> @</div>' +
              '<div><strong style="color:var(--bone)">Value:</strong> <span style="color:var(--copper);word-break:break-all">' + escHtml(dom.verification_token || 'hh_verify_xxx') + '</span></div>' +
            '</div>' +
            '<button class="btn btn-ghost btn-sm" style="margin-top:10px" onclick="copyText(\'' + escHtml(dom.verification_token || '') + '\')">Copy Value</button>' +
          '</div>';

        return '<div class="card" style="padding:20px 24px;margin-bottom:12px">' +
          '<div style="display:flex;justify-content:space-between;align-items:start;gap:14px;flex-wrap:wrap">' +
            '<div style="flex:1;min-width:0">' +
              '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap">' +
                '<span style="font-size:15px;font-weight:600;color:var(--white);font-family:var(--mono)">' + escHtml(dom.domain) + '</span>' +
                status +
              '</div>' +
              '<div style="font-size:12px;color:var(--fog);font-family:var(--mono)">→ ' + escHtml(dom.subdomain || 'site') + '.hairiamri.buzz</div>' +
              '<div style="font-size:11px;color:var(--ash);margin-top:6px;font-family:var(--mono)">Added ' + timeAgo(dom.created_at) + '</div>' +
              dnsBox +
            '</div>' +
            '<div style="display:flex;gap:6px;flex-shrink:0">' +
              (dom.verified
                ? '<button class="btn btn-ghost btn-sm" onclick="window.open(\'https://' + escHtml(dom.domain) + '\',\'_blank\')">Open</button>'
                : '<button class="btn btn-primary btn-sm" onclick="App.verifyDomain(' + dom.id + ')">Verify</button>') +
              '<button class="btn btn-danger btn-sm" onclick="App.deleteDomain(' + dom.id + ',\'' + escHtml(dom.domain) + '\')">Delete</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('') : '<div class="card" style="text-align:center;padding:60px 40px"><div style="font-family:var(--serif);font-size:22px;color:white;margin-bottom:8px">No custom domains</div><p style="color:var(--ash);font-size:13px">Connect your own domain to any site</p></div>';

      var siteOptions = sites.map(function(s){
        return '<option value="' + s.id + '">' + escHtml(s.name) + ' — ' + escHtml(s.subdomain) + '.hairiamri.buzz</option>';
      }).join('');

      c.innerHTML =
        '<div class="page-head">' +
          '<div class="eyebrow">Publishing</div>' +
          '<h1 class="page-title">Custom Domains</h1>' +
          '<p class="page-sub">Connect your own domain to your HairiHosting site</p>' +
        '</div>' +

        '<div style="max-width:760px;display:flex;flex-direction:column;gap:16px">' +

          card('Add Domain', 'Enter a domain you own. We\'ll generate a verification token.',
            '<div class="field"><label class="label">Select Site</label>' +
              '<select class="select" id="domSite">' + (siteOptions || '<option value="">No sites yet</option>') + '</select></div>' +
            '<div class="field"><label class="label">Domain</label>' +
              '<input type="text" class="input" id="domInput" placeholder="example.com" autocomplete="off">' +
              '<div class="card-meta" style="margin-top:6px">Without http:// or www</div></div>' +
            '<button class="btn btn-primary" id="domAdd" style="width:100%">Add Domain</button>'
          ) +

          '<div style="font-size:13px;color:var(--fog);text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-top:8px">Your Domains</div>' +
          '<div>' + domainsHtml + '</div>' +

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
        btn.disabled = false; btn.textContent = 'Add Domain';
      }
    } catch(e) {
      toast('Error: ' + e.message, 'error');
      btn.disabled = false; btn.textContent = 'Add Domain';
    }
  };

  App.verifyDomain = async function(id){
    var btn = event.target;
    var orig = btn.innerHTML;
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
    try {
      var r = await fetch('/api/custom-domain/verify?id=' + id, { method: 'POST' });
      var d = await r.json();
      if (d.ok) {
        toast('Domain verified!', 'success');
        App.load('domains');
      } else {
        toast(d.error || 'DNS record not found. Wait 5-10 min and retry.', 'error');
        btn.disabled = false; btn.innerHTML = orig;
      }
    } catch(e) {
      toast('Error: ' + e.message, 'error');
      btn.disabled = false; btn.innerHTML = orig;
    }
  };

  App.deleteDomain = function(id, domain){
    App.openModal('Delete Domain', 'Remove "' + domain + '"? This won\'t affect the site itself.', async function(){
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

  // Wrap App.load
  var origLoad = App.load.bind(App);
  App.load = function(id){
    if (id === 'domains') {
      document.getElementById('content').innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
      return this.pageDomains();
    }
    return origLoad(id);
  };
})();

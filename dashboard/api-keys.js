(function(){
  if (typeof App === 'undefined') { console.error('App not found'); return; }

  function copySvg(){ return '<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;vertical-align:-2px;margin-right:5px"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'; }
  function keySvg(){ return '<svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>'; }

  function timeAgo(s) {
    if (!s) return 'Never';
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
      return new Date(t).toLocaleDateString();
    } catch (e) { return s; }
  }

  function fmtDate(s) {
    if (!s) return '—';
    try { return new Date(String(s).replace(' ', 'T') + 'Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch (e) { return s; }
  }

  App.pageApiKeys = async function(){
    var c = document.getElementById('content');
    c.innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
    try {
      var r = await fetch('/api/auth/api-keys');
      var d = await r.json();
      if (!d.ok) throw new Error(d.error);
      var keys = d.keys || [];

      var keysHtml = keys.length ? keys.map(function(k){
        var expired = k.expires_at && new Date(k.expires_at).getTime() < Date.now();
        var expLabel = k.expires_at ? (expired ? 'Expired ' + fmtDate(k.expires_at) : 'Expires ' + fmtDate(k.expires_at)) : 'Never expires';
        return '<div class="card" style="padding:20px 24px;margin-bottom:12px">' +
          '<div style="display:flex;justify-content:space-between;align-items:start;gap:16px;flex-wrap:wrap">' +
            '<div style="flex:1;min-width:0">' +
              '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
                '<span style="color:var(--copper)">' + keySvg() + '</span>' +
                '<span style="font-size:16px;font-weight:600;color:var(--white)">' + escHtml(k.name) + '</span>' +
              '</div>' +
              '<div style="font-family:var(--mono);font-size:12px;color:var(--fog);margin-bottom:8px;letter-spacing:.5px">' + escHtml(k.key_prefix) + '••••••••••••••••</div>' +
              '<div style="display:flex;gap:14px;flex-wrap:wrap;font-size:11px;color:var(--ash);font-family:var(--mono)">' +
                '<span>Created ' + fmtDate(k.created_at) + '</span>' +
                '<span>Last used ' + timeAgo(k.last_used) + '</span>' +
                '<span style="' + (expired ? 'color:#f87171' : '') + '">' + expLabel + '</span>' +
              '</div>' +
            '</div>' +
            '<button class="btn btn-danger btn-sm" onclick="App.revokeApiKey(' + k.id + ',\'' + escHtml(k.name).replace(/\'/g, "&#39;") + '\')">Revoke</button>' +
          '</div>' +
        '</div>';
      }).join('') : '<div class="card" style="text-align:center;padding:60px 40px"><div style="font-family:var(--serif);font-size:22px;color:white;margin-bottom:8px">No API keys yet</div><p style="color:var(--ash);font-size:13px">Create one to get started with programmatic access</p></div>';

      c.innerHTML =
        '<div class="page-head" style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap">' +
          '<div><div class="eyebrow">Account</div><h1 class="page-title">API Keys</h1><p class="page-sub">Programmatic access to your account</p></div>' +
          '<button class="btn btn-primary btn-sm" id="akNewBtn">+ Create API Key</button>' +
        '</div>' +
        '<div style="max-width:720px">' +
          '<div class="card" style="margin-bottom:20px;background:var(--panel);border-color:var(--border2)">' +
            '<div style="font-size:13px;color:var(--fog);line-height:1.7">' +
              '<strong style="color:var(--bone)">How to use:</strong> Include your key in the request header.<br>' +
              '<code style="font-family:var(--mono);font-size:12px;color:var(--copper);background:var(--card);padding:2px 8px;border-radius:4px;display:inline-block;margin-top:6px">Authorization: Bearer hh_live_xxxxx</code>' +
            '</div>' +
          '</div>' +
          keysHtml +
        '</div>' +
        '<div id="akModal"></div>';

      document.getElementById('akNewBtn').onclick = function(){ App.showApiKeyModal(); };
    } catch (e) {
      c.innerHTML = '<div class="card" style="text-align:center;padding:40px"><p style="color:#f87171">Error: ' + escHtml(e.message) + '</p></div>';
    }
  };

  App.showApiKeyModal = function(){
    var m = document.getElementById('akModal');
    m.innerHTML = '<div class="overlay show" onclick="App.closeAkModal()"></div>' +
      '<div class="modal show" style="padding:24px"><div class="modal-box" style="max-width:440px;text-align:left">' +
        '<div class="eyebrow" style="margin-bottom:6px">Create API Key</div>' +
        '<div style="font-family:var(--serif);font-size:22px;color:white;margin-bottom:20px">New API Key</div>' +
        '<div class="field"><label class="label">Name</label>' +
          '<input type="text" class="input" id="akName" maxlength="60" placeholder="e.g. Deploy Bot, CI/CD">' +
          '<div class="card-meta" style="margin-top:6px">Give it a descriptive name</div>' +
        '</div>' +
        '<div class="field"><label class="label">Expires in</label>' +
          '<select class="select" id="akExpires">' +
            '<option value="never">Never</option>' +
            '<option value="30d">30 days</option>' +
            '<option value="90d">90 days</option>' +
            '<option value="1y">1 year</option>' +
          '</select>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px">' +
          '<button class="btn btn-ghost" id="akCancel">Cancel</button>' +
          '<button class="btn btn-primary" id="akCreate">Create Key</button>' +
        '</div>' +
      '</div></div>';

    document.getElementById('akCancel').onclick = function(){ App.closeAkModal(); };
    document.getElementById('akCreate').onclick = function(){ App.createApiKey(); };
    setTimeout(function(){ document.getElementById('akName').focus(); }, 100);
  };

  App.createApiKey = async function(){
    var name = document.getElementById('akName').value.trim();
    var expiresIn = document.getElementById('akExpires').value;
    if (!name) { toast('Name required', 'error'); return; }
    var btn = document.getElementById('akCreate');
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
    try {
      var r = await fetch('/api/auth/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, expires_in: expiresIn })
      });
      var d = await r.json();
      if (!d.ok) throw new Error(d.error);
      App.showApiKeySuccess(d.key, d.name, d.expires_at);
    } catch (e) {
      toast('Error: ' + e.message, 'error');
      btn.disabled = false; btn.textContent = 'Create Key';
    }
  };

  App.showApiKeySuccess = function(key, name, expiresAt){
    var m = document.getElementById('akModal');
    m.innerHTML = '<div class="overlay show"></div>' +
      '<div class="modal show" style="padding:24px"><div class="modal-box" style="max-width:520px;text-align:left">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
          '<svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:#4ade80;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round"><polyline points="20 6 9 17 4 12"/></svg>' +
          '<div class="eyebrow" style="color:#4ade80;margin:0">API Key Created</div>' +
        '</div>' +
        '<div style="font-family:var(--serif);font-size:22px;color:white;margin-bottom:16px">' + escHtml(name) + '</div>' +
        '<div style="padding:14px;background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.3);border-radius:10px;margin-bottom:16px">' +
          '<div style="font-size:13px;color:#fbbf24;font-weight:600;margin-bottom:4px">Copy this key now</div>' +
          '<div style="font-size:12px;color:var(--fog);line-height:1.5">For security, you won\'t be able to see it again. Store it somewhere safe.</div>' +
        '</div>' +
        '<div style="background:var(--panel);border:1px solid var(--border2);border-radius:10px;padding:12px 14px;display:flex;align-items:center;gap:10px;margin-bottom:16px">' +
          '<code id="akKeyText" style="flex:1;font-family:var(--mono);font-size:12px;color:var(--copper);word-break:break-all;line-height:1.5">' + escHtml(key) + '</code>' +
          '<button class="btn btn-ghost btn-sm" id="akCopyBtn" style="flex-shrink:0">' + copySvg() + 'Copy</button>' +
        '</div>' +
        '<div style="font-size:11px;color:var(--ash);margin-bottom:20px">' + (expiresAt ? 'Expires: ' + new Date(expiresAt).toLocaleDateString() : 'Never expires') + '</div>' +
        '<button class="btn btn-primary" id="akDoneBtn" style="width:100%">Done</button>' +
      '</div></div>';

    document.getElementById('akCopyBtn').onclick = function(){
      copyText(key);
      this.innerHTML = '<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:#4ade80;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;vertical-align:-2px;margin-right:5px"><polyline points="20 6 9 17 4 12"/></svg>Copied';
    };
    document.getElementById('akDoneBtn').onclick = function(){
      App.closeAkModal();
      App.load('api-keys');
    };
  };

  App.closeAkModal = function(){
    var m = document.getElementById('akModal');
    if (m) m.innerHTML = '';
  };

  App.revokeApiKey = function(id, name){
    if (!confirm('Revoke "' + name + '"?\n\nAny application using this key will lose access immediately.')) return;
    (async function(){
      try {
        var r = await fetch('/api/auth/api-keys?id=' + id, { method: 'DELETE' });
        var d = await r.json();
        if (d.ok) { toast('API key revoked', 'success'); App.load('api-keys'); }
        else toast(d.error || 'Failed', 'error');
      } catch (e) { toast('Error: ' + e.message, 'error'); }
    })();
  };

  // Wrap App.load untuk handle 'api-keys'
  var origLoad = App.load.bind(App);
  App.load = function(id){
    if (id === 'api-keys') {
      document.getElementById('content').innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
      return this.pageApiKeys();
    }
    return origLoad(id);
  };
})();

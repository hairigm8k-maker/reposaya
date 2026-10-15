// HairiHosting WebAuthn UI — auto-inject into Security page
(function() {
  var wrapped = false;

  function doWrap() {
    if (wrapped) return;
    if (typeof App === 'undefined' || !App.pageSecurity) return;
    wrapped = true;

    var originalPageSecurity = App.pageSecurity;

    App.pageSecurity = async function() {
      await originalPageSecurity.apply(App, arguments);
      // Tunggu original function selesai render
      setTimeout(function() { injectBiometricSection(); }, 150);
    };
  }

  function injectBiometricSection() {
    var c = document.getElementById('content');
    if (!c) return;
    if (document.getElementById('webauthnSection')) return;

    // Cari page-head — inject selepas
    var pageHead = c.querySelector('.page-head');
    if (!pageHead) return;

    var section = document.createElement('div');
    section.id = 'webauthnSection';
    section.style.cssText = 'max-width:720px;margin-top:20px';
    section.innerHTML =
      '<div class="card">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cc9166" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11V7a5 5 0 0 1 10 0v4"/><rect x="3" y="11" width="18" height="11" rx="2"/></svg>' +
          '<div style="font-family:var(--serif);font-size:20px;color:var(--white)">Biometric Login</div>' +
        '</div>' +
        '<p style="color:var(--fog);font-size:13px;line-height:1.6;margin-bottom:16px">Login tanpa password guna cap jari, Face ID, atau Windows Hello. Lebih pantas dan selamat.</p>' +
        '<div id="webauthnList" style="margin-bottom:14px"></div>' +
        '<button id="webauthnAddBtn" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:6px">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
          'Add Biometric' +
        '</button>' +
        '<div id="webauthnMsg" style="margin-top:12px;font-size:12.5px;line-height:1.5"></div>' +
      '</div>';

    // Cari tempat inject — selepas page-head, sebelum "Change Password" card
    var cards = c.querySelectorAll('.card');
    if (cards.length > 0) {
      // Insert section selepas card terakhir (bawah sekali)
      cards[cards.length - 1].parentNode.appendChild(section);
    } else {
      pageHead.parentNode.appendChild(section);
    }

    document.getElementById('webauthnAddBtn').onclick = App.webauthnAdd;
    App.webauthnLoad();
  }

  App.webauthnLoad = async function() {
    var listEl = document.getElementById('webauthnList');
    if (!listEl) return;

    var waited = 0;
    while (!window.HHWebAuthn && waited < 5000) {
      await new Promise(function(r){ setTimeout(r, 200); });
      waited += 200;
    }

    if (!window.HHWebAuthn || !window.HHWebAuthn.isSupported()) {
      listEl.innerHTML = '<p style="color:var(--fog);font-size:12.5px">Peranti ini tidak sokong biometric. Guna Chrome/Safari/Firefox terkini.</p>';
      var btn = document.getElementById('webauthnAddBtn');
      if (btn) btn.disabled = true;
      return;
    }

    try {
      var creds = await window.HHWebAuthn.listCredentials();
      if (!creds || creds.length === 0) {
        listEl.innerHTML = '<p style="color:var(--fog);font-size:12.5px">Belum ada peranti berdaftar.</p>';
        return;
      }
      listEl.innerHTML = creds.map(function(c) {
        var added = c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
        var lastUsed = c.lastUsedAt ? new Date(c.lastUsedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Belum';
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--panel);border:1px solid var(--border);border-radius:8px;margin-bottom:8px">' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-size:13.5px;color:var(--white);font-weight:500;margin-bottom:2px">' + (c.name || 'Biometric') + '</div>' +
            '<div style="font-size:11.5px;color:var(--ash)">Added ' + added + ' • Last used: ' + lastUsed + '</div>' +
          '</div>' +
          '<button onclick="App.webauthnDelete(\'' + c.id + '\')" style="background:transparent;border:1px solid var(--border);color:#f87171;padding:6px 10px;border-radius:6px;font-size:11.5px;cursor:pointer">Remove</button>' +
        '</div>';
      }).join('');
    } catch (err) {
      listEl.innerHTML = '<p style="color:#f87171;font-size:12.5px">Error: ' + err.message + '</p>';
    }
  };

  App.webauthnAdd = async function() {
    var msg = document.getElementById('webauthnMsg');
    var btn = document.getElementById('webauthnAddBtn');

    if (!window.HHWebAuthn || !window.HHWebAuthn.isSupported()) {
      if (msg) msg.innerHTML = '<span style="color:#f87171">Peranti ini tidak sokong biometric.</span>';
      return;
    }

    var label = prompt('Nama peranti (contoh: iPhone saya, MacBook):', 'My Device');
    if (!label) return;

    if (btn) { btn.disabled = true; btn.textContent = 'Menunggu...'; }
    if (msg) msg.innerHTML = '<span style="color:var(--ash)">Sila ikut arahan pada peranti anda...</span>';

    try {
      await window.HHWebAuthn.register(label);
      if (msg) msg.innerHTML = '<span style="color:#4ade80">✓ Biometric berjaya didaftar!</span>';
      App.webauthnLoad();
    } catch (err) {
      if (msg) msg.innerHTML = '<span style="color:#f87171">Gagal: ' + err.message + '</span>';
    }

    if (btn) { btn.disabled = false; btn.textContent = 'Add Biometric'; }
  };

  App.webauthnDelete = async function(id) {
    if (!confirm('Buang biometric ini? Anda tak boleh login guna peranti ini lagi.')) return;
    var msg = document.getElementById('webauthnMsg');
    try {
      await window.HHWebAuthn.deleteCredential(id);
      if (msg) msg.innerHTML = '<span style="color:#4ade80">✓ Berjaya dibuang.</span>';
      App.webauthnLoad();
    } catch (err) {
      if (msg) msg.innerHTML = '<span style="color:#f87171">Gagal: ' + err.message + '</span>';
    }
  };

  // Wait for App to exist
  var check = setInterval(function() {
    if (typeof App !== 'undefined' && App.pageSecurity) {
      clearInterval(check);
      doWrap();
    }
  }, 100);
  // Stop checking after 10s
  setTimeout(function() { clearInterval(check); }, 10000);
})();

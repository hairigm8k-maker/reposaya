(function() {
  var lib = null;
  var libPromise = null;

  async function loadLib() {
    if (lib) return lib;
    if (libPromise) return libPromise;
    libPromise = import('https://esm.sh/@simplewebauthn/browser@11.0.0').then(function(m) {
      lib = m;
      return m;
    });
    return libPromise;
  }

  window.HHWebAuthn = {
    isSupported: function() {
      // Diagnostic — return true always, let call fail naturally
      return true;
    },

    diagnose: function() {
      return {
        hasPublicKey: typeof window.PublicKeyCredential !== 'undefined',
        hasCredentials: typeof navigator.credentials !== 'undefined',
        isSecure: window.isSecureContext === true,
        hasCreate: navigator.credentials && typeof navigator.credentials.create === 'function',
        protocol: window.location.protocol,
        inIframe: window.top !== window.self
      };
    },

    register: async function(name) {
      var l = await loadLib();
      var startRes = await fetch('/api/auth/webauthn/register-start', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      var startData = await startRes.json();
      if (!startData.ok) throw new Error(startData.error || 'Failed to start');
      var attResp = await l.startRegistration({ optionsJSON: startData.options });
      var finishRes = await fetch('/api/auth/webauthn/register-finish', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: attResp, name: name || 'Biometric' })
      });
      var finishData = await finishRes.json();
      if (!finishData.ok) throw new Error(finishData.error || 'Failed');
      return finishData;
    },

    login: async function(email) {
      var l = await loadLib();
      var startRes = await fetch('/api/auth/webauthn/login-start', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      });
      var startData = await startRes.json();
      if (!startData.ok) throw new Error(startData.error || 'Failed');
      var authResp = await l.startAuthentication({ optionsJSON: startData.options });
      var finishRes = await fetch('/api/auth/webauthn/login-finish', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: authResp, userId: startData.userId })
      });
      var finishData = await finishRes.json();
      if (!finishData.ok) throw new Error(finishData.error || 'Failed');
      return finishData;
    },

    listCredentials: async function() {
      var res = await fetch('/api/auth/webauthn/credentials', { credentials: 'include' });
      var data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed');
      return data.credentials || [];
    },

    deleteCredential: async function(id) {
      var res = await fetch('/api/auth/webauthn/credentials?id=' + encodeURIComponent(id), {
        method: 'DELETE', credentials: 'include'
      });
      var data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed');
      return true;
    }
  };
})();

// HairiHosting WebAuthn Helper — uses bundled SimpleWebAuthnBrowser
(function() {
  function getLib() {
    return window.SimpleWebAuthnBrowser;
  }

  window.HHWebAuthn = {
    isSupported: function() {
      try {
        var lib = getLib();
        if (!lib || !lib.browserSupportsWebAuthn) return false;
        return lib.browserSupportsWebAuthn();
      } catch (e) { return false; }
    },

    register: async function(name) {
      if (!this.isSupported()) throw new Error('Biometric not supported');
      var lib = getLib();

      var startRes = await fetch('/api/auth/webauthn/register-start', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      var startData = await startRes.json();
      if (!startData.ok) throw new Error(startData.error || 'Failed to start');

      var attResp = await lib.startRegistration({ optionsJSON: startData.options });

      var finishRes = await fetch('/api/auth/webauthn/register-finish', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: attResp, name: name || 'Biometric' })
      });
      var finishData = await finishRes.json();
      if (!finishData.ok) throw new Error(finishData.error || 'Failed to register');
      return finishData;
    },

    login: async function(email) {
      if (!this.isSupported()) throw new Error('Biometric not supported');
      var lib = getLib();

      var startRes = await fetch('/api/auth/webauthn/login-start', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      });
      var startData = await startRes.json();
      if (!startData.ok) throw new Error(startData.error || 'Failed to start');

      var authResp = await lib.startAuthentication({ optionsJSON: startData.options });

      var finishRes = await fetch('/api/auth/webauthn/login-finish', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: authResp, userId: startData.userId })
      });
      var finishData = await finishRes.json();
      if (!finishData.ok) throw new Error(finishData.error || 'Failed to login');
      return finishData;
    },

    listCredentials: async function() {
      var res = await fetch('/api/auth/webauthn/credentials', { credentials: 'include' });
      var data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to list');
      return data.credentials || [];
    },

    deleteCredential: async function(id) {
      var res = await fetch('/api/auth/webauthn/credentials?id=' + encodeURIComponent(id), {
        method: 'DELETE', credentials: 'include'
      });
      var data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to delete');
      return true;
    }
  };

  console.log('HHWebAuthn loaded:', window.HHWebAuthn.isSupported());
})();

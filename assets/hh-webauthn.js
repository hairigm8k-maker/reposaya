// HairiHosting WebAuthn Helper
// Guna @simplewebauthn/browser dari esm.sh

import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn
} from 'https://esm.sh/@simplewebauthn/browser@11.0.0';

window.HHWebAuthn = {
  isSupported() {
    try {
      return browserSupportsWebAuthn();
    } catch (e) {
      return false;
    }
  },

  async register(name) {
    if (!this.isSupported()) {
      throw new Error('Biometric tidak disokong pada peranti ini');
    }
    // 1. Get options from server
    const startRes = await fetch('/api/auth/webauthn/register-start', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    const startData = await startRes.json();
    if (!startData.ok) throw new Error(startData.error || 'Failed to start');

    // 2. Browser prompt biometric
    const attResp = await startRegistration({ optionsJSON: startData.options });

    // 3. Send to server
    const finishRes = await fetch('/api/auth/webauthn/register-finish', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: attResp, name: name || 'Biometric' })
    });
    const finishData = await finishRes.json();
    if (!finishData.ok) throw new Error(finishData.error || 'Failed to register');
    return finishData;
  },

  async login(email) {
    if (!this.isSupported()) {
      throw new Error('Biometric tidak disokong pada peranti ini');
    }
    // 1. Get options from server
    const startRes = await fetch('/api/auth/webauthn/login-start', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const startData = await startRes.json();
    if (!startData.ok) throw new Error(startData.error || 'Failed to start');

    // 2. Browser prompt biometric
    const authResp = await startAuthentication({ optionsJSON: startData.options });

    // 3. Send to server
    const finishRes = await fetch('/api/auth/webauthn/login-finish', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: authResp, userId: startData.userId })
    });
    const finishData = await finishRes.json();
    if (!finishData.ok) throw new Error(finishData.error || 'Failed to login');
    return finishData;
  },

  async listCredentials() {
    const res = await fetch('/api/auth/webauthn/credentials', { credentials: 'include' });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Failed to list');
    return data.credentials || [];
  },

  async deleteCredential(id) {
    const res = await fetch('/api/auth/webauthn/credentials?id=' + encodeURIComponent(id), {
      method: 'DELETE',
      credentials: 'include'
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Failed to delete');
    return true;
  }
};

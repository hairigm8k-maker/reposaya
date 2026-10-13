(function(){
  if (typeof App === 'undefined') return;
  function card(title, sub, body) {
    return '<div class="card"><div style="font-family:var(--serif);font-size:20px;color:var(--white);margin-bottom:6px">' + title + '</div><p style="color:var(--fog);font-size:13px;margin-bottom:20px;line-height:1.6">' + sub + '</p>' + body + '</div>';
  }
  function toggle(id, label, desc, checked) {
    return '<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid var(--border)"><div style="flex:1;min-width:0"><div style="font-size:14px;color:var(--white);font-weight:500;margin-bottom:3px">' + label + '</div>' + (desc ? '<div style="font-size:12px;color:var(--ash);line-height:1.5">' + desc + '</div>' : '') + '</div><label style="position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0;cursor:pointer"><input type="checkbox" id="' + id + '" ' + (checked ? 'checked' : '') + ' style="opacity:0;width:0;height:0"><span style="position:absolute;inset:0;background:' + (checked ? 'var(--copper)' : 'var(--panel)') + ';border:1px solid ' + (checked ? 'var(--copper)' : 'var(--border2)') + ';border-radius:9999px;transition:.2s"></span></label></div>';
  }
  function select(id, label, opts, val) {
    return '<div class="field"><label class="label">' + label + '</label><select class="select" id="' + id + '">' + opts.map(function(o){ return '<option value="' + o.v + '"' + (o.v === val ? ' selected' : '') + '>' + o.l + '</option>'; }).join('') + '</select></div>';
  }
  App.applyZoomLock = function(locked) {
    var meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return;
    if (locked) {
      meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      document.documentElement.style.touchAction = 'pan-x pan-y';
      document.body.style.touchAction = 'pan-x pan-y';
    } else {
      meta.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
      document.documentElement.style.touchAction = '';
      document.body.style.touchAction = '';
    }
  };
  App.pageSettings = async function(){
    var c = document.getElementById('content');
    c.innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
    try {
      var r = await fetch('/api/auth/settings');
      var d = await r.json();
      if (!d.ok) throw new Error(d.error);
      var s = d.settings;
      var tzList = [{v:'Asia/Kuala_Lumpur',l:'Kuala Lumpur (GMT+8)'},{v:'Asia/Singapore',l:'Singapore (GMT+8)'},{v:'Asia/Jakarta',l:'Jakarta (GMT+7)'},{v:'Asia/Bangkok',l:'Bangkok (GMT+7)'},{v:'Asia/Manila',l:'Manila (GMT+8)'},{v:'UTC',l:'UTC'}];
      c.innerHTML =
        '<div class="page-head"><div class="eyebrow">Account</div><h1 class="page-title">Settings</h1><p class="page-sub">Preferences, defaults and notifications</p></div>' +
        '<div style="max-width:720px;display:flex;flex-direction:column;gap:20px">' +
          card('Appearance', 'Customize how the dashboard looks.',
            toggle('setReduceAnim', 'Reduce animations', 'Faster transitions, less motion', s.appearance.reduceAnimations) +
            toggle('setLockZoom', 'Lock screen zoom', 'Prevent pinch-to-zoom (kiosk style)', s.appearance.lockZoom || false)
          ) +
          card('Language & Region', 'Set your language and timezone.',
            select('setLang', 'Language', [{v:'en',l:'English'},{v:'ms',l:'Bahasa Melayu'}], s.region.language) +
            select('setTz', 'Timezone', tzList, s.region.timezone) +
            select('setDateFormat', 'Date format', [{v:'dmy',l:'13 Oct 2026'},{v:'ymd',l:'2026-10-13'},{v:'mdy',l:'Oct 13, 2026'}], s.region.dateFormat)
          ) +
          card('Defaults', 'Applied when creating new sites.',
            select('setTpl', 'Default template', [{v:'blank',l:'Blank'},{v:'bio',l:'Link in Bio'},{v:'product',l:'Product Landing'},{v:'portfolio',l:'Portfolio'}], s.defaults.template) +
            '<div class="field"><label class="label">Subdomain prefix</label><input type="text" class="input" id="setPrefix" value="' + escHtml(s.defaults.subdomainPrefix || '') + '" placeholder="e.g. hairi-" maxlength="15"></div>' +
            toggle('setAutoPub', 'Auto-publish on create', 'Skip draft and go live', s.defaults.autoPublish)
          ) +
          card('Notifications', 'Email alerts for account activity.',
            toggle('setEmailLogin', 'Email on new sign-in', 'Alert when account signs in from new device', s.notifications.emailLogin) +
            toggle('setEmailPublish', 'Email on publish', 'Alert each time a site goes live', s.notifications.emailPublish) +
            toggle('setEmailWeekly', 'Weekly summary', 'Visitor stats and activity recap', s.notifications.emailWeekly)
          ) +
          card('Data', 'Cleanup and privacy.',
            toggle('setAutoDelAna', 'Auto-delete analytics after 90 days', 'Keeps database lean', s.data.autoDeleteAnalytics) +
            toggle('setAutoDelDep', 'Auto-delete deployments after 180 days', 'Keeps history manageable', s.data.autoDeleteDeployments)
          ) +
          '<div><button class="btn btn-primary" id="setSave" style="width:100%">Save Settings</button></div>' +
        '</div>';
      c.querySelectorAll('input[type=checkbox]').forEach(function(cb){
        cb.addEventListener('change', function(){
          var span = cb.nextElementSibling;
          if (cb.checked) { span.style.background = 'var(--copper)'; span.style.borderColor = 'var(--copper)'; }
          else { span.style.background = 'var(--panel)'; span.style.borderColor = 'var(--border2)'; }
        });
      });
      document.getElementById('setSave').onclick = function(){ App.saveSettings(); };
    } catch (e) {
      c.innerHTML = '<div class="card" style="text-align:center;padding:40px"><p style="color:#f87171">Error: ' + escHtml(e.message) + '</p></div>';
    }
  };
  App.saveSettings = async function(){
    var payload = {
      appearance: { reduceAnimations: document.getElementById('setReduceAnim').checked, lockZoom: document.getElementById('setLockZoom').checked },
      region: { language: document.getElementById('setLang').value, timezone: document.getElementById('setTz').value, dateFormat: document.getElementById('setDateFormat').value },
      defaults: { template: document.getElementById('setTpl').value, subdomainPrefix: document.getElementById('setPrefix').value.trim(), autoPublish: document.getElementById('setAutoPub').checked },
      notifications: { emailLogin: document.getElementById('setEmailLogin').checked, emailPublish: document.getElementById('setEmailPublish').checked, emailWeekly: document.getElementById('setEmailWeekly').checked },
      data: { autoDeleteAnalytics: document.getElementById('setAutoDelAna').checked, autoDeleteDeployments: document.getElementById('setAutoDelDep').checked }
    };
    var btn = document.getElementById('setSave');
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
    try {
      var r = await fetch('/api/auth/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      var d = await r.json();
      if (d.ok) { toast('Settings saved', 'success'); App.applyZoomLock(payload.appearance.lockZoom); }
      else toast(d.error || 'Failed', 'error');
    } catch (e) { toast('Error: ' + e.message, 'error'); }
    btn.disabled = false; btn.textContent = 'Save Settings';
  };
  setTimeout(async function(){
    try {
      var r = await fetch('/api/auth/settings');
      var d = await r.json();
      if (d.ok && d.settings && d.settings.appearance && d.settings.appearance.lockZoom) App.applyZoomLock(true);
    } catch (e) {}
  }, 1500);
  var origLoad = App.load.bind(App);
  App.load = function(id){
    if (id === 'settings') {
      document.getElementById('content').innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
      return this.pageSettings();
    }
    return origLoad(id);
  };
})();

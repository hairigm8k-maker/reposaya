(function(){
  if (typeof App === 'undefined') { console.error('App not found'); return; }

  App.pageProfile = async function(){
    var c = document.getElementById('content');
    c.innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
    try {
      var r = await fetch('/api/auth/session');
      var d = await r.json();
      if (!d.ok || !d.authenticated) throw new Error('Not logged in');
      var u = d.user;
      var initial = ((u.name || u.email || 'U').charAt(0) || 'U').toUpperCase();
      var avatarHtml = u.avatar_url
        ? '<img id="pfAvatarImg" src="' + u.avatar_url + '" style="width:96px;height:96px;border-radius:50%;object-fit:cover;border:2px solid var(--border2)">'
        : '<div id="pfAvatarImg" style="width:96px;height:96px;border-radius:50%;background:var(--panel);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:36px;color:var(--copper)">' + escHtml(initial) + '</div>';

      c.innerHTML =
        '<div class="page-head"><div class="eyebrow">Account</div><h1 class="page-title">Profile</h1><p class="page-sub">Manage your public profile</p></div>' +
        '<div class="card" style="max-width:720px">' +
          '<div style="display:flex;gap:24px;align-items:center;margin-bottom:28px;flex-wrap:wrap">' +
            '<div>' + avatarHtml + '</div>' +
            '<div style="flex:1;min-width:200px">' +
              '<div style="font-size:14px;font-weight:500;color:var(--bone);margin-bottom:8px">Profile Picture</div>' +
              '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
                '<button class="btn btn-ghost btn-sm" id="pfUploadBtn">Upload Photo</button>' +
                '<button class="btn btn-danger btn-sm" id="pfRemoveBtn" ' + (u.avatar_url ? '' : 'style="display:none"') + '>Remove</button>' +
              '</div>' +
              '<div class="card-meta" style="margin-top:8px">Max 1.5MB · JPG, PNG, GIF, WebP</div>' +
              '<input type="file" id="pfFileInput" accept="image/*" style="display:none">' +
            '</div>' +
          '</div>' +
          '<div class="field"><label class="label">Display Name</label>' +
            '<input type="text" class="input" id="pfName" maxlength="40" placeholder="Your name" value="' + escHtml(u.name || '') + '">' +
            '<div class="card-meta" style="margin-top:6px">2-40 characters</div></div>' +
          '<div class="field"><label class="label">Username</label>' +
            '<input type="text" class="input" id="pfUsername" maxlength="20" placeholder="username" value="' + escHtml(u.username || '') + '" style="font-family:var(--mono);text-transform:lowercase">' +
            '<div class="card-meta" id="pfUserHint" style="margin-top:6px">hairiamri.buzz/u/' + (u.username ? escHtml(u.username) : '<span style="color:var(--ash)">username</span>') + '</div></div>' +
          '<div class="field"><label class="label">Bio</label>' +
            '<textarea class="editor-area" id="pfBio" maxlength="160" style="min-height:80px;font-family:var(--sans);font-size:14px" placeholder="Tell people about you...">' + escHtml(u.bio || '') + '</textarea>' +
            '<div class="card-meta" id="pfBioCount" style="margin-top:6px;text-align:right">' + (u.bio || '').length + ' / 160</div></div>' +
          '<div class="field"><label class="label">Website (optional)</label>' +
            '<input type="text" class="input" id="pfWebsite" placeholder="https://example.com" value="' + escHtml(u.website || '') + '"></div>' +
          '<div class="field"><label class="label">Email</label>' +
            '<input type="email" class="input" value="' + escHtml(u.email) + '" readonly style="opacity:.6;cursor:not-allowed">' +
            '<div class="card-meta" style="margin-top:6px">Email change requires verification — coming in Security</div></div>' +
          '<div style="margin-top:24px"><button class="btn btn-primary" id="pfSaveBtn" style="width:100%">Save Changes</button></div>' +
        '</div>';

      var nameEl = document.getElementById('pfName');
      var userEl = document.getElementById('pfUsername');
      var bioEl = document.getElementById('pfBio');
      var bioCnt = document.getElementById('pfBioCount');
      var userHint = document.getElementById('pfUserHint');
      var fileInp = document.getElementById('pfFileInput');
      var checkTimer = null;

      bioEl.addEventListener('input', function(){ bioCnt.textContent = bioEl.value.length + ' / 160'; });

      userEl.addEventListener('input', function(){
        var v = userEl.value.trim().toLowerCase().replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
        userEl.value = v;
        if (checkTimer) clearTimeout(checkTimer);
        if (!v || v.length < 3) {
          userHint.innerHTML = 'hairiamri.buzz/u/<span style="color:var(--ash)">username</span>';
          return;
        }
        userHint.innerHTML = 'hairiamri.buzz/u/' + escHtml(v) + ' <span style="color:var(--ash)">checking...</span>';
        checkTimer = setTimeout(function(){
          fetch('/api/user/check-username?u=' + encodeURIComponent(v))
            .then(function(r){ return r.json(); })
            .then(function(x){
              if (x.ok && x.available) userHint.innerHTML = 'hairiamri.buzz/u/' + escHtml(v) + ' <span style="color:#4ade80">available</span>';
              else if (x.ok) userHint.innerHTML = 'hairiamri.buzz/u/' + escHtml(v) + ' <span style="color:#f87171">' + escHtml(x.reason || 'taken') + '</span>';
              else userHint.innerHTML = 'hairiamri.buzz/u/' + escHtml(v);
            })
            .catch(function(){ userHint.innerHTML = 'hairiamri.buzz/u/' + escHtml(v); });
        }, 400);
      });

      document.getElementById('pfUploadBtn').onclick = function(){ fileInp.click(); };
      fileInp.onchange = function(e){ if (e.target.files[0]) App.uploadAvatar(e.target.files[0]); };
      document.getElementById('pfRemoveBtn').onclick = function(){ App.removeAvatar(); };
      document.getElementById('pfSaveBtn').onclick = function(){ App.saveProfile(); };
    } catch (e) {
      c.innerHTML = '<div class="card" style="text-align:center;padding:40px"><p style="color:#f87171">Error: ' + escHtml(e.message) + '</p></div>';
    }
  };

  App.uploadAvatar = async function(file){
    if (file.size > 1.5 * 1024 * 1024) { toast('File too large (max 1.5MB)','error'); return; }
    var fd = new FormData();
    fd.append('file', file);
    toast('Uploading...','info');
    try {
      var r = await fetch('/api/auth/avatar', { method: 'POST', body: fd });
      var d = await r.json();
      if (d.ok) {
        toast('Avatar updated','success');
        App.load('profile');
        var tb = document.getElementById('tbUser');
        if (tb) { tb.textContent = ''; tb.style.backgroundImage = 'url(' + d.avatar_url + ')'; tb.style.backgroundSize = 'cover'; tb.style.backgroundPosition = 'center'; }
      } else toast(d.error || 'Upload failed','error');
    } catch (e) { toast('Error: ' + e.message,'error'); }
  };

  App.removeAvatar = async function(){
    if (!confirm('Remove profile picture?')) return;
    try {
      var r = await fetch('/api/auth/avatar', { method: 'DELETE' });
      var d = await r.json();
      if (d.ok) { toast('Avatar removed','success'); App.load('profile'); }
      else toast(d.error || 'Failed','error');
    } catch (e) { toast('Error: ' + e.message,'error'); }
  };

  App.saveProfile = async function(){
    var name = document.getElementById('pfName').value.trim();
    var username = document.getElementById('pfUsername').value.trim().toLowerCase();
    var bio = document.getElementById('pfBio').value.trim();
    var website = document.getElementById('pfWebsite').value.trim();
    if (!name) { toast('Name required','error'); return; }
    var btn = document.getElementById('pfSaveBtn');
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
    try {
      var r = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, username: username, bio: bio, website: website })
      });
      var d = await r.json();
      if (d.ok) {
        toast('Profile saved','success');
        var sess = await fetch('/api/auth/session');
        var sd = await sess.json();
        if (sd.ok && sd.authenticated) {
          App.user = sd.user;
          var tb = document.getElementById('tbUser');
          if (tb && !sd.user.avatar_url) tb.textContent = ((sd.user.name || sd.user.email || 'U').charAt(0) || 'U').toUpperCase();
        }
      } else toast(d.error || 'Failed','error');
    } catch (e) { toast('Error: ' + e.message,'error'); }
    btn.disabled = false; btn.textContent = 'Save Changes';
  };

  // Wrap App.load supaya route 'profile' pergi ke pageProfile
  var origLoad = App.load.bind(App);
  App.load = function(id){
    if (id === 'profile') {
      document.getElementById('content').innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
      return this.pageProfile();
    }
    return origLoad(id);
  };

  // Update header avatar bila init (kalau user ada avatar_url)
  var origInit = App.init.bind(App);
  App.init = async function(){
    var r = await this.checkAuth();
    if (!r) return;
    var u = this.user;
    if (u && u.avatar_url) {
      var tb = document.getElementById('tbUser');
      if (tb) { tb.textContent = ''; tb.style.backgroundImage = 'url(' + u.avatar_url + ')'; tb.style.backgroundSize = 'cover'; tb.style.backgroundPosition = 'center'; }
    }
    return origInit();
  };
})();

// ═══════════════════════════════════════════
// EDITOR MODULE
// Extend App dengan pageEditor, switchTab, openPreview
// ═══════════════════════════════════════════

(function() {
  'use strict';

  // Helper escape
  function escHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Wait for App to be ready
  var waitForApp = setInterval(function() {
    if (typeof window.App === 'undefined') return;
    clearInterval(waitForApp);

    var App = window.App;

    // ═══════════════════════════════════════════
    // PAGE EDITOR
    // ═══════════════════════════════════════════
    App.pageEditor = async function(siteId) {
      var content = document.getElementById('content');

      try {
        var res = await fetch('/api/sites/' + siteId);
        var data = await res.json();

        if (!data.ok) {
          content.innerHTML =
            '<div class="card" style="text-align:center;padding:40px;">' +
              '<p style="color:#f87171;">Site tak jumpa</p>' +
              '<button class="btn btn-primary btn-sm" style="margin-top:16px;" onclick="App.go(\'sites\')">← Balik</button>' +
            '</div>';
          return;
        }

        var site = data.site;

        content.innerHTML =
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">' +
            '<div>' +
              '<div class="eyebrow">Editor</div>' +
              '<h1 class="page-title" style="margin-bottom:0;">' + escHtml(site.name) + '</h1>' +
              '<p class="page-sub" style="margin-top:4px;font-family:var(--mono);font-size:12px;color:#cc9166;">' + escHtml(site.subdomain) + '.hairiamri.buzz · ' + site.status.toUpperCase() + '</p>' +
            '</div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
              '<button class="btn btn-ghost btn-sm" onclick="App.go(\'sites\')">← Balik</button>' +
              '<button class="btn btn-ghost btn-sm" onclick="App.openPreview(\'' + site.subdomain + '\')">👁 Preview</button>' +
              '<button class="btn btn-ghost btn-sm" id="btnUploadZip">📦 Upload ZIP</button>' +
              '<input type="file" id="zipFileInput" accept=".zip" style="display:none;">' +
              '<button class="btn btn-primary btn-sm" id="saveBtn">💾 Save</button>' +
            '</div>' +
          '</div>' +

          '<div class="card" style="padding:0;overflow:hidden;">' +
            '<div style="display:flex;border-bottom:1px solid var(--border);">' +
              '<button class="tab-btn tab-active" data-tab="html" onclick="App.switchTab(\'html\')">HTML</button>' +
              '<button class="tab-btn" data-tab="css" onclick="App.switchTab(\'css\')">CSS</button>' +
              '<button class="tab-btn" data-tab="js" onclick="App.switchTab(\'js\')">JS</button>' +
            '</div>' +
            '<div style="padding:16px;">' +
              '<textarea class="editor-area" id="editorHTML" spellcheck="false" style="display:block;">' + escHtml(site.html || '') + '</textarea>' +
              '<textarea class="editor-area" id="editorCSS" spellcheck="false" style="display:none;">' + escHtml(site.css || '') + '</textarea>' +
              '<textarea class="editor-area" id="editorJS" spellcheck="false" style="display:none;">' + escHtml(site.js || '') + '</textarea>' +
            '</div>' +
          '</div>' +

          '<div style="margin-top:20px;padding:20px;background:var(--card);border:1px solid var(--border);border-radius:10px;">' +
            '<div style="font-size:14px;color:var(--fog);margin-bottom:12px;">Selepas siap, klik Publish untuk site jadi LIVE.</div>' +
            '<button class="btn btn-primary btn-sm" id="publishBtn" style="background:#4ade80;color:#000;">🚀 Publish Site</button>' +
          '</div>';

        // Save handler
        // --- LOGIK UPLOAD ZIP ---
        var btnUploadZip = document.getElementById('btnUploadZip');
        var zipFileInput = document.getElementById('zipFileInput');
        
        if (btnUploadZip && zipFileInput) {
          btnUploadZip.onclick = function() { zipFileInput.click(); };
          
          zipFileInput.onchange = async function(e) {
            var file = e.target.files[0];
            if (!file) return;
            
            btnUploadZip.innerHTML = '⏳ Processing...';
            btnUploadZip.disabled = true;
            
            try {
              if (typeof JSZip === 'undefined') throw new Error('JSZip library tak jumpa.');
              
              var zip = await JSZip.loadAsync(file);
              var indexHtml = '';
              var assets = [];
              var promises = [];
              
              zip.forEach(function(relativePath, zipEntry) {
                if (relativePath.includes('__MACOSX') || relativePath.includes('.DS_Store')) return;
                
                if (relativePath.endsWith('index.html')) {
                  promises.push(zipEntry.async('string').then(function(text) { indexHtml = text; }));
                } else if (!zipEntry.dir) {
                  promises.push(zipEntry.async('base64').then(function(b64) {
                    assets.push({ filename: relativePath.split('/').pop(), data: b64 });
                  }));
                }
              });
              
              await Promise.all(promises);
              if (!indexHtml) throw new Error('index.html tak jumpa dalam ZIP.');
              
              // Upload Assets (Gambar/CSS/JS)
              for (var i=0; i<assets.length; i++) {
                await fetch('/api/files/upload', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ site_id: siteId, filename: assets[i].filename, data: assets[i].data })
                });
              }
              
              // Update HTML Site
              await fetch('/api/sites/' + siteId, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html: indexHtml })
              });
              
              alert('✅ ZIP berjaya di-extract dan disimpan!');
              App.pageEditor(siteId); // Reload page
              
            } catch (err) {
              alert('❌ Gagal: ' + err.message);
            } finally {
              btnUploadZip.innerHTML = '📦 Upload ZIP';
              btnUploadZip.disabled = false;
              zipFileInput.value = '';
            }
          };
        }
        // --- TAMAT LOGIK ZIP ---

        var saveBtn = document.getElementById('saveBtn');
        saveBtn.onclick = async function() {
          saveBtn.disabled = true;
          saveBtn.innerHTML = '<span class="spinner"></span> Saving...';

          try {
            var r = await fetch('/api/sites/' + siteId, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                html: document.getElementById('editorHTML').value,
                css: document.getElementById('editorCSS').value,
                js: document.getElementById('editorJS').value
              })
            });
            var d = await r.json();
            if (d.ok) {
              if (window.toast) window.toast('Saved!', 'success');
            } else {
              if (window.toast) window.toast(d.error || 'Gagal save', 'error');
            }
          } catch (e) {
            if (window.toast) window.toast('Error: ' + e.message, 'error');
          }
          saveBtn.disabled = false;
          saveBtn.innerHTML = '💾 Save';
        };

        // Publish handler
        var publishBtn = document.getElementById('publishBtn');
        publishBtn.onclick = async function() {
          if (!confirm('Publish site? Site akan LIVE dan accessible.')) return;
          publishBtn.disabled = true;
          publishBtn.innerHTML = '<span class="spinner"></span> Publishing...';

          await fetch('/api/sites/' + siteId, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              html: document.getElementById('editorHTML').value,
              css: document.getElementById('editorCSS').value,
              js: document.getElementById('editorJS').value,
              status: 'live'
            })
          });

          if (window.toast) window.toast('Site LIVE! 🚀', 'success');
          publishBtn.disabled = false;
          publishBtn.innerHTML = '✅ Published';
        };

      } catch (err) {
        content.innerHTML = '<div class="card" style="text-align:center;padding:40px;"><p style="color:#f87171;">Error: ' + err.message + '</p></div>';
      }
    };

    // ═══════════════════════════════════════════
    // SWITCH TAB
    // ═══════════════════════════════════════════
    App.switchTab = function(tab) {
      document.querySelectorAll('.tab-btn').forEach(function(b) {
        b.classList.remove('tab-active');
      });
      var btn = document.querySelector('.tab-btn[data-tab="' + tab + '"]');
      if (btn) btn.classList.add('tab-active');

      ['html', 'css', 'js'].forEach(function(t) {
        var el = document.getElementById('editor' + t.toUpperCase());
        if (el) el.style.display = t === tab ? 'block' : 'none';
      });
    };

    // ═══════════════════════════════════════════
    // OPEN PREVIEW
    // ═══════════════════════════════════════════
    App.openPreview = function(subdomain) {
      window.open('/preview/' + subdomain, '_blank');
    };

    console.log('✅ Editor module loaded');
  }, 50);
})();

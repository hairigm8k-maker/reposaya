// ===== CUSTOM MODAL SYSTEM =====
// Override confirm, alert, prompt dengan design consistent Slash theme

(function(){
  function ensureContainer() {
    var el = document.getElementById('modContainer');
    if (!el) {
      el = document.createElement('div');
      el.id = 'modContainer';
      document.body.appendChild(el);
    }
    return el;
  }

  function showModal(opts) {
    return new Promise(function(resolve) {
      var container = ensureContainer();
      var overlay = document.createElement('div');
      overlay.className = 'mod-overlay';
      
      var inputHtml = opts.input ? 
        '<input class="mod-input" id="modInputEl" type="' + (opts.inputType || 'text') + '" placeholder="' + (opts.placeholder || '') + '" value="' + (opts.defaultValue || '').replace(/"/g, '&quot;') + '">' : '';
      
      overlay.innerHTML = 
        '<div class="mod-card">' +
          '<div class="mod-title">' + (opts.title || (opts.type === 'confirm' ? 'Confirm' : opts.type === 'prompt' ? 'Input' : 'Notice')) + '</div>' +
          '<div class="mod-body">' + (opts.message || '') + '</div>' +
          inputHtml +
          '<div class="mod-actions">' +
            (opts.type === 'alert' ? '' : '<button class="mod-btn-cancel" id="modCancel">' + (opts.cancelText || 'Cancel') + '</button>') +
            '<button class="mod-btn-ok ' + (opts.danger ? 'mod-btn-danger' : '') + '" id="modOk">' + (opts.okText || 'OK') + '</button>' +
          '</div>' +
        '</div>';
      
      container.appendChild(overlay);
      
      // Show animation
      requestAnimationFrame(function(){ overlay.classList.add('show'); });
      
      var okBtn = overlay.querySelector('#modOk');
      var cancelBtn = overlay.querySelector('#modCancel');
      var inputEl = overlay.querySelector('#modInputEl');
      
      function close(result) {
        overlay.classList.remove('show');
        setTimeout(function(){ overlay.remove(); }, 200);
        resolve(result);
      }
      
      okBtn.onclick = function() {
        if (opts.type === 'prompt') close(inputEl ? inputEl.value : '');
        else close(true);
      };
      
      if (cancelBtn) cancelBtn.onclick = function() { close(false); };
      
      // ESC key
      function onKey(e) {
        if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); close(false); }
        if (e.key === 'Enter' && opts.input) { document.removeEventListener('keydown', onKey); close(inputEl.value); }
        if (e.key === 'Enter' && !opts.input) { document.removeEventListener('keydown', onKey); close(true); }
      }
      document.addEventListener('keydown', onKey);
      
      // Click outside
      overlay.onclick = function(e) {
        if (e.target === overlay) { close(false); }
      };
      
      // Auto-focus input
      if (inputEl) setTimeout(function(){ inputEl.focus(); inputEl.select(); }, 100);
    });
  }

  window.App = window.App || {};
  
  App.confirm = function(message, opts) {
    opts = opts || {};
    return showModal({
      type: 'confirm',
      title: opts.title || 'Confirm',
      message: message,
      okText: opts.okText || 'Confirm',
      cancelText: opts.cancelText || 'Cancel',
      danger: opts.danger || false
    });
  };
  
  App.alert = function(message, opts) {
    opts = opts || {};
    return showModal({
      type: 'alert',
      title: opts.title || 'Notice',
      message: message,
      okText: opts.okText || 'OK'
    });
  };
  
  App.prompt = function(message, opts) {
    opts = opts || {};
    return showModal({
      type: 'prompt',
      title: opts.title || 'Input',
      message: message,
      okText: opts.okText || 'Submit',
      cancelText: opts.cancelText || 'Cancel',
      input: true,
      inputType: opts.inputType || 'text',
      placeholder: opts.placeholder || '',
      defaultValue: opts.defaultValue || ''
    });
  };
})();

(function(){
  if (typeof App === 'undefined') return;

  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function wordCount(s){ return (s || '').split(/\s+/).filter(Boolean).length; }

  var currentFilter = 'All';
  var categories = ['All'];

  function buildCategories(){
    var P = window.PROMPTS || [];
    categories = ['All'];
    P.forEach(function(p){
      (p.category || []).forEach(function(c){
        if (categories.indexOf(c) < 0) categories.push(c);
      });
    });
  }

  function injectCSS(){
    if (document.getElementById('pgCSS')) return;
    var s = document.createElement('style');
    s.id = 'pgCSS';
    s.textContent =
      '.pg-wrap{max-width:1000px;margin:0 auto}' +
      '.pg-tag{display:inline-block;border:1px solid var(--copper);color:var(--copper);padding:6px 14px;border-radius:50px;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-bottom:24px;font-family:var(--mono)}' +
      '.pg-h1{font-family:var(--serif);font-size:clamp(36px,8vw,60px);line-height:1.1;font-weight:400;margin-bottom:20px;letter-spacing:-.02em;color:var(--white)}' +
      '.pg-sub{color:var(--fog);font-size:clamp(15px,3.5vw,17px);max-width:650px;line-height:1.6;margin-bottom:48px}' +
      '.pg-ww{display:flex;flex-wrap:wrap;align-items:center;gap:24px;padding-top:24px;border-top:1px solid var(--border);margin-bottom:40px}' +
      '.pg-ww-label{font-size:12px;color:var(--ash);letter-spacing:2px;font-weight:600;text-transform:uppercase;font-family:var(--mono)}' +
      '.pg-logos{display:flex;align-items:center;gap:24px;flex-wrap:wrap}' +
      '.pg-logo{display:flex;align-items:center;gap:8px;color:var(--fog);font-size:14px;font-weight:500;letter-spacing:.5px}' +
      '.pg-logo svg{width:22px;height:22px;display:block}' +
      '.pg-cats{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:36px}' +
      '.pg-pill{background:var(--panel);border:1px solid var(--border2);color:var(--fog);padding:11px 22px;border-radius:50px;font-size:14px;font-family:inherit;cursor:pointer;transition:all .2s;font-weight:500}' +
      '.pg-pill:hover{border-color:var(--copper);color:var(--copper)}' +
      '.pg-pill.active{background:var(--copper);border-color:var(--copper);color:#000;font-weight:600}' +
      '.pg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}' +
      '@media(max-width:640px){.pg-grid{grid-template-columns:1fr}.pg-ww{flex-direction:column;align-items:flex-start;gap:16px}}' +
      '.pg-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:22px;cursor:pointer;transition:all .2s;display:flex;flex-direction:column;min-height:200px}' +
      '.pg-card:hover{border-color:var(--copper);transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.4)}' +
      '.pg-card-tag{display:inline-block;font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--copper);background:rgba(204,145,102,.12);padding:4px 10px;border-radius:9999px;margin-bottom:14px;align-self:flex-start}' +
      '.pg-card-title{font-family:var(--serif);font-size:19px;color:var(--white);font-weight:400;line-height:1.25;margin-bottom:10px}' +
      '.pg-card-desc{font-size:13px;color:var(--fog);line-height:1.6;margin-bottom:16px;flex:1}' +
      '.pg-card-meta{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:14px;border-top:1px solid var(--border);margin-top:auto}' +
      '.pg-card-len{font-size:11px;color:var(--ash);font-family:var(--mono)}' +
      '.pg-card-ais{display:flex;gap:6px;align-items:center;opacity:.7}' +
      '.pg-card-ais svg{width:14px;height:14px;display:block}';
    document.head.appendChild(s);
  }

  // SVG icons
  function svgOpenAI(size){
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 260" width="' + size + '" height="' + size + '" style="display:block"><path fill="#fff" d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z"/></svg>';
  }
  function svgClaude(size){
    return '<svg fill="#D97757" viewBox="0 0 24 24" width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg" style="display:block"><path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/></svg>';
  }
  function svgCopilot(size){
    var uid = 'cp' + Math.random().toString(36).slice(2, 8);
    return '<svg viewBox="0 0 48 48" width="' + size + '" height="' + size + '" style="display:block" xmlns="http://www.w3.org/2000/svg" fill="none"><path d="M34.1423 7.32501C33.5634 5.35387 31.7547 4 29.7003 4L28.3488 4C26.1142 4 24.1985 5.59611 23.7952 7.79398L21.4805 20.4072L22.0549 18.4419C22.6319 16.4679 24.4419 15.1111 26.4986 15.1111H34.3524L37.6462 16.3942L40.8213 15.1111H39.8946C37.8401 15.1111 36.0315 13.7572 35.4525 11.7861L34.1423 7.32501Z" fill="url(#' + uid + '-a)"/><path d="M14.3307 40.656C14.9032 42.6366 16.7165 44 18.7783 44H21.6486C24.1592 44 26.2122 41.999 26.2767 39.4893L26.5893 27.3271L25.9354 29.5602C25.3577 31.5332 23.5481 32.8889 21.4923 32.8889L13.5732 32.8889L10.7499 31.3573L7.69336 32.8889H8.60461C10.6663 32.8889 12.4796 34.2522 13.0521 36.2329L14.3307 40.656Z" fill="url(#' + uid + '-b)"/><path d="M29.4993 4H13.46C8.87732 4 6.12772 10.0566 4.29466 16.1132C2.12296 23.2886 -0.718769 32.8852 7.50252 32.8852H14.4282C16.4978 32.8852 18.3147 31.5168 18.8835 29.5269C20.0876 25.3143 22.1978 17.9655 23.8554 12.3712C24.6977 9.52831 25.3993 7.08673 26.4762 5.56628C27.0799 4.71385 28.086 4 29.4993 4Z" fill="url(#' + uid + '-c)"/><path d="M18.498 44H34.5374C39.12 44 41.8696 37.9424 43.7027 31.8848C45.8744 24.7081 48.7161 15.1098 40.4948 15.1098H33.5693C31.4996 15.1098 29.6827 16.4784 29.114 18.4684C27.9098 22.6817 25.7996 30.032 24.142 35.6273C23.2996 38.4708 22.598 40.9127 21.5212 42.4335C20.9175 43.286 19.9113 44 18.498 44Z" fill="url(#' + uid + '-d)"/><defs><radialGradient id="' + uid + '-a" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(38.005 20.5144) rotate(-129.304) scale(17.3033 16.2706)"><stop offset="0.0955758" stop-color="#00AEFF"/><stop offset="0.773185" stop-color="#2253CE"/><stop offset="1" stop-color="#0736C4"/></radialGradient><radialGradient id="' + uid + '-b" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(11.1215 32.8171) rotate(51.84) scale(15.9912 15.5119)"><stop stop-color="#FFB657"/><stop offset="0.633728" stop-color="#FF5F3D"/><stop offset="0.923392" stop-color="#C02B3C"/></radialGradient><linearGradient id="' + uid + '-c" x1="12.5" y1="7.5" x2="14.7884" y2="33.9751" gradientUnits="userSpaceOnUse"><stop offset="0.156162" stop-color="#0D91E1"/><stop offset="0.487484" stop-color="#52B471"/><stop offset="0.652394" stop-color="#98BD42"/><stop offset="0.937361" stop-color="#FFC800"/></linearGradient><radialGradient id="' + uid + '-d" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(41.3187 12.2813) rotate(109.274) scale(38.3873 45.9867)"><stop offset="0.0661714" stop-color="#8C48FF"/><stop offset="0.5" stop-color="#F2598A"/><stop offset="0.895833" stop-color="#FFB152"/></radialGradient></defs></svg>';
  }

  App.pagePrompts = function(){
    injectCSS();
    buildCategories();
    var c = document.getElementById('content');
    var P = window.PROMPTS || [];

    c.innerHTML =
      '<div class="pg-wrap">' +
        '<div class="pg-tag">Prompt Library</div>' +
        '<h1 class="pg-h1">Build websites with AI<br>in seconds</h1>' +
        '<p class="pg-sub">Copy a ready-made prompt, paste into OpenAI, Claude, or Copilot. Get a full website instantly.</p>' +
        '<div class="pg-ww">' +
          '<span class="pg-ww-label">Works with</span>' +
          '<div class="pg-logos">' +
            '<div class="pg-logo">' + svgOpenAI(22) + '<span>OpenAI</span></div>' +
            '<div class="pg-logo">' + svgClaude(22) + '<span>Claude</span></div>' +
            '<div class="pg-logo">' + svgCopilot(22) + '<span>Copilot</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="pg-cats" id="pgCats"></div>' +
        '<div class="pg-grid" id="pgGrid"></div>' +
        '<div id="pgModal"></div>' +
      '</div>';

    renderFilters();
    renderGrid();
  };

  function renderFilters(){
    var el = document.getElementById('pgCats');
    if (!el) return;
    el.innerHTML = categories.map(function(cat){
      return '<button class="pg-pill' + (cat === currentFilter ? ' active' : '') + '" data-cat="' + esc(cat) + '">' + esc(cat) + '</button>';
    }).join('');
    el.querySelectorAll('.pg-pill').forEach(function(btn){
      btn.onclick = function(){
        currentFilter = btn.dataset.cat;
        renderFilters();
        renderGrid();
      };
    });
  }

  function renderGrid(){
    var el = document.getElementById('pgGrid');
    if (!el) return;
    var P = window.PROMPTS || [];
    var filtered = P.filter(function(p){
      if (currentFilter === 'All') return true;
      return (p.category || []).indexOf(currentFilter) >= 0;
    });
    if (!filtered.length){
      el.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--fog)">No prompts in this category.</div>';
      return;
    }
    el.innerHTML = filtered.map(function(p){
      var wc = wordCount(p.body);
      return '<div class="pg-card" data-id="' + esc(p.id) + '">' +
        '<div class="pg-card-tag">' + esc(p.tag) + '</div>' +
        '<div class="pg-card-title">' + esc(p.title) + '</div>' +
        '<div class="pg-card-desc">' + esc(p.desc) + '</div>' +
        '<div class="pg-card-meta">' +
          '<span class="pg-card-len">' + wc + ' words</span>' +
          '<div class="pg-card-ais">' + svgOpenAI(14) + svgClaude(14) + svgCopilot(14) + '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    el.querySelectorAll('.pg-card').forEach(function(card){
      card.onclick = function(){
        var p = P.find(function(x){ return x.id === card.dataset.id; });
        if (p) openModal(p);
      };
    });
  }

  function openModal(p){
    var m = document.getElementById('pgModal');
    if (!m) return;
    var wc = wordCount(p.body);
    m.innerHTML =
      '<div class="overlay show" onclick="App.closePromptModal()"></div>' +
      '<div class="modal show" style="padding:20px"><div class="modal-box" style="max-width:900px;width:100%;text-align:left;max-height:90vh;display:flex;flex-direction:column">' +
        '<div style="display:flex;justify-content:space-between;align-items:start;gap:16px;padding-bottom:16px;border-bottom:1px solid var(--border);margin-bottom:20px">' +
          '<div><div style="font-family:var(--serif);font-size:24px;color:var(--white);font-weight:400;line-height:1.2">' + esc(p.title) + '</div>' +
          '<div style="font-size:13px;color:var(--fog);margin-top:6px;line-height:1.5">' + esc(p.desc) + '</div>' +
          '<div style="font-size:11px;color:var(--ash);font-family:var(--mono);margin-top:10px">' + wc + ' words · ' + esc(p.tag) + '</div></div>' +
          '<button onclick="App.closePromptModal()" style="width:34px;height:34px;border-radius:50%;border:1px solid var(--border2);color:var(--fog);flex-shrink:0;font-size:18px;line-height:1;background:transparent;cursor:pointer">×</button>' +
        '</div>' +
        '<div style="flex:1;overflow-y:auto;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:18px;margin-bottom:16px">' +
          '<pre style="font-family:var(--mono);white-space:pre-wrap;word-wrap:break-word;font-size:12px;color:var(--bone);line-height:1.65">' + esc(p.body) + '</pre>' +
        '</div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
          '<button class="btn btn-primary btn-sm" id="pgCopyBtn">' +
            '<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;vertical-align:-2px;margin-right:6px"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copy Prompt' +
          '</button>' +
          '<button class="btn btn-ghost btn-sm" onclick="App.closePromptModal()">Close</button>' +
        '</div>' +
      '</div></div>';
    document.body.style.overflow = 'hidden';
    document.getElementById('pgCopyBtn').onclick = function(){
      navigator.clipboard.writeText(p.body).then(function(){
        toast('Prompt copied to clipboard', 'success');
        var btn = document.getElementById('pgCopyBtn');
        btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;vertical-align:-2px;margin-right:6px"><polyline points="20 6 9 17 4 12"/></svg>Copied!';
        setTimeout(function(){
          btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;vertical-align:-2px;margin-right:6px"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copy Prompt';
        }, 1800);
      }).catch(function(){ toast('Copy failed', 'error'); });
    };
  }

  App.closePromptModal = function(){
    var m = document.getElementById('pgModal');
    if (m) m.innerHTML = '';
    document.body.style.overflow = '';
  };

  var origLoad = App.load.bind(App);
  App.load = function(id){
    if (id === 'prompts') {
      document.getElementById('content').innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
      return this.pagePrompts();
    }
    return origLoad(id);
  };
})();

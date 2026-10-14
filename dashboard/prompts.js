(function(){
  if (typeof App === 'undefined') return;

  // === Inject CSS sekali ===
  function injectCSS(){
    if (document.getElementById('pgStyles')) return;
    var s = document.createElement('style');
    s.id = 'pgStyles';
    s.textContent =
      '.pg-hero{padding:32px 0 40px;border-bottom:1px solid var(--border);margin-bottom:32px;position:relative}' +
      '.pg-hero::after{content:"";position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:600px;height:400px;background:radial-gradient(circle,rgba(204,145,102,.10) 0%,transparent 65%);pointer-events:none;z-index:0}' +
      '.pg-eyebrow{display:inline-block;font-family:var(--mono);font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--copper);padding:5px 14px;border:1px solid rgba(204,145,102,.3);border-radius:9999px;margin-bottom:20px;position:relative;z-index:1}' +
      '.pg-h1{font-family:var(--serif);font-weight:400;font-size:clamp(32px,5vw,44px);color:var(--white);line-height:1.15;letter-spacing:-.02em;margin-bottom:14px;position:relative;z-index:1;max-width:820px}' +
      '.pg-sub{font-size:15px;color:var(--fog);line-height:1.6;max-width:640px;position:relative;z-index:1}' +
      '.pg-ai-strip{display:flex;align-items:center;gap:24px;flex-wrap:wrap;padding:20px 0 28px;border-bottom:1px solid var(--border);margin-bottom:28px}' +
      '.pg-ai-label{font-family:var(--mono);font-size:11px;color:var(--ash);text-transform:uppercase;letter-spacing:.1em;font-weight:600;flex-shrink:0}' +
      '.pg-ai-list{display:flex;gap:20px;align-items:center;flex-wrap:wrap}' +
      '.pg-ai-item{display:flex;align-items:center;gap:8px;opacity:.85;transition:opacity .2s}' +
      '.pg-ai-item:hover{opacity:1}' +
      '.pg-ai-item span{font-size:12px;color:var(--fog);font-family:var(--mono);font-weight:500}' +
      '.pg-filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px}' +
      '.pg-filter{padding:8px 16px;border:1px solid var(--border2);border-radius:9999px;font-size:13px;color:var(--fog);cursor:pointer;transition:all .15s;font-weight:500;background:var(--card);font-family:inherit}' +
      '.pg-filter:hover{border-color:var(--copper);color:var(--copper)}' +
      '.pg-filter.active{background:var(--copper);color:#000;border-color:var(--copper);font-weight:600}' +
      '.pg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:18px;margin-bottom:40px}' +
      '@media(max-width:640px){.pg-grid{grid-template-columns:1fr;gap:14px}}' +
      '.pg-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:22px;cursor:pointer;transition:all .2s;position:relative;overflow:hidden;display:flex;flex-direction:column;min-height:220px}' +
      '.pg-card:hover{border-color:var(--copper);transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.4)}' +
      '.pg-tag{display:inline-block;font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--copper);background:rgba(204,145,102,.12);padding:4px 10px;border-radius:9999px;margin-bottom:14px;align-self:flex-start}' +
      '.pg-title{font-family:var(--serif);font-size:19px;color:var(--white);font-weight:400;line-height:1.25;margin-bottom:10px;letter-spacing:-.01em}' +
      '.pg-desc{font-size:13px;color:var(--fog);line-height:1.6;margin-bottom:16px;flex:1}' +
      '.pg-meta{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:14px;border-top:1px solid var(--border);margin-top:auto}' +
      '.pg-len{font-size:11px;color:var(--ash);font-family:var(--mono)}' +
      '.pg-ais{display:flex;gap:6px;align-items:center;opacity:.65}' +
      '.pg-ais svg{width:14px;height:14px;display:block}';
    document.head.appendChild(s);
  }

  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function wordCount(s){ return (s || '').split(/\s+/).filter(Boolean).length; }

  var currentFilter = 'All';
  var categories = ['All'];

  function buildCategories(){
    var PROMPTS = window.PROMPTS || [];
    categories = ['All'];
    PROMPTS.forEach(function(p){
      (p.category || []).forEach(function(c){
        if (categories.indexOf(c) < 0) categories.push(c);
      });
    });
  }

  function aiIcon(name, size){
    size = size || 16;
if (name === 'openai') return '<svg viewBox="0 0 256 260" width="' + size + '" height="' + size + '" style="display:block" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z"/></svg>';
        return '';
  }

  App.pagePrompts = function(){
    injectCSS();
    buildCategories();
    var c = document.getElementById('content');
    var PROMPTS = window.PROMPTS || [];

    if (!PROMPTS.length) {
      c.innerHTML = '<div class="card" style="text-align:center;padding:60px"><p style="color:#f87171">Failed to load prompts data.</p></div>';
      return;
    }

    c.innerHTML =
      '<div style="max-width:1200px">' +

        '<div class="pg-hero">' +
          '<span class="pg-eyebrow">Prompt Library</span>' +
          '<h1 class="pg-h1">Build websites with AI in seconds</h1>' +
          '<p class="pg-sub">Copy a ready-made prompt, paste into DeepSeek, ChatGPT, Claude, Gemini, or Copilot. Get a full website instantly.</p>' +
        '</div>' +

        '<div class="pg-ai-strip">' +
          '<div class="pg-ai-label">Works with</div>' +
          '<div class="pg-ai-list">' +
            '<div class="pg-ai-item">' + aiIcon('gpt', 22) + '<span>ChatGPT</span></div>' +
            '<div class="pg-ai-item">' + aiIcon('claude', 22) + '<span>Claude</span></div>' +
            '<div class="pg-ai-item">' + aiIcon('copilot', 22) + '<span>Copilot</span></div>' +
          '</div>' +
        '</div>' +

        '<div class="pg-filters" id="pgFilters"></div>' +

        '<div class="pg-grid" id="pgGrid"></div>' +

        '<div id="pgModal"></div>' +
      '</div>';

    renderFilters();
    renderGrid();
  };

  function renderFilters(){
    var el = document.getElementById('pgFilters');
    if (!el) return;
    el.innerHTML = categories.map(function(cat){
      return '<button class="pg-filter' + (cat === currentFilter ? ' active' : '') + '" data-cat="' + esc(cat) + '">' + esc(cat) + '</button>';
    }).join('');
    el.querySelectorAll('.pg-filter').forEach(function(btn){
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
    var PROMPTS = window.PROMPTS || [];
    var filtered = PROMPTS.filter(function(p){
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
        '<div class="pg-tag">' + esc(p.tag) + '</div>' +
        '<div class="pg-title">' + esc(p.title) + '</div>' +
        '<div class="pg-desc">' + esc(p.desc) + '</div>' +
        '<div class="pg-meta">' +
          '<span class="pg-len">' + wc + ' words</span>' +
          '<div class="pg-ais">' +
            aiIcon('openai', 14) + aiIcon('claude', 14) + aiIcon('copilot', 14) +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    el.querySelectorAll('.pg-card').forEach(function(card){
      card.onclick = function(){
        var p = PROMPTS.find(function(x){ return x.id === card.dataset.id; });
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
      '<div class="modal show" style="padding:20px">' +
        '<div class="modal-box" style="max-width:900px;width:100%;text-align:left;max-height:90vh;display:flex;flex-direction:column">' +
          '<div style="display:flex;justify-content:space-between;align-items:start;gap:16px;padding-bottom:16px;border-bottom:1px solid var(--border);margin-bottom:20px">' +
            '<div>' +
              '<div style="font-family:var(--serif);font-size:24px;color:var(--white);font-weight:400;line-height:1.2">' + esc(p.title) + '</div>' +
              '<div style="font-size:13px;color:var(--fog);margin-top:6px;line-height:1.5">' + esc(p.desc) + '</div>' +
              '<div style="font-size:11px;color:var(--ash);font-family:var(--mono);margin-top:10px">' + wc + ' words · ' + esc(p.tag) + '</div>' +
            '</div>' +
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
        '</div>' +
      '</div>';
    document.body.style.overflow = 'hidden';
    document.getElementById('pgCopyBtn').onclick = function(){
      navigator.clipboard.writeText(p.body).then(function(){
        var btn = document.getElementById('pgCopyBtn');
        btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;vertical-align:-2px;margin-right:6px"><polyline points="20 6 9 17 4 12"/></svg>Copied!';
        toast('Prompt copied to clipboard', 'success');
        setTimeout(function(){
          btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;vertical-align:-2px;margin-right:6px"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copy Prompt';
        }, 1800);
      }).catch(function(){ toast('Copy failed', 'error'); });
    };
    var escFn = function(e){ if (e.key === 'Escape') { App.closePromptModal(); document.removeEventListener('keydown', escFn); } };
    document.addEventListener('keydown', escFn);
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

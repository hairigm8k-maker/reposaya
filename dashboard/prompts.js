(function(){
  if (typeof App === 'undefined') return;

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

  function icon(name, color, size){
    size = size || 16;
    var paths = {
      ds: '<path fill="#4D6BFE" d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 0 1-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 0 0-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 0 1-.465.137 9.597 9.597 0 0 0-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 0 0 1.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588z"/>',
      gpt: '<path fill="#fff" d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Z"/>',
      gemini: '<path fill="#fff" d="M141.201 4.886c2.282-6.17 11.042-6.071 13.184.148l5.985 17.37a184.004 184.004 0 0 0 111.257 113.049l19.304 6.997c6.143 2.227 6.156 10.91.02 13.155l-19.35 7.082a184.001 184.001 0 0 0-109.495 109.385l-7.573 20.629c-2.241 6.105-10.869 6.121-13.133.025l-7.908-21.296a184 184 0 0 0-109.02-108.658l-19.698-7.239c-6.102-2.243-6.118-10.867-.025-13.132l20.083-7.467A183.998 183.998 0 0 0 133.291 26.28l7.91-21.394Z"/>',
      claude: '<path fill="#D97757" d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/>',
      copilot: '<path fill="#4B73FF" d="M36.069 0c19.92 0 36.068 16.155 36.068 36.084v13.713h12.004c19.92 0 36.069 16.156 36.069 36.084 0 19.928-16.149 36.083-36.069 36.083H0v-85.88C0 16.155 16.148 0 36.069 0Z"/>'
    };
    var viewBox = name === 'gpt' ? '0 0 256 260' : (name === 'gemini' ? '0 0 296 298' : (name === 'copilot' ? '0 0 121 122' : '0 0 24 24'));
    var style = name === 'gpt' ? 'background:#000;border-radius:50%;padding:3px;' : '';
    return '<svg viewBox="' + viewBox + '" style="width:' + size + 'px;height:' + size + 'px;' + style + 'display:block" xmlns="http://www.w3.org/2000/svg">' + (paths[name] || '') + '</svg>';
  }

  App.pagePrompts = function(){
    buildCategories();
    var c = document.getElementById('content');
    var PROMPTS = window.PROMPTS || [];

    if (!PROMPTS.length) {
      c.innerHTML = '<div class="card" style="text-align:center;padding:60px"><p style="color:#f87171">Failed to load prompts data.</p></div>';
      return;
    }

    c.innerHTML =
      '<div class="page-head">' +
        '<div class="eyebrow">Sites</div>' +
        '<h1 class="page-title">Prompt Gallery</h1>' +
        '<p class="page-sub">Copy ready-made prompts for AI to build your website. Works with DeepSeek, ChatGPT, Claude, Gemini, and Copilot.</p>' +
      '</div>' +

      // AI strip
      '<div class="card" style="padding:20px 24px;margin-bottom:20px;display:flex;align-items:center;gap:24px;flex-wrap:wrap">' +
        '<div style="font-family:var(--mono);font-size:11px;color:var(--ash);text-transform:uppercase;letter-spacing:.1em;font-weight:600">Compatible with</div>' +
        '<div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">' +
          '<div style="display:flex;align-items:center;gap:8px">' + icon('ds', '#4D6BFE', 22) + '<span style="font-size:12px;color:var(--fog);font-family:var(--mono)">DeepSeek</span></div>' +
          '<div style="display:flex;align-items:center;gap:8px">' + icon('gpt', '#fff', 22) + '<span style="font-size:12px;color:var(--fog);font-family:var(--mono)">ChatGPT</span></div>' +
          '<div style="display:flex;align-items:center;gap:8px">' + icon('gemini', '#fff', 22) + '<span style="font-size:12px;color:var(--fog);font-family:var(--mono)">Gemini</span></div>' +
          '<div style="display:flex;align-items:center;gap:8px">' + icon('claude', '#D97757', 22) + '<span style="font-size:12px;color:var(--fog);font-family:var(--mono)">Claude</span></div>' +
          '<div style="display:flex;align-items:center;gap:8px">' + icon('copilot', '#4B73FF', 22) + '<span style="font-size:12px;color:var(--fog);font-family:var(--mono)">Copilot</span></div>' +
        '</div>' +
      '</div>' +

      // Filters
      '<div id="prFilters" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px"></div>' +

      // Grid
      '<div class="nf-grid" id="prGrid"></div>' +

      // Modal container
      '<div id="prModal"></div>';

    renderFilters();
    renderGrid();
  };

  function renderFilters(){
    var el = document.getElementById('prFilters');
    if (!el) return;
    el.innerHTML = categories.map(function(cat){
      var active = cat === currentFilter;
      return '<button class="btn btn-sm ' + (active ? 'btn-primary' : 'btn-ghost') + '" data-cat="' + esc(cat) + '" style="padding:7px 16px;font-size:12.5px">' + esc(cat) + '</button>';
    }).join('');
    el.querySelectorAll('button').forEach(function(btn){
      btn.onclick = function(){
        currentFilter = btn.dataset.cat;
        renderFilters();
        renderGrid();
      };
    });
  }

  function renderGrid(){
    var el = document.getElementById('prGrid');
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
      return '<div class="nf-card" data-id="' + esc(p.id) + '">' +
        '<div class="nf-thumb" style="background:radial-gradient(circle at 30% 30%,rgba(204,145,102,.15) 0%,rgba(8,8,10,1) 70%)">' +
          '<svg viewBox="0 0 24 24" style="width:56px;height:56px;stroke:var(--copper);fill:none;stroke-width:1.2;stroke-linecap:round;stroke-linejoin:round;opacity:.85"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' +
        '</div>' +
        '<div class="nf-info">' +
          '<div class="nf-name" title="' + esc(p.title) + '">' + esc(p.title) + '</div>' +
          '<div class="nf-meta">' +
            '<span class="nf-badge">' + esc(p.tag) + '</span>' +
            '<span style="font-family:var(--mono);font-size:10px;color:var(--ash)">' + wc + ' words</span>' +
          '</div>' +
          '<div style="font-size:11px;color:var(--ash);margin-top:8px;line-height:1.35;max-height:44px;overflow:hidden">' + esc(p.desc) + '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    el.querySelectorAll('.nf-card').forEach(function(card){
      card.onclick = function(){
        var p = PROMPTS.find(function(x){ return x.id === card.dataset.id; });
        if (p) openModal(p);
      };
    });
  }

  function openModal(p){
    var m = document.getElementById('prModal');
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
            '<button onclick="App.closePromptModal()" style="width:34px;height:34px;border-radius:50%;border:1px solid var(--border2);color:var(--fog);flex-shrink:0;font-size:18px;line-height:1">×</button>' +
          '</div>' +
          '<div style="flex:1;overflow-y:auto;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:18px;margin-bottom:16px">' +
            '<pre style="font-family:var(--mono);white-space:pre-wrap;word-wrap:break-word;font-size:12px;color:var(--bone);line-height:1.65">' + esc(p.body) + '</pre>' +
          '</div>' +
          '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
            '<button class="btn btn-primary btn-sm" id="prCopyBtn"><svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;vertical-align:-2px;margin-right:6px"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copy Prompt</button>' +
            '<button class="btn btn-ghost btn-sm" onclick="App.closePromptModal()">Close</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.style.overflow = 'hidden';
    document.getElementById('prCopyBtn').onclick = function(){
      navigator.clipboard.writeText(p.body).then(function(){
        var btn = document.getElementById('prCopyBtn');
        btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;vertical-align:-2px;margin-right:6px"><polyline points="20 6 9 17 4 12"/></svg>Copied!';
        toast('Prompt copied to clipboard', 'success');
        setTimeout(function(){
          btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;vertical-align:-2px;margin-right:6px"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copy Prompt';
        }, 1800);
      }).catch(function(){ toast('Copy failed', 'error'); });
    };
    document.addEventListener('keydown', function esc(e){
      if (e.key === 'Escape') { App.closePromptModal(); document.removeEventListener('keydown', esc); }
    });
  }

  App.closePromptModal = function(){
    var m = document.getElementById('prModal');
    if (m) m.innerHTML = '';
    document.body.style.overflow = '';
  };

  // Route
  var origLoad = App.load.bind(App);
  App.load = function(id){
    if (id === 'prompts') {
      document.getElementById('content').innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
      return this.pagePrompts();
    }
    return origLoad(id);
  };
})();

(function(){
  var PROMPTS = window.PROMPTS || [];
  var currentFilter = 'All';
  var categories = ['All'];

  // Build category list
  PROMPTS.forEach(function(p){
    (p.category || []).forEach(function(c){
      if (categories.indexOf(c) < 0) categories.push(c);
    });
  });

  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function wordCount(s){ return (s || '').split(/\s+/).filter(Boolean).length; }

  function toast(msg, type){
    var w = document.getElementById('toastWrap');
    if (!w) return;
    var e = document.createElement('div');
    e.className = 'toast ' + (type || '');
    e.textContent = msg;
    w.appendChild(e);
    setTimeout(function(){ e.style.opacity = '0'; e.style.transition = 'opacity .3s'; setTimeout(function(){ e.remove(); }, 300); }, 2500);
  }

  function renderFilters(){
    var el = document.getElementById('filters');
    if (!el) return;
    el.innerHTML = categories.map(function(c){
      return '<button class="filter' + (c === currentFilter ? ' active' : '') + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
    }).join('');
    el.querySelectorAll('.filter').forEach(function(btn){
      btn.onclick = function(){
        currentFilter = btn.dataset.cat;
        renderFilters();
        renderGrid();
      };
    });
  }

  function renderGrid(){
    var el = document.getElementById('grid');
    if (!el) return;
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
      return '<div class="card" data-id="' + esc(p.id) + '">' +
        '<div class="card-tag">' + esc(p.tag) + '</div>' +
        '<div class="card-title">' + esc(p.title) + '</div>' +
        '<div class="card-desc">' + esc(p.desc) + '</div>' +
        '<div class="card-meta">' +
          '<span class="card-len">' + wc + ' words</span>' +
          '<div class="card-ais">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4D6BFE" d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 0 1-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 0 0-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 0 1-.465.137 9.597 9.597 0 0 0-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 0 0 1.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 0 1 1.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 0 1 .415-.287.302.302 0 0 1 .2.288.306.306 0 0 1-.31.307.303.303 0 0 1-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 0 1-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 0 1 .016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 0 1-.254-.078.253.253 0 0 1-.114-.358c.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z"/></svg>' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 260"><path fill="#fff" d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Z"/></svg>' +
            '<svg fill="#D97757" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/></svg>' +
            '<svg viewBox="0 0 121 122" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><mask id="cpm' + esc(p.id) + '" width="121" height="122" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path fill="url(#a' + esc(p.id) + ')" fill-rule="evenodd" d="M36.069 0c19.92 0 36.068 16.155 36.068 36.084v13.713h12.004c19.92 0 36.069 16.156 36.069 36.084 0 19.928-16.149 36.083-36.069 36.083H0v-85.88C0 16.155 16.148 0 36.069 0Z" clip-rule="evenodd"/></mask><g mask="url(#cpm' + esc(p.id) + ')"><ellipse cx="52.738" cy="65.101" fill="#4B73FF" rx="81.373" ry="81.192"/><ellipse cx="61.673" cy="20.547" fill="#FF66F4" rx="104.216" ry="81.192"/><ellipse cx="78.666" cy="5.268" fill="#FF0105" rx="81.373" ry="71.304"/><ellipse cx="63.121" cy="20.527" fill="#FE7B02" rx="48.937" ry="48.829"/></g><defs><linearGradient id="a' + esc(p.id) + '" x1="40.453" x2="76.933" y1="21.433" y2="121.971" gradientUnits="userSpaceOnUse"><stop offset=".025" stop-color="#FF8E63"/><stop offset=".56" stop-color="#FF7EB0"/><stop offset=".95" stop-color="#4B73FF"/></linearGradient></defs></svg>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    el.querySelectorAll('.card').forEach(function(card){
      card.onclick = function(){
        var p = PROMPTS.find(function(x){ return x.id === card.dataset.id; });
        if (p) openModal(p);
      };
    });
  }

  function openModal(p){
    document.getElementById('mTitle').textContent = p.title;
    document.getElementById('mSub').textContent = p.desc;
    document.getElementById('mBody').textContent = p.body;
    document.getElementById('modal').classList.add('show');
    document.body.style.overflow = 'hidden';
    // Store current prompt for copy
    document.getElementById('mCopy').dataset.prompt = p.body;
  }

  function closeModal(){
    document.getElementById('modal').classList.remove('show');
    document.body.style.overflow = '';
  }

  window.closeModal = closeModal;

  document.addEventListener('DOMContentLoaded', function(){
    renderFilters();
    renderGrid();

    var copyBtn = document.getElementById('mCopy');
    if (copyBtn){
      copyBtn.onclick = function(){
        var text = copyBtn.dataset.prompt || '';
        navigator.clipboard.writeText(text).then(function(){
          var orig = copyBtn.innerHTML;
          copyBtn.innerHTML = '✓ Copied!';
          copyBtn.style.background = '#4ade80';
          setTimeout(function(){
            copyBtn.innerHTML = orig;
            copyBtn.style.background = '';
          }, 1500);
          toast('Prompt copied to clipboard', 'success');
        }).catch(function(){
          toast('Failed to copy. Select manually.', '');
        });
      };
    }

    // Esc to close
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') closeModal();
    });

    // Click outside modal-box to close
    var modal = document.getElementById('modal');
    if (modal){
      modal.onclick = function(e){
        if (e.target === modal) closeModal();
      };
    }
  });
})();

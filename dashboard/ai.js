(function(){
  if (typeof App === 'undefined') return;

  App.showAIModal = function(){
    var m = document.createElement('div');
    m.id = 'aiModal';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(4px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto';
    m.innerHTML =
      '<div style="background:var(--card);border:1px solid var(--border2);border-radius:16px;padding:28px;max-width:680px;width:100%;margin:auto;position:relative">' +
        '<button onclick="App.closeAIModal()" style="position:absolute;top:14px;right:14px;width:32px;height:32px;border-radius:50%;background:transparent;border:1px solid var(--border2);color:var(--fog);cursor:pointer;font-size:16px;line-height:1">×</button>' +
        '<div style="font-family:var(--serif);font-size:24px;color:var(--white);margin-bottom:6px;letter-spacing:-.02em">✨ Generate with AI</div>' +
        '<p style="color:var(--fog);font-size:13.5px;margin-bottom:24px;line-height:1.5">Describe your website. AI akan generate full HTML page dengan design responsive.</p>' +
        '<div class="field"><label class="label">What is your website about?</label>' +
          '<textarea class="editor-area" id="aiTopic" placeholder="Contoh: Kedai kopi di Kuala Lumpur yang jual kopi specialty dan pastry homemade. Target customer: office worker di KLCC." style="min-height:100px;font-family:var(--sans);font-size:14px;line-height:1.5" maxlength="300"></textarea>' +
          '<div class="card-meta" style="margin-top:6px;text-align:right"><span id="aiTopicCount">0</span> / 300</div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">' +
          '<div class="field" style="margin-bottom:0"><label class="label">Style</label>' +
            '<select class="select" id="aiStyle">' +
              '<option value="modern minimalist">Modern Minimalist</option>' +
              '<option value="bold and colorful">Bold & Colorful</option>' +
              '<option value="dark and premium">Dark & Premium</option>' +
              '<option value="elegant and editorial">Elegant & Editorial</option>' +
              '<option value="playful and friendly">Playful & Friendly</option>' +
              '<option value="corporate and professional">Corporate & Professional</option>' +
            '</select></div>' +
          '<div class="field" style="margin-bottom:0"><label class="label">Language</label>' +
            '<select class="select" id="aiLang">' +
              '<option value="en">English</option>' +
              '<option value="ms">Bahasa Melayu</option>' +
            '</select></div>' +
        '</div>' +
        '<div id="aiAlert"></div>' +
        '<div style="display:flex;gap:10px">' +
          '<button class="btn btn-ghost" style="flex:1" onclick="App.closeAIModal()">Cancel</button>' +
          '<button class="btn btn-primary" style="flex:2" id="aiGenerateBtn">✨ Generate Page</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(m);

    var topicEl = document.getElementById('aiTopic');
    topicEl.addEventListener('input', function(){
      document.getElementById('aiTopicCount').textContent = topicEl.value.length;
    });

    document.getElementById('aiGenerateBtn').onclick = function(){ App.runAIGeneration(); };
    setTimeout(function(){ topicEl.focus(); }, 100);
  };

  App.closeAIModal = function(){
    var m = document.getElementById('aiModal');
    if (m) m.remove();
  };

  App.runAIGeneration = async function(){
    var topic = document.getElementById('aiTopic').value.trim();
    var style = document.getElementById('aiStyle').value;
    var lang = document.getElementById('aiLang').value;
    var alertBox = document.getElementById('aiAlert');
    var btn = document.getElementById('aiGenerateBtn');

    if (!topic) {
      alertBox.innerHTML = '<div style="background:rgba(220,38,38,.08);border:1px solid rgba(220,38,38,.3);color:#f87171;padding:12px 16px;border-radius:10px;font-size:13px;margin-bottom:16px">Please describe your website first.</div>';
      return;
    }

    alertBox.innerHTML = '';
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Generating... (30-60s)';
    document.getElementById('aiTopic').disabled = true;
    document.getElementById('aiStyle').disabled = true;
    document.getElementById('aiLang').disabled = true;

    try {
      var r = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic, style: style, language: lang })
      });
      var d = await r.json();
      if (!d.ok) throw new Error(d.error || 'Failed');
      var html = App.renderAITemplate(d.content);
      App.showAIPreview(html);
    } catch(e) {
      alertBox.innerHTML = '<div style="background:rgba(220,38,38,.08);border:1px solid rgba(220,38,38,.3);color:#f87171;padding:12px 16px;border-radius:10px;font-size:13px;margin-bottom:16px">Error: ' + escHtml(e.message) + '</div>';
      btn.disabled = false;
      btn.innerHTML = '✨ Generate Page';
      document.getElementById('aiTopic').disabled = false;
      document.getElementById('aiStyle').disabled = false;
      document.getElementById('aiLang').disabled = false;
    }
  };

  App.showAIPreview = function(html){
    var m = document.getElementById('aiModal');
    if (!m) return;
    m.innerHTML =
      '<div style="background:var(--card);border:1px solid var(--border2);border-radius:16px;padding:24px;max-width:1000px;width:100%;margin:auto;position:relative">' +
        '<div style="font-family:var(--serif);font-size:22px;color:var(--white);margin-bottom:6px">✓ Preview Generated</div>' +
        '<p style="color:var(--fog);font-size:13px;margin-bottom:18px">Review the preview. Insert to editor atau regenerate.</p>' +
        '<div style="background:#000;border:1px solid var(--border2);border-radius:10px;overflow:hidden;margin-bottom:18px"><iframe id="aiPreviewFrame" style="width:100%;height:400px;border:0;background:#fff"></iframe></div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
          '<button class="btn btn-ghost" style="flex:1" onclick="App.closeAIModal()">Cancel</button>' +
          '<button class="btn btn-ghost" style="flex:1" id="aiRegenBtn">↻ Regenerate</button>' +
          '<button class="btn btn-primary" style="flex:2" id="aiInsertBtn">Insert to Editor</button>' +
        '</div>' +
      '</div>';

    var frame = document.getElementById('aiPreviewFrame');
    frame.srcdoc = html;

    document.getElementById('aiRegenBtn').onclick = function(){
      App.closeAIModal();
      App.showAIModal();
    };

    document.getElementById('aiInsertBtn').onclick = function(){
      var editorEl = document.getElementById('editorHTML');
      if (!editorEl) { toast('Editor not found', 'error'); return; }
      var current = editorEl.value.trim();
      if (current && current.length > 50) {
        if (!confirm('Replace current HTML content? Current editor content will be lost.')) return;
      }
      editorEl.value = html;
      App.closeAIModal();
      toast('HTML inserted to editor. Click Save to keep changes.', 'success');
    };
  };
})();

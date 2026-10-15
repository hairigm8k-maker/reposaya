(function(){
if(typeof AdminApp==='undefined')return;
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function toast(m,t){var w=document.getElementById('toastWrap');if(!w)return;var e=document.createElement('div');e.className='toast '+(t||'');e.textContent=m;w.appendChild(e);setTimeout(function(){e.style.opacity='0';setTimeout(function(){e.remove()},300)},3000)}

AdminApp.pageBulkTokens=function(main){
main.innerHTML='<div class="page-head"><h1>Class Tokens</h1><p class="page-sub">Generate access tokens for your class students</p></div>'
+'<div class="grid-2" style="margin-bottom:24px">'
+'<div class="card"><div class="card-title">Generate New Batch</div>'
+'<div class="field" style="margin-bottom:12px"><label style="font-size:12px;color:#a1a4a5;display:block;margin-bottom:6px">Cohort Name</label><input class="input" id="btCohort" placeholder="AI Web Class Jan 2026"></div>'
+'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px">'
+'<div><label style="font-size:12px;color:#a1a4a5;display:block;margin-bottom:6px">How many</label><input class="input" id="btCount" type="number" value="30" min="1" max="200"></div>'
+'<div><label style="font-size:12px;color:#a1a4a5;display:block;margin-bottom:6px">Expires (h)</label><input class="input" id="btExp" type="number" value="24" min="1"></div>'
+'<div><label style="font-size:12px;color:#a1a4a5;display:block;margin-bottom:6px">Plan (days)</label><input class="input" id="btPlan" type="number" value="90" min="1"></div>'
+'</div>'
+'<button class="btn btn-primary" id="btGen" style="width:100%">Generate Tokens</button>'
+'</div>'
+'<div class="card"><div class="card-title">Recent Batches</div><div id="btList" style="font-size:13px;color:#a1a4a5">Loading...</div></div>'
+'</div>'
+'<div id="btResult"></div>';

document.getElementById('btGen').onclick=async function(){
var cohort=document.getElementById('btCohort').value.trim();
var count=parseInt(document.getElementById('btCount').value);
var exp=parseInt(document.getElementById('btExp').value);
var plan=parseInt(document.getElementById('btPlan').value);
if(!cohort){toast('Cohort name required','error');return}
var btn=this;btn.disabled=true;btn.innerHTML='Generating...';
try{
var r=await fetch('/api/admin/bulk-tokens',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cohort:cohort,count:count,expires_hours:exp,plan_days:plan})});
var d=await r.json();
if(!d.ok){toast(d.error,'error');btn.disabled=false;btn.textContent='Generate Tokens';return}
var lines=['Class Code: '+d.class_code,'Cohort: '+d.cohort,'Plan: '+d.plan_days+' days','Expires: '+new Date(d.expires_at).toLocaleString(),'','Tokens:'];
d.tokens.forEach(function(t,i){lines.push((i+1)+'. '+t.username+' → '+t.token)});
var text=lines.join('\n');
var res=document.getElementById('btResult');
res.innerHTML='<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px"><div><div class="card-title" style="margin-bottom:4px">Batch: '+esc(d.cohort)+'</div><div style="font-size:12px;color:#a1a4a5;font-family:monospace">Class Code: <strong style="color:#9281f7">'+esc(d.class_code)+'</strong></div></div><button class="btn btn-primary btn-sm" id="btCopy">Copy All</button></div><div style="background:#000;border:1px solid #292d30;border-radius:8px;padding:16px;max-height:400px;overflow-y:auto"><pre style="font-family:monospace;font-size:12px;color:#f0f0f0;white-space:pre-wrap;word-break:break-all">'+esc(text)+'</pre></div></div>';
document.getElementById('btCopy').onclick=function(){navigator.clipboard.writeText(text).then(function(){toast('Copied to clipboard','success')})};
btn.disabled=false;btn.textContent='Generate Tokens';
loadBatches();
}catch(e){toast('Error: '+e.message,'error');btn.disabled=false;btn.textContent='Generate Tokens'}
};

async function loadBatches(){
try{
var r=await fetch('/api/admin/bulk-tokens');
var d=await r.json();
if(!d.ok||!d.classes.length){document.getElementById('btList').textContent='No batches yet';return}
document.getElementById('btList').innerHTML='<table style="width:100%;font-size:13px"><thead><tr style="border-bottom:1px solid #292d30;color:#a1a4a5"><th style="text-align:left;padding:8px">Code</th><th style="text-align:left;padding:8px">Cohort</th><th style="text-align:right;padding:8px">Used</th><th style="text-align:right;padding:8px">Plan</th></tr></thead><tbody>'+d.classes.map(function(c){return '<tr style="border-bottom:1px solid #292d30"><td style="padding:8px;font-family:monospace;font-size:11px;color:#9281f7">'+esc(c.code)+'</td><td style="padding:8px">'+esc(c.cohort)+'</td><td style="padding:8px;text-align:right">'+c.tokens_used+' / '+c.token_count+'</td><td style="padding:8px;text-align:right">'+c.plan_days+'d</td></tr>'}).join('')+'</tbody></table>';
}catch(e){document.getElementById('btList').textContent='Error loading'}
}
loadBatches();
};
})();

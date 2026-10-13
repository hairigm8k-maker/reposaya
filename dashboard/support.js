(function(){
  if (typeof App === 'undefined') return;

  var CONTACTS = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      value: '+60 17-213 1814',
      desc: 'Fastest response · 9am - 11pm',
      href: 'https://wa.me/60172131814',
      color: '#25d366',
      bg: 'rgba(37,211,102,.1)',
      svg: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>'
    },
    {
      id: 'email',
      label: 'Email',
      value: 'feedback@hairiamri.buzz',
      desc: 'Response within 24 hours',
      href: 'mailto:feedback@hairiamri.buzz',
      color: '#cc9166',
      bg: 'rgba(204,145,102,.1)',
      svg: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>'
    },
    {
      id: 'telegram',
      label: 'Telegram',
      value: '@fpttt2',
      desc: 'Casual chat & updates',
      href: 'https://t.me/fpttt2',
      color: '#29a9eb',
      bg: 'rgba(41,169,235,.1)',
      svg: '<path d="M21.5 3.5L2.5 11l5.5 2.2L10 21l3.5-5L19 20l2.5-16.5z" stroke-linejoin="round"/><path d="M8 13.2l11-8.4-8.5 10"/>'
    }
  ];
  var FAQ = [
    { q: 'How do I publish my site?', a: 'Open your site in the editor, make your changes, then click the Publish button at the bottom. Your site goes live instantly at <span style="color:var(--copper);font-family:var(--mono)">yourname.hairiamri.buzz</span>.' },
    { q: 'Can I use my own domain?', a: 'Yes. Go to the Publish page and use the Custom Domain section. You will need to add a CNAME record pointing to our servers.' },
    { q: 'What is the file size limit?', a: 'Each image upload is limited to 1.5 MB. For larger files, we recommend compressing images before uploading.' },
    { q: 'How do I change my subdomain?', a: 'Contact us via WhatsApp or Email — subdomain changes require manual update and are done within 24 hours.' },
    { q: 'Is there a free plan?', a: 'HairiHosting is currently invite-only. All accounts have the same feature set — no hidden limits.' }
  ];

  App.pageSupport = async function(){
    var c = document.getElementById('content');
    c.innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';

    try {
      var contactsHtml = CONTACTS.map(function(ct){
        return '<a href="' + ct.href + '" target="_blank" rel="noopener" style="display:flex;gap:16px;align-items:center;padding:18px 20px;background:var(--card);border:1px solid var(--border);border-radius:12px;text-decoration:none;color:inherit;transition:all .15s" onmouseover="this.style.borderColor=\'' + ct.color + '\';this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.transform=\'\'">' +
          '<div style="width:44px;height:44px;border-radius:50%;background:' + ct.bg + ';border:1px solid ' + ct.color + '55;display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
            '<svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:' + ct.color + ';stroke:' + ct.color + ';stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round">' + ct.svg + '</svg>' +
          '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-size:15px;font-weight:600;color:var(--white);margin-bottom:3px">' + ct.label + '</div>' +
            '<div style="font-size:13px;color:' + ct.color + ';font-family:var(--mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + ct.value + '</div>' +
          '</div>' +
          '<svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:var(--ash);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0"><polyline points="9 18 15 12 9 6"/></svg>' +
        '</a>';
      }).join('');

      var faqHtml = FAQ.map(function(f, i){
        return '<div class="faq-item" style="border-bottom:1px solid var(--border);padding:16px 0;cursor:pointer" data-idx="' + i + '">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px">' +
            '<div style="font-size:14.5px;font-weight:500;color:var(--white);flex:1">' + escHtml(f.q) + '</div>' +
            '<svg class="faq-arrow" viewBox="0 0 24 24" style="width:16px;height:16px;stroke:var(--copper);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;transition:transform .2s"><polyline points="6 9 12 15 18 9"/></svg>' +
          '</div>' +
          '<div class="faq-answer" style="max-height:0;overflow:hidden;transition:max-height .25s ease;color:var(--fog);font-size:13.5px;line-height:1.7;padding-top:0">' +
            '<div style="padding-top:10px">' + f.a + '</div>' +
          '</div>' +
        '</div>';
      }).join('');

      c.innerHTML =
        '<div class="page-head"><div class="eyebrow">Account</div><h1 class="page-title">Support</h1><p class="page-sub">Get in touch with us</p></div>' +
        '<div style="max-width:720px;display:flex;flex-direction:column;gap:24px">' +

          '<div><div style="font-size:13px;color:var(--fog);text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:12px">Contact us</div>' +
          '<div style="display:flex;flex-direction:column;gap:10px">' + contactsHtml + '</div></div>' +

          '<div class="card"><div style="font-family:var(--serif);font-size:20px;color:var(--white);margin-bottom:6px">Frequently Asked Questions</div>' +
          '<p style="color:var(--fog);font-size:13px;margin-bottom:12px">Quick answers to common questions</p>' + faqHtml + '</div>' +

        '</div>';

      // FAQ toggles
      c.querySelectorAll('.faq-item').forEach(function(el){
        el.addEventListener('click', function(){
          var ans = el.querySelector('.faq-answer');
          var arrow = el.querySelector('.faq-arrow');
          var isOpen = ans.style.maxHeight && ans.style.maxHeight !== '0px';
          c.querySelectorAll('.faq-item').forEach(function(other){
            other.querySelector('.faq-answer').style.maxHeight = '0px';
            other.querySelector('.faq-arrow').style.transform = '';
          });
          if (!isOpen) {
            ans.style.maxHeight = ans.scrollHeight + 'px';
            arrow.style.transform = 'rotate(180deg)';
          }
        });
      });
    } catch (e) {
      c.innerHTML = '<div class="card" style="text-align:center;padding:40px"><p style="color:#f87171">Error: ' + escHtml(e.message) + '</p></div>';
    }
  };

  var origLoad = App.load.bind(App);
  App.load = function(id){
    if (id === 'support') {
      document.getElementById('content').innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';
      return this.pageSupport();
    }
    return origLoad(id);
  };
})();

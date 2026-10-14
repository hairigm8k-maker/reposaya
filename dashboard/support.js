(function(){
  if (typeof App === 'undefined') return;

  var SVG_WA = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 362"><path fill="#25D366" fill-rule="evenodd" d="M307.546 52.566C273.709 18.684 228.706.017 180.756 0 81.951 0 1.538 80.404 1.504 179.235c-.017 31.594 8.242 62.432 23.928 89.609L0 361.736l95.024-24.925c26.179 14.285 55.659 21.805 85.655 21.814h.077c98.788 0 179.21-80.413 179.244-179.244.017-47.898-18.608-92.926-52.454-126.807v-.008Zm-126.79 275.788h-.06c-26.73-.008-52.952-7.194-75.831-20.765l-5.44-3.231-56.391 14.791 15.05-54.981-3.542-5.638c-14.912-23.721-22.793-51.139-22.776-79.286.035-82.14 66.867-148.973 149.051-148.973 39.793.017 77.198 15.53 105.328 43.695 28.131 28.157 43.61 65.596 43.593 105.398-.035 82.149-66.867 148.982-148.982 148.982v.008Zm81.719-111.577c-4.478-2.243-26.497-13.073-30.606-14.568-4.108-1.496-7.09-2.243-10.073 2.243-2.982 4.487-11.568 14.577-14.181 17.559-2.613 2.991-5.226 3.361-9.704 1.117-4.477-2.243-18.908-6.97-36.02-22.226-13.313-11.878-22.304-26.54-24.916-31.027-2.613-4.486-.275-6.91 1.959-9.136 2.011-2.011 4.478-5.234 6.721-7.847 2.244-2.613 2.983-4.486 4.478-7.469 1.496-2.991.748-5.603-.369-7.847-1.118-2.243-10.073-24.289-13.812-33.253-3.636-8.732-7.331-7.546-10.073-7.692-2.613-.13-5.595-.155-8.586-.155-2.991 0-7.839 1.118-11.947 5.604-4.108 4.486-15.677 15.324-15.677 37.361s16.047 43.344 18.29 46.335c2.243 2.991 31.585 48.225 76.51 67.632 10.684 4.615 19.029 7.374 25.535 9.437 10.727 3.412 20.49 2.931 28.208 1.779 8.604-1.289 26.498-10.838 30.228-21.298 3.73-10.46 3.73-19.433 2.613-21.298-1.117-1.865-4.108-2.991-8.586-5.234l.008-.017Z" clip-rule="evenodd"/></svg>';

  var SVG_EMAIL = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M10.303 14.313c-.025.183-.038.404-.038.661v.156c0 .055.007.113.019.174-.282.306-.6.46-.956.46-.612 0-.918-.625-.918-1.874 0-1.053.151-1.923.451-2.609.299-.685.67-1.029 1.111-1.029.245 0 .526.111.845.332l-.514 3.729zM5.269 20.173c.906.551 1.996.827 3.269.827 1.042 0 1.972-.209 2.793-.625v-1.617c-.894.33-1.751.496-2.572.496-1.347 0-2.385-.438-3.113-1.314-.73-.874-1.093-2.146-1.093-3.811 0-1.383.238-2.63.716-3.738.477-1.109 1.157-1.994 2.04-2.655.881-.661 1.873-.991 2.975-.991 1.421 0 2.501.401 3.243 1.202.74.803 1.111 1.975 1.111 3.518 0 .747-.083 1.446-.249 2.095-.164.649-.398 1.184-.697 1.607-.3.422-.616.634-.947.634-.171 0-.305-.065-.403-.193-.099-.128-.147-.304-.147-.524 0-.195.011-.367.037-.514l.789-5.713h-1.708l-.22.643c-.454-.612-1.011-.918-1.673-.918-.538 0-1.055.235-1.552.707-.496.472-.903 1.132-1.221 1.983-.319.853-.478 1.791-.478 2.82 0 1.078.196 1.905.588 2.48.392.576.967.864 1.727.864.355 0 .725-.092 1.112-.275.385-.184.725-.435 1.019-.754.195.319.459.563.79.734.33.172.71.258 1.138.258.723 0 1.387-.245 1.994-.735.606-.49 1.086-1.187 1.442-2.094.355-.906.533-1.947.533-3.123 0-1.335-.239-2.483-.717-3.444-.478-.961-1.179-1.702-2.103-2.223-.925-.521-2.036-.78-3.334-.78-1.433 0-2.747.378-3.941 1.139-1.193.758-2.146 1.833-2.856 3.223-.711 1.39-1.066 2.992-1.066 4.804 0 1.421.236 2.639.707 3.655.472 1.017 1.161 1.801 2.067 2.352zM23.354 31.98c.185.154.413.231.64.231.228 0 .455-.077.641-.231l3.033-2.527 14.557 12.131H5.763l14.559-12.132 3.032 2.528zm5.877-3.83L43.989 15.852v24.596L29.231 28.15zm15.758-15.434H18.545v2h23.68L23.994 29.91 13.368 21.05l-1.281 1.535 6.672 5.565L4 40.448V22.07H2v20.514c0 .552.448 1 1 1h41.989c.552 0 1-.448 1-1V13.716c0-.552-.448-1-1-1z" fill="#DD344C"/></svg>';

  var SVG_TG = '<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="tgGrad" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#2AABEE"/><stop offset="100%" stop-color="#229ED9"/></linearGradient></defs><path fill="url(#tgGrad)" d="M128 0C94.06 0 61.48 13.494 37.5 37.49A128.038 128.038 0 0 0 0 128c0 33.934 13.5 66.514 37.5 90.51C61.48 242.506 94.06 256 128 256s66.52-13.494 90.5-37.49c24-23.996 37.5-56.576 37.5-90.51 0-33.934-13.5-66.514-37.5-90.51C194.52 13.494 161.94 0 128 0Z"/><path fill="#FFF" d="M57.94 126.648c37.32-16.256 62.2-26.974 74.64-32.152 35.56-14.786 42.94-17.354 47.76-17.441 1.06-.017 3.42.245 4.96 1.49 1.28 1.05 1.64 2.47 1.82 3.467.16.996.38 3.266.2 5.038-1.92 20.24-10.26 69.356-14.5 92.026-1.78 9.592-5.32 12.808-8.74 13.122-7.44.684-13.08-4.912-20.28-9.63-11.26-7.386-17.62-11.982-28.56-19.188-12.64-8.328-4.44-12.906 2.76-20.386 1.88-1.958 34.64-31.748 35.26-34.45.08-.338.16-1.598-.6-2.262-.74-.666-1.84-.438-2.64-.258-1.14.256-19.12 12.152-54 35.686-5.1 3.508-9.72 5.218-13.88 5.128-4.56-.098-13.36-2.584-19.9-4.708-8-2.606-14.38-3.984-13.82-8.41.28-2.304 3.46-4.662 9.52-7.072Z"/></svg>';

  var CONTACTS = [
    { id: 'whatsapp', label: 'WhatsApp', value: '+60 17-213 1814', desc: 'Fastest response · 9am – 11pm', href: 'https://wa.me/60172131814', svg: SVG_WA, viewBox: '0 0 360 362' },
    { id: 'email', label: 'Email', value: 'feedback@hairiamri.buzz', desc: 'Response within 24 hours', href: 'mailto:feedback@hairiamri.buzz', svg: SVG_EMAIL, viewBox: '0 0 48 48' },
    { id: 'telegram', label: 'Telegram', value: '@fpttt2', desc: 'Casual chat & updates', href: 'https://t.me/fpttt2', svg: SVG_TG, viewBox: '0 0 256 256' }
  ];

  var FAQ = [
    { q: 'How do I publish my site?', a: 'Open your site in the editor, make your changes, then click the Publish button at the bottom. Your site goes live instantly at <span style="color:var(--copper);font-family:var(--mono)">yourname.hairiamri.buzz</span>.' },
    { q: 'What is the file size limit?', a: 'Each image upload is limited to 1.5 MB. For larger files, we recommend compressing images before uploading.' },
    { q: 'How do I change my subdomain?', a: 'Contact us via WhatsApp or Email — subdomain changes require manual update and are done within 24 hours.' },
    { q: 'Is there a free plan?', a: 'HairiHosting is currently invite-only. All accounts have the same feature set — no hidden limits.' },
    { q: 'Can I delete my account?', a: 'Yes. Go to Security and use the Danger Zone section. This will permanently delete all your sites, files, and data.' }
  ];

  App.pageSupport = async function(){
    var c = document.getElementById('content');
    c.innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';

    var contactsHtml = CONTACTS.map(function(ct){
      return '<a href="' + ct.href + '" target="_blank" rel="noopener" style="display:flex;gap:16px;align-items:center;padding:18px 20px;background:var(--card);border:1px solid var(--border);border-radius:12px;text-decoration:none;color:inherit;transition:all .15s">' +
        '<div style="width:44px;height:44px;border-radius:50%;background:var(--panel);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden">' +
          ct.svg.replace('<svg ', '<svg width="24" height="24" style="display:block" ') +
        '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:15px;font-weight:600;color:var(--white);margin-bottom:3px">' + ct.label + '</div>' +
          '<div style="font-size:12px;color:var(--fog);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + ct.value + '</div>' +
          '<div style="font-size:11px;color:var(--ash);margin-top:2px">' + ct.desc + '</div>' +
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
        '<div class="faq-answer" style="max-height:0;overflow:hidden;transition:max-height .25s ease;color:var(--fog);font-size:13.5px;line-height:1.7">' +
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
      '</div>';c.querySelectorAll('.faq-item').forEach(function(el){
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

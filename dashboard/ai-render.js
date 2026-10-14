(function(){
  if (typeof App === 'undefined') return;

  var ICONS = {
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>',
    sparkles: '<path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    users: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>',
    award: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
    leaf: '<path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/>',
    coffee: '<path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>',
    camera: '<path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>'
  };

  function icon(name, size) {
    var path = ICONS[name] || ICONS.sparkles;
    return '<svg viewBox="0 0 24 24" width="' + (size || 24) + '" height="' + (size || 24) + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display:block">' + path + '</svg>';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  App.renderAITemplate = function(c) {
    return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1.0">\n<title>' + esc(c.brand || 'Website') + '</title>\n<style>\n' +
'*{margin:0;padding:0;box-sizing:border-box}\n' +
'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,sans-serif;font-size:16px;line-height:1.6;color:#111827;background:#ffffff;-webkit-font-smoothing:antialiased}\n' +
'a{color:inherit;text-decoration:none}\n' +
'img{max-width:100%;display:block}\n' +
'.container{max-width:1200px;margin:0 auto;padding:0 24px}\n' +
'\n/* Nav */\n' +
'nav{padding:20px 0;border-bottom:1px solid #f3f4f6;position:sticky;top:0;background:rgba(255,255,255,.9);backdrop-filter:blur(8px);z-index:50}\n' +
'nav .container{display:flex;align-items:center;justify-content:space-between;gap:32px}\n' +
'.brand{font-size:20px;font-weight:700;letter-spacing:-.02em}\n' +
'.nav-links{display:flex;gap:32px}\n' +
'.nav-links a{font-size:15px;color:#4b5563;font-weight:500;transition:color .2s}\n' +
'.nav-links a:hover{color:#111827}\n' +
'.nav-cta{background:#111827;color:#fff;padding:10px 22px;border-radius:9999px;font-size:14px;font-weight:600;transition:opacity .2s}\n' +
'.nav-cta:hover{opacity:.85}\n' +
'\n/* Hero */\n' +
'.hero{padding:100px 0 80px;text-align:center}\n' +
'.hero .eyebrow{display:inline-block;font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#6b7280;padding:6px 14px;border:1px solid #e5e7eb;border-radius:9999px;margin-bottom:24px}\n' +
'.hero h1{font-size:clamp(40px,6vw,64px);font-weight:800;line-height:1.1;letter-spacing:-.03em;margin-bottom:24px;max-width:900px;margin-left:auto;margin-right:auto}\n' +
'.hero p{font-size:19px;color:#6b7280;line-height:1.6;max-width:640px;margin:0 auto 40px}\n' +
'.hero-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}\n' +
'.btn{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:9999px;font-weight:600;font-size:15px;transition:all .2s;cursor:pointer;border:0}\n' +
'.btn-primary{background:#111827;color:#fff}\n' +
'.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.15)}\n' +
'.btn-ghost{background:transparent;color:#111827;border:1.5px solid #e5e7eb}\n' +
'.btn-ghost:hover{border-color:#111827}\n' +
'\n/* Features */\n' +
'.section{padding:80px 0}\n' +
'.section-head{text-align:center;max-width:640px;margin:0 auto 60px}\n' +
'.section-head h2{font-size:clamp(32px,4vw,44px);font-weight:800;letter-spacing:-.02em;line-height:1.15;margin-bottom:16px}\n' +
'.section-head p{font-size:17px;color:#6b7280;line-height:1.6}\n' +
'.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}\n' +
'.feature{padding:32px;border:1px solid #e5e7eb;border-radius:16px;transition:all .2s}\n' +
'.feature:hover{border-color:#111827;transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.06)}\n' +
'.feature-icon{width:48px;height:48px;border-radius:12px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#111827;margin-bottom:20px}\n' +
'.feature h3{font-size:19px;font-weight:700;margin-bottom:10px;letter-spacing:-.01em}\n' +
'.feature p{font-size:15px;color:#6b7280;line-height:1.6}\n' +
'\n/* Stats */\n' +
'.stats-section{padding:60px 0;background:#f9fafb;border-radius:24px;margin:40px 0}\n' +
'.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:32px;text-align:center}\n' +
'.stat-value{font-size:44px;font-weight:800;letter-spacing:-.03em;color:#111827;line-height:1;margin-bottom:8px}\n' +
'.stat-label{font-size:14px;color:#6b7280;font-weight:500}\n' +
'\n/* CTA */\n' +
'.cta-section{background:#111827;color:#fff;border-radius:24px;padding:80px 40px;text-align:center;margin:40px 0}\n' +
'.cta-section h2{font-size:clamp(28px,4vw,40px);font-weight:800;letter-spacing:-.02em;line-height:1.2;margin-bottom:16px;max-width:700px;margin-left:auto;margin-right:auto}\n' +
'.cta-section p{font-size:17px;color:#d1d5db;line-height:1.6;max-width:560px;margin:0 auto 32px}\n' +
'.cta-section .btn-primary{background:#fff;color:#111827}\n' +
'.cta-section .btn-primary:hover{box-shadow:0 8px 24px rgba(255,255,255,.2)}\n' +
'\n/* Footer */\n' +
'footer{padding:60px 0 32px;border-top:1px solid #f3f4f6;margin-top:60px}\n' +
'footer .container{display:grid;grid-template-columns:2fr 1fr;gap:48px;align-items:start}\n' +
'footer .brand{font-size:20px;font-weight:700;margin-bottom:12px}\n' +
'footer .tagline{font-size:14px;color:#6b7280;line-height:1.6;max-width:360px}\n' +
'footer .foot-links{display:flex;gap:24px;flex-wrap:wrap;justify-content:flex-end}\n' +
'footer .foot-links a{font-size:14px;color:#6b7280;transition:color .2s}\n' +
'footer .foot-links a:hover{color:#111827}\n' +
'footer .copyright{grid-column:1/-1;padding-top:32px;border-top:1px solid #f3f4f6;font-size:13px;color:#9ca3af;text-align:center;margin-top:32px}\n' +
'\n@media(max-width:768px){\n' +
'.nav-links{display:none}\n' +
'.hero{padding:60px 0 40px}\n' +
'.section{padding:56px 0}\n' +
'footer .container{grid-template-columns:1fr;gap:24px}\n' +
'footer .foot-links{justify-content:flex-start}\n' +
'}\n' +
'</style>\n</head>\n<body>\n' +
'\n<nav><div class="container">\n' +
'<a href="#" class="brand">' + esc(c.brand || 'Brand') + '</a>\n' +
'<div class="nav-links">' + (c.nav || []).map(function(n){ return '<a href="#">' + esc(n) + '</a>'; }).join('') + '</div>\n' +
'<a href="#cta" class="nav-cta">' + esc(c.hero.cta_primary) + '</a>\n' +
'</div></nav>\n' +
'\n<section class="hero"><div class="container">\n' +
(c.hero.eyebrow ? '<span class="eyebrow">' + esc(c.hero.eyebrow) + '</span>' : '') +
'<h1>' + esc(c.hero.headline) + '</h1>\n' +
'<p>' + esc(c.hero.subheadline) + '</p>\n' +
'<div class="hero-btns">\n' +
'<a href="#cta" class="btn btn-primary">' + esc(c.hero.cta_primary) + '</a>\n' +
(c.hero.cta_secondary ? '<a href="#features" class="btn btn-ghost">' + esc(c.hero.cta_secondary) + '</a>' : '') +
'</div>\n' +
'</div></section>\n' +
'\n<section class="section" id="features"><div class="container">\n' +
'<div class="section-head"><h2>What makes us different</h2><p>Built for people who care about quality and simplicity.</p></div>\n' +
'<div class="features">' + (c.features || []).map(function(f){
  return '<div class="feature"><div class="feature-icon">' + icon(f.icon, 24) + '</div><h3>' + esc(f.title) + '</h3><p>' + esc(f.description) + '</p></div>';
}).join('') + '</div>\n' +
'</div></section>\n' +
'\n' + (c.stats && c.stats.length ? '<section class="section"><div class="container"><div class="stats-section" style="padding:60px 40px"><div class="stats">' + c.stats.map(function(s){
  return '<div><div class="stat-value">' + esc(s.value) + '</div><div class="stat-label">' + esc(s.label) + '</div></div>';
}).join('') + '</div></div></div></section>' : '') +
'\n<section class="section" id="cta"><div class="container">\n' +
'<div class="cta-section">\n' +
'<h2>' + esc(c.cta_section.headline) + '</h2>\n' +
'<p>' + esc(c.cta_section.subheadline) + '</p>\n' +
'<a href="#" class="btn btn-primary">' + esc(c.cta_section.button) + '</a>\n' +
'</div>\n' +
'</div></section>\n' +
'\n<footer><div class="container">\n' +
'<div><div class="brand">' + esc(c.brand || 'Brand') + '</div><div class="tagline">' + esc(c.footer.tagline) + '</div></div>\n' +
'<div class="foot-links">' + (c.footer.links || []).map(function(l){ return '<a href="#">' + esc(l) + '</a>'; }).join('') + '</div>\n' +
'<div class="copyright">' + esc(c.footer.copyright) + '</div>\n' +
'</div></footer>\n' +
'\n</body>\n</html>';
  };
})();

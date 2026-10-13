// ═══════════════════════════════════════════
// SITEHOST ROUTER — Serve user sites via subdomain
// ═══════════════════════════════════════════

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname;
    const parts = host.split('.');
    const subdomain = parts[0];

    console.log('Subdomain:', subdomain, 'Host:', host);

    if (!subdomain || subdomain === 'www') {
      return new Response('Invalid subdomain', { status: 400 });
    }

    try {
      const site = await env.DB.prepare(
        'SELECT name, subdomain, html, css, js, status FROM sites WHERE subdomain = ?'
      ).bind(subdomain).first();

      if (!site) return notFound(subdomain, 'Website tidak dijumpai');
      if (site.status !== 'live') return notFound(subdomain, 'Website belum publish');

      const html = buildPage(site);

      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
          'X-Site': subdomain
        }
      });

    } catch (err) {
      console.error('Error:', err);
      return new Response('Server error: ' + err.message, { status: 500 });
    }
  }
};

function buildPage(site) {
  let html = site.html || '<h1>' + site.name + '</h1><p>Empty.</p>';

  if (site.css && site.css.trim()) {
    const cssTag = '<style>' + site.css + '</style>';
    if (html.indexOf('</head>') >= 0) {
      html = html.replace('</head>', cssTag + '</head>');
    } else {
      html = cssTag + html;
    }
  }

  if (site.js && site.js.trim()) {
    const jsTag = '<script>' + site.js + '<\/script>';
    if (html.indexOf('</body>') >= 0) {
      html = html.replace('</body>', jsTag + '</body>');
    } else {
      html = html + jsTag;
    }
  }

  return html;
}

function notFound(sub, message) {
  const html = '<!DOCTYPE html><html lang="ms"><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>404 — ' + sub + '</title>' +
    '<style>' +
    '* { box-sizing: border-box; margin: 0; padding: 0; }' +
    'body { background: #08080a; color: #e2e3e9; font-family: system-ui, sans-serif; ' +
    'min-height: 100vh; display: flex; align-items: center; justify-content: center; ' +
    'padding: 24px; text-align: center; }' +
    'h1 { font-size: 72px; color: #dc2626; margin-bottom: 16px; }' +
    'p { color: #9194a1; font-size: 15px; margin-bottom: 24px; line-height: 1.6; }' +
    'code { background: #121317; padding: 4px 12px; border-radius: 6px; ' +
    'font-family: monospace; color: #cc9166; font-size: 13px; }' +
    'a { display: inline-block; background: #dc2626; color: #fff; padding: 12px 28px; ' +
    'border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 14px; }' +
    '</style></head><body>' +
    '<div><h1>404</h1>' +
    '<p>' + message + '</p>' +
    '<p><code>' + sub + '.hairiamri.buzz</code></p>' +
    '<a href="https://hairiamri.buzz">Balik Utama</a>' +
    '</div></body></html>';

  return new Response(html, {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

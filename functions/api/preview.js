import { getCookie, verifySession } from '../_utils.js';

// GET /api/preview?sub=airi
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const sub = (url.searchParams.get('sub') || '').trim().toLowerCase();

  if (!sub) return new Response('Subdomain required', { status: 400 });

  try {
    const site = await env.DB.prepare(
      'SELECT id, user_id, name, subdomain, html, css, js, status FROM sites WHERE subdomain = ?'
    ).bind(sub).first();

    if (!site) return preview404(sub, 'Site not found');

    // Kalau draft, kena login owner
    if (site.status !== 'live') {
      const token = getCookie(request, 'hh_session');
      const session = await verifySession(env, token);

      if (!session || session.userId !== site.user_id) {
        return preview404(sub, 'Site not yet publish. Login sebagai owner for preview.');
      }
    }

    const html = buildPage(site);

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Site': sub,
        'X-Status': site.status
      }
    });
  } catch (err) {
    return new Response('Server error: ' + err.message, { status: 500 });
  }
}

function buildPage(site) {
  let html = site.html || '<h1>' + site.name + '</h1><p>Empty site.</p>';

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

function preview404(sub, message) {
  const html = '<!DOCTYPE html>' +
    '<html lang="ms"><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>Preview — ' + sub + '</title>' +
    '<style>' +
    '* { box-sizing: border-box; margin: 0; padding: 0; }' +
    'body { background: #08080a; color: #e2e3e9; font-family: system-ui, sans-serif; ' +
    'min-height: 100vh; display: flex; align-items: center; justify-content: center; ' +
    'padding: 24px; text-align: center; }' +
    '.box { max-width: 400px; }' +
    'h1 { font-size: 48px; color: #cc9166; margin-bottom: 12px; font-weight: 700; }' +
    'p { color: #9194a1; font-size: 15px; margin-bottom: 20px; line-height: 1.5; }' +
    'code { background: #121317; padding: 3px 10px; border-radius: 4px; ' +
    'font-family: monospace; color: #cc9166; }' +
    'a { display: inline-block; background: #fff; color: #000; padding: 10px 24px; ' +
    'border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 13px; }' +
    '</style></head><body>' +
    '<div class="box">' +
    '<h1>Preview</h1>' +
    '<p>' + message + '</p>' +
    '<p style="margin-top:16px;"><code>' + sub + '.hairiamri.buzz</code></p>' +
    '<a href="https://hairiamri.buzz/dashboard">← Back Dashboard</a>' +
    '</div></body></html>';

  return new Response(html, {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

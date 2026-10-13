import { getCookie, verifySession } from '../_utils/auth.js';

export async function onRequestGet({ request, env, params }) {
  const subdomain = params.subdomain;

  if (!subdomain) {
    return new Response('Subdomain required', { status: 400 });
  }

  try {
    // Fetch site
    const site = await env.DB.prepare(
      'SELECT id, user_id, name, subdomain, html, css, js, status FROM sites WHERE subdomain = ?'
    ).bind(subdomain).first();

    if (!site) {
      return preview404(subdomain, 'Site tak jumpa');
    }

    // Check ownership (kalau draft, kena owner login)
    if (site.status !== 'live') {
      const token = getCookie(request, 'hh_session');
      const session = await verifySession(env, token);

      if (!session || session.userId !== site.user_id) {
        return preview404(subdomain, 'Site belum publish');
      }
    }

    // Build final page
    const html = buildPage(site);

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Site': subdomain,
        'X-Status': site.status
      }
    });

  } catch (err) {
    console.error('Preview error:', err);
    return new Response('Server error: ' + err.message, { status: 500 });
  }
}

function buildPage(site) {
  let html = site.html || '<h1>' + site.name + '</h1><p>Empty site.</p>';

  // Inject CSS
  if (site.css && site.css.trim()) {
    const cssTag = '<style>' + site.css + '</style>';
    if (html.includes('</head>')) {
      html = html.replace('</head>', cssTag + '</head>');
    } else {
      html = cssTag + html;
    }
  }

  // Inject JS
  if (site.js && site.js.trim()) {
    const jsTag = '<script>' + site.js + '<\/script>';
    if (html.includes('</body>')) {
      html = html.replace('</body>', jsTag + '</body>');
    } else {
      html = html + jsTag;
    }
  }

  return html;
}

function preview404(subdomain, message) {
  const html = `<!DOCTYPE html>
<html lang="ms">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Preview — ${subdomain}</title>
<style>
  body {
    background: #08080a;
    color: #e2e3e9;
    font-family: system-ui, sans-serif;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    text-align: center;
    margin: 0;
  }
  .box { max-width: 400px; }
  h1 { font-size: 48px; color: #cc9166; margin-bottom: 12px; font-weight: 700; }
  p { color: #9194a1; font-size: 15px; margin-bottom: 20px; line-height: 1.5; }
  code { background: #121317; padding: 3px 10px; border-radius: 4px; font-family: monospace; color: #cc9166; }
  a {
    display: inline-block;
    background: #ffffff;
    color: #000;
    padding: 10px 24px;
    border-radius: 999px;
    text-decoration: none;
    font-weight: 600;
    font-size: 13px;
  }
</style>
</head>
<body>
  <div class="box">
    <h1>Preview</h1>
    <p>${message}</p>
    <p style="margin-top:16px;"><code>${subdomain}.hairiamri.buzz</code></p>
    <a href="https://hairiamri.buzz/dashboard">← Balik Dashboard</a>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

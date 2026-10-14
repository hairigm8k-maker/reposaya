export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname;
    const parts = host.split('.');
    const path = url.pathname;

    // ===== MAINTENANCE MODE CHECK =====
    try {
      const mr = await env.DB.prepare("SELECT value FROM global_settings WHERE key = 'maintenance_mode'").first();
      if (mr && mr.value === 'on') {
        const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Under Maintenance</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Playfair+Display:wght@400&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#08080a;color:#e2e3e9;font-family:Inter,system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center}.wrap{max-width:520px}h1{font-family:Playfair Display,Georgia,serif;font-weight:400;font-size:32px;color:#fff;margin-bottom:16px;line-height:1.2}p{font-size:15px;color:#9194a1;line-height:1.6;margin-bottom:8px}.icon{width:64px;height:64px;margin:0 auto 24px;border-radius:50%;background:rgba(204,145,102,.1);display:flex;align-items:center;justify-content:center}.icon svg{width:32px;height:32px;stroke:#cc9166;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}</style></head><body><div class="wrap"><div class="icon"><svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg></div><h1>We will be back soon</h1><p>This website is currently under maintenance.</p><p style="font-size:13px;color:#5e616e;margin-top:16px">Please check back in a few minutes.</p></div></body></html>';
        return new Response(html, {
          status: 503,
          headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Cache-Control': 'no-store', 'Retry-After': '300' }
        });
      }
    } catch (e) {}
    // ===== END MAINTENANCE CHECK =====


    let customDomain = null;
    if (host.indexOf('hairiamri.buzz') < 0 && host.indexOf('workers.dev') < 0) {
      customDomain = await env.DB.prepare(
        'SELECT d.domain, d.site_id, s.id, s.html, s.css, s.js, s.status, s.subdomain FROM custom_domains d JOIN sites s ON s.id = d.site_id WHERE d.domain = ? AND d.verified = 1'
      ).bind(host).first();
    }

    let site = null;
    let subdomain = null;

    if (customDomain) {
      site = customDomain;
      subdomain = customDomain.subdomain;
    } else {
      subdomain = parts[0];
      if (!subdomain || subdomain === 'www') {
        return new Response('Invalid subdomain', { status: 400 });
      }
      site = await env.DB.prepare(
        'SELECT id, name, subdomain, html, css, js, status FROM sites WHERE subdomain = ?'
      ).bind(subdomain).first();
    }

    if (!site) return notFound(subdomain, 'Website tidak dijumpai');
    if (site.status !== 'live') return notFound(subdomain, 'Website belum publish');

    // Serve file dari D1 (kalau path ada extension)
    if (path !== '/' && path.indexOf('.') > 0) {
      const filename = path.substring(1).split('/').pop();
      try {
        const file = await env.DB.prepare(
          'SELECT mime_type, data FROM files WHERE site_id = ? AND filename = ?'
        ).bind(site.id, filename).first();

        if (file) {
          const binary = atob(file.data);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

          return new Response(bytes, {
            headers: {
              'Content-Type': file.mime_type,
              'Cache-Control': 'public, max-age=31536000'
            }
          });
        }
      } catch (e) {
        console.error('File serve error:', e);
      }
    }

    // Analytics log
    if (site.id) {
      try {
        const country = request.cf?.country || 'XX';
        const ua = (request.headers.get('User-Agent') || '').slice(0, 200);
        const ref = (request.headers.get('Referer') || '').slice(0, 200);
        const ip = request.headers.get('CF-Connecting-IP') || '';
        const ipHash = ip ? ip.slice(0, 8) : 'anon';

        env.DB.prepare(
          'INSERT INTO analytics (site_id, subdomain, path, country, user_agent, referrer, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(site.id, site.subdomain || subdomain, path, country, ua, ref, ipHash).run().catch(function() {});
      } catch (e) {}
    }

    const html = buildPage(site);

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
        'X-Site': subdomain
      }
    });
  }
};

function buildPage(site) {
  let html = site.html || '<h1>' + (site.name || 'Site') + '</h1>';
  if (site.css && site.css.trim()) {
    const cssTag = '<style>' + site.css + '</style>';
    if (html.indexOf('</head>') >= 0) html = html.replace('</head>', cssTag + '</head>');
    else html = cssTag + html;
  }
  if (site.js && site.js.trim()) {
    const jsTag = '<script>' + site.js + '<\/script>';
    if (html.indexOf('</body>') >= 0) html = html.replace('</body>', jsTag + '</body>');
    else html = html + jsTag;
  }
  return html;
}

function notFound(sub, message) {
  const html = '<!DOCTYPE html><html lang="ms"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>404</title><style>*{box-sizing:border-box;margin:0;padding:0}body{background:#08080a;color:#e2e3e9;font-family:system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center}h1{font-size:72px;color:#dc2626;margin-bottom:16px}p{color:#9194a1;font-size:15px;margin-bottom:24px;line-height:1.6}code{background:#121317;padding:4px 12px;border-radius:6px;font-family:monospace;color:#cc9166;font-size:13px}a{display:inline-block;background:#dc2626;color:#fff;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px}</style></head><body><div><h1>404</h1><p>' + message + '</p><p><code>' + sub + '</code></p><a href="https://hairiamri.buzz">Balik Utama</a></div></body></html>';
  return new Response(html, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

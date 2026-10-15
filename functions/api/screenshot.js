import { json } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const target = url.searchParams.get('url');
  const width = Math.min(parseInt(url.searchParams.get('w')) || 1200, 1600);
  const height = Math.min(parseInt(url.searchParams.get('h')) || 800, 1200);
  const force = url.searchParams.get('force') === '1';

  if (!target) return json({ ok: false, error: 'url required' }, 400);
  if (!/^https?:\/\//.test(target)) return json({ ok: false, error: 'url must start with http' }, 400);

  // Whitelist — only hairiamri.buzz
  try {
    const host = new URL(target).hostname;
    if (!/\.hairiamri\.buzz$/i.test(host) && host !== 'hairiamri.buzz') {
      return json({ ok: false, error: 'Only hairiamri.buzz URLs allowed' }, 403);
    }
  } catch (e) {
    return json({ ok: false, error: 'Invalid URL' }, 400);
  }

  const cacheKey = 'shot:' + target + ':' + width + 'x' + height;

  if (!force && env.BOT_KV) {
    try {
      const cached = await env.BOT_KV.get(cacheKey);
      if (cached) {
        const buffer = Uint8Array.from(atob(cached), function(c) { return c.charCodeAt(0); });
        return new Response(buffer, {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400',
            'X-Cache': 'HIT'
          }
        });
      }
    } catch (e) {}
  }

  try {
    const shotUrl = 'https://image.thum.io/get/width/' + width + '/crop/' + height + '/noanimate/' + target;
    const r = await fetch(shotUrl, { headers: { 'User-Agent': 'HairiHosting/1.0' } });

    let buf = null;
    let fromFallback = false;

    if (r.ok) {
      buf = await r.arrayBuffer();
    } else {
      const fallback = 'https://s.wordpress.com/mshots/v1/' + encodeURIComponent(target) + '?w=' + width + '&h=' + height;
      const r2 = await fetch(fallback, { headers: { 'User-Agent': 'HairiHosting/1.0' } });
      if (!r2.ok) return json({ ok: false, error: 'Screenshot unavailable' }, 502);
      buf = await r2.arrayBuffer();
      fromFallback = true;
    }

    if (env.BOT_KV) {
      try {
        const b64 = btoa(String.fromCharCode.apply(null, new Uint8Array(buf)));
        await env.BOT_KV.put(cacheKey, b64, { expirationTtl: 86400 });
      } catch (e) {}
    }

    return new Response(buf, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
        'X-Cache': fromFallback ? 'MISS-FALLBACK' : 'MISS'
      }
    });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}

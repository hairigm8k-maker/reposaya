// Maintenance mode helper
// Cache result in memory untuk elak query DB tiap request

let cache = { value: null, expires: 0 };
const CACHE_MS = 60000; // 60s

export async function isMaintenanceMode(env) {
  const now = Date.now();
  if (cache.value !== null && cache.expires > now) return cache.value;
  try {
    const row = await env.DB.prepare(
      'SELECT value FROM global_settings WHERE key = \'maintenance_mode\''
    ).first();
    const isOn = row && row.value === 'on';
    cache.value = isOn;
    cache.expires = now + CACHE_MS;
    return isOn;
  } catch (e) {
    return false; // fail open — kalau DB error, biarkan normal
  }
}

export function maintenanceResponse() {
  const html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Under Maintenance · HairiHosting</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Playfair+Display:wght@400&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#08080a;color:#e2e3e9;font-family:Inter,system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center}.wrap{max-width:520px}h1{font-family:\'Playfair Display\',serif;font-weight:400;font-size:32px;color:#fff;margin-bottom:16px;line-height:1.2}p{font-size:15px;color:#9194a1;line-height:1.6;margin-bottom:8px}.icon{width:64px;height:64px;margin:0 auto 24px;border-radius:50%;background:rgba(204,145,102,.1);display:flex;align-items:center;justify-content:center}.icon svg{width:32px;height:32px;stroke:#cc9166;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}</style></head><body><div class="wrap"><div class="icon"><svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg></div><h1>We&apos;ll be back soon</h1><p>HairiHosting is currently undergoing scheduled maintenance.</p><p style="font-size:13px;color:#5e616e;margin-top:16px">Please check back in a few minutes.</p></div></body></html>';
  return new Response(html, {
    status: 503,
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'no-store',
      'Retry-After': '300'
    }
  });
}

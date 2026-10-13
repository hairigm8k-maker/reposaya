export async function onRequestGet() {
  const templates = [
    {
      id: 'blank',
      name: 'Blank',
      desc: 'Kosong — mula from zero',
      html: '<!DOCTYPE html>\n<html lang="ms">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Website Baru</title>\n</head>\n<body>\n<h1>Hello World</h1>\n</body>\n</html>'
    },
    {
      id: 'bio',
      name: 'Link in Bio',
      desc: 'For creator & influencer',
      html: '<!DOCTYPE html>\n<html lang="ms">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>My Links</title>\n<style>\n*{box-sizing:border-box;margin:0;padding:0}\nbody{font-family:system-ui,sans-serif;max-width:400px;margin:0 auto;padding:40px 20px;text-align:center;background:#0a0a0a;color:#fff;min-height:100vh}\n.avatar{width:100px;height:100px;border-radius:50%;margin:0 auto 20px;background:linear-gradient(135deg,#667eea,#764ba2)}\nh1{font-size:22px;margin-bottom:8px}\np{color:#888;margin-bottom:30px}\na{display:block;padding:16px;margin-bottom:12px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:12px;transition:0.2s}\na:hover{background:#2a2a2a;transform:translateY(-2px)}\n</style>\n</head>\n<body>\n<div class="avatar"></div>\n<h1>Nama Kau</h1>\n<p>@username · Content Creator</p>\n<a href="#">🌐 Website</a>\n<a href="#">📸 Instagram</a>\n<a href="#">🎵 TikTok</a>\n<a href="#">📧 Email</a>\n</body>\n</html>'
    },
    {
      id: 'product',
      name: 'Product Landing',
      desc: 'Jual satu produk',
      html: '<!DOCTYPE html>\n<html lang="ms">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Produk</title>\n<style>\n*{box-sizing:border-box;margin:0;padding:0}\nbody{font-family:system-ui,sans-serif;background:#fff;color:#111}\n.hero{padding:80px 20px;text-align:center;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff}\n.hero h1{font-size:42px;margin-bottom:16px}\n.hero p{font-size:18px;opacity:0.9;margin-bottom:32px}\n.cta{display:inline-block;padding:16px 40px;background:#fff;color:#764ba2;border-radius:999px;text-decoration:none;font-weight:700}\n.features{max-width:800px;margin:60px auto;padding:0 20px}\n.feat{padding:20px;border-bottom:1px solid #eee}\n.feat h3{margin-bottom:8px}\n.feat p{color:#666}\n</style>\n</head>\n<body>\n<div class="hero">\n<h1>Produk Awesome</h1>\n<p>Penyelesaian for masalah you</p>\n<a href="#" class="cta">Beli Sekarang</a>\n</div>\n<div class="features">\n<div class="feat"><h3>✅ Feature 1</h3><p>Penerangan feature pertama</p></div>\n<div class="feat"><h3>✅ Feature 2</h3><p>Penerangan feature kedua</p></div>\n<div class="feat"><h3>✅ Feature 3</h3><p>Penerangan feature ketiga</p></div>\n</div>\n</body>\n</html>'
    },
    {
      id: 'portfolio',
      name: 'Portfolio',
      desc: 'Tunjuk kerja kau',
      html: '<!DOCTYPE html>\n<html lang="ms">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Portfolio</title>\n<style>\n*{box-sizing:border-box;margin:0;padding:0}\nbody{font-family:system-ui,sans-serif;background:#f5f5f5;color:#111}\n.hero{padding:100px 20px;text-align:center}\n.hero h1{font-size:56px;margin-bottom:16px;letter-spacing:-2px}\n.hero p{font-size:20px;color:#666}\n.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;max-width:1000px;margin:40px auto 100px;padding:0 20px}\n.card{background:#fff;border-radius:16px;padding:24px;box-shadow:0 4px 12px rgba(0,0,0,0.05)}\n.card h3{margin-bottom:8px}\n.card p{color:#666;font-size:14px}\n</style>\n</head>\n<body>\n<div class="hero">\n<h1>Nama Kau</h1>\n<p>Designer · Developer · Creator</p>\n</div>\n<div class="grid">\n<div class="card"><h3>Project 1</h3><p>Penerangan project</p></div>\n<div class="card"><h3>Project 2</h3><p>Penerangan project</p></div>\n<div class="card"><h3>Project 3</h3><p>Penerangan project</p></div>\n<div class="card"><h3>Project 4</h3><p>Penerangan project</p></div>\n</div>\n</body>\n</html>'
    },
    {
      id: 'feedback',
      name: 'Form Feedback',
      desc: 'Kumpul feedback pelanggan',
      html: '<!DOCTYPE html>\n<html lang="ms">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Feedback</title>\n<style>\n*{box-sizing:border-box;margin:0;padding:0}\nbody{font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;padding:60px 20px;background:#fff}\nh1{margin-bottom:8px}\np{color:#666;margin-bottom:32px}\nlabel{display:block;font-weight:600;margin-bottom:6px;font-size:14px}\ninput,textarea{width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;margin-bottom:16px;font-family:inherit;font-size:15px}\ntextarea{min-height:120px;resize:vertical}\nbutton{width:100%;padding:14px;background:#111;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer}\n</style>\n</head>\n<body>\n<h1>We Hargai Feedback</h1>\n<p>Bantu kami perbaiki servis</p>\n<form>\n<label>Nama</label>\n<input type="text" placeholder="Nama you">\n<label>Email</label>\n<input type="email" placeholder="email@contoh.com">\n<label>Mesej</label>\n<textarea placeholder="Taip feedback..."></textarea>\n<button type="submit">Send</button>\n</form>\n</body>\n</html>'
    }
  ];
  return new Response(JSON.stringify({ ok: true, templates: templates }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

var index_default = {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const host = url.hostname;
      const parts = host.split(".");
      const path = url.pathname;

      // 1. Maintenance Check
      try {
        const mr = await env.DB.prepare("SELECT value FROM global_settings WHERE key = 'maintenance_mode'").first();
        if (mr && mr.value === "on") {
          const html2 = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Under Maintenance</title></head><body style="background:#08080a;color:#fff;text-align:center;padding:50px"><h1>We will be back soon</h1></body></html>';
          return new Response(html2, { status: 503, headers: { "Content-Type": "text/html" } });
        }
      } catch (e) {}

      // 2. Custom Domain / Subdomain Lookup
      let site = null;
      let subdomain = null;
      
      if (host.indexOf("hairiamri.buzz") < 0 && host.indexOf("workers.dev") < 0) {
        site = await env.DB.prepare("SELECT d.domain, d.site_id, s.id, s.html, s.css, s.js, s.status, s.subdomain FROM custom_domains d JOIN sites s ON s.id = d.site_id WHERE d.domain = ? AND d.verified = 1").bind(host).first();
      }

      if (site) {
        subdomain = site.subdomain;
      } else {
        subdomain = parts[0];
        if (!subdomain || subdomain === "www") return new Response("Invalid subdomain", { status: 400 });
        site = await env.DB.prepare("SELECT id, name, subdomain, html, css, js, status FROM sites WHERE subdomain = ?").bind(subdomain).first();
      }

      if (!site) return new Response("Website tidak dijumpai", { status: 404 });
      if (site.status !== "live") return new Response("Website belum publish", { status: 403 });

      // 3. File Serving
      if (path !== "/" && path.indexOf(".") > 0) {
        const filename = path.substring(1).split("/").pop();
        try {
          const file = await env.DB.prepare("SELECT mime_type, data FROM files WHERE site_id = ? AND filename = ?").bind(site.id, filename).first();
          if (file) {
            const binary = atob(file.data);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            return new Response(bytes, { headers: { "Content-Type": file.mime_type } });
          }
        } catch (e) {}
      }

      // 4. Build Page
      let finalHtml = site.html || "<h1>Site</h1>";
      if (site.css) finalHtml = "<style>" + site.css + "</style>" + finalHtml;
      if (site.js) finalHtml = finalHtml + "<script>" + site.js + "<\/script>";

      return new Response(finalHtml, { headers: { "Content-Type": "text/html; charset=utf-8" } });

    } catch (error) {
      return new Response("Error: " + error.message, { status: 500 });
    }
  }
};

export { index_default as default };

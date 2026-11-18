/**
 * HairiHosting - Subdomain Static Hosting Platform
 * Script: Bilingual Language Switcher (EN / BM) & Interactive FAQ Accordion
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. FAQ Accordion Logic
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close all
        faqItems.forEach(i => i.classList.remove('active'));
        // Toggle current
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // 2. Bilingual Dictionary for Subdomain Hosting Platform
  const langToggleBtn = document.getElementById('langToggleBtn');
  let currentLang = localStorage.getItem('site_lang') || 'en';

  const translations = {
    en: {
      promoText: '⚡ DEPLOY YOUR HTML SITE TO SUBDOMAIN IN SECONDS. ZERO COMPLEX SETUP.',
      promoLink: 'GET STARTED FREE',
      navFeatures: 'Features',
      navHowItWorks: 'How It Works',
      navCli: 'CLI Tool',
      navFaq: 'FAQ',
      navSignIn: 'Sign In',
      navGetStarted: 'Join / Redeem',
      heroBadge: 'Instant Subdomain Hosting',
      heroTitle: 'Deploy Static Websites To <span class="highlight">Your Subdomain</span> In Seconds!',
      heroSub: 'Host HTML, CSS, JavaScript, and assets instantly on your own <strong>yoursite.hairiamri.buzz</strong> subdomain. Deploy through our interactive web editor or directly from your terminal using our fast CLI tool.',
      heroBtnGetStarted: 'Deploy Your First Site',
      heroBtnDocs: 'View CLI Documentation',
      metric1Num: '< 2s',
      metric1Title: 'Deploy Speed',
      metric1Desc: 'Instant global propagation',
      metric2Num: 'Cloudflare',
      metric2Title: 'Edge Network',
      metric2Desc: 'Ultra low-latency delivery',
      metric3Num: '100% Free',
      metric3Title: 'SSL HTTPS',
      metric3Desc: 'Auto-provisioned on every site',
      metric4Num: '2 Ways',
      metric4Title: 'Web & CLI',
      metric4Desc: 'Deploy in browser or terminal',
      feat1Badge: 'Subdomain Freedom',
      feat1Title: 'Your Own Clean Subdomain <span class="highlight">*.hairiamri.buzz</span>',
      feat1Sub: 'Pick any available subdomain name for your projects. Perfect for portfolios, student class projects, client landing pages, documentation, and web experiments.',
      feat1Point1: 'Instant subdomain creation (e.g. <code>danial.hairiamri.buzz</code>)',
      feat1Point2: 'Automatic SSL certificate (HTTPS) active out-of-the-box',
      feat1Point3: 'Sub-50ms loading times served from global edge nodes',
      feat1Point4: 'Built-in visitor analytics & pageview statistics',
      feat1Btn: 'Open Dashboard',
      feat2Badge: 'Browser Dashboard',
      feat2Title: 'Code In Browser or <span class="highlight">Upload A ZIP File</span>',
      feat2Sub: 'No CLI? No problem! The HairiHosting Dashboard gives you a complete web-based IDE with real-time preview, asset manager, and 1-click ZIP extraction.',
      feat2Point1: '<strong>Built-in Tab Editor:</strong> Edit HTML, CSS, and JS with syntax highlighting',
      feat2Point2: '<strong>Drag & Drop ZIP Upload:</strong> Automatically unpacks your HTML & image assets',
      feat2Point3: '<strong>Export Site:</strong> Download your entire project as a ZIP anytime',
      feat2Point4: '<strong>Live Switch:</strong> Toggle between Draft and LIVE status with one click',
      feat2Btn: 'Launch Web Editor',
      cliBadge: 'Developer Tooling',
      cliTitle: 'Deploy From Terminal with <span class="highlight">hh-cli-deploy</span>',
      cliSub: 'Built for developers, students, and power users. Works on Termux (Android phone), macOS, Linux, and Windows PowerShell. Deploy in just one command: <span class="code-badge">hh deploy</span>.',
      cliPoint1: '<code>hh login &lt;key&gt;</code> — authenticate with your dashboard API key',
      cliPoint2: '<code>hh deploy ./dist</code> — deploys local folder directly to your subdomain',
      cliPoint3: '<code>hh list</code> & <code>hh whoami</code> — inspect deployments and active account',
      cliPoint4: 'Perfect for GitHub Actions, GitLab CI, and automated build scripts',
      cliBtnDocs: 'Read Full CLI Documentation →',
      stepsBadge: 'Simple 3-Step Flow',
      stepsTitle: 'How Subdomain Hosting Works',
      stepsSub: 'Getting your static website online has never been this straightforward.',
      step1Title: 'Create or Redeem Account',
      step1Desc: 'Sign in or redeem your class access token on the redeem page to unlock your subdomain quota.',
      step2Title: 'Pick Subdomain Name',
      step2Desc: 'Choose a unique subdomain like <code>myportfolio.hairiamri.buzz</code> and create your site slot.',
      step3Title: 'Deploy & Share',
      step3Desc: 'Upload your files in the dashboard or run <code>hh deploy</code> from your terminal. Your site is live worldwide instantly!',
      reviewsBadge: 'Community Feedback',
      reviewsTitle: 'Built for Builders & Creators',
      reviewsSub: 'See why creators and developers love using HairiHosting for rapid web deployment.',
      faqBadge: 'Common Questions',
      faqTitle: 'Frequently Asked Questions',
      faqQ1: 'What kind of websites can I host on HairiHosting?',
      faqA1: 'HairiHosting hosts static websites composed of HTML, CSS, client-side JavaScript, and media assets (images, fonts, SVGs). It is ideal for personal portfolios, landing pages, documentation, and Single-Page Applications (SPAs).',
      faqQ2: 'What is my website address format?',
      faqA2: 'Your website is served directly on your chosen subdomain: <code>https://yourname.hairiamri.buzz</code>. SSL certificate is automatically generated and managed for you.',
      faqQ3: 'Can I deploy using the CLI from Termux on Android?',
      faqA3: 'Yes! Install Node.js in Termux (<code>pkg install nodejs</code>), run <code>npm install -g hh-cli-deploy</code>, log in with your API key, and you can deploy straight from your phone or tablet.',
      faqQ4: 'How do I upload a whole folder of files?',
      faqA4: 'You can either compress your folder into a <code>.zip</code> file and click "Upload ZIP" in the dashboard editor, or run <code>hh deploy ./folder</code> from your terminal.',
      faqQ5: 'How do I get an account or token?',
      faqA5: 'You can sign in with your email credentials, request an invite token from the administrator, or use the Redeem page if you have a class access code.',
      ctaBadge: 'Ready to Host?',
      ctaTitle: 'Start Deploying To Your Subdomain Today',
      ctaSub: 'Join hundreds of users hosting fast, secured static sites on HairiHosting.',
      ctaBtnRedeem: 'Redeem Access Code',
      ctaBtnLogin: 'Sign In to Dashboard'
    },
    bm: {
      promoText: '⚡ HOSTING SUBDOMAIN PANTAS UNTUK LAMAN WEB HTML ANDA. TANPA SETUP SUKAR.',
      promoLink: 'MULA SEKARANG PERCUMA',
      navFeatures: 'Ciri-Ciri',
      navHowItWorks: 'Cara Berfungsi',
      navCli: 'Alat CLI',
      navFaq: 'Soalan Lazim',
      navSignIn: 'Log Masuk',
      navGetStarted: 'Daftar / Redeem',
      heroBadge: 'Hosting Subdomain Segera',
      heroTitle: 'Deploy Website Statik Ke <span class="highlight">Subdomain Anda</span> Dalam Beberapa Saat!',
      heroSub: 'Hoskan fail HTML, CSS, JavaScript, dan imej serta-merta pada subdomain anda sendiri <strong>yoursite.hairiamri.buzz</strong>. Deploy menggunakan editor web kami atau terus dari terminal anda dengan alat CLI yang pantas.',
      heroBtnGetStarted: 'Deploy Laman Pertama Anda',
      heroBtnDocs: 'Lihat Dokumentasi CLI',
      metric1Num: '< 2s',
      metric1Title: 'Kelajuan Deploy',
      metric1Desc: 'Paparan segera serata dunia',
      metric2Num: 'Cloudflare',
      metric2Title: 'Rangkaian Edge',
      metric2Desc: 'Penghantaran pantas kependaman rendah',
      metric3Num: '100% Percuma',
      metric3Title: 'SSL HTTPS',
      metric3Desc: 'Disediakan automatik setiap laman',
      metric4Num: '2 Cara',
      metric4Title: 'Web & CLI',
      metric4Desc: 'Deploy dari pelayar atau terminal',
      feat1Badge: 'Kelebihan Subdomain',
      feat1Title: 'Subdomain Bersih Milik Anda <span class="highlight">*.hairiamri.buzz</span>',
      feat1Sub: 'Pilih nama subdomain yang ada untuk projek anda. Sesuai untuk portfolio peribadi, tugasan kelas pelajar, landing page klien, dokumentasi, dan eksperimen web.',
      feat1Point1: 'Cipta subdomain serta-merta (cth: <code>danial.hairiamri.buzz</code>)',
      feat1Point2: 'Sijil SSL (HTTPS) automatik aktif serta-merta',
      feat1Point3: 'Masa muat turun bawah 50ms dihidangkan dari pelayan edge global',
      feat1Point4: 'Statistik pelawat dan kiraan paparan laman terbina siap',
      feat1Btn: 'Buka Dashboard',
      feat2Badge: 'Dashboard Pelayar',
      feat2Title: 'Koding Dalam Pelayar atau <span class="highlight">Upload Fail ZIP</span>',
      feat2Sub: 'Tiada CLI? Tiada masalah! Dashboard HairiHosting menyediakan IDE web lengkap dengan preview masa nyata, pengurus fail, dan auto-extract fail ZIP dalam 1 klik.',
      feat2Point1: '<strong>Editor Tab Terbina:</strong> Edit HTML, CSS, dan JS dengan sokongan sintaks',
      feat2Point2: '<strong>Drag & Drop ZIP:</strong> Buka dan susun fail HTML serta gambar secara automatik',
      feat2Point3: '<strong>Eksport Laman:</strong> Muat turun seluruh kod projek anda sebagai fail ZIP bila-bila masa',
      feat2Point4: '<strong>Suis Status:</strong> Tukar status antara Draft dan LIVE dengan satu klik',
      feat2Btn: 'Buka Editor Web',
      cliBadge: 'Alatan Developer',
      cliTitle: 'Deploy Dari Terminal Guna <span class="highlight">hh-cli-deploy</span>',
      cliSub: 'Direka untuk developer, pelajar, dan pengguna tegar. Berfungsi lancar di Termux (Android), macOS, Linux, dan Windows PowerShell. Deploy dengan satu arahan: <span class="code-badge">hh deploy</span>.',
      cliPoint1: '<code>hh login &lt;key&gt;</code> — log masuk menggunakan kunci API akaun anda',
      cliPoint2: '<code>hh deploy ./dist</code> — hantar folder tempatan terus ke subdomain anda',
      cliPoint3: '<code>hh list</code> & <code>hh whoami</code> — semak senarai laman dan status akaun',
      cliPoint4: 'Sangat sesuai digandingkan dengan GitHub Actions dan skrip automasi',
      cliBtnDocs: 'Baca Dokumentasi Penuh CLI →',
      stepsBadge: '3 Langkah Mudah',
      stepsTitle: 'Bagaimana Hosting Subdomain Berfungsi',
      stepsSub: 'Menerbitkan website statik anda ke internet kini amat mudah dan cepat.',
      step1Title: 'Cipta atau Tebus Akaun',
      step1Desc: 'Log masuk atau tebus kod token kelas anda di laman tebusan untuk mengaktifkan kuota subdomain.',
      step2Title: 'Pilih Nama Subdomain',
      step2Desc: 'Pilih nama subdomain unik seperti <code>myportfolio.hairiamri.buzz</code> dan cipta slot laman anda.',
      step3Title: 'Deploy & Kongsi',
      step3Desc: 'Upload fail anda dalam dashboard atau taip <code>hh deploy</code> di terminal. Laman anda terus LIVE!',
      reviewsBadge: 'Maklum Balas Komuniti',
      reviewsTitle: 'Dibina Untuk Pembangun & Pencipta',
      reviewsSub: 'Ketahui mengapa ramai pengguna memilih HairiHosting untuk hoskan projek web mereka.',
      faqBadge: 'Soalan Lazim',
      faqTitle: 'Soalan Yang Kerap Ditanya',
      faqQ1: 'Apakah jenis laman web yang boleh saya hoskan di HairiHosting?',
      faqA1: 'HairiHosting menghoskan website statik merangkumi fail HTML, CSS, JavaScript klien, dan media (gambar, font, SVG). Sesuai untuk portfolio, landing page, dokumentasi, dan SPA.',
      faqQ2: 'Apakah format alamat URL laman web saya?',
      faqA2: 'Laman web anda boleh diakses terus di subdomain pilihan: <code>https://namapilihan.hairiamri.buzz</code> dengan sijil keselamatan SSL automatik.',
      faqQ3: 'Bolehkah saya deploy guna CLI dari Termux di telefon pintar Android?',
      faqA3: 'Ya! Pasang Node.js dalam Termux (<code>pkg install nodejs</code>), pasang <code>npm install -g hh-cli-deploy</code>, masukkan API key anda, dan anda boleh deploy dari telefon atau tablet.',
      faqQ4: 'Bagaimana cara memuat naik keseluruhan folder fail?',
      faqA4: 'Anda boleh mampatkan folder ke fail <code>.zip</code> dan klik butang "Upload ZIP" di editor dashboard, atau gunakan arahan terminal <code>hh deploy ./folder</code>.',
      faqQ5: 'Bagaimana cara untuk mendapatkan akaun atau token?',
      faqA5: 'Anda boleh log masuk menggunakan email yang didaftarkan, minta jemputan daripada admin, atau gunakan halaman Redeem sekiranya anda mempunyai token jemputan.',
      ctaBadge: 'Bersedia Untuk Hoskan?',
      ctaTitle: 'Mula Terbitkan Website Ke Subdomain Anda Hari Ini',
      ctaSub: 'Sertai ratusan pengguna yang menghoskan projek web mereka di HairiHosting.',
      ctaBtnRedeem: 'Tebus Kod Akses',
      ctaBtnLogin: 'Log Masuk Dashboard'
    }
  };

  function applyLanguage(lang) {
    const dict = translations[lang] || translations.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.innerHTML = dict[key];
      }
    });

    if (langToggleBtn) {
      langToggleBtn.textContent = lang === 'en' ? '🌐 EN / BM' : '🌐 BM / EN';
    }
    localStorage.setItem('site_lang', lang);
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'bm' : 'en';
      applyLanguage(currentLang);
    });
  }

  // Initial apply
  applyLanguage(currentLang);
});

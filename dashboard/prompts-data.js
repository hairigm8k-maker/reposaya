window.PROMPTS = [
{
  id: 'agency-bold',
  title: 'Bold Agency Landing',
  tag: 'Landing',
  desc: 'Full-screen agency landing page with big typography, dark theme, and animated marquee.',
  category: ['Landing', 'Dark', 'Agency'],
  body: `Build one standalone HTML document that is the entire Bold Agency landing page. Output only that file.

PAGE
- Language English. Title: NOVA Studio — We build brands that move.
- Background pure #0a0a0a. Text #f5f1e8. Accent electric lime #d4ff3a.

TYPE
- Font: Inter Tight + Inter, from Google Fonts.
- Display weight 700-800, tracking -0.045em.
- Hero headline clamp(48px, 12vw, 160px). Line-height 0.92.

NAV
- Fixed top, 72px height, backdrop blur 20px.
- Left: "NOVA" wordmark 18px weight 800.
- Center: Work, Studio, Approach, Journal, Contact. 15px, muted. Hover lime.
- Right: "Start a project →" pill button. Hover background lime, text #0a0a0a.

HERO
- Min-height 100vh, padding top 180px.
- Eyebrow pill: "★ Available for Q2 2026" border lime.
- Headline 4 lines with mask reveal: "Design." / "Develop." / "Deliver." / "Repeat." (lime).
- 2-column: text left, stats right (120+ Projects / 12 Years / 8 Awards).

MARQUEE
- Client names: Nike, Spotify, Airbnb, Figma, Stripe, Linear, Vercel, Anthropic, Arc, Framer.
- clamp(40px, 8vw, 96px), weight 700, opacity .35.
- 40s linear infinite.

WORK
- Grid 2-col. Project cards: dark #131313, radius 20px, aspect 4/3.
- Projects: Meridian Coffee, Atlas Fintech, Kinfolk Hotel, Bloom Skincare.
- Hover: scale 1.03, border lime.

APPROACH
- Background #f5f1e8, color #0a0a0a (inverted).
- 3-col: "01 Listen", "02 Design", "03 Ship".

CTA
- Headline "Let's build something" clamp(48px, 10vw, 140px).
- Button "Start a project" pill lime.

FOOTER
- 4-col: brand, work, studio, socials. Copyright 2026.`
},
{
  id: 'saas-gradient',
  title: 'SaaS Gradient Landing',
  tag: 'SaaS',
  desc: 'Modern SaaS landing with gradient hero, feature grid, pricing, and testimonials. Indigo/violet accent.',
  category: ['Landing', 'SaaS', 'Light'],
  body: `Build one standalone HTML document for a SaaS landing page. Output only that file.

PAGE
- Language English. Title: Flowboard — Project management for modern teams.
- Background #ffffff. Text #0f172a. Accent #6366f1, gradient to #a855f7.

TYPE
- Font: Inter, from Google Fonts. Display weight 800, tracking -0.04em.

NAV
- Fixed top, 68px, blur 20px, border-bottom hairline.
- Logo circle gradient + "Flowboard" 17px weight 700.
- Links: Features, Pricing, Customers, Docs.
- CTA: "Start free trial" pill background ink.

HERO
- Padding 140px 24px 100px. Radial gradient bg from rgba(99,102,241,.18).
- Eyebrow: "🎉 Announcing our $12M Series A" pill.
- Headline 2 lines: "Ship projects" / "10x faster" (gradient text).
- clamp(44px, 7vw, 88px), weight 800.
- Subhead muted 20px max-width 600px.
- Buttons: primary ink + ghost.
- Product preview card 16/10 aspect with fake browser chrome.

LOGO STRIP
- "Trusted by 4,000+ teams worldwide" 13px mono.
- 6 fake logo blocks 120×32px.

FEATURES
- Grid 3-col. 6 cards: Real-time collab, Kanban+Timeline, Integrations, Notifications, Automation, Enterprise security.
- Card: #f8fafc, border, radius 14px, padding 28px.
- Icon: gradient square 44px with SVG.

PRICING
- 3 tiers: Starter $0, Team $12 (POPULAR), Enterprise Custom.
- Popular card: border 2px #6366f1, scale 1.02.

TESTIMONIALS
- 3 cards with 5-star row + quote + author.

CTA
- Dark card #0f172a, radial gradient, headline "Ready to ship faster?".

FOOTER
- 4-col grid + bottom row with links.`
},
{
  id: 'portfolio-minimal',
  title: 'Minimal Portfolio',
  tag: 'Portfolio',
  desc: 'Editorial portfolio with cream background, black text, serif headlines. Feels like a magazine.',
  category: ['Portfolio', 'Light', 'Editorial'],
  body: `Build one standalone HTML document for a personal portfolio. Output only that file.

PAGE
- Language English. Title: Aina Rahman — Designer & Developer.
- Background #faf7f2 (warm cream). Text #1a1a1a. Accent #c9541a (terracotta).

TYPE
- Headings: Fraunces, Georgia, serif. Italic for emphasis.
- Body: Inter, sans-serif.
- Hero name clamp(56px, 12vw, 180px). Italic. Tracking -0.04em.

HEADER
- Top 40px padding. Left "Aina Rahman" 14px uppercase tracking 0.15em.
- Right "Menu" button with underline.

HERO
- Padding 120px 0 100px.
- "Portfolio — 2026" eyebrow 12px mono.
- "Aina Rahman" italic serif + "Designer, Developer, and problem solver".

BIO
- 2-col grid. 3 paragraphs left, "Currently" list right.
- Email: hello@ainarahman.com

WORK
- List rows with border-top hairline.
- Projects: Meridian Coffee, Atlas Fintech, Kinfolk Hotel, Bloom Skincare, Fold Type.
- Hover: color accent, translateX(8px).

CONTACT
- "Let's work together" clamp(48px, 10vw, 120px).

OVERLAY MENU
- Full-screen cream overlay. Big italic serif links.

FOOTER
- Copyright + socials mono.

All animations: opacity fades, translateY. Respect prefers-reduced-motion.`
}
];

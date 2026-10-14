window.PROMPTS = [
{
  id: 'agency-bold',
  title: 'Bold Agency Landing',
  tag: 'Landing',
  desc: 'Full-screen agency landing page with big typography, dark theme, and animated marquee. Feels like an award-winning studio site.',
  category: ['Landing', 'Dark', 'Agency'],
  body: `Build one standalone HTML document that is the entire Bold Agency landing page. Output only that file. Reproduce the markup, CSS, SVG paths, type, and motion exactly. Do not restyle, simplify, rename classes, or substitute a different color.

PAGE
- Language English. Title: NOVA Studio — We build brands that move.
- Viewport: width=device-width, initial-scale=1, viewport-fit=cover. Theme color #0a0a0a.
- Full-page vertical scroll allowed. Background pure #0a0a0a with cream text #f5f1e8.
- Accent: electric lime #d4ff3a for highlights and hover states.

TYPE
- Font family: "Inter Tight", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif.
- Load Inter Tight from Google Fonts weight 400, 500, 600, 700, 800.
- Display headlines weight 700 to 800, tracking -0.045em.
- Body weight 400, tracking -0.01em.
- Antialiased, text-rendering geometricPrecision.

SCALE
- Root font-size 16px. All sizes use clamp() for responsiveness.
- Hero headline: clamp(48px, 12vw, 160px). Line-height 0.92.
- Section headlines: clamp(32px, 6vw, 72px). Line-height 1.0.
- Body: clamp(15px, 1.2vw, 17px). Line-height 1.55.
- Colors: ink #f5f1e8; muted rgba(245,241,232,.55); hairline rgba(245,241,232,.12); lime #d4ff3a.

NAV
- Fixed top bar, height 72px, transparent with backdrop blur 20px, background rgba(10,10,10,.6).
- Left: wordmark "NOVA" in weight 800, size 18px, tracking -0.03em.
- Center: menu links "Work", "Studio", "Approach", "Journal", "Contact". 15px weight 500, color muted. Hover: lime, no underline, transition 180ms ease-out.
- Right: pill button "Start a project →" with border 1px rgba(245,241,232,.25), padding 10px 20px, radius 9999px. Hover: background lime, color #0a0a0a, transition 200ms.
- Mobile (<900px): hide center links, show hamburger icon that toggles a full-screen overlay menu with the same links stacked vertically at 32px font.

HERO
- Min-height 100vh, padding top 180px, padding bottom 80px, padding left/right 24px, max-width 1400px margin auto.
- Eyebrow: small pill "★ Available for Q2 2026" with border, 12px mono tracking 0.1em uppercase, color lime, padding 6px 14px, radius 9999px. Margin-bottom 40px.
- Headline in 4 stacked lines, each line is a block span with mask-based reveal (overflow hidden, translate Y from 105% to 0):
  line 1: "Design."
  line 2: "Develop."
  line 3: "Deliver."
  line 4: "Repeat." (color lime)
- Each line animates in sequence on load: line 1 delay 0ms, line 2 delay 120ms, line 3 delay 240ms, line 4 delay 360ms. Duration 800ms, cubic-bezier(0.16, 1, 0.3, 1).
- Below headline: 2-column row on desktop, stacked on mobile. Left: paragraph max-width 480px, 18px, line-height 1.55, color muted. Text: "We are a small team building big digital things for brands who refuse to be boring. Strategy, design, and code under one roof."
- Right: metric row with 3 stats: "120+ Projects shipped" / "12 Years in studio" / "8 Industry awards". Each stat: number in 40px weight 700 tracking -0.04em color ink, label in 13px color muted margin-top 8px.

MARQUEE
- Full-width section with 96px vertical padding, border-top and border-bottom 1px hairline.
- Overflow hidden, contains a horizontal marquee of client names separated by a dot glyph "·".
- Names: Nike, Spotify, Airbnb, Figma, Stripe, Linear, Vercel, Anthropic, Arc, Framer.
- Text size clamp(40px, 8vw, 96px), weight 700, tracking -0.04em, color rgba(245,241,232,.35). Hover names: color ink, transition 200ms.
- Marquee animation: linear 40s infinite, translateX 0 to -50%. Duplicate the list so it loops seamlessly.
- On prefers-reduced-motion: pause animation.

WORK SECTION
- Padding 120px 24px, max-width 1400px margin auto.
- Section eyebrow "SELECTED WORK" 12px mono lime uppercase tracking 0.15em margin-bottom 20px.
- Headline "Recent things we shipped" 56-72px margin-bottom 64px max-width 800px.
- Grid: 2 columns on desktop, 1 column on mobile, gap 24px.
- Each project card: dark surface #131313, radius 20px, overflow hidden, aspect-ratio 4/3 for image area, padding 24px for meta.
- Image area: gradient placeholder (use background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)) with a centered project initial letter in 96px weight 800 color rgba(245,241,232,.15).
- Meta: project name 22px weight 600 tracking -0.02em, category label 13px color muted margin-top 6px, arrow icon "↗" in lime on the right.
- Hover: image area scales 1.03, card border-color becomes lime, transition 400ms cubic-bezier(0.22, 1, 0.36, 1).
- Projects: "Meridian Coffee — Brand + Web", "Atlas Fintech — App Design", "Kinfolk Hotel — Web + Booking", "Bloom Skincare — E-commerce".

APPROACH SECTION
- Padding 120px 24px, background #f5f1e8, color #0a0a0a (inverted section).
- Headline "How we work" clamp(40px, 6vw, 72px) color #0a0a0a, margin-bottom 64px.
- 3-column grid desktop, 1-column mobile, gap 48px.
- Each column: number "01" 14px mono color #0a0a0a opacity .4 margin-bottom 24px; title 24px weight 600 tracking -0.03em margin-bottom 16px; body 15px line-height 1.6 color rgba(10,10,10,.7).
- Items: "01 Listen" / "Deep dive into your brand, audience, and competitive landscape." — "02 Design" / "Wireframes, prototypes, and pixel-perfect visuals ready for production." — "03 Ship" / "Clean code, fast performance, and a launch that hits every deadline."

CTA SECTION
- Padding 140px 24px, text-align center.
- Headline "Let's build something" clamp(48px, 10vw, 140px) tracking -0.045em margin-bottom 40px.
- Button "Start a project" pill 18px weight 600 padding 18px 40px background lime color #0a0a0a radius 9999px. Hover: transform scale(1.04), transition 200ms cubic-bezier(0.22, 1, 0.36, 1).
- Below: email "hello@nova.studio" 15px mono color muted margin-top 24px. Hover: color lime.

FOOTER
- Padding 60px 24px 40px, border-top 1px hairline.
- 4 columns desktop: brand, work, studio, socials. Stack on mobile.
- Brand column: "NOVA" 20px weight 800 tracking -0.03em, tagline "Independent design studio. Based in Kuala Lumpur."
- Links 14px color muted, hover lime, margin-bottom 10px each.
- Bottom row: copyright "© 2026 NOVA Studio. All rights reserved." 12px mono color rgba(245,241,232,.4). Right side: "Privacy · Terms" same size.

MOTION
- Scroll-triggered fade + rise for section headlines: from opacity 0, translateY 40px to opacity 1, translateY 0. Duration 900ms, cubic-bezier(0.16, 1, 0.3, 1). Trigger at 15% viewport entry using IntersectionObserver.
- Project cards: staggered fade-in with 100ms delay between each.
- Marquee: continuous horizontal scroll.
- All animations respect prefers-reduced-motion: reduce — disable all transforms and use opacity-only transitions with 200ms duration.

RESPONSIVE
- Tablet 600-1024px: reduce hero headline to clamp(40px, 10vw, 96px). Grid stacks to 1 column for work section.
- Mobile under 600px: hero padding-top 140px. Headline clamp(40px, 13vw, 72px). Marquee text 32px. Buttons full-width stacked.
- All tap targets minimum 44px height.

FOCUS
- Visible focus outline 2px solid lime offset 3px on all interactive elements.`
},
{
  id: 'saas-gradient',
  title: 'SaaS Gradient Landing',
  tag: 'SaaS',
  desc: 'Modern SaaS landing page with gradient hero, feature grid, pricing table, and testimonials. Light theme, indigo/violet accent.',
  category: ['Landing', 'SaaS', 'Light'],
  body: `Build one standalone HTML document for a SaaS landing page. Output only that file. Reproduce the markup, CSS, and copy exactly. No external assets, no images from URLs, no icon libraries.

PAGE
- Language English. Title: Flowboard — Project management for modern teams.
- Viewport: width=device-width, initial-scale=1, viewport-fit=cover. Theme color #ffffff.
- Full-page scroll allowed. Background #ffffff with subtle gradient mesh in hero.

TYPE
- Font: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif.
- Load Inter from Google Fonts weight 400, 500, 600, 700, 800.
- Display weight 800, tracking -0.04em.
- Body weight 400, tracking -0.011em, line-height 1.6.
- Colors: ink #0f172a; muted #64748b; hairline #e2e8f0; accent #6366f1; accent-dark #4f46e5; gradient from #6366f1 to #a855f7.

NAV
- Fixed top, height 68px, background rgba(255,255,255,.8), backdrop-filter blur(20px), border-bottom 1px hairline.
- Container max-width 1200px, padding 0 24px, flex space-between.
- Logo: circle 32px with gradient background from #6366f1 to #a855f7, then wordmark "Flowboard" 17px weight 700 tracking -0.03em color ink, gap 10px.
- Links: "Features", "Pricing", "Customers", "Docs" 14px weight 500 color muted. Hover: color ink.
- Right: "Sign in" text link + "Start free trial" pill button 14px weight 600 background ink color white padding 10px 20px radius 9999px. Hover: background #334155.

HERO
- Padding 140px 24px 100px, text-align center, position relative.
- Background: absolute div behind hero with radial-gradient at 50% -20%, circle 800px, from rgba(99,102,241,.18) to transparent.
- Eyebrow pill: "🎉 Announcing our $12M Series A" 13px weight 500 color #4f46e5 background #eef2ff border 1px solid #c7d2fe padding 6px 14px radius 9999px margin-bottom 28px. Hover: background #e0e7ff.
- Headline: "Ship projects" line 1, "10x faster" line 2 with gradient text (linear-gradient(135deg, #6366f1, #a855f7, #ec4899); background-clip text, color transparent). clamp(44px, 7vw, 88px), weight 800, tracking -0.045em, line-height 1.05.
- Subhead: "The all-in-one workspace for product teams. Plan, track, and ship without the chaos." clamp(16px, 1.5vw, 20px), color muted, max-width 600px, margin 24px auto 40px, line-height 1.55.
- Button row: flex gap 12px centered.
  - Primary: "Start free trial" 15px weight 600 background ink color white padding 14px 28px radius 10px. Hover: background #334155, transform translateY(-1px), box-shadow 0 8px 20px rgba(15,23,42,.15). Transition 200ms.
  - Secondary: "Book a demo" 15px weight 600 background white color ink border 1px solid hairline padding 14px 28px radius 10px. Hover: border-color #94a3b8.
- Below buttons: "No credit card required · 14-day free trial" 13px color muted margin-top 16px.
- Product preview card: max-width 1000px, margin 80px auto 0, background white, border 1px hairline, radius 16px, box-shadow 0 24px 60px rgba(15,23,42,.12), padding 12px, aspect-ratio 16/10.
  - Inside: fake browser chrome bar (dots red/yellow/green) 12px tall margin-bottom 12px.
  - Content area: linear-gradient(135deg, #f1f5f9, #e2e8f0), radius 10px, centered text "Product preview" 14px color #94a3b8.

LOGO STRIP
- Padding 60px 24px, border-top 1px hairline, border-bottom 1px hairline.
- Centered label "Trusted by 4,000+ teams worldwide" 13px mono uppercase tracking 0.1em color muted margin-bottom 32px.
- Row of 6 fake logo blocks, each: 120px × 32px background #f1f5f9 radius 6px. Gap 40px, flex wrap center.

FEATURES
- Padding 120px 24px, max-width 1200px.
- Section head: eyebrow "FEATURES" 12px mono uppercase color accent tracking 0.15em margin-bottom 16px centered. Headline "Everything your team needs" 48-64px weight 800 tracking -0.04em text-align center margin-bottom 16px. Subhead "One workspace for planning, tracking, and shipping." 18px color muted text-align center max-width 560px margin auto margin-bottom 80px.
- Grid: 3 columns desktop, 2 tablet, 1 mobile, gap 24px.
- 6 feature cards. Each card: background #f8fafc, border 1px solid hairline, radius 14px, padding 28px. Hover: border-color #c7d2fe, background white, box-shadow 0 4px 20px rgba(99,102,241,.08), transition 200ms.
- Card icon: 44px square, radius 10px, background linear-gradient(135deg, #eef2ff, #fae8ff), display flex, center. Contains inline SVG 22px stroke 2 currentColor color #6366f1.
- Card title: 17px weight 700 tracking -0.02em margin-top 20px margin-bottom 10px.
- Card description: 14px color muted line-height 1.6.
- Features: "Real-time collaboration" / "See teammates' cursors, comments, and edits live." — "Kanban + Timeline views" / "Switch between board and Gantt views instantly." — "Native integrations" / "Connect Slack, GitHub, Figma, and 40+ tools." — "Smart notifications" / "Only get pinged when you're actually needed." — "Unlimited automation" / "Trigger actions based on any rule you can imagine." — "Enterprise-grade security" / "SOC 2 Type II, SSO, and audit logs built-in."

PRICING
- Padding 120px 24px, background #f8fafc.
- Section head centered: eyebrow "PRICING", headline "Simple, honest pricing" 48-64px, subhead "Start free. Upgrade when you're ready."
- 3-column pricing table, gap 24px, max-width 1100px margin auto.
- Card 1: "Starter" / "$0" / "per month" / 4 bullet points / button "Get started". 4 bullets: "Up to 5 users", "Unlimited projects", "10 GB storage", "Community support".
- Card 2 (POPULAR): "Team" / "$12" / "per user / month" / 5 bullets / button "Start free trial". Badge top-right "MOST POPULAR" 11px mono uppercase background #6366f1 color white padding 4px 10px radius 9999px. Card has border 2px solid #6366f1, scale 1.02 on desktop, shadow 0 20px 40px rgba(99,102,241,.15).
- Card 3: "Enterprise" / "Custom" / "contact us" / 5 bullets / button "Contact sales".
- Card styling: white background, border 1px hairline, radius 16px, padding 32px.
- Price: 48px weight 800 tracking -0.04em color ink. Unit "per month" 14px color muted margin-top 4px.
- Bullet list: list-style none, gap 12px. Each bullet: inline SVG check circle 16px color #10b981 + text 14px color #334155.
- Button full-width: padding 12px radius 8px. Starter: background white border 1px solid hairline color ink. Team: background ink color white. Enterprise: background white border 1px solid hairline color ink.

TESTIMONIALS
- Padding 120px 24px.
- Section head: eyebrow "LOVED BY TEAMS", headline "Don't take our word for it".
- 3-column grid desktop, 1 mobile, gap 24px.
- Each testimonial card: background white border 1px hairline radius 14px padding 28px.
- Star row: 5 filled SVG stars 16px color #fbbf24 margin-bottom 16px.
- Quote: 15px color #334155 line-height 1.65 margin-bottom 24px italic.
- Author row: avatar 40px circle with initials on gradient background, name 14px weight 600 color ink, role 12px color muted.
- 3 testimonials:
  1. "Flowboard replaced 4 tools for us. The migration took one afternoon." — Sarah Chen, Head of Product at Linear.
  2. "The Kanban view is the cleanest I've used. My team actually enjoys updating tickets now." — Marcus Rivera, Engineering Lead at Vercel.
  3. "We shipped our v2 three weeks early. Flowboard's timeline view made the roadmap obvious." — Priya Patel, Co-founder at Arc.

CTA SECTION
- Padding 140px 24px, max-width 1000px margin auto, text-align center.
- Background: dark card #0f172a, radius 24px, padding 80px 40px, position relative, overflow hidden.
- Radial gradient overlay: radial-gradient at 50% 0%, circle 600px, from rgba(99,102,241,.4) to transparent.
- Headline "Ready to ship faster?" 48-64px weight 800 tracking -0.04em color white margin-bottom 20px.
- Subhead "Start your 14-day free trial today. No credit card required." 17px color rgba(255,255,255,.7) margin-bottom 32px.
- Button "Start free trial" 15px weight 600 background white color ink padding 16px 32px radius 10px. Hover: transform scale(1.03), transition 200ms.

FOOTER
- Padding 60px 24px 40px, border-top 1px hairline, max-width 1200px margin auto.
- Grid 4 columns desktop: brand + 3 link columns.
- Brand column: logo mark + "Flowboard" 17px weight 700 margin-bottom 12px. Tagline "The workspace for modern product teams." 13px color muted max-width 240px line-height 1.55.
- Link columns: "Product" (Features, Pricing, Integrations, Changelog), "Company" (About, Blog, Careers, Press), "Resources" (Docs, API, Community, Status).
- Column headings: 12px mono uppercase tracking 0.1em color #94a3b8 margin-bottom 16px weight 600.
- Links: 14px color #475569 margin-bottom 10px display block. Hover: color ink.
- Bottom row: border-top 1px hairline padding-top 24px margin-top 48px flex space-between: copyright "© 2026 Flowboard, Inc." and links "Privacy · Terms · Cookies" both 13px color muted.

INTERACTIONS
- Buttons: transition all 200ms cubic-bezier(0.22, 1, 0.36, 1).
- Cards: hover lift translateY(-2px) + shadow transition 200ms.
- Section headline reveals: IntersectionObserver at 15% → opacity 0 → 1, translateY 24px → 0. Duration 800ms.
- Numbers count up when pricing section enters viewport (optional).

RESPONSIVE
- Tablet 768-1024px: hero headline 56px. Feature grid 2 cols. Pricing 1 col stacked with popular card unscaled.
- Mobile under 768px: hide nav links, show hamburger. Hero padding 100px 20px 60px. Headline 44px. All grids single column. Pricing cards stacked.

FOCUS
- 2px solid #6366f1 outline offset 2px on all interactive elements.`
},
{
  id: 'portfolio-minimal',
  title: 'Minimal Portfolio',
  tag: 'Portfolio',
  desc: 'Clean minimalist portfolio for designers and developers. Cream background, black text, serif headlines. Feels editorial.',
  category: ['Portfolio', 'Light', 'Editorial'],
  body: `Build one standalone HTML document for a personal portfolio website. Output only that file.

PAGE
- Language English. Title: Aina Rahman — Designer & Developer.
- Viewport: width=device-width, initial-scale=1, viewport-fit=cover.
- Background #faf7f2 (warm cream). Text #1a1a1a. Accent #c9541a (terracotta).

TYPE
- Headings: "Fraunces", Georgia, serif. Weight 400-500. Italic for emphasis.
- Body: "Inter", ui-sans-serif, system-ui, sans-serif. Weight 400-500.
- Load Fraunces (opsz 9-144, wght 300-700) and Inter (400-600) from Google Fonts.
- Hero name: clamp(56px, 12vw, 180px). Weight 400. Italic. Tracking -0.04em. Line-height 0.95.
- Section heads: clamp(32px, 5vw, 56px). Weight 400. Tracking -0.02em.
- Body: 17px. Line-height 1.6. Color rgba(26,26,26,.7).

LAYOUT
- Max-width 1200px centered. Padding 0 32px on desktop, 0 20px on mobile.
- No page-level nav menu. Just a fixed top-right button "Menu" that toggles an overlay with: Work, About, Contact.

HEADER
- Top 40px padding. Left: name "Aina Rahman" 14px weight 500 uppercase tracking 0.15em.
- Right: "Menu" button 14px weight 500, border-bottom 1px solid #1a1a1a.

HERO
- Padding 120px 0 100px.
- Small line above name: "Portfolio — 2026" 12px mono color rgba(26,26,26,.5) uppercase tracking 0.2em margin-bottom 40px.
- Name: "Aina Rahman" on one line, italic serif. Below it "Designer, Developer, and problem solver" 20px italic serif color rgba(26,26,26,.6) margin-top 16px.
- Divider hairline 1px rgba(26,26,26,.15) margin 80px 0.

BIO
- 2-column grid desktop, 1 mobile. Gap 80px.
- Left column: 3 paragraphs 17px line-height 1.7 color rgba(26,26,26,.75).
  Para 1: "I design and build digital products for people who care about craft. Currently based in Kuala Lumpur, working with teams around the world."
  Para 2: "My background is in editorial design — I spent four years at a print magazine before switching to product. That means I care about typography, grids, and whitespace more than the average developer."
  Para 3: "I build what I design. No handoffs, no lost details."
- Right column: "Currently" heading italic serif 24px margin-bottom 24px, then a list: "→ Freelance design & code (2024—)", "→ Previously: Senior Designer at Kinfolk (2020-2024)", "→ Email: hello@ainarahman.com". Each item 15px line-height 1.7, hover accent.

WORK SECTION
- Section head: "Selected work" italic serif 56px margin-bottom 60px.
- Vertical list. Each project is a full-width row, border-top 1px rgba(26,26,26,.15), padding 40px 0.
- Each row: flex space-between, align baseline, gap 40px.
- Left: project name in serif 32px italic. Hover: color accent, transform translateX(8px), transition 300ms cubic-bezier(0.22, 1, 0.36, 1).
- Right: meta in 13px mono uppercase tracking 0.1em color rgba(26,26,26,.5) with year and category.
- Projects: "Meridian Coffee — Brand & Web · 2026", "Atlas Fintech — Product Design · 2025", "Kinfolk Hotel — Web Experience · 2025", "Bloom Skincare — E-commerce · 2024", "Fold Type — Typeface Design · 2024".
- Arrow "↗" appears on hover at right end with fade + slide.

SELECTED IMAGES
- After work list, a masonry-ish grid of 4 image placeholders.
- Use 4 blocks with aspect ratios: 4/5, 1/1, 5/4, 4/5. Backgrounds alternate between #ebe5dc, #e5ddd2, #f0e9e0, #e8e0d5.
- Each block has border-radius 4px and margin-bottom 24px (allows visual rhythm).
- Hover: subtle scale 1.02, transition 400ms.

CONTACT
- Padding 120px 0 60px. Centered.
- "Let's work together" italic serif clamp(48px, 10vw, 120px).
- Email link "hello@ainarahman.com" 20px underlined, hover accent.

FOOTER
- Bottom row: flex space-between align baseline. Left "© 2026 Aina Rahman". Right "Instagram · Twitter · LinkedIn · Are.na". All 13px mono uppercase tracking 0.15em color rgba(26,26,26,.5).
- Hover: color ink.

OVERLAY MENU
- When "Menu" clicked, a full-screen cream overlay fades in with 500ms cubic-bezier(0.22, 1, 0.36, 1).
- Big stacked links: Work, About, Journal, Contact. Each 72px italic serif, hover translateX(20px) + color accent. Stack with 24px gap.
- Close button top-right "Close" replaces "Menu".

MOTION
- Hero name fades in on load with opacity 0 to 1, duration 900ms.
- Bio paragraphs stagger fade-up (opacity 0, translateY 20px → 0). Delay 100ms between each.
- Work rows reveal on scroll with opacity 0, translateX(-20px) → 0.
- All respect prefers-reduced-motion: no transforms.

RESPONSIVE
- Under 768px: bio grid stacks. Work row meta moves below name. Big overlay menu links scale to 40px. Hero padding reduced to 80px top.

FOCUS
- Outline 2px solid accent offset 4px on links and buttons.`
},
{
  id: 'restaurant-elegant',
  title: 'Elegant Restaurant',
  tag: 'Restaurant',
  desc: 'Restaurant website with warm palette, food photography placeholders, menu section, and reservation form.',
  category: ['Restaurant', 'Light', 'Warm'],
  body: `Build one standalone HTML document for an upscale restaurant website. Output only that file.

PAGE
- Language English. Title: Kissa — Contemporary Malaysian Dining.
- Background #f8f4ec (bone). Text #1f1a15 (espresso). Accent #8b2c1f (deep brick red). Warm palette.
- Full page scroll.

TYPE
- Headings: "Cormorant Garamond", Georgia, serif. Weight 300-500.
- Body: "Lora", Georgia, serif. Weight 400.
- Load from Google Fonts.
- Hero title: clamp(60px, 12vw, 160px). Weight 300. Italic. Tracking -0.03em. Line-height 0.95.
- Section heads: clamp(36px, 5vw, 64px). Weight 300. Italic.
- Body: 17px line-height 1.75. Color rgba(31,26,21,.75).

NAV
- Fixed top, height 80px, transparent, backdrop blur 12px, background rgba(248,244,236,.7).
- Container max-width 1300px, padding 0 32px, flex space-between, align center.
- Left: "Kissa" wordmark in italic serif 22px tracking -0.02em.
- Center: menu links "Menu", "Story", "Gallery", "Reservations", "Visit". 14px sans (Inter) weight 500 uppercase tracking 0.12em. Hover: color accent, no underline.
- Right: small "Book a table" pill button 13px weight 600 uppercase tracking 0.1em, border 1px solid rgba(31,26,21,.3), padding 12px 22px, radius 9999px. Hover: background accent, color bone, transition 300ms.

HERO
- Min-height 100vh. Position relative, overflow hidden.
- Background: linear-gradient(180deg, #d9d0c0 0%, #b8a890 50%, #6b5b48 100%) — simulating a warm photographic gradient. Add subtle noise via radial-gradient overlays.
- Centered content. Eyebrow "EST. 2019 · KUALA LUMPUR" 12px uppercase tracking 0.25em margin-bottom 32px opacity 0.7.
- Title "Kissa" 160px italic serif. Then "Contemporary Malaysian dining" 20px italic serif opacity 0.75 margin-top 20px.
- Bottom-anchored: "Scroll ↓" 12px uppercase tracking 0.2em opacity 0.6, absolute bottom 40px centered.

STORY SECTION
- Padding 140px 32px. Max-width 900px margin auto text-align center.
- Eyebrow "OUR STORY" 12px uppercase tracking 0.25em color accent margin-bottom 24px.
- Headline: "A quiet room, a loud kitchen, and a love letter to Malaysian cooking." clamp(36px, 5vw, 56px) italic serif line-height 1.25.
- Body paragraphs: 2 paragraphs 18px line-height 1.8 color rgba(31,26,21,.7) margin-top 40px.

SIGNATURE DISHES
- Section with padding 120px 32px background #1f1a15 color #f8f4ec (inverted).
- Headline "Signature dishes" italic serif 64px centered margin-bottom 80px.
- 3-column grid desktop, 1 mobile. Gap 40px.
- Each dish: aspect-ratio 3/4 image placeholder with gradient (linear-gradient(135deg, #4a3d31, #8b6f4d)) and a centered serif initial (L, N, R). Border-radius 8px. Overlay bottom with dish name and description.
- Dish name: italic serif 26px. Description: 14px line-height 1.6 opacity 0.75.
- Dishes: "Laksa Utara" / "Rice noodles, coconut broth, prawns, torch ginger." — "Nasi Kerabu" / "Blue rice, fresh herbs, budu, and smoked fish." — "Rendang Daging" / "Slow-cooked beef, coconut milk, kerisik, and spices."

MENU SECTION
- Padding 120px 32px. Max-width 720px margin auto.
- Headline "Menu" italic serif 56px centered margin-bottom 80px.
- Menu in 3 sub-sections: "To Begin", "Main", "To End".
- Each sub-section: label 13px uppercase tracking 0.2em color accent margin-bottom 32px, then menu items.
- Menu item: flex space-between align baseline, padding 20px 0 border-bottom 1px solid rgba(31,26,21,.12).
- Left: dish name italic serif 20px + description 14px color rgba(31,26,21,.6) margin-top 6px.
- Right: price 16px weight 500.
- Items:
  - To Begin: "Oyster & Calamansi" RM 24 — "Ulukuti" RM 18 — "Chicken Skin Crackers" RM 16
  - Main: "Laksa Utara" RM 42 — "Rendang Daging" RM 52 — "Ikan Bakar" RM 46 — "Nasi Kerabu" RM 38
  - To End: "Pulut Hitam" RM 16 — "Sago Gula Melaka" RM 14 — "Cendol" RM 18

GALLERY
- Grid of 6 image placeholders in a masonry-ish layout (3 columns desktop, 2 tablet, 1 mobile). Aspect ratios vary: 4/5, 1/1, 3/4, 1/1, 4/5, 1/1.
- Each block has a warm gradient background (vary between: #8b6f4d to #4a3d31, #a89580 to #6b5b48, #c9b89b to #8b7355).
- Radius 6px. Gap 12px. Hover: scale 1.01 transition 400ms.

RESERVATION
- Padding 140px 32px, background #8b2c1f, color #f8f4ec.
- Headline "Reservations" italic serif 64px centered margin-bottom 16px.
- Subhead "We accept reservations up to 30 days in advance." 16px italic opacity 0.8 centered margin-bottom 60px.
- Form: max-width 560px margin auto. Fields stacked with 20px gap.
  - Field label 12px uppercase tracking 0.15em opacity 0.8 margin-bottom 8px.
  - Input: transparent background, border 1px solid rgba(248,244,236,.4), radius 6px, padding 14px 18px, color bone. Focus: border-color bone.
  - Fields: Name, Email, Party size (select 1-8), Date, Time (select 6pm, 7pm, 8pm, 9pm), Notes (textarea).
  - Submit button: full-width bone background, color accent, 15px weight 600 uppercase tracking 0.1em, padding 18px, radius 6px. Hover: background #fff.

VISIT
- Padding 120px 32px. 2-column: address block left, hours right.
- Address: "22 Jalan Ceylon, Bukit Bintang, 50200 Kuala Lumpur, Malaysia". Hours: "Tuesday—Sunday, 6pm—11pm. Closed Mondays."

FOOTER
- Padding 60px 32px 40px, border-top 1px rgba(31,26,21,.15).
- Flex space-between align baseline. Left "Kissa · Kuala Lumpur". Right "Instagram · Email · Reservations". All 13px uppercase tracking 0.15em opacity 0.6.

MOTION
- Hero title fades in with 300ms delay, opacity 0 to 1, duration 1200ms.
- Sections reveal on scroll: opacity 0, translateY 40px → 1, 0. Duration 1000ms cubic-bezier(0.16, 1, 0.3, 1).
- Menu items stagger with 80ms delay.
- prefers-reduced-motion: disable all transforms, only opacity transitions.

RESPONSIVE
- Tablet: hero title 96px. Grids to 2 cols.
- Mobile: nav simplifies to logo + Book button. Hero title 72px. All sections single column. Padding reduced to 80px top.

FOCUS
- Outline 2px solid accent offset 3px on all interactive.`
},
{
  id: 'crypto-dark',
  title: 'Crypto Dashboard Hero',
  tag: 'Crypto',
  desc: 'Dark crypto exchange landing with animated chart, live price ticker, glass morphism cards, and neon accents.',
  category: ['Crypto', 'Dark', 'Fintech'],
  body: `Build one standalone HTML document for a crypto exchange landing page. Output only that file.

PAGE
- Language English. Title: Vault — Trade crypto without the noise.
- Background pure #000000. Text #ffffff. Accent neon green #00ff88. Secondary accent #00d4ff.
- Full page scroll allowed.

TYPE
- Font: "Space Grotesk", ui-sans-serif, system-ui, sans-serif for headings.
- Body: "Inter", ui-sans-serif, system-ui, sans-serif.
- Mono: "JetBrains Mono", ui-monospace, monospace for numbers and prices.
- Load Space Grotesk (400-700), Inter (400-600), JetBrains Mono (400-600) from Google Fonts.
- Headlines weight 600, tracking -0.03em.
- Mono numbers use tabular-nums.

NAV
- Fixed top, height 72px, background rgba(0,0,0,.7), backdrop blur 20px, border-bottom 1px rgba(255,255,255,.08).
- Container max-width 1400px, padding 0 32px, flex space-between align center.
- Logo: 32px square with rounded corners, background #00ff88, contains a simple SVG lightning bolt in black. Wordmark "Vault" 20px Space Grotesk weight 600 tracking -0.02em margin-left 12px.
- Center: nav links "Markets", "Trade", "Earn", "Learn", "Company" 14px Inter weight 500 color rgba(255,255,255,.65). Hover: white.
- Right: "Sign in" 14px + "Get started" pill button 14px weight 600 background #00ff88 color #000 padding 10px 22px radius 9999px. Hover: background #00d977, glow 0 0 30px rgba(0,255,136,.4). Transition 250ms.

LIVE TICKER
- Full-width bar height 44px background #0a0a0a border-top and bottom 1px rgba(255,255,255,.06).
- Horizontal marquee of crypto pairs. Each item: symbol in Space Grotesk 13px weight 600, price in JetBrains Mono 13px color white, change in mono 12px (green if positive, red if negative). Separated by "·" glyph.
- Pairs: BTC $68,420.50 +2.34% — ETH $3,847.20 +1.85% — SOL $198.42 -0.92% — AVAX $42.18 +3.21% — ARB $1.24 +5.67% — OP $3.15 -1.42% — LINK $18.92 +0.88%.
- Marquee animation: 60s linear infinite. Pause on hover.
- Pairs repeat ×2 for seamless loop.

HERO
- Padding 160px 32px 80px. Max-width 1400px margin auto.
- 2-column grid desktop (5fr 4fr), 1 column mobile.
- Left column:
  - Eyebrow pill: "Now live · Spot markets for 200+ pairs" 12px JetBrains Mono uppercase tracking 0.1em, border 1px rgba(0,255,136,.3), color #00ff88, padding 6px 14px, radius 9999px, background rgba(0,255,136,.06). Margin-bottom 32px.
  - Headline: "Trade crypto" / "without the noise." Two lines, clamp(56px, 9vw, 112px), Space Grotesk weight 600 tracking -0.045em line-height 1.0. Second line has gradient text: linear-gradient(90deg, #00ff88 0%, #00d4ff 100%), background-clip text.
  - Subhead: "Vault is a no-frills exchange for people who care about execution, not gimmicks. Low fees, deep liquidity, real-time data." 18px Inter color rgba(255,255,255,.6) line-height 1.6 max-width 520px margin-top 32px.
  - CTA row margin-top 40px: primary button "Start trading" 15px weight 600 background #00ff88 color #000 padding 16px 32px radius 9999px hover glow shadow 0 0 40px rgba(0,255,136,.35). Secondary "View markets →" ghost 15px weight 500 color white border 1px rgba(255,255,255,.2) padding 16px 32px radius 9999px hover border-color white.
  - Trust line below: "✓ No hidden fees ✓ Cold storage ✓ Instant withdrawals" 13px JetBrains Mono color rgba(255,255,255,.4) letter-spacing 0.02em margin-top 24px.
- Right column: floating dashboard card.
  - Card: 100% width, aspect-ratio 1/1.1, background #0a0a0a, border 1px rgba(255,255,255,.08), radius 20px, padding 24px, position relative, overflow hidden, box-shadow 0 40px 80px rgba(0,0,0,.6).
  - Inner glow: absolute radial-gradient at 20% 0%, circle 400px, from rgba(0,255,136,.15) to transparent.
  - Top bar: "BTC / USDT" 16px Space Grotesk weight 600 + "24h" toggle pill right side.
  - Price: "$68,420.50" 44px JetBrains Mono weight 600 tracking -0.02em. Below: "+2.34% ($1,562.40)" 14px JetBrains Mono color #00ff88.
  - Chart: SVG line chart, viewBox 0 0 400 200, stroke #00ff88, stroke-width 2, fill none, filled area below chart with linear-gradient rgba(0,255,136,.15) → transparent. Path draws a volatile upward trend. Add subtle grid lines rgba(255,255,255,.04).
  - Bottom row: "24h Volume $1.2B · Liquidity Score A+" 12px JetBrains Mono color rgba(255,255,255,.4).

FEATURES
- Padding 120px 32px.
- Section head: "Built for traders" 48-64px Space Grotesk weight 600 tracking -0.04em max-width 640px margin-bottom 80px.
- 3-column grid desktop, 1 mobile. Gap 20px.
- Each feature card: background #0a0a0a border 1px rgba(255,255,255,.08) radius 16px padding 32px. Hover: border-color rgba(0,255,136,.3), background #0d0d0d, transition 250ms.
- Icon: 40px square, radius 10px, background rgba(0,255,136,.08), border 1px rgba(0,255,136,.2), centered inline SVG 20px stroke 1.8 color #00ff88.
- Title 20px Space Grotesk weight 600 tracking -0.02em margin-top 24px margin-bottom 12px.
- Description 15px Inter color rgba(255,255,255,.55) line-height 1.6.
- Features: "Sub-100ms execution" / "Matching engine runs on dedicated hardware in 4 regions." — "0.05% maker fees" / "Straightforward pricing. No tier games, no hidden spreads." — "Cold storage by default" / "98% of assets held in air-gapped multisig wallets." — "API-first design" / "Every action available via REST and WebSocket." — "No KYC under $10k" / "Trade immediately. Verify only when you need to." — "24/7 human support" / "Real traders on chat, not bots."

STATS STRIP
- Padding 80px 32px, border-top and border-bottom 1px rgba(255,255,255,.06).
- 4-column grid desktop, 2 tablet, 1 mobile. Gap 40px. Text-align center.
- Each stat: value in 56px JetBrains Mono weight 600 color white letter-spacing -0.02em, label in 12px JetBrains Mono uppercase tracking 0.15em color rgba(255,255,255,.4) margin-top 12px.
- Stats: "$4.2B" / "24H VOLUME" — "820K" / "ACTIVE TRADERS" — "200+" / "LISTED PAIRS" — "0.02s" / "AVG LATENCY".

CTA
- Padding 140px 32px, text-align center.
- Headline "Ready to trade?" clamp(48px, 10vw, 140px) Space Grotesk weight 600 tracking -0.045em.
- Subhead "Start with as little as $10. No minimums, no BS." 18px color rgba(255,255,255,.6) margin-top 24px margin-bottom 40px.
- Button "Create free account" 15px weight 600 background #00ff88 color #000 padding 18px 40px radius 9999px hover glow.

FOOTER
- Padding 60px 32px 40px border-top 1px rgba(255,255,255,.06).
- 4-column grid: brand, product, company, legal.
- Brand column: logo + "Vault" margin-bottom 16px. Tagline "Execution-first crypto exchange. Built in Singapore, since 2021." 13px color rgba(255,255,255,.4) line-height 1.6 max-width 260px.
- Link columns: headings 12px JetBrains Mono uppercase tracking 0.15em color rgba(255,255,255,.3) margin-bottom 20px. Links 14px Inter color rgba(255,255,255,.55) margin-bottom 12px. Hover: color #00ff88.
- Product: Markets, Fees, API, Status. Company: About, Blog, Careers, Press. Legal: Terms, Privacy, Risk Disclosure, Cookies.
- Bottom row: border-top 1px rgba(255,255,255,.06) padding-top 24px margin-top 48px flex space-between align center. Left "© 2026 Vault Exchange Pte. Ltd." Right "Not available in restricted jurisdictions." Both 12px JetBrains Mono color rgba(255,255,255,.35).

MOTION
- Live ticker marquee: 60s linear infinite.
- Price counter in hero: numbers count up from 0 to target value over 2000ms with easing (only once on load).
- Chart line: SVG stroke-dasharray animation — draw from 0 to full length over 1500ms with ease-out.
- Section reveals: opacity 0 → 1, translateY 30px → 0 over 800ms on scroll intersect.
- Button hover glows have smooth 250ms cubic-bezier(0.22, 1, 0.36, 1).

RESPONSIVE
- Tablet 900-1200px: hero grid stacks to 1 column. Chart card full-width aspect-ratio 16/10.
- Mobile under 640px: hide nav links, show hamburger. Hero padding 100px 20px 60px. Headline clamp(40px, 12vw, 64px). Stats grid to 2 cols. All other grids to 1 col.

FOCUS
- Outline 2px solid #00ff88 offset 3px.`
}
];

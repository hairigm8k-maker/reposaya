// ============================================
// SUBDOMAIN VALIDATION
// ============================================

// Exact match — reserved technical/admin terms
const RESERVED_EXACT = new Set([
  // Technical
  'www','admin','administrator','system','root','register','registration',
  'mail','email','pop','pop3','smtp','imap','ftp','sftp','ssh','telnet',
  'http','https','localhost','dns','nameserver','ns1','ns2','ns3','mx',
  'cpanel','whm','plesk','webmail','autodiscover','autoconfig',
  // App routes
  'api','dashboard','login','signin','signup','signout','logout','register',
  'app','apps','admin','administrator','cdn','assets','static','media',
  'files','img','images','css','js','javascript','public','private',
  // Support/official
  'help','support','service','services','official','legal','security',
  'verify','verification','info','contact','about','staff','team','company',
  'corporate','billing','payment','payments','invoice','invoices','account',
  'accounts','status','sys','local','dev','demo','sample','test','testing',
  'beta','stage','staging','develop','development','prod','production'
]);

// Substring match — profanity (Malay + English)
const PROFANITY = [
  // Malay
  'pukimak','puk1mak','celaka','c3laka','babi','b4bi','anjing','4njing','barua',
  'haramjadah','haram_jadah','macai','balaci','mampus','mampos','lancau','lanjiao',
  'cibai','c1bai','kimak','k1mak','pantat','p4ntat','tetek','t3tek','tet3k',
  'butoh','b0doh','bodoh','kontol','k0nt0l','memek','m3m3k','pelir','p3lir',
  'zakar','z4kar','bangsat','sundal','jalang','gampang','bispak','pecun',
  // English
  'fuck','fuk','fck','shit','sh1t','bitch','b1tch','bastard','whore','slut',
  'cunt','asshole','a55hole','nigger','nigga','faggot','dickhead','motherfuck',
  'pussy','dick','cock'
];

// Substring match — sensitive (sex, gambling, violence, royalty, finance)
const SENSITIVE = [
  // Sex / adult
  'porn','porno','hentai','nude','naked','blowjob','sexcam','escort',
  // Gambling
  'casino','kasino','judi','jud1','gambling','togel','t0gel','lottery','loteri',
  'jackpot','poker','betting','sportsbook','magnum4d','damacai','toto',
  // Violence / drugs
  'bunuh','murder','terror','bomb','dadah','ganja','cocaine','heroin','meth',
  // Royalty / institution
  'agong','sultan','sultana','diraja','kerajaan','mahkota','istana',
  // Finance impersonation
  'insurans','insurance','takaful','finance','forex','pinjaman',
  'maybank','cimb','hongleong','ambank','bankislam','bimb','bsn','affin',
  // National/critical
  'police','polis','tentera','army','military','gov','government','kerajaan',
  // Brand impersonation
  'google','facebook','instagram','tiktok','youtube','whatsapp','telegram',
  'netflix','amazon','apple','microsoft','cloudflare','shopee','lazada','grab',
  'hairihosting','hairiamri','hairi-host','hairi_host'
];

// Exact match — short words that need whole-word check (avoid false positives)
const SHORT_PROHIBITED = new Set([
  'sex','xxx','nude','porn','judi','togel','bet','slot','slots','king','queen',
  'royal','prince','princess','raja','bank','cina','keling','kafir','nazi',
  'kkk','isis','4d','toto','magnum','damacai'
]);

export function checkSubdomain(sub) {
  const s = String(sub || '').toLowerCase().trim();

  if (!s) return { ok: false, reason: 'Subdomain required' };
  if (s.length < 3) return { ok: false, reason: 'Minimum 3 characters' };
  if (s.length > 30) return { ok: false, reason: 'Maximum 30 characters' };
  if (!/^[a-z0-9-]+$/.test(s)) return { ok: false, reason: 'Only a-z, 0-9 and dash allowed' };
  if (s.startsWith('-')) return { ok: false, reason: 'Cannot start with dash' };
  if (s.endsWith('-')) return { ok: false, reason: 'Cannot end with dash' };
  if (s.includes('--')) return { ok: false, reason: 'No consecutive dashes' };

  // Exact match — full subdomain
  if (RESERVED_EXACT.has(s)) return { ok: false, reason: 'Reserved word' };
  if (SHORT_PROHIBITED.has(s)) return { ok: false, reason: 'Prohibited word' };

  // Check each dash-separated part
  const parts = s.split('-').filter(Boolean);
  for (const p of parts) {
    if (RESERVED_EXACT.has(p)) return { ok: false, reason: 'Contains reserved word: ' + p };
    if (SHORT_PROHIBITED.has(p)) return { ok: false, reason: 'Contains prohibited word' };
    if (PROFANITY.includes(p)) return { ok: false, reason: 'Contains prohibited word' };
  }

  // Compact form (remove dashes) — catch embedded profanity like "xxpukixx"
  const compact = parts.join('');
  for (const w of PROFANITY) if (compact.includes(w)) return { ok: false, reason: 'Contains prohibited word' };
  for (const w of SENSITIVE) if (compact.includes(w)) return { ok: false, reason: 'Contains prohibited word' };

  return { ok: true };
}

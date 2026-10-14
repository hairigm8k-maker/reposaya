// ============================================
// BLOCKLIST — subdomain & username validation
// ============================================

// Exact match reserved (cannot be used as-is)
export const RESERVED = [
  // Admin / technical
  'www','www2','www3','admin','administrator','sysadmin','root','system','systemadmin',
  'register','registration','signup','signin','login','logout','account','accounts',
  'mail','email','webmail','smtp','pop','pop3','imap','ftp','sftp','ssh','telnet',
  'test','testing','beta','alpha','stage','staging','dev','develop','development',
  'http','https','httpd','apache','nginx','localhost','local','internal','intranet',
  'dns','ns','ns1','ns2','ns3','mx','mx1','mx2','a','aaaa','cname','txt',
  'app','apps','application','api','apis','rest','graphql','webhook','webhooks',
  'static','assets','cdn','img','images','media','files','file','upload','uploads',
  'dashboard','panel','cpanel','control','manage','management','backend','frontend',
  'database','db','sql','mysql','postgres','sqlite','mongodb','redis','cache',
  'cloud','cloudflare','aws','azure','gcp','firebase','vercel','netlify',
  'router','gateway','proxy','server','node','nginx','load','balancer',
  'web','site','sites','home','index','main','default','public','private',
  
  // Support / official
  'help','support','service','services','official','legal','security','secure',
  'verify','verification','billing','payment','pay','invoice','receipt',
  'contact','info','feedback','care','customercare','customer','enquiry','inquiry','complaint',
  'terms','privacy','policy','tos','eula','about','faq','docs','documentation',
  'news','blog','press','media','marketing','sales','partners','partnership',
  
  // Reserved for our brand
  'hairi','hairiamri','hairihosting','hairihost','hairi-host','reposaya',
  'hairi5','hairi123','hairiadmin'
];

// Substring match (any occurrence blocks)
export const RESERVED_SUBSTRINGS = [
  'hairiamri','hairihosting','hairihost'
];

// Exact match only — sensitive / institutional (.my context)
export const SENSITIVE = [
  // Royal / institutional
  'king','queen','agong','sultan','sultana','raja','royal','prince','princess',
  'president','presiden','minister','menteri','gov','government','kerajaan',
  'parliament','parlimen','politic','politik','politician','politician',
  'tun','tan sri','tan-sri','datuk','dato','dato-sri',
  
  // Financial / institutional
  'bank','banking','maybank','cimb','rhb','publicbank','hongleong','ambank','bankislam',
  'bsn','affin','alliance','hlb','uob','ocbc','hsbc','standard-chartered','citibank',
  'insuran','insurance','takaful','finance','financial','forex','investment','invest',
  'crypto','bitcoin','ethereum','binance','coinbase','money','loan','credit',
  'gambling','casino','bet','betting','lottery','jackpot','toto','4d','magnum',
  
  // Government (specific)
  'lhdn','jpj','pdrm','polis','police','tentera','army','navy','airforce',
  'kkm','moh','moe','kpm','jpa','mdec','mimos','mosti','motac','kbs'
];

// Profanity — substring match (blocks any subdomain containing these)
// Careful: only strong words to avoid false positives
export const PROFANITY = [
  // Malay — strong
  'pukimak','puki','pukima','kimak','k1mak','pantat','pant4t',
  'kontol','k0ntol','kote','koteq','peler','pela','pelir',
  'lancau','l4ncau','lancap','l4ncap','bangsat','bang5at',
  'babi','b4bi','bab1','anjing','4njing','anjeng','anjir',
  'barua','baru4','haramjadah','haramj4dah','haram-jadah',
  'mampos','m4mpos','mampus','m4mpus','modar','m0dar',
  'celaka','cel4ka','celako','cilaka','sial','si4l','siol',
  'bodoh','b0doh','bodo','bangang','b4ngang','bengap','b3ngap',
  'goblok','g0blok','goblog','tolol','t0lol','dungu','d0ngu',
  'kimak','kim4k','tetek','t3tek','titties','butoh','butuh',
  'sundal','sund4l','jalang','j4lang','pelacur','pel4cur',
  'lacur','l4cur','pondan','p0ndan','bapok','b4pok',
  
  // English — strong
  'fuck','fuk','fck','phuck','f*ck','fukka','fucc',
  'shit','sh1t','shyt','bullshit','bollock',
  'bitch','b1tch','bitc','biatch',
  'dick','d1ck','dik','cock','c0ck','cok',
  'pussy','puss','pussi','cunt','c0nt','kunt',
  'ass','arse','a55','a-hole','ahole',
  'bastard','b4stard','whore','wh0re','slut','sl0t','hoe',
  'porn','p0rn','porno','pornography','xxx','xxxx',
  'nigger','n1gger','nigga','n1gga','faggot','f4ggot','fag',
  'retard','r3tard','retarded',
  'rape','rap3','rapist','pedo','ped0','pedophile',
  'hitler','nazi','n4zi',
  
  // Racial slurs (Malaysia context)
  'keling','k3ling','kafir','k4fir',
  'cina-babi','melayu-bodoh','india-bodoh','babi-cina',
  
  // Scam / drug / crime
  'scam','sc4m','scammer','fraud','fr4ud','penipu','p3nipu',
  'drug','dr0g','dadah','d4dah','ganja','g4nja','meth','syabu',
  'heroin','cocaine','coke','weed','marijuana',
  'weapon','w3apon','gun','g4n','bomb','b0mb','terrorist','ter0rist',
  'jihad','j1had','isis','is1s','alqaeda','al-qaeda'
];

// Brand / scam — block if EXACT match or clear impersonation
export const BRANDS_EXACT = [
  'paypal','visa','mastercard','amex','americanexpress','discover',
  'apple','applepay','google','googlepay','microsoft','amazon','aws-amazon',
  'facebook','fb','meta','instagram','ig','whatsapp','wa','telegram','tg',
  'twitter','x-corp','tiktok','youtube','yt','snapchat','linkedin',
  'netflix','spotify','disney','hbo','hulu',
  'shopee','lazada','tokopedia','zalora','lazada',
  'grab','grabpay','foodpanda','deliveroo','panda','tngo','touchngo','tng','boost','shopeepay',
  'netflix','hbo','viu','iflix','astro'
];


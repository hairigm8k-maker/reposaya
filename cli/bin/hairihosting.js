#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const VERSION = '1.0.0';
const API_BASE = 'https://hairiamri.buzz';
const CONFIG_DIR = path.join(os.homedir(), '.hairihosting');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// ===== ANSI COLORS =====
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  copper: '\x1b[38;5;173m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m'
};

function color(str, col) { return c[col] + str + c.reset; }
function bold(str) { return c.bold + str + c.reset; }
function dim(str) { return c.dim + str + c.reset; }
function log(msg) { console.log(msg); }
function logError(msg) { console.error(color('✗ ' + msg, 'red')); }
function logSuccess(msg) { console.log(color('✓ ' + msg, 'green')); }
function logInfo(msg) { console.log(color('ℹ ' + msg, 'cyan')); }
function logWarn(msg) { console.warn(color('⚠ ' + msg, 'yellow')); }

// ===== SPINNER =====
const SPINNER_FRAMES = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];

function createSpinner(text) {
  var frames = SPINNER_FRAMES;
  var idx = 0;
  var timer = null;
  var startTime = Date.now();
  var isTTY = process.stdout.isTTY;

  function render() {
    var frame = color(frames[idx % frames.length], 'copper');
    var elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    process.stdout.write('\r\x1b[K  ' + frame + ' ' + text + color(' (' + elapsed + 's)', 'gray'));
    idx++;
  }

  return {
    start: function() {
      if (!isTTY) {
        process.stdout.write('  ' + text + '...\n');
        return this;
      }
      render();
      timer = setInterval(render, 80);
      return this;
    },
    update: function(newText) {
      text = newText;
      return this;
    },
    succeed: function(msg) {
      if (timer) clearInterval(timer);
      var elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      if (isTTY) process.stdout.write('\r\x1b[K');
      console.log('  ' + color('✓', 'green') + ' ' + (msg || text) + color(' (' + elapsed + 's)', 'gray'));
    },
    fail: function(msg) {
      if (timer) clearInterval(timer);
      if (isTTY) process.stdout.write('\r\x1b[K');
      console.error('  ' + color('✗', 'red') + ' ' + (msg || text));
    },
    info: function(msg) {
      if (timer) clearInterval(timer);
      if (isTTY) process.stdout.write('\r\x1b[K');
      console.log('  ' + color('ℹ', 'cyan') + ' ' + msg);
    }
  };
}

// Multi-step spinner untuk progress tracking
function createSteps(total) {
  var current = 0;
  var lines = [];
  return {
    step: function(text) {
      current++;
      lines.push(text);
      var prefix = color('[' + current + '/' + total + ']', 'gray');
      console.log('  ' + prefix + ' ' + text);
    },
    done: function(text) {
      console.log('  ' + color('✓', 'green') + ' ' + text);
    }
  };
}

// ===== CONFIG =====
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (e) {}
  return {};
}

function saveConfig(cfg) {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2));
  try { fs.chmodSync(CONFIG_FILE, 0o600); } catch (e) {}
}

function getApiKey() {
  var key = process.env.HAIRIHOSTING_API_KEY;
  if (key) return key;
  var cfg = loadConfig();
  return cfg.api_key || null;
}

// ===== ARGS =====
function parseArgs(argv) {
  var args = { _: [], flags: {} };
  for (var i = 0; i < argv.length; i++) {
    var a = argv[i];
    if (a.startsWith('--')) {
      var key = a.slice(2);
      var val = argv[i + 1];
      if (val && !val.startsWith('-')) { args.flags[key] = val; i++; }
      else args.flags[key] = true;
    } else {
      args._.push(a);
    }
  }
  return args;
}

// ===== HTTP =====
async function apiRequest(method, endpoint, body) {
  var key = getApiKey();
  if (!key) { logError('Not logged in. Run: hairihosting login'); process.exit(1); }
  var opts = {
    method: method,
    headers: {
      'Authorization': 'Bearer ' + key,
      'User-Agent': 'hairihosting-cli/' + VERSION
    }
  };
  if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  var res = await fetch(API_BASE + endpoint, opts);
  var data;
  try { data = await res.json(); }
  catch (e) { data = { ok: false, error: 'Invalid response (HTTP ' + res.status + ')' }; }
  return { status: res.status, data: data };
}

// ===== MIME =====
var MIME = {
  '.html': 'text/html', '.htm': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript', '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf'
};

function getMime(ext) { return MIME[ext] || 'application/octet-stream'; }

// ===== SCAN FOLDER =====
function scanFolder(dir) {
  var files = [];
  var images = [];
  var skipped = [];

  function walk(currentDir, relativePath) {
    var entries = fs.readdirSync(currentDir);
    entries.forEach(function(name) {
      if (name.startsWith('.')) return;
      if (name === 'node_modules') return;
      var fullPath = path.join(currentDir, name);
      var relPath = relativePath ? relativePath + '/' + name : name;
      var stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath, relPath);
      } else {
        var ext = path.extname(name).toLowerCase();
        if (ext === '.html' || ext === '.htm') files.push({ type: 'html', path: fullPath, rel: relPath, size: stat.size });
        else if (ext === '.css') files.push({ type: 'css', path: fullPath, rel: relPath, size: stat.size });
        else if (ext === '.js' || ext === '.mjs') files.push({ type: 'js', path: fullPath, rel: relPath, size: stat.size });
        else if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'].indexOf(ext) >= 0) images.push({ path: fullPath, rel: relPath, size: stat.size, mime: getMime(ext) });
        else skipped.push(rel);
      }
    });
  }

  walk(dir, '');
  return { files: files, images: images, skipped: skipped };
}

// ===== LOGIN =====
async function cmdLogin(args) {
  var apiKey = args._[0] || args.flags.key;
  if (!apiKey) {
    log('');
    log(bold('  HairiHosting CLI — Login'));
    log('');
    log('  Get your API key from the dashboard:');
    log('  ' + color('https://hairiamri.buzz/dashboard/#/api-keys', 'copper'));
    log('');
    log('  Then run: ' + color('hairihosting login hh_live_xxxxx', 'cyan'));
    log('');
    process.exit(1);
  }
  if (!apiKey.startsWith('hh_live_')) {
    logError('Invalid API key format. Must start with hh_live_');
    process.exit(1);
  }
  var spinner = createSpinner('Verifying API key').start();
  try {
    var res = await fetch(API_BASE + '/api/cli/whoami', {
      headers: { 'Authorization': 'Bearer ' + apiKey }
    });
    var data = await res.json();
    if (!data.ok) { spinner.fail('Invalid API key: ' + (data.error || 'Unauthorized')); process.exit(1); }
    spinner.succeed('Logged in as ' + data.user.email);
    var cfg = loadConfig();
    cfg.api_key = apiKey;
    cfg.user_email = data.user.email;
    cfg.user_name = data.user.name;
    saveConfig(cfg);
    log('');
  } catch (e) {
    spinner.fail('Connection error: ' + e.message);
    process.exit(1);
  }
}

// ===== DEPLOY =====
async function cmdDeploy(args) {
  var targetDir = args.flags.dir || '.';
  var subdomain = args._[0];
  var mode = args.flags.overwrite ? 'overwrite' : (args.flags.merge ? 'merge' : 'prompt');
  var shouldPublish = args.flags.publish !== false;

  if (!fs.existsSync(targetDir)) { logError('Folder not found: ' + targetDir); process.exit(1); }

  log('');
  log(bold('  HairiHosting CLI') + ' ' + dim('v' + VERSION));
  log('');

  var absDir = path.resolve(targetDir);
  var scanSpinner = createSpinner('Scanning folder').start();
  var scan = scanFolder(absDir);
  scanSpinner.succeed('Found ' + scan.files.length + ' code files + ' + scan.images.length + ' images');

  if (!scan.files.length) { logError('No HTML/CSS/JS files found in folder'); process.exit(1); }

  // Read & concatenate
  var htmlFiles = scan.files.filter(function(f){ return f.type === 'html'; });
  var cssFiles = scan.files.filter(function(f){ return f.type === 'css'; });
  var jsFiles = scan.files.filter(function(f){ return f.type === 'js'; });

  // Prefer index.html
  var mainHtml = htmlFiles.find(function(f){ return f.rel === 'index.html'; }) || htmlFiles[0];
  if (!mainHtml) { logError('No HTML file found'); process.exit(1); }

  var html = fs.readFileSync(mainHtml.path, 'utf8');

  // Auto-inject CSS files (if not already linked)
  var css = '';
  cssFiles.forEach(function(f) {
    var content = fs.readFileSync(f.path, 'utf8');
    css += '/* ' + f.rel + ' */\n' + content + '\n\n';
    if (f.rel !== 'style.css' && f.rel !== 'styles.css' && html.indexOf(f.rel) < 0) {
      html = html.replace('</head>', '  <style>\n' + content + '\n  </style>\n</head>');
    }
  });

  // Auto-inject JS files
  var js = '';
  jsFiles.forEach(function(f) {
    var content = fs.readFileSync(f.path, 'utf8');
    js += '/* ' + f.rel + ' */\n' + content + '\n\n';
  });

  log('');
  logInfo('Found: ' + color(htmlFiles.length + ' HTML', 'cyan') + ', ' + color(cssFiles.length + ' CSS', 'cyan') + ', ' + color(jsFiles.length + ' JS', 'cyan') + ', ' + color(scan.images.length + ' images', 'magenta'));
  if (scan.skipped.length) logInfo('Skipped: ' + scan.skipped.length + ' files');

  // Subdomain prompt
  if (!subdomain) {
    var readline = require('readline');
    var rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    subdomain = await new Promise(function(resolve) {
      rl.question(color('  Subdomain: ', 'cyan'), function(ans) { rl.close(); resolve((ans || '').trim().toLowerCase()); });
    });
    if (!subdomain) { logError('Subdomain required'); process.exit(1); }
  }
  subdomain = subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
  logInfo('Deploying to: ' + color(subdomain + '.hairiamri.buzz', 'copper'));
  log('');

  // Prepare image base64
  var imageData = [];
  var totalBytes = 0;
  scan.images.forEach(function(img) {
    if (img.size > 1.5 * 1024 * 1024) {
      logWarn('Skip (too large): ' + img.rel + ' (' + (img.size/1024).toFixed(0) + ' KB)');
      return;
    }
    var buf = fs.readFileSync(img.path);
    imageData.push({ name: path.basename(img.rel), data: buf.toString('base64'), mime: img.mime });
    totalBytes += img.size;
  });

  var payload = {
    subdomain: subdomain,
    name: subdomain,
    html: html,
    css: css,
    js: js,
    files: imageData,
    mode: mode,
    publish: shouldPublish
  };

  var uploadSpinner = createSpinner('Uploading to ' + subdomain + '.hairiamri.buzz').start();
  var res = await apiRequest('POST', '/api/cli/deploy', payload);
  uploadSpinner.info(res.status === 409 ? 'Site exists — waiting for input' : (res.data.ok ? 'Upload complete' : 'Upload failed'));

  // Handle exists prompt
  if (res.status === 409 && res.data.needs_confirmation) {
    logWarn('Site already exists: ' + color(subdomain + '.hairiamri.buzz', 'copper'));
    var readline2 = require('readline');
    var rl2 = readline2.createInterface({ input: process.stdin, output: process.stdout });
    var ans = await new Promise(function(resolve) {
      rl2.question('  Overwrite (o) / Merge (m) / Cancel (c)? [o/m/c]: ', function(a) { rl2.close(); resolve((a||'').trim().toLowerCase()); });
    });
    if (ans === 'c' || ans === '') { log('  Cancelled.'); process.exit(0); }
    payload.mode = ans === 'm' ? 'merge' : 'overwrite';
    var upSpinner2 = createSpinner('Uploading (' + payload.mode + ')').start();
    res = await apiRequest('POST', '/api/cli/deploy', payload);
    if (res.data.ok) upSpinner2.succeed('Upload complete');
    else upSpinner2.fail(res.data.error || 'Failed');
  }

  if (!res.data.ok) { logError(res.data.error || 'Deploy failed'); process.exit(1); }

  // Success box
  var url = res.data.url;
  var status = res.data.site.status === 'live' ? color('● LIVE', 'green') : color('○ DRAFT', 'yellow');
  var filesUp = res.data.files_uploaded;
  var filesSkip = res.data.files_skipped || 0;

  var boxWidth = Math.max(url.length + 12, 50);
  var top = '  ' + color('┌' + '─'.repeat(boxWidth - 2) + '┐', 'gray');
  var bot = '  ' + color('└' + '─'.repeat(boxWidth - 2) + '┘', 'gray');
  function boxLine(content) {
    var plain = content.replace(/\x1b\[[0-9;]*m/g, '');
    var padding = boxWidth - 4 - plain.length;
    if (padding < 0) padding = 0;
    return '  ' + color('│', 'gray') + ' ' + content + ' '.repeat(padding) + ' ' + color('│', 'gray');
  }

  log('');
  log(top);
  log(boxLine(color('✓ Deployed successfully', 'green')));
  log(boxLine(''));
  log(boxLine(bold('URL') + '     ' + color(url, 'copper')));
  log(boxLine(bold('Status') + '  ' + status));
  log(boxLine(bold('Files') + '   ' + filesUp + ' uploaded' + (filesSkip ? ', ' + filesSkip + ' skipped' : '')));
  log(bot);
  log('');
}

// ===== LIST =====
async function cmdList() {
  var res = await apiRequest('GET', '/api/cli/list');
  if (!res.data.ok) { logError(res.data.error || 'Failed'); process.exit(1); }
  var sites = res.data.sites || [];
  if (!sites.length) { log(''); logInfo('No sites yet. Deploy one: hairihosting deploy <subdomain>'); log(''); return; }
  log('');
  log(bold('  Your sites') + color(' (' + sites.length + ')', 'gray'));
  log('');

  // Table
  var nameW = Math.max.apply(null, sites.map(function(s){ return s.subdomain.length; }));
  if (nameW < 10) nameW = 10;

  sites.forEach(function(s) {
    var status = s.status === 'live' ? color('● LIVE', 'green') : color('○ DRAFT', 'yellow');
    var sub = s.subdomain.padEnd(nameW, ' ');
    var url = color(sub + '.hairiamri.buzz', 'copper');
    log('  ' + url + '   ' + status);
  });
  log('');
}

// ===== DELETE =====
async function cmdDelete(args) {
  var subdomain = args._[1];
  if (!subdomain) { logError('Usage: hairihosting delete <subdomain>'); process.exit(1); }
  var readline = require('readline');
  var rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  var confirm = await new Promise(function(resolve) {
    rl.question(color('  Delete ' + subdomain + '.hairiamri.buzz? (y/N): ', 'yellow'), function(a){ rl.close(); resolve((a||'').trim().toLowerCase()); });
  });
  if (confirm !== 'y' && confirm !== 'yes') { log('  Cancelled.'); return; }
  var res = await apiRequest('DELETE', '/api/cli/delete?subdomain=' + encodeURIComponent(subdomain));
  if (res.data.ok) logSuccess('Deleted: ' + subdomain);
  else logError(res.data.error || 'Failed');
}

// ===== WHOAMI =====
async function cmdWhoami() {
  var res = await apiRequest('GET', '/api/cli/whoami');
  if (!res.data.ok) { logError(res.data.error || 'Not logged in'); process.exit(1); }
  log('');
  log('  ' + bold('Email:') + ' ' + res.data.user.email);
  log('  ' + bold('Name:') + '  ' + (res.data.user.name || '-'));
  log('  ' + bold('Role:') + '  ' + res.data.user.role);
  log('');
}

// ===== LOGOUT =====
function cmdLogout() {
  var cfg = loadConfig();
  delete cfg.api_key;
  delete cfg.user_email;
  delete cfg.user_name;
  saveConfig(cfg);
  logSuccess('Logged out');
}

// ===== HELP =====
function showHelp() {
  log('');
  log('  ' + bold('HairiHosting CLI') + ' ' + dim('v' + VERSION));
  log('  ' + dim('Deploy static sites from your terminal'));
  log('');
  log('  ' + bold('Usage:'));
  log('    hairihosting <command> [options]');
  log('');
  log('  ' + bold('Commands:'));
  log('    ' + color('login', 'cyan') + ' <api-key>     Save your API key');
  log('    ' + color('logout', 'cyan') + '              Remove saved key');
  log('    ' + color('whoami', 'cyan') + '              Show current account');
  log('    ' + color('deploy', 'cyan') + ' [subdomain]  Deploy current folder');
  log('    ' + color('list', 'cyan') + '                List your sites');
  log('    ' + color('delete', 'cyan') + ' <subdomain>  Delete a site');
  log('    ' + color('help', 'cyan') + '                Show this help');
  log('');
  log('  ' + bold('Deploy options:'));
  log('    --dir <path>       Folder to deploy (default: .)');
  log('    --overwrite        Replace existing site fully');
  log('    --merge            Only update provided files');
  log('    --no-publish       Upload but keep as draft');
  log('');
  log('  ' + bold('Examples:'));
  log('    ' + dim('$') + ' hairihosting login hh_live_abc123...');
  log('    ' + dim('$') + ' hairihosting deploy myportfolio');
  log('    ' + dim('$') + ' hairihosting deploy --dir ./dist');
  log('    ' + dim('$') + ' hairihosting list');
  log('');
}

// ===== MAIN =====
async function main() {
  var argv = process.argv.slice(2);
  var cmd = argv[0];
  var args = parseArgs(argv.slice(1));

  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') return showHelp();
  if (cmd === '--version' || cmd === '-v') { log(VERSION); return; }

  try {
    if (cmd === 'login') return await cmdLogin(args);
    if (cmd === 'logout') return cmdLogout();
    if (cmd === 'whoami') return await cmdWhoami();
    if (cmd === 'deploy') return await cmdDeploy(args);
    if (cmd === 'list') return await cmdList();
    if (cmd === 'delete') return await cmdDelete(args);
    logError('Unknown command: ' + cmd);
    log('  Run ' + color('hairihosting help', 'cyan') + ' for usage');
    process.exit(1);
  } catch (e) {
    logError(e.message);
    process.exit(1);
  }
}

main();

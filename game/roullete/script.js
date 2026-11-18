// =========================================================
// ROULETTE KASINO 3D (RM) - HAIRIAHOSTING GAME SCRIPT
// =========================================================

let bankValue = 100;
let currentBet = 0;
let wager = 5;
let bet = [];
let numbersBet = [];

let currentPlayer = null;
let isSpinning = false;
let betMode = 'add'; // 'add' or 'remove' (for mobile touch toggle)

// Red numbers in European Roulette
const numRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
// Authentic European wheel sequence (0, 32, 15, 19 ... 26)
const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];
const chipValues = [1, 5, 10, 50, 100];

// Format numbers to Malaysian Ringgit (RM)
function formatRM(val) {
  return 'RM ' + Number(val || 0).toLocaleString('en-GB');
}

// Sync HUD and Dashboard displays
function updateBalances() {
  const bSpan = document.getElementById('bankSpan');
  const betSpan = document.getElementById('betSpan');
  const hudBal = document.getElementById('hudPlayerBalance');
  const spinBtn = document.getElementById('masterSpinBtn');
  const spinTxt = document.getElementById('masterSpinText');

  if (bSpan) bSpan.innerText = formatRM(bankValue);
  if (betSpan) betSpan.innerText = formatRM(currentBet);
  if (hudBal) hudBal.innerText = formatRM(bankValue);

  if (spinBtn && spinTxt && !isSpinning) {
    if (currentBet > 0) {
      spinBtn.classList.remove('disabled');
      spinBtn.classList.add('ready-to-spin');
      spinTxt.innerText = `PUSING (TARUHAN: ${formatRM(currentBet)})`;
    } else {
      spinBtn.classList.add('disabled');
      spinBtn.classList.remove('ready-to-spin');
      spinTxt.innerText = 'PASANG TARUHAN DAHULU';
    }
  }
}

// ---------------------------------------------------------
// INITIALIZATION
// ---------------------------------------------------------
function initGame() {
  init3DRouletteWheel();
  buildBettingBoard();
  buildChipDeck();
  updateBalances();
}

// =========================================================
// 3D ROULETTE ENGINE (THREE.JS REALISTIC WEBGL)
// =========================================================
let scene, camera, renderer;
let rotorGroup, bowlGroup, ballMesh, ballShadowMesh;
let is3DReady = false;
let animId = null;

let rotorVelocity = 0.005; // Gentle idle spin
let isBallSpinning = false;
let spinStartTime = 0;
let spinDuration = 9.5; // Seconds
let targetPocketNumber = 0;
let targetPocketAngle = 0;
let ballAngle = 0;
let ballRadius = 3.55;
let ballY = 0.52;
let ballVelocity = 0;
let onSpinCompleteCallback = null;

// High-resolution procedural texture for roulette wheel disc (2048x2048)
function generateRotorCanvasTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  const cx = 1024, cy = 1024;
  const step = (2 * Math.PI) / 37;

  // 1. Mahogany background ring
  ctx.beginPath();
  ctx.arc(cx, cy, 1024, 0, Math.PI * 2);
  ctx.fillStyle = '#220e06';
  ctx.fill();

  // 2. Brass outer border
  ctx.beginPath();
  ctx.arc(cx, cy, 990, 0, Math.PI * 2);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 14;
  ctx.stroke();

  // 3. Pockets ring: from radius 970 down to 680
  const rOuter = 970;
  const rInner = 680;

  for (let i = 0; i < 37; i++) {
    const num = WHEEL_NUMBERS[i];
    const startAngle = i * step - Math.PI / 2 - step / 2;
    const endAngle = startAngle + step;
    const midAngle = (startAngle + endAngle) / 2;

    // Pocket color
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, startAngle, endAngle);
    ctx.arc(cx, cy, rInner, endAngle, startAngle, true);
    ctx.closePath();

    if (num === 0) {
      ctx.fillStyle = '#059669'; // Emerald green
    } else if (numRed.includes(num)) {
      ctx.fillStyle = '#dc2626'; // Luxury crimson red
    } else {
      ctx.fillStyle = '#18181b'; // Obsidian black
    }
    ctx.fill();

    // Chrome metal fret separator
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(startAngle) * rInner, cy + Math.sin(startAngle) * rInner);
    ctx.lineTo(cx + Math.cos(startAngle) * rOuter, cy + Math.sin(startAngle) * rOuter);
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Number text
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(midAngle + Math.PI / 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 58px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 8;
    ctx.fillText(num.toString(), 0, -(rInner + (rOuter - rInner) * 0.52));
    ctx.restore();
  }

  // 4. Inner brass separator ring
  ctx.beginPath();
  ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 12;
  ctx.stroke();

  // 5. Ball pocket rest basin (dark slate metal)
  ctx.beginPath();
  ctx.arc(cx, cy, rInner - 6, 0, Math.PI * 2);
  ctx.arc(cx, cy, 460, 0, Math.PI * 2, true);
  ctx.fillStyle = '#0f172a';
  ctx.fill();

  // Grooves between pockets
  for (let i = 0; i < 37; i++) {
    const startAngle = i * step - Math.PI / 2 - step / 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(startAngle) * 460, cy + Math.sin(startAngle) * 460);
    ctx.lineTo(cx + Math.cos(startAngle) * (rInner - 6), cy + Math.sin(startAngle) * (rInner - 6));
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // 6. Center brass cone radial gradient
  const grad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 460);
  grad.addColorStop(0, '#fef08a');
  grad.addColorStop(0.3, '#eab308');
  grad.addColorStop(0.8, '#854d0e');
  grad.addColorStop(1, '#3b1c06');
  ctx.beginPath();
  ctx.arc(cx, cy, 460, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  return canvas;
}

function init3DRouletteWheel() {
  const container = document.getElementById('wheelContainer');
  if (!container) return;
  container.innerHTML = '';

  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded, loading dynamically...');
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => init3DRouletteWheel();
    document.head.appendChild(script);
    return;
  }

  const width = container.clientWidth || 340;
  const height = container.clientHeight || 340;

  // Scene
  scene = new THREE.Scene();

  // Camera: Angled 3D casino eye view
  camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
  camera.position.set(0, 9.2, 7.8);
  camera.lookAt(0, -0.35, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xfffaed, 0.75);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 0.85);
  mainLight.position.set(6, 14, 8);
  mainLight.castShadow = true;
  scene.add(mainLight);

  const goldGlowLight = new THREE.PointLight(0xffd700, 0.6, 12);
  goldGlowLight.position.set(0, 4, 0);
  scene.add(goldGlowLight);

  // 1. Stationary Outer Bowl Assembly
  bowlGroup = new THREE.Group();

  // Outer polished mahogany wood rim
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x3b1609,
    roughness: 0.35,
    metalness: 0.15
  });
  const woodRim = new THREE.Mesh(new THREE.TorusGeometry(3.95, 0.32, 24, 64), woodMat);
  woodRim.rotation.x = Math.PI / 2;
  woodRim.position.y = 0.55;
  bowlGroup.add(woodRim);

  // Gold bezel rim
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.85,
    roughness: 0.2
  });
  const goldBezel = new THREE.Mesh(new THREE.TorusGeometry(3.68, 0.08, 16, 64), goldMat);
  goldBezel.rotation.x = Math.PI / 2;
  goldBezel.position.y = 0.60;
  bowlGroup.add(goldBezel);

  // Ball runway slope (interior wall)
  const runwayMat = new THREE.MeshStandardMaterial({
    color: 0x0a140f,
    roughness: 0.3,
    metalness: 0.2
  });
  const runwayMesh = new THREE.Mesh(new THREE.CylinderGeometry(3.65, 3.12, 0.5, 64, 1, true), runwayMat);
  runwayMesh.position.y = 0.35;
  bowlGroup.add(runwayMesh);

  // 8 Diamond Deflectors (brass studs around the slope)
  const deflectorGeo = new THREE.OctahedronGeometry(0.11);
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const deflector = new THREE.Mesh(deflectorGeo, goldMat);
    deflector.position.set(3.38 * Math.cos(angle), 0.34, 3.38 * Math.sin(angle));
    deflector.rotation.y = angle;
    deflector.scale.set(0.7, 1.4, 0.7);
    bowlGroup.add(deflector);
  }

  scene.add(bowlGroup);

  // 2. Rotating Rotor Assembly
  rotorGroup = new THREE.Group();

  // Rotor Cylinder Disc
  const rotorCanvas = generateRotorCanvasTexture();
  const rotorTexture = new THREE.CanvasTexture(rotorCanvas);
  rotorTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const rotorTopMat = new THREE.MeshStandardMaterial({
    map: rotorTexture,
    roughness: 0.4,
    metalness: 0.2
  });
  const rotorSideMat = new THREE.MeshStandardMaterial({
    color: 0xb8860b,
    metalness: 0.8,
    roughness: 0.25
  });

  const rotorMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(3.08, 3.08, 0.35, 64),
    [rotorSideMat, rotorTopMat, rotorSideMat]
  );
  rotorMesh.position.y = 0.05;
  rotorGroup.add(rotorMesh);

  // 3D Brass Center Turret
  const turretBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.72, 0.65, 32),
    goldMat
  );
  turretBase.position.y = 0.42;
  rotorGroup.add(turretBase);

  const turretFinial = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 24, 24),
    goldMat
  );
  turretFinial.position.y = 0.82;
  rotorGroup.add(turretFinial);

  // 4 Cross Handles
  const handleBar1 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.5, 16), goldMat);
  handleBar1.rotation.z = Math.PI / 2;
  handleBar1.position.y = 0.72;
  rotorGroup.add(handleBar1);

  const handleBar2 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.5, 16), goldMat);
  handleBar2.rotation.x = Math.PI / 2;
  handleBar2.position.y = 0.72;
  rotorGroup.add(handleBar2);

  // Small golden handle knobs
  const knobGeo = new THREE.SphereGeometry(0.08, 16, 16);
  [
    [0.75, 0.72, 0], [-0.75, 0.72, 0],
    [0, 0.72, 0.75], [0, 0.72, -0.75]
  ].forEach(pos => {
    const knob = new THREE.Mesh(knobGeo, goldMat);
    knob.position.set(...pos);
    rotorGroup.add(knob);
  });

  scene.add(rotorGroup);

  // 3. The 3D Ivory Ball
  const ballMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.12,
    metalness: 0.05
  });
  ballMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 32), ballMat);
  ballMesh.castShadow = true;

  // Ball contact shadow
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.45
  });
  ballShadowMesh = new THREE.Mesh(new THREE.CircleGeometry(0.11, 16), shadowMat);
  ballShadowMesh.rotation.x = -Math.PI / 2;

  // Initial resting state inside pocket 0
  attachBallToPocket(0);

  is3DReady = true;

  // Resize handler
  window.addEventListener('resize', onWindowResize);

  // Start Render Loop
  if (!animId) {
    animId = requestAnimationFrame(render3DLoop);
  }
}

function onWindowResize() {
  const container = document.getElementById('wheelContainer');
  if (!container || !renderer || !camera) return;
  const w = container.clientWidth || 340;
  const h = container.clientHeight || 340;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

// Attach the ball firmly inside a specific numbered pocket ("Duduk Betul Dalam Bakul")
function attachBallToPocket(num) {
  const idx = WHEEL_NUMBERS.indexOf(num);
  if (idx < 0) return;

  const step = (2 * Math.PI) / 37;
  const pocketAngle = -Math.PI / 2 + idx * step;
  const rPocket = 2.40;

  // Detach from scene if needed and add as child of rotating rotor
  if (ballMesh.parent !== rotorGroup) {
    rotorGroup.add(ballMesh);
    rotorGroup.add(ballShadowMesh);
  }

  ballMesh.position.set(rPocket * Math.cos(pocketAngle), 0.12, rPocket * Math.sin(pocketAngle));
  ballShadowMesh.position.set(rPocket * Math.cos(pocketAngle), 0.04, rPocket * Math.sin(pocketAngle));
}

// ---------------------------------------------------------
// 3D ANIMATION LOOP
// ---------------------------------------------------------
function render3DLoop(timestamp) {
  animId = requestAnimationFrame(render3DLoop);

  if (!is3DReady) return;

  // Spin the rotor
  rotorGroup.rotation.y += rotorVelocity;

  if (isBallSpinning) {
    const elapsed = (performance.now() - spinStartTime) / 1000;
    const t = Math.min(elapsed / spinDuration, 1.0);

    // Ball physics over 4 stages:
    if (elapsed < 3.8) {
      // Stage 1: High speed roll on upper outer rim
      ballAngle += ballVelocity;
      ballVelocity *= 0.997;
      ballRadius = 3.55;
      ballY = 0.52;
      ballMesh.position.set(ballRadius * Math.cos(ballAngle), ballY, ballRadius * Math.sin(ballAngle));
    } else if (elapsed < 7.0) {
      // Stage 2: Loses momentum, descends the slope and hits diamonds
      const p = (elapsed - 3.8) / 3.2;
      ballAngle += ballVelocity;
      ballVelocity *= 0.992;
      ballRadius = 3.55 - p * (3.55 - 2.45);
      const baseY = 0.52 - p * (0.52 - 0.16);
      // Deflector bounce perturbation
      const bounce = Math.abs(Math.sin((elapsed - 3.8) * 16)) * 0.09 * (1 - p);
      ballY = baseY + bounce;
      ballMesh.position.set(ballRadius * Math.cos(ballAngle), ballY, ballRadius * Math.sin(ballAngle));
    } else if (elapsed < 8.6) {
      // Stage 3: Reaches pocket ring, rattles across frets
      const p = (elapsed - 7.0) / 1.6;
      ballRadius = 2.40;
      ballVelocity *= 0.97;
      ballAngle += ballVelocity;
      const rattle = Math.abs(Math.sin(p * Math.PI * 6)) * 0.06 * (1 - p);
      ballY = 0.12 + rattle;
      ballMesh.position.set(ballRadius * Math.cos(ballAngle), ballY, ballRadius * Math.sin(ballAngle));
    } else {
      // Stage 4: Sinks and locks directly into target pocket ("Duduk Betul Dalam Bakul")
      isBallSpinning = false;
      attachBallToPocket(targetPocketNumber);

      if (onSpinCompleteCallback) {
        onSpinCompleteCallback();
        onSpinCompleteCallback = null;
      }
    }

    // Shadow follows ball position when in scene
    if (ballMesh.parent === scene) {
      ballShadowMesh.position.set(ballMesh.position.x, 0.04, ballMesh.position.z);
    }
  } else {
    // Idle rotor friction decay
    rotorVelocity = Math.max(0.003, rotorVelocity * 0.996);
  }

  renderer.render(scene, camera);
}

// Trigger the realistic 3D roulette ball launch
function launch3DBall(winningNumber, onFinish) {
  targetPocketNumber = winningNumber;
  onSpinCompleteCallback = onFinish;

  // Detach ball from rotor and place on outer rim
  if (ballMesh.parent !== scene) {
    scene.add(ballMesh);
    scene.add(ballShadowMesh);
  }

  // Spin rotor fast clockwise
  rotorVelocity = 0.085;

  // Launch ball in opposite direction (counter-clockwise) at high speed
  ballVelocity = -0.24;
  ballAngle = Math.random() * Math.PI * 2;
  ballRadius = 3.55;
  ballY = 0.52;

  spinStartTime = performance.now();
  isBallSpinning = true;
}

// ---------------------------------------------------------
// CHIP DECK BUILDER
// ---------------------------------------------------------
function buildChipDeck() {
  const mount = document.getElementById('chipDeckMount');
  if (!mount) return;
  mount.innerHTML = '';

  chipValues.forEach((val) => {
    const token = document.createElement('div');
    token.className = `chip-token c-${val} ${val === wager ? 'selected' : ''}`;
    token.innerHTML = `<span class="chip-lbl-rm">RM</span><span class="chip-lbl-val">${val}</span>`;
    token.onclick = function () {
      if (isSpinning) return;
      document.querySelectorAll('.chip-token').forEach(t => t.classList.remove('selected'));
      token.classList.add('selected');
      wager = val;
      const disp = document.getElementById('activeWagerDisplay');
      if (disp) disp.innerHTML = `Cip Aktif: <strong>${formatRM(wager)}</strong>`;
    };
    mount.append(token);
  });
}

// ---------------------------------------------------------
// BET MODE TOGGLE (ADD / REMOVE)
// ---------------------------------------------------------
function toggleBetMode() {
  if (isSpinning) return;
  const btn = document.getElementById('btnBetMode');
  const lbl = document.getElementById('betModeLabel');

  if (betMode === 'add') {
    betMode = 'remove';
    btn.className = 'btn-mode-toggle mode-remove';
    btn.querySelector('.mode-icon').innerText = '➖';
    lbl.innerText = 'Mod: Batal';
  } else {
    betMode = 'add';
    btn.className = 'btn-mode-toggle mode-add';
    btn.querySelector('.mode-icon').innerText = '➕';
    lbl.innerText = 'Mod: Pasang';
  }
}

function handleCellInteraction(el, numbers, type, odds) {
  if (isSpinning) return;
  if (betMode === 'remove') {
    removeBet(el, numbers, type, odds);
  } else {
    setBet(el, numbers, type, odds);
  }
}

// ---------------------------------------------------------
// AUTHENTIC 3-ROW BETTING BOARD BUILDER
// ---------------------------------------------------------
function buildBettingBoard() {
  const mount = document.getElementById('boardCanvas');
  if (!mount) return;
  mount.innerHTML = '';

  const tableWrapper = document.createElement('div');
  tableWrapper.className = 'casino-table-grid';

  const table = document.createElement('table');
  table.className = 'roulette-table';

  // Row 1 (Top Numbers): 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36 + Column 1
  const tr1 = document.createElement('tr');

  // Zero (0) spans all 3 number rows
  const td0 = document.createElement('td');
  td0.setAttribute('rowspan', '3');
  td0.className = 'cell-num cell-zero';
  td0.innerHTML = '<span class="cell-label">0</span>';
  td0.onclick = function () { handleCellInteraction(this, '0', 'inside_whole', 35); };
  td0.oncontextmenu = function (e) { e.preventDefault(); removeBet(this, '0', 'inside_whole', 35); };
  tr1.append(td0);

  const row1Nums = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
  row1Nums.forEach(num => {
    const td = document.createElement('td');
    td.className = `cell-num ${numRed.includes(num) ? 'cell-red' : 'cell-black'}`;
    td.innerHTML = `<span class="cell-label">${num}</span>`;
    td.onclick = function () { handleCellInteraction(this, '' + num, 'inside_whole', 35); };
    td.oncontextmenu = function (e) { e.preventDefault(); removeBet(this, '' + num, 'inside_whole', 35); };
    tr1.append(td);
  });

  const tdCol1 = document.createElement('td');
  tdCol1.className = 'cell-outside cell-col';
  tdCol1.innerHTML = '<span class="cell-label">2:1</span>';
  tdCol1.onclick = function () { handleCellInteraction(this, row1Nums.join(','), 'outside_column', 2); };
  tdCol1.oncontextmenu = function (e) { e.preventDefault(); removeBet(this, row1Nums.join(','), 'outside_column', 2); };
  tr1.append(tdCol1);
  table.append(tr1);

  // Row 2 (Middle Numbers): 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35 + Column 2
  const tr2 = document.createElement('tr');
  const row2Nums = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
  row2Nums.forEach(num => {
    const td = document.createElement('td');
    td.className = `cell-num ${numRed.includes(num) ? 'cell-red' : 'cell-black'}`;
    td.innerHTML = `<span class="cell-label">${num}</span>`;
    td.onclick = function () { handleCellInteraction(this, '' + num, 'inside_whole', 35); };
    td.oncontextmenu = function (e) { e.preventDefault(); removeBet(this, '' + num, 'inside_whole', 35); };
    tr2.append(td);
  });

  const tdCol2 = document.createElement('td');
  tdCol2.className = 'cell-outside cell-col';
  tdCol2.innerHTML = '<span class="cell-label">2:1</span>';
  tdCol2.onclick = function () { handleCellInteraction(this, row2Nums.join(','), 'outside_column', 2); };
  tdCol2.oncontextmenu = function (e) { e.preventDefault(); removeBet(this, row2Nums.join(','), 'outside_column', 2); };
  tr2.append(tdCol2);
  table.append(tr2);

  // Row 3 (Bottom Numbers): 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34 + Column 3
  const tr3 = document.createElement('tr');
  const row3Nums = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
  row3Nums.forEach(num => {
    const td = document.createElement('td');
    td.className = `cell-num ${numRed.includes(num) ? 'cell-red' : 'cell-black'}`;
    td.innerHTML = `<span class="cell-label">${num}</span>`;
    td.onclick = function () { handleCellInteraction(this, '' + num, 'inside_whole', 35); };
    td.oncontextmenu = function (e) { e.preventDefault(); removeBet(this, '' + num, 'inside_whole', 35); };
    tr3.append(td);
  });

  const tdCol3 = document.createElement('td');
  tdCol3.className = 'cell-outside cell-col';
  tdCol3.innerHTML = '<span class="cell-label">2:1</span>';
  tdCol3.onclick = function () { handleCellInteraction(this, row3Nums.join(','), 'outside_column', 2); };
  tdCol3.oncontextmenu = function (e) { e.preventDefault(); removeBet(this, row3Nums.join(','), 'outside_column', 2); };
  tr3.append(tdCol3);
  table.append(tr3);

  // Row 4: Dozen Bets (1st 12, 2nd 12, 3rd 12)
  const tr4 = document.createElement('tr');
  const tdSpacer4 = document.createElement('td');
  tdSpacer4.className = 'cell-empty';
  tr4.append(tdSpacer4);

  const dozens = [
    { label: '1st 12', nums: '1,2,3,4,5,6,7,8,9,10,11,12' },
    { label: '2nd 12', nums: '13,14,15,16,17,18,19,20,21,22,23,24' },
    { label: '3rd 12', nums: '25,26,27,28,29,30,31,32,33,34,35,36' }
  ];
  dozens.forEach(d => {
    const td = document.createElement('td');
    td.setAttribute('colspan', '4');
    td.className = 'cell-outside cell-dozen';
    td.innerHTML = `<span class="cell-label">${d.label}</span>`;
    td.onclick = function () { handleCellInteraction(this, d.nums, 'outside_dozen', 2); };
    td.oncontextmenu = function (e) { e.preventDefault(); removeBet(this, d.nums, 'outside_dozen', 2); };
    tr4.append(td);
  });

  const tdEndSpacer4 = document.createElement('td');
  tdEndSpacer4.className = 'cell-empty';
  tr4.append(tdEndSpacer4);
  table.append(tr4);

  // Row 5: Outside Bets (1-18, EVEN, RED, BLACK, ODD, 19-36)
  const tr5 = document.createElement('tr');
  const tdSpacer5 = document.createElement('td');
  tdSpacer5.className = 'cell-empty';
  tr5.append(tdSpacer5);

  const outsideBets = [
    { label: '1 to 18', nums: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18', cls: '' },
    { label: 'EVEN', nums: '2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36', cls: '' },
    { label: 'RED', nums: numRed.join(','), cls: 'cell-red-bet' },
    { label: 'BLACK', nums: '2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35', cls: 'cell-black-bet' },
    { label: 'ODD', nums: '1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35', cls: '' },
    { label: '19 to 36', nums: '19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36', cls: '' }
  ];

  outsideBets.forEach(ob => {
    const td = document.createElement('td');
    td.setAttribute('colspan', '2');
    td.className = `cell-outside cell-evens ${ob.cls}`;
    td.innerHTML = `<span class="cell-label">${ob.label}</span>`;
    td.onclick = function () { handleCellInteraction(this, ob.nums, 'outside_oerb', 1); };
    td.oncontextmenu = function (e) { e.preventDefault(); removeBet(this, ob.nums, 'outside_oerb', 1); };
    tr5.append(td);
  });

  const tdEndSpacer5 = document.createElement('td');
  tdEndSpacer5.className = 'cell-empty';
  tr5.append(tdEndSpacer5);
  table.append(tr5);

  tableWrapper.append(table);
  mount.append(tableWrapper);
}

// ---------------------------------------------------------
// BET PLACEMENT & REMOVAL
// ---------------------------------------------------------
function setBet(e, n, o, t) {
  if (isSpinning) return;
  const currentWager = (bankValue < wager) ? bankValue : wager;

  if (currentWager <= 0) {
    if (bankValue <= 0) showBankruptModal();
    return;
  }

  bankValue -= currentWager;
  currentBet += currentWager;
  updateBalances();

  for (let i = 0; i < bet.length; i++) {
    if (bet[i].numbers === n && bet[i].type === o) {
      bet[i].amt += currentWager;
      const chipBadge = e.querySelector('.placed-chip-badge');
      if (chipBadge) chipBadge.innerText = bet[i].amt;
      return;
    }
  }

  bet.push({ amt: currentWager, type: o, odds: t, numbers: n });

  n.split(',').map(Number).forEach(num => {
    if (!numbersBet.includes(num)) numbersBet.push(num);
  });

  if (!e.querySelector('.placed-chip-badge')) {
    const chipColour = (currentWager < 5) ? 'c-1' : ((currentWager < 10) ? 'c-5' : ((currentWager < 50) ? 'c-10' : ((currentWager < 100) ? 'c-50' : 'c-100')));
    const chipBadge = document.createElement('div');
    chipBadge.className = `placed-chip-badge ${chipColour}`;
    chipBadge.innerText = currentWager;
    e.append(chipBadge);
  }
}

function removeBet(e, n, o, t) {
  if (isSpinning) return;

  for (let i = 0; i < bet.length; i++) {
    if (bet[i].numbers === n && bet[i].type === o) {
      const chipDeduct = (bet[i].amt > wager) ? wager : bet[i].amt;
      bet[i].amt -= chipDeduct;
      bankValue += chipDeduct;
      currentBet -= chipDeduct;
      updateBalances();

      if (bet[i].amt <= 0) {
        const c = e.querySelector('.placed-chip-badge');
        if (c) c.remove();
        bet.splice(i, 1);

        numbersBet = [];
        bet.forEach(b => {
          b.numbers.split(',').map(Number).forEach(nm => {
            if (!numbersBet.includes(nm)) numbersBet.push(nm);
          });
        });
      } else {
        const chipBadge = e.querySelector('.placed-chip-badge');
        if (chipBadge) chipBadge.innerText = bet[i].amt;
      }
      return;
    }
  }
}

function clearCurrentBets() {
  if (isSpinning || currentBet === 0) return;
  bankValue += currentBet;
  currentBet = 0;
  bet = [];
  numbersBet = [];
  document.querySelectorAll('.placed-chip-badge').forEach(c => c.remove());
  updateBalances();
  syncBalanceToDB(bankValue);
}

// ---------------------------------------------------------
// SPIN TRIGGER & 3D LAUNCH
// ---------------------------------------------------------
function triggerSpin() {
  if (isSpinning || currentBet <= 0) return;

  isSpinning = true;
  const spinBtn = document.getElementById('masterSpinBtn');
  const spinTxt = document.getElementById('masterSpinText');
  const statusBadge = document.getElementById('wheelStatusBadge');

  if (spinBtn) {
    spinBtn.className = 'master-spin-btn spinning-state';
    spinTxt.innerText = 'RODA 3D SEDANG BERPUSING...';
  }
  if (statusBadge) {
    statusBadge.className = 'status-badge spinning';
    statusBadge.innerText = 'Roda 3D Berpusing 🎰';
  }

  // European roulette 0 through 36
  const winningSpin = Math.floor(Math.random() * 37);

  // Launch the 3D physics-based simulation
  launch3DBall(winningSpin, function () {
    let winValue = 0;
    let betTotal = 0;

    if (numbersBet.includes(winningSpin)) {
      for (let i = 0; i < bet.length; i++) {
        const numArray = bet[i].numbers.split(',').map(Number);
        if (numArray.includes(winningSpin)) {
          bankValue += (bet[i].odds * bet[i].amt) + bet[i].amt;
          winValue += (bet[i].odds * bet[i].amt);
          betTotal += bet[i].amt;
        }
      }
    }

    showRoundResult(winningSpin, winValue, betTotal);
    addNumberToHistory(winningSpin);

    currentBet = 0;
    bet = [];
    numbersBet = [];
    document.querySelectorAll('.placed-chip-badge').forEach(c => c.remove());
    isSpinning = false;

    updateBalances();
    syncBalanceToDB(bankValue);

    if (statusBadge) {
      statusBadge.className = 'status-badge waiting';
      statusBadge.innerText = `Bola di Bakul [${winningSpin}]`;
    }

    if (bankValue <= 0) {
      setTimeout(showBankruptModal, 1500);
    }
  });
}

// ---------------------------------------------------------
// NOTIFICATIONS & HISTORY
// ---------------------------------------------------------
function addNumberToHistory(num) {
  const strip = document.getElementById('pnContent');
  if (!strip) return;

  const colorCls = (num === 0) ? 'green' : (numRed.includes(num) ? 'red' : 'black');
  const item = document.createElement('div');
  item.className = `history-item ${colorCls}`;
  item.innerText = num;
  strip.prepend(item);
}

function showRoundResult(winNum, winVal, betTotal) {
  const popup = document.getElementById('roundResultOverlay');
  if (!popup) return;

  const colorName = (winNum === 0) ? 'HIJAU' : (numRed.includes(winNum) ? 'MERAH' : 'HITAM');
  const colorBg = (winNum === 0) ? '#16a34a' : (numRed.includes(winNum) ? '#dc2626' : '#27272a');

  if (winVal > 0) {
    popup.innerHTML = `
      <div class="popup-title" style="color: #4ade80;">🎉 TAHNIAH, ANDA MENANG!</div>
      <div class="popup-num-badge" style="background: ${colorBg};">Nombor ${winNum} (${colorName})</div>
      <div class="popup-payout">Untung: <strong>+${formatRM(winVal)}</strong> | Pulangan: <strong>${formatRM(winVal + betTotal)}</strong></div>
    `;
  } else {
    popup.innerHTML = `
      <div class="popup-title" style="color: #cbd5e1;">Roda Berhenti Pada:</div>
      <div class="popup-num-badge" style="background: ${colorBg};">Nombor ${winNum} (${colorName})</div>
      <div style="font-size: 14px; color: #94a3b8;">Tiada taruhan menang pusingan ini. Cuba lagi!</div>
    `;
  }

  popup.style.display = 'block';
  setTimeout(() => {
    popup.style.display = 'none';
  }, 4000);
}

function showBankruptModal() {
  const modal = document.getElementById('bankruptModal');
  if (modal) modal.style.display = 'flex';
}

function claimBankruptcyBonus() {
  bankValue = 100;
  const modal = document.getElementById('bankruptModal');
  if (modal) modal.style.display = 'none';
  updateBalances();
  syncBalanceToDB(bankValue);
}

// ---------------------------------------------------------
// DATABASE & MODAL LOGIC
// ---------------------------------------------------------
function showPlayerModal() {
  const m = document.getElementById('loginModal');
  if (m) m.style.display = 'flex';
}

function hidePlayerModal() {
  const m = document.getElementById('loginModal');
  if (m) m.style.display = 'none';
}

function setPlayerSession(player) {
  currentPlayer = player;
  localStorage.setItem('roulette_player', JSON.stringify(player));
  bankValue = Number(player.balance != null ? player.balance : 100);

  const hudName = document.getElementById('hudPlayerName');
  const hudBal = document.getElementById('hudPlayerBalance');
  if (hudName) hudName.innerText = player.name || 'Pemain';
  if (hudBal) hudBal.innerText = formatRM(bankValue);

  updateBalances();
  hidePlayerModal();
}

async function syncBalanceToDB(newBal) {
  if (!currentPlayer || !currentPlayer.id) return;
  currentPlayer.balance = newBal;
  localStorage.setItem('roulette_player', JSON.stringify(currentPlayer));

  try {
    await fetch('/api/game/roulette', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: currentPlayer.id, balance: newBal })
    });
  } catch (e) {
    console.log('Sync balance warning:', e);
  }
}

async function handlePlayerSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById('playerNameInput');
  const statusEl = document.getElementById('modalStatus');
  const btn = document.getElementById('btnSubmitPlayer');
  const name = (nameInput.value || '').trim();

  if (!name) return;

  btn.disabled = true;
  btn.innerText = 'Menghubungkan ke Pangkalan Data...';
  statusEl.className = 'modal-status';
  statusEl.innerText = '';

  try {
    const res = await fetch('/api/game/roulette', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name })
    });
    const data = await res.json();
    if (data.ok && data.player) {
      statusEl.className = 'modal-status success';
      statusEl.innerText = `✓ Selamat datang ${data.player.name}! Baki ${formatRM(data.player.balance)} dimuatkan.`;
      setTimeout(() => {
        setPlayerSession(data.player);
      }, 500);
    } else {
      throw new Error(data.error || 'Gagal menyimpan rekod pemain');
    }
  } catch (err) {
    statusEl.className = 'modal-status';
    statusEl.innerText = `Mod kendiri: ${err.message}`;
    const fallbackPlayer = { id: Date.now(), name: name, balance: 100 };
    setTimeout(() => {
      setPlayerSession(fallbackPlayer);
    }, 600);
  } finally {
    btn.disabled = false;
    btn.innerText = 'MULA MAIN (TERIMA RM 100)';
  }
}

// Auto-check on load
(async function initPlayerOnLoad() {
  initGame();

  let localData = null;
  try {
    localData = JSON.parse(localStorage.getItem('roulette_player'));
  } catch (e) {}

  try {
    const url = (localData && localData.name)
      ? '/api/game/roulette?name=' + encodeURIComponent(localData.name)
      : '/api/game/roulette';
    const res = await fetch(url);
    const data = await res.json();
    if (data.ok && data.player) {
      setPlayerSession(data.player);
      return;
    }
  } catch (err) {
    console.log('Database init note:', err);
  }

  if (localData && localData.name) {
    setPlayerSession(localData);
  } else {
    showPlayerModal();
  }
})();

// =========================================================
// ROULETTE KASINO (RM) - HAIRIAHOSTING GAME SCRIPT
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
// European wheel order (0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26)
const wheelnumbersAC = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
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
  buildWheel();
  buildBettingBoard();
  buildChipDeck();
  updateBalances();
}

// ---------------------------------------------------------
// WHEEL BUILDER
// ---------------------------------------------------------
let wheelEl = null;
let ballTrackEl = null;

function buildWheel() {
  const mount = document.getElementById('wheelContainer');
  if (!mount) return;
  mount.innerHTML = '';

  wheelEl = document.createElement('div');
  wheelEl.setAttribute('class', 'wheel');

  const outerRim = document.createElement('div');
  outerRim.setAttribute('class', 'outerRim');
  wheelEl.append(outerRim);

  const numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
  for (let i = 0; i < numbers.length; i++) {
    const a = i + 1;
    const spanClass = (numbers[i] < 10) ? 'single' : 'double';
    const sect = document.createElement('div');
    sect.setAttribute('id', 'sect' + a);
    sect.setAttribute('class', 'sect');

    const span = document.createElement('span');
    span.setAttribute('class', spanClass);
    span.innerText = numbers[i];
    sect.append(span);

    const block = document.createElement('div');
    block.setAttribute('class', 'block');
    sect.append(block);
    wheelEl.append(sect);
  }

  const pocketsRim = document.createElement('div');
  pocketsRim.setAttribute('class', 'pocketsRim');
  wheelEl.append(pocketsRim);

  ballTrackEl = document.createElement('div');
  ballTrackEl.setAttribute('class', 'ballTrack');
  const ball = document.createElement('div');
  ball.setAttribute('class', 'ball');
  ballTrackEl.append(ball);
  wheelEl.append(ballTrackEl);

  const pockets = document.createElement('div');
  pockets.setAttribute('class', 'pockets');
  wheelEl.append(pockets);

  const cone = document.createElement('div');
  cone.setAttribute('class', 'cone');
  wheelEl.append(cone);

  const turret = document.createElement('div');
  turret.setAttribute('class', 'turret');
  wheelEl.append(turret);

  const turretHandle = document.createElement('div');
  turretHandle.setAttribute('class', 'turretHandle');
  const thendOne = document.createElement('div');
  thendOne.setAttribute('class', 'thendOne');
  turretHandle.append(thendOne);
  const thendTwo = document.createElement('div');
  thendTwo.setAttribute('class', 'thendTwo');
  turretHandle.append(thendTwo);
  wheelEl.append(turretHandle);

  mount.append(wheelEl);
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

  // If already bet on this cell, increment
  for (let i = 0; i < bet.length; i++) {
    if (bet[i].numbers === n && bet[i].type === o) {
      bet[i].amt += currentWager;
      const chipBadge = e.querySelector('.placed-chip-badge');
      if (chipBadge) chipBadge.innerText = bet[i].amt;
      return;
    }
  }

  // Create new bet
  bet.push({ amt: currentWager, type: o, odds: t, numbers: n });

  n.split(',').map(Number).forEach(num => {
    if (!numbersBet.includes(num)) numbersBet.push(num);
  });

  // Render chip visual on cell
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
// SPIN TRIGGER & ANIMATION
// ---------------------------------------------------------
function triggerSpin() {
  if (isSpinning || currentBet <= 0) return;

  isSpinning = true;
  const spinBtn = document.getElementById('masterSpinBtn');
  const spinTxt = document.getElementById('masterSpinText');
  const statusBadge = document.getElementById('wheelStatusBadge');

  if (spinBtn) {
    spinBtn.className = 'master-spin-btn spinning-state';
    spinTxt.innerText = 'RODA SEDANG BERPUSING...';
  }
  if (statusBadge) {
    statusBadge.className = 'status-badge spinning';
    statusBadge.innerText = 'Sedang Berpusing 🎰';
  }

  // European roulette 0 through 36
  const winningSpin = Math.floor(Math.random() * 37);
  spinWheelAnimation(winningSpin);

  setTimeout(function () {
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
      statusBadge.innerText = 'Sedia Untuk Bertaruh';
    }

    if (bankValue <= 0) {
      setTimeout(showBankruptModal, 1500);
    }
  }, 10000);
}

function spinWheelAnimation(winningSpin) {
  let degree = 0;
  for (let i = 0; i < wheelnumbersAC.length; i++) {
    if (wheelnumbersAC[i] === winningSpin) {
      degree = (i * 9.73) + 362;
      break;
    }
  }

  wheelEl.style.animation = 'wheelRotate 5s linear infinite';
  ballTrackEl.style.animation = 'ballRotate 1s linear infinite';

  setTimeout(() => {
    ballTrackEl.style.animation = 'ballRotate 2s linear infinite';
    let style = document.getElementById('ballStopKeyframe');
    if (!style) {
      style = document.createElement('style');
      style.id = 'ballStopKeyframe';
      document.head.appendChild(style);
    }
    style.innerText = `@keyframes ballStop { from { transform: rotate(0deg); } to { transform: rotate(-${degree}deg); } }`;
  }, 2000);

  setTimeout(() => {
    ballTrackEl.style.animation = 'ballStop 3s linear';
  }, 6000);

  setTimeout(() => {
    ballTrackEl.style.transform = `rotate(-${degree}deg)`;
  }, 9000);

  setTimeout(() => {
    wheelEl.style.animation = '';
    const style = document.getElementById('ballStopKeyframe');
    if (style) style.remove();
  }, 10000);
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

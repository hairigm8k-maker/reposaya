let bankValue = 100;
let currentBet = 0;
let wager = 5;
let lastWager = 0;
let bet = [];
let numbersBet = [];
let previousNumbers = [];

let currentPlayer = null;

let numRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
let wheelnumbersAC = [0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10, 23, 8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32];

function formatRM(val){
	return 'RM ' + Number(val || 0).toLocaleString("en-GB");
}

function updateBalances(){
	let bSpan = document.getElementById('bankSpan');
	let betSpan = document.getElementById('betSpan');
	let hudBal = document.getElementById('hudPlayerBalance');
	if(bSpan) bSpan.innerText = formatRM(bankValue);
	if(betSpan) betSpan.innerText = formatRM(currentBet);
	if(hudBal) hudBal.innerText = formatRM(bankValue);
}

// Build game DOM container
let container = document.createElement('div');
container.setAttribute('id', 'container');
document.body.append(container);

startGame();

let wheel = document.getElementsByClassName('wheel')[0];
let ballTrack = document.getElementsByClassName('ballTrack')[0];

function resetGame(){
	bankValue = 100;
	currentBet = 0;
	wager = 5;
	bet = [];
	numbersBet = [];
	previousNumbers = [];
	let bBoard = document.getElementById('betting_board');
	let notif = document.getElementById('notification');
	if(bBoard) bBoard.remove();
	if(notif) notif.remove();
	buildBettingBoard();
	updateBalances();
	syncBalanceToDB(bankValue);
}

function startGame(){
	buildWheel();
	buildBettingBoard();
	updateBalances();
}

function gameOver(){
	let notification = document.createElement('div');
	notification.setAttribute('id', 'notification');
	let nSpan = document.createElement('span');
	nSpan.setAttribute('class', 'nSpan');
	nSpan.innerText = 'Bankrupt (Baki RM 0)';
	notification.append(nSpan);

	let nBtn = document.createElement('div');
	nBtn.setAttribute('class', 'nBtn');
	nBtn.innerText = 'Main Semula (RM 100)';	
	nBtn.onclick = function(){
		resetGame();
	};
	notification.append(nBtn);
	container.prepend(notification);
}

function buildWheel(){
	let wheel = document.createElement('div');
	wheel.setAttribute('class', 'wheel');

	let outerRim = document.createElement('div');
	outerRim.setAttribute('class', 'outerRim');
	wheel.append(outerRim);

	let numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
	for(i = 0; i < numbers.length; i++){
		let a = i + 1;
		let spanClass = (numbers[i] < 10)? 'single' : 'double';
		let sect = document.createElement('div');
		sect.setAttribute('id', 'sect'+a);
		sect.setAttribute('class', 'sect');
		let span = document.createElement('span');
		span.setAttribute('class', spanClass);
		span.innerText = numbers[i];
		sect.append(span);
		let block = document.createElement('div');
		block.setAttribute('class', 'block');
		sect.append(block);
		wheel.append(sect);
	}

	let pocketsRim = document.createElement('div');
	pocketsRim.setAttribute('class', 'pocketsRim');
	wheel.append(pocketsRim);

	let ballTrack = document.createElement('div');
	ballTrack.setAttribute('class', 'ballTrack');
	let ball = document.createElement('div');
	ball.setAttribute('class', 'ball');
	ballTrack.append(ball);
	wheel.append(ballTrack);

	let pockets = document.createElement('div');
	pockets.setAttribute('class', 'pockets');
	wheel.append(pockets);

	let cone = document.createElement('div');
	cone.setAttribute('class', 'cone');
	wheel.append(cone);

	let turret = document.createElement('div');
	turret.setAttribute('class', 'turret');
	wheel.append(turret);

	let turretHandle = document.createElement('div');
	turretHandle.setAttribute('class', 'turretHandle');
	let thendOne = document.createElement('div');
	thendOne.setAttribute('class', 'thendOne');
	turretHandle.append(thendOne);
	let thendTwo = document.createElement('div');
	thendTwo.setAttribute('class', 'thendTwo');
	turretHandle.append(thendTwo);
	wheel.append(turretHandle);

	container.append(wheel);
}

function buildBettingBoard(){
	let bettingBoard = document.createElement('div');
	bettingBoard.setAttribute('id', 'betting_board');

	let wl = document.createElement('div');
	wl.setAttribute('class', 'winning_lines');

	var wlttb = document.createElement('div');
	wlttb.setAttribute('id', 'wlttb_top');
	wlttb.onclick = function(){
		setBet(this, '0,1,2,3', 'top_line', 6);
	};
	wlttb.oncontextmenu = function(e){
		e.preventDefault();
		removeBet(this, '0,1,2,3', 'top_line', 6);
	};
	wl.append(wlttb);

	for(i = 1; i < 37; i++){
		let j = i;
		var wlttb = document.createElement('div');
		wlttb.setAttribute('id', 'wlttb_'+j);
		wlttb.onclick = function(){
			setBet(this, ''+j+'', 'street', 11);
		};
		wlttb.oncontextmenu = function(e){
			e.preventDefault();
			removeBet(this, ''+j+'', 'street', 11);
		};
		wl.append(wlttb);
	}
	bettingBoard.append(wl);

	let bbt = document.createElement('table');
	bbt.setAttribute('class', 'bbtable');
	let btr = document.createElement('tr');
	let btd = document.createElement('td');
	btd.setAttribute('class', 'val');
	btd.setAttribute('rows', '4');
	btd.innerText = '0';
	btd.onclick = function(){
		setBet(this, '0', 'inside_whole', 35);
	};
	btd.oncontextmenu = function(e){
		e.preventDefault();
		removeBet(this, '0', 'inside_whole', 35);
	};
	btr.append(btd);

	var c = 1;
	for(i = 0; i < 12; i++){
		for(j = 0; j < 3; j++){
			let k = c++;
			btd = document.createElement('td');
			btd.setAttribute('class', 'val');
			btd.style.backgroundColor = (numRed.includes(k))? 'red' : 'black';
			btd.innerText = k;
			btd.onclick = function(){
				setBet(this, ''+k+'', 'inside_whole', 35);
			};
			btd.oncontextmenu = function(e){
				e.preventDefault();
				removeBet(this, ''+k+'', 'inside_whole', 35);
			};
			btr.append(btd);
		}
	}
	bbt.append(btr);
	bettingBoard.append(bbt);

	let wlbtm = document.createElement('div');
	wlbtm.setAttribute('class', 'winning_lines');
	wlbtm.style.cssText = 'top: 153px;';
	for(i = 1; i < 37; i++){
		let j = i;
		var wlttb = document.createElement('div');
		wlttb.setAttribute('id', 'wlbtm_'+j);
		wlttb.onclick = function(){
			setBet(this, ''+j+'', 'street', 11);
		};
		wlttb.oncontextmenu = function(e){
			e.preventDefault();
			removeBet(this, ''+j+'', 'street', 11);
		};
		wlbtm.append(wlttb);
	}
	bettingBoard.append(wlbtm);

	let wl_vl = document.createElement('div');
	wl_vl.setAttribute('class', 'winning_lines');
	wl_vl.style.cssText = 'top: 0px; left: 0px;';
	for(i = 1; i < 37; i++){
		let j = i;
		var wlttb = document.createElement('div');
		wlttb.setAttribute('id', 'wl_vl_'+j);
		wlttb.onclick = function(){
			setBet(this, ''+j+','+(j+1)+'', 'split', 17);
		};
		wlttb.oncontextmenu = function(e){
			e.preventDefault();
			removeBet(this, ''+j+','+(j+1)+'', 'split', 17);
		};
		wl_vl.append(wlttb);
	}
	bettingBoard.append(wl_vl);

	let wl_hl = document.createElement('div');
	wl_hl.setAttribute('class', 'winning_lines');
	wl_hl.style.cssText = 'top: 0px; left: 0px;';
	for(i = 1; i < 34; i++){
		let j = i;
		var wlttb = document.createElement('div');
		wlttb.setAttribute('id', 'wl_hl_'+j);
		wlttb.onclick = function(){
			setBet(this, ''+j+','+(j+3)+'', 'split', 17);
		};
		wlttb.oncontextmenu = function(e){
			e.preventDefault();
			removeBet(this, ''+j+','+(j+3)+'', 'split', 17);
		};
		wl_hl.append(wlttb);
	}
	bettingBoard.append(wl_hl);

	let wl_c = document.createElement('div');
	wl_c.setAttribute('class', 'winning_lines');
	wl_c.style.cssText = 'top: 0px; left: 0px;';
	for(i = 1; i < 34; i++){
		let j = i;
		var wlttb = document.createElement('div');
		wlttb.setAttribute('id', 'wl_c_'+j);
		wlttb.onclick = function(){
			setBet(this, ''+j+','+(j+1)+','+(j+3)+','+(j+4)+'', 'corner', 8);
		};
		wlttb.oncontextmenu = function(e){
			e.preventDefault();
			removeBet(this, ''+j+','+(j+1)+','+(j+3)+','+(j+4)+'', 'corner', 8);
		};
		wl_c.append(wlttb);
	}
	bettingBoard.append(wl_c);

	let bbt1 = document.createElement('table');
	bbt1.setAttribute('class', 'bbtable');
	let btr1 = document.createElement('tr');
	let btd1 = document.createElement('td');
	btd1.setAttribute('class', 'val');
	btd1.innerText = '1st 12';
	btd1.onclick = function(){
		setBet(this, '1,2,3,4,5,6,7,8,9,10,11,12', 'outside_dozen', 2);
	};
	btd1.oncontextmenu = function(e){
		e.preventDefault();
		removeBet(this, '1,2,3,4,5,6,7,8,9,10,11,12', 'outside_dozen', 2);
	};
	btr1.append(btd1);

	btd1 = document.createElement('td');
	btd1.setAttribute('class', 'val');
	btd1.innerText = '2nd 12';
	btd1.onclick = function(){
		setBet(this, '13,14,15,16,17,18,19,20,21,22,23,24', 'outside_dozen', 2);
	};
	btd1.oncontextmenu = function(e){
		e.preventDefault();
		removeBet(this, '13,14,15,16,17,18,19,20,21,22,23,24', 'outside_dozen', 2);
	};
	btr1.append(btd1);

	btd1 = document.createElement('td');
	btd1.setAttribute('class', 'val');
	btd1.innerText = '3rd 12';
	btd1.onclick = function(){
		setBet(this, '25,26,27,28,29,30,31,32,33,34,35,36', 'outside_dozen', 2);
	};
	btd1.oncontextmenu = function(e){
		e.preventDefault();
		removeBet(this, '25,26,27,28,29,30,31,32,33,34,35,36', 'outside_dozen', 2);
	};
	btr1.append(btd1);

	bbt1.append(btr1);
	bettingBoard.append(bbt1);

	let bbt2 = document.createElement('table');
	bbt2.setAttribute('class', 'bbtable');
	let btr2 = document.createElement('tr');
	let btd2 = document.createElement('td');
	btd2.setAttribute('class', 'val');
	btd2.innerText = '1 to 18';
	btd2.onclick = function(){
		setBet(this, '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18', 'outside_oerb', 1);
	};
	btd2.oncontextmenu = function(e){
		e.preventDefault();
		removeBet(this, '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18', 'outside_oerb', 1);
	};
	btr2.append(btd2);

	btd2 = document.createElement('td');
	btd2.setAttribute('class', 'val');
	btd2.innerText = 'EVEN';
	btd2.onclick = function(){
		setBet(this, '2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36', 'outside_oerb', 1);
	};
	btd2.oncontextmenu = function(e){
		e.preventDefault();
		removeBet(this, '2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36', 'outside_oerb', 1);
	};
	btr2.append(btd2);

	btd2 = document.createElement('td');
	btd2.setAttribute('class', 'val redNum');
	btd2.innerText = 'RED';
	btd2.onclick = function(){
		setBet(this, '1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36', 'outside_oerb', 1);
	};
	btd2.oncontextmenu = function(e){
		e.preventDefault();
		removeBet(this, '1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36', 'outside_oerb', 1);
	};
	btr2.append(btd2);

	btd2 = document.createElement('td');
	btd2.setAttribute('class', 'val blackNum');
	btd2.innerText = 'BLACK';
	btd2.onclick = function(){
		setBet(this, '2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35', 'outside_oerb', 1);
	};
	btd2.oncontextmenu = function(e){
		e.preventDefault();
		removeBet(this, '2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35', 'outside_oerb', 1);
	};
	btr2.append(btd2);

	btd2 = document.createElement('td');
	btd2.setAttribute('class', 'val');
	btd2.innerText = 'ODD';
	btd2.onclick = function(){
		setBet(this, '1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35', 'outside_oerb', 1);
	};
	btd2.oncontextmenu = function(e){
		e.preventDefault();
		removeBet(this, '1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35', 'outside_oerb', 1);
	};
	btr2.append(btd2);

	btd2 = document.createElement('td');
	btd2.setAttribute('class', 'val');
	btd2.innerText = '19 to 36';
	btd2.onclick = function(){
		setBet(this, '19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36', 'outside_oerb', 1);
	};
	btd2.oncontextmenu = function(e){
		e.preventDefault();
		removeBet(this, '19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36', 'outside_oerb', 1);
	};
	btr2.append(btd2);

	bbt2.append(btr2);
	bettingBoard.append(bbt2);

	let bbt3 = document.createElement('table');
	bbt3.setAttribute('class', 'bbtable');
	let btr3 = document.createElement('tr');
	let btd3 = document.createElement('td');
	btd3.setAttribute('class', 'val');
	btd3.innerText = '2 to 1';
	btd3.onclick = function(){
		setBet(this, '3,6,9,12,15,18,21,24,27,30,33,36', 'outside_column', 2);
	};
	btd3.oncontextmenu = function(e){
		e.preventDefault();
		removeBet(this, '3,6,9,12,15,18,21,24,27,30,33,36', 'outside_column', 2);
	};
	btr3.append(btd3);

	btd3 = document.createElement('td');
	btd3.setAttribute('class', 'val');
	btd3.innerText = '2 to 1';
	btd3.onclick = function(){
		setBet(this, '2,5,8,11,14,17,20,23,26,29,32,35', 'outside_column', 2);
	};
	btd3.oncontextmenu = function(e){
		e.preventDefault();
		removeBet(this, '2,5,8,11,14,17,20,23,26,29,32,35', 'outside_column', 2);
	};
	btr3.append(btd3);

	btd3 = document.createElement('td');
	btd3.setAttribute('class', 'val');
	btd3.innerText = '2 to 1';
	btd3.onclick = function(){
		setBet(this, '1,4,7,10,13,16,19,22,25,28,31,34', 'outside_column', 2);
	};
	btd3.oncontextmenu = function(e){
		e.preventDefault();
		removeBet(this, '1,4,7,10,13,16,19,22,25,28,31,34', 'outside_column', 2);
	};
	btr3.append(btd3);

	bbt3.append(btr3);
	bettingBoard.append(bbt3);

	let otoBoard = document.createElement('div');
	otoBoard.setAttribute('class', 'otoBoard');
	let otoBlocks = ['RED', 'BLACK', 'EVEN', 'ODD'];
	for(i = 0; i < 4; i++){
		let d = i;
		var colourClass = (otoBlocks[i] == 'RED')? ' redNum' : ((otoBlocks[i] == 'BLACK')? ' blackNum' : '');
		var otoBlock = document.createElement('div');
		otoBlock.setAttribute('class', 'oto_block' + colourClass);
		otoBlock.onclick = function(){
			num = (d == 0)? '2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36' : ((d == 1)? '1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36' : ((d == 2)? '2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35' : '1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35'));
			setBet(this, num, 'outside_oerb', 1);
		};
		otoBlock.oncontextmenu = function(e){
			num = (d == 0)? '2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36' : ((d == 1)? '1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36' : ((d == 2)? '2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35' : '1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35'));
			e.preventDefault();
			removeBet(this, num, 'outside_oerb', 1);
		};
		otoBlock.innerText = otoBlocks[i];
		otoBoard.append(otoBlock);
	}
	bettingBoard.append(otoBoard);

	let chipDeck = document.createElement('div');
	chipDeck.setAttribute('class', 'chipDeck');
	let chipValues = [1, 5, 10, 100, 'clear'];
	for(i = 0; i < chipValues.length; i++){
		let cvi = i;
		let chipColour = (i == 0)? 'red' : ((i == 1)? 'blue cdChipActive' : ((i == 2)? 'orange' : ((i == 3)? 'gold' : 'clearBet')));
		let chip = document.createElement('div');
		chip.setAttribute('class', 'cdChip ' + chipColour);
		chip.onclick = function(){
			if(cvi !== 4){
				let cdChipActive = document.getElementsByClassName('cdChipActive');
				for(i = 0; i < cdChipActive.length; i++){
					cdChipActive[i].classList.remove('cdChipActive');
				}
				let curClass = this.getAttribute('class');
				if(!curClass.includes('cdChipActive')){
					this.setAttribute('class', curClass + ' cdChipActive');
				}
				wager = parseInt(chip.childNodes[0].innerText);
			}else{
				bankValue = bankValue + currentBet;
				currentBet = 0;
				updateBalances();
				clearBet();
				removeChips();
				syncBalanceToDB(bankValue);
			}
		};
		let chipSpan = document.createElement('span');
		chipSpan.setAttribute('class', 'cdChipSpan');
		chipSpan.innerText = chipValues[i];
		chip.append(chipSpan);
		chipDeck.append(chip);
	}
	bettingBoard.append(chipDeck);

	let bankContainer = document.createElement('div');
	bankContainer.setAttribute('class', 'bankContainer');

	let bank = document.createElement('div');
	bank.setAttribute('class', 'bank');
	let bankSpan = document.createElement('span');
	bankSpan.setAttribute('id', 'bankSpan');
	bankSpan.innerText = formatRM(bankValue);
	bank.append(bankSpan);
	bankContainer.append(bank);

	let betDiv = document.createElement('div');
	betDiv.setAttribute('class', 'bet');
	let betSpan = document.createElement('span');
	betSpan.setAttribute('id', 'betSpan');
	betSpan.innerText = formatRM(currentBet);
	betDiv.append(betSpan);
	bankContainer.append(betDiv);	
	bettingBoard.append(bankContainer);

	let pnBlock = document.createElement('div');
	pnBlock.setAttribute('class', 'pnBlock');
	let pnContent = document.createElement('div');
	pnContent.setAttribute('id', 'pnContent');
	pnContent.onwheel = function(e){
		e.preventDefault();
		pnContent.scrollLeft += e.deltaY;
	};
	pnBlock.append(pnContent);	
	bettingBoard.append(pnBlock);
	
	container.append(bettingBoard);
}

function clearBet(){
	bet = [];
	numbersBet = [];
}

function setBet(e, n, o, t){
	lastWager = wager;
	wager = (bankValue < wager)? bankValue : wager;
	if(wager > 0){
		if(!container.querySelector('.spinBtn')){
			let spinBtn = document.createElement('div');
			spinBtn.setAttribute('class', 'spinBtn');
			spinBtn.innerText = 'spin';
			spinBtn.onclick = function(){
				this.remove();
				spin();
			};
			container.append(spinBtn);
		}
		bankValue = bankValue - wager;
		currentBet = currentBet + wager;
		updateBalances();

		for(i = 0; i < bet.length; i++){
			if(bet[i].numbers == n && bet[i].type == o){
				bet[i].amt = bet[i].amt + wager;
				let chipVal = bet[i].amt;
				e.querySelector('.chipSpan').innerText = chipVal;
				return;
			}
		}

		var obj = {
			amt: wager,
			type: o,
			odds: t,
			numbers: n
		};
		bet.push(obj);
		
		let numArray = n.split(',').map(Number);
		for(i = 0; i < numArray.length; i++){
			if(!numbersBet.includes(numArray[i])){
				numbersBet.push(numArray[i]);
			}
		}

		if(!e.querySelector('.chip')){
			let chipColour = (wager < 5)? 'red' : ((wager < 10)? 'blue' : ((wager < 100)? 'orange' : 'gold'));
			let chip = document.createElement('div');
			chip.setAttribute('class', 'chip ' + chipColour);
			let chipSpan = document.createElement('span');
			chipSpan.setAttribute('class', 'chipSpan');
			chipSpan.innerText = wager;
			chip.append(chipSpan);
			e.append(chip);
		}
	}
}

function spin(){
	var winningSpin = Math.floor(Math.random() * 36);
	spinWheel(winningSpin);
	setTimeout(function(){
		if(numbersBet.includes(winningSpin)){
			let winValue = 0;
			let betTotal = 0;
			for(i = 0; i < bet.length; i++){
				var numArray = bet[i].numbers.split(',').map(Number);
				if(numArray.includes(winningSpin)){
					bankValue = (bankValue + (bet[i].odds * bet[i].amt) + bet[i].amt);
					winValue = winValue + (bet[i].odds * bet[i].amt);
					betTotal = betTotal + bet[i].amt;
				}
			}
			win(winningSpin, winValue, betTotal);
		}

		currentBet = 0;
		updateBalances();
		syncBalanceToDB(bankValue);
		
		let pnClass = (numRed.includes(winningSpin))? 'pnRed' : ((winningSpin == 0)? 'pnGreen' : 'pnBlack');
		let pnContent = document.getElementById('pnContent');
		let pnSpan = document.createElement('span');
		pnSpan.setAttribute('class', pnClass);
		pnSpan.innerText = winningSpin;
		pnContent.append(pnSpan);
		pnContent.scrollLeft = pnContent.scrollWidth;

		bet = [];
		numbersBet = [];
		removeChips();
		wager = lastWager;
		if(bankValue == 0 && currentBet == 0){
			gameOver();
		}
	}, 10000);
}

function win(winningSpin, winValue, betTotal){
	if(winValue > 0){
		let notification = document.createElement('div');
		notification.setAttribute('id', 'notification');
		let nSpan = document.createElement('div');
		nSpan.setAttribute('class', 'nSpan');
		let nsnumber = document.createElement('span');
		nsnumber.setAttribute('class', 'nsnumber');
		nsnumber.style.cssText = (numRed.includes(winningSpin))? 'color:red' : 'color:black';
		nsnumber.innerText = winningSpin;
		nSpan.append(nsnumber);
		let nsTxt = document.createElement('span');
		nsTxt.innerText = ' Menang!';
		nSpan.append(nsTxt);
		let nsWin = document.createElement('div');
		nsWin.setAttribute('class', 'nsWin');
		let nsWinBlock = document.createElement('div');
		nsWinBlock.setAttribute('class', 'nsWinBlock');
		nsWinBlock.innerText = 'Taruhan: ' + formatRM(betTotal);
		nSpan.append(nsWinBlock);
		nsWin.append(nsWinBlock);
		nsWinBlock = document.createElement('div');
		nsWinBlock.setAttribute('class', 'nsWinBlock');
		nsWinBlock.innerText = 'Untung: ' + formatRM(winValue);
		nSpan.append(nsWinBlock);
		nsWin.append(nsWinBlock);
		nsWinBlock = document.createElement('div');
		nsWinBlock.setAttribute('class', 'nsWinBlock');
		nsWinBlock.innerText = 'Bayaran: ' + formatRM(winValue + betTotal);
		nSpan.append(nsWinBlock);
		nsWin.append(nsWinBlock);
		nSpan.append(nsWin);
		notification.append(nSpan);
		container.prepend(notification);
		setTimeout(function(){
			notification.style.cssText = 'opacity:0';
		}, 3000);
		setTimeout(function(){
			notification.remove();
		}, 4000);
	}
}

function removeBet(e, n, o, t){
	wager = (wager == 0)? 100 : wager;
	for(i = 0; i < bet.length; i++){
		if(bet[i].numbers == n && bet[i].type == o){
			if(bet[i].amt != 0){
				wager = (bet[i].amt > wager)? wager : bet[i].amt;
				bet[i].amt = bet[i].amt - wager;
				bankValue = bankValue + wager;
				currentBet = currentBet - wager;
				updateBalances();
				syncBalanceToDB(bankValue);
				let chipVal = bet[i].amt;
				if(chipVal == 0){
					e.querySelector('.chip').remove();
					bet.splice(i, 1);
					let clearNumber = true;
					let numClear = n.split(',').map(Number);
					for(k = 0; k < numClear.length; k++){
						for(j = 0; j < bet.length; j++){
							if(bet[j].numbers.includes(numClear[k])){
								clearNumber = false;
							}
						}
						if(clearNumber){
							numbersBet.splice(numbersBet.indexOf(numClear[k]), 1);
						}
					}
				}else{
					e.querySelector('.chipSpan').innerText = chipVal;
				}
			}
		}
	}

	if(currentBet == 0 && container.querySelector('.spinBtn')){
		document.getElementsByClassName('spinBtn')[0].remove();
	}
}

function spinWheel(winningSpin){
	for(i = 0; i < wheelnumbersAC.length; i++){
		if(wheelnumbersAC[i] == winningSpin){
			var degree = (i * 9.73) + 362;
		}
	}
	wheel.style.cssText = 'animation: wheelRotate 5s linear infinite;';
	ballTrack.style.cssText = 'animation: ballRotate 1s linear infinite;';

	setTimeout(function(){
		ballTrack.style.cssText = 'animation: ballRotate 2s linear infinite;';
		style = document.createElement('style');
		style.type = 'text/css';
		style.innerText = '@keyframes ballStop {from {transform: rotate(0deg);}to{transform: rotate(-'+degree+'deg);}}';
		document.head.appendChild(style);
	}, 2000);
	setTimeout(function(){
		ballTrack.style.cssText = 'animation: ballStop 3s linear;';
	}, 6000);
	setTimeout(function(){
		ballTrack.style.cssText = 'transform: rotate(-'+degree+'deg);';
	}, 9000);
	setTimeout(function(){
		wheel.style.cssText = '';
		style.remove();
	}, 10000);
}

function removeChips(){
	var chips = document.getElementsByClassName('chip');
	if(chips.length > 0){
		for(i = 0; i < chips.length; i++){
			chips[i].remove();
		}
		removeChips();
	}
}

// ============================================
// DATABASE & MODAL LOGIK
// ============================================

function showPlayerModal(){
	let m = document.getElementById('loginModal');
	if(m) m.style.display = 'flex';
}

function hidePlayerModal(){
	let m = document.getElementById('loginModal');
	if(m) m.style.display = 'none';
}

function setPlayerSession(player){
	currentPlayer = player;
	localStorage.setItem('roulette_player', JSON.stringify(player));
	bankValue = Number(player.balance != null ? player.balance : 100);

	let hudName = document.getElementById('hudPlayerName');
	let hudBal = document.getElementById('hudPlayerBalance');
	if(hudName) hudName.innerText = player.name || 'Pemain';
	if(hudBal) hudBal.innerText = formatRM(bankValue);

	updateBalances();
	hidePlayerModal();
}

async function syncBalanceToDB(newBal){
	if(!currentPlayer || !currentPlayer.id) return;
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

async function handlePlayerSubmit(e){
	e.preventDefault();
	let nameInput = document.getElementById('playerNameInput');
	let statusEl = document.getElementById('modalStatus');
	let btn = document.getElementById('btnSubmitPlayer');
	let name = (nameInput.value || '').trim();

	if(!name) return;

	btn.disabled = true;
	btn.innerText = 'Menghubungkan ke Database...';
	statusEl.className = 'modal-status';
	statusEl.innerText = '';

	try {
		let res = await fetch('/api/game/roulette', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: name })
		});
		let data = await res.json();
		if(data.ok && data.player){
			statusEl.className = 'modal-status success';
			statusEl.innerText = '✓ Selamat datang ' + data.player.name + '! Baki RM ' + data.player.balance + ' dimuatkan.';
			setTimeout(function(){
				setPlayerSession(data.player);
			}, 600);
		} else {
			throw new Error(data.error || 'Gagal menyimpan ke database');
		}
	} catch (err) {
		// Fallback offline / network glitch
		statusEl.className = 'modal-status';
		statusEl.innerText = 'Pangkalan data mod siap sedia: ' + err.message;
		let fallbackPlayer = { id: Date.now(), name: name, balance: 100 };
		setTimeout(function(){
			setPlayerSession(fallbackPlayer);
		}, 800);
	} finally {
		btn.disabled = false;
		btn.innerText = 'MULA MAIN (TERIMA RM 100)';
	}
}

// Auto-check authentication and player profile on load
(async function initPlayerOnLoad(){
	let localData = null;
	try {
		localData = JSON.parse(localStorage.getItem('roulette_player'));
	} catch (e) {}

	try {
		let url = (localData && localData.name)? '/api/game/roulette?name=' + encodeURIComponent(localData.name) : '/api/game/roulette';
		let res = await fetch(url);
		let data = await res.json();
		if(data.ok && data.player){
			setPlayerSession(data.player);
			return;
		}
	} catch (err) {
		console.log('Database init check note:', err);
	}

	if(localData && localData.name){
		setPlayerSession(localData);
	} else {
		showPlayerModal();
	}
})();


// ============================================
// DATABASE & MODAL LOGIK
// ============================================

function showPlayerModal(){
	let m = document.getElementById('loginModal');
	if(m) m.style.display = 'flex';
}

function hidePlayerModal(){
	let m = document.getElementById('loginModal');
	if(m) m.style.display = 'none';
}

function setPlayerSession(player){
	currentPlayer = player;
	localStorage.setItem('roulette_player', JSON.stringify(player));
	bankValue = Number(player.balance != null ? player.balance : 100);

	let hudName = document.getElementById('hudPlayerName');
	let hudBal = document.getElementById('hudPlayerBalance');
	if(hudName) hudName.innerText = player.name || 'Pemain';
	if(hudBal) hudBal.innerText = formatRM(bankValue);

	updateBalances();
	hidePlayerModal();
}

async function syncBalanceToDB(newBal){
	if(!currentPlayer || !currentPlayer.id) return;
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

async function handlePlayerSubmit(e){
	e.preventDefault();
	let nameInput = document.getElementById('playerNameInput');
	let statusEl = document.getElementById('modalStatus');
	let btn = document.getElementById('btnSubmitPlayer');
	let name = (nameInput.value || '').trim();

	if(!name) return;

	btn.disabled = true;
	btn.innerText = 'Menghubungkan ke Database...';
	statusEl.className = 'modal-status';
	statusEl.innerText = '';

	try {
		let res = await fetch('/api/game/roulette', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: name })
		});
		let data = await res.json();
		if(data.ok && data.player){
			statusEl.className = 'modal-status success';
			statusEl.innerText = '✓ Selamat datang ' + data.player.name + '! Baki RM ' + data.player.balance + ' dimuatkan.';
			setTimeout(function(){
				setPlayerSession(data.player);
			}, 600);
		} else {
			throw new Error(data.error || 'Gagal menyimpan ke database');
		}
	} catch (err) {
		// Fallback offline / network glitch
		statusEl.className = 'modal-status';
		statusEl.innerText = 'Pangkalan data mod siap sedia: ' + err.message;
		let fallbackPlayer = { id: Date.now(), name: name, balance: 100 };
		setTimeout(function(){
			setPlayerSession(fallbackPlayer);
		}, 800);
	} finally {
		btn.disabled = false;
		btn.innerText = 'MULA MAIN (TERIMA RM 100)';
	}
}

// Auto-check authentication and player profile on load
(async function initPlayerOnLoad(){
	let localData = null;
	try {
		localData = JSON.parse(localStorage.getItem('roulette_player'));
	} catch (e) {}

	try {
		let url = (localData && localData.name)? '/api/game/roulette?name=' + encodeURIComponent(localData.name) : '/api/game/roulette';
		let res = await fetch(url);
		let data = await res.json();
		if(data.ok && data.player){
			setPlayerSession(data.player);
			return;
		}
	} catch (err) {
		console.log('Database init check note:', err);
	}

	if(localData && localData.name){
		setPlayerSession(localData);
	} else {
		showPlayerModal();
	}
})();
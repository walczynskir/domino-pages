(() => {
  'use strict';
  const G = DominoGame, E = DominoEngine, $ = id => document.getElementById(id);
  const dictionary = {
    pl: {
      language:'Język', theme:'Wygląd', eyebrow:'CHWILA DLA GŁOWY', title:'Twój ruch. Twoje domino.', intro:'Klasyczne kości, Twoje zasady. Zagraj z komputerem do 150 punktów.', new:'Nowa partia', you:'Ty', computer:'Komputer', round:'Runda', target:'do 150 punktów', hand:'Twoje kości', draw:'Dobierz / pas', progress:'TWOJE POSTĘPY', progressTitle:'Małe kroki, dobre partie', progressText:'Każda partia to nowe doświadczenie.', wins:'Wygrane partie', matches:'Rozegrane partie', matchPoints:'Punkty za partie', local:'Postępy zapisujemy tylko na tym urządzeniu.', rulesTitle:'Przy stole', rules:['Po 6 kości. Punkty za otwarte końce o sumie podzielnej przez 5.','Pierwszy dublet rozgałęzia grę. Boczne ramiona po dołożeniu z obu stron.','Brak ruchu? Dobierz najwyżej 2 kości. Pasującą musisz zagrać.','Ostatnie 2 kości w puli są niedostępne.','Reszta przeciwnika zaokrąglana w górę do 5. Remisowa blokada bez punktów za resztę.'], version:'Wersja 0.16.7 · pierwszy podgląd', save:'Automatyczny zapis na urządzeniu', settings:'Ustawienia', starter:'Kolejne rundy zaczyna', alternate:'Na zmianę', winner:'Zwycięzca rundy', tie:'Remisowa blokada: bez punktów za resztę. Wariant alternatywny ustalimy później.', large:'Większy tekst', progressToggle:'Pokazuj postępy', settingNote:'Rozpoczynanie rund ustawiasz dla nowej partii. Kolejną partię otwiera przegrany.', done:'Gotowe', confirm:'Rozpocząć nową partię?', confirmText:'Bieżąca partia zostanie zastąpiona. Zapisane statystyki pozostaną.', cancel:'Wróć do gry', continue:'Następna runda', nextMatch:'Następna partia', thinking:'Komputer wybiera ruch…', select:'Wybierz kość, zamelduj jeśli trzeba i kliknij podświetlony koniec. Możesz też przeciągnąć kość.', noMove:'Nie masz pasującej kości. Dobierz lub spasuj.', forced:'Musisz wyłożyć zaznaczoną pasującą kość.', opening:'Otwórz rundę wybraną kością.', empty:'Wyłóż pierwszą kość', ends:'Otwarte końce', pool:'Pula', available:'dostępne', opponent:'Kości komputera', place:'Dołóż', arms:['Lewo','Prawo','Góra','Dół'], sum:'suma', score:'pkt', blocked:'Blokada', out:'Koniec rundy', tieResult:'Remis — bez punktów za resztę.', remainder:'punkty za resztę', matchWon:'Wygrywasz partię!', matchLost:'Komputer wygrywa partię.', roundWon:'Wygrywasz rundę.', roundLost:'Komputer wygrywa rundę.', badgeFirst:'Pierwsze zwycięstwo', badgeFive:'Pięć zwycięstw', badgeTen:'Dziesięć partii', storage:'Nie udało się zapisać gry. Przeglądarka może blokować zapis.', invalid:'Nie udało się odczytać zapisu — rozpoczęto nową partię.', themes:['Porcelana','Atrament i papier','Szałwia','Pracownia','Forma','Energia','Mandarynka','Ukraina','Wysoki kontrast']
    },
    en: {
      language:'Language', theme:'Appearance', eyebrow:'A MOMENT FOR YOUR MIND', title:'Your turn. Your dominoes.', intro:'Classic tiles, your rules. Play the computer to 150 points.', new:'New game', you:'You', computer:'Computer', round:'Round', target:'first to 150 points', hand:'Your tiles', draw:'Draw / pass', progress:'YOUR PROGRESS', progressTitle:'Small steps, good games', progressText:'Every game brings new experience.', wins:'Games won', matches:'Games played', matchPoints:'Game points', local:'Progress is stored on this device only.', rulesTitle:'At the table', rules:['6 tiles each. Score when exposed ends total a multiple of 5.','The first double is the spinner. Side arms open after both main sides are played.','No move? Draw up to 2 tiles. A matching drawn tile must be played.','The final 2 tiles in the pool are unavailable.','Opponent remainder rounds up to 5. A tied block awards no remainder points.'], version:'Version 0.16.7 · first preview', save:'Automatically saved on this device', settings:'Settings', starter:'Next round starts with', alternate:'Alternating players', winner:'Round winner', tie:'Tied block: no remainder points. An alternative rule will be defined later.', large:'Larger text', progressToggle:'Show progress', settingNote:'Round opening applies to a new game. The loser starts the next game.', done:'Done', confirm:'Start a new game?', confirmText:'This replaces your current game. Your statistics will be kept.', cancel:'Return to game', continue:'Next round', nextMatch:'Next game', thinking:'Computer is choosing a move…', select:'Choose a tile, declare if needed, then click a highlighted end. You can also drag the tile.', noMove:'No matching tile. Draw or pass.', forced:'You must play the indicated matching tile.', opening:'Open the round with a tile.', empty:'Play the first tile', ends:'Open ends', pool:'Pool', available:'available', opponent:'Computer tiles', place:'Place', arms:['Left','Right','Top','Bottom'], sum:'total', score:'pts', blocked:'Blocked round', out:'Round complete', tieResult:'Tie — no remainder points.', remainder:'remainder points', matchWon:'You win the game!', matchLost:'Computer wins the game.', roundWon:'You win the round.', roundLost:'Computer wins the round.', badgeFirst:'First victory', badgeFive:'Five victories', badgeTen:'Ten games', storage:'Could not save the game. Browser storage may be blocked.', invalid:'Could not read the saved game — a new game was started.', themes:['Porcelain','Ink & paper','Sage','Studio','Forma','Energy','Tangerine','Ukraine','High contrast']
    }
  };
  for(const lang of DominoI18n.languages)if(!dictionary[lang])dictionary[lang]=dictionary.en;
  DominoI18n.addLanguages(document.getElementById('language'));
  const themes = ['porcelain','ink','sage','studio','forma','energy','tangerine','ukraine','contrast'];
  const key = 'domino-save-v1';
  let prefs = { language:'pl', theme:'porcelain', large:false, progress:true, starter:'alternate', previousTheme:'porcelain', mustDraw:true, requireDeclaration:true, history:false, openingDoublesOnly:true, declarationPenalty:'three', aiDifficulty:'medium' };
  let stats = { matches:0, wins:0, points:0, opponentPoints:0 }, state, selected = null, declaredMove = null, timer = null, storageProblem = false;
  let boardZoom=1, pendingDrop=null;
  let viewZoom = null, drag = null, boardKey = null, draggedTile = null, tileDrag = null, suppressTileClickUntil = 0;
  const tr = name => dictionary[prefs.language][name];
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.version !== 1 || !saved.state || saved.state.version !== 1) throw new Error('Version');
      if (!Array.isArray(saved.state.hands) || saved.state.hands.length !== 2 || !Array.isArray(saved.state.pool) || !Array.isArray(saved.state.scores)) throw new Error('State');
      state = saved.state; prefs = { ...prefs, ...saved.prefs }; stats = { ...stats, ...saved.stats };
    }
  } catch { storageProblem = true; }
  if (!dictionary[prefs.language]) prefs.language = 'pl';
  if (!themes.includes(prefs.theme)) prefs.theme = 'porcelain';
  if (!themes.includes(prefs.previousTheme) || prefs.previousTheme === 'contrast') prefs.previousTheme = 'porcelain';
  if (!['alternate','winner'].includes(prefs.starter)) prefs.starter = 'alternate';
  if (!state) state = G.create(Math.random, null, { roundStarter:prefs.starter, mustDraw:prefs.mustDraw,requireDeclaration:prefs.requireDeclaration,aiDifficulty:prefs.aiDifficulty,declarationPenalty:prefs.declarationPenalty,openingDoublesOnly:prefs.openingDoublesOnly });
  state.settings.mustDraw = state.settings.mustDraw !== false;
  state.settings.requireDeclaration = state.settings.requireDeclaration !== false;
  state.settings.openingDoublesOnly = state.settings.openingDoublesOnly !== false;
  if (!['easy','medium','hard'].includes(state.settings.aiDifficulty)) state.settings.aiDifficulty = 'medium';
  prefs.aiDifficulty = state.settings.aiDifficulty;
  state.settings.declarationPenalty ||= 'three';
  state.declarationErrors ||= [0,0];
  prefs.declarationPenalty = state.settings.declarationPenalty;
  state.scores = state.scores.map(score => Math.min(150, score));
  for (const round of state.roundHistory || []) if (round.scores) round.scores = round.scores.map(score => Math.min(150, score));
  G.repairEmptyHandTie(state);
  function save() {
    try { localStorage.setItem(key, JSON.stringify({ version:1, state, prefs, stats })); storageProblem = false; }
    catch { storageProblem = true; }
  }
  const positions = { 0:[], 1:[4], 2:[0,8], 3:[0,4,8], 4:[0,2,6,8], 5:[0,2,4,6,8], 6:[0,2,3,5,6,8] };
  function tileNode(tile, interactive = false, vertical = false) {
    const node = document.createElement(interactive ? 'button' : 'span');
    node.className = 'tile' + (vertical ? ' vertical' : '');
    const name = `${tile.a}–${tile.b}`;
    node.setAttribute('aria-label', name); node.title = name;
    const lastPlayed = state.events.findLast(event => event.id);
    if (!interactive && lastPlayed?.id === tile.id) {
      node.classList.add('last-played');
      const description = `${name} · ${prefs.language === 'pl' ? 'ostatnio wyłożona kość' : 'last tile played'}`;
      node.setAttribute('aria-label', description); node.title = description;
    }
    if (!interactive) node.setAttribute('role','img');
    for (const value of [tile.a, tile.b]) {
      const half = document.createElement('span'); half.className = 'half'; half.setAttribute('aria-hidden','true');
      for (let n = 0; n < 9; n++) { const dot = document.createElement('span'); if (positions[value].includes(n)) dot.className = 'dot'; half.append(dot); }
      node.append(half);
    }
    return node;
  }
  function labels() {
    document.documentElement.lang = prefs.language;
    document.documentElement.dataset.theme = prefs.theme;
    document.body.classList.toggle('large', prefs.large);
    const map = { 'language-label':'language','theme-label':'theme','new-game':'new','you-label':'you','computer-label':'computer',target:'target','hand-label':'hand',draw:'draw','progress-label':'progress','progress-title':'progressTitle','progress-text':'progressText','wins-label':'wins','matches-label':'matches','match-points-label':'matchPoints','local-note':'local','rules-title':'rulesTitle',version:'version','save-note':'save','settings-title':'settings','starter-label':'starter','alternate-option':'alternate','winner-option':'winner','tie-note':'tie','large-label':'large','progress-toggle-label':'progressToggle','setting-note':'settingNote',done:'done','confirm-title':'confirm','confirm-text':'confirmText',cancel:'cancel','confirm-new':'new' };
    for (const [id, name] of Object.entries(map)) $(id).textContent = tr(name);
    document.querySelector('.board-zoom-controls').setAttribute('aria-label',prefs.language==='pl'?'Powiększenie planszy':'Board zoom');
    $('table').setAttribute('aria-label',prefs.language==='pl'?'Plansza domino':'Domino board');
    $('zoom-out').setAttribute('aria-label',prefs.language==='pl'?'Pomniejsz planszę o 10%':'Zoom out by 10%');
    $('zoom-in').setAttribute('aria-label',prefs.language==='pl'?'Powiększ planszę o 10%':'Zoom in by 10%');
    $('drop-title').textContent=prefs.language==='pl'?'Jak dołożyć kość?':'How do you want to place the tile?';
    $('drop-note').textContent=prefs.language==='pl'?'Wybierz meldunek przed zatwierdzeniem ruchu. To jeszcze nie jest dołożenie.':'Choose your declaration before confirming the move. The tile has not been placed yet.';
    $('drop-plain').textContent=prefs.language==='pl'?'Dołóż bez meldunku':'Place without declaring';
    $('drop-declare').textContent=prefs.language==='pl'?'Melduję i dokładam':'Declare and place';
    $('drop-cancel').textContent=tr('cancel');
    $('help-button').textContent = prefs.language === 'pl' ? 'Jak grać?' : DominoI18n.text('How to play',prefs.language);
    $('credits-link').textContent = prefs.language === 'pl' ? 'Autorzy i licencje' : 'Credits and licenses';
    $('credits-link').href = `credits.html?lang=${prefs.language}`;
    $('settings-button').setAttribute('aria-label',tr('settings'));
    $('settings').querySelector('.dialog-heading button').setAttribute('aria-label',tr('done'));
    const rules = tr('rules').slice();
    if (state.settings.mustDraw === false) rules[2] = prefs.language === 'pl' ? 'Brak ruchu? Możesz dobrać do 2 kości lub spasować. Pasującą dobraną kość musisz zagrać.' : 'No move? Draw up to 2 tiles or pass. A matching drawn tile must be played.';
    $('rules').replaceChildren(...rules.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
    $('theme').replaceChildren(...themes.filter(value => value !== 'contrast').map((value, i) => { const option = document.createElement('option'); option.value = value; option.textContent = tr('themes')[i]; return option; }));
    $('theme').value = prefs.theme === 'contrast' ? prefs.previousTheme : prefs.theme;
    $('contrast').textContent = prefs.language === 'pl' ? '◐ Kontrast' : '◐ Contrast';
    $('contrast').setAttribute('aria-label',prefs.language === 'pl' ? 'Wysoki kontrast' : 'High contrast');
    $('large-label').textContent = 'A+';
    $('large').setAttribute('aria-label',tr('large'));
    $('large').closest('label').title = tr('large');
    $('contrast').setAttribute('aria-pressed', String(prefs.theme === 'contrast'));
    document.querySelector('meta[name="theme-color"]').content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(); $('language').value = prefs.language;
    $('difficulty-label').textContent = prefs.language === 'pl' ? 'Poziom komputera' : 'Computer skill';
    $('difficulty').value = state.settings.aiDifficulty;
    for (const [value,pl,en] of [['easy','Początkujący','Beginner'],['medium','Średni','Intermediate'],['hard','Zaawansowany','Advanced']]) $('difficulty').querySelector(`[value="${value}"]`).textContent = prefs.language === 'pl' ? pl : en;
    $('difficulty-note').textContent = prefs.language === 'pl' ? 'Początkujący gra swobodniej, średni czasem przeoczy lepszy ruch, zaawansowany najmocniej szuka punktów. Zmiana działa od następnego ruchu komputera.' : 'Beginner plays more casually, intermediate sometimes misses a better move, advanced prioritizes scoring most strongly. Applies to the next computer move.';
    $('require-declaration').checked = !state.settings.requireDeclaration;
    $('declaration-penalty').disabled = !state.settings.requireDeclaration;
    $('declaration-label').textContent = prefs.language === 'pl' ? 'Automatyczne meldowanie' : 'Automatic declarations';
    $('declaration-note').textContent = prefs.language === 'pl' ? (state.settings.requireDeclaration ? 'Wyłączone: meldujesz sam przed dołożeniem. Po zapomnianym meldunku zobaczysz informację o utraconych punktach. Błędny meldunek liczy się po wyłożeniu kości; licznik zeruje się w nowej partii.' : 'Włączone: punkty naliczają się automatycznie, bez meldowania i bez kar za błędne meldunki. Dobry wybór na początek.') : (state.settings.requireDeclaration ? 'Off: declare before placing a tile. A reminder after the move shows any points lost. False declarations count after placement; the counter resets in a new game.' : 'On: points are awarded automatically, with no declarations or false declaration penalties. A good choice for beginners.');
    $('penalty-label').textContent = prefs.language === 'pl' ? 'Kara za błędny meldunek' : 'False declaration penalty';
    $('declaration-penalty').value = state.settings.declarationPenalty;
    for (const [value,pl,en] of [['none','Bez kary','No penalty'],['five','Odejmij 5 punktów','Deduct 5 points'],['three','3 błędy = przegrana partia','3 errors = game lost']]) $('declaration-penalty').querySelector(`[value="${value}"]`).textContent = prefs.language === 'pl' ? pl : en;
    $('declaration-errors').hidden = !state.settings.requireDeclaration || state.settings.declarationPenalty === 'none';
    const errors = state.declarationErrors[0];
    $('declaration-errors').textContent = prefs.language === 'pl' ? `Błędne meldunki: ${errors} ${state.settings.declarationPenalty === 'three' ? '/ 3 · ' + '⚠'.repeat(Math.min(3,errors)) + '○'.repeat(Math.max(0,3-errors)) : '· kara −5 pkt'}${errors === 2 && state.settings.declarationPenalty === 'three' && state.matchWinner === null ? ' · Następny błąd oznacza przegraną!' : ''}` : `False declarations: ${errors}${state.settings.declarationPenalty === 'three' ? ' / 3' : ' · −5 points'}${errors === 2 && state.settings.declarationPenalty === 'three' && state.matchWinner === null ? ' · Next error loses the game!' : ''}`;
    $('declaration-errors').title = $('declaration-errors').textContent;
    $('declaration-errors').setAttribute('aria-label',$('declaration-errors').textContent);
    $('declaration-errors').textContent = '⚠ ' + errors + (state.settings.declarationPenalty === 'three' ? '/3' : '');
    $('declaration-errors').classList.toggle('penalty-warning',errors >= 2);
    $('penalty-note').hidden = !state.settings.requireDeclaration || state.settings.declarationPenalty !== 'five';
    $('penalty-note').textContent = DominoI18n.text('After the penalty, your score cannot be lower than 0.',prefs.language);
    $('must-draw').checked = state.settings.mustDraw;
    $('must-draw-label').textContent = prefs.language === 'pl' ? 'Obowiązkowe dobieranie' : 'Mandatory drawing';
    $('must-draw-note').textContent = prefs.language === 'pl' ? 'Przy braku ruchu musisz dobrać do 2 kości. Wyłączenie pozwala spasować bez dobierania. Zmiana działa od razu.' : 'Without a move, draw up to 2 tiles. Turn off to allow passing without drawing. Applies immediately.';
    $('opening-doubles-only').checked = state.settings.openingDoublesOnly;
    $('opening-rule-label').textContent = prefs.language === 'pl' ? 'Otwarcie punktuje tylko dubletem (5–5)' : 'Opening scores only with a double (5–5)';
    $('history-toggle').checked = prefs.history === true;
    $('history-toggle-label').textContent = prefs.language === 'pl' ? 'Historia rozgrywki' : 'Game history';
    $('history-title').textContent = prefs.language === 'pl' ? 'Historia rozgrywki' : 'Game history';
    $('history-note').textContent = prefs.language === 'pl' ? 'Jawne ruchy i liczba dobranych kości. Najnowsze zdarzenia na górze.' : 'Public moves and draw counts. Latest events first.';
    $('starter').value = prefs.starter; $('large').checked = prefs.large; $('progress-toggle').checked = prefs.progress;
    $('progress-label').closest('section').hidden = !prefs.progress;
  }
  function drawBoard() {
    const board = $('board'); board.replaceChildren();
    if (!state.board) { board.style.width='250px';board.style.height='72px';const message = document.createElement('div'); message.className='empty-table'; message.textContent=state.turn === 0 ? tr('empty') : DominoI18n.text('Computer is starting the round…',prefs.language); board.append(message); return; }
    const layout=DominoBoardView.layout(state.board);
    board.style.width=`${layout.width}px`;board.style.height=`${layout.height}px`;
    for(const item of layout.tiles){
      const node=tileNode(item.tile,false,item.vertical);
      Object.assign(node.style,{position:'absolute',left:`${item.x}px`,top:`${item.y}px`,width:`${item.width}px`,height:`${item.height}px`});
      if(state.board.spinner && item.arm === null){node.classList.add('spinner-tile');node.title += ' · '+DominoI18n.text('Spinner tile',prefs.language);node.setAttribute('aria-label',node.title);}
      node.dataset.tileId = item.tile.id;
      board.append(node);
    }
  }
  function selectedMoves() {
    return state.turn === 0 ? G.legal(state).filter(move=>move.id===selected) : [];
  }
  function playSelected(arm) {
    if(!selectedMoves().some(move=>move.arm===arm)) return;
    releaseBoardPan();
    G.play(state,selected,arm,declaredMove === selected);
    selected=null;declaredMove=null;draggedTile=null;
    render();schedule();
  }
  function renderChoices() {
    const choices=$('choices');choices.replaceChildren();
    const moves=selectedMoves();
    if(!moves.length) return;
    if(state.settings.requireDeclaration) {
      const declaration=document.createElement('button');declaration.className='declaration';
      declaration.textContent=prefs.language==='pl'?(declaredMove===selected?'✓ Melduję':'Melduję'):(declaredMove===selected?'✓ Declared':'Declare');
      declaration.setAttribute('aria-pressed',String(declaredMove===selected));
      declaration.onclick=()=>{declaredMove=declaredMove===selected?null:selected;renderChoices();$('choices').querySelector('.declaration')?.focus({preventScroll:true});};
      choices.append(declaration);
    }
    for(const move of moves) {
      const button=document.createElement('button');
      button.textContent=state.board?`${tr('place')}: ${tr('arms')[move.arm]} · ${G.tip(state.board,move.arm)}`:tr('place');
      button.onclick=()=>playSelected(move.arm);choices.append(button);
    }
    DominoI18n.apply(choices,prefs.language);
  }
  function renderTargets() {
    const layer=$('placement-targets');layer.replaceChildren();
    for(const node of $('board').querySelectorAll('.tile')) {
      node.classList.remove('legal-end');delete node.dataset.placeArm;node.onclick=null;node.tabIndex=-1;node.setAttribute('role','img');
      node.setAttribute('aria-label',node.title);
    }
    const moves=selectedMoves();if(!moves.length) return;
    const table=$('table'), bounds=table.getBoundingClientRect(), board=$('board');
    const boardBounds=board.getBoundingClientRect();
    const scale=boardBounds.width/Math.max(1,board.offsetWidth);
    const layout=state.board?DominoBoardView.layout(state.board):null;
    const roots=layout?layout.tiles.filter(item=>item.arm===null):[];
    const clickNodes=new Map();
    for(const move of moves) {
      let x=table.clientWidth/2,y=table.clientHeight/2,terminal=null,screenDirection=null;
      if(layout) {
        terminal=layout.tiles.filter(item=>item.arm===move.arm).at(-1)||roots[0];
        // At zoom, hide markers only when their tile is outside the viewport.
        const tileLeft = boardBounds.left - bounds.left + terminal.x * scale;
        const tileTop = boardBounds.top - bounds.top + terminal.y * scale;
        if (boardZoom > 1 && (
          tileLeft >= table.clientWidth || tileTop >= table.clientHeight ||
          tileLeft + terminal.width * scale <= 0 || tileTop + terminal.height * scale <= 0
        )) continue;
        const direction=terminal.direction||[[-1,0],[1,0],[0,-1],[0,1]][move.arm];screenDirection=direction;
        x=boardBounds.left-bounds.left+(terminal.x+terminal.width/2)*scale+direction[0]*(terminal.width*scale/2+19);
        y=boardBounds.top-bounds.top+(terminal.y+terminal.height/2)*scale+direction[1]*(terminal.height*scale/2+19);
        const list=clickNodes.get(terminal.tile.id)||[];list.push(move.arm);clickNodes.set(terminal.tile.id,list);
      }
      const target=document.createElement('button');target.className='placement-target';target.dataset.placeArm=move.arm;
      target.textContent=screenDirection?(screenDirection[0]<0?'←':screenDirection[0]>0?'→':screenDirection[1]<0?'↑':'↓'):'+';
      target.setAttribute('aria-label',state.board?`${tr('place')}: ${tr('arms')[move.arm]}`:tr('place'));
      target.title=target.getAttribute('aria-label');
      const toolbar=document.querySelector('.board-zoom-controls').getBoundingClientRect();
      const px=Math.min(table.clientWidth-22,Math.max(22,x));
      let py=Math.min(table.clientHeight-22,Math.max(22,y));
      if(px+22>toolbar.left-bounds.left && py+22>toolbar.top-bounds.top)py=Math.max(22,toolbar.top-bounds.top-26);
      target.style.left=`${px}px`;target.style.top=`${py}px`;
      target.onclick=()=>playSelected(move.arm);layer.append(target);
    }
    for(const node of board.querySelectorAll('.tile')) {
      const arms=clickNodes.get(node.dataset.tileId);if(!arms)continue;
      node.classList.add('legal-end');
      if(arms.length===1) {
        node.tabIndex=0;node.setAttribute('role','button');node.dataset.placeArm=arms[0];node.onclick=()=>playSelected(arms[0]);
        node.setAttribute('aria-label',`${node.title} · ${tr('place')}: ${tr('arms')[arms[0]]}`);
      }
    }
  }
  function recordResult() {
    if (state.matchWinner === null || state.recorded) return;
    stats.matches++; if (state.matchWinner === 0) { stats.wins++; stats.points += E.matchPoints(state.scores[1]); } else { stats.opponentPoints += E.matchPoints(state.scores[0]); }
    state.recorded = true;
  }
  function fitBoard() {
    const board = $('board'), table = $('table');
    const baseScale=DominoBoardView.fitScale(board.offsetWidth,board.offsetHeight,table.clientWidth,table.clientHeight);
    if(boardZoom>1 && !viewZoom)viewZoom={scale:baseScale*boardZoom,x:0,y:0,persistent:true};
    if(viewZoom?.persistent)viewZoom.scale=baseScale*boardZoom;
    table.classList.toggle('zoomed', !!viewZoom);
    $('zoom-out').disabled=boardZoom<=1;$('zoom-in').disabled=boardZoom>=2;
    if (viewZoom) {
      const limitX = viewZoom.persistent?Math.max(0,(board.offsetWidth*viewZoom.scale-table.clientWidth)/2+16):Math.max(0,board.offsetWidth*viewZoom.scale/2-32);
      const limitY = viewZoom.persistent?Math.max(0,(board.offsetHeight*viewZoom.scale-table.clientHeight)/2+16):Math.max(0,board.offsetHeight*viewZoom.scale/2-32);
      viewZoom.x = Math.max(-limitX, Math.min(limitX, viewZoom.x));
      viewZoom.y = Math.max(-limitY, Math.min(limitY, viewZoom.y));
      board.style.transform = `translate(-50%, -50%) translate(${viewZoom.x}px, ${viewZoom.y}px) scale(${viewZoom.scale})`;
    } else {
      const scale = baseScale;
      board.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
    renderTargets();
    DominoI18n.apply($('table'),prefs.language);
  }
  function releaseBoardPan() {
    const pointerId=drag?.id;
    drag=null;if(!viewZoom?.persistent)viewZoom=null;$('table').classList.remove('dragging');
    if (pointerId !== undefined && $('table').hasPointerCapture(pointerId)) $('table').releasePointerCapture(pointerId);
    fitBoard();
  }
  function enableBoardInteraction() {
    const last = state.events.findLast(event => event.id);
    const nextKey = `${state.round}:${last?.id || ''}`;
    if (nextKey !== boardKey) { viewZoom = null; drag = null; boardKey = nextKey; }
    for (const node of $('board').querySelectorAll('.tile')) {
      node.tabIndex = -1; node.setAttribute('role', 'img');
      node.onkeydown = event => { if(event.key==='Enter'||event.key===' ')event.preventDefault(); };
      node.onkeyup = event => { if(node.dataset.placeArm!==undefined && (event.key==='Enter'||event.key===' ')){event.preventDefault();playSelected(Number(node.dataset.placeArm));} };

    }
    fitBoard();
  }
  function renderHistory() {
    $('history-panel').hidden = prefs.history !== true;
    $('history-rounds').replaceChildren();
    if (!prefs.history) return;
    const rounds = [{ round:state.round, starter:state.roundStarter, events:state.events, result:state.roundResult, current:true }, ...(state.roundHistory || []).slice().reverse()];
    for (const round of rounds) {
      const section = document.createElement('details'); section.open = !!round.current;
      const summary = document.createElement('summary'); summary.textContent = `${tr('round')} ${round.round}`; section.append(summary);
      const list = document.createElement('ol');
      const messages = round.events.map(event => DominoHistory.eventText(event,prefs.language)).filter(Boolean);
      const result = DominoHistory.resultText(round.result,prefs.language);
      if (result) messages.push(result);
      if (round.current && state.matchWinner !== null) messages.push(tr(state.matchWinner === 0 ? 'matchWon' : 'matchLost'));
      const starter = tr(round.starter === 0 ? 'you' : 'computer');
      messages.unshift(prefs.language === 'pl' ? `Rozpoczyna: ${starter}.` : `Starts: ${starter}.`);
      for (const message of messages.reverse()) { const item = document.createElement('li'); item.textContent = message; list.append(item); }
      section.append(list); $('history-rounds').append(section);
    }
  }
  function balanceHand(id) {
    const hand=$(id), tiles=[...hand.querySelectorAll('.back,.tile')];
    if(!tiles.length){hand.replaceChildren();return;}
    const size=parseFloat(getComputedStyle(tiles[0]).width);
    const capacity=Math.max(1,Math.floor((hand.clientWidth-4+6)/(size+6)));
    const rows=Math.ceil(tiles.length/capacity), base=Math.floor(tiles.length/rows), extra=tiles.length%rows;
    const fragment=document.createDocumentFragment();let offset=0;
    for(let i=0;i<rows;i++){const row=document.createElement('div');row.className=id==='opponent-hand'?'opponent-row':'player-row';const count=base+(i<extra?1:0);row.append(...tiles.slice(offset,offset+count));offset+=count;fragment.append(row);}
    hand.replaceChildren(fragment);
  }
  function render() {
    const poolTray = document.querySelector('.pool-tray');
    const computerSide = state.roundStarter === 0;
    const poolAnchor = computerSide ? $('table') : $('table').nextSibling;
    if (poolAnchor !== poolTray) $('table').parentNode.insertBefore(poolTray,poolAnchor);
    poolTray.classList.toggle('pool-above',computerSide);
    recordResult(); labels(); renderHistory(); drawBoard(); enableBoardInteraction();
    $('round').textContent = `${tr('round')} ${state.round}`;
    $('you-score').textContent = state.scores[0]; $('computer-score').textContent = state.scores[1];
    $('opponent-count').textContent = `${tr('opponent')}: ${state.hands[1].length}`;
    // Summarize only the latest computer turn, without revealing drawn tile values.
    let computerDraws = 0;
    const lastComputer = state.events.findLastIndex(event => event.player === 1);
    for (let i = lastComputer; i >= 0 && state.events[i].player === 1; i--) computerDraws += state.events[i].drawn || 0;
    $('computer-draw').hidden = !computerDraws;
    $('computer-draw').textContent = computerDraws ? DominoI18n.text('Computer drew tiles',prefs.language) + ': ' + computerDraws : '';
    const latestComputerEvent = state.events[lastComputer];
    const highlightedDraws = latestComputerEvent && !latestComputerEvent.id && state.turn === 1 ? computerDraws : 0;
    const revealRemainder = state.roundResult?.winner === 0 && state.roundResult.points > 0;
    $('opponent-hand').setAttribute('aria-hidden', String(!revealRemainder));
    $('opponent-hand').classList.toggle('revealed', revealRemainder);
    if (revealRemainder) $('opponent-count').textContent += prefs.language === 'pl' ? ' · reszta dla Ciebie' : ' · your remainder bonus';
    $('opponent-hand').replaceChildren(...state.hands[1].map((tile, index) => {
      if (revealRemainder) return tileNode(tile, false, false);
      const el = document.createElement('span'); el.className='back' + (index >= state.hands[1].length - highlightedDraws ? ' computer-drawn' : ''); return el;
    }));
    balanceHand('opponent-hand');
    const available = Math.max(0,state.pool.length-2);
    $('pool-tiles').style.setProperty('--pool-columns', 'repeat(14, minmax(0, 26px)) 52px');
    $('pool-tiles').style.setProperty('--pool-start',String(15-available));
    $('pool-tiles').setAttribute('aria-label', prefs.language === 'pl' ? `${available} kości do dobrania, 2 niedostępne` : `${available} drawable tiles, 2 unavailable`);
    const poolBacks = state.pool.map((_,index)=>{const back=document.createElement('span');back.className='back pool-back'+(index>=available?' reserved':'');back.setAttribute('aria-hidden','true');return back;});
    const reservedStack = document.createElement('span');
    reservedStack.className = 'reserved-stack';
    reservedStack.setAttribute('aria-hidden','true');
    reservedStack.replaceChildren(...poolBacks.slice(available));
    $('pool-tiles').replaceChildren(...poolBacks.slice(0,available), reservedStack);
    const moves = G.legal(state), active = state.turn === 0 && !state.roundResult && state.matchWinner === null;
    $('hand').replaceChildren(...state.hands[0].map(tile => {
      const node = tileNode(tile,true,false), playable = active && moves.some(m => m.id === tile.id);
      node.disabled = !playable; node.classList.toggle('playable',playable); node.classList.toggle('selected',selected === tile.id || (!selected && state.lastDrawn?.[0] === tile.id)); node.setAttribute('aria-pressed',String(selected === tile.id));
      node.onclick = event => { if(performance.now()<suppressTileClickUntil)return; if(state.lastDrawn) state.lastDrawn[0]=null; declaredMove = null; selected = selected === tile.id ? null : tile.id; render(); if(event.detail===0){if(selected)$('choices').querySelector('button')?.focus();else document.querySelector(`[data-hand-tile="${tile.id}"]`)?.focus();} };
      node.dataset.handTile=tile.id;
      node.draggable=false;
      return node;
    }));
    balanceHand('hand');
    renderChoices();
    let message;
    if (state.matchWinner !== null) {const points=E.matchPoints(state.scores[1-state.matchWinner]);message=prefs.language==='pl'?`${tr(state.matchWinner===0?'matchWon':'matchLost')} ${points} pkt za partię.`:`${tr(state.matchWinner===0?'matchWon':'matchLost')} ${tr('matchPoints')}: ${points}.`;}
    else if (state.roundResult) {
      const result = state.roundResult;
      message = result.winner === null ? tr('tieResult') : `${tr(result.winner === 0 ? 'roundWon':'roundLost')} +${result.points} ${tr('remainder')}.`;
    } else if (state.turn === 1) message = tr('thinking');
    else if (!moves.length) message = prefs.language === 'pl' ? (state.pool.length <= 2 ? 'Nie masz pasującej kości. Brak dostępnych kości — pas.' : state.settings.mustDraw ? (state.drawnThisTurn === 1 ? 'Pierwsza dobrana kość nie pasuje. Dobierz drugą.' : 'Nie masz pasującej kości. Dobierz jedną kość.') : 'Nie masz pasującej kości. Możesz dobrać kości lub spasować.') : (state.pool.length <= 2 ? 'No matching tile. No available tiles — pass.' : state.settings.mustDraw ? (state.drawnThisTurn === 1 ? 'The first drawn tile does not fit. Draw a second tile.' : 'No matching tile. Draw one tile.') : 'No matching tile. Draw tiles or pass.');
    else if (state.forced) message = tr('forced');
    else message = tr(state.board ? 'select':'opening');
    const last = state.events.findLast(event => event.id);
    $('last-move').hidden = !last;
    if (last) {
      const player = tr(last.player === 0 ? 'you' : 'computer');
      const prefix = prefs.language === 'pl' ? 'Ostatnie dołożenie' : 'Last tile played';
      const points = last.missedPoints ? (prefs.language === 'pl' ? `brak meldunku — utracone ${last.missedPoints} pkt` : `not declared — ${last.missedPoints} points lost`) : last.points ? `+${last.points} ${tr('score')}` : (prefs.language === 'pl' ? 'bez punktów' : 'no points');
      $('last-move').textContent = `${prefix}: ${player} · ${last.id.replace('-', '–')} · ${points}.`;
    }
    const lastHumanMove = state.events.findLast(event => event.id && event.player === 0);
    $('declaration-feedback').hidden = !lastHumanMove?.missedPoints;
    $('declaration-feedback').textContent = lastHumanMove?.missedPoints ? (prefs.language === 'pl' ? `Zapomniałeś zameldować — tracisz ${lastHumanMove.missedPoints} pkt.` : `You forgot to declare — ${lastHumanMove.missedPoints} points lost.`) : '';
    if (state.matchEndReason === 'false-declarations') message += prefs.language === 'pl' ? ' Przegrana za trzy błędne meldunki.' : ' Forfeit after three false declarations.';
    if (lastHumanMove?.falseDeclaration) {
      $('declaration-feedback').hidden = false;
      $('declaration-feedback').textContent = prefs.language === 'pl' ? `Błędny meldunek — ten ruch nie daje punktów.${lastHumanMove.deducted ? ` Kara: −${lastHumanMove.deducted} pkt.` : ''}` : `False declaration — this move scores no points.${lastHumanMove.deducted ? ` Penalty: −${lastHumanMove.deducted} points.` : ''}`;
    }
    $('status').textContent = message;
    $('draw').disabled = !active || moves.length > 0;
    $('draw').textContent = state.pool.length > 2 ? (prefs.language === 'pl' ? (state.drawnThisTurn === 1 ? 'Dobierz drugą kość' : 'Dobierz kość') : (state.drawnThisTurn === 1 ? 'Draw second tile' : 'Draw tile')) : 'Pas';
    if (prefs.language === 'en' && state.pool.length <= 2) $('draw').textContent = 'Pass';
    $('optional-pass').hidden = !active || moves.length > 0 || state.pool.length <= 2 || state.settings.mustDraw !== false;
    $('optional-pass').textContent = prefs.language === 'pl' ? 'Pas bez dobierania' : 'Pass without drawing';

    $('continue').hidden = !state.roundResult && state.matchWinner === null;
    $('continue').textContent = tr(state.matchWinner !== null ? 'nextMatch':'continue');
    $('match-total').textContent = prefs.language === 'pl' ? `Partie · Ty ${stats.points} : ${stats.opponentPoints} Komputer` : `Games · You ${stats.points} : ${stats.opponentPoints} Computer`;
    $('wins').textContent = stats.wins; $('matches').textContent = stats.matches; $('match-points').textContent = stats.points;
    $('badges').replaceChildren(...[[stats.wins>=1,'badgeFirst'],[stats.wins>=5,'badgeFive'],[stats.matches>=10,'badgeTen']].filter(([ok])=>ok).map(([,label])=>{const badge=document.createElement('span');badge.className='badge';badge.textContent=tr(label);return badge;}));
    save(); if (storageProblem) $('save-note').textContent=tr('storage');
    DominoI18n.apply(document.body,prefs.language);
  }
  function schedule() {
    clearTimeout(timer);
    if (state.turn !== 1 || state.roundResult || state.matchWinner !== null) return;
    timer = setTimeout(() => {
      const move = G.choose(state);
      if (move) G.play(state,move.id,move.arm,move.declared); else G.draw(state);
      render(); schedule();
    },state.events.at(-1)?.player === 1 && state.events.at(-1)?.drawn > 0 ? 1300 : 700);
  }
  $('draw').onclick=()=>{if(state.pool.length>2)G.draw(state);else G.pass(state);selected=null;declaredMove=null;render();schedule();};
  $('optional-pass').onclick=()=>{G.pass(state);selected=null;declaredMove=null;render();schedule();};
  $('opening-doubles-only').onchange=e=>{prefs.openingDoublesOnly=e.target.checked;state.settings.openingDoublesOnly=prefs.openingDoublesOnly;render();};
  $('difficulty').onchange=e=>{prefs.aiDifficulty=e.target.value;state.settings.aiDifficulty=prefs.aiDifficulty;render();};
  $('require-declaration').onchange=e=>{prefs.requireDeclaration=!e.target.checked;state.settings.requireDeclaration=prefs.requireDeclaration;declaredMove=null;render();};
  $('declaration-penalty').onchange=e=>{prefs.declarationPenalty=e.target.value;state.settings.declarationPenalty=prefs.declarationPenalty;render();};
  $('must-draw').onchange=e=>{prefs.mustDraw=e.target.checked;state.settings.mustDraw=prefs.mustDraw;render();};
  $('continue').onclick=()=>{clearTimeout(timer);if(state.matchWinner!==null){state=G.nextMatch(state);state.settings.roundStarter=prefs.starter;state.settings.aiDifficulty=prefs.aiDifficulty;state.settings.declarationPenalty=prefs.declarationPenalty;state.settings.mustDraw=prefs.mustDraw;state.settings.requireDeclaration=prefs.requireDeclaration;state.settings.openingDoublesOnly=prefs.openingDoublesOnly;}else G.nextRound(state);selected=null;declaredMove=null;render();schedule();};
  $('new-game').onclick=()=>$('confirm').showModal();
  $('cancel').onclick=()=>$('confirm').close();
  $('confirm-new').onclick=()=>{clearTimeout(timer);const starter=state.matchWinner===null?null:1-state.matchWinner;state=G.create(Math.random,starter,{roundStarter:prefs.starter,mustDraw:prefs.mustDraw,requireDeclaration:prefs.requireDeclaration,aiDifficulty:prefs.aiDifficulty,declarationPenalty:prefs.declarationPenalty,openingDoublesOnly:prefs.openingDoublesOnly});selected=null;declaredMove=null;$('confirm').close();render();schedule();};
  $('help-button').onclick=()=>{clearTimeout(timer);DominoHelp.open(prefs.language,schedule);};
  for (const button of document.querySelectorAll('.setting-info')) button.onclick=()=>{const expanded=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!expanded));$(button.getAttribute('aria-controls')).hidden=expanded;};
  $('settings-button').onclick=()=>$('settings').showModal();
  $('language').onchange=e=>{prefs.language=e.target.value;render();};
  $('theme').onchange=e=>{prefs.theme=e.target.value;prefs.previousTheme=prefs.theme;render();};
  $('contrast').onclick=()=>{if(prefs.theme==='contrast')prefs.theme=prefs.previousTheme;else{prefs.previousTheme=prefs.theme;prefs.theme='contrast';}render();};
  $('large').onchange=e=>{prefs.large=e.target.checked;render();};
  $('history-toggle').onchange=e=>{prefs.history=e.target.checked;render();};
  $('progress-toggle').onchange=e=>{prefs.progress=e.target.checked;render();};
  $('starter').onchange=e=>{prefs.starter=e.target.value;save();};
  function changeBoardZoom(value) {
    const old=boardZoom;boardZoom=Math.max(1,Math.min(2,Math.round(value*10)/10));
    const previous=viewZoom;
    releaseBoardPan();
    viewZoom=boardZoom>1?{scale:1,x:(previous?.persistent?previous.x:0)*boardZoom/old,y:(previous?.persistent?previous.y:0)*boardZoom/old,persistent:true}:null;
    fitBoard();
  }
  $('zoom-in').onclick=()=>changeBoardZoom(boardZoom+.1);
  $('zoom-out').onclick=()=>changeBoardZoom(boardZoom-.1);
  function confirmDroppedTile(arm) {
    if(!state.settings.requireDeclaration || declaredMove===selected){playSelected(arm);return;}
    pendingDrop={id:selected,arm};
    $('drop-tile').textContent=`${selected.replace('-', '–')} · ${state.board?tr('arms')[arm]:tr('opening')}`;
    DominoI18n.apply($('drop-confirm'),prefs.language);
    $('drop-confirm').showModal();
  }
  function finishDroppedTile(declare) {
    const move=pendingDrop;pendingDrop=null;$('drop-confirm').close();
    if(!move || !G.legal(state).some(m=>m.id===move.id&&m.arm===move.arm))return;
    selected=move.id;declaredMove=declare?selected:null;playSelected(move.arm);
  }
  $('drop-plain').onclick=()=>finishDroppedTile(false);
  $('drop-declare').onclick=()=>finishDroppedTile(true);
  $('drop-cancel').onclick=()=>$('drop-confirm').close();
  $('drop-confirm').onclose=()=>{pendingDrop=null;};
  function cancelTileDrag() {
    if(!tileDrag)return;
    const current=tileDrag;tileDrag=null;draggedTile=null;
    current.ghost?.remove();
    for(const node of $('hand').children)node.classList.remove('drag-source');
    for(const node of document.querySelectorAll('.drop-hover'))node.classList.remove('drop-hover');
    if($('hand').hasPointerCapture(current.pointerId))$('hand').releasePointerCapture(current.pointerId);
  }
  function armAtPoint(x,y) {
    const hit=document.elementFromPoint(x,y)?.closest('[data-place-arm]');
    if(hit && selectedMoves().some(move=>move.arm===Number(hit.dataset.placeArm)))return Number(hit.dataset.placeArm);
    const bounds=$('table').getBoundingClientRect();
    return !state.board && x>=bounds.left&&x<=bounds.right&&y>=bounds.top&&y<=bounds.bottom&&selectedMoves().length?0:null;
  }
  $('hand').onpointerdown=event=>{
    const node=event.target.closest('[data-hand-tile]');
    if(!node || node.disabled || !event.isPrimary || event.button!==0)return;
    tileDrag={pointerId:event.pointerId,node,id:node.dataset.handTile,x:event.clientX,y:event.clientY,active:false};
  };
  $('hand').onpointermove=event=>{
    if(!tileDrag || tileDrag.pointerId!==event.pointerId)return;
    if(!tileDrag.active && Math.hypot(event.clientX-tileDrag.x,event.clientY-tileDrag.y)<8)return;
    event.preventDefault();
    if(!tileDrag.active) {
      tileDrag.active=true;if(selected!==tileDrag.id)declaredMove=null;
      selected=tileDrag.id;draggedTile=selected;
      $('hand').setPointerCapture(event.pointerId);
      for(const node of $('hand').children){node.classList.remove('selected');node.setAttribute('aria-pressed','false');}
      tileDrag.node.setAttribute('aria-pressed','true');
      tileDrag.node.classList.add('selected','drag-source');
      tileDrag.ghost=tileDrag.node.cloneNode(true);tileDrag.ghost.className='tile vertical drag-ghost';
      tileDrag.ghost.removeAttribute('id');tileDrag.ghost.setAttribute('aria-hidden','true');document.body.append(tileDrag.ghost);
      drawBoard();enableBoardInteraction();renderChoices();
    }
    tileDrag.ghost.style.left=`${event.clientX}px`;tileDrag.ghost.style.top=`${event.clientY}px`;
    for(const node of document.querySelectorAll('.drop-hover'))node.classList.remove('drop-hover');
    document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-place-arm]')?.classList.add('drop-hover');
  };
  $('hand').onpointerup=event=>{
    if(!tileDrag || tileDrag.pointerId!==event.pointerId)return;
    const active=tileDrag.active, arm=active?armAtPoint(event.clientX,event.clientY):null;
    cancelTileDrag();
    if(active){event.preventDefault();suppressTileClickUntil=performance.now()+350;if(arm!==null)confirmDroppedTile(arm);}
  };
  $('hand').onpointercancel=cancelTileDrag;
  $('hand').onlostpointercapture=()=>{if(tileDrag)cancelTileDrag();};
  window.addEventListener('blur',cancelTileDrag);
  document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;if(tileDrag){event.preventDefault();cancelTileDrag();}else if(selected&&!document.querySelector('dialog[open]')){event.preventDefault();const id=selected;selected=null;declaredMove=null;render();document.querySelector(`[data-hand-tile="${id}"]`)?.focus();}});
  $('table').onpointerdown = event => {
    if (event.target.closest('[data-place-arm],.board-zoom-controls') || boardZoom<=1 || draggedTile || !state.board || !event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    fitBoard();
    $('table').setPointerCapture(event.pointerId);
    drag = { id:event.pointerId, startX:event.clientX, startY:event.clientY, x:viewZoom.x, y:viewZoom.y, moved:false };
  };
  $('table').onpointermove = event => {
    if (!drag || drag.id !== event.pointerId || !viewZoom) return;
    const dx=event.clientX-drag.startX, dy=event.clientY-drag.startY;
    if (Math.hypot(dx,dy)>4) drag.moved=true;
    if (!drag.moved) return;
    if (!$('table').hasPointerCapture(event.pointerId)) $('table').setPointerCapture(event.pointerId);
    viewZoom.x=drag.x+dx; viewZoom.y=drag.y+dy;
    $('table').classList.add('dragging'); fitBoard();
  };
  function endDrag(event) {
    if (!drag || drag.id !== event.pointerId) return;
    releaseBoardPan();
  }
  $('table').onpointerup=endDrag;
  $('table').onpointercancel=endDrag;
  $('table').onlostpointercapture=()=>{if(drag)releaseBoardPan();};
  window.addEventListener('blur',releaseBoardPan);
  $('table').onkeydown=event=>{
    if (!viewZoom) return;
    if (event.key==='Escape') { event.preventDefault();releaseBoardPan(); }
    const offsets={ArrowLeft:[40,0],ArrowRight:[-40,0],ArrowUp:[0,40],ArrowDown:[0,-40]};
    if (offsets[event.key]) { event.preventDefault();viewZoom.x+=offsets[event.key][0];viewZoom.y+=offsets[event.key][1];fitBoard(); }
  };
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fitBoard).observe($('table'));
  if(typeof ResizeObserver!=='undefined'){
    const widths=new Map(),observer=new ResizeObserver(entries=>{for(const entry of entries){const id=entry.target.id,width=entry.contentRect.width;if(widths.get(id)!==width){widths.set(id,width);balanceHand(id);}}});
    observer.observe($('opponent-hand'));observer.observe($('hand'));
  }
  render(); schedule();
})();

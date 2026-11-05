(function(root){
  'use strict';
  let dialog, timer=null, step=0, running=false, language='pl', closed;
  const content={
    pl:{title:'Jak grać w domino?',close:'Zamknij',play:'Odtwórz pokaz',pause:'Pauza',prev:'Wstecz',next:'Dalej',note:'Krótki pokaz na przykładowych kościach — nie zmienia Twojej partii.',steps:[['Wybierz swoją kość','Kliknij kość w ręce. Pasujące końce planszy dostaną obwódkę i strzałki.'],['Zamelduj przed dołożeniem','Jeśli spodziewasz się punktów, włącz „Melduję”. Meldunek dotyczy najbliższego dołożenia wybranej kości.'],['Dołóż na planszy','Kliknij podświetlony końcową kość lub strzałkę. Możesz też przeciągnąć kość. Po upuszczeniu wybierz „Melduję i dokładam” albo „Dołóż bez meldunku”. Poza końcem ruch jest anulowany.'],['Dobieraj pojedynczo','Nie masz pasującej kości? Dobierz jedną. Tylko jeśli nie pasuje, dobierz drugą. Pasującą trzeba zagrać. Nowa kość ma obwódkę.'],['Graj po swojemu','W ⚙ wybierz poziom komputera i opcjonalnie automatyczne meldowanie. Przyciski +/− w rogu planszy powiększają ją co 10%. Minusem wrócisz do całości. Powiększoną planszę przesuwasz myszą lub palcem. Przytrzymanie nie zmienia skali.']],declare:'✓ Melduję',draw:'Dobierz jedną → drugą',auto:'⚙ Początkujący · Automatyczne meldowanie',selected:'Wybrana kość',ends:'Pasujący koniec',bonus:'+10 pkt',instructions:'W skrócie',rules:['Po 6 kości, partia do 150 pkt.','Punkty za końce o sumie podzielnej przez 5; otwarcie domyślnie punktuje tylko 5–5.','Pierwszy dublet rozgałęzia planszę. Boczne ramiona po dołożeniu do obu podstawowych stron.','Dobierz najwyżej dwie kości, po jednej. Ostatnie dwie są niedostępne.','Przy ręcznym meldowaniu brak meldunku odbiera punkty za ruch. Domyślnie trzeci błędny meldunek oznacza przegraną partię.']},
    en:{title:'How to play dominoes',close:'Close',play:'Play demo',pause:'Pause',prev:'Previous',next:'Next',note:'A short demonstration with sample tiles — your game stays unchanged.',steps:[['Choose your tile','Click a tile in your hand. Matching board ends get an outline and arrow markers.'],['Declare before placing','If you expect points, turn on “Declare”. It applies to the next placement of the chosen tile.'],['Place on the board','Click a highlighted end tile or arrow. You can also drag the tile. After dropping, choose “Declare and place” or “Place without declaring”. Dropping elsewhere cancels the move.'],['Draw one at a time','No matching tile? Draw one. Only if it does not fit, draw a second. A matching tile must be played. The new tile is outlined.'],['Play your way','In ⚙ choose the computer skill and optionally automatic declarations. Use +/− in the board corner to zoom in 10% steps. Use minus to return to the whole board. Drag the enlarged board to pan. Holding does not change the scale.']],declare:'✓ Declared',draw:'Draw first → second',auto:'⚙ Beginner · Automatic declarations',selected:'Chosen tile',ends:'Matching end',bonus:'+10 pts',instructions:'Quick rules',rules:['6 tiles each, first to 150 points.','Score for exposed ends totalling a multiple of five; by default only 5–5 scores on opening.','The first double is the spinner. Side arms unlock after both main sides have tiles.','Draw at most two tiles, one at a time. The final two are unavailable.','In manual mode, undeclared move points are lost. By default three false declarations lose the game.']}
  };
  function tile(a,b,highlight=false){
    const node=document.createElement('span');node.className='demo-tile'+(highlight?' demo-selected':'');
    node.setAttribute('aria-label',`${a}–${b}`);node.setAttribute('role','img');
    const positions={0:[],1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
    for(const n of [a,b]){const half=document.createElement('span');half.className='half';for(let i=0;i<9;i++){const dot=document.createElement('span');if(positions[n].includes(i))dot.className='dot';half.append(dot);}node.append(half);}return node;
  }
  function stop(){clearInterval(timer);timer=null;running=false;}
  function draw(){
    const t=content[language==='pl'?'pl':'en'];
    dialog.querySelector('#demo-step').textContent=`${step+1} / 5 · ${t.steps[step][0]}`;
    dialog.querySelector('#demo-description').textContent=t.steps[step][1];
    const scene=dialog.querySelector('#demo-scene');scene.replaceChildren();scene.dataset.step=step;
    const board=document.createElement('div');board.className='demo-board';
    if(step===2)board.append(tile(0,5,true));
    const spinner=tile(step===3?6:5,step===3?6:5);spinner.classList.add('demo-spinner');board.append(spinner);
    if(step<2){const arrow=document.createElement('span');arrow.className='demo-end';arrow.textContent='←';arrow.setAttribute('aria-label',t.ends);board.prepend(arrow);}
    const hand=document.createElement('div');hand.className='demo-hand';if(step===3)hand.append(tile(0,2));hand.append(step===2?tile(1,2):tile(step===3?2:0,step===3?6:5,true));
    const action=document.createElement('div');action.className='demo-action';action.textContent=[t.selected,t.declare,t.bonus,t.draw,t.auto][step];
    scene.append(board,action,hand);
    dialog.querySelector('#demo-play').textContent=running?t.pause:t.play;
    dialog.querySelector('#demo-prev').disabled=step===0;dialog.querySelector('#demo-next').disabled=step===4;
    DominoI18n.apply(dialog,language);
  }
  function play(){
    stop();if(step===4)step=0;running=true;
    timer=setInterval(()=>{if(step===4){stop();draw();return;}step++;draw();},5000);draw();
  }
  function open(lang,onClose){
    stop();language=DominoI18n.languages.includes(lang)?lang:'pl';step=0;closed=onClose;
    if(!dialog){dialog=document.createElement('dialog');dialog.id='help';dialog.setAttribute('aria-labelledby','help-title');document.body.append(dialog);}
    const t=content[language==='pl'?'pl':'en'];
    dialog.innerHTML='<div class="dialog-heading"><h2 id="help-title"></h2><button id="help-close" type="button">×</button></div><section class="help-overview" aria-labelledby="help-goal"><h3 id="help-goal"></h3><div id="help-basics"></div></section><p id="help-note" class="small muted"></p><div class="demo-controls"><button id="demo-prev"></button><button id="demo-play"></button><button id="demo-next"></button></div><h3 id="demo-step"></h3><div id="demo-scene" aria-hidden="true"></div><p id="demo-description" aria-live="polite"></p><details><summary id="help-rules-title"></summary><div id="help-detail-basics"></div><ul id="help-rules"></ul></details>';
    dialog.querySelector('#help-title').textContent=t.title;dialog.querySelector('#help-note').textContent=t.note;
    dialog.querySelector('#help-goal').textContent = DominoI18n.text("What is the goal?",language);
    for (const text of ["Reach 150 points before the computer. Place tiles so that touching halves have the same number of pips. When the exposed ends total a multiple of five, you score that total — by default, declare before placing. By default, only 5–5 scores as the first tile.", "Each player starts with six tiles. No matching tile? Draw one, then a second only if the first does not fit. You must play a matching tile. The last two tiles in the pool cannot be drawn.", "A block occurs when neither player can place a tile and no drawable tiles remain. Playing all your tiles ends the round and earns the opponent’s remaining pips, rounded up to a multiple of five. In a block, the lower pip total wins the opponent’s remainder; a tie awards none. A lone 0–0 counts as 5. Scores carry across rounds; the game ends immediately when someone reaches 150.", "Winning a game adds 1 point to the games tally. If the loser has fewer than 75 points, the win is worth 2 points. This is a fixed rule, not a settings option.", "Declarations depend on settings. By default, declare manually: turn on “Declare” before placing a tile. Without declaring, you lose the points for that move. After dragging, you can choose “Declare and place”. Enable automatic declarations in settings to score without announcing. The false declaration penalty is configurable too; by default, the third error loses the game."]) { const p=document.createElement('p'); p.textContent=DominoI18n.text(text,language); dialog.querySelector('#help-detail-basics').append(p); }
    for(const text of ["Reach 150 points before the computer. Connect halves with matching pips. Score when the exposed ends total a multiple of five.", "By default, declare points before your move. You can enable automatic declarations in settings."]){const p=document.createElement('p');p.textContent=DominoI18n.text(text,language);dialog.querySelector('#help-basics').append(p);}
    if(language==='pl'){const p=document.createElement('p');p.textContent='Kości to kamienie domina — w grze nazywamy je po prostu kośćmi.';dialog.querySelector('#help-basics').prepend(p);}
    dialog.querySelector('#help-close').setAttribute('aria-label',t.close);
    dialog.querySelector('#help-close').onclick=()=>dialog.close();
    dialog.querySelector('#demo-prev').textContent=t.prev;dialog.querySelector('#demo-next').textContent=t.next;
    dialog.querySelector('#help-rules-title').textContent=DominoI18n.text('Detailed rules',language);
    for(const rule of t.rules){const li=document.createElement('li');li.textContent=rule;dialog.querySelector('#help-rules').append(li);}
    dialog.querySelector('#demo-play').onclick=()=>{if(running){stop();draw();}else play();};
    dialog.querySelector('#demo-prev').onclick=()=>{stop();step=Math.max(0,step-1);draw();};
    dialog.querySelector('#demo-next').onclick=()=>{stop();step=Math.min(4,step+1);draw();};
    dialog.onclose=()=>{stop();closed?.();};
    dialog.showModal();
    draw(); // Let the player read the goal before starting the demonstration.
  }
  root.DominoHelp={open};
})(globalThis);

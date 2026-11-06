(function (root) {
  'use strict';
  const E = typeof module !== 'undefined' ? require('./engine.js') : root.DominoEngine;
  function create(random = Math.random, starter = null, settings = {}) {
    const state = { version: 1, settings: { roundStarter: 'alternate', mustDraw: true, requireDeclaration: true, openingDoublesOnly: true, declarationPenalty: 'three', aiDifficulty: 'medium', ...settings }, declarationErrors: [0, 0], scores: [0, 0], round: 0, matchWinner: null };
    startRound(state, random, starter);
    return state;
  }
  function startRound(s, random = Math.random, starter = null) {
    if (s.round && !s.roundResult) throw new Error('Round still active');
    if (!s.roundHistory) s.roundHistory = [];
    if (s.round) s.roundHistory.push({ round: s.round, starter: s.roundStarter, events: s.events.map(event => ({ ...event })), result: structuredClone(s.roundResult), scores: s.scores.slice() });
    const dealt = E.deal(random);
    s.hands = dealt.hands; s.pool = dealt.pool; s.board = null;
    s.forced = null; s.roundResult = null; s.lastPoints = 0; s.drawnThisTurn = 0; s.lastDrawn = [null,null];
    if (s.round === 0 && starter === null) {
      const first = E.opening(s.hands); s.turn = first.player; s.forced = first.tile.id;
    } else if (starter !== null) s.turn = starter;
    else s.turn = 1 - s.roundStarter;
    s.roundStarter = s.turn; s.round++; s.events = [];
    return s;
  }
  const tip = (b, arm) => b.arms[arm].length ? b.arms[arm].at(-1).b : b.spinner ? b.root.a : arm === 0 ? b.root.a : b.root.b;
  function ports(b) {
    if (!b) return [];
    return b.spinner && b.arms[0].length && b.arms[1].length ? [0, 1, 2, 3] : [0, 1];
  }
  function legal(s, player = s.turn) {
    if (s.roundResult || s.matchWinner !== null) return [];
    const result = [];
    for (const tile of s.hands[player]) {
      if (s.forced && tile.id !== s.forced) continue;
      if (!s.board) result.push({ id: tile.id, arm: 0 });
      else for (const arm of ports(s.board)) if (E.fits(tile, [tip(s.board, arm)])) result.push({ id: tile.id, arm });
    }
    return result;
  }
  const flip = t => ({ ...t, a: t.b, b: t.a });
  function place(b, item, arm) {
    if (!b) return { root: item, spinner: item.a === item.b, arms: [[], [], [], []] };
    const oriented = item.a === tip(b, arm) ? { ...item } : flip(item);
    if (!b.spinner && item.a === item.b) {
      let line = [...b.arms[0].slice().reverse().map(flip), b.root, ...b.arms[1]];
      if (arm === 1) line = line.reverse().map(flip);
      const arms = [[], [], [], []];
      // Existing tiles stay on their original side of the new spinner.
      arms[1 - arm] = line;
      return { root: item, spinner: true, arms };
    }
    b.arms[arm].push(oriented);
    return b;
  }
  function values(b) {
    if (!b) return [];
    const end = t => t.a === t.b ? t.a + t.b : t.b;
    if (!b.spinner) return [b.arms[0].length ? end(b.arms[0].at(-1)) : b.root.a, b.arms[1].length ? end(b.arms[1].at(-1)) : b.root.b];
    const result = b.arms.filter(a => a.length).map(a => end(a.at(-1)));
    if (!b.arms[0].length || !b.arms[1].length) result.push(b.root.a * 2);
    return result;
  }
  function award(s, player, points) {
    s.scores[player] = Math.min(150, s.scores[player] + points);
    if (s.scores[player] >= 150) s.matchWinner = player;
  }
  function finish(s, reason) {
    const result = E.remainder(s.hands);
    if (reason === 'out') result.winner = s.hands[0].length === 0 ? 0 : 1;
    s.roundResult = { ...result, reason };
    if (result.winner !== null) award(s, result.winner, result.points);
  }
  function repairEmptyHandTie(s) {
    if (s.roundResult?.reason !== 'out' || s.roundResult.winner !== null) return false;
    const empty=s.hands.map(hand=>hand.length===0);
    if(empty[0]===empty[1]) return false;
    const winner=empty[0]?0:1, result=E.remainder(s.hands);
    s.roundResult={...result,winner,reason:'out'};
    award(s,winner,result.points);
    return true;
  }
  function play(s, id, arm, declared = false) {
    if (!legal(s).some(m => m.id === id && m.arm === arm)) throw new Error('Illegal move');
    const player = s.turn;
    s.drawnThisTurn = 0;
    if (s.lastDrawn) s.lastDrawn[player] = null;
    const index = s.hands[player].findIndex(t => t.id === id);
    const item = s.hands[player].splice(index, 1)[0];
    const opening = !s.board;
    s.board = place(s.board, item, arm); s.forced = null;
    const availablePoints = opening && s.settings.openingDoublesOnly !== false && item.a !== item.b ? 0 : E.endPoints(values(s.board));
    s.lastPoints = s.settings.requireDeclaration !== false && declared !== true ? 0 : availablePoints;
    const falseDeclaration = s.settings.requireDeclaration !== false && declared === true && availablePoints === 0;
    s.declarationErrors ||= [0, 0];
    const penalty = s.settings.declarationPenalty || 'three';
    let deducted = 0;
    if (falseDeclaration) {
      s.declarationErrors[player]++;
      if (penalty === 'five') { deducted = Math.min(5, s.scores[player]); s.scores[player] -= deducted; }
      if (penalty === 'three' && s.declarationErrors[player] >= 3) {
        s.matchWinner = 1 - player;
        s.matchEndReason = 'false-declarations';
      }
    }
    award(s, player, s.lastPoints);
    s.events.push({ player, id, arm, points: s.lastPoints, declared: declared === true, missedPoints: availablePoints - s.lastPoints, falseDeclaration, deducted, forfeited: s.matchEndReason === 'false-declarations' });
    if (s.matchWinner !== null) return s;
    if (!s.hands[player].length) finish(s, 'out');
    else { s.turn = 1 - player; detectBlock(s); }
    return s;
  }
  function detectBlock(s) {
    if (s.pool.length <= 2 && !legal(s, 0).length && !legal(s, 1).length) finish(s, 'blocked');
  }
  function draw(s) {
    if (!s.board || s.roundResult || s.matchWinner !== null) throw new Error('Cannot draw');
    const player = s.turn;
    const ends = ports(s.board).map(arm => tip(s.board, arm));
    const result = E.draw(s.hands[player], s.pool, ends, 1);
    s.drawnThisTurn = (s.drawnThisTurn || 0) + result.drawn.length;
    s.lastDrawn ||= [null,null];
    if (result.drawn.length) s.lastDrawn[player] = result.drawn[0].id;
    result.pass = !result.mustPlay && (s.drawnThisTurn >= 2 || result.pool.length <= 2);
    s.hands[s.turn] = result.hand; s.pool = result.pool; s.forced = result.mustPlay;
    s.lastPoints = 0;
    s.events.push({ player: s.turn, drawn: result.drawn.length, pass: result.pass, ends });
    if (result.pass) { s.turn = 1 - s.turn; s.drawnThisTurn = 0; }
    detectBlock(s);
    return result;
  }
  function nextRound(s, random = Math.random) {
    if (!s.roundResult || s.matchWinner !== null) throw new Error('Cannot start next round');
    const starter = s.settings.roundStarter === 'winner' && s.roundResult.winner !== null ? s.roundResult.winner : 1 - s.roundStarter;
    return startRound(s, random, starter);
  }
  function pass(s) {
    if (!s.board || s.roundResult || s.matchWinner !== null || legal(s).length) throw new Error('Cannot pass');
    if (s.pool.length > 2 && s.settings.mustDraw !== false) throw new Error('Must draw before passing');
    s.events.push({ player: s.turn, drawn: 0, pass: true, ends: ports(s.board).map(arm => tip(s.board, arm)) });
    s.lastPoints = 0; s.drawnThisTurn = 0; s.turn = 1 - s.turn;
    detectBlock(s);
    return s;
  }
  function nextMatch(s, random = Math.random) {
    if (s.matchWinner === null) throw new Error('Match still active');
    return create(random, 1 - s.matchWinner, s.settings);
  }
  function copyBoard(board) {
    return board && { ...board, arms: board.arms.map(arm => arm.slice()) };
  }
  function movePoints(s, tile, arm) {
    if (!s.board && s.settings.openingDoublesOnly !== false && tile.a !== tile.b) return 0;
    return E.endPoints(values(place(copyBoard(s.board), tile, arm)));
  }
  function expert(s, moves, random) {
    const player = s.turn, opponent = 1 - player;
    const hand = s.hands[player], opponentCount = s.hands[opponent].length;
    const seen = new Set([...hand, ...(s.board ? [s.board.root, ...s.board.arms.flat()] : [])].map(tile => tile.id));
    const unseen = E.deck().filter(tile => !seen.has(tile.id));
    const candidates = moves.map(move => {
      const tile = hand.find(tile => tile.id === move.id);
      return { ...move, points: movePoints(s, tile, move.arm), rank: 0 };
    });
    const immediate = candidates.find(move => s.scores[player] + move.points >= 150);
    if (immediate || candidates.length === 1) {
      const move = immediate || candidates[0];
      return { ...move, declared: move.points > 0 };
    }

    // A draw or pass proves the old hand had no matching tile. Later draws
    // may have introduced such tiles. Older saves simply lack this evidence.
    const evidence = [];
    let drawn = 0;
    for (const event of (s.events || []).slice().reverse()) {
      if (event.player !== opponent) continue;
      drawn += event.drawn || 0;
      if (event.ends?.length) evidence.push({ ends: event.ends, drawn });
    }
    const samples = [];
    for (let attempt = 0; attempt < 80 && samples.length < 16; attempt++) {
      const bag = E.shuffle(unseen, random);
      const otherHand = bag.slice(0, opponentCount);
      if (evidence.every(({ ends, drawn }) => otherHand.filter(tile => E.fits(tile, ends)).length <= drawn)) samples.push(bag);
    }
    while (samples.length < 16) samples.push(E.shuffle(unseen, random));

    for (const move of candidates) {
      for (const bag of samples) {
        const hands = [];
        hands[player] = hand.slice();
        hands[opponent] = bag.slice(0, opponentCount);
        const trial = {
          hands, pool: bag.slice(opponentCount), board: copyBoard(s.board), scores: s.scores.slice(),
          turn: player, forced: s.forced, roundResult: null, matchWinner: null, events: [],
          settings: { ...s.settings, aiDifficulty: 'hard' }
        };
        play(trial, move.id, move.arm, move.points > 0);
        for (let replies = 0; replies < 2 && !trial.roundResult && trial.matchWinner === null; replies++) {
          let reply = choose(trial, () => 0);
          let passed = false;
          while (!reply && trial.pool.length > 2) {
            const result = draw(trial);
            passed = result.pass;
            if (passed || trial.roundResult) break;
            reply = choose(trial, () => 0);
          }
          if (reply) play(trial, reply.id, reply.arm, reply.declared);
          else if (!trial.roundResult && !passed) pass(trial);
        }
        const points = (trial.scores[player] - s.scores[player]) - (trial.scores[opponent] - s.scores[opponent]);
        const terminal = trial.matchWinner === null ? 0 : trial.matchWinner === player ? 150 : -150;
        const mobility = new Set(legal(trial, player).map(move => move.id)).size;
        move.rank += points + terminal + mobility * 1.25 + (hands[opponent].length - hands[player].length) * 1.5 - E.sum(hands[player]) * 0.12;
      }
    }
    const best = candidates.sort((a, b) => b.rank - a.rank)[0];
    return { ...best, declared: best.points > 0 };
  }
  function choose(s, random = Math.random) {
    // Only the public board, scores and the current player's hand influence choice.
    const moves = legal(s);
    if (moves.length && s.settings.aiDifficulty === 'expert') return expert(s, moves, random);
    return moves.map(move => {
      const item = s.hands[s.turn].find(t => t.id === move.id);
      const points = movePoints(s, item, move.arm);
      const level = s.settings.aiDifficulty || 'medium';
      const noise = random();
      const rank = level === 'easy' ? noise : level === 'hard' ? points * 5 + item.a + item.b + noise : points * 2 + item.a + item.b + noise * 20;
      return { ...move, declared: points > 0, rank };
    }).sort((a, b) => b.rank - a.rank)[0] || null;
  }
  const api = { create, legal, play, draw, pass, ports, tip, values, nextRound, nextMatch, choose, repairEmptyHandTie };
  if (typeof module !== 'undefined') module.exports = api;
  root.DominoGame = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

/* Pure rule primitives. No UI, storage, or access to hidden opponent tiles. */
(function (root) {
  'use strict';
  const pip = n => Number.isInteger(n) && n >= 0 && n <= 6;
  function checkTile(tile) {
    if (!tile || !pip(tile.a) || !pip(tile.b)) throw new TypeError('Invalid domino');
  }
  function tile(a, b) {
    if (!pip(a) || !pip(b)) throw new TypeError('Invalid pip count');
    return { id: `${Math.min(a, b)}-${Math.max(a, b)}`, a: Math.min(a, b), b: Math.max(a, b) };
  }
  function deck() {
    const result = [];
    for (let a = 0; a <= 6; a++) for (let b = a; b <= 6; b++) result.push(tile(a, b));
    return result;
  }
  function shuffle(tiles, random = Math.random) {
    const result = tiles.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const value = random();
      if (!Number.isFinite(value) || value < 0 || value >= 1) throw new RangeError('Random must be in [0,1)');
      const j = Math.floor(value * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function deal(random = Math.random) {
    const bag = shuffle(deck(), random);
    return { hands: [bag.slice(0, 6), bag.slice(6, 12)], pool: bag.slice(12) };
  }
  function sum(hand) {
    return hand.reduce((total, item) => { checkTile(item); return total + item.a + item.b; }, 0);
  }
  function roundUpFive(value) {
    if (!Number.isInteger(value) || value < 0) throw new RangeError('Expected nonnegative integer');
    return Math.ceil(value / 5) * 5;
  }
  function compare(a, b) {
    checkTile(a); checkTile(b);
    return (a.a + a.b) - (b.a + b.b) || Math.max(a.a, a.b) - Math.max(b.a, b.b);
  }
  function opening(hands) {
    if (hands.length !== 2 || hands.some(hand => !hand.length)) throw new RangeError('Two nonempty hands required');
    const all = hands.flatMap((hand, player) => hand.map(item => ({ player, tile: item })));
    all.forEach(item => checkTile(item.tile));
    const doubles = all.filter(item => item.tile.a === item.tile.b);
    return (doubles.length ? doubles : all).reduce((best, item) => compare(item.tile, best.tile) > 0 ? item : best);
  }
  function fits(item, ends) {
    checkTile(item);
    return ends.some(end => end === item.a || end === item.b);
  }
  function draw(hand, pool, ends, limit = 2) {
    if (hand.some(item => fits(item, ends))) throw new Error('Play a matching tile before drawing');
    const nextHand = hand.slice(), nextPool = pool.slice(), drawn = [];
    while (drawn.length < limit && nextPool.length > 2) {
      const item = nextPool.shift();
      checkTile(item);
      drawn.push(item); nextHand.push(item);
      if (fits(item, ends)) return { hand: nextHand, pool: nextPool, drawn, mustPlay: item.id, pass: false };
    }
    return { hand: nextHand, pool: nextPool, drawn, mustPlay: null, pass: true };
  }
  function remainder(hands) {
    if (hands.length !== 2) throw new RangeError('Two hands required');
    const totals = hands.map(hand => hand.length === 1 && hand[0].a === 0 && hand[0].b === 0 ? 5 : sum(hand));
    if (totals[0] === totals[1]) return { winner: null, points: 0, totals };
    const winner = totals[0] < totals[1] ? 0 : 1;
    return { winner, points: roundUpFive(totals[1 - winner]), totals };
  }
  function endPoints(values) {
    if (values.some(value => !Number.isInteger(value) || value < 0 || value > 12)) throw new RangeError('Invalid open end');
    const total = values.reduce((a, b) => a + b, 0);
    return total > 0 && total % 5 === 0 ? total : 0;
  }
  function matchPoints(loserScore) {
    if (!Number.isInteger(loserScore) || loserScore < 0) throw new RangeError('Invalid score');
    return loserScore < 75 ? 2 : 1;
  }
  const api = { tile, deck, shuffle, deal, sum, roundUpFive, compare, opening, fits, draw, remainder, endPoints, matchPoints };
  if (typeof module !== 'undefined') module.exports = api;
  root.DominoEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

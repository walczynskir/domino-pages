(function (root) {
  'use strict';
  const E = typeof module !== 'undefined' ? require('./engine.js') : root.DominoEngine;
  function prepare(state, stats) {
    state.matchId ||= globalThis.crypto?.randomUUID?.() ||
      Date.now().toString(36) + Math.random().toString(36).slice(2);
    // Old saves retain evidence across the entire match, including past rounds.
    state.started = state.started === true || !!state.board || state.round > 1 ||
      state.scores.some(score => score > 0) || !!state.events?.length ||
      !!state.roundHistory?.length || !!state.roundResult || state.matchWinner !== null;
    stats.completedMatches ??= stats.matches;
    stats.results ||= {};
    return state;
  }
  function unfinished(state) {
    return state.started && state.matchWinner === null && !state.recorded;
  }
  function record(state, stats, reason = 'natural') {
    prepare(state, stats);
    if (state.recorded || stats.results[state.matchId]) return false;
    if (reason === 'replaced' ? !unfinished(state) : state.matchWinner === null) return false;
    const winner = reason === 'replaced' ? 1 : state.matchWinner;
    stats.matches++;
    const points = E.matchPoints(state.scores[1 - winner]);
    if (reason === 'replaced') stats.opponentPoints += points;
    if (reason === 'natural') {
      stats.completedMatches++;
      if (winner === 0) {
        stats.wins++;
        stats.points += E.matchPoints(state.scores[1]);
      } else stats.opponentPoints += E.matchPoints(state.scores[0]);
    }
    stats.results[state.matchId] = { winner, reason, points, scores: state.scores.slice() };
    state.recorded = true;
    return true;
  }
  function replace(state, stats, create, persist) {
    const oldState = structuredClone(state), nextStats = structuredClone(stats);
    const resigned = unfinished(oldState);
    record(oldState, nextStats, oldState.matchWinner === null ? 'replaced' : 'natural');
    const nextState = create(resigned ? 0 : oldState.matchWinner === null ? null : 1 - oldState.matchWinner);
    // Persist result and replacement together. Failure leaves the caller's match intact.
    persist(nextState, nextStats);
    return { state: nextState, stats: nextStats };
  }
  const api = { prepare, unfinished, record, replace };
  root.DominoResults = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

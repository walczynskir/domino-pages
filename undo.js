(function (root) {
  'use strict';
  function create(state) {
    return { matchId: state.matchId, past: [], future: [] };
  }
  function load(state, saved) {
    if (!saved || saved.matchId !== state.matchId ||
        !Array.isArray(saved.past) || !Array.isArray(saved.future)) return create(state);
    const valid = snapshot => snapshot?.matchId === state.matchId &&
      Array.isArray(snapshot.hands) && snapshot.hands.length === 2 && Array.isArray(snapshot.events);
    return saved.past.every(valid) && saved.future.every(valid) ? saved : create(state);
  }
  function action(state, history, enabled, operation) {
    const before = enabled ? structuredClone(state) : null;
    const result = operation();
    if (enabled) {
      history.past.push(before);
      history.future = [];
    }
    return result;
  }
  function restore(state, history, direction, recorded) {
    const from = direction === 'undo' ? history.past : history.future;
    const to = direction === 'undo' ? history.future : history.past;
    if (!from.length) return state;
    const previous = from.pop();
    to.push(structuredClone(state));
    const result = structuredClone(previous);
    result.started = state.started || result.started;
    result.recorded = !!recorded || state.recorded || result.recorded;
    // Preferences apply immediately and are not game moves.
    result.settings = { ...state.settings };
    return result;
  }
  const api = { create, load, action, restore };
  root.DominoUndo = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

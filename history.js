(function (root) {
  'use strict';
  function eventText(event, language = 'pl') {
    const pl = language === 'pl';
    const player = event.player === 0 ? (pl ? 'Ty' : 'You') : (pl ? 'Komputer' : 'Computer');
    if (typeof event.id === 'string') {
      const arms = pl ? ['lewe ramię','prawe ramię','górne ramię','dolne ramię'] : ['left arm','right arm','top arm','bottom arm'];
      const direction = arms[event.arm] || '';
      const tile = event.id.replace('-', '–');
      let text = pl ? `${player}: dołożenie ${tile} (${direction}).` : `${player}: played ${tile} (${direction}).`;
      if (event.declared === true) text += pl ? ' Meldunek.' : ' Declared.';
      if (event.missedPoints > 0) text += pl ? ` Brak meldunku — utracone ${event.missedPoints} pkt.` : ` Not declared — ${event.missedPoints} points lost.`;
      else text += event.points > 0 ? ` +${event.points} ${pl ? 'pkt' : 'pts'}.` : (pl ? ' Bez punktów.' : ' No points.');
      if (event.falseDeclaration) text += pl ? ' Błędny meldunek.' : ' False declaration.';
      if (event.deducted) text += ` −${event.deducted} ${pl ? 'pkt' : 'pts'}.`;
      if (event.forfeited) text += pl ? ' Przegrana partia za trzy błędy.' : ' Game forfeited after three errors.';
      return text;
    }
    if (Number.isInteger(event.drawn)) {
      let text = '';
      if (event.drawn > 0) text = pl ? `${player}: dobrane kości — ${event.drawn}.` : `${player}: drew ${event.drawn} tile${event.drawn === 1 ? '' : 's'}.`;
      if (event.pass) text += `${text ? ' ' : player + ': '}${pl ? 'Pas.' : 'Pass.'}`;
      return text || `${player}: ${pl ? 'dobieranie.' : 'drawing.'}`;
    }
    return '';
  }
  function resultText(result, language = 'pl') {
    const pl = language === 'pl';
    if (!result) return '';
    if (result.winner === null) return pl ? 'Remisowa blokada — bez punktów za resztę.' : 'Tied block — no remainder points.';
    const player = result.winner === 0 ? (pl ? 'Ty' : 'You') : (pl ? 'Komputer' : 'Computer');
    const reason = result.reason === 'blocked' ? (pl ? 'Blokada.' : 'Blocked round.') : (pl ? 'Wyłożone wszystkie kości.' : 'All tiles played.');
    return `${reason} ${player}: +${result.points} ${pl ? 'pkt za resztę' : 'remainder points'}.`;
  }
  const api = { eventText, resultText };
  if (typeof module !== 'undefined') module.exports = api;
  root.DominoHistory = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

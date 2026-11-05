(function () {
  'use strict';
  const key = 'domino-save-v1';
  let prefs = {};
  try { prefs = JSON.parse(localStorage.getItem(key))?.prefs || {}; } catch {}
  const requested = new URLSearchParams(location.search).get('lang');
  let language=DominoI18n.languages.includes(requested||prefs.language)?(requested||prefs.language):'pl';
  DominoI18n.addLanguages(document.querySelector('#credits-language'));
  const themes = ['porcelain','ink','sage','studio','forma','energy','tangerine','ukraine','contrast','copper','night-sky'];
  document.documentElement.dataset.theme = themes.includes(prefs.theme) ? prefs.theme : 'porcelain';
  document.body.classList.toggle('large', prefs.large === true);
  const pl = Object.fromEntries([...document.querySelectorAll('[data-text]')].map(node=>[node.dataset.text,node.textContent]));
  const en = {
    back:'← Back to domino', title:'Credits and licenses', author:'Project author', role:'Idea, development and project direction.', support:'Creation support', codex:'Developed with the help of OpenAI Codex.', components:'Third-party libraries', none:'None — the app does not use additional libraries.', own:'The domino engine, computer opponent and interface are original parts of this project. The app uses system fonts; no third-party libraries or font files are bundled.', license:'Application license', licenseNote:'No license has been selected for the original application code yet. Public access to the game does not grant a license to the code.'
  };
  function render() {
    document.documentElement.lang = language;
    document.title = `${language === 'pl' ? pl.title : en.title} · Domino`;
    document.querySelector('#credits-language').value = language;
    for (const node of document.querySelectorAll('[data-text]')) node.textContent = (language === 'pl' ? pl : en)[node.dataset.text];
    document.querySelector('#credits-language').setAttribute('aria-label',DominoI18n.text('Language',language));
    DominoI18n.apply(document.body,language);document.title=DominoI18n.text(document.title,language);
  }
  document.querySelector('#credits-language').onchange = event => {
    language = event.target.value;
    try { const saved=JSON.parse(localStorage.getItem(key)); if(saved) { saved.prefs={...saved.prefs,language};localStorage.setItem(key,JSON.stringify(saved)); } } catch {}
    const url = new URL(location.href); url.searchParams.set('lang', language); history.replaceState(null, '', url);
    render();
  };
  render();
})();

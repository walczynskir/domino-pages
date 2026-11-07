(() => {
  const script = document.currentScript;
  const menu = document.querySelector('.games-chest-menu');
  const summary = menu.querySelector('summary');
  const links = menu.querySelector('ul');
  const labels = {
    pl: ['Gry', 'Wszystkie gry'], en: ['Games', 'All games'],
    de: ['Spiele', 'Alle Spiele'], es: ['Juegos', 'Todos los juegos'],
    fr: ['Jeux', 'Tous les jeux'], it: ['Giochi', 'Tutti i giochi'],
    ar: ['الألعاب', 'كل الألعاب'], hi: ['खेल', 'सभी खेल'],
    uk: ['Ігри', 'Усі ігри'], zh: ['游戏', '所有游戏']
  };
  let games = [];

  function render() {
    const language = document.documentElement.lang.split('-')[0];
    const [title, all] = labels[language] ?? labels.en;
    summary.textContent = title;
    const suggestions = games.filter(game => game.id !== script.dataset.game).slice(0, 3);
    links.replaceChildren();
    for (const game of [...suggestions, {url: 'https://games-chest.com/', en: all}]) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = game.url;
      link.textContent = game[language] ?? game.en;
      item.append(link);
      links.append(item);
    }
  }

  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      summary.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!menu.contains(event.target)) menu.open = false;
  });
  new MutationObserver(render).observe(document.documentElement, {
    attributes: true, attributeFilter: ['lang']
  });
  render();
  fetch('https://games-chest.com/games.json')
    .then(response => {
      if (!response.ok) throw new Error('Game catalog unavailable');
      return response.json();
    })
    .then(catalog => {
      if (Array.isArray(catalog)) games = catalog;
      render();
    })
    .catch(() => {});
})();

(() => {
  const current = document.currentScript.dataset.game;
  const menu = document.querySelector('.games-chest-menu');
  const recent = menu.querySelector('.recent-games');
  const heading = recent.querySelector('span');
  const icons = recent.querySelector('.recent-games-icons');
  const all = menu.querySelector('.all-games');
  const labels = {
    pl: ['Ostatnio otwierane', 'Wszystkie gry'], en: ['Recently opened', 'All games'],
    de: ['Zuletzt geöffnet', 'Alle Spiele'], es: ['Abiertos recientemente', 'Todos los juegos'],
    fr: ['Ouverts récemment', 'Tous les jeux'], it: ['Aperti di recente', 'Tutti i giochi'],
    ar: ['فُتحت مؤخرًا', 'كل الألعاب'], hi: ['हाल में खोले गए', 'सभी खेल'],
    uk: ['Нещодавно відкриті', 'Усі ігри'], zh: ['最近打开', '所有游戏']
  };
  const catalogUrl = 'https://games-chest.com/games.json';
  const ids = [...new Set((new URLSearchParams(location.search).get('gc-recent') ?? '').split(','))]
    .filter(id => /^[a-z0-9-]{1,40}$/.test(id)).slice(0, 4);
  let games = [];

  function render() {
    const language = document.documentElement.lang.split('-')[0];
    const [title, allGames] = labels[language] ?? labels.en;
    heading.textContent = title;
    all.textContent = allGames;
    icons.replaceChildren();
    for (const game of games) {
      const link = document.createElement('a');
      const url = new URL(game.url);
      url.searchParams.set('gc-recent', ids.join(','));
      link.href = url.href;
      link.title = game[language] ?? game.en;
      const icon = document.createElement('img');
      icon.src = new URL(game.icon, catalogUrl).href;
      icon.alt = link.title;
      icon.width = icon.height = 32;
      link.append(icon);
      icons.append(link);
    }
    recent.hidden = !games.length;
  }

  new MutationObserver(render).observe(document.documentElement, {
    attributes: true, attributeFilter: ['lang']
  });
  render();
  if (ids.length) fetch(catalogUrl)
    .then(response => response.ok ? response.json() : [])
    .then(catalog => {
      games = ids.filter(id => id !== current)
        .map(id => catalog.find(game => game.id === id))
        .filter(game => game && /^https:\/\//.test(game.url) && /^[a-z0-9-]+\.svg$/.test(game.icon))
        .slice(0, 3);
      render();
    })
    .catch(() => {});
})();

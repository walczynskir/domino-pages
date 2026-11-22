(() => {
  const current = document.currentScript.dataset.game;
  const menu = document.querySelector('.games-chest-menu');
  const recent = menu.querySelector('.recent-games');
  const icons = recent.querySelector('.recent-games-icons');
  const picker = document.querySelector('#game-picker');
  const button = document.querySelector('#game-picker-button');
  const close = document.querySelector('#game-picker-close');
  const pickerRecent = picker.querySelector('#game-picker-recent');
  const list = picker.querySelector('#game-picker-list');
  const allLinks = [menu, picker].map(container => container.querySelector('.all-games'));
  const labels = {
    pl: ['Inne gry', 'Zamknij', 'Ostatnio otwierane', 'Wszystkie gry', 'Osiem Asów', 'Garibaldka'],
    en: ['Other games', 'Close', 'Recently opened', 'All games', 'Eight Aces', 'Russian Bank'],
    de: ['Andere Spiele', 'Schließen', 'Zuletzt geöffnet', 'Alle Spiele', 'Acht Asse', 'Streitpatience'],
    es: ['Otros juegos', 'Cerrar', 'Abiertos recientemente', 'Todos los juegos', 'Ocho ases', 'Crapé'],
    fr: ['Autres jeux', 'Fermer', 'Ouverts récemment', 'Tous les jeux', 'Huit as', 'Crapette'],
    it: ['Altri giochi', 'Chiudi', 'Aperti di recente', 'Tutti i giochi', 'Otto assi', 'Crapette'],
    ar: ['ألعاب أخرى', 'إغلاق', 'فُتحت مؤخرًا', 'كل الألعاب', 'ثمانية آسات', 'طنج'],
    hi: ['अन्य खेल', 'बंद करें', 'हाल में खोले गए', 'सभी खेल', 'आठ इक्के', 'दो खिलाड़ियों का सॉलिटेयर'],
    uk: ['Інші ігри', 'Закрити', 'Нещодавно відкриті', 'Усі ігри', 'Вісім тузів', 'Гарібальдка'],
    zh: ['其他游戏', '关闭', '最近打开', '所有游戏', '八张王牌', '双人接龙']
  };
  const key = 'games-chest-recent';
  const catalogUrl = new URL('games-chest/games.json?v=icons-1', document.currentScript.src);
  const incoming = (new URLSearchParams(location.search).get('gc-recent') ?? '').split(',');
  let catalog = [];
  let ids = [];

  function history(order) {
    return [...new Set(order)]
      .filter(id => catalog.some(game => game.id === id))
      .slice(0, 4);
  }

  function gameLink(game, name, iconOnly) {
    const link = document.createElement('a');
    const url = new URL(game.url);
    const next = history([game.id, current, ...ids]);
    url.searchParams.set('gc-recent', next.join(','));
    link.href = url.href;
    const icon = document.createElement('img');
    icon.src = new URL(game.icon, catalogUrl).href;
    icon.alt = iconOnly ? name : '';
    icon.width = icon.height = 32;
    link.append(icon);
    if (!iconOnly) {
      link.className = 'game-picker-link';
      const title = document.createElement('span');
      title.textContent = name;
      link.append(title);
    }
    link.addEventListener('click', () => {
      ids = next;
      try { localStorage.setItem(key, JSON.stringify(ids)); } catch {}
      if (picker.open) picker.close();
    });
    return link;
  }

  function render() {
    const language = document.documentElement.lang.split('-')[0];
    const [title, dismiss, recentTitle, allGames, aces, bank] = labels[language] ?? labels.en;
    button.setAttribute('aria-label', title);
    button.title = title;
    const buttonLabel = button.querySelector('.toolbar-label');
    if (buttonLabel.textContent !== title) {
      buttonLabel.textContent = title;
      button.dispatchEvent(new Event('game-picker-label-change'));
    }
    close.setAttribute('aria-label', dismiss);
    picker.querySelector('h2').textContent = title;
    pickerRecent.querySelector('h3').textContent = recentTitle;
    recent.querySelector('span').textContent = recentTitle;
    for (const link of allLinks) link.textContent = allGames;

    const otherGames = catalog.filter(game => game.id !== current);
    const recentGames = ids.map(id => otherGames.find(game => game.id === id)).filter(Boolean);
    const name = game => game[language] ??
      ({ 'eight-aces': aces, garibaldka: bank })[game.id] ?? game.en;
    function populate(container, games) {
      container.replaceChildren(...games.map(game => {
        const item = document.createElement('li');
        item.append(gameLink(game, name(game), false));
        return item;
      }));
    }
    populate(pickerRecent.querySelector('ul'), recentGames);
    populate(list, otherGames.filter(game => !recentGames.includes(game)));
    icons.replaceChildren(...recentGames.map(game => gameLink(game, name(game), true)));
    recent.hidden = pickerRecent.hidden = recentGames.length === 0;
  }

  button.addEventListener('click', () => {
    render();
    picker.showModal();
  });
  picker.addEventListener('close', () => button.focus());
  new MutationObserver(render).observe(document.documentElement, {
    attributes: true, attributeFilter: ['lang']
  });
  render();

  fetch(catalogUrl)
    .then(response => response.ok ? response.json() : [])
    .then(games => {
      catalog = games;
      let saved = [];
      try {
        const stored = JSON.parse(localStorage.getItem(key));
        if (Array.isArray(stored)) saved = stored;
      } catch {}
      const returning = performance.getEntriesByType('navigation')[0]?.type;
      ids = history(returning === 'reload' || returning === 'back_forward'
        ? [current, ...saved, ...incoming]
        : [current, ...incoming, ...saved]);
      render();
    })
    .catch(() => {});
})();

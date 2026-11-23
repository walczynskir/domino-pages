(() => {
  const versionLabel = document.querySelector('#footer-version, #app-version');
  const parse = value => /^v?(\d+)\.(\d+)\.(\d+)$/.exec(value ?? '')?.slice(1).map(Number);
  const current = parse(versionLabel.textContent.trim());
  const newer = (version, baseline) => {
    if (!version || !baseline) return false;
    const difference = version.findIndex((part, index) => part !== baseline[index]);
    return difference !== -1 && version[difference] > baseline[difference];
  };
  const labels = {
    pl: ['Dostępna aktualizacja', 'Odśwież grę', 'Aktualizowanie…', 'Spróbuj ponownie za chwilę.'],
    en: ['Update available', 'Refresh game', 'Updating…', 'Try again in a moment.'],
    de: ['Update verfügbar', 'Spiel neu laden', 'Wird aktualisiert…', 'Versuche es gleich noch einmal.'],
    es: ['Actualización disponible', 'Recargar juego', 'Actualizando…', 'Inténtalo de nuevo en un momento.'],
    fr: ['Mise à jour disponible', 'Recharger le jeu', 'Mise à jour…', 'Réessayez dans un instant.'],
    it: ['Aggiornamento disponibile', 'Ricarica il gioco', 'Aggiornamento…', 'Riprova tra poco.'],
    ar: ['يتوفر تحديث', 'إعادة تحميل اللعبة', 'جارٍ التحديث…', 'حاول مجددًا بعد قليل.'],
    hi: ['अपडेट उपलब्ध है', 'गेम फिर से लोड करें', 'अपडेट हो रहा है…', 'कुछ देर में फिर कोशिश करें।'],
    uk: ['Доступне оновлення', 'Перезавантажити гру', 'Оновлення…', 'Спробуйте ще раз за мить.'],
    zh: ['有可用更新', '重新加载游戏', '正在更新…', '请稍后重试。']
  };
  const endpoint = new URL('version.json?check-update=1', document.currentScript.src);
  const panel = document.createElement('div');
  panel.className = 'game-update';
  panel.hidden = true;
  const status = document.createElement('span');
  status.setAttribute('role', 'status');
  const button = document.createElement('button');
  button.type = 'button';
  panel.append(status, button);
  document.querySelector('main').before(panel);
  let latest;
  let checking = false;
  let updating = false;
  let failed = false;

  function render() {
    const [available, refresh, busy, retry] = labels[document.documentElement.lang.split('-')[0]] ?? labels.en;
    panel.hidden = !newer(latest, current);
    status.textContent = panel.hidden ? '' : updating ? busy : failed ? retry : available + ' · v' + latest.join('.');
    button.textContent = refresh;
    button.disabled = updating;
  }

  async function check() {
    if (checking || updating || document.hidden) return;
    checking = true;
    try {
      const response = await fetch(endpoint, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
      if (!response.ok) return;
      latest = parse((await response.json()).version);
      render();
    } catch { /* Checking may fail while offline. */ }
    finally { checking = false; }
  }

  function workerVersion(worker) {
    return new Promise(resolve => {
      const channel = new MessageChannel();
      const timer = setTimeout(() => finish(), 300);
      function finish(value) {
        clearTimeout(timer);
        channel.port1.close();
        resolve(parse(value));
      }
      channel.port1.onmessage = event => finish(event.data);
      worker.postMessage('game-update-version', [channel.port2]);
    });
  }

  async function activateUpdate() {
    const serviceWorker = navigator.serviceWorker;
    const registration = await serviceWorker?.getRegistration();
    if (!registration) return;
    const deadline = Date.now() + 20000;
    let updateError;
    registration.update().catch(error => { updateError = error; });
    // An installed update may already be waiting or start installing during update().
    while (Date.now() < deadline) {
      registration.waiting?.postMessage('game-update-activate');
      const active = serviceWorker.controller;
      if (active && newer(await workerVersion(active), current)) return;
      if (updateError && !registration.installing && !registration.waiting) throw updateError;
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    throw new Error('Updated worker did not take control');
  }

  button.addEventListener('click', async () => {
    updating = true;
    failed = false;
    render();
    try {
      await activateUpdate();
      location.reload();
    } catch {
      updating = false;
      failed = true;
      render();
    }
  });
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  document.addEventListener('visibilitychange', check);
  window.addEventListener('online', check);
  setInterval(check, 5 * 60 * 1000);
  check();
})();

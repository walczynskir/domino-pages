/* A local reporting baseline; existing game and reward data remain authoritative. */
window.createStatisticsReset = (key, containerSelector, snapshot, refresh) => {
  const copy = {
    pl: ['Wyzeruj statystyki', 'Wyzerować widoczne statystyki? Bieżąca rozgrywka i nagrody zostaną zachowane.', 'Statystyki wyzerowano.', 'Nie udało się wyzerować statystyk.', 'Rozliczone partie'],
    en: ['Reset statistics', 'Reset the displayed statistics? Your current game and rewards are kept.', 'Statistics reset.', 'Could not reset statistics.', 'Games recorded'],
    de: ['Statistik zurücksetzen', 'Sichtbare Statistik zurücksetzen? Laufende Partie und Belohnungen bleiben erhalten.', 'Statistik zurückgesetzt.', 'Statistik konnte nicht zurückgesetzt werden.', 'Gewertete Partien'],
    es: ['Restablecer estadísticas', '¿Restablecer las estadísticas visibles? Se conservan la partida y las recompensas.', 'Estadísticas restablecidas.', 'No se pudieron restablecer las estadísticas.', 'Partidas registradas'],
    fr: ['Réinitialiser les statistiques', 'Réinitialiser les statistiques affichées ? La partie et les récompenses sont conservées.', 'Statistiques réinitialisées.', 'Impossible de réinitialiser les statistiques.', 'Parties comptabilisées'],
    it: ['Azzera statistiche', 'Azzerare le statistiche visibili? La partita e i premi saranno conservati.', 'Statistiche azzerate.', 'Impossibile azzerare le statistiche.', 'Partite registrate'],
    uk: ['Скинути статистику', 'Скинути видиму статистику? Поточна гра й нагороди збережуться.', 'Статистику скинуто.', 'Не вдалося скинути статистику.', 'Зараховані партії'],
    ar: ['تصفير الإحصاءات', 'هل تريد تصفير الإحصاءات المعروضة؟ ستبقى اللعبة الحالية والمكافآت محفوظة.', 'صُفّرت الإحصاءات.', 'تعذر تصفير الإحصاءات.', 'المباريات المسجلة'],
    hi: ['आँकड़े रीसेट करें', 'दिख रहे आँकड़े रीसेट करें? मौजूदा खेल और इनाम सुरक्षित रहेंगे।', 'आँकड़े रीसेट हो गए।', 'आँकड़े रीसेट नहीं हो सके।', 'दर्ज खेल'],
    'zh-Hans': ['重置统计', '重置显示的统计数据？当前对局和奖励会保留。', '统计已重置。', '无法重置统计。', '已记录对局']
  };
  const labels = () => copy[document.documentElement.lang] ?? copy.en;
  const read = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      return saved && typeof saved === 'object' ? saved : {};
    } catch { return {}; }
  };
  let baseline = read();
  const container = document.querySelector(containerSelector);
  const dialog = container.closest('dialog');
  const section = document.createElement('section');
  const action = document.createElement('p');
  const button = document.createElement('button');
  const message = document.createElement('p');
  button.type = 'button';
  button.id = 'reset-statistics';
  message.setAttribute('role', 'status');
  message.hidden = true;
  section.translate = false;
  action.append(button);
  section.append(action, message);
  container.append(section);
  const update = () => { button.textContent = labels()[0]; };
  new MutationObserver(update).observe(document.documentElement, {
    attributes: true, attributeFilter: ['lang']
  });
  update();
  button.onclick = () => {
    const [, prompt, success, error] = labels();
    if (!window.confirm(prompt)) return;
    try {
      const next = snapshot();
      localStorage.setItem(key, JSON.stringify(next));
      baseline = next;
    } catch {
      message.textContent = error;
      message.hidden = false;
      return;
    }
    refresh();
    message.textContent = success;
    message.hidden = false;
  };
  dialog.addEventListener('close', () => { message.hidden = true; });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    baseline = read();
    refresh();
  });
  return {
    count: (name, value) => Math.max(0, value - (Number.isSafeInteger(baseline[name]) ? baseline[name] : 0)),
    records(entries) {
      const previous = new Set(Array.isArray(baseline.ids) ? baseline.ids : []);
      return entries.filter(([id]) => !previous.has(id));
    },
    get recordedLabel() { return labels()[4]; }
  };
};

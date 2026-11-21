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
  const cancelCopy = {
    pl: 'Anuluj', en: 'Cancel', de: 'Abbrechen', es: 'Cancelar', fr: 'Annuler',
    it: 'Annulla', uk: 'Скасувати', ar: 'إلغاء', hi: 'रद्द करें', 'zh-Hans': '取消'
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

  const confirmation = document.createElement('dialog');
  const title = document.createElement('h2');
  const description = document.createElement('p');
  const actions = document.createElement('div');
  const cancel = document.createElement('button');
  const accept = document.createElement('button');
  confirmation.translate = false;
  title.id = 'reset-statistics-title';
  description.id = 'reset-statistics-description';
  confirmation.setAttribute('aria-labelledby', title.id);
  confirmation.setAttribute('aria-describedby', description.id);
  actions.style.display = 'flex';
  actions.style.flexWrap = 'wrap';
  actions.style.gap = '0.5rem';
  cancel.type = accept.type = 'button';
  cancel.autofocus = true;
  accept.className = 'primary';
  actions.append(cancel, accept);
  confirmation.append(title, description, actions);
  dialog.append(confirmation);

  const update = () => {
    const [label, warning] = labels();
    button.textContent = title.textContent = accept.textContent = label;
    description.textContent = warning;
    cancel.textContent = cancelCopy[document.documentElement.lang] ?? cancelCopy.en;
  };
  new MutationObserver(update).observe(document.documentElement, {
    attributes: true, attributeFilter: ['lang']
  });
  update();
  button.onclick = () => confirmation.showModal();
  cancel.onclick = () => confirmation.close();
  accept.onclick = () => {
    if (!confirmation.open) return;
    confirmation.close();
    const [, , success, error] = labels();
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
  dialog.addEventListener('close', () => {
    if (confirmation.open) confirmation.close();
    message.hidden = true;
  });
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

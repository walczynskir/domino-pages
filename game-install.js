(() => {
  const installedDisplay = matchMedia('(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui)');
  const isAppleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const safariVersion = Number(/Version\/(\d+)/.exec(navigator.userAgent)?.[1]);
  const isMacSafari = safariVersion >= 17 && /Macintosh/.test(navigator.userAgent)
    && /Safari\//.test(navigator.userAgent)
    && !/Chrome|Chromium|Edg|OPR|Firefox/.test(navigator.userAgent);
  const hasInstructions = isAppleMobile || isMacSafari;
  let device = isAppleMobile ? 'iphone' : 'mac';
  // Help title, File, Add to Dock, Share, Add to Home Screen, Open as Web App, Add, fallback, final step.
  const copy = {
    pl: ['Jak zainstalować?', 'Plik', 'Dodaj do Docka', 'Udostępnij', 'Dodaj do ekranu początkowego', 'Otwórz jako aplikację internetową', 'Dodaj', 'Gdy nie widzisz opcji dodania, przewiń menu Udostępnij do końca i wybierz „Edytuj czynności”. Jeśli nie widzisz ikony udostępniania, otwórz menu strony w Safari.', 'Otwórz grę, wybierając jej ikonę.', 'Zainstaluj grę'],
    en: ['How to install', 'File', 'Add to Dock', 'Share', 'Add to Home Screen', 'Open as Web App', 'Add', 'If the action is missing, scroll to the bottom of the Share menu and choose Edit Actions. If Share is hidden, open Safari’s page menu.', 'Open the game from its icon.', 'Install game'],
    de: ['Installationshilfe', 'Ablage', 'Zum Dock hinzufügen', 'Teilen', 'Zum Home-Bildschirm', 'Als Web-App öffnen', 'Hinzufügen', 'Fehlt die Aktion, scrolle im Teilen-Menü nach unten und wähle „Aktionen bearbeiten“. Ist „Teilen“ ausgeblendet, öffne das Seitenmenü.', 'Öffne das Spiel über sein Symbol.', 'Spiel installieren'],
    es: ['Cómo instalar', 'Archivo', 'Añadir al Dock', 'Compartir', 'Añadir a pantalla de inicio', 'Abrir como app web', 'Añadir', 'Si falta la acción, baja hasta el final del menú Compartir y elige «Editar acciones». Si Compartir está oculto, abre el menú de la página.', 'Abre el juego desde su icono.', 'Instalar juego'],
    fr: ['Comment installer', 'Fichier', 'Ajouter au Dock', 'Partager', 'Sur l’écran d’accueil', 'Ouvrir comme app web', 'Ajouter', 'Si l’action manque, allez en bas du menu Partager et choisissez « Modifier les actions ». Si Partager est masqué, ouvrez le menu de la page.', 'Ouvrez le jeu depuis son icône.', 'Installer le jeu'],
    it: ['Come installare', 'File', 'Aggiungi al Dock', 'Condividi', 'Aggiungi alla schermata Home', 'Apri come app web', 'Aggiungi', 'Se manca l’azione, scorri il menu Condividi fino in fondo e scegli «Modifica azioni». Se Condividi è nascosto, apri il menu della pagina.', 'Apri il gioco dalla sua icona.', 'Installa il gioco'],
    uk: ['Як установити', 'Файл', 'Додати на Dock', 'Поділитися', 'На початковий екран', 'Відкрити як вебпрограму', 'Додати', 'Якщо дії немає, прокрутіть меню «Поділитися» до кінця й виберіть «Редагувати дії». Якщо кнопку «Поділитися» приховано, відкрийте меню сторінки.', 'Відкрийте гру за її іконкою.', 'Установити гру'],
    ar: ['كيفية التثبيت', 'ملف', 'إضافة إلى Dock', 'مشاركة', 'إضافة إلى الشاشة الرئيسية', 'فتح كتطبيق ويب', 'إضافة', 'إذا لم يظهر الخيار، مرّر إلى أسفل قائمة المشاركة واختر «تحرير الإجراءات». إذا كان زر المشاركة مخفيًا، افتح قائمة الصفحة في سفاري.', 'افتح اللعبة من أيقونتها.', 'تثبيت اللعبة'],
    hi: ['इंस्टॉल कैसे करें', 'फ़ाइल', 'Dock में जोड़ें', 'शेयर करें', 'होम स्क्रीन पर जोड़ें', 'वेब ऐप के रूप में खोलें', 'जोड़ें', 'विकल्प न दिखे तो शेयर मेनू में नीचे जाकर कार्रवाइयाँ संपादित करें चुनें। शेयर बटन छिपा हो तो Safari का पेज मेनू खोलें।', 'गेम के आइकन से उसे खोलें।', 'गेम इंस्टॉल करें'],
    zh: ['如何安装', '文件', '添加到程序坞', '共享', '添加到主屏幕', '作为网页 App 打开', '添加', '如果没有添加选项，请滚动到共享菜单底部，选择“编辑操作”。如果共享按钮被隐藏，请打开 Safari 的页面菜单。', '点击游戏图标即可打开。', '安装游戏']
  };
  let promptEvent;
  let installed = false;

  const panel = document.createElement('div');
  panel.className = 'game-install';
  panel.hidden = true;
  const button = document.createElement('button');
  button.type = 'button';
  const instructions = document.createElement('section');
  instructions.id = 'game-install-instructions';
  instructions.className = 'install-guide';
  instructions.hidden = true;

  const devices = document.createElement('div');
  devices.className = 'install-devices';
  for (const [id, name] of [['mac', 'Mac'], ['iphone', 'iPhone']]) {
    const control = document.createElement('button');
    control.type = 'button';
    control.dataset.device = id;
    control.textContent = name;
    control.onclick = () => { device = id; render(); };
    devices.append(control);
  }

  const steps = document.createElement('ol');
  steps.className = 'install-steps';
  const fallback = document.createElement('p');
  const finish = document.createElement('div');
  finish.className = 'install-finish';
  const icon = document.createElement('img');
  icon.src = document.querySelector('link[rel="apple-touch-icon"]').href;
  icon.alt = '';
  icon.width = icon.height = 32;
  const finishText = document.createElement('span');
  finish.append(icon, finishText);
  instructions.append(devices, steps, fallback, finish);
  panel.append(button, instructions);
  document.querySelector('main').before(panel);

  function step(mark, label) {
    const item = document.createElement('li');
    const symbol = document.createElement('span');
    symbol.className = 'install-symbol';
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = mark;
    const text = document.createElement('strong');
    text.textContent = label;
    item.append(symbol, text);
    return item;
  }

  function render() {
    const standalone = installedDisplay.matches || navigator.standalone === true;
    panel.hidden = installed || standalone || (!promptEvent && !hasInstructions);
    const lang = document.documentElement.lang.split('-')[0];
    const [label, file, dock, share, home, webApp, add, missing, launch, install] = copy[lang] ?? copy.en;
    const manual = hasInstructions && !promptEvent;
    button.textContent = manual ? label : install;
    if (manual) {
      button.setAttribute('aria-controls', instructions.id);
      button.setAttribute('aria-expanded', String(!instructions.hidden));
    } else {
      instructions.hidden = true;
      button.removeAttribute('aria-controls');
      button.removeAttribute('aria-expanded');
    }
    for (const control of devices.children) control.setAttribute('aria-pressed', String(control.dataset.device === device));
    const phone = device === 'iphone';
    const shareStep = step('↑', share);
    shareStep.classList.add('install-share-step');
    steps.replaceChildren(...(phone
      ? [shareStep, step('⊞', home), step('●', webApp), step('✓', add)]
      : [step('▤', file), step('⊞', dock), step('✓', add)]));
    fallback.hidden = !phone;
    fallback.textContent = missing;
    finishText.textContent = launch;
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    promptEvent = event;
    render();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    promptEvent = undefined;
    render();
  });
  button.addEventListener('click', async () => {
    if (!promptEvent) {
      instructions.hidden = !instructions.hidden;
      render();
      return;
    }
    const request = promptEvent;
    promptEvent = undefined;
    button.disabled = true;
    try {
      await request.prompt();
      installed ||= (await request.userChoice).outcome === 'accepted';
    } catch { /* The browser can withdraw an installation offer. */ }
    finally {
      button.disabled = false;
      render();
    }
  });
  installedDisplay.addEventListener('change', render);
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  render();
})();

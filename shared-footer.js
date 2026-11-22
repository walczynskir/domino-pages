/* Shared footer copy, independent of the games' translation engines. */
(() => {
  const copy = {
    "pl": ["Dobra gra może zrobić coś dobrego.","Jeśli chcesz, wesprzyj pomoc osobom dotkniętym wojną w Ukrainie lub psom i kotom w Gdyni.","Pomoc Ukrainie · PAH","Pomoc psom i kotom · Ciapkowo w Gdyni","Linki prowadzą do oficjalnych stron organizacji. Nie zbieramy wpłat ani nie pobieramy prowizji.","Autorzy i licencje","Gra automatycznie zapisuje bieżącą partię. Możesz ją wznowić w tej samej przeglądarce na tym samym urządzeniu."],
    "en": ["A good game can do some good.","You can support people affected by the war in Ukraine or help dogs and cats in Gdynia.","Support Ukraine · PAH","Help dogs and cats · Ciapkowo in Gdynia","The links go to the organizations’ official websites. We do not collect donations or take a commission.","Credits and licenses","Your current game is saved automatically. You can resume it in the same browser on the same device."],
    "de": ["Ein gutes Spiel kann Gutes tun.","Unterstütze vom Krieg in der Ukraine betroffene Menschen oder Hunde und Katzen in Gdynia.","Hilfe für die Ukraine · PAH","Hilfe für Hunde und Katzen · Ciapkowo in Gdynia","Die Links führen zu den offiziellen Seiten der Organisationen. Wir sammeln keine Spenden und erhalten keine Provision.","Mitwirkende und Lizenzen","Die laufende Partie wird automatisch gespeichert. Du kannst sie im selben Browser auf demselben Gerät fortsetzen."],
    "es": ["Un buen juego puede hacer el bien.","Puedes apoyar a las personas afectadas por la guerra en Ucrania o ayudar a perros y gatos en Gdynia.","Apoya a Ucrania · PAH","Ayuda a perros y gatos · Ciapkowo en Gdynia","Los enlaces llevan a los sitios oficiales. No recaudamos donaciones ni cobramos comisiones.","Créditos y licencias","La partida actual se guarda automáticamente. Puedes continuarla en el mismo navegador y en el mismo dispositivo."],
    "fr": ["Un bon jeu peut faire du bien.","Vous pouvez soutenir les personnes touchées par la guerre en Ukraine ou aider les chiens et chats de Gdynia.","Soutenir l’Ukraine · PAH","Aider les chiens et chats · Ciapkowo à Gdynia","Les liens mènent aux sites officiels. Nous ne collectons aucun don et ne prélevons aucune commission.","Crédits et licences","La partie en cours est enregistrée automatiquement. Vous pouvez la reprendre dans le même navigateur sur le même appareil."],
    "it": ["Un buon gioco può fare del bene.","Puoi aiutare le persone colpite dalla guerra in Ucraina oppure cani e gatti a Gdynia.","Aiuta l’Ucraina · PAH","Aiuta cani e gatti · Ciapkowo a Gdynia","I link portano ai siti ufficiali. Non raccogliamo donazioni né riceviamo commissioni.","Crediti e licenze","La partita in corso viene salvata automaticamente. Puoi riprenderla nello stesso browser sullo stesso dispositivo."],
    "uk": ["Хороша гра може зробити добру справу.","Ви можете підтримати людей, які постраждали від війни в Україні, або допомогти собакам і котам у Гдині.","Допомога Україні · PAH","Допомога собакам і котам · Ciapkowo у Гдині","Посилання ведуть на офіційні сайти організацій. Ми не збираємо внесків і не беремо комісій.","Автори й ліцензії","Поточна партія зберігається автоматично. Ви можете продовжити її в тому самому браузері на тому самому пристрої."],
    "ar": ["لعبة جيدة يمكن أن تفعل الخير.","يمكنك مساعدة المتضررين من الحرب في أوكرانيا أو مساعدة الكلاب والقطط في غدينيا.","ادعم أوكرانيا · PAH","ساعد الكلاب والقطط · Ciapkowo في غدينيا","تنقلك الروابط إلى المواقع الرسمية للمنظمات. لا نجمع التبرعات ولا نتقاضى عمولة.","المساهمون والتراخيص","تُحفَظ اللعبة الحالية تلقائيًا. يمكنك متابعتها في المتصفح نفسه على الجهاز نفسه."],
    "hi": ["एक अच्छा खेल भलाई कर सकता है।","आप यूक्रेन में युद्ध से प्रभावित लोगों या ग्डीनिया के कुत्तों और बिल्लियों की मदद कर सकते हैं।","यूक्रेन की मदद करें · PAH","कुत्तों और बिल्लियों की मदद · ग्डीनिया में Ciapkowo","लिंक संगठनों की आधिकारिक वेबसाइटों पर ले जाते हैं। हम चंदा या कमीशन नहीं लेते।","श्रेय और लाइसेंस","मौजूदा खेल अपने आप सहेजा जाता है। आप उसी डिवाइस पर उसी ब्राउज़र में इसे जारी रख सकते हैं।"],
    "zh-Hans": ["好游戏也能传递善意。","你可以帮助受乌克兰战争影响的人们，或帮助格丁尼亚的猫狗。","援助乌克兰 · PAH","帮助猫狗 · 格丁尼亚 Ciapkowo","链接指向机构官方网站。我们不代收捐款，也不收取佣金。","制作人员与许可","当前对局会自动保存。你可以在同一设备的同一浏览器中继续。"]
  };
  const keys = ["title","intro","ukraine","shelter","note","credits"];
  const fields = document.querySelectorAll('.game-footer [data-footer-copy]');
  const root = document.documentElement;
  function renderSaveHelp(container) {
    const text = (copy[root.lang] ?? copy.en).at(-1);
    for (const field of container.querySelectorAll('[data-save-help]')) {
      if (field.textContent !== text) field.textContent = text;
    }
  }
  function render() {
    const row = copy[root.lang] ?? copy.en;
    renderSaveHelp(document);
    for (const field of fields) {
      const text = row[keys.indexOf(field.dataset.footerCopy)];
      if (field.textContent !== text) field.textContent = text;
    }
  }
  window.renderGameSaveHelp = renderSaveHelp;
  new MutationObserver(render).observe(root, { attributes: true, attributeFilter: ['lang'] });
  render();
})();

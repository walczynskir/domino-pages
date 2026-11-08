(() => {
  const trophy = '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="shared-victory-gold" x2="0" y2="1"><stop stop-color="#fff1aa"/><stop offset=".5" stop-color="#f8c94d"/><stop offset="1" stop-color="#d78a26"/></linearGradient></defs><path d="M18 10h28v15c0 10-6 17-14 17s-14-7-14-17z" fill="url(#shared-victory-gold)" stroke="#ffe2a0" stroke-width="2"/><path d="M18 15H8v5c0 9 5 14 13 14m25-19h10v5c0 9-5 14-13 14M32 42v10m-11 3h22" fill="none" stroke="#f4bd53" stroke-width="4" stroke-linecap="round"/><path d="m32 17 2.5 5 5.5.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-.8z" fill="#fff2b4"/></svg>';
  let wasWon = false;
  let timer;
  let overlay;

  window.GameVictory = (won, title, table) => {
    if (won === wasWon) return;
    wasWon = won;
    clearTimeout(timer);
    overlay?.remove();
    if (!won) return;

    overlay = document.createElement('div');
    overlay.className = 'shared-victory';
    if (table) {
      const bounds = table.getBoundingClientRect();
      const top = Math.max(96, Math.min(innerHeight - 96, bounds.bottom - bounds.height / 4));
      overlay.style.setProperty('--victory-left', bounds.left + bounds.width / 2 + 'px');
      overlay.style.setProperty('--victory-top', top + 'px');
    }
    const caption = document.createElement('div');
    caption.className = 'shared-victory-caption';
    caption.setAttribute('role', 'status');
    const label = document.createElement('strong');
    label.textContent = title;
    caption.innerHTML = trophy;
    caption.append(label);
    overlay.append(caption);
    const colors = ['#d44758', '#f8c94d', '#2979bc', '#3c9668', '#9d62c1'];
    const count = 32;
    for (let index = 0; index < count; index++) {
      const piece = document.createElement('i');
      const angle = index * Math.PI * 2 / count;
      const distance = 95 + (index % 4) * 24;
      piece.setAttribute('aria-hidden', 'true');
      piece.style.setProperty('--x', Math.cos(angle) * distance + 'px');
      piece.style.setProperty('--y', Math.sin(angle) * distance + 'px');
      piece.style.setProperty('--spin', (index * 47 % 360) + 'deg');
      piece.style.backgroundColor = colors[index % colors.length];
      overlay.append(piece);
    }
    document.body.append(overlay);
    timer = setTimeout(() => overlay.remove(), 4800);
  };
})();

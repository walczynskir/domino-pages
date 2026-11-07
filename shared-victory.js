(() => {
  const trophy = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 10h28v15c0 10-6 17-14 17s-14-7-14-17z" fill="#f8c94d" stroke="#8b5300" stroke-width="2"/><path d="M18 15H8v5c0 9 5 14 13 14m25-19h10v5c0 9-5 14-13 14M32 42v10m-11 3h22" fill="none" stroke="#8b5300" stroke-width="4" stroke-linecap="round"/><path d="m32 17 2.5 5 5.5.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-.8z" fill="#fff2b4"/></svg>';
  let wasWon = false;
  let timer;
  let overlay;

  window.GameVictory = (won, title) => {
    if (won === wasWon) return;
    wasWon = won;
    clearTimeout(timer);
    overlay?.remove();
    if (!won) return;

    overlay = document.createElement('div');
    overlay.className = 'shared-victory';
    const caption = document.createElement('div');
    caption.className = 'shared-victory-caption';
    caption.setAttribute('role', 'status');
    const label = document.createElement('strong');
    label.textContent = title;
    caption.innerHTML = trophy;
    caption.append(label);
    overlay.append(caption);
    const colors = ['#d44758', '#f8c94d', '#2979bc', '#3c9668', '#9d62c1'];
    for (let index = 0; index < 24; index++) {
      const piece = document.createElement('i');
      const angle = index * Math.PI * 2 / 24;
      const distance = 85 + (index % 4) * 22;
      piece.setAttribute('aria-hidden', 'true');
      piece.style.setProperty('--x', Math.cos(angle) * distance + 'px');
      piece.style.setProperty('--y', Math.sin(angle) * distance + 'px');
      piece.style.setProperty('--spin', (index * 47 % 360) + 'deg');
      piece.style.backgroundColor = colors[index % colors.length];
      overlay.append(piece);
    }
    document.body.append(overlay);
    timer = setTimeout(() => overlay.remove(), 4200);
  };
})();

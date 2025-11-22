(function () {
  const cfg = window.FLIPBOOK_CONFIG;
  const total = cfg.totalPages;
  const flipbook = document.getElementById('flipbook');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const indicator = document.getElementById('pageIndicator');

  let current = 1;
  let isAnimating = false;

  function pageUrl(idx) {
    return `${cfg.path}${String(idx).padStart(2, '0')}.${cfg.ext}`;
  }
  function preload(idx) {
    if (idx < 1 || idx > total) return;
    const img = new Image();
    img.src = pageUrl(idx);
  }

  function renderPage(idx) {
    const page = document.createElement('section');
    page.className = 'page';
    page.setAttribute('role', 'group');
    page.setAttribute('aria-label', `Pagina ${idx} di ${total}`);

    const sheet = document.createElement('div'); sheet.className = 'sheet';

    const front = document.createElement('div'); front.className = 'face front';
    const imgF = document.createElement('img'); imgF.alt = `Pagina ${idx}`; imgF.src = pageUrl(idx); front.appendChild(imgF);

    const back = document.createElement('div'); back.className = 'face back';
    const nextIdx = Math.min(idx + 1, total);
    const imgB = document.createElement('img'); imgB.alt = `Pagina ${nextIdx}`; imgB.src = pageUrl(nextIdx); back.appendChild(imgB);

    sheet.appendChild(front); sheet.appendChild(back);
    page.appendChild(sheet);
    flipbook.appendChild(page);

    // Click: sinistra = indietro, destra = avanti
    page.addEventListener('click', (e) => {
      if (isAnimating) return;
      const rect = page.getBoundingClientRect();
      const isLeft = (e.clientX - rect.left) < rect.width / 2;
      if (isLeft) goPrev(); else goNext();
    });

    // Swipe mobile
    let startX = null;
    page.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    page.addEventListener('touchend', (e) => {
      if (startX == null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { dx < 0 ? goNext() : goPrev(); }
      startX = null;
    });

    return { sheet };
  }

  function updateIndicator() {
    indicator.textContent = `${current} / ${total}`;
    prevBtn.disabled = current <= 1;
    nextBtn.disabled = current >= total;
  }
  function clearFlipbook() { while (flipbook.firstChild) flipbook.removeChild(flipbook.firstChild); }
  function draw() {
    clearFlipbook();
    const { sheet } = renderPage(current);
    sheet.classList.remove('turning');
    preload(current + 1);
    preload(current - 1);
    updateIndicator();
  }
  function animateTurn(done) {
    if (isAnimating) return;
    isAnimating = true;
    const sheet = flipbook.querySelector('.sheet');
    if (!sheet) { done(); isAnimating = false; return; }
    sheet.classList.add('turning');
    setTimeout(() => { done(); isAnimating = false; }, 380);
  }
  function goNext() { if (current >= total) return; animateTurn(() => { current++; draw(); }); }
  function goPrev() { if (current <= 1) return; animateTurn(() => { current--; draw(); }); }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') goNext();
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') goPrev();
  });
  prevBtn.addEventListener('click', goPrev);
  nextBtn.addEventListener('click', goNext);

  draw();
})();
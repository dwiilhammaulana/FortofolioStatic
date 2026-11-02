document.addEventListener('DOMContentLoaded', () => {
  const portrait = document.querySelector('.hero-image');
  const portraitImages = [...(portrait?.querySelectorAll('.hero-img') ?? [])];
  if (portrait && portraitImages.length === 2) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let visible = true;
    let timer;
    let wheelGestureTimer;
    let wheelGestureActive = false;
    let pointerOverPortrait = false;
    let touchStartY = null;
    let transitioning = false;

    const showPortrait = (index) => {
      if (index === current || transitioning || !portraitImages[index].complete || !portraitImages[index].naturalWidth) return;
      const outgoing = portraitImages[current];
      const incoming = portraitImages[index];
      current = index;
      outgoing.setAttribute('aria-hidden', 'true');
      incoming.setAttribute('aria-hidden', 'false');
      if (reducedMotion.matches) {
        outgoing.classList.remove('is-active');
        incoming.classList.add('is-active');
        return;
      }
      transitioning = true;
      outgoing.classList.remove('is-active');
      outgoing.classList.add('is-exiting');
      incoming.classList.add('is-active', 'is-entering');
      setTimeout(() => {
        outgoing.classList.remove('is-exiting');
        incoming.classList.remove('is-entering');
        transitioning = false;
      }, 750);
    };
    const syncTimer = () => {
      clearInterval(timer);
      timer = undefined;
      if (visible && !document.hidden && !reducedMotion.matches) {
        timer = setInterval(() => showPortrait(1 - current), 3000);
      }
    };
    const advancePortrait = () => {
      showPortrait(1 - current);
      syncTimer();
    };

    if ('IntersectionObserver' in window) {
      visible = false;
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        syncTimer();
      }, { threshold: 0.2 });
      observer.observe(portrait);
    } else {
      syncTimer();
    }
    document.addEventListener('visibilitychange', syncTimer);
    reducedMotion.addEventListener?.('change', syncTimer);
    portrait.querySelector('.portrait-switch')?.addEventListener('click', advancePortrait);
    portrait.addEventListener('pointerenter', () => { pointerOverPortrait = true; });
    portrait.addEventListener('pointerleave', () => { pointerOverPortrait = false; });
    window.addEventListener('wheel', (event) => {
      if (!pointerOverPortrait || Math.abs(event.deltaY) < 8) return;
      if (!wheelGestureActive) advancePortrait();
      wheelGestureActive = true;
      clearTimeout(wheelGestureTimer);
      wheelGestureTimer = setTimeout(() => { wheelGestureActive = false; }, 350);
    }, { passive: true, capture: true });
    portrait.addEventListener('touchstart', (event) => {
      touchStartY = event.touches[0]?.clientY ?? null;
    }, { passive: true });
    portrait.addEventListener('touchend', (event) => {
      if (touchStartY !== null && Math.abs((event.changedTouches[0]?.clientY ?? touchStartY) - touchStartY) > 40) {
        advancePortrait();
      }
      touchStartY = null;
    }, { passive: true });
  }

  const hamburger = document.getElementById('hamburger');
  const menu = document.querySelector('.nav-menu');
  const updateMenu = () => {
    const open = Boolean(menu?.classList.contains('active'));
    hamburger?.setAttribute('aria-expanded', String(open));
    hamburger?.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  };
  hamburger?.addEventListener('click', updateMenu);
  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', updateMenu));

  let previewTrigger = null;
  const preview = document.getElementById('lightbox');
  const previewClose = preview?.querySelector('.close');
  document.querySelectorAll('.view-image, .view-cert').forEach((link) => {
    link.addEventListener('click', () => {
      previewTrigger = link;
      previewClose?.focus();
    });
  });
  const restorePreviewFocus = () => {
    if (!preview?.classList.contains('active')) previewTrigger?.focus();
  };
  previewClose?.addEventListener('click', restorePreviewFocus);
  preview?.addEventListener('click', restorePreviewFocus);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') restorePreviewFocus();
  });

  const links = [...document.querySelectorAll('.nav-link[href^="#"]')];
  const sections = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!current) return;
      links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${current.target.id}`));
    }, { rootMargin: '-25% 0px -55% 0px', threshold: 0 });
    sections.forEach((section) => observer.observe(section));
  }
});

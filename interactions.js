document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const hero = document.querySelector('.hero-image');
  const frame = document.querySelector('.portrait-frame');
  const cards = document.querySelectorAll('.photo-item, .design-item, .dev-item');

  if (finePointer.matches && !reducedMotion.matches) {
    const aura = document.createElement('div');
    aura.className = 'cursor-aura';
    aura.setAttribute('aria-hidden', 'true');
    document.body.append(aura);
    let pointerX = -300;
    let pointerY = -300;
    let auraX = pointerX;
    let auraY = pointerY;

    document.addEventListener('pointermove', (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      aura.classList.add('visible');
    }, { passive: true });
    document.addEventListener('pointerout', (event) => {
      if (!event.relatedTarget) aura.classList.remove('visible');
    });

    function drawAura() {
      auraX += (pointerX - auraX) * .16;
      auraY += (pointerY - auraY) * .16;
      aura.style.transform = `translate3d(${auraX - 150}px, ${auraY - 150}px, 0)`;
      if (!document.hidden) requestAnimationFrame(drawAura);
    }
    drawAura();
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) requestAnimationFrame(drawAura);
    });

    hero?.addEventListener('pointermove', (event) => {
      const rect = frame.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
      hero.style.setProperty('--photo-x', `${x}%`);
      hero.style.setProperty('--photo-y', `${y}%`);
      hero.style.transform = `translate3d(${(x - 50) * .1}px, ${(y - 50) * .1}px, 0)`;
    }, { passive: true });
    hero?.addEventListener('pointerleave', () => {
      hero.style.transform = '';
      hero.style.setProperty('--photo-x', '50%');
      hero.style.setProperty('--photo-y', '40%');
    });

    cards.forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--card-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--card-y', `${event.clientY - rect.top}px`);
      }, { passive: true });
    });
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

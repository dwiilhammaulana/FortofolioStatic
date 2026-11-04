document.addEventListener('DOMContentLoaded', () => {
  const portrait = document.querySelector('.hero-image');
  const portraitImages = [...(portrait?.querySelectorAll('.hero-img') ?? [])];
  if (portrait && portraitImages.length === 2) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let visible = true;
    let timer;
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
        timer = setInterval(() => showPortrait(1 - current), 5000);
      }
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
  }

  const workShowcase = document.querySelector('.skill-photo-showcase');
  const workSlides = [...(workShowcase?.querySelectorAll('.work-photo-slide') ?? [])];
  const workControls = [...(workShowcase?.querySelectorAll('[data-slide]') ?? [])];
  const workCounter = workShowcase?.querySelector('[data-slide-counter]');
  if (workShowcase && workSlides.length > 1) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let visible = true;
    let timer;

    const showWork = (index) => {
      const next = (index + workSlides.length) % workSlides.length;
      if (next === current) return;
      workSlides.forEach((slide, slideIndex) => {
        const active = slideIndex === next;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
        slide.tabIndex = active ? 0 : -1;
      });
      workControls.forEach((control, controlIndex) => {
        const active = controlIndex === next;
        control.classList.toggle('is-active', active);
        control.setAttribute('aria-pressed', String(active));
      });
      current = next;
      if (workCounter) workCounter.textContent = String(current + 1).padStart(2, '0');
    };

    const syncTimer = () => {
      clearInterval(timer);
      timer = undefined;
      if (visible && !document.hidden && !reducedMotion.matches) {
        timer = setInterval(() => showWork(current + 1), 5000);
      }
    };

    workControls.forEach((control, index) => {
      control.addEventListener('click', () => {
        showWork(index);
        syncTimer();
      });
    });

    if ('IntersectionObserver' in window) {
      visible = false;
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        syncTimer();
      }, { threshold: 0.2 });
      observer.observe(workShowcase);
    } else {
      syncTimer();
    }
    document.addEventListener('visibilitychange', syncTimer);
    reducedMotion.addEventListener?.('change', syncTimer);
  }

  const hamburger = document.getElementById('hamburger');
  const menu = document.querySelector('.nav-menu');
  const menuIcon = hamburger?.querySelector('i');
  hamburger?.setAttribute('aria-controls', 'primary-navigation');
  const setMenuOpen = (open) => {
    menu?.classList.toggle('active', open);
    hamburger?.setAttribute('aria-expanded', String(open));
    hamburger?.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    menuIcon?.classList.toggle('fa-bars', !open);
    menuIcon?.classList.toggle('fa-times', open);
  };
  hamburger?.addEventListener('click', () => setMenuOpen(!menu?.classList.contains('active')));
  document.querySelector('.logo')?.addEventListener('click', () => setMenuOpen(false));
  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));
  document.addEventListener('click', (event) => {
    if (menu?.classList.contains('active') && !event.target.closest('#header')) setMenuOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu?.classList.contains('active')) {
      setMenuOpen(false);
      hamburger?.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && menu?.classList.contains('active')) setMenuOpen(false);
  });

  let previewTrigger = null;
  const preview = document.getElementById('lightbox');
  const previewClose = preview?.querySelector('.close');
  document.querySelectorAll('.view-image').forEach((link) => {
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

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

  const phoneStage = document.querySelector('.about-phone-anatomy');
  const phoneObject = phoneStage?.querySelector('object');
  if (phoneStage && phoneObject) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const state = { x: 0, y: 0, lift: 0, targetX: 0, targetY: 0, targetLift: 0 };
    let handset;
    let dial;
    let frame = 0;
    let lastTime = 0;
    let visible = true;

    const connectPhoneParts = () => {
      const phoneDocument = phoneObject.contentDocument;
      handset = phoneDocument?.querySelector('[data-assembly="handset"]');
      dial = phoneDocument?.querySelector('[data-assembly="dial"]');
      [handset, dial].forEach((part) => {
        if (!part) return;
        part.style.transformBox = 'fill-box';
        part.style.transformOrigin = 'center';
      });
    };

    const drawPhone = () => {
      const { x, y, lift } = state;
      phoneObject.style.transform = `perspective(540px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg) translateY(${(-lift * 2).toFixed(2)}px) rotate(-1.5deg) scale(${(1.03 + lift * .025).toFixed(3)})`;
      if (handset) handset.style.transform = `translate(${(x * 2).toFixed(2)}px, ${(-lift * 8 + y).toFixed(2)}px) rotate(${(x * 1.4).toFixed(2)}deg)`;
      if (dial) dial.style.transform = `rotate(${(x * 12 + lift * 5).toFixed(2)}deg)`;
    };

    const settled = () => (
      Math.abs(state.x - state.targetX) < .002 &&
      Math.abs(state.y - state.targetY) < .002 &&
      Math.abs(state.lift - state.targetLift) < .002
    );

    const tick = (time) => {
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 1 / 30) : 1 / 60;
      lastTime = time;
      const follow = (value, target, response) => reducedMotion.matches
        ? target
        : value + (target - value) * (1 - Math.exp(-delta / response));
      state.x = follow(state.x, state.targetX, .18);
      state.y = follow(state.y, state.targetY, .18);
      state.lift = follow(state.lift, state.targetLift, .22);
      drawPhone();
      frame = visible && !settled() ? requestAnimationFrame(tick) : 0;
    };

    const animatePhone = () => {
      if (frame || !visible) return;
      lastTime = 0;
      frame = requestAnimationFrame(tick);
    };

    const setPhoneTarget = (x, y, lift) => {
      state.targetX = Math.max(-1, Math.min(1, x));
      state.targetY = Math.max(-1, Math.min(1, y));
      state.targetLift = Math.max(0, Math.min(1, lift));
      animatePhone();
    };

    const resetPhone = () => setPhoneTarget(0, 0, 0);

    phoneObject.addEventListener('load', () => {
      connectPhoneParts();
      drawPhone();
    });
    if (phoneObject.contentDocument?.documentElement) connectPhoneParts();

    phoneStage.addEventListener('pointerenter', () => setPhoneTarget(.15, -.1, 1));
    phoneStage.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch') return;
      const bounds = phoneStage.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
      setPhoneTarget(x, y, 1);
    });
    phoneStage.addEventListener('pointerleave', resetPhone);
    phoneStage.addEventListener('focus', () => setPhoneTarget(.35, -.2, 1));
    phoneStage.addEventListener('blur', resetPhone);
    phoneStage.addEventListener('keydown', (event) => {
      const step = event.shiftKey ? .45 : .2;
      if (event.key === 'ArrowLeft') state.targetX -= step;
      else if (event.key === 'ArrowRight') state.targetX += step;
      else if (event.key === 'ArrowUp') state.targetY -= step;
      else if (event.key === 'ArrowDown') state.targetY += step;
      else if (event.key === 'Enter' || event.key === ' ') state.targetLift = state.targetLift > .5 ? 0 : 1;
      else if (event.key === 'Escape') {
        state.targetX = 0;
        state.targetY = 0;
        state.targetLift = 0;
      } else return;
      event.preventDefault();
      state.targetX = Math.max(-1, Math.min(1, state.targetX));
      state.targetY = Math.max(-1, Math.min(1, state.targetY));
      animatePhone();
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (!visible && frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        } else if (visible && !settled()) {
          animatePhone();
        }
      }, { rootMargin: '120px' });
      observer.observe(phoneStage);
    }
    reducedMotion.addEventListener?.('change', animatePhone);
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

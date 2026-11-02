document.addEventListener('DOMContentLoaded', () => {
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

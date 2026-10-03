(() => {
  const root = document.documentElement;
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const themeToggle = document.querySelector('.theme-toggle');
  const toast = document.querySelector('.toast');

  // Mobile navigation stays keyboard accessible and closes after navigation.
  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    navLinks?.classList.toggle('open', !isOpen);
  });
  navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open navigation');
  }));

  // Remember the visitor's theme preference when storage is available.
  const updateThemeLabel = () => {
    const light = root.dataset.theme === 'light';
    themeToggle?.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    themeToggle?.setAttribute('title', light ? 'Switch to dark theme' : 'Switch to light theme');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#f5f7fa' : '#0b0e14');
  };
  updateThemeLabel();
  themeToggle?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('cb-theme', root.dataset.theme); } catch (_) { /* Storage can be unavailable in private contexts. */ }
    updateThemeLabel();
  });

  // Reveal content as it enters view; show it all when observers are unavailable.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach(item => observer.observe(item));
  } else revealItems.forEach(item => item.classList.add('is-visible'));

  // Scroll progress, active section, and back-to-top affordance share one passive listener.
  const progress = document.querySelector('.scroll-progress span');
  const backToTop = document.querySelector('.back-to-top');
  const sections = [...document.querySelectorAll('main section[id]')];
  const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  let ticking = false;
  const updateScrollState = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0}%`;
    backToTop?.classList.toggle('visible', window.scrollY > 650);
    let current = '';
    for (const section of sections) if (section.getBoundingClientRect().top <= 150) current = section.id;
    sectionLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(updateScrollState); ticking = true; }
  }, { passive: true });
  updateScrollState();
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Project filters only describe the current project statuses.
  const filters = document.querySelectorAll('.filter-btn');
  const projects = document.querySelectorAll('.project-card');
  filters.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filters.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    projects.forEach(project => { project.hidden = filter !== 'all' && project.dataset.status !== filter; });
  }));

  let toastTimer;
  const showToast = message => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2200);
  };
  document.querySelector('.copy-email')?.addEventListener('click', async event => {
    const address = event.currentTarget.dataset.copyEmail;
    try {
      await navigator.clipboard.writeText(address);
      showToast('Email address copied');
    } catch (_) {
      window.location.href = `mailto:${address}`;
      showToast('Opening your email app');
    }
  });

  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
})();

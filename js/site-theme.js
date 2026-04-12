(function () {
  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const scrollProgress = document.getElementById('scrollProgress');
  const revealItems = document.querySelectorAll('.reveal');
  const counters = document.querySelectorAll('[data-count]');

  function initTheme() {
    const savedTheme = localStorage.getItem('plum-theme') || 'light';
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
    }
  }

  window.toggleTheme = function() {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('plum-theme', isDark ? 'dark' : 'light');
    
    // Trigger Lucide icons update if toggle has an icon
    if (window.lucide) window.lucide.createIcons();
  };

  function updateScrollState() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? (window.scrollY / max) * 100 : 0;

    if (scrollProgress) scrollProgress.style.width = `${progress}%`;
    if (header) header.classList.toggle('is-stuck', window.scrollY > 16);
  }

  function initRevealObserver() {
    if (!revealItems.length) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach(item => observer.observe(item));
  }

  function animateCounter(element) {
    const target = Number(element.dataset.count || 0);
    const suffix = target >= 1000 ? '+' : '';
    const duration = 1200;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      element.textContent = value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  function initCounterObserver() {
    if (!counters.length) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  }

  function initNav() {
    if (!navToggle) return;

    navToggle.addEventListener('click', () => {
      const isOpen = document.body.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.querySelectorAll('.site-nav a').forEach(link => {
      link.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateScrollState();
    initRevealObserver();
    initCounterObserver();
    initNav();
  });

  window.addEventListener('scroll', updateScrollState, { passive: true });
  window.addEventListener('resize', updateScrollState);
})();

// Scroll reveal animation
  function checkVisibility() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    reveals.forEach(el => {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < windowHeight - 100) {
        el.classList.add('visible');
      }
    });
  }

  // Nav scroll background
  function handleNavScroll() {
    const nav = document.getElementById('nav');
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  // Artist carousel scroll
  function initCarousel() {
    const track = document.getElementById('artistTrack');
    const leftBtn = document.getElementById('scrollLeft');
    const rightBtn = document.getElementById('scrollRight');
    if (!track) return;
    const scrollAmount = 300;
    if (leftBtn) {
      leftBtn.addEventListener('click', () => {
        track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });
    }
    if (rightBtn) {
      rightBtn.addEventListener('click', () => {
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
    }
  }

  // Search alert (example)
  function handleSearch() {
    alert('Search feature coming soon!');
  }
  window.handleSearch = handleSearch;

  // Event listeners
  window.addEventListener('scroll', () => {
    checkVisibility();
    handleNavScroll();
  });
  window.addEventListener('resize', checkVisibility);
  window.addEventListener('load', () => {
    checkVisibility();
    handleNavScroll();
    initCarousel();
  });


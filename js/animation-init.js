/**
 * ═══════════════════════════════════════════════════════════════
 *   ANIMATION INITIALIZATION & APPLICATION
 *   Apply premium animations to dashboards and pages
 * ═══════════════════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', () => {
  initializeAnimations();
});

function initializeAnimations() {
  // Initialize scroll animations for common elements
  scrollAnimationManager.observe('.card-premium');
  scrollAnimationManager.observe('.scroll-fade');
  scrollAnimationManager.observe('.scroll-slide-left');
  scrollAnimationManager.observe('.scroll-slide-right');
  scrollAnimationManager.observe('.scroll-scale');

  // Add hover effects to cards and buttons
  HoverAnimationManager.addHoverLift('.card-premium');
  HoverAnimationManager.addHoverScale('.btn-premium');
  HoverAnimationManager.addHoverGlow('[data-glow="true"]');

  // Stagger animations for lists
  initializeStaggerAnimations();

  // Initialize tooltips
  initializeTooltips();

  // Initialize dropdowns
  initializeDropdowns();

  // Add smooth transitions to interactive elements
  setupSmoothTransitions();
}

function initializeStaggerAnimations() {
  // Stagger boards/cards on dashboard
  const dashboardCards = document.querySelectorAll('.dashboard-grid > *');
  if (dashboardCards.length > 0) {
    dashboardCards.forEach((card, index) => {
      card.style.setProperty('--stagger-delay', `${index * 80}ms`);
      card.classList.add('animate-fade-in');
      card.style.opacity = '0';
      setTimeout(() => {
        card.style.opacity = '1';
      }, index * 80);
    });
  }

  // Stagger list items
  const listItems = document.querySelectorAll('ul.stagger-animation > li, .list-stagger > *');
  listItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 80}ms`;
  });
}

function initializeTooltips() {
  const tooltips = document.querySelectorAll('[data-tooltip]');
  tooltips.forEach((element) => {
    const tooltipText = element.dataset.tooltip;
    const wrapper = document.createElement('div');
    wrapper.className = 'tooltip-premium';

    element.parentNode.insertBefore(wrapper, element);
    wrapper.appendChild(element);

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip-text';
    tooltip.textContent = tooltipText;
    wrapper.appendChild(tooltip);
  });
}

function initializeDropdowns() {
  const dropdowns = document.querySelectorAll('.dropdown-premium');
  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const menu = dropdown.querySelector('.dropdown-menu');

    if (trigger && menu) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });

      const items = menu.querySelectorAll('.dropdown-item');
      items.forEach((item) => {
        item.addEventListener('click', () => {
          dropdown.classList.remove('active');
        });
      });
    }
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', () => {
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove('active');
    });
  });
}

function setupSmoothTransitions() {
  // Add transition class to interactive elements
  const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
  interactiveElements.forEach((element) => {
    if (!element.classList.contains('no-transition')) {
      element.classList.add('transition-smooth');
    }
  });

  // Smooth page load animation
  document.body.classList.add('animate-fade-in');

  // Smooth scroll behavior
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });
}

// Dashboard-specific animations
function initializeDashboardAnimations() {
  // Animate metric cards
  const metrics = document.querySelectorAll('.metric-card, .stat-box');
  metrics.forEach((card, index) => {
    card.style.opacity = '0';
    setTimeout(() => {
      card.classList.add('animate-slide-in-up');
      card.style.opacity = '1';
    }, index * 150);
  });

  // Animate chart containers
  const charts = document.querySelectorAll('[class*="chart"], canvas');
  charts.forEach((chart) => {
    chart.parentElement?.classList.add('animate-fade-in');
  });

  // Animate sidebar items
  const sidebarItems = document.querySelectorAll('.sidebar .nav-item, .sb-item');
  sidebarItems.forEach((item, index) => {
    item.style.opacity = '0';
    setTimeout(() => {
      item.classList.add('animate-slide-in-left');
      item.style.opacity = '1';
    }, index * 50);
  });
}

// Page load progress indicator
function showPageLoadProgress() {
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent), var(--purple));
    width: 0;
    z-index: 10000;
    transition: width 0.3s ease;
  `;

  document.body.appendChild(progressBar);

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 30;
    if (progress > 90) progress = 90;
    progressBar.style.width = progress + '%';
  }, 200);

  window.addEventListener('load', () => {
    clearInterval(interval);
    progressBar.style.width = '100%';
    setTimeout(() => {
      progressBar.style.opacity = '0';
      progressBar.style.transition = 'opacity 0.5s ease';
      setTimeout(() => progressBar.remove(), 500);
    }, 500);
  });
}

// Parallax scroll effect
function initializeParallaxScroll() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');

  if (parallaxElements.length === 0) return;

  window.addEventListener('scroll', () => {
    parallaxElements.forEach((element) => {
      const speed = element.dataset.parallax || 0.5;
      const yPos = window.scrollY * speed;
      element.style.transform = `translateY(${yPos}px)`;
    });
  });
}

// Animated counters
function animateCounters() {
  const counters = document.querySelectorAll('[data-target]');

  counters.forEach((counter) => {
    const target = parseInt(counter.dataset.target);
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60fps

    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        counter.textContent = target.toLocaleString();
        clearInterval(timer);
      } else {
        counter.textContent = Math.floor(current).toLocaleString();
      }
    }, 16);
  });
}

// Smooth section transitions
function smoothSectionTransitions() {
  const sections = document.querySelectorAll('section');
  sections.forEach((section, index) => {
    section.style.opacity = '0';
    section.classList.add('will-animate');
    setTimeout(() => {
      section.classList.add('animate-fade-in');
      section.style.opacity = '1';
    }, index * 200);
  });
}

// Add wave animation to buttons on hover
function addWaveAnimation() {
  const buttons = document.querySelectorAll('.btn, button');
  buttons.forEach((button) => {
    button.addEventListener('mousedown', function (e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: rgba(255,255,255,0.5);
        border-radius: 50%;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        animation: ripple 0.6s ease-out;
      `;

      this.style.position = 'relative';
      this.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  });
}

// Magnetic button effect
function addMagneticEffect() {
  const magneticButtons = document.querySelectorAll('[data-magnetic]');

  magneticButtons.forEach((button) => {
    button.addEventListener('mousemove', (e) => {
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const distance = 10;

      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      button.style.transform = `translate(${x}px, ${y}px)`;
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translate(0, 0)';
    });
  });
}

// Export functions
window.initializeDashboardAnimations = initializeDashboardAnimations;
window.showPageLoadProgress = showPageLoadProgress;
window.initializeParallaxScroll = initializeParallaxScroll;
window.animateCounters = animateCounters;
window.smoothSectionTransitions = smoothSectionTransitions;

// Auto-initialize on page load
if (
  document.body.classList.contains('dashboard') ||
  document.body.id.includes('dashboard')
) {
  initializeDashboardAnimations();
}

showPageLoadProgress();
initializeParallaxScroll();
animateCounters();
smoothSectionTransitions();
addWaveAnimation();
addMagneticEffect();

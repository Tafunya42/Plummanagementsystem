/**
 * ═══════════════════════════════════════════════════════════════
 *   PREMIUM ANIMATIONS UTILITY & LOTTIE INTEGRATION
 *   Smooth transitions and Lottie animations for vanilla JS
 * ═══════════════════════════════════════════════════════════════
 */

// Lottie Animation Manager
class LottieAnimationManager {
  constructor() {
    this.animations = new Map();
    this.loadLottieLib();
  }

  // Load Lottie.js Library
  loadLottieLib() {
    if (!window.lottie) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }

  // Initialize a Lottie animation
  initialize(containerId, animationUrl, options = {}) {
    const container = document.getElementById(containerId);
    if (!container || !window.lottie) return null;

    const defaultOptions = {
      container: container,
      renderer: 'svg',
      loop: options.loop ?? true,
      autoplay: options.autoplay ?? true,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice',
      },
    };

    const animationData = {
      path: animationUrl,
      ...defaultOptions,
      ...options,
    };

    const animation = window.lottie.loadAnimation(animationData);
    this.animations.set(containerId, animation);

    return animation;
  }

  // Get animation instance
  getAnimation(containerId) {
    return this.animations.get(containerId);
  }

  // Play animation
  play(containerId) {
    const anim = this.getAnimation(containerId);
    if (anim) anim.play();
  }

  // Pause animation
  pause(containerId) {
    const anim = this.getAnimation(containerId);
    if (anim) anim.pause();
  }

  // Stop animation
  stop(containerId) {
    const anim = this.getAnimation(containerId);
    if (anim) {
      anim.stop();
      anim.goToAndStop(0);
    }
  }

  // Set animation speed
  setSpeed(containerId, speed) {
    const anim = this.getAnimation(containerId);
    if (anim) anim.setSpeed(speed);
  }

  // Destroy animation
  destroy(containerId) {
    const anim = this.getAnimation(containerId);
    if (anim) {
      anim.destroy();
      this.animations.delete(containerId);
    }
  }
}

// Intersection Observer for Scroll Animations
class ScrollAnimationManager {
  constructor(options = {}) {
    this.options = {
      threshold: options.threshold ?? 0.1,
      rootMargin: options.rootMargin ?? '0px 0px -50px 0px',
    };
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      this.options
    );
  }

  // Observe elements for scroll animations
  observe(selector) {
    document.querySelectorAll(selector).forEach((element) => {
      this.observer.observe(element);
    });
  }

  // Handle intersection
  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        entry.target.style.opacity = '1';

        // Optional: unobserve after animation
        if (entry.target.dataset.once === 'true') {
          this.observer.unobserve(entry.target);
        }
      }
    });
  }

  // Unobserve specific selector
  unobserve(selector) {
    document.querySelectorAll(selector).forEach((element) => {
      this.observer.unobserve(element);
    });
  }

  // Disconnect observer
  disconnect() {
    this.observer.disconnect();
  }
}

// Smooth Transition Manager
class TransitionManager {
  // Apply smooth fade transition
  static fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease-out`;

    setTimeout(() => {
      element.style.opacity = '1';
    }, 10);
  }

  // Apply smooth fade out
  static fadeOut(element, duration = 300) {
    element.style.transition = `opacity ${duration}ms ease-in`;
    element.style.opacity = '0';
  }

  // Slide transition
  static slideIn(element, direction = 'up', duration = 400) {
    const directionMap = {
      up: 'slideInUp',
      down: 'slideInDown',
      left: 'slideInLeft',
      right: 'slideInRight',
    };

    const animationClass = `animate-${directionMap[direction] || direction}`;
    element.classList.add(animationClass);

    setTimeout(() => {
      element.classList.remove(animationClass);
    }, duration);
  }

  // Scale transition
  static scaleIn(element, duration = 400) {
    element.classList.add('animate-scale-in');

    setTimeout(() => {
      element.classList.remove('animate-scale-in');
    }, duration);
  }

  // Custom keyframe animation
  static animate(element, keyframes, options = {}) {
    if (!element.animate) return; // Fallback for older browsers

    const defaults = {
      duration: 400,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'both',
    };

    const mergedOptions = { ...defaults, ...options };
    element.animate(keyframes, mergedOptions);
  }
}

// Stagger Animation Manager
class StaggerManager {
  // Apply staggered animation to child elements
  static stagger(containerSelector, animationClass = 'animate-fade-in', delay = 80) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const children = container.querySelectorAll('> *');
    children.forEach((child, index) => {
      setTimeout(() => {
        child.classList.add(animationClass);
      }, index * delay);
    });
  }

  // Stagger with custom callback
  static staggerWithCallback(containerSelector, callback, delay = 80) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const children = container.querySelectorAll('> *');
    children.forEach((child, index) => {
      setTimeout(() => {
        callback(child, index);
      }, index * delay);
    });
  }
}

// Hover Animation Manager
class HoverAnimationManager {
  // Add hover lift effect
  static addHoverLift(selector) {
    document.querySelectorAll(selector).forEach((element) => {
      element.classList.add('hover-lift');
    });
  }

  // Add hover scale effect
  static addHoverScale(selector) {
    document.querySelectorAll(selector).forEach((element) => {
      element.classList.add('hover-scale');
    });
  }

  // Add hover glow effect
  static addHoverGlow(selector) {
    document.querySelectorAll(selector).forEach((element) => {
      element.classList.add('hover-glow');
    });
  }

  // Custom hover effect
  static onHover(selector, onEnter, onLeave) {
    document.querySelectorAll(selector).forEach((element) => {
      element.addEventListener('mouseenter', () => onEnter(element));
      element.addEventListener('mouseleave', () => onLeave(element));
    });
  }
}

// Loading Animation Manager
class LoadingAnimationManager {
  // Show loading spinner
  static showSpinner(containerId, message = 'Loading...') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="loading-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px;">
        <div class="spinner" style="width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--accent); border-radius: 50%;"></div>
        <p style="margin-top: 16px; color: var(--muted); font-size: 14px;">${message}</p>
      </div>
    `;
  }

  // Hide spinner
  static hideSpinner(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.querySelector('.loading-container')?.remove();
    }
  }

  // Show skeleton loader
  static showSkeleton(containerId, count = 3) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let skeletons = '';
    for (let i = 0; i < count; i++) {
      skeletons += `
        <div style="margin-bottom: 16px;">
          <div class="skeleton-premium title"></div>
          <div class="skeleton-premium text"></div>
          <div class="skeleton-premium text"></div>
        </div>
      `;
    }

    container.innerHTML = skeletons;
  }
}

// Alert/Toast Manager
class AlertManager {
  static showAlert(message, type = 'info', duration = 4000) {
    const alertContainer = document.getElementById('alert-container') || this.createAlertContainer();

    const alert = document.createElement('div');
    alert.className = `alert-premium ${type}`;
    alert.innerHTML = `
      <div class="alert-icon">${this.getIcon(type)}</div>
      <div class="alert-content">${message}</div>
      <button class="alert-close">&times;</button>
    `;

    alertContainer.appendChild(alert);

    const closeBtn = alert.querySelector('.alert-close');
    closeBtn.addEventListener('click', () => alert.remove());

    if (duration > 0) {
      setTimeout(() => {
        alert.classList.add('animate-fade-out');
        setTimeout(() => alert.remove(), 300);
      }, duration);
    }
  }

  static createAlertContainer() {
    const container = document.createElement('div');
    container.id = 'alert-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;
    document.body.appendChild(container);
    return container;
  }

  static getIcon(type) {
    const icons = {
      success: '✓',
      danger: '✕',
      info: 'ℹ',
      warning: '⚠',
    };
    return icons[type] || 'ℹ';
  }

  static showSuccess(message, duration = 3000) {
    this.showAlert(message, 'success', duration);
  }

  static showError(message, duration = 4000) {
    this.showAlert(message, 'danger', duration);
  }

  static showInfo(message, duration = 3000) {
    this.showAlert(message, 'info', duration);
  }

  static showWarning(message, duration = 3000) {
    this.showAlert(message, 'warning', duration);
  }
}

// Particle Background Animation
class ParticleBackground {
  constructor(containerId, particleCount = 30) {
    this.container = document.getElementById(containerId);
    this.particleCount = particleCount;
    this.particles = [];

    if (this.container) {
      this.createParticles();
      this.animateParticles();
    }
  }

  createParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 2}px;
        height: ${Math.random() * 4 + 2}px;
        background: rgba(199, 210, 15, ${Math.random() * 0.5 + 0.1});
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        pointer-events: none;
      `;

      this.container.appendChild(particle);
      this.particles.push({
        element: particle,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: Math.random() * 0.5 - 0.25,
        vy: Math.random() * 0.5 - 0.25,
      });
    }
  }

  animateParticles() {
    setInterval(() => {
      this.particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = 100;
        if (particle.x > 100) particle.x = 0;
        if (particle.y < 0) particle.y = 100;
        if (particle.y > 100) particle.y = 0;

        particle.element.style.left = particle.x + '%';
        particle.element.style.top = particle.y + '%';
      });
    }, 20);
  }
}

// Export managers
window.LottieAnimationManager = LottieAnimationManager;
window.ScrollAnimationManager = ScrollAnimationManager;
window.TransitionManager = TransitionManager;
window.StaggerManager = StaggerManager;
window.HoverAnimationManager = HoverAnimationManager;
window.LoadingAnimationManager = LoadingAnimationManager;
window.AlertManager = AlertManager;
window.ParticleBackground = ParticleBackground;

// Create singleton instances
window.lottieManager = new LottieAnimationManager();
window.scrollAnimationManager = new ScrollAnimationManager();

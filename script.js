const body = document.body;
const navBar = document.querySelector('[data-nav]');
const navLinks = document.querySelectorAll('[data-nav-link]');
const mobileToggle = document.querySelector('[data-mobile-toggle]');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('[data-mobile-link]');
const accordionItems = document.querySelectorAll('[data-accordion-item]');
const animateTargets = document.querySelectorAll('[data-animate]');
const contactForm = document.querySelector('[data-contact-form]');
const formStatus = document.getElementById('form-status');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const themeToggleButtons = document.querySelectorAll('[data-theme-toggle]');
const heroLogo = document.querySelector('[data-hero-logo]');
const HERO_LOGOS = {
  light: 'images/foreveryoungfitness-logo-2-black.svg',
  dark: 'images/foreveryoungfitness-logo-2-white.svg',
};
const rootElement = document.documentElement;
const THEME_STORAGE_KEY = 'fy-theme';
const DEFAULT_THEME = 'light';

function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    return null;
  } catch {
    return null;
  }
}

function updateThemeToggleUI(theme) {
  const isDark = theme === 'dark';
  themeToggleButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(isDark));
    button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    button.querySelectorAll('[data-theme-toggle-label]').forEach((label) => {
      label.textContent = isDark ? 'Dark mode' : 'Light mode';
    });
  });
}

let currentTheme = getStoredTheme() || DEFAULT_THEME;

function setTheme(theme, { persist = true } = {}) {
  const nextTheme = theme === 'dark' ? 'dark' : 'light';
  currentTheme = nextTheme;
  rootElement.setAttribute('data-theme', nextTheme);
  updateThemeToggleUI(nextTheme);
  if (heroLogo) {
    heroLogo.src = HERO_LOGOS[nextTheme];
  }
  if (!persist) {
    return;
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch {
    // Ignore storage errors (e.g., private mode)
  }
}

setTheme(currentTheme, { persist: false });

themeToggleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  });
});

let menuOpen = false;
let focusableMenuElements = [];
let firstFocusable = null;
let lastFocusable = null;

function setNavState() {
  if (!navBar) return;
  if (window.scrollY > 24) {
    navBar.classList.add('shadow-lg', 'bg-slate-950/95');
  } else {
    navBar.classList.remove('shadow-lg', 'bg-slate-950/95');
  }
}

function trapFocus(e) {
  if (!menuOpen) return;
  if (e.key !== 'Tab') return;
  if (focusableMenuElements.length === 0) return;

  if (e.shiftKey) {
    if (document.activeElement === firstFocusable) {
      e.preventDefault();
      lastFocusable.focus();
    }
  } else if (document.activeElement === lastFocusable) {
    e.preventDefault();
    firstFocusable.focus();
  }
}

function updateFocusableElements() {
  focusableMenuElements = Array.from(
    mobileMenu.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
  firstFocusable = focusableMenuElements[0];
  lastFocusable = focusableMenuElements[focusableMenuElements.length - 1];
}

function openMenu() {
  menuOpen = true;
  mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px';
  mobileMenu.setAttribute('aria-hidden', 'false');
  mobileToggle?.setAttribute('aria-expanded', 'true');
  body.classList.add('mobile-nav-open');
  updateFocusableElements();
  firstFocusable?.focus();
}

function closeMenu() {
  menuOpen = false;
  mobileMenu.style.maxHeight = '0px';
  mobileMenu.setAttribute('aria-hidden', 'true');
  mobileToggle?.setAttribute('aria-expanded', 'false');
  body.classList.remove('mobile-nav-open');
}

function toggleMenu() {
  if (menuOpen) {
    closeMenu();
  } else {
    openMenu();
  }
}

mobileToggle?.addEventListener('click', toggleMenu);

document.addEventListener('click', (event) => {
  if (!menuOpen) return;
  if (!mobileMenu.contains(event.target) && !mobileToggle.contains(event.target)) {
    closeMenu();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuOpen) {
    closeMenu();
    mobileToggle?.focus();
  }
  trapFocus(event);
});

mobileLinks.forEach((link) => {
  link.addEventListener('click', () => {
    closeMenu();
  });
});

function smoothScroll(event, targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;

  event.preventDefault();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    smoothScroll(event, href.replace('#', ''));
  });
});

function setActiveNav(sectionId) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${sectionId}`;
    link.classList.toggle('text-brand-accent', isActive);
    link.classList.toggle('text-white', isActive);
    link.classList.toggle('text-slate-300', !isActive);
  });
}

const sections = document.querySelectorAll('section[id]');
if (sections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveNav(entry.target.id);
        }
      });
    },
    { threshold: 0.5 }
  );
  sections.forEach((section) => observer.observe(section));
  setActiveNav(sections[0].id);
}

if (!prefersReducedMotion) {
  animateTargets.forEach((el) => el.classList.add('reveal-hidden'));
  const animateObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );
  animateTargets.forEach((el) => animateObserver.observe(el));
} else {
  animateTargets.forEach((el) => el.classList.add('reveal-visible'));
}

accordionItems.forEach((item) => {
  const button = item.querySelector('button');
  const panel = item.querySelector('[data-accordion-panel]');
  if (!button || !panel) return;

  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';

    accordionItems.forEach((other) => {
      if (other === item) return;
      const otherButton = other.querySelector('button');
      const otherPanel = other.querySelector('[data-accordion-panel]');
      otherButton?.setAttribute('aria-expanded', 'false');
      if (otherPanel) {
        otherPanel.style.maxHeight = '0px';
      }
    });

    if (isOpen) {
      button.setAttribute('aria-expanded', 'false');
      panel.style.maxHeight = '0px';
    } else {
      button.setAttribute('aria-expanded', 'true');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  });
});

function renderIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

document.addEventListener('DOMContentLoaded', renderIcons);
window.addEventListener('load', renderIcons);

setNavState();
window.addEventListener('scroll', setNavState, { passive: true });

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!formStatus) return;

    const honeypot = contactForm.querySelector('input[name="_gotcha"]');
    if (honeypot && honeypot.value) {
      formStatus.textContent = 'Submission blocked.';
      return;
    }

    formStatus.textContent = 'Sending...';
    formStatus.classList.remove('text-red-400', 'text-brand-accent');

    try {
      const formData = new FormData(contactForm);
      const response = await fetch(contactForm.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });

      if (response.ok) {
        formStatus.textContent = 'Thanks! Tony will reach out soon.';
        formStatus.classList.add('text-brand-accent');
        contactForm.reset();
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      formStatus.textContent = 'Something went wrong. Please try again later.';
      formStatus.classList.add('text-red-400');
    }
  });
}

const yearEl = document.getElementById('current-year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setMenu(open) {
  menuToggle?.setAttribute('aria-expanded', String(open));
  nav?.classList.toggle('is-open', open);
  document.body.classList.toggle('nav-open', open);
}

menuToggle?.addEventListener('click', () => {
  setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
});

nav?.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

function updateHeader() {
  header?.classList.toggle('is-stuck', window.scrollY > 58);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const reveals = document.querySelectorAll('.reveal');
if (reducedMotion || !('IntersectionObserver' in window)) {
  reveals.forEach((element) => element.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  reveals.forEach((element) => observer.observe(element));

  // Keep content visible even when users jump past sections quickly.
  const revealReachedContent = () => {
    const revealLine = window.innerHeight * 1.12;
    reveals.forEach((element) => {
      if (element.getBoundingClientRect().top < revealLine) {
        element.classList.add('is-visible');
      }
    });
  };
  revealReachedContent();
  window.addEventListener('scroll', revealReachedContent, { passive: true });
}

document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

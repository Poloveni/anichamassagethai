/**
 * Anicha Espace Bien-Être – Scripts du site
 * Sans dépendance, vanilla JS.
 */

(function () {
  'use strict';

  /* ----------------------------------------------------
   * 1. Menu mobile (burger)
   * ---------------------------------------------------- */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.dataset.open === 'true';
      nav.dataset.open = String(!isOpen);
      toggle.setAttribute('aria-expanded', String(!isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Ouvrir le menu' : 'Fermer le menu');
      // Empêche le scroll du body quand le menu est ouvert
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Ferme automatiquement le menu quand on clique un lien
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.dataset.open = 'false';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Ouvrir le menu');
        document.body.style.overflow = '';
      });
    });

    // Ferme avec la touche Échap
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.dataset.open === 'true') {
        toggle.click();
      }
    });
  }

  /* ----------------------------------------------------
   * 2. Header : ombre douce dès qu'on scrolle
   * ---------------------------------------------------- */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 4);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ----------------------------------------------------
   * 3. Animation d'apparition des sections au scroll
   *    (légère, optionnelle, respecte prefers-reduced-motion)
   * ---------------------------------------------------- */
  const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (motionOk && 'IntersectionObserver' in window) {
    const cards = document.querySelectorAll('.card, .formule-card, .testimonial');
    cards.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 600ms ease, transform 600ms ease';
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, i * 60);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    cards.forEach((el) => observer.observe(el));
  }

  /* ----------------------------------------------------
   * 4. Année courante dans le footer si présente
   * ---------------------------------------------------- */
  const yearEl = document.querySelector('[data-current-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ----------------------------------------------------
   * 5. Resize : si on repasse en desktop, on referme proprement
   * ---------------------------------------------------- */
  let resizeRaf;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      if (window.innerWidth > 768 && nav && nav.dataset.open === 'true') {
        nav.dataset.open = 'false';
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  });

})();

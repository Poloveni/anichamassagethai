/**
 * Anicha Espace Bien-Être – Scripts du site
 * Sans dépendance, vanilla JS.
 */

(function () {
  'use strict';

  const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch  = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  /* ─────────────────────────────────────────────────
   * 1. Menu mobile (burger)
   * ───────────────────────────────────────────────── */
  const toggle = document.querySelector('.menu-toggle');
  const nav    = document.querySelector('.nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.dataset.open === 'true';
      nav.dataset.open = String(!isOpen);
      toggle.setAttribute('aria-expanded', String(!isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Ouvrir le menu' : 'Fermer le menu');
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.dataset.open = 'false';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Ouvrir le menu');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.dataset.open === 'true') toggle.click();
    });
  }

  /* ─────────────────────────────────────────────────
   * 2. Header : ombre au scroll
   * ───────────────────────────────────────────────── */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ─────────────────────────────────────────────────
   * 3. Animation d'apparition au scroll (IntersectionObserver)
   * ───────────────────────────────────────────────── */
  if (motionOk && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll('.card, .formule-card, .testimonial, .reassurance__item');
    targets.forEach((el, i) => {
      el.style.opacity  = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = `opacity 550ms ease ${i % 4 * 80}ms, transform 550ms ease ${i % 4 * 80}ms`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach((el) => observer.observe(el));
  }

  /* ─────────────────────────────────────────────────
   * 4. Année courante dans le footer
   * ───────────────────────────────────────────────── */
  const yearEl = document.querySelector('[data-current-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ─────────────────────────────────────────────────
   * 5. Resize : fermeture menu en desktop
   * ───────────────────────────────────────────────── */
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

  /* ─────────────────────────────────────────────────
   * 6. SCROLL INDICATOR — disparaît au scroll
   * ───────────────────────────────────────────────── */
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    const onScrollIndicator = () => {
      scrollIndicator.classList.toggle('is-hidden', window.scrollY > 100);
    };
    window.addEventListener('scroll', onScrollIndicator, { passive: true });
    onScrollIndicator();
  }

  /* ─────────────────────────────────────────────────
   * 7. FAB RÉSERVER — masqué quand menu mobile ouvert
   * ───────────────────────────────────────────────── */
  const fab = document.querySelector('.fab-reserve');
  if (fab && toggle && nav) {
    const syncFab = () => {
      fab.classList.toggle('fab-hidden', nav.dataset.open === 'true');
    };
    const fabObserver = new MutationObserver(syncFab);
    fabObserver.observe(nav, { attributes: true, attributeFilter: ['data-open'] });
    syncFab();
  }

  /* ─────────────────────────────────────────────────
   * 8. VIDÉO HERO — lecture automatique robuste
   *    Tente play() dès que possible ; si Chrome bloque
   *    (autoplay policy), déverrouille au premier geste.
   * ───────────────────────────────────────────────── */
  const heroVideo = document.querySelector('.hero__video');
  if (heroVideo) {
    if (!motionOk) {
      heroVideo.removeAttribute('autoplay');
    } else {
      heroVideo.muted      = true;
      heroVideo.playsInline = true;

      let videoPlaying = false;

      const tryPlay = () => {
        if (videoPlaying) return;
        const p = heroVideo.play();
        if (p !== undefined) {
          p.then(() => { videoPlaying = true; }).catch(() => {
            /* Autoplay bloqué → déverrouille au premier geste utilisateur */
            const unlock = () => {
              if (videoPlaying) return;
              heroVideo.play().then(() => { videoPlaying = true; }).catch(() => {});
              document.removeEventListener('scroll',     unlock, true);
              document.removeEventListener('click',      unlock, true);
              document.removeEventListener('touchstart', unlock, true);
              document.removeEventListener('keydown',    unlock, true);
            };
            document.addEventListener('scroll',     unlock, { once: true, passive: true, capture: true });
            document.addEventListener('click',      unlock, { once: true, capture: true });
            document.addEventListener('touchstart', unlock, { once: true, passive: true, capture: true });
            document.addEventListener('keydown',    unlock, { once: true, capture: true });
          });
        }
      };

      /* Tenter immédiatement si données disponibles, sinon attendre */
      if (heroVideo.readyState >= 2) {
        tryPlay();
      } else {
        heroVideo.addEventListener('loadeddata', tryPlay, { once: true });
      }
      /* Double filet : canplaythrough garantit assez de données */
      heroVideo.addEventListener('canplaythrough', tryPlay, { once: true });
    }
  }

  if (motionOk) {
    const heroBg = document.querySelector('.hero__bg');
    if (heroBg) {
      let rafId;
      const updateHeroParallax = () => {
        rafId = requestAnimationFrame(() => {
          heroBg.style.transform = `translateY(${window.scrollY * 0.38}px)`;
        });
      };
      window.addEventListener('scroll', updateHeroParallax, { passive: true });
      updateHeroParallax(); // init
    }

    /* Parallax léger sur les images de section (philosophy, gift) */
    const parallaxImages = document.querySelectorAll('[data-parallax]');
    if (parallaxImages.length) {
      const updateSectionParallax = () => {
        requestAnimationFrame(() => {
          parallaxImages.forEach((el) => {
            const rect  = el.getBoundingClientRect();
            const speed = parseFloat(el.dataset.parallax) || 0.18;
            const mid   = window.innerHeight / 2;
            const offset = (rect.top + rect.height / 2 - mid) * speed;
            el.style.transform = `translateY(${offset}px) scale(1.08)`;
          });
        });
      };
      window.addEventListener('scroll', updateSectionParallax, { passive: true });
      updateSectionParallax();
    }
  }

  /* ─────────────────────────────────────────────────
   * 7. EFFET TILT 3D — cartes (souris uniquement)
   *    Fait tourner la carte sur les axes X/Y en
   *    fonction de la position du curseur, avec un
   *    retour en douceur à l'état neutre.
   * ───────────────────────────────────────────────── */
  if (motionOk && !isTouch) {
    const tiltEls = document.querySelectorAll('.card, .formule-card');

    tiltEls.forEach((el) => {
      let animFrame;

      el.addEventListener('mousemove', (e) => {
        cancelAnimationFrame(animFrame);
        animFrame = requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          const cx   = rect.left + rect.width  / 2;
          const cy   = rect.top  + rect.height / 2;
          const dx   = (e.clientX - cx) / (rect.width  / 2); // -1 → 1
          const dy   = (e.clientY - cy) / (rect.height / 2); // -1 → 1

          const rotY =  dx * 9;   // rotation gauche-droite
          const rotX = -dy * 7;   // rotation haut-bas

          el.style.transition = 'transform 0.08s ease, box-shadow 0.08s ease';
          el.style.transform  =
            `perspective(900px) rotateY(${rotY}deg) rotateX(${rotX}deg) translateZ(10px)`;
        });
      });

      el.addEventListener('mouseleave', () => {
        cancelAnimationFrame(animFrame);
        el.style.transition = 'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.55s ease';
        el.style.transform  = '';
      });
    });
  }

})();

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
    // La vidéo hero est un fond ambiant, pas une animation décorative :
    // on la joue toujours (muette), même si l'utilisateur préfère moins d'animations.
    // Les effets parallax, tilt et transitions CSS restent désactivés avec motionOk=false.
    {
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
    const tiltEls = Array.from(document.querySelectorAll('.card, .formule-card'))
      .filter(el => !el.closest('[data-carousel]'));

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

  /* ─────────────────────────────────────────────────
   * 8. FORMULAIRE — message de confirmation
   *    Affiché si l'URL contient ?envoye=1 (FormSubmit
   *    redirige ici après soumission réussie).
   * ───────────────────────────────────────────────── */
  if (new URLSearchParams(window.location.search).get('envoye') === '1') {
    const success = document.getElementById('form-success');
    const form    = document.querySelector('.contact-form form');
    if (success) {
      success.hidden = false;
      success.scrollIntoView({ behavior: motionOk ? 'smooth' : 'auto', block: 'center' });
    }
    if (form) form.hidden = true;
  }

  /* ─────────────────────────────────────────────────
   * 9. CARROUSEL FORMULES
   *    - Scroll horizontal natif (snap)
   *    - Boutons prev/next
   *    - Dots de pagination synchronisés
   *    - Auto-play (pause au survol et au focus)
   *    - Swipe natif sur mobile
   *    - Clavier : flèches ←/→
   * ───────────────────────────────────────────────── */
  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track    = carousel.querySelector('[data-carousel-track]');
    const prevBtn  = carousel.querySelector('[data-carousel-prev]');
    const nextBtn  = carousel.querySelector('[data-carousel-next]');
    const dotsBox  = carousel.querySelector('[data-carousel-dots]');
    if (!track) return;

    const slides = Array.from(track.children);
    if (!slides.length) return;

    /* Création des dots */
    if (dotsBox) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Aller à la formule ${i + 1}`);
        dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        dot.addEventListener('click', () => goTo(i));
        dotsBox.appendChild(dot);
      });
    }
    const dots = dotsBox ? Array.from(dotsBox.children) : [];

    /* Navigation */
    function getStep() {
      // Largeur d'une carte + gap
      const first = slides[0];
      const second = slides[1];
      if (!second) return first.getBoundingClientRect().width;
      return second.getBoundingClientRect().left - first.getBoundingClientRect().left;
    }

    function currentIndex() {
      const step = getStep();
      if (!step) return 0;
      return Math.round(track.scrollLeft / step);
    }

    function goTo(i) {
      const max = slides.length - 1;
      const idx = Math.max(0, Math.min(max, i));
      const step = getStep();
      track.scrollTo({ left: idx * step, behavior: motionOk ? 'smooth' : 'auto' });
    }

    function next() {
      const idx = currentIndex();
      // Si on est à la fin, on revient au début (auto-play loop)
      if (idx >= slides.length - 1) goTo(0);
      else                          goTo(idx + 1);
    }

    function prev() {
      const idx = currentIndex();
      if (idx <= 0) goTo(slides.length - 1);
      else          goTo(idx - 1);
    }

    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    /* Synchro dots + état des boutons sur scroll */
    let scrollTimer;
    function onScroll() {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const idx = currentIndex();
        dots.forEach((d, i) => d.setAttribute('aria-selected', i === idx ? 'true' : 'false'));
      }, 60);
    }
    track.addEventListener('scroll', onScroll, { passive: true });

    /* Clavier */
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    });
    carousel.tabIndex = 0;

    /* Auto-play */
    const delay = parseInt(carousel.dataset.autoplay || '0', 10);
    let timer = null;
    let isPaused = false;

    function play() {
      if (!delay || !motionOk) return;
      stop();
      timer = setInterval(() => { if (!isPaused) next(); }, delay);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    /* Pause au survol / focus / interaction tactile */
    ['mouseenter','focusin','touchstart'].forEach(ev =>
      carousel.addEventListener(ev, () => { isPaused = true; }, { passive: true })
    );
    ['mouseleave','focusout','touchend'].forEach(ev =>
      carousel.addEventListener(ev, () => { isPaused = false; }, { passive: true })
    );

    /* Pause si l'onglet n'est pas visible */
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else play();
    });

    /* Démarre seulement quand le carrousel arrive dans le viewport */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach(entry => entry.isIntersecting ? play() : stop());
      }, { threshold: 0.25 }).observe(carousel);
    } else {
      play();
    }

    /* Resize : recalcule le snap */
    window.addEventListener('resize', () => {
      const idx = currentIndex();
      requestAnimationFrame(() => goTo(idx));
    });
  });

})();

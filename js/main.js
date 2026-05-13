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
   * 8. VIDÉOS HERO — lecture automatique robuste
   *    Cible la hero homepage (.hero__video) ET les hero
   *    des pages secondaires (.page-hero__bg video).
   *    Tente play() dès que possible ; si bloqué par
   *    l'autoplay policy, déverrouille au premier geste.
   * ───────────────────────────────────────────────── */
  const heroVideos = document.querySelectorAll('.hero__video, .page-hero__bg video');
  if (heroVideos.length) {
    heroVideos.forEach((vid) => {
      vid.muted = true;
      vid.playsInline = true;
      let isPlaying = false;
      const tryPlay = () => {
        if (isPlaying) return;
        const p = vid.play();
        if (p !== undefined) {
          p.then(() => { isPlaying = true; }).catch(() => {
            const unlock = () => {
              if (isPlaying) return;
              vid.play().then(() => { isPlaying = true; }).catch(() => {});
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
      if (vid.readyState >= 2) tryPlay();
      else vid.addEventListener('loadeddata', tryPlay, { once: true });
      vid.addEventListener('canplaythrough', tryPlay, { once: true });
    });
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
   * 9. EFFETS DÉCORATIFS HOMEPAGE
   * ───────────────────────────────────────────────── */

  /* 9a. Barre de progression du scroll */
  const progressBar = document.querySelector('[data-scroll-progress]');
  if (progressBar) {
    let rafScroll;
    const updateProgress = () => {
      cancelAnimationFrame(rafScroll);
      rafScroll = requestAnimationFrame(() => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
        progressBar.style.width = pct + '%';
      });
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* 9b. Reveal du H1 hero — découpe en mots avec stagger */
  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle && motionOk) {
    const tagsToWrap = heroTitle.cloneNode(true);
    // Récupère les noeuds enfants (texte + <em> + <br>)
    const wrapTextNodes = (node) => {
      Array.from(node.childNodes).forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          const words = child.textContent.split(/(\s+)/).filter(s => s.length);
          const frag = document.createDocumentFragment();
          words.forEach(w => {
            if (w.trim().length === 0) {
              frag.appendChild(document.createTextNode(w));
            } else {
              const span = document.createElement('span');
              span.className = 'word';
              span.textContent = w;
              frag.appendChild(span);
            }
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
          wrapTextNodes(child);
        }
      });
    };
    wrapTextNodes(heroTitle);
    // Applique un délai progressif
    heroTitle.querySelectorAll('.word').forEach((w, i) => {
      w.style.animationDelay = (80 + i * 90) + 'ms';
    });
  }

  /* 9c. Compteur animé (data-count-to / data-count-suffix) */
  const counters = document.querySelectorAll('[data-count-to]');
  if (counters.length && 'IntersectionObserver' in window) {
    const animateCount = (el) => {
      const target = parseInt(el.dataset.countTo, 10);
      const suffix = el.dataset.countSuffix || '';
      const dur = 1400;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        // Easing easeOutCubic
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(tick);
    };
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    counters.forEach(c => counterObserver.observe(c));
  }

  /* 9d-bis. Reveal des sections "massage-detail" (page Massages)
     - Slide-in alterné gauche/droite
     - Stagger des bénéfices
     - Trait doré sous le H2
     - Halo pulse sur le bouton "Réserver ce soin" */
  if ('IntersectionObserver' in window) {
    const massageSections = document.querySelectorAll('.massage-detail');
    if (massageSections.length) {
      const massageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            massageObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });
      massageSections.forEach(s => massageObserver.observe(s));
    }
  }

  /* 9d. Underline doré progressif sur les H2 de section */
  if ('IntersectionObserver' in window) {
    const headers = document.querySelectorAll('.section-header h2');
    const headObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          headObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    headers.forEach(h => headObserver.observe(h));
  }

  /* ─────────────────────────────────────────────────
   * 10. CARROUSEL FORMULES
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

    /* Navigation — index maintenu explicitement pour éviter les calculs flottants */
    let _idx = 0;

    function getStep() {
      // Distance entre deux slides adjacents : constante quelle que soit la position de scroll
      if (slides.length < 2) return slides[0].offsetWidth;
      const a = slides[0].getBoundingClientRect().left;
      const b = slides[1].getBoundingClientRect().left;
      const diff = b - a;
      return diff > 1 ? diff : slides[0].offsetWidth;
    }

    function currentIndex() { return _idx; }

    function goTo(i) {
      const max = slides.length - 1;
      _idx = Math.max(0, Math.min(max, i));
      track.scrollLeft = _idx * getStep();
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

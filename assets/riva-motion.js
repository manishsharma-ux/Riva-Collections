/*
  Riva motion layer.
  Progressive enhancements only: the storefront renders and works without this file.
  - Reveals [data-riva-reveal] elements as they enter the viewport.
  - Adds .riva-scrolled to <html> once the page scrolls, and exposes the header height.
  - Pointer spotlight on featured-find cards and a magnetic pull on .riva-magnetic buttons.
  - Pops the cart count bubble when the cart changes.
  - Loads GSAP + ScrollTrigger only when a product story section is near the viewport.
  Handles Shopify theme editor section load and unload events.
*/
(() => {
  if (window.RivaMotion) return;

  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const designMode = Boolean(window.Shopify && window.Shopify.designMode);
  const motionAllowed = () => !reducedMotion.matches;

  /* Reveal --------------------------------------------------------------- */

  const AUTO_REVEAL = [
    '.template-search .product-grid > .grid__item:not(.animate-item)',
    '.blog-articles > .article-card-wrapper',
    '.main-list-collections .collection-list > li:not(.animate-item)',
  ].join(',');

  let revealObserver = null;

  function revealNow(elements) {
    elements.forEach((el) => el.classList.add('is-revealed'));
  }

  function getRevealObserver() {
    if (revealObserver) return revealObserver;
    revealObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
        visible.forEach((entry, index) => {
          const el = entry.target;
          if (!el.style.getPropertyValue('--riva-stagger') || el.dataset.rivaAutoStagger !== undefined) {
            el.dataset.rivaAutoStagger = '';
            el.style.setProperty('--riva-stagger', String(Math.min(index, 6)));
          }
          el.classList.add('is-revealed');
          revealObserver.unobserve(el);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    return revealObserver;
  }

  function initReveal(scope = document) {
    scope.querySelectorAll(AUTO_REVEAL).forEach((el) => {
      if (!el.hasAttribute('data-riva-reveal')) el.setAttribute('data-riva-reveal', '');
    });
    const elements = Array.from(scope.querySelectorAll('[data-riva-reveal]:not(.is-revealed)'));
    if (!elements.length) return;

    if (!root.classList.contains('riva-motion') || !('IntersectionObserver' in window) || designMode) {
      revealNow(elements);
      return;
    }
    const observer = getRevealObserver();
    elements.forEach((el) => observer.observe(el));
  }

  /* Header state --------------------------------------------------------- */

  let scrollTicking = false;

  function updateScrollState() {
    scrollTicking = false;
    root.classList.toggle('riva-scrolled', window.scrollY > 24);
  }

  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateScrollState);
  }

  function measureHeader() {
    const header = document.querySelector('.section-header, .shopify-section-group-header-group.section-header, sticky-header');
    if (!header) return;
    root.style.setProperty('--riva-header-offset', `${Math.round(header.getBoundingClientRect().height)}px`);
  }

  /* Pointer effects ------------------------------------------------------ */

  let pointerFrame = 0;
  let pointerEvent = null;

  function applyPointer() {
    pointerFrame = 0;
    const event = pointerEvent;
    if (!event) return;

    const card = event.target.closest && event.target.closest('.riva-edit');
    if (card) {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--riva-mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--riva-my', `${event.clientY - rect.top}px`);
    }

    const magnet = event.target.closest && event.target.closest('.riva-magnetic');
    if (magnet) {
      const rect = magnet.getBoundingClientRect();
      const x = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const y = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      magnet.style.translate = `${(x * 6).toFixed(2)}px ${(y * 4).toFixed(2)}px`;
    }
  }

  function onPointerMove(event) {
    if (!finePointer.matches || !motionAllowed()) return;
    pointerEvent = event;
    if (!pointerFrame) pointerFrame = window.requestAnimationFrame(applyPointer);
  }

  function onPointerOut(event) {
    const magnet = event.target.closest && event.target.closest('.riva-magnetic');
    if (magnet && !magnet.contains(event.relatedTarget)) magnet.style.translate = '';
  }

  /* Cart bubble ---------------------------------------------------------- */

  function watchCartBubble() {
    const icon = document.getElementById('cart-icon-bubble');
    if (!icon || icon.dataset.rivaWatched) return;
    icon.dataset.rivaWatched = 'true';
    let lastCount = (icon.querySelector('.cart-count-bubble') || {}).textContent || '';
    new MutationObserver(() => {
      const bubble = icon.querySelector('.cart-count-bubble');
      const count = bubble ? bubble.textContent.trim() : '';
      if (!bubble || count === lastCount) {
        lastCount = count;
        return;
      }
      lastCount = count;
      if (!motionAllowed()) return;
      bubble.classList.remove('riva-bump');
      void bubble.offsetWidth;
      bubble.classList.add('riva-bump');
      bubble.addEventListener('animationend', () => bubble.classList.remove('riva-bump'), { once: true });
    }).observe(icon, { childList: true, subtree: true, characterData: true });
  }

  /* GSAP loader ---------------------------------------------------------- */

  const scriptPromises = new Map();

  function loadScript(src) {
    if (!src) return Promise.reject(new Error('Missing script source'));
    if (!scriptPromises.has(src)) {
      scriptPromises.set(
        src,
        new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          script.onload = resolve;
          script.onerror = () => {
            scriptPromises.delete(src);
            reject(new Error(`Failed to load ${src}`));
          };
          document.head.appendChild(script);
        })
      );
    }
    return scriptPromises.get(src);
  }

  function loadGsap(el) {
    if (window.gsap && window.ScrollTrigger) return Promise.resolve();
    return loadScript(el.dataset.gsapSrc).then(() => loadScript(el.dataset.scrollTriggerSrc));
  }

  /* Product story -------------------------------------------------------- */

  const stories = new Map();

  function buildStory(el) {
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    const steps = Array.from(el.querySelectorAll('.riva-story__step'));
    const frames = Array.from(el.querySelectorAll('.riva-story__frame'));
    const progress = el.querySelector('[data-riva-story-progress]');
    const current = el.querySelector('[data-riva-story-current]');
    const list = el.querySelector('.riva-story__steps');
    if (steps.length < 2 || frames.length !== steps.length || !list) return null;

    const mm = gsap.matchMedia();
    mm.add('(min-width: 990px) and (prefers-reduced-motion: no-preference)', () => {
      // Shrine sets scroll-behavior: smooth on <html>. ScrollTrigger measures with instant scrolls and
      // records wrong positions while smooth scrolling is on, so it stays off while the story is active.
      const previousScrollBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      el.classList.add('is-enhanced');
      measureHeader();

      let active = -1;
      const setActive = (index) => {
        if (index === active) return;
        active = index;
        steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
        frames.forEach((frame, i) => frame.classList.toggle('is-active', i === index));
        if (current) current.textContent = String(index + 1).padStart(2, '0');
      };
      setActive(0);

      // A step is active while it spans the middle of the viewport, where its centered text sits.
      steps.forEach((step, index) => {
        ScrollTrigger.create({
          trigger: step,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => {
            if (self.isActive) setActive(index);
          },
        });
      });

      if (progress) {
        gsap.fromTo(
          progress,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: list, start: 'top 50%', end: 'bottom 50%', scrub: 0.4 },
          }
        );
      }

      frames.forEach((frame) => {
        const img = frame.querySelector('img');
        if (!img) return;
        gsap.fromTo(
          img,
          { yPercent: 3 },
          {
            yPercent: -3,
            ease: 'none',
            scrollTrigger: { trigger: list, start: 'top bottom', end: 'bottom top', scrub: true },
          }
        );
      });

      ScrollTrigger.refresh();

      // Content above the story (lazy images, sliders, app blocks) can change its position after load.
      let refreshTimer = 0;
      const resizeObserver = new ResizeObserver(() => {
        window.clearTimeout(refreshTimer);
        refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
      });
      resizeObserver.observe(document.body);

      return () => {
        window.clearTimeout(refreshTimer);
        resizeObserver.disconnect();
        root.style.scrollBehavior = previousScrollBehavior;
        el.classList.remove('is-enhanced');
        steps.forEach((step, i) => step.classList.toggle('is-active', i === 0));
        frames.forEach((frame, i) => frame.classList.toggle('is-active', i === 0));
        if (current) current.textContent = '01';
      };
    });
    return mm;
  }

  // The story only enhances on wide screens with motion allowed, so phones never download GSAP.
  const storyMedia = window.matchMedia('(min-width: 990px) and (prefers-reduced-motion: no-preference)');

  function initStories(scope = document) {
    const sections = Array.from(scope.querySelectorAll('[data-riva-story]')).filter((el) => !stories.has(el));
    if (!sections.length) return;

    if (!storyMedia.matches) {
      const onChange = () => {
        if (!storyMedia.matches) return;
        storyMedia.removeEventListener('change', onChange);
        initStories(scope);
      };
      storyMedia.addEventListener('change', onChange);
      return;
    }

    const start = (el) => {
      if (stories.has(el)) return;
      stories.set(el, null);
      loadGsap(el)
        .then(() => {
          if (!el.isConnected || !stories.has(el)) return;
          stories.set(el, buildStory(el));
        })
        .catch(() => stories.delete(el));
    };

    if (!('IntersectionObserver' in window)) {
      sections.forEach(start);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          start(entry.target);
        });
      },
      { rootMargin: '800px 0px' }
    );
    sections.forEach((el) => observer.observe(el));
  }

  function destroyStories(scope) {
    stories.forEach((mm, el) => {
      if (!scope.contains(el)) return;
      if (mm) mm.revert();
      el.classList.remove('is-enhanced');
      stories.delete(el);
    });
  }

  /* Lifecycle ------------------------------------------------------------ */

  function init(scope = document) {
    initReveal(scope);
    initStories(scope);
  }

  function start() {
    init(document);
    measureHeader();
    updateScrollState();
    watchCartBubble();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measureHeader, { passive: true });
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerout', onPointerOut, { passive: true });

    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) {
        root.classList.remove('riva-motion');
        revealNow(document.querySelectorAll('[data-riva-reveal]'));
      }
    });

    if (designMode) {
      document.addEventListener('shopify:section:load', (event) => {
        init(event.target);
        watchCartBubble();
      });
      document.addEventListener('shopify:section:unload', (event) => destroyStories(event.target));
      document.addEventListener('shopify:section:reorder', () => {
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      });
    }
  }

  window.RivaMotion = { init, destroyStories };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();

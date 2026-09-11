const root = document.documentElement;
const header = document.querySelector('.header');
const story = document.querySelector('.aperture-story');
const hero = document.querySelector('.hero');
const overlay = document.querySelector('.shutter-overlay');
const skip = document.querySelector('.skip-intro');
const onlineEntry = document.querySelector('.online-entry');
const heroContent = document.querySelector('.hero-inner');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

clearTimeout(window.apertureFallback);
document.querySelector('#year').textContent = new Date().getFullYear();

let headerThreshold = 0;
const updateHeader = () => header.classList.toggle('is-scrolled', scrollY > headerThreshold);
const measureHeader = () => {
  headerThreshold = story.offsetHeight - hero.offsetHeight;
  updateHeader();
};
addEventListener('resize', measureHeader, { passive: true });
addEventListener('scroll', updateHeader, { passive: true });

// The page is always usable if animation libraries cannot load.
if (window.gsap && window.ScrollTrigger && !window.apertureTimedOut) {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const media = gsap.matchMedia();

  media.add('(prefers-reduced-motion: no-preference)', () => {
    root.classList.add('aperture-ready');
    const blades = gsap.utils.toArray('.blade');
    let lastInteractive;
    let lastClosed;

    const updateAccess = progress => {
      onlineEntry.inert = progress >= 0.33;
      const interactive = progress >= 0.85;
      const closed = progress >= 0.995;
      if (interactive !== lastInteractive) {
        heroContent.inert = !interactive;
        skip.hidden = interactive;
        lastInteractive = interactive;
      }
      if (closed !== lastClosed) {
        overlay.style.visibility = closed ? 'hidden' : 'visible';
        lastClosed = closed;
      }
    };

    gsap.set('.blade-rotation', { svgOrigin: '0 0', smoothOrigin: false });
    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'aperture',
        trigger: story,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: self => updateAccess(self.progress),
        onRefresh: self => { updateAccess(self.progress); measureHeader(); }
      }
    });

    // One SVG square covers the viewport diagonal, including rotated corners.
    timeline
      .fromTo(blades, { x: 0, y: 0 }, { x: 95, y: -95 * Math.tan(Math.PI / 8), duration: 0.3 }, 0)
      .to(blades, { x: 580, y: -580 * Math.tan(Math.PI / 8), duration: 0.35 }, 0.3)
      .to(blades, { x: 1080, y: -1080 * Math.tan(Math.PI / 8), duration: 0.2 }, 0.65)
      .to(blades, { x: 1320, y: -1320 * Math.tan(Math.PI / 8), duration: 0.15 }, 0.85)
      .fromTo('.blade-rotation', { rotation: 0, x: 0, y: 0, svgOrigin: '0 0', smoothOrigin: false }, { rotation: 22, duration: 1 }, 0)
      .fromTo('.hero-media', { scale: 1.045 }, { scale: 1, duration: 0.85 }, 0)
      .fromTo('.hero-shade', { opacity: 0.12 }, { opacity: 1, duration: 0.22 }, 0.6)
      .fromTo('.hero-inner', { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.65)
      .fromTo('.hero-caption', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, 0.7)
      .to('.shutter-copy', { opacity: 0, y: -12, duration: 0.15 }, 0.06)
      .to('.shutter-bottom', { opacity: 0, duration: 0.15 }, 0.18)
      .to(onlineEntry, { autoAlpha: 0, y: -16, duration: 0.15 }, 0.18)
      .to(overlay, { opacity: 0, duration: 0.05 }, 0.95);

    const skipIntro = () => {
      window.scrollTo({ top: timeline.scrollTrigger.end, behavior: 'instant' });
      timeline.progress(1);
      updateAccess(1);
      timeline.scrollTrigger.update();
      document.querySelector('.hero-event').focus({ preventScroll: true });
    };
    skip.addEventListener('click', skipIntro);
    updateAccess(timeline.scrollTrigger.progress);

    return () => {
      skip.removeEventListener('click', skipIntro);
      root.classList.remove('aperture-ready');
      heroContent.inert = false;
      onlineEntry.inert = false;
      overlay.style.removeProperty('visibility');
      skip.hidden = true;
    };
  });
}

root.classList.remove('aperture-pending');
measureHeader();

// Native anchor links also bypass the intro for keyboard and deep-link access.
addEventListener('pageshow', () => window.ScrollTrigger?.refresh());
motion.addEventListener('change', () => requestAnimationFrame(measureHeader));

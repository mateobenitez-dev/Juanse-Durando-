import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { runIntro } from './intro';

gsap.registerPlugin(ScrollTrigger);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = matchMedia('(hover: hover)').matches;

// Scroll suave, sincronizado con ScrollTrigger. En pantallas táctiles queda el scroll nativo.
const lenis = new Lenis({ autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

if (document.documentElement.classList.contains('intro-active')) {
  lenis.stop();
  window.scrollTo(0, 0);
}

runIntro({
  onDone: () => {
    lenis.start();
    ScrollTrigger.refresh();
  },
});

document.querySelector('a[href="#top"]')?.addEventListener('click', (e) => {
  e.preventDefault();
  lenis.scrollTo(0, { duration: 1.4 });
});

// Header: aparece al pasar el hero
const header = document.querySelector('[data-header]');
ScrollTrigger.create({
  trigger: '[data-hero]',
  start: 'bottom 80px',
  onEnter: () => header?.classList.add('is-solid'),
  onLeaveBack: () => header?.classList.remove('is-solid'),
});

// ---------- Stories ----------
const stories = document.querySelector<HTMLElement>('[data-stories]');
if (stories) {
  const slides = stories.querySelectorAll<HTMLElement>('.stories__slide');
  const bars = stories.querySelectorAll<HTMLElement>('.stories__bars i');
  const DURATION = 4.5;
  let current = 0;
  let fill: gsap.core.Tween | null = null;
  let visible = false;

  const show = (i: number) => {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle('is-active', n === current));
    bars.forEach((b, n) => gsap.set(b, { scaleX: n < current ? 1 : 0 }));
    fill?.kill();
    fill = gsap.to(bars[current], {
      scaleX: 1,
      duration: DURATION,
      ease: 'none',
      paused: !visible,
      onComplete: () => show(current + 1),
    });
  };

  stories.querySelector('[data-stories-next]')?.addEventListener('click', () => show(current + 1));
  stories.querySelector('[data-stories-prev]')?.addEventListener('click', () => show(current - 1));

  // Swipe horizontal
  let x0 = 0;
  stories.addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
  stories.addEventListener(
    'touchend',
    (e) => {
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    },
    { passive: true },
  );

  // Solo avanza mientras está en pantalla
  ScrollTrigger.create({
    trigger: stories,
    start: 'top 60%',
    end: 'bottom 40%',
    onToggle: (self) => {
      visible = self.isActive;
      if (visible) fill?.play();
      else fill?.pause();
    },
  });

  show(0);
}

// ---------- Reels ----------
const reels = document.querySelectorAll<HTMLElement>('.reel');
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      const v = e.target as HTMLVideoElement;
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
  },
  { threshold: 0.4 },
);
document.querySelectorAll('video[data-autoplay]').forEach((v) => io.observe(v));

reels.forEach((reel) => {
  const video = reel.querySelector('video')!;
  reel.querySelector('[data-sound]')?.addEventListener('click', () => {
    const turnOn = video.muted;
    // Un solo video con sonido a la vez
    reels.forEach((r) => {
      r.querySelector('video')!.muted = true;
      r.classList.remove('is-sound');
    });
    video.muted = !turnOn;
    reel.classList.toggle('is-sound', turnOn);
    if (turnOn) video.play().catch(() => {});
  });
});

// ---------- Galería: pasa a color al entrar en pantalla ----------
gsap.utils.toArray<HTMLElement>('.galeria__item').forEach((el) => {
  ScrollTrigger.create({
    trigger: el,
    start: 'top 75%',
    end: 'bottom 25%',
    toggleClass: 'is-in',
  });
});

if (!reduced) {
  // Hero: parallax de la foto y fade del contenido
  gsap.to('[data-hero-media] img', {
    yPercent: 15,
    ease: 'none',
    scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero__content', {
    autoAlpha: 0,
    y: -60,
    ease: 'none',
    scrollTrigger: { trigger: '[data-hero]', start: '40% top', end: 'bottom top', scrub: true },
  });

  // Stories: entra con zoom desde abajo
  gsap.from('[data-stories]', {
    scale: 0.88,
    borderRadius: 24,
    ease: 'none',
    scrollTrigger: { trigger: '[data-stories]', start: 'top bottom', end: 'top top', scrub: true },
  });

  // Bloques que aparecen al entrar en pantalla
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      autoAlpha: 0,
      y: 50,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%' },
    });
  });

  // Fotos que se descubren de abajo hacia arriba
  gsap.utils.toArray<HTMLElement>('[data-reveal-img]').forEach((el) => {
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: 'top 90%' } })
      .fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'expo.inOut' })
      .from(el.querySelector('img'), { scale: 1.3, duration: 1.6, ease: 'expo.out' }, 0.15);
  });

  // Contacto: parallax de la foto y el logo que sube
  gsap.to('[data-contact-media]', {
    yPercent: 10,
    ease: 'none',
    scrollTrigger: { trigger: '.contacto', start: 'top bottom', end: 'bottom bottom', scrub: true },
  });
  gsap.from('.contacto__logo', {
    yPercent: 60,
    autoAlpha: 0,
    duration: 1.2,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.contacto', start: 'top 40%' },
  });
}

if (!reduced && canHover) {
  // Botones magnéticos
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((btn) => {
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.3);
      yTo((e.clientY - r.top - r.height / 2) * 0.3);
    });
    btn.addEventListener('mouseleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}

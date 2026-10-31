import { gsap } from 'gsap';

const SEEN_KEY = 'jd-intro-visto';
const BEAT = 60 / 124; // segundos por pulso a 124 BPM
const MIN_LOAD = 1.8; // el contador nunca dura menos que esto

// Imágenes que conviene tener cargadas antes de abrir la página
const CRITICAL = ['/img/intro-1600.webp', '/img/hero-1600.webp'];

type IntroOptions = {
  onExitStart?: () => void;
  onDone: () => void;
};

function preload(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });
}

export function runIntro({ onExitStart, onDone }: IntroOptions) {
  const root = document.getElementById('intro');
  const html = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!root || reduced) {
    root?.remove();
    html.classList.remove('intro-active');
    onDone();
    return;
  }

  const q = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const logo = q('[data-intro-logo]');
  const logoInner = q('[data-intro-logo-inner]');
  const scan = q('[data-intro-scan]');
  const bg = q('[data-intro-bg]');
  const count = q('[data-intro-count]');
  const enter = q<HTMLButtonElement>('[data-intro-enter]');
  const skip = q<HTMLButtonElement>('[data-intro-skip]');
  const halves = root.querySelectorAll('[data-intro-half]');
  const metas = root.querySelectorAll('[data-intro-meta]');
  const heroLogo = document.querySelector<HTMLElement>('[data-hero-logo]');
  const heroMedia = document.querySelector('[data-hero-media]');
  const heroLines = document.querySelectorAll('[data-hero-line]');

  let seen = false;
  try {
    seen = localStorage.getItem(SEEN_KEY) === '1';
  } catch {}

  let ready = false;
  let leaving = false;
  let beat: gsap.core.Tween | null = null;
  const intro = gsap.timeline();

  // 1. Entrada: meta, foto de fondo y contador
  if (seen) {
    gsap.set(metas, { autoAlpha: 0 });
    intro.to(bg, { opacity: 1, duration: 0.4 });
  } else {
    intro
      .from(metas, { autoAlpha: 0, y: 10, duration: 0.6, stagger: 0.08 })
      .fromTo(bg, { opacity: 0, scale: 1.15 }, { opacity: 1, scale: 1.05, duration: 2.2, ease: 'power2.out' }, 0.2);
  }

  const loaded = { n: 0 };
  const progress = { v: 0 };
  const start = performance.now();
  const assets = Promise.all(
    CRITICAL.map((src) =>
      preload(src).then(() => {
        loaded.n++;
      }),
    ),
  );

  const revealLogo = () => {
    const w = logo.offsetWidth;
    const d = seen ? 0.5 : 1.1;
    gsap
      .timeline()
      .set(scan, { opacity: 1, x: 0 })
      .to(scan, { x: w, duration: d, ease: 'power3.inOut' })
      .to(logoInner, { clipPath: 'inset(0 0% 0 0)', duration: d, ease: 'power3.inOut' }, 0)
      .to(scan, { opacity: 0, duration: 0.3 })
      .add(() => {
        ready = true;
        if (seen) {
          exit();
          return;
        }
        beat = gsap.to(logo, { scale: 1.015, duration: BEAT / 2, repeat: -1, yoyo: true, ease: 'power1.out' });
        gsap.to(enter, { autoAlpha: 1, y: -6, duration: 0.6 });
      }, '-=0.2');
  };

  if (seen) {
    gsap.set('.intro__count', { autoAlpha: 0 });
    assets.then(revealLogo);
  } else {
    // El contador avanza con la carga real, pero nunca más rápido que MIN_LOAD
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      const byTime = Math.min(t / MIN_LOAD, 1) * 100;
      const byLoad = (loaded.n / CRITICAL.length) * 100;
      progress.v += (Math.min(byTime, byLoad) - progress.v) * 0.12;
      const shown = Math.round(progress.v > 99.5 ? 100 : progress.v);
      count.textContent = String(shown).padStart(3, '0');
      if (shown >= 100) {
        gsap.ticker.remove(tick);
        gsap.to('.intro__count', { autoAlpha: 0, y: 20, duration: 0.5, delay: 0.2 });
        revealLogo();
      }
    };
    gsap.ticker.add(tick);
  }

  // 2. Salida: el logo viaja al hero y la pantalla se abre en dos
  function exit() {
    if (leaving) return;
    leaving = true;
    intro.kill();
    beat?.kill();
    removeListeners();
    onExitStart?.();

    // Si se saltea antes de tiempo, dejamos el logo completo
    gsap.set(logoInner, { clipPath: 'inset(0 0% 0 0)' });
    gsap.set(scan, { opacity: 0 });
    gsap.set(logo, { scale: 1 });

    const from = logo.getBoundingClientRect();
    const to = heroLogo?.getBoundingClientRect();

    const tl = gsap.timeline({
      onComplete: () => {
        html.classList.remove('intro-active');
        root!.remove();
        try {
          localStorage.setItem(SEEN_KEY, '1');
        } catch {}
        onDone();
      },
    });

    tl.to([enter, skip, metas, '.intro__count'], { autoAlpha: 0, duration: 0.3 }, 0)
      .to(bg, { opacity: 0, scale: 1.2, duration: 0.8, ease: 'power2.in' }, 0)
      .to(halves[0], { yPercent: -100, duration: 1.2, ease: 'expo.inOut' }, 0.15)
      .to(halves[1], { yPercent: 100, duration: 1.2, ease: 'expo.inOut' }, 0.15);

    if (to) {
      tl.to(
        logo,
        {
          x: to.left - from.left,
          y: to.top - from.top,
          scale: to.width / from.width,
          duration: 1.3,
          ease: 'expo.inOut',
        },
        0,
      );
    } else {
      tl.to(logo, { autoAlpha: 0, duration: 0.5 }, 0);
    }

    if (heroMedia) tl.fromTo(heroMedia, { scale: 1.3 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0.3);
    if (heroLines.length) tl.from(heroLines, { autoAlpha: 0, y: 30, duration: 0.9, stagger: 0.08, ease: 'power3.out' }, 0.9);
  }

  // 3. Disparadores: scroll, swipe, teclado o click
  let touchY = 0;
  const onWheel = (e: WheelEvent) => {
    if (ready && e.deltaY > 0) exit();
  };
  const onTouchStart = (e: TouchEvent) => {
    touchY = e.touches[0].clientY;
  };
  const onTouchMove = (e: TouchEvent) => {
    if (ready && touchY - e.touches[0].clientY > 30) exit();
  };
  const onKey = (e: KeyboardEvent) => {
    if (ready && ['ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) {
      e.preventDefault();
      exit();
    }
  };

  function removeListeners() {
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('keydown', onKey);
  }

  window.addEventListener('wheel', onWheel, { passive: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('keydown', onKey);
  enter.addEventListener('click', exit);
  skip.addEventListener('click', exit);
}

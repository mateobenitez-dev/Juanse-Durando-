import { gsap } from 'gsap';

const SEEN_KEY = 'jd-intro-visto';
const BEAT = 60 / 124; // segundos por pulso a 124 BPM
// La mayoría de las visitas llegan desde el navegador de Instagram, donde la paciencia es menor
const IN_APP = /Instagram|FBAN|FBAV/i.test(navigator.userAgent);
const MIN_LOAD = IN_APP ? 2.2 : 2.8; // la barra de carga nunca dura menos que esto
const HOLD = 1.5; // segundos con el logo latiendo antes de dejar entrar

// Imágenes que conviene tener cargadas antes de abrir la página
const CRITICAL = ['img/intro-poster.jpg', 'img/hero-800.webp'];

type IntroOptions = {
  onDone: () => void;
};

function preload(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });
}

export function runIntro({ onDone }: IntroOptions) {
  const root = document.getElementById('intro');
  const html = document.documentElement;
  // No se respeta prefers-reduced-motion: muchas PCs con Windows lo traen activado
  // ("efectos de animación" apagados) y la intro es parte central de la marca.
  if (!root) {
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
  const bar = q('[data-intro-bar]');
  const enter = q<HTMLButtonElement>('[data-intro-enter]');
  const halves = root.querySelectorAll('[data-intro-half]');
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

  // 1. Entrada: video de fondo y barra de carga
  intro.fromTo(bg, { opacity: 0, scale: 1.15 }, { opacity: 1, scale: 1.05, duration: seen ? 1 : 3, ease: 'power2.out' });

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
    const d = seen ? 1 : 1.8;
    gsap
      .timeline()
      .set(scan, { opacity: 1, x: 0 })
      .to(scan, { x: w, duration: d, ease: 'power3.inOut' })
      .to(logoInner, { clipPath: 'inset(0 0% 0 0)', duration: d, ease: 'power3.inOut' }, 0)
      .to(scan, { opacity: 0, duration: 0.3 })
      .add(() => {
        beat = gsap.to(logo, { scale: 1.015, duration: BEAT / 2, repeat: -1, yoyo: true, ease: 'power1.out' });
      }, '-=0.2')
      // El logo queda latiendo un rato antes de habilitar la entrada
      .add(() => {
        ready = true;
        if (seen) {
          exit();
          return;
        }
        gsap.to(enter, { autoAlpha: 1, duration: 0.6 });
      }, `+=${seen ? HOLD * 0.7 : HOLD}`);
  };

  if (seen) {
    gsap.set('.intro__bar', { autoAlpha: 0 });
    assets.then(revealLogo);
  } else {
    // La barra avanza con la carga real, pero nunca más rápido que MIN_LOAD
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      const byTime = Math.min(t / MIN_LOAD, 1);
      const byLoad = loaded.n / CRITICAL.length;
      progress.v += (Math.min(byTime, byLoad) - progress.v) * 0.15;
      const done = progress.v > 0.995;
      gsap.set(bar, { scaleX: done ? 1 : progress.v });
      if (done) {
        gsap.ticker.remove(tick);
        gsap.to('.intro__bar', { autoAlpha: 0, duration: 0.4, delay: 0.1 });
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

    tl.to([enter, '.intro__bar'], { autoAlpha: 0, duration: 0.3 }, 0)
      .to(bg, { opacity: 0, scale: 1.2, duration: 1.1, ease: 'power2.in' }, 0)
      .to('.intro__grain', { opacity: 0, duration: 1.4, ease: 'power1.inOut' }, 0.2)
      .to(halves[0], { yPercent: -100, duration: 1.8, ease: 'expo.inOut' }, 0.25)
      .to(halves[1], { yPercent: 100, duration: 1.8, ease: 'expo.inOut' }, 0.25);

    if (to) {
      tl.to(
        logo,
        {
          x: to.left - from.left,
          y: to.top - from.top,
          scale: to.width / from.width,
          duration: 1.9,
          ease: 'expo.inOut',
        },
        0,
      );
    } else {
      tl.to(logo, { autoAlpha: 0, duration: 0.5 }, 0);
    }

    if (heroMedia) tl.fromTo(heroMedia, { scale: 1.3 }, { scale: 1, duration: 2.4, ease: 'expo.out' }, 0.5);
    if (heroLines.length) tl.from(heroLines, { autoAlpha: 0, y: 30, duration: 0.9, stagger: 0.1, ease: 'power3.out' }, 1.4);
  }

  // 3. Disparadores: scroll, swipe, teclado o tocar en cualquier parte
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
  root.addEventListener('click', () => {
    if (ready) exit();
  });
}

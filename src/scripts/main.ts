import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { runIntro } from './intro';

gsap.registerPlugin(ScrollTrigger);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = matchMedia('(hover: hover)').matches;

// Scroll suave, sincronizado con ScrollTrigger
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

// Anclas del menú con scroll suave
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href')!;
    if (id === '#') return;
    const target = id === '#top' ? 0 : document.querySelector<HTMLElement>(id);
    if (target === null) return;
    e.preventDefault();
    closeMenu();
    lenis.scrollTo(target, { offset: 0, duration: 1.4 });
  });
});

// Menú móvil
const menu = document.querySelector<HTMLElement>('[data-menu]');
const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
function closeMenu() {
  menu?.classList.remove('is-open');
  menu?.setAttribute('aria-hidden', 'true');
  toggle?.setAttribute('aria-expanded', 'false');
}
toggle?.addEventListener('click', () => {
  const open = !menu?.classList.contains('is-open');
  menu?.classList.toggle('is-open', open);
  menu?.setAttribute('aria-hidden', String(!open));
  toggle.setAttribute('aria-expanded', String(open));
});

// Header: se vuelve sólido y muestra el logo al pasar el hero
const header = document.querySelector('[data-header]');
ScrollTrigger.create({
  trigger: '[data-hero]',
  start: 'bottom 80px',
  onEnter: () => header?.classList.add('is-solid'),
  onLeaveBack: () => header?.classList.remove('is-solid'),
});

// Videos: solo se reproducen cuando están en pantalla
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    const v = e.target as HTMLVideoElement;
    if (e.isIntersecting) v.play().catch(() => {});
    else v.pause();
  });
});
document.querySelectorAll('video[data-autoplay]').forEach((v) => io.observe(v));

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

  // Marquee: corre solo y acelera con la velocidad del scroll
  const track = document.querySelector('[data-marquee]');
  if (track) {
    const loop = gsap.to(track, { xPercent: -50, duration: 22, ease: 'none', repeat: -1 });
    ScrollTrigger.create({
      onUpdate: (self) => {
        const v = Math.min(Math.abs(self.getVelocity()) / 300, 6);
        gsap.to(loop, { timeScale: (self.direction || 1) * (1 + v), duration: 0.2, overwrite: true });
        gsap.to(loop, { timeScale: self.direction || 1, duration: 1.2, delay: 0.2 });
      },
    });
  }

  // Títulos: palabra por palabra
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    const words = el.textContent!.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent!.trim());
    el.innerHTML = words.map((w) => `<span class="word" aria-hidden="true"><span>${w}</span></span>`).join(' ');
    gsap.from(el.querySelectorAll('.word > span'), {
      yPercent: 110,
      duration: 1,
      stagger: 0.06,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  // Bloques que aparecen al entrar en pantalla
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      autoAlpha: 0,
      y: 40,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });

  // Fotos que se descubren de abajo hacia arriba
  gsap.utils.toArray<HTMLElement>('[data-reveal-img]').forEach((el) => {
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: 'top 80%' } })
      .fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'expo.inOut' })
      .from(el.querySelector('img'), { scale: 1.3, duration: 1.8, ease: 'expo.out' }, 0.2);
  });

  // Galería: scroll horizontal mientras la sección queda fija
  const galeria = document.querySelector<HTMLElement>('[data-galeria]');
  const gTrack = document.querySelector<HTMLElement>('[data-galeria-track]');
  if (galeria && gTrack) {
    const distance = () => Math.max(0, gTrack.scrollWidth - window.innerWidth);
    gsap.to(gTrack, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: galeria,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: '.galeria__pin',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
  }
}

if (!reduced && canHover) {
  // Eventos: la foto sigue al cursor sobre cada fila
  const float = document.querySelector<HTMLElement>('[data-eventos-float]');
  const floatImg = float?.querySelector('img');
  if (float && floatImg) {
    const xTo = gsap.quickTo(float, 'x', { duration: 0.5, ease: 'power3' });
    const yTo = gsap.quickTo(float, 'y', { duration: 0.5, ease: 'power3' });
    let mx = 0;
    let my = 0;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      xTo(mx - float.offsetWidth / 2);
      yTo(my - float.offsetHeight / 2);
    });
    // Al scrollear el cursor no se mueve, así que mouseleave no siempre dispara
    lenis.on('scroll', () => {
      if (!document.elementFromPoint(mx, my)?.closest('[data-evento]')) {
        gsap.to(float, { autoAlpha: 0, scale: 0.6, duration: 0.3, overwrite: true });
      }
    });
    document.querySelectorAll<HTMLElement>('[data-evento]').forEach((row) => {
      row.addEventListener('mouseenter', () => {
        floatImg.src = row.dataset.img!;
        gsap.to(float, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'power3.out' });
      });
      row.addEventListener('mouseleave', () => {
        gsap.to(float, { autoAlpha: 0, scale: 0.6, duration: 0.3 });
      });
    });
  }

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

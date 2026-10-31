# Juanse Durando · DJ

Landing page de Juanse Durando, DJ de Santa Fe capital (Argentina).

- [Plan de la landing](docs/PLAN-LANDING.md)
- [Clasificación del material](docs/CLASIFICACION.md)

## Correr en tu compu

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # genera dist/ para publicar
```

Stack: Astro + GSAP (ScrollTrigger) + Lenis. Se publica en Netlify (`netlify.toml` ya está listo).

## Dónde cambiar cosas

- Redes, WhatsApp y mail: `src/data/site.ts` (todo lo que dice `PENDIENTE`).
- Color de acento: `--accent` en `src/styles/global.css`.
- Intro de entrada: `src/components/Intro.astro` y `src/scripts/intro.ts`. Para volver a verla completa, borrá `jd-intro-visto` del localStorage del navegador.
- Fotos y video optimizados: `public/img` y `public/video`. Los originales pesados no se suben al repo.

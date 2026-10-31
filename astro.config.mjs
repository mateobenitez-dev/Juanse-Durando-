import { defineConfig } from 'astro/config';

// En GitHub Pages la web vive en /Juanse-Durando-/; en el dominio propio, en la raíz.
// TODO: reemplazar el dominio cuando esté comprado
const pages = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  site: pages ? 'https://mateobenitez-dev.github.io' : 'https://juansedurando.com.ar',
  base: pages ? '/Juanse-Durando-' : undefined,
});

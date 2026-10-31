# Plan: landing page de Juanse Durando (DJ · Santa Fe capital)

## 1. Objetivo
Una sola página, rápida y muy visual, que funcione como tarjeta de presentación y presskit: que un organizador o un boliche entre, sienta la energía de Juanse en 5 segundos y lo contrate por WhatsApp. Segundo objetivo: aparecer en Google cuando busquen "DJ Santa Fe", "DJ cachengue Santa Fe", "Juanse Durando".

## 2. Qué tomamos de cada referencia
**deejay.com.ar/thiagocupe** (estructura, no contenido):
- Logo arriba, contacto siempre a mano (WhatsApp + Instagram en el header).
- Menú corto: Inicio · Eventos · About / Bio · Presskit · Contacto.
- Bloque destacado tipo slider con foto grande, título y ubicación ("Santa Fe").
- Botón "WhatsApp Contrataciones" separado del WhatsApp general.
- Lo que **mejoramos**: esa web es una plantilla genérica (multi-página, poco animada). La nuestra es una sola página con scroll animado, más marca propia.

**rr-estudio.netlify.app** (estilo de la intro):
- Pantalla de entrada con el logo grande y la consigna "Deslizá para entrar": el usuario hace scroll/swipe y recién ahí se abre la página.
- Paleta oscura con un solo color de marca, tipografía grande, secciones simples.
- Botón de acción fijo (en su caso "Reservar turno"; en el nuestro "Contratar").

## 3. Identidad visual
- **Fondo** negro casi puro `#0B0B0C`, texto blanco hueso `#F2EEE9`. Encaja con toda la sesión de estudio (fondo negro, remera negra).
- **Color de acento**: rojo de escenario `#E3262E` (sale de las luces de Fiesta U). Alternativa: naranja `#FF6A2B` de los banners del escenario de IMG_9053. Elegimos uno solo.
- **Tipografía**: el logo es geométrico/futurista. Títulos en una display ancha (p. ej. *Unbounded* o *Syne*), textos en *Inter* o *Space Grotesk*. Todo en Google Fonts, gratis.
- **Tratamiento de fotos**: blanco y negro con grano leve en reposo; al pasar el mouse o al entrar en pantalla, aparece el color. Unifica las fotos de celular con las de estudio.

## 4. Intro de entrada (la parte más importante)
Secuencia de ~3 s, siempre salteable:
1. **Pantalla negra + contador** 00 → 100 en la esquina mientras se precargan fotos y video (texto chico tipo "SANTA FE · ARG").
2. **Logo** `juanse blanco.png` (en SVG) se dibuja letra por letra o aparece con máscara de abajo hacia arriba; leve vibración tipo "beat" sincronizada a ~124 BPM.
3. **Fondo**: una foto de `luz-dramatica/` (p. ej. _D1A2958) o el video `3.mp4` muy oscuro y desenfocado detrás del logo.
4. **Consigna** "Deslizá para entrar" / "Scroll para entrar" con flecha animada. Botón opcional "Entrar con sonido 🔊" que activa un loop corto de audio (los navegadores bloquean audio sin clic, por eso va en botón).
5. **Transición**: al hacer scroll, el logo se achica y viaja al header, y una cortina negra se abre en dos (o un círculo que crece desde el centro) revelando el hero.
- Solo se muestra completa la primera visita (se guarda en `localStorage`); las siguientes, versión de 0,8 s.
- Respeta `prefers-reduced-motion`: sin animaciones, entra directo.

## 5. Secciones de la página (en orden)
1. **Header fijo**: logo chico, menú (Bio · Eventos · Galería · Video · Contacto), botón "Contratar" en color de acento, iconos de Instagram/WhatsApp. En mobile, menú hamburguesa a pantalla completa con links grandes.
2. **Hero**: video vertical en loop mudo (mobile) / foto `auriculares/_D1A2858` a pantalla completa (escritorio). Texto enorme "JUANSE DURANDO" + "DJ · Santa Fe, Argentina" + botón "Contratar". Parallax suave al scrollear.
3. **Marquee** (cinta que corre): "CACHENGUE · REMIX · FIESTAS · BOLICHES · EVENTOS PRIVADOS · " en loop, cambia de velocidad con el scroll.
4. **Bio**: foto `anteojos/` fija a la izquierda, texto a la derecha que aparece línea por línea. 2 o 3 datos en números animados (años tocando, eventos, ciudades) — **los datos los tiene que pasar Juanse**.
5. **Eventos / Fechas**: lista tipo "line-up" (fecha · lugar · ciudad · botón entradas). Al pasar el mouse por cada fila aparece una foto en vivo que sigue al cursor. Fotos: `03_Fotos-En-Vivo/`. Separar "Próximas" y "Pasadas".
6. **Galería**: grilla tipo mosaico o carrusel horizontal que avanza con el scroll vertical (scroll horizontal "pinneado"). Mezcla estudio + en vivo. Lightbox al tocar.
7. **Video / Sets**: los dos reels verticales lado a lado (tipo celulares) + embed de SoundCloud/Spotify cuando tengamos el link.
8. **Presskit**: botón de descarga (zip o PDF con fotos HD, logo y bio) — opcional, muy útil para organizadores.
9. **Contacto / Booking**: foto `sentado-flightcase/` con el logo del case, botón grande "WhatsApp Contrataciones", mail, Instagram, TikTok. Formulario simple (nombre, fecha del evento, ciudad, tipo de evento) que llega por mail.
10. **Footer**: logo gigante recortado al borde, redes, "Santa Fe · Argentina", © 2026, crédito del fotógrafo si corresponde.
11. **Botón flotante de WhatsApp** en mobile, siempre visible.

**Placeholders pendientes** (los dejamos marcados en el código hasta que los pases): Instagram, TikTok, SoundCloud/Spotify, YouTube, número de WhatsApp, mail, bio, fechas.

## 6. Animaciones (resumen)
- Scroll suave (Lenis) + animaciones ligadas al scroll (GSAP ScrollTrigger).
- Títulos que entran con máscara palabra por palabra.
- Fotos que se revelan con un "clip" de abajo hacia arriba y pasan de B/N a color.
- Cursor personalizado (círculo que crece sobre links y dice "VER" sobre fotos) solo en escritorio.
- Botones "magnéticos" (siguen un poco al mouse).
- Transiciones entre secciones con cortina del color de acento.
- Todo con `prefers-reduced-motion` y sin animaciones pesadas en mobile de gama baja.

## 7. Tecnología
- **Astro** (sitio estático, carga muy rápida, buen SEO) + **GSAP** (ScrollTrigger, SplitText, gratis desde 2025) + **Lenis**.
- Imágenes optimizadas a WebP/AVIF en varios tamaños (las de estudio pasan de 3 MB a ~150 KB). Videos recomprimidos a ~3 MB.
- Hosting en **Netlify** (gratis, el mismo que usa RR Estudio), formulario con Netlify Forms, dominio propio sugerido: `juansedurando.com.ar` o `.com`.
- Código en el repo `mateobenitez-dev/Juanse-Durando-`. Las fotos y videos originales **no** van al repo (pesan mucho); van solo las versiones optimizadas.

## 8. SEO e indexación
- `<title>`: "Juanse Durando · DJ en Santa Fe, Argentina | Contrataciones".
- Meta description con "DJ en Santa Fe capital", fiestas, boliches, eventos privados.
- Datos estructurados JSON-LD: `MusicGroup`/`Person` con `sameAs` → todas las redes, `areaServed: Santa Fe`, `telephone` (WhatsApp). Esto es lo que permite que Google relacione la web con el Instagram y el número.
- Open Graph + imagen para compartir (foto + logo) para que el link se vea bien en WhatsApp e Instagram.
- `sitemap.xml`, `robots.txt`, alta en **Google Search Console** y perfil de **Google Business** ("DJ en Santa Fe") con el mismo teléfono.
- Link a la web en la bio de Instagram y TikTok.
- Textos alternativos en todas las fotos ("Juanse Durando DJ en Fiesta U, Santa Fe").

## 9. Skills de Claude Code que conviene usar en el armado
- **Taste**: definir y revisar la dirección visual (paleta, tipografías, que no se vea "plantilla").
- **UX Designer**: orden de secciones, flujo hacia "Contratar", versión mobile primero.
- **Transitions**: la intro, la cortina de entrada y las transiciones entre secciones.
- **Canvas Design**: imagen para compartir (OG), portada del presskit y versiones del logo.
- **Web Artifacts Builder**: prototipos rápidos de la intro y del hero para elegir antes de armar todo.

## 10. Etapas
1. **Prep de material** (½ día): logo a SVG, elegir 10–15 fotos finales, optimizar imágenes y videos.
2. **Prototipo de intro + hero** (1 día): 2 variantes de intro para elegir.
3. **Maqueta completa** (1–2 días): todas las secciones con placeholders, responsive.
4. **Animaciones finas** (1 día).
5. **Contenido real** (cuando lo pases): redes, teléfono, bio, fechas, sets.
6. **SEO + publicación** (½ día): Netlify, dominio, Search Console, Google Business.

## 11. Lo que necesito de vos / de Juanse
- Redes (Instagram, TikTok, SoundCloud/Spotify, YouTube) y número de WhatsApp de contrataciones.
- Mail de contacto.
- Bio corta (3–5 líneas) y géneros que toca.
- Fechas próximas y algunos eventos pasados destacados (nombre, lugar, fecha).
- Color de acento: rojo o naranja.
- Si tiene dominio o hay que comprarlo.
- Nombre del fotógrafo de la sesión de estudio (para el crédito).

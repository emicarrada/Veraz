# Veraz — Caso de estudio

**Preparado para Chiikö Estudio Creativo**  
Plataforma de noticias · Producto + diseño + ingeniería  
URL: [veraz.app](https://www.veraz.app)

---

## 1. Resumen ejecutivo

**Veraz** es una plataforma de noticias cuyo lema operativo es **«informar sin influenciar»**: agrega fuentes verificables, muestra titulares y extractos con atribución clara y enlaza al medio original sin republicar el artículo completo. La inteligencia artificial es **opcional** y nunca bloquea la publicación ni la lectura.

Desde la perspectiva de un estudio creativo, Veraz combina:

- Un **design system** tokenizado (tema oscuro por defecto, tipografía propia).
- Una **landing** con motion (GSAP) y un **globo 3D** interactivo (React Three Fiber).
- Un **producto de lectura** bilingüe (es/en) con feed por verticales y banner de confianza en fuentes «prestigiosas».
- Un **backend** modular (Next.js + Supabase) con motor de ingesta RSS multi-fuente y **distribución social automatizada** (X, Instagram, entrega de video por Telegram para TikTok manual).

Veraz funciona en producción en **Vercel** (web + cron de ingesta) y en **AWS EC2** (publicación social con Playwright, fuera del hot path de la web).

---

## 2. Qué es Veraz (producto)

| Dimensión | Descripción |
|-----------|-------------|
| **Qué hace** | Curación y presentación de noticias desde RSS y catálogo de medios; detalle por artículo con SEO, JSON-LD y referencias a la fuente. |
| **Qué no hace** | No inventa hechos; no depende de IA para existir; no sustituye al medio original (excerpt + enlace). |
| **Audiencia** | Lectores en español (prioridad LATAM) e inglés; verticales economía, tecnología, deportes, sociedad, etc. |
| **Marca** | Tono sobrio, alta legibilidad, confianza por transparencia de fuente. |

### Principios de producto (relevantes para narrativa de marca)

1. **Núcleo = noticias** — Publicar y leer no requieren IA.
2. **Trazabilidad** — Todo enriquecimiento futuro debe citar fuentes reales.
3. **Neutralidad operativa** — La plataforma informa; no empuja un relato editorial propio.
4. **Lectura primero** — Sin llamadas síncronas a modelos en el camino crítico del usuario.

---

## 3. Estructura del proyecto (mapa mental)

Arquitectura: **monolito modular** sobre **Next.js 15 (App Router)**.

```
src/
├── app/              → Rutas, layouts, metadata SEO, Route Handlers (cron API)
├── components/       → Design system (ui/) + layout + marketing + analytics
├── features/         → Lógica por dominio de producto (news, social-publishing, …)
├── domain/           → Entidades puras (Article, Source, Story, …) sin infra
├── lib/              → Infra: Supabase, news-ingestion, ai-engine, social-publishing
├── config/           → Única capa que lee variables de entorno
├── i18n/             → Rutas y mensajes es/en (next-intl)
└── styles/           → Tokens CSS, tipografía, landing motion
```

**Reglas de dependencia (diseño consciente):**

- `app/` solo compone; no contiene reglas de negocio.
- Features no se importan entre sí por internals; solo `index.ts`.
- Dominio **puro**: sin React, sin Supabase, sin SDKs de IA.
- IA y RSS solo entran por **puertas únicas**: `@/lib/ai-engine` y `@/lib/news-ingestion`.

Deploy:

| Pieza | Dónde |
|-------|--------|
| Web, ISR, API cron ingesta | Vercel |
| PostgreSQL + auth | Supabase |
| Publicación X / IG / video Telegram | AWS EC2 + cron + Playwright |

---

## 4. Diseño web — lo novedoso para un caso de estudio

### 4.1 Design system tokenizado

- **Tokens centralizados** en `src/styles/tokens.css` (color, espacio, radio, motion, z-index).
- **Tipografía**: escala semántica (`.text-display`, `.text-h1`, …) + fuentes **Helvetica Now Display / Veraz Sans**.
- **Tema oscuro por defecto** (`data-theme`), accesibilidad AA (focus visible, roles ARIA).
- Componentes primitivos reutilizables: `Button`, `Card`, `Text`, `Container`, etc.

*Aprendizaje para Chiikö:* un producto editorial puede mantener identidad fuerte sin diseños one-off por pantalla; los tokens permiten iterar marca y UI en paralelo.

### 4.2 Landing de marketing

Ruta `/` — composición modular en secciones:

1. Hero full-bleed con glow y grid mask  
2. Qué es Veraz  
3. Cómo funciona  
4. Características  
5. Categorías  
6. Beneficios  
7. CTA final  

**Motion:**

- Revelados CSS con `prefers-reduced-motion`.
- **PillNav** (navegación tipo píldora) animada con **GSAP** (hover, stagger, logo).
- **Locale switcher** con transición circular GSAP + evento analítico.

**Hero 3D:**

- Componente **`3d-globe`**: globo terrestre con texturas, atmósfera shader, marcadores HTML sobre la esfera, controles orbitales suaves.
- Stack: **@react-three/fiber** + **drei** + Three.js — integrado en landing sin sacrificar SSR en el resto de la página (slot client-side).

*Aprendizaje:* combinar **brand minimal** con **un solo focal point 3D** evita el “sitio de noticias genérico” y refuerza metáfora global / veracidad multi-fuente.

### 4.3 Producto de lectura (`/noticias`)

- **Feed** con tabs por vertical (economía, tecnología, política, deportes, …).
- **Filtros** por tags específicos (Messi, Trump, OpenAI, cripto, …).
- **Banner de confianza** en verticales “prestigiosas”: muestra medios permitidos (CNBC, Expansión, TechCrunch, Infobae, etc. según locale).
- **Tarjetas de artículo** con imagen segura, categoría, fuente y excerpt.
- **Detalle** con hero image, metadatos, cuerpo, **referencias** y **JSON-LD** para SEO.
- **Paginación** “load more” sin recargar la app entera.
- **Shell de app** distinto del marketing (navegación de producto vs landing).

### 4.4 Internacionalización

- Rutas localizadas `/es/...` y `/en/...`.
- Catálogo de fuentes RSS distinto por idioma; en `/es` finanzas/tecnología pueden mezclar fuentes EN de referencia con disclosure al usuario.
- Copy de feed, landing y legal vía **next-intl**.

### 4.5 Analytics respetuoso del producto

- **PostHog** opcional (feature flag + keys); pageviews en App Router con componente dedicado.
- Eventos puntuales (ej. cambio de idioma) sin bloquear UX.

---

## 5. Backend e infraestructura (visión caso de estudio)

### 5.1 Ingesta de noticias (News Ingestion Engine)

Pipeline diseñado por etapas (aunque no todas están en producción al 100%):

`discover → fetch → normalize → validate → dedupe → story → persist → publish`

**Hoy operativo:**

- Proveedor **RSS** funcional (fetch XML, parse, normalizar a modelo interno).
- Persistencia idempotente en **Supabase** (`articles`, `sources`, …).
- **Scheduler** vía GitHub Actions / cron API (`CRON_SECRET`) para discover, run, health.
- Catálogo amplio: Infobae, La Nación, El País, BBC Mundo, TechCrunch, CNBC, etc.

**Diseño destacable:** un proveedor caído no tumba el resto; la lectura pública no espera a la ingesta.

### 5.2 Modelo de dominio

Entidades claras: **Source**, **Article**, **Media**, **Reference**, **Story** (cluster multi-fuente del mismo hecho), **AIAnalysis** (opcional, satélite).

Invariante clave para comunicación de producto: **un artículo es válido sin IA y sin usuario premium**.

### 5.3 AI Engine (opcional, desacoplado)

- Modo default: **`disabled`**.
- Provider pattern (OpenAI, Gemini, Anthropic, Ollama, …) detrás de una sola fachada.
- **`failOpen`**: si la IA falla, la noticia se publica igual.

*Mensaje para cliente/studio:* Veraz es una **plataforma de medios**, no un wrapper de ChatGPT.

### 5.4 Config Engine

- Toda configuración pasa por `src/config`; el resto del código no lee `process.env` suelto.
- Feature flags: IA, premium, timeline, búsqueda avanzada, mantenimiento, etc.

---

## 6. Distribución social (operación real)

Capa **`social-publishing`** (feature + lib):

| Canal | Mecanismo |
|-------|-----------|
| **X** | Playwright + perfil Chrome persistente; tarjeta PNG 1080×1080 |
| **Instagram feed** | Mismo PNG; xvfb + headed en servidor |
| **TikTok / Reels** | MP4 9:16 (Pexels + overlay Veraz + ffmpeg); **entrega por Telegram** al operador (video + caption copiable); publicación manual en app |
| **Selección de noticias** | **Reach score** unificado (categoría, hero, gancho de titular, fuente tier‑1, penalización geo-local) |

Variantes visuales de tarjeta: `editorial`, `light-frame`, **`hero-gradient`** (foto full + degradado + logo).

Cron en AWS con rutas absolutas y logs en `.social/publish.log` / `deliver-video.log`.

---

## 7. Stack tecnológico (referencia rápida)

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 15, React 19, TypeScript strict, Tailwind |
| 3D | Three.js, React Three Fiber, drei |
| Motion | GSAP (nav, locale), CSS landing |
| i18n | next-intl |
| Datos | Supabase (Postgres + RLS) |
| Hosting web | Vercel |
| Social workers | AWS EC2, Playwright, ffmpeg, Telegram Bot API |
| Tests | Vitest |
| Analytics | PostHog (opcional) |

---

## 8. Ángulos narrativos para Chiikö (pitch creativo)

1. **Marca = confianza, no ruido** — UI oscura, tipografía grande, poca decoración superflua; el contenido manda.
2. **Un hero memorable** — El globo 3D comunica alcance global y rigor sin stock photo de periódico.
3. **Sistema, no pantallas sueltas** — Tokens + variantes de social card demuestran que la identidad escala a web **y** a redes.
4. **Producto honesto** — Arquitectura que no vende humo de IA: opcional, trazable, fail-open.
5. **Operación 24/7** — Ingesta + cron + score de alcance = producto de medios moderno, no solo sitio brochure.

---

## 9. Estado y roadmap (honestidad para el caso)

**Maduro hoy:** feed, detalle, SEO, ingesta RSS, persistencia, publicación social X/IG, pipeline video + Telegram, reach score, i18n, landing + globe, design system.

**En evolución:** más proveedores de ingesta, dedupe/story clustering avanzado, IA en producción, premium, búsqueda avanzada, timeline.

---

## 10. Cierre

Veraz es un ejemplo de **producto editorial digital** donde diseño, marca y arquitectura backend están alineados: la experiencia visual refuerza credibilidad, y la infraestructura garantiza que el sistema siga informando aunque falle un proveedor externo o un modelo de IA.

---

*Documento generado a partir del repositorio y documentación interna de Veraz (2026). Uso libre para presentación en Chiikö Estudio Creativo.*

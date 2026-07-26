# Publicación social — Veraz (automática)

Flujo: **noticia en Supabase → PNG → caption → X + Instagram** en tu PC (Playwright + Chrome).

## Modo automático (lo que quieres)

### Una sola vez — sesiones

```bash
npm run social:login -- x
npm run social:login -- instagram
```

Solo **iniciar sesión** y cerrar Chrome. **No publiques nada a mano.**

### `.env.local`

```bash
SOCIAL_PUBLISHING_ENABLED=true
SOCIAL_AUTO_PUBLISH=true
SOCIAL_RENDERER=internal
SOCIAL_CARD_VARIANT=hero-gradient
SOCIAL_PLATFORMS=x,instagram
SOCIAL_MAX_POSTS_PER_RUN=1
SOCIAL_HEADED=true
```

`SOCIAL_AUTO_PUBLISH=true` equivale a exportar **y** publicar en redes (sin dry-run).

Primera prueba con `SOCIAL_HEADED=true` para ver el navegador. Cuando funcione, pon `SOCIAL_HEADED=false` para cron.

### Cada publicación

```bash
npm run social:publish
```

El script elige noticia, genera imagen, abre Chrome con tu sesión, publica en X e Instagram y guarda estado en `social_publications`.

### Cron (solo)

Ver **`docs/social-vps.md`** y **`scripts/social-crontab.example`** (VPS 24/7; Vercel no publica en redes).

```bash
0 */3 * * * cd /ruta/Veraz && npm run social:publish >> .social/publish.log 2>&1
```

Ritmo sugerido: **6×/día X**, **3×/día IG** (impacto alto) con cuotas `SOCIAL_X_MAX_POSTS_PER_DAY` / `SOCIAL_INSTAGRAM_MAX_POSTS_PER_DAY`.

## Flags (alternativa a AUTO_PUBLISH)

| Variable | Efecto |
|----------|--------|
| `SOCIAL_AUTO_PUBLISH=true` | Todo automático |
| `SOCIAL_DRY_RUN=true` | Solo preview en consola |
| `SOCIAL_PUBLISH_NETWORKS=true` + `SOCIAL_DRY_RUN=false` | Igual que auto, explícito |

## Captions

- **X**: titular + enlace + fuente (≤280)
- **Instagram**: titular + enlace + fuente + hashtags

Opcional: `SOCIAL_HASHTAGS=`, `SOCIAL_CAPTION_INCLUDE_EXCERPT=true`

## Reels / TikTok (9:16)

Misma identidad visual en vertical + **MP4** (~15 s): **video Pexels** + overlay (sin Ken Burns).

```bash
npm run social:examples:vertical
```

Salida: `.social/examples/reels-tiktok/` (`*-vertical.png` + `*-reels-tiktok.mp4`).

Variante: `hero-gradient-vertical` (1080×1920). **Auto-upload**: `npm run social:publish:video` (TikTok, Reels, YouTube).

### Fondo de video (Pexels)

Por defecto los Reels usan **clip de stock** ([Pexels API](https://www.pexels.com/api/)), no zoom sobre una foto:

```bash
# .env.local
PEXELS_API_KEY=tu_clave_gratis
# SOCIAL_REEL_BACKGROUND=pexels   # default si hay key
# SOCIAL_REEL_BACKGROUND=image    # forzar imagen estática sin zoom
```

Mismo `.mp4` para Reels y TikTok: video de fondo + overlay Veraz (titular, fuente, logo).

## TikTok / Reels / YouTube Shorts (automático)

Mismo MP4 9:16 (Pexels + overlay). Comando dedicado:

```bash
npm run social:publish:video
```

Por defecto publica en `tiktok`, `instagram_reels`, `youtube` (override con `SOCIAL_PLATFORMS`).

### 1. Migración Supabase

```bash
supabase db push
```

(Añade plataformas `instagram_reels` y `youtube` en `social_publications`.)

### 2. Sesiones (una vez en tu PC)

```bash
npm run social:login -- tiktok
# Reels = misma sesión que Instagram feed
npm run social:login -- instagram
```

Copia al VPS: `.social/tiktok-profile` y `.social/instagram-profile` (Reels usa Instagram).

### 3. YouTube (API, sin navegador)

1. [Google Cloud Console](https://console.cloud.google.com/) → proyecto → **YouTube Data API v3** activada.
2. **OAuth client** tipo **Desktop** → `YOUTUBE_CLIENT_ID` y `YOUTUBE_CLIENT_SECRET` en `.env.local`.
3. En el client, redirect URI: `http://127.0.0.1:8765/oauth2callback`
4. En tu PC:

```bash
npm run social:youtube-auth
```

5. Pega `YOUTUBE_REFRESH_TOKEN=...` en `.env.local` y en el VPS (no commitear).

### 4. `.env.local` (video)

```bash
PEXELS_API_KEY=...
SOCIAL_TIKTOK_MAX_POSTS_PER_DAY=2
SOCIAL_INSTAGRAM_REELS_MAX_POSTS_PER_DAY=2
SOCIAL_YOUTUBE_MAX_POSTS_PER_DAY=2
SOCIAL_TIKTOK_PROFILE_DIR=.social/tiktok-profile
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REFRESH_TOKEN=
# YOUTUBE_PRIVACY=public
```

### 5. Probar

```bash
SOCIAL_HEADED=true SOCIAL_PLATFORMS=tiktok npm run social:publish:video
```

Luego una red cada vez o las tres. En VPS: `ffmpeg` instalado (`sudo apt install -y ffmpeg`).

### 6. Cron en VPS (ejemplo)

```cron
30 11,18 * * * cd /home/veraz/Veraz && npm run social:publish:video >> .social/publish-video.log 2>&1
```

Cuotas diarias por plataforma en Supabase (`social_publications`).

## TikTok (publicación)

Implementado vía **TikTok Studio** (Playwright). Si cambia la UI, usa `SOCIAL_HEADED=true`.

## Supabase

```bash
supabase db push
```

## Si falla

- `npm run social:login -- x` (sesión caducada)
- `SOCIAL_HEADED=true` para ver dónde se rompe la UI
- Revisa filas `status=failed` en `social_publications`

## Canva

Legacy: `SOCIAL_RENDERER=canva` — no necesario con hero-gradient interno.

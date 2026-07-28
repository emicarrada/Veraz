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

Variante: `hero-gradient-vertical` (1080×1920). **Auto-upload**: `npm run social:publish:video` (TikTok por defecto).

### Fondo de video (Pexels)

Por defecto los Reels usan **clip de stock** ([Pexels API](https://www.pexels.com/api/)), no zoom sobre una foto:

```bash
# .env.local
PEXELS_API_KEY=tu_clave_gratis
# SOCIAL_REEL_BACKGROUND=pexels   # default si hay key
# SOCIAL_REEL_BACKGROUND=image    # forzar imagen estática sin zoom
```

Mismo `.mp4` para Reels y TikTok: video de fondo + overlay Veraz (titular, fuente, logo).

## TikTok / Reels — manual (Telegram)

TikTok **no** se publica solo desde el VPS: el bot te manda **MP4 + descripción + hashtags** por **Telegram** y tú subes el video y aplicas sonido en la app.

X e Instagram feed siguen **automáticos** (cron agresivo en `scripts/social-crontab.example`).

### 1. Migración Supabase (status `delivered`)

```bash
supabase db push
```

### 2. Crear bot de Telegram

1. Abre Telegram → **@BotFather** → `/newbot` → copia el **token**.
2. Inicia chat con tu bot (botón *Start*).
3. Obtén tu **chat id**:
   - Envía un mensaje al bot.
   - Abre en el navegador: `https://api.telegram.org/bot<TOKEN>/getUpdates`
   - Busca `"chat":{"id":123456789}` → ese número es `TELEGRAM_CHAT_ID`.

**WhatsApp:** no hay API sencilla sin Meta Business. Lo práctico es recibir en Telegram y **reenviar el video** a “Tú mismo” en WhatsApp, o guardarlo en el móvil desde Telegram.

### 3. `.env.local` (VPS y PC)

```bash
SOCIAL_PUBLISHING_ENABLED=true
SOCIAL_AUTO_PUBLISH=true
SOCIAL_PLATFORMS=x,instagram
PEXELS_API_KEY=...

SOCIAL_VIDEO_DELIVERY=telegram
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=987654321
SOCIAL_VIDEO_DELIVERY_MAX_PER_DAY=8
SOCIAL_VIDEO_DELIVERY_INCLUDE_REELS_CAPTION=true
```

No hace falta `SOCIAL_TIKTOK_ADD_SOUND` ni perfil TikTok en el VPS para este flujo.

### 4. Probar entrega

```bash
npm run social:deliver:video
```

Recibirás: **video** + **mensaje de texto** con la descripción TikTok (copiar/pegar) y la **palabra sugerida** para buscar sonido en TikTok Studio.

### 5. Después de publicar tú en TikTok

```bash
npm run social:mark-posted -- tiktok <slug-del-articulo>
```

Así no se reenvía la misma noticia y la cuota diaria cuenta entregas (`delivered`).

### 6. Cron VPS

Ver `scripts/social-crontab.example`: X ~10/día, IG ~6/día, **Telegram ~8 videos/día** (`social:deliver:video`). Instalar:

```bash
npm run social:vps:install-cron
```

## TikTok automático (legacy, no recomendado)

`npm run social:publish:video` sigue en el repo (Playwright + sonido TikTok Studio) pero **no** va en el cron de ejemplo. Ver sección anterior para producción.

## Reels / YouTube Shorts (automático opcional)

Mismo MP4 9:16. Para Reels/YouTube automáticos sigue existiendo `SOCIAL_VIDEO_PLATFORMS=instagram_reels` con `social:publish:video` (requiere sesión IG / YouTube API).

### YouTube (API, sin navegador)

1. [Google Cloud Console](https://console.cloud.google.com/) → proyecto → **YouTube Data API v3** activada.
2. **OAuth client** tipo **Desktop** → `YOUTUBE_CLIENT_ID` y `YOUTUBE_CLIENT_SECRET` en `.env.local`.
3. En el client, redirect URI: `http://127.0.0.1:8765/oauth2callback`
4. En tu PC:

```bash
npm run social:youtube-auth
```

5. Pega `YOUTUBE_REFRESH_TOKEN=...` en `.env.local` y en el VPS (no commitear).

## Supabase

```bash
supabase db push
```

## Si falla

- `npm run social:login -- instagram` (sesión caducada)
- **`npm run social:watch:instagram`** — abre Chrome en tu PC, publica 1 post de prueba, guarda capturas `instagram-debug-*.png` en `.social/exports/` y deja la ventana **2 min** abierta si falla para ver en qué botón se atora
- `SOCIAL_HEADED=true` en el VPS solo con `xvfb-run` para Instagram feed
- Revisa filas `status=failed` en `social_publications`
- Telegram: revisa token, chat id y que hayas pulsado *Start* en el bot

# Runbook — publicación social en AWS (EC2)

Objetivo: **X + Instagram feed + TikTok + Reels + YouTube Shorts** desde el VPS, sin LinkedIn.

## Rutas

| Máquina | Directorio |
|---------|------------|
| Fedora (PC) | `~/Escritorio/Projects/Veraz` |
| AWS VPS | `/home/veraz/Veraz` |

Entrar al VPS (solo desde la PC):

```bash
ssh -i ~/Descargas/veraz-social.pem ubuntu@3.87.109.197
```

## Desplegar código (Git)

**PC:**

```bash
cd ~/Escritorio/Projects/Veraz
git pull origin main
git push origin main   # después de tus commits
```

**VPS:**

```bash
cd /home/veraz/Veraz
git pull origin main
npm ci
npx playwright install chrome
sudo npx playwright install-deps chrome
command -v ffmpeg || sudo apt install -y ffmpeg
```

Atajo local: `npm run social:vps:deploy` (pull remoto vía SSH).

## Secretos y sesiones (PC → VPS)

```bash
cd ~/Escritorio/Projects/Veraz
npm run social:vps:sync-secrets
```

Copia `.env.local` y `.social/x-profile`, `instagram-profile`, `tiktok-profile`.

## Supabase

```bash
supabase db push
npm run social:reset-tiktok-false-posts   # filas tiktok posted sin video real
```

## YouTube (una vez en PC)

1. Google Cloud → YouTube Data API v3 + OAuth Desktop.
2. Redirect: `http://127.0.0.1:8765/oauth2callback`
3. `YOUTUBE_CLIENT_ID` / `YOUTUBE_CLIENT_SECRET` en `.env.local`
4. `npm run social:youtube-auth` → `YOUTUBE_REFRESH_TOKEN`
5. `npm run social:vps:sync-secrets`

## Probar en VPS

```bash
cd /home/veraz/Veraz
SOCIAL_PLATFORMS=x npm run social:publish
SOCIAL_PLATFORMS=instagram npm run social:publish
SOCIAL_VIDEO_PLATFORMS=youtube npm run social:publish:video
SOCIAL_VIDEO_PLATFORMS=instagram_reels npm run social:publish:video
SOCIAL_VIDEO_PLATFORMS=tiktok npm run social:publish:video
```

TikTok: si falla en headless, en PC `SOCIAL_HEADED=true SOCIAL_VIDEO_PLATFORMS=tiktok npm run social:publish:video`, luego `social:vps:sync-secrets`.

## Cron

```bash
npm run social:vps:install-cron   # desde PC, instala crontab en VPS
```

Logs: `.social/publish.log`, `.social/publish-video.log`

## Ahorro AWS

EventBridge: Start 7:45 / Stop 21:00 `America/Mexico_City`. Ver conversación / plan AWS.

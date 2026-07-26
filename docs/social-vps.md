# Social en servidor 24/7 (sin depender de tu PC)

**Vercel no puede** ejecutar este flujo: hace falta Chrome, Playwright y las carpetas `.social/*-profile/` con sesión de X e Instagram.

Opciones realistas:

| Opción | ¿Sirve? |
|--------|---------|
| **VPS** (Hetzner, DigitalOcean, Linode, etc.) | ✅ Recomendado |
| Tu PC con cron | ✅ Solo si está encendido |
| Vercel Cron / GitHub Actions | ❌ Sin sesión de navegador estable (salvo migrar a APIs oficiales) |

## 1. Contratar un VPS pequeño

- 2 vCPU, 4 GB RAM, Ubuntu 22/24
- Instalar **Google Chrome**, **Node.js 22+** (el deploy `npm run social:vps:deploy` lo instala en AWS)

## 2. Clonar Veraz en el servidor

```bash
git clone https://github.com/emicarrada/Veraz.git
cd Veraz
npm ci
npx playwright install chrome
```

## 3. Copiar secretos y sesiones (desde tu PC)

**Atajo:**

```bash
npm run social:vps:sync-secrets
```

Variables: `VERAZ_VPS_HOST=ubuntu@3.87.109.197`, `VERAZ_VPS_KEY=~/Descargas/veraz-social.pem`.

Manual:

```bash
scp -i ~/Descargas/veraz-social.pem .env.local ubuntu@3.87.109.197:/home/veraz/Veraz/.env.local
scp -i ~/Descargas/veraz-social.pem -r .social/x-profile .social/instagram-profile .social/tiktok-profile ubuntu@3.87.109.197:/home/veraz/Veraz/.social/
```

No subas `.env.local` a GitHub.

En el VPS, `.env.local` debe incluir al menos:

```bash
SOCIAL_PUBLISHING_ENABLED=true
SOCIAL_AUTO_PUBLISH=true
SOCIAL_HEADED=false
SOCIAL_MAX_POSTS_PER_RUN=1
SOCIAL_X_MAX_POSTS_PER_DAY=6
SOCIAL_INSTAGRAM_MAX_POSTS_PER_DAY=3
SOCIAL_INSTAGRAM_HIGH_IMPACT_ONLY=true
SOCIAL_PUBLISH_TIMEZONE=America/Mexico_City
```

## 4. Cron en el VPS

Ver `scripts/social-crontab.example` o **`docs/social-aws-runbook.md`**.

Desde la PC: `npm run social:vps:install-cron`

## 5. Probar en el VPS

```bash
cd Veraz
SOCIAL_PLATFORMS=x npm run social:publish
SOCIAL_PLATFORMS=instagram npm run social:publish
```

## 6. GitHub + Vercel

- **Push a GitHub** → despliega la **web** en Vercel.
- En el VPS: `git pull && npm ci` cuando cambie el código social (o un cron semanal de pull).

Las publis **no** se activan solas por desplegar Vercel; se activan por **cron en el VPS**.

## Cuotas diarias (código)

El job cuenta filas `posted` en `social_publications` desde medianoche (`SOCIAL_PUBLISH_TIMEZONE`):

- X: máx `SOCIAL_X_MAX_POSTS_PER_DAY` (default 6)
- IG: máx `SOCIAL_INSTAGRAM_MAX_POSTS_PER_DAY` (default 3)

Instagram solo elige noticias con **impacto visual** si `SOCIAL_INSTAGRAM_HIGH_IMPACT_ONLY=true` (foto hero + categoría deportes/cultura/etc., score ≥ 2).

## Si caduca la sesión

En el VPS con `SOCIAL_HEADED=true` y túnel/VNC, o vuelve a copiar perfiles desde tu PC tras `social:login` local.

## Futuro (sin navegador)

- X API + Meta Graph API (Instagram Business) → entonces sí podría correr en Vercel/GitHub Actions con tokens.

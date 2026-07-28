#!/usr/bin/env npx tsx
/**
 * Instagram feed con Chrome visible + capturas de debug en cada paso.
 * Si falla, la ventana queda ~2 min para que veas en qué pantalla se quedó.
 *
 * Usage: npm run social:watch:instagram
 */
process.env.SOCIAL_HEADED = "true";
process.env.SOCIAL_INSTAGRAM_DEBUG = "1";
process.env.SOCIAL_PLATFORMS = "instagram";
process.env.SOCIAL_MAX_POSTS_PER_RUN = "1";
process.env.SOCIAL_INSTAGRAM_HIGH_IMPACT_ONLY = "false";

import { runSocialPublish } from "./run-social-publish";

console.log("");
console.log("Modo watch Instagram:");
console.log("  • Chrome visible (SOCIAL_HEADED=true)");
console.log("  • Capturas: .social/exports/instagram-debug-*.png");
console.log("  • Si falla, espera 2 min antes de cerrar el navegador");
console.log("");

runSocialPublish()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });

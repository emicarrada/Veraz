#!/usr/bin/env npx tsx
/** Prints whether YouTube OAuth env is ready (no secrets logged). */
const required = ["YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET", "YOUTUBE_REFRESH_TOKEN"] as const;

let ok = true;
for (const key of required) {
  const set = Boolean(process.env[key]?.trim());
  console.log(`${key}: ${set ? "set" : "MISSING"}`);
  if (!set) ok = false;
}

if (!ok) {
  console.log("\nNext: Google Cloud → YouTube Data API v3 → OAuth Desktop → npm run social:youtube-auth");
  process.exit(1);
}

console.log("\nYouTube env OK for npm run social:publish:video");

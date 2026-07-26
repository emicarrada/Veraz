#!/usr/bin/env npx tsx
/**
 * One-time YouTube OAuth (refresh token for Shorts upload).
 *
 * 1. Google Cloud → OAuth client (Desktop) → YOUTUBE_CLIENT_ID + YOUTUBE_CLIENT_SECRET in .env.local
 * 2. Enable YouTube Data API v3
 * 3. npm run social:youtube-auth
 * 4. Paste YOUTUBE_REFRESH_TOKEN=... into .env.local (and on VPS)
 */
import { createServer } from "node:http";
import { URL } from "node:url";

const SCOPES = ["https://www.googleapis.com/auth/youtube.upload"];
const REDIRECT_URI = "http://127.0.0.1:8765/oauth2callback";

async function main(): Promise<void> {
  const clientId = process.env.YOUTUBE_CLIENT_ID?.trim();
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    console.error("Set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET in .env.local first.");
    console.error("Google Cloud → APIs → YouTube Data API v3 → Credentials → OAuth Desktop.");
    process.exit(1);
  }

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", SCOPES.join(" "));
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");

  console.log("Abre esta URL en el navegador (cuenta del canal Veraz):\n");
  console.log(authUrl.toString());
  console.log("\nEsperando callback en", REDIRECT_URI, "…\n");

  const code = await new Promise<string>((resolve, reject) => {
    const server = createServer((req, res) => {
      try {
        const url = new URL(req.url ?? "/", REDIRECT_URI);
        if (url.pathname !== "/oauth2callback") {
          res.writeHead(404);
          res.end("Not found");
          return;
        }
        const authCode = url.searchParams.get("code");
        if (!authCode) {
          res.writeHead(400);
          res.end("Missing code");
          reject(new Error("No authorization code"));
          return;
        }
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<html><body><p>Listo. Puedes cerrar esta pestaña.</p></body></html>");
        server.close();
        resolve(authCode);
      } catch (error) {
        reject(error);
      }
    });
    server.listen(8765, "127.0.0.1");
  });

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
  });

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!tokenResponse.ok) {
    console.error(await tokenResponse.text());
    process.exit(1);
  }

  const tokens = (await tokenResponse.json()) as { refresh_token?: string; access_token: string };
  if (!tokens.refresh_token) {
    console.error("No refresh_token. Revoca acceso en Google Account y repite con prompt=consent.");
    process.exit(1);
  }

  console.log("Añade a .env.local (y al VPS):\n");
  console.log(`YOUTUBE_REFRESH_TOKEN=${tokens.refresh_token}`);
  console.log("\nOpcional: YOUTUBE_PRIVACY=public|unlisted|private");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

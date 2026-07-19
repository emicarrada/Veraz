import { NextResponse } from "next/server";

import {
  checkRateLimit,
  CRON_RATE_LIMIT,
  resolveClientIp,
} from "@/lib/security/rate-limit";
import { verifyCronAuth } from "@/lib/scheduler/auth/verify-cron-auth";

function logCronAttempt(
  request: Request,
  outcome: "allowed" | "unauthorized" | "rate_limited",
): void {
  const ip = resolveClientIp(request);
  const path = new URL(request.url).pathname;
  console.info(
    JSON.stringify({
      event: "cron_request",
      path,
      method: request.method,
      ip,
      outcome,
    }),
  );
}

/**
 * Guards cron route handlers: rate limit → auth.
 * Returns a Response when blocked; null when the handler may proceed.
 */
export function guardCronRequest(request: Request): Response | null {
  const ip = resolveClientIp(request);
  const rateKey = `cron:${ip}`;
  const rate = checkRateLimit(rateKey, CRON_RATE_LIMIT);

  if (!rate.allowed) {
    logCronAttempt(request, "rate_limited");
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000)),
          ),
        },
      },
    );
  }

  if (!verifyCronAuth(request)) {
    logCronAttempt(request, "unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  logCronAttempt(request, "allowed");
  return null;
}

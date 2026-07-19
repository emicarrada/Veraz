import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CRON_PREFIX = "/api/cron/";
const ALLOWED_CRON_METHODS = new Set(["GET", "POST"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith(CRON_PREFIX)) {
    return NextResponse.next();
  }

  if (!ALLOWED_CRON_METHODS.has(request.method)) {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const userAgent = request.headers.get("user-agent")?.trim();
  if (!userAgent) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/cron/:path*"],
};

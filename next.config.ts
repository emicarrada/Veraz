import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const CONTENT_SECURITY_POLICY_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https: data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://*.i.posthog.com https://*.posthog.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const SECURITY_HEADERS = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Content-Security-Policy-Report-Only",
    value: CONTENT_SECURITY_POLICY_REPORT_ONLY,
  },
] as const;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...SECURITY_HEADERS],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/es",
        permanent: false,
      },
      {
        source: "/noticias/finanzas",
        destination: "/es/noticias?categoria=economia",
        permanent: true,
      },
      {
        source: "/noticias/tecnologia",
        destination: "/es/noticias?categoria=tecnologia",
        permanent: true,
      },
      {
        source: "/noticias",
        destination: "/es/noticias",
        permanent: false,
      },
      {
        source: "/metodologia",
        destination: "/es/metodologia",
        permanent: false,
      },
      {
        source: "/acerca-de",
        destination: "/es/acerca-de",
        permanent: false,
      },
      {
        source: "/contacto",
        destination: "/es/contacto",
        permanent: false,
      },
      {
        source: "/privacidad",
        destination: "/es/privacidad",
        permanent: false,
      },
      {
        source: "/terminos",
        destination: "/es/terminos",
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);

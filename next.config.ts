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
  serverExternalPackages: ["pg"],
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
        permanent: true,
      },
      {
        source: "/noticias/finanzas",
        destination: "/es/noticias/economia",
        permanent: true,
      },
      {
        source: "/noticias/tecnologia",
        destination: "/es/noticias/tecnologia",
        permanent: true,
      },
      {
        source: "/noticias/:slug",
        destination: "/es/noticias/:slug",
        permanent: true,
      },
      {
        source: "/noticias",
        destination: "/es/noticias",
        permanent: true,
      },
      {
        source: "/:locale(es|en)/noticias",
        has: [{ type: "query", key: "categoria", value: "economia" }],
        destination: "/:locale/noticias/economia",
        permanent: true,
      },
      {
        source: "/:locale(es|en)/noticias",
        has: [{ type: "query", key: "categoria", value: "tecnologia" }],
        destination: "/:locale/noticias/tecnologia",
        permanent: true,
      },
      {
        source: "/:locale(es|en)/noticias",
        has: [{ type: "query", key: "categoria", value: "politica" }],
        destination: "/:locale/noticias/politica",
        permanent: true,
      },
      {
        source: "/:locale(es|en)/noticias",
        has: [{ type: "query", key: "categoria", value: "internacional" }],
        destination: "/:locale/noticias/internacional",
        permanent: true,
      },
      {
        source: "/:locale(es|en)/noticias",
        has: [{ type: "query", key: "categoria", value: "deportes" }],
        destination: "/:locale/noticias/deportes",
        permanent: true,
      },
      {
        source: "/:locale(es|en)/noticias",
        has: [{ type: "query", key: "categoria", value: "sociedad" }],
        destination: "/:locale/noticias/sociedad",
        permanent: true,
      },
      {
        source: "/:locale(es|en)/noticias",
        has: [{ type: "query", key: "categoria", value: "cultura" }],
        destination: "/:locale/noticias/cultura",
        permanent: true,
      },
      {
        source: "/metodologia",
        destination: "/es/metodologia",
        permanent: true,
      },
      {
        source: "/acerca-de",
        destination: "/es/acerca-de",
        permanent: true,
      },
      {
        source: "/contacto",
        destination: "/es/contacto",
        permanent: true,
      },
      {
        source: "/privacidad",
        destination: "/es/privacidad",
        permanent: true,
      },
      {
        source: "/terminos",
        destination: "/es/terminos",
        permanent: true,
      },
      {
        source: "/fuentes",
        destination: "/es/fuentes",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/noticias/finanzas",
        destination: "/noticias?categoria=economia",
        permanent: true,
      },
      {
        source: "/noticias/tecnologia",
        destination: "/noticias?categoria=tecnologia",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

import type { Metadata } from "next";

import { NewsFeedPage } from "@/features/news/components/news-feed-page";

/** ISR interval — keep in sync with DEFAULT_CACHE_CONFIG.feedRevalidateSeconds */
export const revalidate = 120;

export const metadata: Metadata = {
  title: "Noticias | Veraz",
  description:
    "Feed de noticias de Veraz. Titulares y contexto esencial, ordenados por fecha, con enlace a la fuente original.",
  openGraph: {
    title: "Noticias | Veraz",
    description:
      "Feed de noticias de Veraz. Titulares y contexto esencial, ordenados por fecha.",
    type: "website",
  },
  alternates: {
    canonical: "/noticias",
  },
};

type NoticiasPageProps = {
  searchParams: Promise<{ q?: string; categoria?: string }>;
};

export default async function NoticiasPage({ searchParams }: NoticiasPageProps) {
  const params = await searchParams;

  return <NewsFeedPage search={params.q} categorySlug={params.categoria} />;
}

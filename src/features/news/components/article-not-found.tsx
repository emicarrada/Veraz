import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FEED_ROUTE } from "@/features/news/constants";

export function ArticleNotFound() {
  return (
    <EmptyState
      title="Artículo no encontrado"
      description="Es posible que el enlace haya cambiado o que el artículo ya no esté disponible."
      action={
        <Button href={FEED_ROUTE} variant="secondary">
          Volver al feed
        </Button>
      }
    />
  );
}

export function ArticleNotFoundPage() {
  return (
    <div className="py-8">
      <ArticleNotFound />
      <p className="mt-6 text-center">
        <Link href={FEED_ROUTE} className="text-small text-accent veraz-focus-ring rounded-sm hover:underline">
          Ir a noticias
        </Link>
      </p>
    </div>
  );
}

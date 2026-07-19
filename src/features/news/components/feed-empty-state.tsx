import { EmptyState } from "@/components/ui/empty-state";

export function FeedEmptyState() {
  return (
    <EmptyState
      title="Aún no hay noticias"
      description="Cuando se ingieran artículos desde RSS, aparecerán aquí ordenados por fecha de publicación."
    />
  );
}

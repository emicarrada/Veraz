import { Skeleton } from "@/components/ui/skeleton";

export type FeedSkeletonProps = {
  count?: number;
};

export function FeedSkeleton({ count = 6 }: FeedSkeletonProps) {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando noticias">
      {Array.from({ length: count }, (_, index) => (
        <article
          key={index}
          className="rounded-xl border border-border bg-surface p-4 sm:p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row">
            <Skeleton variant="rectangular" className="h-32 w-full shrink-0 sm:h-24 sm:w-36" />
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <Skeleton variant="text" width="35%" height="0.875rem" />
              <Skeleton variant="text" width="90%" height="1.25rem" />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="80%" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

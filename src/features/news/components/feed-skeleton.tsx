import { Skeleton } from "@/components/ui/skeleton";

export type FeedSkeletonProps = {
  count?: number;
};

export function FeedSkeleton({ count = 6 }: FeedSkeletonProps) {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando noticias">
      {Array.from({ length: count }, (_, index) => {
        if (index === 0) {
          return (
            <article
              key={index}
              className="rounded-xl border border-border bg-surface p-4 sm:p-5"
            >
              <Skeleton variant="rectangular" className="aspect-[16/9] w-full" height="auto" />
              <div className="mt-4 flex flex-col gap-3">
                <Skeleton variant="text" width="30%" height="0.875rem" />
                <Skeleton variant="text" width="92%" height="1.5rem" />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="70%" />
              </div>
            </article>
          );
        }

        if (index % 2 === 0) {
          return (
            <article key={index} className="rounded-xl border border-border bg-surface px-4 py-3">
              <Skeleton variant="text" width="40%" height="0.75rem" />
              <Skeleton variant="text" className="mt-2" width="88%" height="1rem" />
              <Skeleton variant="text" className="mt-2" width="70%" />
            </article>
          );
        }

        return (
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
        );
      })}
    </div>
  );
}

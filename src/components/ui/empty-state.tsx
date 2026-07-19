import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/cn";

export type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center",
        className,
      )}
      {...props}
    >
      {icon ? (
        <div className="mb-4 text-ink-muted [&>svg]:h-10 [&>svg]:w-10" aria-hidden>
          {icon}
        </div>
      ) : null}
      <h3 className="text-h4">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-small">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

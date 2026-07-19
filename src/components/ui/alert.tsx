import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/cn";

const variantStyles = {
  info: "border-info bg-info-subtle text-info",
  success: "border-success bg-success-subtle text-success",
  warning: "border-warning bg-warning-subtle text-warning",
  danger: "border-danger bg-danger-subtle text-danger",
  neutral: "border-border bg-surface-muted text-ink-secondary",
} as const;

export type AlertVariant = keyof typeof variantStyles;

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
};

export function Alert({
  variant = "info",
  title,
  children,
  action,
  className,
  ...props
}: AlertProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex w-full gap-3 rounded-lg border px-4 py-3",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      <div className="min-w-0 flex-1">
        {title ? <p className="text-small font-semibold text-inherit">{title}</p> : null}
        <div className={cn("text-small text-inherit", title && "mt-0.5 opacity-90")}>
          {children}
        </div>
      </div>
      {action ? <div className="shrink-0 self-start">{action}</div> : null}
    </div>
  );
}

import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/cn";

export type SidebarProps = HTMLAttributes<HTMLElement> & {
  header?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  collapsed?: boolean;
};

/**
 * Desktop sidebar structure only. Visibility/collapse wiring is left to consumers.
 */
export function Sidebar({
  header,
  children,
  footer,
  collapsed = false,
  className,
  ...props
}: SidebarProps) {
  return (
    <aside
      aria-label="Barra lateral"
      data-collapsed={collapsed || undefined}
      className={cn(
        "hidden h-full w-sidebar shrink-0 flex-col border-r border-border bg-surface lg:flex",
        collapsed && "w-16",
        className,
      )}
      {...props}
    >
      {header ? (
        <div className="flex h-header items-center border-b border-border px-4">
          {header}
        </div>
      ) : null}
      <div className="flex-1 overflow-y-auto px-3 py-4">{children}</div>
      {footer ? (
        <div className="border-t border-border px-3 py-3">{footer}</div>
      ) : null}
    </aside>
  );
}

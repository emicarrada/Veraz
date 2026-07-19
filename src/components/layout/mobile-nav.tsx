"use client";

import type { ReactNode } from "react";

import { Drawer } from "@/components/ui/drawer";
import { cn } from "@/utils/cn";

export type MobileNavProps = {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
  footer?: ReactNode;
  title?: string;
  className?: string;
};

/**
 * Mobile navigation structure backed by Drawer.
 * Open state is controlled by the parent (e.g. Header mobileTrigger).
 */
export function MobileNav({
  open,
  onClose,
  children,
  footer,
  title = "Menú",
  className,
}: MobileNavProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      side="left"
      className={cn("md:hidden", className)}
    >
      <nav aria-label="Navegación móvil" className="flex flex-col gap-1">
        {children}
      </nav>
      {footer ? (
        <div className="mt-6 border-t border-border pt-4">{footer}</div>
      ) : null}
    </Drawer>
  );
}

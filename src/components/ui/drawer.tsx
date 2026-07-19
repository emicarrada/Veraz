"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/utils/cn";

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M6 6l8 8M14 6l-8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: "left" | "right";
  className?: string;
};

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  className,
}: DrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-modal flex">
      <button
        type="button"
        aria-label="Cerrar panel"
        className="absolute inset-0 bg-[var(--veraz-color-overlay)]"
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "relative z-[1] flex h-full w-full max-w-sm flex-col bg-surface shadow-lg outline-none",
          "border-border",
          side === "right" ? "ml-auto border-l" : "mr-auto border-r",
          className,
        )}
      >
        <div className="flex h-header items-center justify-between border-b border-border px-4">
          <h2 id={titleId} className="text-h4">
            {title}
          </h2>
          <IconButton
            aria-label="Cerrar"
            icon={<CloseIcon />}
            onClick={onClose}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4 text-body">{children}</div>
      </aside>
    </div>,
    document.body,
  );
}

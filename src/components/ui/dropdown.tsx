"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/utils/cn";

export type DropdownItem = {
  id: string;
  label: string;
  disabled?: boolean;
  onSelect?: () => void;
};

export type DropdownProps = {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "start" | "end";
  className?: string;
  menuLabel?: string;
};

export function Dropdown({
  trigger,
  items,
  align = "start",
  className,
  menuLabel = "Menú",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <div
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((prev) => !prev);
          }
        }}
      >
        {/* Trigger is provided by consumer; wrap ensures keyboard activation when focusable */}
        <span className="inline-flex" aria-haspopup="menu" aria-expanded={open} aria-controls={menuId}>
          {trigger}
        </span>
      </div>
      {open ? (
        <ul
          id={menuId}
          role="menu"
          aria-label={menuLabel}
          className={cn(
            "absolute top-full z-dropdown mt-2 min-w-[12rem] overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-md",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {items.map((item) => (
            <li key={item.id} role="none">
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={cn(
                  "flex w-full rounded-md px-3 py-2 text-left text-small text-ink veraz-transition veraz-focus-ring",
                  "hover:bg-surface-muted disabled:opacity-[var(--veraz-opacity-disabled)]",
                )}
                onClick={() => {
                  item.onSelect?.();
                  setOpen(false);
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

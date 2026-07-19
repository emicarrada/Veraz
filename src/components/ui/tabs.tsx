"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useId, useState } from "react";

import { cn } from "@/utils/cn";

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
};

export type TabsProps = {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (id: string) => void;
  className?: string;
  "aria-label"?: string;
};

export function Tabs({
  items,
  defaultValue,
  value,
  onValueChange,
  className,
  "aria-label": ariaLabel = "Pestañas",
}: TabsProps) {
  const baseId = useId();
  const firstEnabled = items.find((item) => !item.disabled)?.id;
  const [uncontrolled, setUncontrolled] = useState(
    defaultValue ?? firstEnabled ?? "",
  );
  const activeId = value ?? uncontrolled;

  const setActive = (id: string) => {
    if (value === undefined) setUncontrolled(id);
    onValueChange?.(id);
  };

  const enabledIds = items.filter((item) => !item.disabled).map((item) => item.id);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = enabledIds.indexOf(activeId);
    if (currentIndex < 0) return;

    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % enabledIds.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + enabledIds.length) % enabledIds.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = enabledIds.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextId = enabledIds[nextIndex];
    if (nextId) {
      setActive(nextId);
      document.getElementById(`${baseId}-tab-${nextId}`)?.focus();
    }
  };

  const activeItem = items.find((item) => item.id === activeId);

  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex gap-1 overflow-x-auto border-b border-border"
        onKeyDown={onKeyDown}
      >
        {items.map((item) => {
          const selected = item.id === activeId;
          return (
            <button
              key={item.id}
              id={`${baseId}-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              className={cn(
                "relative shrink-0 px-3 py-2.5 text-small font-medium veraz-transition veraz-focus-ring",
                "disabled:opacity-[var(--veraz-opacity-disabled)]",
                selected
                  ? "text-accent"
                  : "text-ink-muted hover:text-ink-secondary",
              )}
              onClick={() => setActive(item.id)}
            >
              {item.label}
              {selected ? (
                <span
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent"
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>
      {activeItem ? (
        <div
          id={`${baseId}-panel-${activeItem.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${activeItem.id}`}
          className="text-body"
        >
          {activeItem.content}
        </div>
      ) : null}
    </div>
  );
}

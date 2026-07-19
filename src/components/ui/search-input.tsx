"use client";

import { forwardRef } from "react";

import { IconButton } from "@/components/ui/icon-button";
import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/utils/cn";

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M8.5 14.5a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="m13 13 3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClearIcon() {
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

export type SearchInputProps = Omit<InputProps, "leftAddon" | "rightAddon" | "type"> & {
  onClear?: () => void;
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    { value, onChange, onClear, className, "aria-label": ariaLabel, ...props },
    ref,
  ) {
    const hasValue = typeof value === "string" ? value.length > 0 : false;

    const handleClear = () => {
      onClear?.();
    };

    return (
      <Input
        ref={ref}
        type="search"
        value={value}
        onChange={onChange}
        aria-label={ariaLabel ?? "Buscar"}
        className={cn(className)}
        leftAddon={
          <span className="inline-flex h-4 w-4 text-ink-muted">
            <SearchIcon />
          </span>
        }
        rightAddon={
          hasValue ? (
            <IconButton
              aria-label="Limpiar búsqueda"
              size="sm"
              variant="ghost"
              className="h-7 w-7"
              icon={<ClearIcon />}
              onClick={handleClear}
            />
          ) : undefined
        }
        {...props}
      />
    );
  },
);

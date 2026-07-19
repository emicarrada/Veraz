"use client";

import type { HTMLAttributes } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export type PaginationProps = HTMLAttributes<HTMLElement> & {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Visible sibling pages around the current page. */
  siblingCount?: number;
};

function buildPages(
  page: number,
  pageCount: number,
  siblingCount: number,
): Array<number | "ellipsis"> {
  if (pageCount <= 1) return [1];

  const totalNumbers = siblingCount * 2 + 5;
  if (pageCount <= totalNumbers) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const left = Math.max(page - siblingCount, 1);
  const right = Math.min(page + siblingCount, pageCount);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < pageCount - 1;

  const pages: Array<number | "ellipsis"> = [1];

  if (showLeftEllipsis) pages.push("ellipsis");
  else {
    for (let i = 2; i < left; i += 1) pages.push(i);
  }

  for (let i = left; i <= right; i += 1) {
    if (i !== 1 && i !== pageCount) pages.push(i);
  }

  if (showRightEllipsis) pages.push("ellipsis");
  else {
    for (let i = right + 1; i < pageCount; i += 1) pages.push(i);
  }

  if (pageCount > 1) pages.push(pageCount);

  return pages;
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  siblingCount = 1,
  className,
  ...props
}: PaginationProps) {
  const pages = buildPages(page, pageCount, siblingCount);
  const canPrev = page > 1;
  const canNext = page < pageCount;

  return (
    <nav
      aria-label="Paginación"
      className={cn("flex flex-wrap items-center justify-center gap-1", className)}
      {...props}
    >
      <Button
        variant="ghost"
        size="sm"
        aria-label="Página anterior"
        disabled={!canPrev}
        onClick={() => onPageChange(page - 1)}
      >
        Anterior
      </Button>
      {pages.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-2 text-ink-muted"
            aria-hidden
          >
            …
          </span>
        ) : (
          <Button
            key={item}
            variant={item === page ? "primary" : "ghost"}
            size="sm"
            aria-label={`Página ${item}`}
            aria-current={item === page ? "page" : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ),
      )}
      <Button
        variant="ghost"
        size="sm"
        aria-label="Página siguiente"
        disabled={!canNext}
        onClick={() => onPageChange(page + 1)}
      >
        Siguiente
      </Button>
    </nav>
  );
}

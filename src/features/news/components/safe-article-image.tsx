"use client";

import { useEffect, useState } from "react";

import { cn } from "@/utils/cn";

export type SafeArticleImageProps = {
  src?: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  loading?: "lazy" | "eager";
  placeholderClassName?: string;
};

export function SafeArticleImage({
  src,
  fallbackSrc,
  alt,
  className,
  imageClassName,
  loading = "lazy",
  placeholderClassName,
}: SafeArticleImageProps) {
  const initialSrc = src?.trim() || fallbackSrc;
  const [currentSrc, setCurrentSrc] = useState(initialSrc);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(src?.trim() || fallbackSrc);
    setFailed(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    setFailed(true);
  };

  if (failed) {
    return (
      <div
        aria-hidden
        className={cn(
          "flex items-center justify-center bg-surface-muted text-ink-muted",
          placeholderClassName ?? className,
        )}
      >
        <span className="text-caption">Sin imagen</span>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={handleError}
        className={cn("h-full w-full object-cover", imageClassName)}
      />
    </div>
  );
}

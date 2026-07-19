import Image from "next/image";

import { cn } from "@/utils/cn";

const CHIIKO_URL = "https://www.chiiko.design";

export type ChiikoCreditProps = {
  className?: string;
};

/**
 * Chiiko design credit — text arriba, logo centrado debajo.
 */
export function ChiikoCredit({ className }: ChiikoCreditProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-0.5 text-center",
        className,
      )}
    >
      <p className="text-caption leading-tight text-ink-muted">
        Sitio web creado y desarrollado por
      </p>
      <a
        href={CHIIKO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center opacity-85 transition-opacity duration-200 hover:opacity-100 veraz-focus-ring rounded-sm"
        aria-label="Chiikö — diseño web"
      >
        <Image
          src="/chiikologosvg.svg"
          alt="Chiikö"
          width={120}
          height={40}
          unoptimized
          className="h-10 w-auto object-contain sm:h-11"
        />
      </a>
    </div>
  );
}

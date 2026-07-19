import type { AnchorHTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/cn";

export type HeroPrimaryButtonProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "className" | "children"
> & {
  children: ReactNode;
  className?: string;
};

function ArrowIcon() {
  return (
    <svg
      aria-hidden
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
    >
      <path
        d="M4 9h10M10 5l4 4-4 4"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Primary CTA for the landing hero — silver/graphite, editorial, on-brand. */
export function HeroPrimaryButton({
  children,
  className,
  ...props
}: HeroPrimaryButtonProps) {
  return (
    <a className={cn("hero-cta-primary group", className)} {...props}>
      <span>{children}</span>
      <ArrowIcon />
    </a>
  );
}

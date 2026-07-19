import type { HTMLAttributes } from "react";

import { cn } from "@/utils/cn";

const sizeStyles = {
  sm: "h-8 w-8 text-caption",
  md: "h-10 w-10 text-small",
  lg: "h-12 w-12 text-body",
  xl: "h-16 w-16 text-h4",
} as const;

export type AvatarSize = keyof typeof sizeStyles;

export type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.charAt(0) ?? "";
  const second = parts.length > 1 ? (parts[1]?.charAt(0) ?? "") : "";
  return `${first}${second}`.toUpperCase();
}

export function Avatar({
  src,
  alt,
  name,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const label = alt ?? name ?? "Avatar";

  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "bg-accent-subtle font-medium text-accent",
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {src ? (
        // Decorative when alt is provided via aria-label on parent
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden>{name ? getInitials(name) : "?"}</span>
      )}
    </div>
  );
}

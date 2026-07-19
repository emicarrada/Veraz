import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/utils/cn";

const variantStyles = {
  primary:
    "bg-accent text-accent-foreground hover:bg-accent-hover active:bg-accent-active shadow-xs",
  secondary:
    "bg-surface text-ink border border-border hover:bg-surface-muted active:bg-surface-muted",
  ghost:
    "bg-transparent text-ink-secondary hover:bg-surface-muted hover:text-ink active:bg-surface-muted",
  danger:
    "bg-danger text-ink-inverse hover:opacity-[var(--veraz-opacity-hover)] active:opacity-100",
  outline:
    "bg-transparent text-accent border border-accent hover:bg-accent-subtle",
} as const;

const sizeStyles = {
  sm: "h-8 px-3 text-small gap-1.5 rounded-md",
  md: "h-10 px-4 text-body gap-2 rounded-md",
  lg: "h-12 px-5 text-body-lg gap-2 rounded-lg",
} as const;

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

type ButtonSharedProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
};

export type ButtonAsButtonProps = ButtonSharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    href?: undefined;
  };

export type ButtonAsLinkProps = ButtonSharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className"> & {
    href: string;
  };

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

function buttonClassName({
  variant,
  size,
  fullWidth,
  className,
}: {
  variant: ButtonVariant;
  size: ButtonSize;
  fullWidth: boolean;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center font-medium veraz-transition veraz-focus-ring",
    "disabled:pointer-events-none disabled:opacity-[var(--veraz-opacity-disabled)]",
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && "w-full",
    className,
  );
}

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className,
    children,
  } = props;

  const classes = buttonClassName({ variant, size, fullWidth, className });
  const content = (
    <>
      {loading ? <Spinner size="sm" label="Cargando" /> : leftIcon}
      {children}
      {!loading ? rightIcon : null}
    </>
  );

  if ("href" in props && props.href !== undefined) {
    const {
      href,
      variant: _v,
      size: _s,
      loading: _l,
      leftIcon: _li,
      rightIcon: _ri,
      fullWidth: _f,
      className: _c,
      children: _ch,
      ...anchorProps
    } = props;

    return (
      <a
        href={href}
        className={classes}
        aria-disabled={loading || undefined}
        {...anchorProps}
      >
        {content}
      </a>
    );
  }

  const {
    disabled,
    type = "button",
    variant: _v,
    size: _s,
    loading: _l,
    leftIcon: _li,
    rightIcon: _ri,
    fullWidth: _f,
    className: _c,
    children: _ch,
    ...buttonProps
  } = props;

  const isDisabled = Boolean(disabled || loading);

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...buttonProps}
    >
      {content}
    </button>
  );
}

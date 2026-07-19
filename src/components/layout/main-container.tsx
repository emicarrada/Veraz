import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/cn";

export type MainContainerProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  withSidebar?: boolean;
};

/**
 * Primary content landmark. Use inside app shells.
 */
export function MainContainer({
  children,
  withSidebar = false,
  className,
  ...props
}: MainContainerProps) {
  return (
    <main
      id="main-content"
      className={cn(
        "min-w-0 flex-1",
        withSidebar && "lg:pl-0",
        className,
      )}
      {...props}
    >
      {children}
    </main>
  );
}

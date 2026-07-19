import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { MainContainer } from "@/components/layout/main-container";
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";

export type StaticPageShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function StaticPageShell({ title, description, children }: StaticPageShellProps) {
  return (
    <div className="landing-page flex min-h-dvh flex-col bg-bg text-ink">
      <MainContainer className="flex-1">
        <Container className="py-12 sm:py-16" size="md">
          <Text as="h1" variant="h1">
            {title}
          </Text>
          {description ? (
            <Text as="p" variant="body-lg" className="mt-4 max-w-2xl text-ink-secondary">
              {description}
            </Text>
          ) : null}
          <article className="static-page-content mt-10">{children}</article>
        </Container>
      </MainContainer>
      <SiteFooter />
    </div>
  );
}

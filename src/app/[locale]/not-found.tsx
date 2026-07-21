import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SiteFooter } from "@/components/layout/site-footer";
import { MainContainer } from "@/components/layout/main-container";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { Link } from "@/i18n/navigation";
import { feedPath, homePath, staticPath } from "@/i18n/paths";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

export default async function NotFoundPage() {
  const t = await getTranslations("errors");
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");
  const locale = (await getLocale()) as Locale;

  return (
    <div className="landing-page flex min-h-dvh flex-col bg-bg text-ink">
      <MainContainer className="flex flex-1 items-center">
        <Container className="py-16 text-center" size="md">
          <Text as="p" variant="label" className="text-ink-muted">
            {t("404Label")}
          </Text>
          <Text as="h1" variant="display" className="mt-4">
            {t("404Title")}
          </Text>
          <Text as="p" variant="body-lg" className="mx-auto mt-4 max-w-md text-ink-secondary">
            {t("404Description")}
          </Text>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href={homePath(locale)} variant="primary" size="lg">
              {tNav("home")}
            </Button>
            <Button href={feedPath(locale)} variant="secondary" size="lg">
              {tNav("news")}
            </Button>
          </div>
          <p className="mt-8 text-small text-ink-muted">
            {t("404Contact")}{" "}
            <Link
              href={staticPath(locale, "/contacto")}
              className="text-ink-secondary underline underline-offset-2 hover:text-ink"
            >
              {tCommon("contactUs")}
            </Link>
          </p>
        </Container>
      </MainContainer>
      <SiteFooter />
    </div>
  );
}

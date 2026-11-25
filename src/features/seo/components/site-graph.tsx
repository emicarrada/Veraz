import { getTranslations } from "next-intl/server";

import { getAppConfig } from "@/config";
import { buildOrganizationJsonLd, buildWebSiteJsonLd, JsonLdScript } from "@/features/seo/build-json-ld";
import { feedPath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";

export async function SiteGraphJsonLd({ locale }: { locale: Locale }) {
  const { name, tagline, siteUrl } = getAppConfig();
  const t = await getTranslations({ locale, namespace: "landing" });

  return (
    <>
      <JsonLdScript
        schema={buildOrganizationJsonLd({
          siteUrl,
          name,
          tagline,
          description: t("metaDescription"),
          locale,
        })}
      />
      <JsonLdScript
        schema={buildWebSiteJsonLd({
          siteUrl,
          name,
          description: t("metaDescription"),
          locale,
          searchPath: feedPath(locale),
        })}
      />
    </>
  );
}

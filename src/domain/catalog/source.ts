import type { CountryId, LanguageId, MediaId, SourceId } from "@/domain/shared/ids";
import type { SourceStatus, SourceTrustTier } from "@/domain/shared/enums";
import type { Instant, Slug, Url } from "@/domain/shared/value-objects";

export type Source = {
  id: SourceId;
  slug: Slug;
  name: string;
  homepageUrl: Url;
  feedUrl?: Url;
  logoMediaId?: MediaId;
  defaultLanguageId?: LanguageId;
  countryId?: CountryId;
  trustTier: SourceTrustTier;
  status: SourceStatus;
  attributionName: string;
  createdAt: Instant;
  updatedAt: Instant;
};

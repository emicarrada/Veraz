import type { CountryId } from "@/domain/shared/ids";
import type { IsoCountryCode } from "@/domain/shared/value-objects";

export type Country = {
  id: CountryId;
  iso3166_1: IsoCountryCode;
  name: string;
};

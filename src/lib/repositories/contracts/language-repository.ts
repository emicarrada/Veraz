import type { Language } from "@/domain/catalog/language";
import type { LocaleCode } from "@/domain/shared/value-objects";

/** Contract only — not implemented in this phase. */
export type LanguageRepository = {
  findByCode(code: LocaleCode): Promise<Language | null>;
};

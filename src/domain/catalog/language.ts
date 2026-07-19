import type { LanguageId } from "@/domain/shared/ids";
import type { LocaleCode } from "@/domain/shared/value-objects";

export type Language = {
  id: LanguageId;
  code: LocaleCode;
  name: string;
};

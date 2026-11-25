import type { Locale } from "@/i18n/routing";

const COUNTRY_NAMES: Record<string, Record<Locale, string>> = {
  MX: { es: "México", en: "Mexico" },
  ES: { es: "España", en: "Spain" },
  AR: { es: "Argentina", en: "Argentina" },
  US: { es: "Estados Unidos", en: "the United States" },
  GB: { es: "el Reino Unido", en: "the United Kingdom" },
  CO: { es: "Colombia", en: "Colombia" },
  CL: { es: "Chile", en: "Chile" },
  PE: { es: "Perú", en: "Peru" },
  BR: { es: "Brasil", en: "Brazil" },
};

export function countryLabel(countryCode: string, locale: Locale): string | null {
  return COUNTRY_NAMES[countryCode.trim().toUpperCase()]?.[locale] ?? null;
}

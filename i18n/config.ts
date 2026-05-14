// Configuration centralisée des langues supportées
export const SUPPORTED_LOCALES = ["en", "fr", "ln"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

// Mapping des codes de langue pour la détection du navigateur
export const LOCALE_MAPPING: Record<string, Locale> = {
  en: "en",
  fr: "fr",
  ln: "ln",
  // Pour les variantes régionales
  "en-US": "en",
  "en-GB": "en",
  "en-AU": "en",
  "fr-FR": "fr",
  "fr-BE": "fr",
  "fr-CA": "fr",
  "fr-CH": "fr",
};

export const getLocaleFromBrowser = (
  acceptLanguage: string | null
): Locale => {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  // Parse Accept-Language header
  // Format: "fr-FR,fr;q=0.9,en;q=0.8,en-US;q=0.7"
  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code] = lang.trim().split(";");
      return code.trim();
    })
    .filter((code) => code.length > 0);

  for (const lang of languages) {
    // Essayer le mapping direct
    if (LOCALE_MAPPING[lang]) {
      return LOCALE_MAPPING[lang];
    }
    // Essayer le code court (ex: "fr" de "fr-FR")
    const shortLang = lang.split("-")[0];
    if (LOCALE_MAPPING[shortLang]) {
      return LOCALE_MAPPING[shortLang];
    }
  }

  return DEFAULT_LOCALE;
};

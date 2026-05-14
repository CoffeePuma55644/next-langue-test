import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { getLocaleFromBrowser, DEFAULT_LOCALE } from "./config";

export default getRequestConfig(async () => {
  const store = await cookies();
  const headersList = await headers();

  // 1. D'abord chercher un cookie existant
  let locale = store.get("locale")?.value;

  // 2. Si pas de cookie, déterminer la locale depuis le navigateur
  if (!locale) {
    const acceptLanguage = headersList.get("accept-language");
    locale = getLocaleFromBrowser(acceptLanguage);
    // Note: Le cookie sera créé via setLocale() au premier changement
  }

  // 3. Fallback final
  if (!locale) {
    locale = DEFAULT_LOCALE;
  }

  // Charger les messages correspondants
  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch {
    // Si la locale n'existe pas, charger l'anglais par défaut
    messages = (await import(`../messages/${DEFAULT_LOCALE}.json`)).default;
  }

  return {
    locale,
    messages,
  };
});

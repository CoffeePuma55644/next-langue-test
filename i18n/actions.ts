"use server";

import { cookies } from "next/headers";
import { Locale, SUPPORTED_LOCALES } from "./config";

export async function setLocale(locale: Locale) {
  // Vérifier que la locale est supportée
  if (!SUPPORTED_LOCALES.includes(locale)) {
    throw new Error(`Locale '${locale}' n'est pas supportée`);
  }

  const store = await cookies();

  // Définir le cookie pour 1 an
  store.set("locale", locale, {
    maxAge: 365 * 24 * 60 * 60, // 1 an en secondes
    path: "/",
    httpOnly: true, // Pour la sécurité (pas accessible via JavaScript)
    sameSite: "lax", // Protection CSRF
  });

  return { success: true, locale };
}

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const locale = store.get("locale")?.value || "en";
  return locale as Locale;
}

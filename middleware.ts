import { NextRequest, NextResponse } from "next/server";
import { getLocaleFromBrowser, SUPPORTED_LOCALES, DEFAULT_LOCALE } from "./i18n/config";

export function middleware(request: NextRequest) {
  // 1. Vérifier si le cookie existe déjà
  const locale = request.cookies.get("locale")?.value;

  if (locale) {
    // Cookie existe, pas besoin de faire quelque chose
    return NextResponse.next();
  }

  // 2. Pas de cookie → créer un depuis Accept-Language
  const acceptLanguage = request.headers.get("accept-language");
  const detectedLocale = getLocaleFromBrowser(acceptLanguage);

  // 3. Créer la réponse et ajouter le cookie
  const response = NextResponse.next();
  response.cookies.set("locale", detectedLocale, {
    maxAge: 365 * 24 * 60 * 60, // 1 an
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  return response;
}

// Appliquer le middleware à toutes les routes
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

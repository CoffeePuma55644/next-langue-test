"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { setLocale } from "@/i18n/actions";
import { SUPPORTED_LOCALES, Locale } from "@/i18n/config";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  const handleChangeLanguage = (newLocale: Locale) => {
    startTransition(async () => {
      await setLocale(newLocale);
      // Recharger la page pour appliquer la nouvelle langue
      window.location.reload();
    });
  };

  return (
    <div className="flex gap-2 items-center">
      <label className="text-sm font-medium">Language:</label>
      <div className="flex gap-1">
        {SUPPORTED_LOCALES.map((loc) => (
          <button
            key={loc}
            onClick={() => handleChangeLanguage(loc)}
            disabled={isPending}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              locale === loc
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loc.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

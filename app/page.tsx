import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "./components/LanguageSwitcher";

export default async function HomePage() {
  const t = await getTranslations("HomePage");
  return (
    <div className="flex flex-col gap-4 p-4">
      <LanguageSwitcher />
      <h1>{t("title")}</h1>
    </div>
  );
}

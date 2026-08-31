import { siteContent } from "./site";
import { siteContentEn } from "./site.en";
import { siteUiByLocale } from "./ui";
import type { SiteContent, SiteLocale } from "../types/site";

const contentByLocale = {
  "pt-BR": siteContent,
  en: siteContentEn
} satisfies Record<SiteLocale, SiteContent>;

export function getLocalizedSite(locale: SiteLocale) {
  return {
    content: contentByLocale[locale],
    ui: siteUiByLocale[locale]
  };
}

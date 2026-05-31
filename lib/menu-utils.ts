import type { LocalizedText } from "./menu-types";

export function t(text: LocalizedText, locale: string): string {
  return locale === "de" ? text.de : text.ar;
}


export function formatPrice(price: number, locale: string): string {
  const value = new Intl.NumberFormat(
    locale === "de" ? "de-DE" : "ar"
  ).format(price);

  return locale === "de"
    ? ` ${value} €`
    : `€ ${value} `;
}
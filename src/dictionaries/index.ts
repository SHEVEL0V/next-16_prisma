import "server-only";
import type { Dict } from "@/types";

const dictionaries = {
  en: () => import("./en.json").then((module) => module.default),
  uk: () => import("./uk.json").then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;

export const hasLocale = (locale: string): locale is Locale => locale in dictionaries;

export const getDictionary = async (locale: Locale): Promise<Dict> => {
  const dictionary = await dictionaries[locale]();
  return dictionary as Dict;
};

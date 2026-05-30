/**
 * Routes configuration
 * Centralized mapping of application routes with language support.
 */

export const ROUTES = {
  home: (lang: string) => `/${lang}`,
  signin: (lang: string) => `/${lang}/signin`,
  signup: (lang: string) => `/${lang}/signup`,
  user: {
    dashboard: (lang: string) => `/${lang}/user`,
    profile: (lang: string) => `/${lang}/user/profile`,
  },
  privacy: "/privacy",
  terms: "/terms",
  contact: "/contact",
  changeLocale: (pathname: string, newLang: string) => {
    const segments = pathname.split("/");
    segments[1] = newLang;
    return segments.join("/");
  },
} as const;

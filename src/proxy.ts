import { NextResponse, type NextRequest } from "next/server";
import { decrypt } from "./utils/session";

const locales = ["en", "uk"] as const;
export type Locale = (typeof locales)[number];

const DEFAULT_LOCALE: Locale = "en";
const LOCALE_PREFIX_RE = new RegExp(`^\\/(${locales.join("|")})(?:\\/|$)`);

// Determine the best locale from cookie or Accept-Language header
function getLocale(req: NextRequest): Locale {
  const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) return cookieLocale as Locale;

  const browserLang = req.headers.get("accept-language")?.split(",")[0].split("-")[0] ?? "";
  if (locales.includes(browserLang as Locale)) return browserLang as Locale;

  return DEFAULT_LOCALE;
}

// Routes that require authentication
const PROTECTED_ROUTES = new Set(["/user", "/"]);
// Routes that redirect authenticated users to dashboard
const PUBLIC_ROUTES = new Set(["/signin", "/signup"]);

function isProtected(path: string) {
  return PROTECTED_ROUTES.has(path) || path.startsWith("/user/");
}

export async function proxy(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // Redirect to locale-prefixed URL if locale segment is missing
  if (!LOCALE_PREFIX_RE.test(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${getLocale(req)}${pathname}`;
    return NextResponse.redirect(url);
  }

  const lang = pathname.split("/")[1] as Locale;
  const pathWithoutLocale = pathname.replace(`/${lang}`, "") || "/";

  const isPublic = PUBLIC_ROUTES.has(pathWithoutLocale);
  const isGuarded = isProtected(pathWithoutLocale);

  // Skip auth check for unrelated routes
  if (!isPublic && !isGuarded) return NextResponse.next();

  // Decrypt session cookie to determine auth state
  const cookie = req.cookies.get("session")?.value;
  const session = cookie ? await decrypt(cookie) : null;
  const isAuthenticated = !!session?.name;

  if (isAuthenticated) {
    // Redirect authenticated users away from public routes and root
    if (isPublic || pathWithoutLocale === "/") {
      return NextResponse.redirect(`${origin}/${lang}/user/${session.name}/menu`);
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users away from protected routes
  if (isGuarded) {
    return NextResponse.redirect(`${origin}/${lang}/signin`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico)$).*)"],
};

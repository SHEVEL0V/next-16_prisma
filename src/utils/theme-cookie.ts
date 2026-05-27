/** @format */
"use server";

import { cookies } from "next/headers";

type Theme = "light" | "dark";

// Cookie options computed at call time so NODE_ENV changes are respected
function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  } as const;
}

export async function getThemeCookie(): Promise<Theme> {
  const cookieStore = await cookies();
  return cookieStore.get("theme")?.value === "dark" ? "dark" : "light";
}

export async function toggleThemeCookie(): Promise<Theme> {
  const cookieStore = await cookies();
  const newTheme: Theme = (await getThemeCookie()) === "dark" ? "light" : "dark";

  cookieStore.set("theme", newTheme, getCookieOptions());

  return newTheme;
}

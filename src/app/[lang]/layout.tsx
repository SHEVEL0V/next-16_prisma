import MuiThemeProvider from "@/components/layout/mui-theme-provider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { getThemeCookie } from "@/utils/theme-cookie";

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const mode = await getThemeCookie();

  return (
    <AppRouterCacheProvider>
      <MuiThemeProvider mode={mode ?? "light"}>{children}</MuiThemeProvider>
    </AppRouterCacheProvider>
  );
}

/** @format */

import type React from "react";
import { Box } from "@mui/material";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { getThemeCookie } from "@/utils/theme-cookie";
import { DESIGN_TOKENS } from "@/theme/constants";
import { getDictionary, hasLocale } from "@/dictionaries";
import { notFound } from "next/navigation";

export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const mode = await getThemeCookie();

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header mode={mode} dict={dict} />
      <Box
        component="main"
        sx={{
          flex: "1 0 auto",
          width: "100%",
          animation: "fadeIn 0.5s ease-in-out",
          paddingTop: DESIGN_TOKENS.headerHeight + "px", // Adjust for AppBar height
        }}
      >
        {children}
      </Box>

      <Footer dict={dict.Footer} />
    </div>
  );
}

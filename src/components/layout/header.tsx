// components/Header.tsx
/** @format */
"use client";

import React, { useTransition } from "react";
import { AppBar, Toolbar, Typography, Box, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import { Button, UserButton } from "@/components/ui/buttons";
import { LanguageSwitcher } from "@/components/ui/buttons";
import { toggleThemeCookie } from "@/utils/theme-cookie";
import type { PaletteMode } from "@mui/material";

import type { Dict } from "@/types";

interface HeaderProps {
  mode: PaletteMode;
  dict?: Dict;
}

export default function Header({ mode, dict }: HeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isDark = mode === "dark";

  const handleThemeToggle = () => {
    startTransition(async () => {
      await toggleThemeCookie();
      router.refresh();
    });
  };

  return (
    <AppBar>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
            <Button
              variant="back"
              tooltip={dict?.Header?.goBack || "Go back"}
              onClick={() => router.back()}
            />
            <Button
              variant="home"
              tooltip={dict?.Header?.goHome || "Go to home"}
              onClick={() => router.push("/")}
            />
          </Box>

          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            {dict?.Header?.welcome || "Welcome to UI"}
          </Typography>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 2,
            }}
          >
            <LanguageSwitcher dict={dict} />
            <Button
              variant="darkMode"
              tooltip={
                isDark
                  ? dict?.Header?.lightMode || "Light mode"
                  : dict?.Header?.darkMode || "Dark mode"
              }
              themeMode={isDark ? "dark" : "light"}
              onClick={handleThemeToggle}
              loading={isPending}
            />
            <UserButton dict={dict?.ProfileMenu} />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

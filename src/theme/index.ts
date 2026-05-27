/** @format */
import { createTheme, type PaletteMode, alpha } from "@mui/material";
import { Roboto } from "next/font/google";
import { DESIGN_TOKENS } from "./constants";
import type {} from "@mui/x-data-grid/themeAugmentation";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

declare module "@mui/material/styles" {
  interface Theme {
    custom: typeof DESIGN_TOKENS;
  }
  interface ThemeOptions {
    custom?: typeof DESIGN_TOKENS;
  }
}

declare module "@mui/material/Paper" {
  interface PaperPropsVariantOverrides {
    boardColumn: true;
  }
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const PALETTE = {
  dark: {
    primary: "#60a5fa",
    textPrimary: "#f8fafc",
    textSecondary: "#94a3b8",
    bgDefault: "#0f172a",
    bgPaper: "#1e293b",
    divider: "rgba(255, 255, 255, 0.12)",
    shadow: "0 8px 24px -8px rgba(0,0,0,0.5)",
  },
  light: {
    primary: "#2563eb",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    bgDefault: "#f1f5f9",
    bgPaper: "#ffffff",
    divider: "rgba(15, 23, 42, 0.12)",
    shadow: "",
  },
} as const;

// ─── Theme ────────────────────────────────────────────────────────────────────

export const getThemeMui = (mode: PaletteMode) => {
  const isDark = mode === "dark";
  const p = isDark ? PALETTE.dark : PALETTE.light;
  const br = DESIGN_TOKENS.borderRadius;

  return createTheme({
    cssVariables: { colorSchemeSelector: "class" },
    palette: {
      mode,
      primary: { main: p.primary, contrastText: "#fff" },
      text: { primary: p.textPrimary, secondary: p.textSecondary },
      background: { default: p.bgDefault, paper: p.bgPaper },
      divider: p.divider,
    },
    typography: {
      fontFamily: roboto.style.fontFamily,
      button: { textTransform: "none", fontWeight: 600 },
    },
    shape: { borderRadius: br },
    custom: DESIGN_TOKENS,

    components: {
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          "html, body": {
            height: "100%",
            margin: 0,
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          },
          body: {
            backgroundColor: theme.palette.background.default,
            transition: theme.transitions.create("background-color", { duration: 300 }),
          },
          ".glass-effect": {
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: "blur(10px)",
            border: `1px solid ${theme.palette.divider}`,
          },
          "*::-webkit-scrollbar": { width: 6, height: 6 },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: alpha(theme.palette.divider, 0.2),
            borderRadius: 4,
            "&:hover": { backgroundColor: alpha(theme.palette.divider, 0.4) },
          },
          "@keyframes fadeIn": {
            from: { opacity: 0, transform: "translateY(10px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
        }),
      },

      MuiAppBar: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({
            height: DESIGN_TOKENS.headerHeight,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${theme.palette.divider}`,
            color: theme.palette.text.primary,
          }),
        },
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: Number(br) * 1.5,
            padding: "8px 16px",
            transition: theme.transitions.create(["transform", "background-color", "box-shadow"], {
              duration: 200,
            }),
            "&:active": { transform: "scale(0.96)" },
          }),
        },
      },

      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: "none",
            borderRadius: Number(br) * 2,
            border: `1px solid ${theme.palette.divider}`,
            transition: theme.transitions.create(["box-shadow", "border-color", "transform"]),
            "&:hover": {
              boxShadow: p.shadow || theme.shadows[3],
              borderColor: alpha(theme.palette.primary.main, 0.3),
            },
          }),
        },
      },

      MuiPaper: {
        styleOverrides: { root: { backgroundImage: "none" } },
        variants: [
          {
            props: { variant: "boardColumn" },
            style: ({ theme }) => ({
              padding: theme.spacing(2),
              minWidth: 280,
              width: 280,
              flexShrink: 0,
              [theme.breakpoints.up("sm")]: { minWidth: 320, width: 320 },
              height: "fit-content",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
              backgroundColor: alpha(theme.palette.background.default, 0.4),
              borderRadius: Number(br) * 3,
            }),
          },
        ],
      },

      MuiDialogActions: {
        styleOverrides: {
          root: ({ theme }) => ({ padding: theme.spacing(2, 3) }),
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: Number(br) * 2 },
        },
      },

      MuiCardContent: {
        styleOverrides: {
          root: ({ theme }) => ({
            padding: theme.spacing(1.5),
            "&:last-child": { paddingBottom: theme.spacing(1.5) },
          }),
        },
      },

      MuiDataGrid: {
        styleOverrides: {
          root: { border: "none", borderRadius: 0, height: "100vh" },
        },
      },
    },
  });
};

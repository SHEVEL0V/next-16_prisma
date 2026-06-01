"use client";

import { ROUTES } from "@/constants";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { MenuItem, Select, FormControl, SelectChangeEvent, Box, Tooltip } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";

import type { Dict } from "@/types";

export default function LanguageSwitcher({ dict }: { dict?: Dict }) {
  const params = useParams();
  const locale = (params?.lang as string) || "en";
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const languageDict = dict?.Language;

  const handleLanguageChange = (event: SelectChangeEvent) => {
    const nextLocale = event.target.value;
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    startTransition(() => {
      router.replace(ROUTES.changeLocale(pathname, nextLocale));
    });
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Tooltip title={languageDict?.selectLanguage || "Select Language"}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <LanguageIcon fontSize="small" />
        </Box>
      </Tooltip>
      <FormControl variant="standard" size="small">
        <Select
          value={locale}
          onChange={handleLanguageChange}
          disabled={isPending}
          disableUnderline
          sx={{
            fontSize: "0.875rem",
            fontWeight: 500,
            "& .MuiSelect-select": {
              display: "flex",
              alignItems: "center",
              py: 0,
            },
          }}
        >
          <MenuItem value="en">{languageDict?.en || "English"}</MenuItem>
          <MenuItem value="uk">{languageDict?.uk || "Українська"}</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}

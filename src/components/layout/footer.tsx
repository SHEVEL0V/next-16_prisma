/** @format */
"use client";

import React from "react";
import { Box, Container, Typography, Stack, Link, alpha, useTheme } from "@mui/material";

export default function Footer() {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        minHeight: theme.custom.footerHeight,
        display: "flex",
        alignItems: "center",
        width: "100%",
        mt: "auto",
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: alpha(theme.palette.background.paper, 0.4),
        backdropFilter: "blur(8px)",
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ py: 3 }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontWeight: 500,
            }}
          >
            © {currentYear} UI Portal. All rights reserved.
          </Typography>

          <Stack
            direction="row"
            spacing={{ xs: 2, sm: 4 }}
            sx={{
              "& a": {
                color: "text.secondary",
                textDecoration: "none",
                transition: "color 0.2s ease",
                fontSize: "0.85rem",
                "&:hover": {
                  color: "primary.main",
                },
              },
            }}
          >
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
            <Link href="/contact">Contact</Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

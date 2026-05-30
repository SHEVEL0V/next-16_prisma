/** @format */

import { Box, Typography, Button, Container } from "@mui/material";
import NotFoundIcon from "@mui/icons-material/Public";
import Link from "next/link";

/**
 * Not Found Page (404)
 * Displays when a route is not found
 */
import { getDictionary } from "@/dictionaries";
import { ROUTES } from "@/constants";
import { headers } from "next/headers";

export default async function NotFound() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");
  const lang = acceptLanguage?.startsWith("uk") ? "uk" : "en";
  const dict = await getDictionary(lang as "en" | "uk");

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          gap: 2,
        }}
      >
        <NotFoundIcon sx={{ fontSize: 80, color: "warning.main" }} />
        <Typography variant="h2" sx={{ fontWeight: 700 }}>
          404
        </Typography>
        <Typography variant="h5">{dict.Common.notFound}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {dict.Common.notFoundDescription}
        </Typography>
        <Link href={ROUTES.home(lang)} passHref style={{ textDecoration: "none" }}>
          <Button variant="contained">{dict.Common.backToHome}</Button>
        </Link>
      </Box>
    </Container>
  );
}

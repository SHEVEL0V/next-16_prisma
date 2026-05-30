/** @format */

"use client";

import { Box, Typography, Button, Container } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import type { Dict } from "@/types";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  dict?: Dict;
}

export default function ErrorBoundary({ error, reset, dict }: ErrorBoundaryProps) {
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
        <ErrorOutlineIcon sx={{ fontSize: 80, color: "error.main" }} />
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          {dict?.Common?.oops || "Oops!"}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {error.message || dict?.Common?.error || "Something went wrong"}
        </Typography>
        {process.env.NODE_ENV === "development" && error.digest && (
          <Typography variant="caption" color="text.secondary">
            Error ID: {error.digest}
          </Typography>
        )}
        <Button variant="contained" onClick={() => reset()}>
          {dict?.Common?.tryAgain || "Try Again"}
        </Button>
      </Box>
    </Container>
  );
}

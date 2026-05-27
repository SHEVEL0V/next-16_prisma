/** @format */

import { Box, Typography, Button, Container } from "@mui/material";
import NotFoundIcon from "@mui/icons-material/Public";
import Link from "next/link";

/**
 * Not Found Page (404)
 * Displays when a route is not found
 */
export default function NotFound() {
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
        <Typography variant="h5">Page Not Found</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          The page you are looking for does not exist or has been deleted. Please check the URL or
          return to the home page.
        </Typography>
        <Button component={Link} href="/" variant="contained">
          Back to Home
        </Button>
      </Box>
    </Container>
  );
}

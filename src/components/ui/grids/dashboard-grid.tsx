/** @format */
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid, Typography, CardActionArea, Box, Card } from "@mui/material";

interface MenuProps {
  menu: {
    name: string;
    link: string;
  }[];
}

export default function Dashboard({ menu }: MenuProps) {
  const pathname = usePathname();

  const pathSegments = pathname?.split("/").filter(Boolean) || [];
  const basePath =
    pathSegments.length >= 2 ? `/${pathSegments[0]}/${pathSegments[1]}/${pathSegments[2]}` : "";

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
      <Grid container spacing={3} columns={16}>
        {menu.map((item, i) => (
          <Grid size={{ xs: 16, sm: 8, md: 4 }} key={i}>
            <Card
              className="glass-effect"
              sx={{ height: 180, "&:hover": { transform: "translateY(-4px)" } }}
            >
              <CardActionArea
                component={Link}
                href={`${basePath}${item.link}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  p: 3,
                }}
              >
                <Typography variant="h6" color="text.primary" textAlign="center">
                  {item.name}
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

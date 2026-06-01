/** @format */
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid, Typography, CardActionArea, Box, Card } from "@mui/material";

interface MenuItem {
  name: string;
  link: string;
  icon: React.ReactNode;
}

interface MenuProps {
  menu: MenuItem[];
}

export default function Dashboard({ menu }: MenuProps) {
  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
      <Grid container spacing={3} columns={16}>
        {menu.map((item, i) => (
          <Grid size={{ xs: 16, sm: 8, md: 4 }} key={i}>
            <Card
              className="glass-effect"
              sx={{
                height: 180,
                transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardActionArea
                component={Link}
                href={item.link}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  p: 3,
                }}
              >
                {item.icon}
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

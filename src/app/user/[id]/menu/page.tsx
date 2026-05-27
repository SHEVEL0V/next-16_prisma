/** @format */

import React from "react";
import { DashboardGrid } from "@/components/ui/grids";
import Container from "@mui/material/Container";

const card = [
  { name: "Board", link: "/board" },
  { name: "Task List", link: "/task" },
];

export default function Menu() {
  return (
    <Container maxWidth="xl">
      <DashboardGrid menu={card} />
    </Container>
  );
}

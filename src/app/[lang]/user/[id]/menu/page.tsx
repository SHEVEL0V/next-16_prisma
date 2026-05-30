/** @format */

import React from "react";
import { DashboardGrid } from "@/components/ui/grids";
import Container from "@mui/material/Container";
import { getDictionary, hasLocale } from "@/dictionaries";
import { notFound } from "next/navigation";

interface MenuProps {
  params: Promise<{ lang: string }>;
}

export default async function Menu({ params }: MenuProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const card = [
    { name: dict?.Menu?.board || "Board", link: "/board" },
    { name: dict?.Menu?.taskList || "Task List", link: "/task" },
  ];

  return (
    <Container maxWidth="xl">
      <DashboardGrid menu={card} />
    </Container>
  );
}

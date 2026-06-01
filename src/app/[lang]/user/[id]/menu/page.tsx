/** @format */

import { DashboardGrid } from "@/components/ui/grids";
import Container from "@mui/material/Container";
import { getDictionary, hasLocale } from "@/dictionaries";
import { notFound } from "next/navigation";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";

interface MenuProps {
  params: Promise<{ lang: string; id: string }>;
}

export default async function Menu({ params }: MenuProps) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const card = [
    {
      name: dict?.Menu?.board || "Board",
      link: `/user/${id}/board`,
      icon: <DashboardIcon sx={{ fontSize: 40, mb: 1 }} />,
    },
    {
      name: dict?.Menu?.taskList || "Task List",
      link: `/user/${id}/task`,
      icon: <ListAltIcon sx={{ fontSize: 40, mb: 1 }} />,
    },
  ];

  return (
    <Container maxWidth="xl">
      <DashboardGrid menu={card} />
    </Container>
  );
}

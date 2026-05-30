/** @format */

import { getTasksAll } from "@/features/board/queries";
import { Box } from "@mui/material";
import { formatDate } from "@/utils/format-date";
import { TasksClient } from "./tasks-client";
import type { TaskRow } from "./tasks-client";
import { getDictionary, hasLocale } from "@/dictionaries";
import { notFound } from "next/navigation";

interface TasksProps {
  params: Promise<{ lang: string }>;
}

/**
 * Tasks Page
 * Server component that fetches tasks and passes to client component
 */
export default async function Tasks({ params }: TasksProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const result = await getTasksAll();
  const tasks = result.data || [];

  const rows: TaskRow[] = tasks.map((task) => ({
    id: task.id,
    date: formatDate(task.createdAt),
    status: task.column.title,
    title: task.title,
    description: task.description,
    board_title: task.column.board.title,
    priority: task.priority,
  }));

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TasksClient rows={rows} dict={dict?.Tasks} />
    </Box>
  );
}

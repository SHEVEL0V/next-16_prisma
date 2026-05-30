/** @format */

"use client";

import { memo } from "react";
import { Paper, Typography, Stack, Box, alpha, useTheme } from "@mui/material";
import { Droppable } from "@hello-pangea/dnd";
import TaskCard from "./task-card";
import TaskCreateForm from "./task-form";
import type { ColumnType, ColumnTaskType } from "../../types";
import TitleColumn from "./column-title";
import type { Dict } from "@/types";

interface BoardColumnProps {
  column: ColumnType;
  boardId: string;
  dict?: Dict;
}

/**
 * BoardColumn Component
 * Renders a single column with tasks, title, and creation form
 * Supports drag-and-drop functionality for task reordering
 *
 * @component
 * @param {ColumnType} column - Column data with nested tasks
 * @param {string} boardId - Parent board ID for task creation
 */
export default memo(function BoardColumn({ column, boardId, dict }: BoardColumnProps) {
  const theme = useTheme();

  return (
    <Paper variant="boardColumn" className="glass-effect bordered">
      {/* Column header with title and task count */}
      <TitleColumn
        id={column.id}
        title={column.title}
        taskCount={column.tasks.length}
        dict={dict}
      />

      {/* Task creation form */}
      <TaskCreateForm columnId={column.id} boardId={boardId} dict={dict} />

      {/* Droppable zone for drag-and-drop task reordering */}
      <Droppable droppableId={column.id} type="task">
        {(provided) => (
          <Stack
            {...provided.droppableProps}
            ref={provided.innerRef}
            spacing={1.5}
            sx={{
              overflowY: "auto",
              overflowX: "hidden",
              pr: 0.5,
              minHeight: 20,
            }}
          >
            {/* Task cards mapped from column tasks */}
            {column.tasks.map((task: ColumnTaskType, index: number) => (
              <TaskCard key={task.id} task={task} index={index} dict={dict} />
            ))}

            {/* Drag-and-drop placeholder */}
            {provided.placeholder}

            {/* Empty state when no tasks */}
            {column.tasks.length === 0 && (
              <Box
                sx={{
                  py: 4,
                  border: "1px dashed",
                  borderColor: alpha(theme.palette.divider, 0.2),
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {dict?.Board?.noTasks || "No tasks"}
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </Droppable>
    </Paper>
  );
});

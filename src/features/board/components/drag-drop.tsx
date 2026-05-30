/** @format */

"use client";

import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { Stack } from "@mui/material";
import { useOptimistic, useTransition } from "react";
import { reorderAction } from "../actions";
import type { ColumnType } from "../types";
import Column from "./board/board-column";
import ColumnCreateForm from "./board/column-create-form";

import type { Dict } from "@/types";

export default function DragDropWrapper({
  initialData,
  boardId,
  dict,
}: {
  initialData: ColumnType[];
  boardId: string;
  dict?: Dict;
}) {
  const [isPending, startTransitionAction] = useTransition();

  const [optimisticColumns, setOptimisticColumns] = useOptimistic<ColumnType[], ColumnType[]>(
    initialData,
    (_currentColumns, newColumns) => newColumns,
  );

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (
      !destination ||
      (destination.droppableId === source.droppableId && destination.index === source.index)
    ) {
      return;
    }

    startTransitionAction(() => {
      const newColumns = Array.from(optimisticColumns);
      const formData = new FormData();
      formData.append("id", draggableId);
      formData.append("type", type);

      if (type === "column") {
        const [movedColumn] = newColumns.splice(source.index, 1);
        newColumns.splice(destination.index, 0, movedColumn);

        setOptimisticColumns(newColumns);
        formData.append("order", destination.index.toString());
      }

      if (type === "task") {
        const sourceColIndex = newColumns.findIndex((col) => col.id === source.droppableId);
        const destColIndex = newColumns.findIndex((col) => col.id === destination.droppableId);

        if (sourceColIndex !== -1 && destColIndex !== -1) {
          const sourceColumn = newColumns[sourceColIndex];
          const destColumn = newColumns[destColIndex];

          const sourceTasks = Array.from(sourceColumn.tasks);
          const destTasks =
            source.droppableId === destination.droppableId
              ? sourceTasks
              : Array.from(destColumn.tasks);

          const [movedTask] = sourceTasks.splice(source.index, 1);
          const order = (destination.index + 1) * 1000;
          movedTask.order = order;

          destTasks.splice(destination.index, 0, movedTask);

          newColumns[sourceColIndex] = { ...sourceColumn, tasks: sourceTasks };
          newColumns[destColIndex] = { ...destColumn, tasks: destTasks };

          setOptimisticColumns(newColumns);

          formData.append("columnId", destination.droppableId);
          formData.append("order", order.toString());
        }
      }

      reorderAction({ success: false, errors: {} }, formData);
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="board" type="column" direction="horizontal">
        {(provided) => (
          <Stack
            {...provided.droppableProps}
            ref={provided.innerRef}
            direction="row"
            spacing={3}
            sx={{
              p: 3,
              overflowX: "auto",
            }}
            style={{ opacity: isPending ? 0.7 : 1, transition: "opacity 0.2s" }}
          >
            {optimisticColumns.map((column, index) => (
              <Draggable key={column.id} draggableId={column.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={provided.draggableProps.style}
                  >
                    <Column column={column} boardId={boardId} dict={dict} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            <ColumnCreateForm boardId={boardId} dict={dict} />
          </Stack>
        )}
      </Droppable>
    </DragDropContext>
  );
}

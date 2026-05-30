/** @format */

"use client";
import { Draggable } from "@hello-pangea/dnd";
import { memo } from "react";
import { createPortal } from "react-dom";
import type { TaskType } from "../../types";
import TaskCardContent from "./task-card-content";

import type { Dict } from "@/types";

interface TaskCardProps {
  task: TaskType;
  index: number;
  dict?: Dict;
}

export default memo(function TaskCard({ task, index, dict }: TaskCardProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => {
        const child = (
          <TaskCardContent task={task} snapshot={snapshot} provided={provided} dict={dict} />
        );

        if (snapshot.isDragging && typeof document !== "undefined") {
          return createPortal(child, document.body);
        }
        return child;
      }}
    </Draggable>
  );
});

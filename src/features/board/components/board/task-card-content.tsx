/** @format */

"use client";

import { memo, useState } from "react";
import { Card, CardContent, Stack } from "@mui/material";
import type { TaskType } from "../../types";
import { deleteTaskAction, updateTaskAction } from "../../actions";
import InlineEditor from "@/components/ui/editor/inline-editor";
import type { DraggableStateSnapshot, DraggableProvided } from "@hello-pangea/dnd";
import TaskPriorityToggle from "./task-priority-toggle";
import TaskDetailsModal from "./task-details-modal";

import type { Dict } from "@/types";

interface TaskCardContentProps {
  task: TaskType;
  snapshot: DraggableStateSnapshot;
  provided: DraggableProvided;
  dict?: Dict;
}

/**
 * TaskCardContent Component
 * Content wrapper for draggable task card with inline editing
 * Handles task title editing, priority toggle, and details modal
 *
 * @component
 * @param {TaskType} task - Task data
 * @param {DraggableStateSnapshot} snapshot - Drag state from dnd provider
 * @param {DraggableProvided} provided - Draggable props from dnd provider
 */
export default memo(function TaskCardContent({
  task,
  snapshot,
  provided,
  dict,
}: TaskCardContentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={provided.draggableProps.style}
      >
        <Card
          className="glass-effect"
          sx={{
            ...(snapshot.isDragging
              ? { boxShadow: 6, transform: "scale(1.02)", cursor: "grabbing" }
              : { cursor: "grab" }),
          }}
        >
          <input type="hidden" name="id" value={task.id} />
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              spacing={1}
            >
              <Stack spacing={1} sx={{ flexGrow: 1 }}>
                <InlineEditor
                  data={{ id: task.id, value: task.title, name: "title" }}
                  update={updateTaskAction}
                  remove={deleteTaskAction}
                  onViewDetails={() => setIsModalOpen(true)}
                  dict={dict}
                >
                  <TaskPriorityToggle task={task} />
                </InlineEditor>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </div>

      {isModalOpen && (
        <TaskDetailsModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          task={task}
          dict={dict}
        />
      )}
    </>
  );
});

/** @format */

"use client";

import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from "@mui/material";
import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/buttons";
import CloseIcon from "@mui/icons-material/Close";
import { updateTaskDetailsAction } from "../../actions";
import type { TaskType } from "../../types";
import type { Dict } from "@/types";

interface TaskDetailsModalProps {
  open: boolean;
  onClose: () => void;
  task: TaskType;
  dict?: Dict;
}

/**
 * TaskDetailsModal Component
 * Modal dialog for editing task title and description
 * Provides inline editing with validation and loading states
 *
 * @component
 * @param {boolean} open - Whether modal is visible
 * @param {() => void} onClose - Callback to close modal
 * @param {TaskType} task - Task data to edit
 */
export default function TaskDetailsModal({ open, onClose, task, dict }: TaskDetailsModalProps) {
  const [state, formAction, isPending] = useActionState(updateTaskDetailsAction, {
    success: false,
    errors: {},
  });

  // Close modal after successful update
  useEffect(() => {
    if (state.success && !isPending) {
      const timer = setTimeout(onClose, 500);
      return () => clearTimeout(timer);
    }
  }, [state.success, isPending, onClose]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ m: 0, p: 2, pr: 6 }}>
        {dict?.Board?.taskDetails || "Task details"}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "grey.500" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box
          component="form"
          action={formAction}
          id={`task-modal-${task.id}`}
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          <input type="hidden" name="id" value={task.id} />

          <TextField
            name="title"
            label={dict?.Board?.taskName || "Task Name"}
            defaultValue={task.title}
            fullWidth
            required
            error={"errors" in state && !!state.errors?.title}
            helperText={"errors" in state ? state.errors?.title?.[0] : undefined}
          />

          <TextField
            name="description"
            label={dict?.Board?.taskDescription || "Task Description"}
            defaultValue={task.description || ""}
            fullWidth
            multiline
            rows={6}
            error={"errors" in state && !!state.errors?.description}
            helperText={"errors" in state ? state.errors?.description?.[0] : undefined}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button variant="secondary" onClick={onClose} disabled={isPending}>
          {dict?.Board?.cancel || "Cancel"}
        </Button>
        <Button
          variant="submit"
          form={`task-modal-${task.id}`}
          loading={isPending}
          loadingText={dict?.Board?.saving || "Saving..."}
        >
          {dict?.Board?.save || "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

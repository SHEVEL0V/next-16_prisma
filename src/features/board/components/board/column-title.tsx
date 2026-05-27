/** @format */

"use client";

import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { Box, IconButton, Tooltip } from "@mui/material";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import EditableTextField from "@/components/ui/fields/editable-text-field";
import EditableTypography from "@/components/ui/fields/editable-typography";
import { deleteColumnAction, updateColumnAction } from "../../actions";
import CustomDialog from "@/components/ui/modals/custom-dialog";

interface BoardColumnProps {
  id: string;
  title: string;
  taskCount?: number;
}

export default function TitleColumn({ id, title, taskCount = 0 }: BoardColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPendingDelete, startTransitionDelete] = useTransition();
  const [, actionUpdate, isPendingUpdate] = useActionState(updateColumnAction, {
    success: false,
    errors: {},
  });

  const [deleteState, actionDelete] = useActionState(deleteColumnAction, {
    success: false,
    errors: {},
  });

  const handleConfirmDelete = () => {
    startTransitionDelete(() => {
      const formData = new FormData();
      formData.append("id", id);
      actionDelete(formData);
    });
    setIsDeleteDialogOpen(false);
  };

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    if (!isPendingUpdate) {
      formRef.current?.requestSubmit();
      setIsEditing(false);
    }
  };

  const hasTasks = taskCount > 0;

  return (
    <>
      <Box sx={{ mb: 2, position: "relative", minHeight: 32 }}>
        <Box
          component="form"
          ref={formRef}
          action={actionUpdate}
          sx={{
            mx: 4,
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <input type="hidden" name="id" value={id} />

          {!isEditing ? (
            <EditableTypography
              sx={{ mx: "auto" }}
              value={title}
              isPending={isPendingUpdate}
              handleToggleEdit={() => setIsEditing(true)}
            />
          ) : (
            <EditableTextField
              formRef={formRef}
              name="title"
              defaultValue={title}
              handleToggleEdit={() => setIsEditing(false)}
              inputRef={inputRef}
              onBlur={handleBlur}
            />
          )}
        </Box>

        <Box
          sx={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <Tooltip
            title={hasTasks ? "Clear column of tasks to delete" : "Delete column"}
            placement="top"
          >
            <span>
              <IconButton
                onClick={() => setIsDeleteDialogOpen(true)}
                size="small"
                disabled={isPendingDelete || hasTasks}
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: hasTasks ? "inherit" : "error.main" },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <CustomDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete column"
        description={`Are you sure you want to delete the column "${title}"? This action cannot be undone.`}
        state={deleteState}
        isPending={isPendingDelete}
      />
    </>
  );
}

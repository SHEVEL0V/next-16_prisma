/** @format */
"use client";

import React, { useState, useTransition } from "react";
import { Box, Tooltip, IconButton, CircularProgress } from "@mui/material";
import { Edit as EditIcon, Close as CloseIcon, Delete as DeleteIcon } from "@mui/icons-material";
import CustomDialog from "@/components/ui/modals/custom-dialog";

import type { Dict } from "@/types";

interface EditorProps {
  isEditing: boolean;
  isPending: boolean;
  onEdit: () => void;
  onCancel: () => void;
  id: string;
  actionDelete: (formData: FormData) => void;
  dict?: Dict;
}

export default function EditorActions({
  isEditing,
  isPending,
  onEdit,
  onCancel,
  actionDelete,
  id,
  dict,
}: EditorProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();
  const dictEditor = dict?.Editor;

  const handleConfirmDelete = () => {
    startDelete(() => {
      const formData = new FormData();
      formData.append("id", id);
      actionDelete(formData);
    });
    setIsDeleteDialogOpen(false);
  };

  if (isPending || isDeleting)
    return (
      <Box sx={{ minHeight: 40, display: "flex", alignItems: "center" }}>
        <CircularProgress size={20} />
      </Box>
    );

  return (
    <>
      <Box sx={{ minHeight: 40, display: "flex", gap: 0.5, ml: "auto" }}>
        {isEditing ? (
          <Tooltip title={dict?.Editor?.cancel || "Cancel"}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                onCancel();
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <>
            <Tooltip title={dict?.Editor?.edit || "Edit"}>
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.preventDefault();
                  onEdit();
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={dict?.Editor?.delete || "Delete"}>
              <IconButton size="small" color="error" onClick={() => setIsDeleteDialogOpen(true)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      <CustomDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={dictEditor?.deleteTitle || "Delete"}
        description={dictEditor?.deleteDescription || "Are you sure you want to delete this?"}
        isPending={isDeleting}
        dict={dict?.Dialog}
      />
    </>
  );
}

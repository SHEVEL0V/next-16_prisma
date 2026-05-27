/** @format */
"use client";

import React from "react";
import {
  CircularProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import type { ActionResponse } from "@/types/index";

interface CustomDialogProps {
  onConfirm: () => void;
  title?: string;
  description?: string;
  state?: ActionResponse<unknown>;
  isPending?: boolean;
  open: boolean;
  onClose: () => void;
}

export default function CustomDialog({
  onConfirm,
  title = "Confirm action",
  description = "Are you sure you want to perform this action? This action cannot be undone.",
  state,
  isPending = false,
  open,
  onClose,
}: CustomDialogProps) {
  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
        {!state?.success && state?.message && (
          <Typography color="error" variant="caption" sx={{ mt: 2, display: "block" }}>
            {state.message}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isPending}
          variant="contained"
          color="error"
          autoFocus
          startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : undefined}
        >
          {isPending ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

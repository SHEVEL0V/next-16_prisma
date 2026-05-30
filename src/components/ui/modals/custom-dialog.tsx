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

interface DialogDict {
  cancel?: string;
  delete?: string;
  deleting?: string;
  confirmAction?: string;
  areYouSure?: string;
}

interface CustomDialogProps {
  onConfirm: () => void;
  title?: string;
  description?: string;
  state?: ActionResponse<unknown>;
  isPending?: boolean;
  open: boolean;
  onClose: () => void;
  dict?: DialogDict;
}

export default function CustomDialog({
  onConfirm,
  title,
  description,
  state,
  isPending = false,
  open,
  onClose,
  dict,
}: CustomDialogProps) {
  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose}>
      <DialogTitle>{title || dict?.confirmAction || "Confirm action"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {description ||
            dict?.areYouSure ||
            "Are you sure you want to perform this action? This action cannot be undone."}
        </DialogContentText>
        {!state?.success && state?.message && (
          <Typography color="error" variant="caption" sx={{ mt: 2, display: "block" }}>
            {state.message}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending} variant="outlined" color="inherit">
          {dict?.cancel || "Cancel"}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isPending}
          variant="contained"
          color="error"
          autoFocus
          startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : undefined}
        >
          {isPending ? dict?.deleting || "Deleting..." : dict?.delete || "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

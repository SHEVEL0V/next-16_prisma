/** @format */

"use client";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  TextField,
  Tooltip,
} from "@mui/material";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { createColumnAction } from "../../actions";

interface ColumnCreateFormProps {
  boardId: string;
}

export default function ColumnCreateForm({ boardId }: ColumnCreateFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, actionCreate, isPending] = useActionState(createColumnAction, {
    success: false,
    errors: {},
  });

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      startTransition(() => setIsOpen(false)); // Close the form on success in transition
    }
  }, [state.success]);

  useEffect(() => {
    if (isOpen) {
      // Focus input automatically when expanded
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  return (
    <>
      <Tooltip title="Add new column" placement="top" arrow>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            pt: 1,
            px: 2,
            flexShrink: 0,
          }}
        >
          <Fab
            size="small"
            aria-label="add column"
            onClick={() => setIsOpen(true)}
            sx={{
              "&:hover": { transform: "scale(1.05)", transition: "all 0.2s" },
            }}
          >
            <AddIcon />
          </Fab>
        </Box>
      </Tooltip>

      <Dialog open={isOpen} onClose={() => !isPending && setIsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Create new column</DialogTitle>
        <form action={actionCreate} ref={formRef}>
          <DialogContent sx={{ pb: 2 }}>
            <input type="hidden" name="boardId" value={boardId} />
            <TextField
              name="title"
              label="Column name"
              placeholder="Enter column name..."
              fullWidth
              size="medium"
              disabled={isPending}
              required
              autoComplete="off"
              inputRef={inputRef}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setIsOpen(false)}
              disabled={isPending}
              color="inherit"
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              variant="contained"
              color="primary"
              sx={{ borderRadius: 2 }}
            >
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

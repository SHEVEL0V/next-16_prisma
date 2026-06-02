/** @format */

"use client";

import { Box, TextField, Typography } from "@mui/material";
import { useActionState } from "react";
import { Button } from "@/components/ui/buttons";
import { createBoardAction } from "../../actions";

import type { Dict } from "@/types";

/**
 * CreateBoardForm Component
 * Form for creating a new board with inline title input and add button
 */
export default function CreateBoardForm({
  isOpen,
  onOpenSidebarAction,
  dict,
}: {
  isOpen: boolean;
  onOpenSidebarAction: () => void;
  dict?: Dict;
}) {
  const [state, formAction, isPending] = useActionState(createBoardAction, {
    success: false,
    errors: {},
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!isOpen) {
      event.preventDefault();
      onOpenSidebarAction();
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <form
        action={formAction}
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          justifyContent: isOpen ? "flex-start" : "center",
        }}
      >
        {isOpen && (
          <TextField
            name="title"
            size="small"
            placeholder={dict?.Board?.newBoardPlaceholder || "New board..."}
            required
            fullWidth
            variant="outlined"
          />
        )}
        <Button
          variant="add"
          type="submit"
          title={dict?.Board?.createBoardTooltip || "Create board"}
          disabled={isPending}
          tooltip={dict?.Board?.createBoardTooltip || "Create board"}
        />
      </form>

      {isOpen && !state.success && state.message && (
        <Typography color="error" variant="caption" sx={{ ml: 1 }}>
          {state.message}
        </Typography>
      )}
    </Box>
  );
}

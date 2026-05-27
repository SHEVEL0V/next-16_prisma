/** @format */

"use client";

import React, { memo } from "react";
import { Typography as MuiTypography, type TypographyProps } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

interface EditableTypographyProps {
  value: string;
  isPending?: boolean;
  handleToggleEdit: (edit: boolean) => void;
  variant?: TypographyProps["variant"];
  sx?: SxProps<Theme>;
}

// Using memo so the component doesn't re-render if parent InlineEditor updates through other states
const EditableTypography = memo(
  ({
    value,
    isPending = false,
    handleToggleEdit,

    sx,
  }: EditableTypographyProps) => {
    return (
      <MuiTypography
        role="button"
        tabIndex={isPending ? -1 : 0}
        onClick={() => !isPending && handleToggleEdit(true)}
        // Allow editing activation via keyboard (Enter/Space)
        onKeyDown={(e) => {
          if (!isPending && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleToggleEdit(true);
          }
        }}
        sx={{
          cursor: isPending ? "default" : "pointer",
          color: isPending ? "text.disabled" : "text.primary",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "block",
          transition: "color 0.2s ease",
          outline: "none",
          "&:hover": {
            color: isPending ? "text.disabled" : "primary.main",
          },
          "&:focus-visible": {
            color: "primary.main",
            textDecoration: "underline",
          },
          ...sx,
        }}
      >
        {value}
      </MuiTypography>
    );
  },
);

EditableTypography.displayName = "EditableTypography";

export default EditableTypography;

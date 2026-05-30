/** @format */

"use client";

import React from "react";
import { DialogActions } from "@mui/material";
import { Button } from "@/components/ui/buttons";
import type { Dict } from "@/types";

interface ModalActionsProps {
  /** Primary action button label */
  primaryLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Primary action button type (submit, button) */
  primaryType?: "submit" | "button";
  /** Callback when primary button is clicked */
  onPrimary?: () => void;
  /** Callback when cancel button is clicked */
  onCancel: () => void;
  /** Whether buttons are disabled */
  disabled?: boolean;
  /** Form ID for submit button */
  formId?: string;
  /** Loading state */
  loading?: boolean;
  /** Loading text for button */
  loadingText?: string;
  /** Show cancel button */
  showCancel?: boolean;
  /** Dictionary for localization */
  dict?: Dict;
}

/**
 * ModalActions Component
 * Reusable modal footer with standard action buttons
 */
export default function ModalActions({
  primaryLabel,
  cancelLabel,
  primaryType = "submit",
  onPrimary,
  onCancel,
  disabled = false,
  formId,
  loading = false,
  loadingText,
  showCancel = true,
  dict,
}: ModalActionsProps) {
  const defaultPrimaryLabel = dict?.Dialog?.save || "Save";
  const defaultCancelLabel = dict?.Dialog?.cancel || "Cancel";

  return (
    <DialogActions sx={{ p: 2, gap: 1 }}>
      {showCancel && (
        <Button variant="secondary" onClick={onCancel} disabled={disabled || loading}>
          {cancelLabel || defaultCancelLabel}
        </Button>
      )}
      {primaryType === "submit" ? (
        <Button
          variant="submit"
          type="submit"
          form={formId}
          loading={loading}
          loadingText={loadingText}
          disabled={disabled}
        >
          {primaryLabel || defaultPrimaryLabel}
        </Button>
      ) : (
        <Button variant="primary" onClick={onPrimary} disabled={disabled || loading}>
          {primaryLabel || defaultPrimaryLabel}
        </Button>
      )}
    </DialogActions>
  );
}

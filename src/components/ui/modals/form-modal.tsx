/**
 * FormModal Component
 * Unified modal for form submissions with action state handling
 * Consolidates CustomModal and TaskDetailsModal logic
 */

"use client";

import React, { useEffect, useCallback, memo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useActionState } from "react";
import { Button } from "@/components/ui/buttons";
import { MESSAGES } from "@/constants/messages";
import { TIMING, MODAL_SIZES } from "@/constants/ui";
import type { ActionResponse, Dict } from "@/types";

export interface FormField {
  /** Field name attribute */
  name: string;
  /** Field label */
  label: string;
  /** Input type (text, email, password, etc.) */
  type: string;
  /** Whether field is required */
  required?: boolean;
  /** Default value */
  defaultValue?: string | number;
  /** Placeholder text */
  placeholder?: string;
  /** Max width for field */
  maxWidth?: string;
  /** Multiline (for textarea) */
  multiline?: boolean;
  /** Number of rows (for textarea) */
  rows?: number;
}

export interface FormModalProps<T extends Record<string, unknown> = Record<string, unknown>> {
  /** Whether modal is open */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Form fields configuration */
  fields?: FormField[];
  /** Server action function */
  action: (prevState: ActionResponse<T>, formData: FormData) => Promise<ActionResponse<T>>;
  /** Modal size */
  size?: keyof typeof MODAL_SIZES;
  /** Custom form children (renders instead of fields) */
  children?: React.ReactNode;
  /** Callback on successful submission */
  onSuccess?: () => void;
  /** Hidden input fields (pass data without displaying) */
  hiddenFields?: Record<string, string | number>;
  /** Custom submit button label */
  submitLabel?: string;
  /** Loading text for submit button */
  loadingText?: string;
  /** Dictionary for localization */
  dict?: Dict;
}

/**
 * FormModal Component
 * Provides unified modal interface for all form submissions
 *
 * @component
 * @example
 * // With predefined fields
 * <FormModal
 *   open={isOpen}
 *   onClose={handleClose}
 *   title="Create Board"
 *   fields={[
 *     { name: 'title', label: 'Title', type: 'text', required: true }
 *   ]}
 *   action={createBoardAction}
 * />
 *
 * // With custom children
 * <FormModal
 *   open={isOpen}
 *   onClose={handleClose}
 *   title="Edit Task"
 *   action={updateTaskAction}
 * >
 *   <TextField name="title" label="Title" />
 *   <TextField name="description" label="Description" multiline rows={4} />
 * </FormModal>
 */
export const FormModal = memo(
  React.forwardRef<HTMLDivElement, FormModalProps<Record<string, unknown>>>(
    (
      {
        open,
        onClose,
        title,
        fields = [],
        action,
        size = "md",
        children,
        onSuccess,
        hiddenFields = {},
        dict,
        submitLabel = dict?.Board?.save || MESSAGES.save,
        loadingText = dict?.Board?.saving || MESSAGES.saving,
      },
      ref,
    ) => {
      const [state, formAction, isPending] = useActionState(action, {
        success: false,
        errors: {},
      } as ActionResponse<Record<string, unknown>>);

      // Close modal after successful submission
      useEffect(() => {
        if (state.success && !isPending) {
          const timer = setTimeout(() => {
            onSuccess?.();
            onClose();
          }, TIMING.modalCloseDelay);
          return () => clearTimeout(timer);
        }
      }, [state.success, isPending, onClose, onSuccess]);

      // Handle modal close
      const handleClose = useCallback(() => {
        if (!isPending) {
          onClose();
        }
      }, [isPending, onClose]);

      // Show success alert
      const showAlert = state.message && (state.success || "errors" in state);

      return (
        <Dialog
          ref={ref}
          open={open}
          onClose={handleClose}
          fullWidth
          maxWidth={size}
          PaperProps={{
            sx: {
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle sx={{ m: 0, p: 2, pr: 6, fontWeight: "bold" }}>
            {title}
            <IconButton
              onClick={handleClose}
              disabled={isPending}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: "grey.500",
                "&:hover": {
                  color: "error.main",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            {/* Alert for success/error messages */}
            {showAlert && (
              <Alert
                severity={state.success ? "success" : "error"}
                variant="outlined"
                sx={{ mb: 2 }}
              >
                {state.message}
              </Alert>
            )}

            {/* Form with fields or custom children */}
            <Box
              component="form"
              action={formAction}
              id={`form-modal-${title.replace(/\s+/g, "-")}`}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                pt: 1,
              }}
            >
              {/* Hidden fields */}
              {Object.entries(hiddenFields).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
              ))}

              {/* Render fields if no custom children */}
              {!children && fields.length > 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {fields.map((field) => (
                    <Box key={field.name} sx={{ maxWidth: field.maxWidth || "100%" }}>
                      <input
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        required={field.required}
                        defaultValue={field.defaultValue}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          fontSize: "14px",
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}

              {/* Custom children */}
              {children}
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button variant="secondary" onClick={handleClose} disabled={isPending}>
              {dict?.Dialog?.cancel || MESSAGES.cancel}
            </Button>
            <Button
              variant="submit"
              form={`form-modal-${title.replace(/\s+/g, "-")}`}
              loading={isPending}
              loadingText={loadingText}
            >
              {submitLabel}
            </Button>
          </DialogActions>
        </Dialog>
      );
    },
  ),
);

FormModal.displayName = "FormModal";

export default FormModal;

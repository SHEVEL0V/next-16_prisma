/** @format */
import { Box } from "@mui/material";
import { useActionState, useState, useRef, useEffect, useMemo } from "react";
import type { ActionType } from "@/types/index";
import EditorActions from "@/components/ui/editor/editor-actions";
import ErrorMessage from "@/components/ui/editor/error-message";
import EditableTypography from "@/components/ui/fields/editable-typography";
import EditableTextField from "../fields/editable-text-field";

import type { Dict } from "@/types";

interface EditorProps<T> {
  data: { id: string; value: string; name: string };
  update: ActionType<T>;
  remove: ActionType<T>;
  children?: React.ReactNode;
  onViewDetails?: () => void;
  dict?: Dict;
}

export default function InlineEditor<T>({
  data: { id, name, value },
  update,
  remove,
  children,
  onViewDetails,
  dict,
}: EditorProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [stateUpdate, actionUpdate, isPendingUpdate] = useActionState(update, {
    success: false,
    errors: {},
  });

  const [, actionDelete, isPendingDelete] = useActionState(remove, {
    success: false,
    errors: {},
  });

  const isPending = isPendingUpdate || isPendingDelete;

  const fieldError = useMemo(
    () => (!stateUpdate.success ? stateUpdate.errors?.[name]?.[0] : null),
    [stateUpdate, name],
  );

  const prevPending = useRef(isPendingUpdate);
  useEffect(() => {
    if (prevPending.current && !isPendingUpdate && stateUpdate.success) {
      setIsEditing(false);
    }
    prevPending.current = isPendingUpdate;
  }, [isPendingUpdate, stateUpdate.success]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleBlur = (e: React.FocusEvent) => {
    if (formRef.current?.contains(e.relatedTarget as Node)) return;

    // Close immediately without submitting if value hasn't changed
    if (inputRef.current?.value === value) {
      setIsEditing(false);
      return;
    }

    if (isEditing && !isPending) {
      formRef.current?.requestSubmit();
    }
  };

  return (
    <Box
      className="editor-card"
      sx={{
        position: "relative",
        mb: 1,
        borderRadius: 1,
        transition: "0.2s",
        border: "1px solid transparent",
        "&:hover": {
          bgcolor: "action.hover",
          borderColor: "divider",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          p: 1,
          alignItems: "center",
          minHeight: 40,
        }}
      >
        {children}

        <Box
          sx={{
            ml: "auto",
            opacity: isEditing || isPending ? 1 : 0,
            transition: "opacity 0.2s ease-in-out",
            ".editor-card:hover &": {
              opacity: 1,
            },
          }}
        >
          <EditorActions
            isEditing={isEditing}
            isPending={isPending}
            onEdit={() => setIsEditing(true)}
            onCancel={() => setIsEditing(false)}
            id={id}
            actionDelete={actionDelete}
            dict={dict}
          />
        </Box>
      </Box>

      <Box
        ref={formRef}
        component="form"
        action={actionUpdate}
        onBlur={handleBlur}
        sx={{
          px: 1.5,
          pb: 1,
          width: "100%",
        }}
      >
        <input type="hidden" name="id" value={id} />

        <Box sx={{ position: "relative", minHeight: 32 }}>
          {isEditing ? (
            <>
              <EditableTextField
                name={name}
                defaultValue={value}
                inputRef={inputRef}
                formRef={formRef}
                disabled={isPending}
                handleToggleEdit={setIsEditing}
              />
              {fieldError && <ErrorMessage message={fieldError} />}
            </>
          ) : (
            <EditableTypography
              value={value}
              isPending={isPending}
              handleToggleEdit={onViewDetails ? onViewDetails : () => setIsEditing(true)}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}

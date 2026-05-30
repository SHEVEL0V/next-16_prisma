/** @format */

import { TextField, Stack, Alert } from "@mui/material";
import { Button } from "@/components/ui/buttons";

import type { ActionResponse, Dict } from "@/types";

interface RegisterFieldsProps<T> {
  state: ActionResponse<T>;
  isPending: boolean;
  dict?: Dict;
  Common?: {
    loading?: string;
  };
}

const FIELDS = [
  {
    id: "name",
    name: "name",
    label: "Full Name",
    type: "text",
    autoComplete: "name",
    autoFocus: true,
  },
  {
    id: "email",
    name: "email",
    label: "Email Address",
    type: "email",
    autoComplete: "email",
  },
  { id: "password", name: "password", label: "Password", type: "password" },
  {
    id: "confirmPassword",
    name: "confirmPassword",
    label: "Confirm Password",
    type: "password",
  },
] as const;

/**
 * RegisterFields Component
 * Renders registration form fields (name, email, password, confirmation)
 */
export default function RegisterFields<T>({ state, isPending, dict }: RegisterFieldsProps<T>) {
  const errors = "errors" in state ? state.errors : undefined;

  const getFieldLabel = (name: string, defaultLabel: string) => {
    switch (name) {
      case "name":
        return dict?.Auth?.fullName || defaultLabel;
      case "email":
        return dict?.Auth?.email || defaultLabel;
      case "password":
        return dict?.Auth?.password || defaultLabel;
      case "confirmPassword":
        return dict?.Auth?.confirmPassword || defaultLabel;
      default:
        return defaultLabel;
    }
  };

  return (
    <Stack spacing={2.5}>
      {FIELDS.map((field) => (
        <TextField
          key={field.id}
          fullWidth
          required
          disabled={isPending}
          error={!!errors?.[field.name as keyof typeof errors]}
          helperText={errors?.[field.name as keyof typeof errors]?.[0]}
          {...field}
          label={getFieldLabel(field.name, field.label)}
        />
      ))}

      {!state.success && state.message && (
        <Alert severity="error" variant="filled">
          {state.message}
        </Alert>
      )}

      <Button variant="submit" loading={isPending} loadingText={dict?.Common?.loading}>
        {dict?.Auth?.register}
      </Button>
    </Stack>
  );
}

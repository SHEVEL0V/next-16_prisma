"use client";

import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useActionState } from "react";
import { updateProfileAction } from "../actions";

interface ProfileFormProps {
  user: {
    id: string;
    email: string;
    name: string;
    profile?: {
      position?: string;
      image?: string;
      bio?: string;
    };
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [state, action, isPending] = useActionState(updateProfileAction, {
    success: false,
    errors: {},
    message: "",
  });

  const errors = !state.success ? state.errors : {};

  return (
    <Paper
      className="glass-effect"
      sx={{ p: { xs: 2, md: 4 }, maxWidth: 700, mx: "auto", borderRadius: 3 }}
    >
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Profile Settings
      </Typography>

      {state.message && state.success && (
        <Typography color="success.main" sx={{ mb: 2, fontWeight: 500 }}>
          {state.message}
        </Typography>
      )}

      {state.message && !state.success && (
        <Typography color="error.main" sx={{ mb: 2, fontWeight: 500 }}>
          {state.message}
        </Typography>
      )}

      <Box component="form" action={action}>
        <input type="hidden" name="id" value={user.id} />

        <Stack spacing={3}>
          <TextField
            label="Email"
            defaultValue={user.email}
            disabled
            fullWidth
            helperText="Email cannot be changed."
          />

          <TextField
            label="Name"
            name="name"
            defaultValue={user.name}
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.[0]}
          />

          <TextField
            label="Position"
            name="position"
            defaultValue={user.profile?.position || ""}
            fullWidth
            error={!!errors.position}
            helperText={errors.position?.[0]}
          />

          <TextField
            label="Avatar (Image URL)"
            name="image"
            defaultValue={user.profile?.image || ""}
            fullWidth
            error={!!errors.image}
            helperText={errors.image?.[0]}
          />

          <TextField
            label="About Me / Biography"
            name="bio"
            defaultValue={user.profile?.bio || ""}
            multiline
            rows={5}
            fullWidth
            error={!!errors.bio}
            helperText={errors.bio?.[0]}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isPending}
            sx={{ alignSelf: "flex-start", px: 4, py: 1.5 }}
          >
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}

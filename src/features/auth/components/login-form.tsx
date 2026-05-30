/** @format */

// features/auth/components/LoginForm.tsx
"use client";

import React, { useActionState } from "react";
import { loginAction } from "@/features/auth/actions";
import { Box, Typography, Link } from "@mui/material";
import LoginFields from "./login-fields";
import { ROUTES } from "@/constants";

import type { Dict } from "@/types";

import ContainerForm from "./container-form";
import NextLink from "next/link";

const initialState = { success: false as const, message: "", errors: {} };

interface LoginFormProps {
  lang: string;
  dict?: Dict;
  Common?: {
    loading?: string;
  };
}

export default function LoginForm({ dict, lang }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <ContainerForm>
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {dict?.Auth?.welcomeBack || "Welcome back"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {dict?.Auth?.signInPrompt || "Please enter your details to sign in"}
        </Typography>
      </Box>

      <Box component="form" action={formAction} noValidate sx={{ width: "100%" }}>
        <LoginFields state={state} isPending={isPending} dict={dict} />
      </Box>
      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {dict?.Auth?.noAccount || "Don't have an account?"}{" "}
          <Link component={NextLink} href={ROUTES.signup(lang)} fontWeight={600} underline="hover">
            {dict?.Auth?.signUp || "Sign up"}
          </Link>
        </Typography>
      </Box>
    </ContainerForm>
  );
}

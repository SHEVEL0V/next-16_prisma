/** @format */
"use client";

import React, { useActionState } from "react";
import { registerAction } from "@/features/auth/actions";
import { Box, Typography, Link } from "@mui/material";
import { ROUTES } from "@/constants";
import RegisterFields from "./register-fields";
import NextLink from "next/link";
import ContainerForm from "./container-form";
import type { Dict } from "@/types";

const initialState = { success: false as const, message: "", errors: {} };

interface RegisterFormProps {
  lang: string;
  dict?: Dict;
  Common?: {
    loading?: string;
  };
}

export default function RegisterForm({ dict, lang }: RegisterFormProps) {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <ContainerForm>
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {dict?.Auth?.createAccount || "Create an account"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {dict?.Auth?.signUpPrompt || "Join us to start managing your menu"}
        </Typography>
      </Box>

      <Box component="form" action={formAction} noValidate sx={{ width: "100%" }}>
        <RegisterFields state={state} isPending={isPending} dict={dict} />
      </Box>

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {dict?.Auth?.alreadyHaveAccount || "Already have an account?"}{" "}
          <Link component={NextLink} href={ROUTES.signin(lang)} fontWeight={600} underline="hover">
            {dict?.Auth?.signIn || "Sign in"}
          </Link>
        </Typography>
      </Box>
    </ContainerForm>
  );
}

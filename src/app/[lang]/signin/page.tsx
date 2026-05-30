/** @format */

import React from "react";
import LoginForm from "@/features/auth/components/login-form";
import { getDictionary, hasLocale } from "@/dictionaries";
import { notFound } from "next/navigation";

interface SignInProps {
  params: Promise<{ lang: string }>;
}

export default async function SignIn({ params }: SignInProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return <LoginForm dict={dict} lang={lang} />;
}

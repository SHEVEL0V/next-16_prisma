/** @format */

import React from "react";
import RegisterForm from "@/features/auth/components/register-form";
import { getDictionary, hasLocale } from "@/dictionaries";
import { notFound } from "next/navigation";

interface SignUpProps {
  params: Promise<{ lang: string }>;
}

export default async function SignUp({ params }: SignUpProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return <RegisterForm dict={dict} lang={lang} />;
}

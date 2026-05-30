/** @format */

import { getSession } from "@/utils/session";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "@/features/user/components/profile-form";
import { Container } from "@mui/material";
import { getDictionary, hasLocale } from "@/dictionaries";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Profile | Project UI",
};

interface ProfilePageProps {
  params: Promise<{ lang: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const session = await getSession();

  if (!session || !session.id) {
    redirect("/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    // include: { profile: true },
  });

  if (!user) {
    redirect("/signin");
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <ProfileForm user={user} dict={dict?.Profile} />
    </Container>
  );
}

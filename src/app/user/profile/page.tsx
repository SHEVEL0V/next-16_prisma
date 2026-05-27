/** @format */

import { getSession } from "@/utils/session";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "@/features/user/components/profile-form";
import { Container } from "@mui/material";

export const metadata = {
  title: "Profile | Project UI",
};

export default async function ProfilePage() {
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
      <ProfileForm user={user} />
    </Container>
  );
}

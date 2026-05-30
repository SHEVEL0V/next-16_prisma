/** @format */

import Board from "@/features/board/components/main";
import { getDictionary, hasLocale } from "@/dictionaries";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ id?: string }>;
}

export default async function BoardPage({ params, searchParams }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const { id } = await searchParams;
  return <Board boardId={id} dict={dict} />;
}

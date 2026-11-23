"use client";

import dynamic from "next/dynamic";

const Screen = dynamic(() => import("@/features/pages/aluno"), { ssr: false });

export default function ClientPage() {
  return <Screen />;
}

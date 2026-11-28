"use client";

import dynamic from "next/dynamic";

const Screen = dynamic(() => import("@/features/modules/students/alunos"), { ssr: false });

export default function ClientPage() {
  return <Screen />;
}

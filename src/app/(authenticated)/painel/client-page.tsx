"use client";

import dynamic from "next/dynamic";

const Screen = dynamic(() => import("@/features/Home/painel"), { ssr: false });

export default function ClientPage() {
  return <Screen />;
}

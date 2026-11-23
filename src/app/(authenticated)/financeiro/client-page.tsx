"use client";

import dynamic from "next/dynamic";

const Screen = dynamic(() => import("@/features/pages/financeiro"), { ssr: false });

export default function ClientPage() {
  return <Screen />;
}

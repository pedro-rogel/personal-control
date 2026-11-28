"use client";

import dynamic from "next/dynamic";

const Screen = dynamic(() => import("@/features/modules/report/relatorios"), { ssr: false });

export default function ClientPage() {
  return <Screen />;
}

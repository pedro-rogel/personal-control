"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function useNavigate() {
  const router = useRouter();
  return useCallback(({ to, replace = false }: { to: string; replace?: boolean }) => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [router]);
}

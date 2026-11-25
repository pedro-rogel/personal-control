"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth-client";

function SessionCache({ queryClient }: { queryClient: QueryClient }) {
  const { data, isPending } = authClient.useSession();
  const previous = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (isPending) return;
    const userId = data?.user.id;
    if (previous.current !== userId) queryClient.clear();
    previous.current = userId;
  }, [data?.user.id, isPending, queryClient]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <SessionCache queryClient={queryClient} />
      {children}
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}

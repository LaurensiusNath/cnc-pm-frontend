"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { makeQueryClient } from "@/lib/queryClient";

export function Providers({ children }: { children: React.ReactNode }) {
  // Created inside useState (not at module scope) so each request/browser
  // session gets its own QueryClient - a module-level singleton would leak
  // cached data across users if this component's initial render ever runs
  // on the server (Next.js App Router renders client components on the
  // server for the first pass).
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required by the new sidebar (npx shadcn add sidebar) - its
          collapsed-state nav items render as icon-only buttons with a
          Tooltip for the label. */}
      <TooltipProvider>{children}</TooltipProvider>
    </QueryClientProvider>
  );
}

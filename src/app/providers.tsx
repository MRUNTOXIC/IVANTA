"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import DynamicSEO from "@/components/DynamicSEO";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        refetchInterval: 30000, // Refetch every 30 seconds
        staleTime: 10000, // Data is fresh for 10 seconds
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <FavoritesProvider>
          <AnalyticsProvider>
            <DynamicSEO />
            <Toaster />
            <Sonner />
            {children}
          </AnalyticsProvider>
        </FavoritesProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

"use client";

import { useAnalytics } from '@/hooks/use-analytics';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useAnalytics();
  
  return <>{children}</>;
}

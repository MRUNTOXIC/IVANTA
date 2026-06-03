"use client";

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function usePrefetchProperties() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const prefetchData = async () => {
      // Wait 2 seconds after page load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Prefetch properties for different types
      const types = ['buy', 'rent', 'commercial', 'plots', 'pg', 'new'];
      
      for (const type of types) {
        queryClient.prefetchQuery({
          queryKey: ['properties', type],
          queryFn: async () => {
            const response = await fetch(`/api/properties?type=${type}`);
            const result = await response.json();
            return result.success ? result.data : [];
          },
          staleTime: 5 * 60 * 1000,
        });
        
        // Small delay between prefetches
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    };

    prefetchData();
  }, [queryClient]);
}

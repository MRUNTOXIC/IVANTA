"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PropertyCard from "./PropertyCard";
import LoadingSkeleton from "./LoadingSkeleton";
import { useEffect, useState } from "react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

const LuxuryProperties = () => {
  const isMobile = useIsMobile();

  const { data: propertiesByCategory = {}, isLoading } = useQuery({
    queryKey: ['properties-homepage'],
    queryFn: async () => {
      const response = await fetch('/api/properties');
      const result = await response.json();
      if (result.success) {
        const grouped = result.data.reduce((acc: Record<string, any[]>, property: any) => {
          const category = property.category || 'None';
          if (!acc[category]) acc[category] = [];
          acc[category].push(property);
          return acc;
        }, {});
        return grouped;
      }
      return {};
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const getCategoryLink = (category: string) => {
    switch (category) {
      case 'Upcoming Projects':
        return '/properties?type=new';
      default:
        return `/properties?category=${encodeURIComponent(category)}`;
    }
  };

  const categoryOrder = ['Featured Property', 'Luxury Property', 'Popular Property', 'Upcoming Projects'];
  const categories = categoryOrder.filter(cat => propertiesByCategory[cat]?.length > 0);

  if (isLoading) return <LoadingSkeleton />;
  if (categories.length === 0) return null;

  return (
    <>
      {categories.map((category) => {
        const properties = propertiesByCategory[category];
        const threshold = isMobile ? 2 : 3;
        const shouldScroll = properties.length > threshold;

        return (
          <section key={category} className="py-6 sm:py-8 md:py-10 bg-background overflow-hidden">
            <div className="container mx-auto px-3 sm:px-4 lg:px-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-heading font-bold text-foreground">
                    {category}
                  </h2>
                  <p className="text-muted-foreground mt-0.5 sm:mt-1 text-xs sm:text-sm">
                    {properties.length} {properties.length === 1 ? 'property' : 'properties'} available
                  </p>
                </div>
                <Link href={getCategoryLink(category)}>
                  <Button variant="outline" className="gap-2 font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-6">
                    <span className="hidden sm:inline">See All</span>
                    <span className="sm:hidden">All</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </Link>
              </div>

              {shouldScroll ? (
                /* Scrolling marquee — cards shown once, duplicated only for seamless loop */
                <div className="relative w-full overflow-hidden">
                  <div
                    className="marquee-track"
                    style={{
                      animationDuration: `${properties.length * 4}s`,
                      gap: '1.25rem',
                      ['--marquee-copies' as any]: 2,
                    }}
                  >
                    {[...properties, ...properties].map((p: any, idx: number) => (
                      <div key={`${p._id}-${idx}`} className="flex-shrink-0 w-[44vw] sm:w-[46vw] md:w-[300px] lg:w-[320px]">
                        <PropertyCard property={p} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Static grid — no duplication */
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                  {properties.map((p: any) => (
                    <div key={p._id} className="w-full max-w-[320px] mx-auto">
                      <PropertyCard property={p} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </>
  );
};

export default LuxuryProperties;

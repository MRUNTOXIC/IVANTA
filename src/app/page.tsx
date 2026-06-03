"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LuxuryProperties from "@/components/LuxuryProperties";
import WhyChooseUs from "@/components/WhyChooseUs";
import DownloadApp from "@/components/DownloadApp";
import Footer from "@/components/Footer";
import SectionDivider from "@/components/SectionDivider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrefetchProperties } from "@/hooks/usePrefetchProperties";

export default function Home() {
  const router = useRouter();
  const [showSections, setShowSections] = useState(false);
  
  // Prefetch properties in background
  usePrefetchProperties();

  useEffect(() => {
    // Show property sections after hero loads
    const timer = setTimeout(() => {
      setShowSections(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Prefetch pages only after sections are visible
    if (!showSections) return;

    const pagesToPrefetch = [
      '/properties?type=buy',
      '/properties?type=rent',
      '/properties?type=commercial',
      '/properties?type=plots',
      '/properties?type=pg',
      '/properties?type=new',
      '/about',
      '/post-property',
      '/loans',
      '/other-services',
      '/login',
      '/luxury-properties'
    ];

    const timeoutId = setTimeout(() => {
      pagesToPrefetch.forEach(page => {
        router.prefetch(page);
      });
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [router, showSections]);

  return (
    <div className="min-h-screen bg-white"> 
      <Navbar />
      <main>
        <HeroSection />
        {showSections && (
          <>
            <SectionDivider variant="gradient" />
            <LuxuryProperties />
            <SectionDivider variant="gradient" />
            <WhyChooseUs />
            <SectionDivider variant="gradient" />
            <DownloadApp />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

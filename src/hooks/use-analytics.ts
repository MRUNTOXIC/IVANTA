"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Generate or retrieve visitor ID
const getVisitorId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let visitorId = localStorage.getItem('visitorId');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('visitorId', visitorId);
  }
  return visitorId;
};

// Generate session ID
const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// Detect device type
const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Detect browser
const getBrowser = (): string => {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Other';
};

export const useAnalytics = () => {
  const pathname = usePathname();
  const entryTimeRef = useRef<Date | null>(null);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!pathname) return;

    // Exclude admin panel pages from analytics
    if (pathname.startsWith('/admin')) return;

    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    const device = getDeviceType();
    const browser = getBrowser();
    const entryTime = new Date();
    entryTimeRef.current = entryTime;
    hasTrackedRef.current = false;

    // Track page entry
    const trackEntry = async () => {
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            visitorId,
            page: pathname,
            entryTime: entryTime.toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            device,
            browser,
          }),
        });
        hasTrackedRef.current = true;
      } catch (error) {
        console.error('Analytics tracking error:', error);
      }
    };

    trackEntry();

    // Track page exit
    const trackExit = async () => {
      if (!hasTrackedRef.current) return;
      
      const exitTime = new Date();
      try {
        await fetch('/api/analytics', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            page: pathname,
            exitTime: exitTime.toISOString(),
          }),
        });
      } catch (error) {
        console.error('Analytics exit tracking error:', error);
      }
    };

    // Track on page unload
    const handleBeforeUnload = () => {
      if (!hasTrackedRef.current) return;
      
      const exitTime = new Date();
      // Use sendBeacon for reliable tracking on page unload
      navigator.sendBeacon(
        '/api/analytics',
        JSON.stringify({
          sessionId,
          page: pathname,
          exitTime: exitTime.toISOString(),
        })
      );
    };

    // Track on visibility change (tab switch)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackExit();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      trackExit();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname]);
};

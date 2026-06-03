"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function DynamicSEOContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [seoData, setSeoData] = useState<any>(null);

  useEffect(() => {
    const fetchSEO = async () => {
      try {
        let pageUrl = pathname;
        const type = searchParams.get('type');
        if (type) {
          pageUrl = `${pathname}?type=${type}`;
        }

        const response = await fetch(`/api/seo?pageUrl=${encodeURIComponent(pageUrl)}`);
        const result = await response.json();

        if (result.success && result.data) {
          setSeoData(result.data);
        }
      } catch (error) {
        console.error('Error fetching SEO:', error);
      }
    };

    fetchSEO();
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!seoData) return;

    document.title = seoData.metaTitle;

    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      if (!content) return;
      
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    updateMetaTag('description', seoData.metaDescription);
    updateMetaTag('keywords', seoData.metaKeywords?.join(', '));
    updateMetaTag('robots', seoData.robots || 'index, follow');

    updateMetaTag('og:title', seoData.ogTitle || seoData.metaTitle, true);
    updateMetaTag('og:description', seoData.ogDescription || seoData.metaDescription, true);
    updateMetaTag('og:type', 'website', true);
    if (seoData.ogImage) {
      updateMetaTag('og:image', seoData.ogImage, true);
    }

    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', seoData.twitterTitle || seoData.metaTitle);
    updateMetaTag('twitter:description', seoData.twitterDescription || seoData.metaDescription);
    if (seoData.twitterImage) {
      updateMetaTag('twitter:image', seoData.twitterImage);
    }

    if (seoData.canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = seoData.canonicalUrl;
    }

    if (seoData.structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = seoData.structuredData;
    }
  }, [seoData]);

  return null;
}

export default function DynamicSEO() {
  return (
    <Suspense fallback={null}>
      <DynamicSEOContent />
    </Suspense>
  );
}

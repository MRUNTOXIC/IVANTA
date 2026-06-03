export async function getSEOData(pageUrl: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/seo?pageUrl=${encodeURIComponent(pageUrl)}`, {
      cache: 'no-store',
    });
    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching SEO data:', error);
    return null;
  }
}

export function generateMetadata(seoData: any) {
  if (!seoData) return {};

  const metadata: any = {
    title: seoData.metaTitle,
    description: seoData.metaDescription,
    keywords: seoData.metaKeywords,
  };

  if (seoData.robots) {
    metadata.robots = seoData.robots;
  }

  if (seoData.canonicalUrl) {
    metadata.alternates = {
      canonical: seoData.canonicalUrl,
    };
  }

  metadata.openGraph = {
    title: seoData.ogTitle || seoData.metaTitle,
    description: seoData.ogDescription || seoData.metaDescription,
    type: 'website',
  };

  if (seoData.ogImage) {
    metadata.openGraph.images = [seoData.ogImage];
  }

  metadata.twitter = {
    card: 'summary_large_image',
    title: seoData.twitterTitle || seoData.metaTitle,
    description: seoData.twitterDescription || seoData.metaDescription,
  };

  if (seoData.twitterImage) {
    metadata.twitter.images = [seoData.twitterImage];
  }

  return metadata;
}

import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "IvantaProperty — Find Your Dream Property",
  description: "Discover premium properties — buy, rent, or invest with confidence. Luxury listings, transparent deals, and complete real estate services.",
  authors: [{ name: "IvantaProperty" }],
  openGraph: {
    title: "IvantaProperty — Premium Real Estate",
    description: "Discover premium properties — buy, rent, or invest with confidence.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* LocalBusiness / RealEstateAgent Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          "name": "Ivanta Property",
          "image": "https://ivantaproperty.com/IvantaLogo.png",
          "@id": "",
          "url": "https://ivantaproperty.com/",
          "telephone": "+918460567890",
          "priceRange": "₹₹",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Ivanta Ventures LLP, 903, Sanskar Heights, Umiya Circle, 150 Ft Ring Road, Mavdi",
            "addressLocality": "Rajkot",
            "postalCode": "360004",
            "addressCountry": "IN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 22.2615401,
            "longitude": 70.78649109999999
          },
          "openingHoursSpecification": [
            { "@type": "OpeningHoursSpecification", "dayOfWeek": "Monday",    "opens": "09:00", "closes": "19:00" },
            { "@type": "OpeningHoursSpecification", "dayOfWeek": "Tuesday",   "opens": "09:00", "closes": "19:00" },
            { "@type": "OpeningHoursSpecification", "dayOfWeek": "Wednesday", "opens": "09:00", "closes": "19:00" },
            { "@type": "OpeningHoursSpecification", "dayOfWeek": "Thursday",  "opens": "09:00", "closes": "19:00" },
            { "@type": "OpeningHoursSpecification", "dayOfWeek": "Friday",    "opens": "09:00", "closes": "19:00" },
            { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday",  "opens": "09:00", "closes": "19:00" }
          ]
        })}} />

        {/* FAQPage Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": {
            "@type": "Question",
            "name": "What is the rent for a 2 BHK flat in Rajkot",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "2 BHK flats on rent in Rajkot typically range from ₹8,000 to ₹18,000 per month depending on locality and furnishing. Ivanta Property has 100+ verified options."
            }
          }
        })}} />

        {/* BreadcrumbList Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home",             "item": "https://ivantaproperty.com" },
            { "@type": "ListItem", "position": 2, "name": "Residential",      "item": "https://ivantaproperty.com/properties?type=buy" },
            { "@type": "ListItem", "position": 3, "name": "Commercial",       "item": "https://ivantaproperty.com/properties?type=commercial" },
            { "@type": "ListItem", "position": 4, "name": "Plots/ Lands",     "item": "https://ivantaproperty.com/properties?type=plots" },
            { "@type": "ListItem", "position": 5, "name": "Rentals",          "item": "https://ivantaproperty.com/properties?type=rent" },
            { "@type": "ListItem", "position": 6, "name": "Builder Projects", "item": "https://ivantaproperty.com/properties?type=new" },
            { "@type": "ListItem", "position": 7, "name": "Loans",            "item": "https://ivantaproperty.com/loans" },
            { "@type": "ListItem", "position": 8, "name": "About Us",         "item": "https://ivantaproperty.com/about" },
            { "@type": "ListItem", "position": 9, "name": "Login",            "item": "https://ivantaproperty.com/login" }
          ]
        })}} />

        {/* Organization Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Ivanta Ventures LLP",
          "url": "https://ivantaproperty.com/",
          "logo": "https://ivantaproperty.com/IvantaLogo.png",
          "sameAs": [
            "https://www.facebook.com/IvantaProperty/",
            "https://www.instagram.com/ivantaproperty/",
            "https://www.linkedin.com/company/ivanta-property/"
          ]
        })}} />

        <script async src="https://www.googletagmanager.com/gtag/js?id=G-KJ22N8WJ6H"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-KJ22N8WJ6H');
        `}} />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var params = new URLSearchParams(window.location.search);
            if (params.get('source') === 'app') {
              sessionStorage.setItem('source', 'app');
            }
          })();
        `}} />
      </head>
      <body className="font-body antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function SubdomainPropertyPage() {
  const params = useParams();
  const subdomain = params?.subdomain as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPropertyBySubdomain = async () => {
      try {
        const response = await fetch(`/api/properties?subdomain=${subdomain}`);
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          const property = result.data[0];
          // Use replace to avoid back button issues
          window.location.replace(`/property/${property._id}`);
        } else {
          toast.error("Property not found");
          setTimeout(() => {
            window.location.replace("/properties");
          }, 2000);
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        toast.error("Failed to load property");
        setTimeout(() => {
          window.location.replace("/properties");
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    if (subdomain) {
      fetchPropertyBySubdomain();
    }
  }, [subdomain]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to property...</p>
        </div>
      </div>
    );
  }

  return null;
}

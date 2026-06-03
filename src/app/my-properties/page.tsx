"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, CheckCircle, XCircle, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

interface Property {
  _id: string;
  title: string;
  price: string;
  priceFrom?: string;
  priceTo?: string;
  propertyType: string;
  subType: string;
  area: string;
  city: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  isSold?: boolean;
  soldDate?: string;
  createdAt: string;
}

export default function MyPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [markingAsSold, setMarkingAsSold] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      toast.error("Please enter your email first", {
        description: "You need to provide your email to view your properties.",
        duration: 4000,
      });
      router.push("/post-property");
      return;
    }
    setUserEmail(email);
    fetchMyProperties(email);
  }, [router]);

  const fetchMyProperties = async (email: string) => {
    try {
      const response = await fetch(`/api/properties?userEmail=${email}&status=all`);
      const result = await response.json();
      
      if (result.success) {
        setProperties(result.data);
      } else {
        toast.error("Failed to load properties", {
          description: result.error,
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Something went wrong", {
        description: "Failed to load your properties.",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsSold = async (propertyId: string) => {
    setMarkingAsSold(propertyId);
    
    try {
      const response = await fetch(`/api/properties/${propertyId}/sold`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Property Marked as Sold!", {
          description: "Your property will be visible for 10 more days.",
          duration: 4000,
        });
        fetchMyProperties(userEmail);
      } else {
        toast.error("Failed to mark as sold", {
          description: result.error,
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error marking as sold:", error);
      toast.error("Something went wrong", {
        description: "Failed to mark property as sold.",
        duration: 4000,
      });
    } finally {
      setMarkingAsSold(null);
    }
  };

  const handleUnmarkAsSold = async (propertyId: string) => {
    setMarkingAsSold(propertyId);
    
    try {
      const response = await fetch(`/api/properties/${propertyId}/sold?userEmail=${userEmail}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Property Unmarked!", {
          description: "Your property is now active again.",
          duration: 4000,
        });
        fetchMyProperties(userEmail);
      } else {
        toast.error("Failed to unmark", {
          description: result.error,
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error unmarking:", error);
      toast.error("Something went wrong", {
        description: "Failed to unmark property.",
        duration: 4000,
      });
    } finally {
      setMarkingAsSold(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getDaysRemaining = (soldDate: string) => {
    const sold = new Date(soldDate);
    const now = new Date();
    const diffTime = 10 * 24 * 60 * 60 * 1000 - (now.getTime() - sold.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground">My Properties</h1>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-6 py-8 max-w-6xl">
        {properties.length === 0 ? (
          <div className="text-center py-16">
            <Home className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">No Properties Found</h2>
            <p className="text-muted-foreground mb-6">You haven't submitted any properties yet.</p>
            <Button
              onClick={() => router.push("/post-property")}
              className="gradient-primary text-primary-foreground"
            >
              Post Your First Property
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold text-foreground">
                Your Properties ({properties.length})
              </h2>
              <Button
                onClick={() => router.push("/post-property")}
                className="gradient-primary text-primary-foreground"
              >
                Post New Property
              </Button>
            </div>

            {properties.map((property) => (
              <div
                key={property._id}
                className="bg-card rounded-xl border border-border card-shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Property Image */}
                  <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    {property.images && property.images.length > 0 ? (
                      <Image
                        src={property.images[0]}
                        alt={property.title}
                        width={192}
                        height={192}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Property Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-heading font-bold text-foreground mb-1">
                          {property.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {property.subType} • {property.area}, {property.city}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(property.status)}
                        {property.isSold && (
                          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                            <Tag className="w-3 h-3" />
                            SOLD
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-2xl font-bold text-primary">
                        {property.priceFrom && property.priceTo
                          ? `${property.priceFrom} - ${property.priceTo}`
                          : property.price}
                      </p>
                    </div>

                    {property.isSold && property.soldDate && (
                      <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-orange-700">
                          <strong>Sold Property:</strong> Will be removed in {getDaysRemaining(property.soldDate)} days
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      {property.status === "approved" && !property.isSold && (
                        <Button
                          onClick={() => handleMarkAsSold(property._id)}
                          disabled={markingAsSold === property._id}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          {markingAsSold === property._id ? "Marking..." : "Mark as Sold"}
                        </Button>
                      )}
                      
                      {property.isSold && (
                        <Button
                          onClick={() => handleUnmarkAsSold(property._id)}
                          disabled={markingAsSold === property._id}
                          variant="outline"
                        >
                          {markingAsSold === property._id ? "Unmarking..." : "Unmark as Sold"}
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        onClick={() => router.push(`/property/${property._id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

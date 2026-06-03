"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, Check, X, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ApprovalsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingProperties, setPendingProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    if (auth !== "true") {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
      fetchPendingProperties();
    }
  }, [router]);

  const fetchPendingProperties = async () => {
    try {
      const response = await fetch('/api/properties?status=pending');
      const result = await response.json();
      
      if (result.success) {
        setPendingProperties(result.data);
      }
    } catch (error) {
      console.error('Error fetching pending properties:', error);
      toast.error('Failed to load pending properties');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Property approved successfully!');
        fetchPendingProperties();
      } else {
        toast.error('Failed to approve property');
      }
    } catch (error) {
      console.error('Error approving property:', error);
      toast.error('Something went wrong');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Property rejected');
        fetchPendingProperties();
      } else {
        toast.error('Failed to reject property');
      }
    } catch (error) {
      console.error('Error rejecting property:', error);
      toast.error('Something went wrong');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/dashboard")}
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
              <h1 className="text-xl font-heading font-bold text-foreground">Property Approvals</h1>
              <p className="text-xs text-muted-foreground">
                Review and approve user-submitted properties
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-6 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div>Loading pending properties...</div>
          </div>
        ) : pendingProperties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No pending properties to review</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {pendingProperties.map((property) => (
              <div key={property._id} className="bg-card rounded-xl border border-border card-shadow p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Property Image */}
                  <div className="w-full md:w-64 h-48 rounded-lg overflow-hidden bg-secondary shrink-0">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Property Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-heading font-bold text-foreground mb-1">
                          {property.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {property.area}, {property.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{property.price}</p>
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full mt-1">
                          Pending
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Type</p>
                        <p className="text-sm font-medium text-foreground">{property.propertyType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Sub Type</p>
                        <p className="text-sm font-medium text-foreground">{property.subType || 'N/A'}</p>
                      </div>
                      {property.beds && property.beds.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">Bedrooms</p>
                          <p className="text-sm font-medium text-foreground">
                            {Array.isArray(property.beds) ? property.beds.join(', ') : property.beds}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground">Area</p>
                        <p className="text-sm font-medium text-foreground">{property.sqft}</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {property.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => router.push(`/admin/dashboard/edit-property/${property._id}`)}
                        variant="outline"
                        className="gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleApprove(property._id)}
                        className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(property._id)}
                        variant="destructive"
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
                        Reject
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

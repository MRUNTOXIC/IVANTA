"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Building2, Clock, CheckCircle, XCircle, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MyPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [markingAsSold, setMarkingAsSold] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; propertyId: string; title: string }>({ 
    open: false, 
    propertyId: '', 
    title: '' 
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUserEmail(data.data.email);
        fetchUserProperties(data.data.email);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      router.push('/login');
    }
  };

  const fetchUserProperties = async (email: string) => {
    try {
      const response = await fetch(`/api/user-properties?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        setProperties(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsSold = async (propertyId: string) => {
    setConfirmDialog({ open: false, propertyId: '', title: '' });
    setMarkingAsSold(propertyId);
    try {
      const response = await fetch(`/api/properties/${propertyId}/sold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail }),
      });
      const result = await response.json();
      if (result.success) {
        fetchUserProperties(userEmail);
      }
    } catch (error) {
      console.error('Error marking as sold:', error);
    } finally {
      setMarkingAsSold(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 lg:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
                My Properties
              </h1>
              <p className="text-muted-foreground">
                View and manage your property submissions
              </p>
            </div>
            <Button
              onClick={() => router.push("/post-property")}
              className="gradient-primary text-primary-foreground gap-2"
            >
              <Building2 className="w-4 h-4" />
              Post New Property
            </Button>
          </div>
        </div>

        {/* Properties List */}
        {properties.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-heading font-bold text-foreground mb-2">
              No Properties Yet
            </h3>
            <p className="text-muted-foreground mb-6">
              You haven't submitted any properties. Start by posting your first property!
            </p>
            <Button
              onClick={() => router.push("/post-property")}
              className="gradient-primary text-primary-foreground gap-2"
            >
              <Building2 className="w-4 h-4" />
              Post Property
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {properties.map((property) => (
              <div key={property._id} className="bg-card rounded-xl border border-border card-shadow hover:card-shadow-hover transition-all">
                <div className="flex flex-col md:flex-row gap-6 p-6">
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
                        <Building2 className="w-12 h-12" />
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
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-lg font-bold text-primary">{property.price}</p>
                        {getStatusBadge(property.status)}
                        {property.isSold && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <Tag className="w-3 h-3" />
                            SOLD
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Type</p>
                        <p className="text-sm font-medium text-foreground capitalize">{property.propertyType}</p>
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

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Submitted on {new Date(property.createdAt).toLocaleDateString()}</span>
                        {property.status === 'pending' && (
                          <>
                            <span>•</span>
                            <span>Awaiting admin approval</span>
                          </>
                        )}
                        {property.status === 'approved' && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 font-medium">Live on website</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {property.status === 'approved' && !property.isSold && (
                          <Button
                            onClick={() => setConfirmDialog({ open: true, propertyId: property._id, title: property.title })}
                            disabled={markingAsSold === property._id}
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            {markingAsSold === property._id ? "Marking..." : "Mark as Sold"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Property as Sold?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark "{confirmDialog.title}" as sold? The property will remain visible for 10 days before being automatically removed from public listings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleMarkAsSold(confirmDialog.propertyId)} className="bg-orange-600 hover:bg-orange-700">
              Mark as Sold
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}

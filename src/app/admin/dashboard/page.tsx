"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, Users, Building2, TrendingUp, LogOut, Plus, Edit, Trash2, UserCog, Settings, Eye, Clock, Monitor, Smartphone, Tablet, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; title: string }>({ open: false, id: '', title: '' });
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    if (auth !== "true") {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProperties();
      fetchPendingCount();
      fetchAnalytics();
    }
  }, [isAuthenticated]);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties');
      const result = await response.json();
      
      if (result.success) {
        setProperties(result.data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const response = await fetch('/api/properties?status=pending');
      const result = await response.json();
      
      if (result.success) {
        setPendingCount(result.data.length);
      }
    } catch (error) {
      console.error('Error fetching pending count:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics?type=summary&days=30');
      const result = await response.json();
      
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteDialog({ open: true, id, title });
  };

  const handleDeleteConfirm = async () => {
    const { id } = deleteDialog;
    setDeleteDialog({ open: false, id: '', title: '' });

    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Property Deleted', {
          description: 'The property has been successfully removed.',
          duration: 4000,
        });
        fetchProperties();
      } else {
        toast.error('Failed to Delete', {
          description: result.error || 'An error occurred while deleting the property.',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Something Went Wrong', {
        description: 'Failed to delete property. Please try again.',
        duration: 5000,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    router.push("/admin/login");
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (!isAuthenticated) {
    return null;
  }

  const filteredProperties = properties.filter(property => {
    const query = searchQuery.toLowerCase();
    return (
      property.title?.toLowerCase().includes(query) ||
      property.area?.toLowerCase().includes(query) ||
      property.city?.toLowerCase().includes(query) ||
      property.propertyType?.toLowerCase().includes(query) ||
      property.subType?.toLowerCase().includes(query) ||
      property.price?.toLowerCase().includes(query)
    );
  });

  const stats = [
    { 
      label: "Total Properties", 
      value: properties.length, 
      icon: Building2, 
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      label: "Unique Visitors", 
      value: analyticsLoading ? '...' : (analytics?.uniqueVisitors || 0).toLocaleString(), 
      icon: Users, 
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    { 
      label: "Total Page Views", 
      value: analyticsLoading ? '...' : (analytics?.totalVisits || 0).toLocaleString(), 
      icon: Eye, 
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    { 
      label: "Avg. Stay Time", 
      value: analyticsLoading ? '...' : formatDuration(analytics?.avgDuration || 0), 
      icon: Clock, 
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">IvantaProperty Management - Role: Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard/settings">
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-6 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link href="/admin/dashboard/analytics">
            <div className="bg-card rounded-xl p-6 border border-border card-shadow hover:card-shadow-hover transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-foreground">Analytics</h3>
                  <p className="text-sm text-muted-foreground">View detailed insights</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/admin/dashboard/requirement-forms">
            <div className="bg-card rounded-xl p-6 border border-border card-shadow hover:card-shadow-hover transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-foreground">Requirement Forms</h3>
                  <p className="text-sm text-muted-foreground">View property inquiries</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/admin/dashboard/add-property">
            <div className="bg-card rounded-xl p-6 border border-border card-shadow hover:card-shadow-hover transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-foreground">Add Property</h3>
                  <p className="text-sm text-muted-foreground">Create new property listing</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/admin/dashboard/approvals">
            <div className="bg-card rounded-xl p-6 border border-border card-shadow hover:card-shadow-hover transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform relative">
                  <Building2 className="w-6 h-6 text-yellow-600" />
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {pendingCount}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-foreground">Approvals</h3>
                  <p className="text-sm text-muted-foreground">Review user submissions</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/admin/dashboard/role-management">
            <div className="bg-card rounded-xl p-6 border border-border card-shadow hover:card-shadow-hover transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCog className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-foreground">Role Management</h3>
                  <p className="text-sm text-muted-foreground">Manage user roles & permissions</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/admin/dashboard/seo">
            <div className="bg-card rounded-xl p-6 border border-border card-shadow hover:card-shadow-hover transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-foreground">SEO Management</h3>
                  <p className="text-sm text-muted-foreground">Manage meta tags & SEO</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-6 border border-border card-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Analytics Section */}
        {!analyticsLoading && analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Device Breakdown */}
            <div className="bg-card rounded-xl border border-border card-shadow p-6">
              <h3 className="text-lg font-heading font-bold text-foreground mb-4">Device Breakdown</h3>
              <div className="space-y-3">
                {analytics.deviceBreakdown?.map((device: any) => {
                  const total = analytics.totalVisits;
                  const percentage = total > 0 ? ((device.count / total) * 100).toFixed(1) : 0;
                  const Icon = device._id === 'mobile' ? Smartphone : device._id === 'tablet' ? Tablet : Monitor;
                  
                  return (
                    <div key={device._id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground capitalize">{device._id}</span>
                          <span className="text-sm text-muted-foreground">{device.count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-card rounded-xl border border-border card-shadow p-6">
              <h3 className="text-lg font-heading font-bold text-foreground mb-4">Top Pages</h3>
              <div className="space-y-3">
                {analytics.pageViews?.slice(0, 5).map((page: any, index: number) => (
                  <div key={page._id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{page._id || '/'}</p>
                      <p className="text-xs text-muted-foreground">{page.count} views</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Properties Management */}
        <div className="bg-card rounded-xl border border-border card-shadow">
          <div className="p-6 border-b border-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground">Properties</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage all property listings</p>
              </div>
              <Link href="/admin/dashboard/add-property">
                <Button className="gradient-primary text-primary-foreground gap-2">
                  <Plus className="w-4 h-4" />
                  Add Property
                </Button>
              </Link>
            </div>
            
            {/* Search Bar */}
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by title, location, type, or price..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <span className="text-sm font-medium">Clear</span>
                </button>
              )}
            </div>
            
            {/* Results Count */}
            {searchQuery && (
              <p className="mt-3 text-sm text-muted-foreground">
                Found {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
              </p>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading properties...</div>
          ) : filteredProperties.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchQuery ? `No properties found matching "${searchQuery}"` : 'No properties found. Add your first property!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Property</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Location</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Price</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Type</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Status</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProperties.map((property) => {
                    const image = property.images && property.images.length > 0 ? property.images[0] : '/placeholder.svg';
                    const location = `${property.area}, ${property.city}`;
                    
                    return (
                      <tr key={property._id} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={image} alt={property.title} className="w-12 h-12 rounded-lg object-cover" />
                            <div>
                              <p className="font-medium text-foreground text-sm">{property.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {property.beds && `${property.beds} beds`}
                                {property.beds && property.baths && ' • '}
                                {property.baths && `${property.baths} baths`}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{location}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-foreground">
                          {property.priceFrom
                            ? `₹${property.priceFrom} - ₹${property.priceTo || '...'}`
                            : property.price
                            ? `₹${property.price}`
                            : 'Call for Price'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                            {property.propertyType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => router.push(`/admin/dashboard/edit-property/${property._id}`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(property._id, property.title)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, LogOut, FileText, Phone, Mail, MapPin, Calendar, IndianRupee, Bed, Maximize, Trash2 } from "lucide-react";
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

export default function RequirementFormsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; email: string }>({ open: false, id: '', email: '' });

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
      fetchForms();
    }
  }, [isAuthenticated]);

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/requirement-forms');
      const result = await response.json();
      
      if (result.success) {
        setForms(result.data);
      }
    } catch (error) {
      console.error('Error fetching requirement forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string, email: string) => {
    setDeleteDialog({ open: true, id, email });
  };

  const handleDeleteConfirm = async () => {
    const { id } = deleteDialog;
    setDeleteDialog({ open: false, id: '', email: '' });

    try {
      const response = await fetch(`/api/requirement-forms/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Form Deleted', {
          description: 'The requirement form has been successfully removed.',
          duration: 4000,
        });
        fetchForms();
      } else {
        toast.error('Failed to Delete', {
          description: result.error || 'An error occurred while deleting the form.',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.error('Something Went Wrong', {
        description: 'Failed to delete form. Please try again.',
        duration: 5000,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    router.push("/admin/login");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBudget = (from: string, to: string) => {
    if (!from && !to) return 'Not specified';
    if (!from) return `Up to ₹${parseInt(to).toLocaleString('en-IN')}`;
    if (!to) return `From ₹${parseInt(from).toLocaleString('en-IN')}`;
    return `₹${parseInt(from).toLocaleString('en-IN')} - ₹${parseInt(to).toLocaleString('en-IN')}`;
  };

  if (!isAuthenticated) {
    return null;
  }

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
              <h1 className="text-xl font-heading font-bold text-foreground">Requirement Forms</h1>
              <p className="text-xs text-muted-foreground">View all property requirement submissions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                Back to Dashboard
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
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-card rounded-xl p-6 border border-border card-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{forms.length}</p>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border card-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{forms.filter(f => f.status === 'new').length}</p>
                <p className="text-sm text-muted-foreground">New Inquiries</p>
              </div>
            </div>
          </div>
        </div>

        {/* Forms List */}
        <div className="bg-card rounded-xl border border-border card-shadow">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-heading font-bold text-foreground">All Requirement Forms</h2>
            <p className="text-sm text-muted-foreground mt-1">Property inquiries from potential buyers and renters</p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading requirement forms...</div>
          ) : forms.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No requirement forms submitted yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {forms.map((form) => (
                <div key={form._id} className="p-6 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                            {form.lookingFor}
                          </span>
                          {form.status === 'new' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted on {formatDate(form.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteClick(form._id, form.email)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground font-medium">{form.contactNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{form.email}</span>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="space-y-2">
                      {form.propertyType && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Type: </span>
                          <span className="text-foreground font-medium capitalize">{form.propertyType}</span>
                        </div>
                      )}
                      {form.propertySubType && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Sub Type: </span>
                          <span className="text-foreground">{form.propertySubType}</span>
                        </div>
                      )}
                      {form.bhk && (
                        <div className="flex items-center gap-2 text-sm">
                          <Bed className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{form.bhk}</span>
                        </div>
                      )}
                      {form.sqft && (
                        <div className="flex items-center gap-2 text-sm">
                          <Maximize className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{form.sqft} sq.ft.</span>
                        </div>
                      )}
                    </div>

                    {/* Budget & Location */}
                    <div className="space-y-2">
                      {(form.budgetFrom || form.budgetTo) && (
                        <div className="flex items-center gap-2 text-sm">
                          <IndianRupee className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{formatBudget(form.budgetFrom, form.budgetTo)}</span>
                        </div>
                      )}
                      {form.areas && form.areas.length > 0 && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <span className="text-foreground">{form.areas.join(', ')}</span>
                        </div>
                      )}
                      {form.timeframe && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{new Date(form.timeframe).toLocaleDateString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Requirement Form?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the requirement form from "{deleteDialog.email}"? This action cannot be undone.
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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, ArrowLeft, Plus, Edit, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface SEOData {
  _id?: string;
  pageName: string;
  pageUrl: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  robots?: string;
  structuredData?: string;
}

const defaultPages = [
  { name: "Home", url: "/" },
  { name: "Properties - Buy", url: "/properties?type=buy" },
  { name: "Properties - Rent", url: "/properties?type=rent" },
  { name: "Properties - Commercial", url: "/properties?type=commercial" },
  { name: "Properties - Plots", url: "/properties?type=plots" },
  { name: "Properties - PG", url: "/properties?type=pg" },
  { name: "Properties - New Projects", url: "/properties?type=new" },
  { name: "Luxury Properties", url: "/luxury-properties" },
  { name: "About Us", url: "/about" },
  { name: "Post Property", url: "/post-property" },
  { name: "Loans", url: "/loans" },
  { name: "Other Services", url: "/other-services" },
];

export default function SEOManagement() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [seoData, setSeoData] = useState<SEOData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const [editingData, setEditingData] = useState<SEOData | null>(null);
  const [keywordInput, setKeywordInput] = useState("");

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
      fetchSEOData();
    }
  }, [isAuthenticated]);

  const fetchSEOData = async () => {
    try {
      const response = await fetch('/api/seo');
      const result = await response.json();
      if (result.success) {
        setSeoData(result.data);
      }
    } catch (error) {
      console.error('Error fetching SEO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (data?: SEOData) => {
    if (data) {
      setEditingData(data);
      setKeywordInput(data.metaKeywords?.join(", ") || "");
    } else {
      setEditingData({
        pageName: "",
        pageUrl: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: [],
        robots: "index, follow",
      });
      setKeywordInput("");
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingData(null);
    setKeywordInput("");
  };

  const handleSave = async () => {
    if (!editingData) return;

    const keywords = keywordInput.split(",").map(k => k.trim()).filter(k => k);
    const dataToSave = { ...editingData, metaKeywords: keywords };

    try {
      const method = editingData._id ? 'PUT' : 'POST';
      const response = await fetch('/api/seo', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingData._id ? 'SEO Updated' : 'SEO Created', {
          description: 'SEO data has been saved successfully.',
        });
        fetchSEOData();
        handleCloseDialog();
      } else {
        toast.error('Failed to Save', {
          description: result.error || 'An error occurred.',
        });
      }
    } catch (error) {
      console.error('Error saving SEO data:', error);
      toast.error('Something Went Wrong', {
        description: 'Failed to save SEO data.',
      });
    }
  };

  const handleDelete = async () => {
    const { id } = deleteDialog;
    setDeleteDialog({ open: false, id: '', name: '' });

    try {
      const response = await fetch(`/api/seo?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('SEO Deleted', {
          description: 'SEO data has been removed.',
        });
        fetchSEOData();
      } else {
        toast.error('Failed to Delete', {
          description: result.error || 'An error occurred.',
        });
      }
    } catch (error) {
      console.error('Error deleting SEO data:', error);
      toast.error('Something Went Wrong');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground">SEO Management</h1>
              <p className="text-xs text-muted-foreground">Manage meta tags and SEO settings</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-6 py-8">
        <div className="bg-card rounded-xl border border-border card-shadow">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground">Page SEO Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">Configure SEO for each page</p>
              </div>
              <Button onClick={() => handleOpenDialog()} className="gradient-primary text-primary-foreground gap-2">
                <Plus className="w-4 h-4" />
                Add Page SEO
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading SEO data...</div>
          ) : seoData.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No SEO data found. Add SEO settings for your pages.</p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Suggested pages:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {defaultPages.map((page) => (
                    <Button
                      key={page.url}
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog({ pageName: page.name, pageUrl: page.url, metaTitle: "", metaDescription: "", metaKeywords: [], robots: "index, follow" })}
                    >
                      {page.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Page Name</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">URL</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Meta Title</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Meta Description</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {seoData.map((data) => (
                    <tr key={data._id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{data.pageName}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{data.pageUrl}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">{data.metaTitle}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground max-w-md truncate">{data.metaDescription}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleOpenDialog(data)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => setDeleteDialog({ open: true, id: data._id!, name: data.pageName })}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingData?._id ? 'Edit' : 'Add'} Page SEO</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pageName">Page Name *</Label>
                <Input id="pageName" value={editingData?.pageName || ""} onChange={(e) => setEditingData({ ...editingData!, pageName: e.target.value })} placeholder="Home" />
              </div>
              <div>
                <Label htmlFor="pageUrl">Page URL *</Label>
                <Input id="pageUrl" value={editingData?.pageUrl || ""} onChange={(e) => setEditingData({ ...editingData!, pageUrl: e.target.value })} placeholder="/" />
              </div>
            </div>

            <div>
              <Label htmlFor="metaTitle">Meta Title *</Label>
              <Input id="metaTitle" value={editingData?.metaTitle || ""} onChange={(e) => setEditingData({ ...editingData!, metaTitle: e.target.value })} placeholder="IvantaProperty — Find Your Dream Property" />
              <p className="text-xs text-muted-foreground mt-1">Recommended: 50-60 characters</p>
            </div>

            <div>
              <Label htmlFor="metaDescription">Meta Description *</Label>
              <Textarea id="metaDescription" value={editingData?.metaDescription || ""} onChange={(e) => setEditingData({ ...editingData!, metaDescription: e.target.value })} placeholder="Discover premium properties..." rows={3} />
              <p className="text-xs text-muted-foreground mt-1">Recommended: 150-160 characters</p>
            </div>

            <div>
              <Label htmlFor="metaKeywords">Meta Keywords (comma-separated)</Label>
              <Input id="metaKeywords" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} placeholder="real estate, property, buy, rent" />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Open Graph (Facebook)</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="ogTitle">OG Title</Label>
                  <Input id="ogTitle" value={editingData?.ogTitle || ""} onChange={(e) => setEditingData({ ...editingData!, ogTitle: e.target.value })} placeholder="Leave empty to use Meta Title" />
                </div>
                <div>
                  <Label htmlFor="ogDescription">OG Description</Label>
                  <Textarea id="ogDescription" value={editingData?.ogDescription || ""} onChange={(e) => setEditingData({ ...editingData!, ogDescription: e.target.value })} placeholder="Leave empty to use Meta Description" rows={2} />
                </div>
                <div>
                  <Label htmlFor="ogImage">OG Image URL</Label>
                  <Input id="ogImage" value={editingData?.ogImage || ""} onChange={(e) => setEditingData({ ...editingData!, ogImage: e.target.value })} placeholder="https://example.com/image.jpg" />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Twitter Card</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="twitterTitle">Twitter Title</Label>
                  <Input id="twitterTitle" value={editingData?.twitterTitle || ""} onChange={(e) => setEditingData({ ...editingData!, twitterTitle: e.target.value })} placeholder="Leave empty to use Meta Title" />
                </div>
                <div>
                  <Label htmlFor="twitterDescription">Twitter Description</Label>
                  <Textarea id="twitterDescription" value={editingData?.twitterDescription || ""} onChange={(e) => setEditingData({ ...editingData!, twitterDescription: e.target.value })} placeholder="Leave empty to use Meta Description" rows={2} />
                </div>
                <div>
                  <Label htmlFor="twitterImage">Twitter Image URL</Label>
                  <Input id="twitterImage" value={editingData?.twitterImage || ""} onChange={(e) => setEditingData({ ...editingData!, twitterImage: e.target.value })} placeholder="https://example.com/image.jpg" />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Advanced Settings</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="canonicalUrl">Canonical URL</Label>
                  <Input id="canonicalUrl" value={editingData?.canonicalUrl || ""} onChange={(e) => setEditingData({ ...editingData!, canonicalUrl: e.target.value })} placeholder="https://ivantaproperty.com/" />
                </div>
                <div>
                  <Label htmlFor="robots">Robots Meta Tag</Label>
                  <Input id="robots" value={editingData?.robots || ""} onChange={(e) => setEditingData({ ...editingData!, robots: e.target.value })} placeholder="index, follow" />
                </div>
                <div>
                  <Label htmlFor="structuredData">Structured Data (JSON-LD)</Label>
                  <Textarea id="structuredData" value={editingData?.structuredData || ""} onChange={(e) => setEditingData({ ...editingData!, structuredData: e.target.value })} placeholder='{"@context": "https://schema.org", ...}' rows={4} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCloseDialog}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="gradient-primary text-primary-foreground">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete SEO Data?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete SEO data for "{deleteDialog.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

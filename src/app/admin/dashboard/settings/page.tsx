"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [areas, setAreas] = useState<string[]>([]);
  const [newArea, setNewArea] = useState("");
  const [landmarks, setLandmarks] = useState<string[]>([]);
  const [newLandmark, setNewLandmark] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
      fetchSettings();
    }
  }, [isAuthenticated]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const result = await response.json();
      
      if (result.success) {
        setAreas(result.data.areas || []);
        setLandmarks(result.data.landmarks || []);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to Load Settings', {
        description: 'An error occurred while loading settings.',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddArea = () => {
    const trimmedArea = newArea.trim();
    
    if (!trimmedArea) {
      toast.error('Invalid Input', {
        description: 'Please enter an area name.',
        duration: 3000,
      });
      return;
    }

    if (areas.includes(trimmedArea)) {
      toast.error('Duplicate Area', {
        description: 'This area already exists.',
        duration: 3000,
      });
      return;
    }

    setAreas([...areas, trimmedArea]);
    setNewArea("");
    toast.success('Area Added', {
      description: 'Don\'t forget to save changes!',
      duration: 3000,
    });
  };

  const handleRemoveArea = (index: number) => {
    const updatedAreas = areas.filter((_, i) => i !== index);
    setAreas(updatedAreas);
    toast.success('Area Removed', {
      description: 'Don\'t forget to save changes!',
      duration: 3000,
    });
  };

  const handleAddLandmark = () => {
    const trimmedLandmark = newLandmark.trim();
    
    if (!trimmedLandmark) {
      toast.error('Invalid Input', {
        description: 'Please enter a landmark name.',
        duration: 3000,
      });
      return;
    }

    if (landmarks.includes(trimmedLandmark)) {
      toast.error('Duplicate Landmark', {
        description: 'This landmark already exists.',
        duration: 3000,
      });
      return;
    }

    setLandmarks([...landmarks, trimmedLandmark]);
    setNewLandmark("");
    toast.success('Landmark Added', {
      description: 'Don\'t forget to save changes!',
      duration: 3000,
    });
  };

  const handleRemoveLandmark = (index: number) => {
    const updatedLandmarks = landmarks.filter((_, i) => i !== index);
    setLandmarks(updatedLandmarks);
    toast.success('Landmark Removed', {
      description: 'Don\'t forget to save changes!',
      duration: 3000,
    });
  };

  const handleSave = async () => {
    if (areas.length === 0 && landmarks.length === 0) {
      toast.error('No Data', {
        description: 'Please add at least one area or landmark.',
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ areas, landmarks }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Settings Saved!', {
          description: 'Settings have been updated successfully.',
          duration: 4000,
        });
      } else {
        toast.error('Failed to Save', {
          description: result.error || 'An error occurred while saving settings.',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Something Went Wrong', {
        description: 'Failed to save settings. Please try again.',
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
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
            onClick={() => router.push("/admin/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground">Settings</h1>
              <p className="text-xs text-muted-foreground">Manage areas and landmarks</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-6 py-8 max-w-4xl">
        {/* Area Management */}
        <div className="bg-card rounded-xl border border-border card-shadow p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">Area Dropdown Management</h2>
            <p className="text-sm text-muted-foreground">
              Add or remove areas that will appear in the area dropdown when adding/editing properties.
            </p>
          </div>

          {/* Add New Area */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block">Add New Area</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddArea()}
                placeholder="e.g., Satellite Road"
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <Button
                onClick={handleAddArea}
                className="gradient-primary text-primary-foreground gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </div>

          {/* Areas List */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-3 block">
              Current Areas ({areas.length})
            </label>
            {areas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No areas added yet. Add your first area above.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {areas.map((area, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors"
                  >
                    <span className="text-sm font-medium text-foreground">{area}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveArea(index)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Landmark Management */}
        <div className="bg-card rounded-xl border border-border card-shadow p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-lg font-heading font-bold text-foreground mb-2">Landmark Management</h2>
            <p className="text-sm text-muted-foreground">
              Add or remove landmarks (schools, hospitals, etc.) that can be added to properties with distance.
            </p>
          </div>

          {/* Add New Landmark */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block">Add New Landmark</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLandmark}
                onChange={(e) => setNewLandmark(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddLandmark()}
                placeholder="e.g., School, Hospital, Mall"
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <Button
                onClick={handleAddLandmark}
                className="gradient-primary text-primary-foreground gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </div>

          {/* Landmarks List */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-3 block">
              Current Landmarks ({landmarks.length})
            </label>
            {landmarks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No landmarks added yet. Add your first landmark above.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {landmarks.map((landmark, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors"
                  >
                    <span className="text-sm font-medium text-foreground">{landmark}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLandmark(index)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-card rounded-xl border border-border card-shadow p-6">
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/dashboard')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || (areas.length === 0 && landmarks.length === 0)}
              className="gradient-primary text-primary-foreground font-semibold disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

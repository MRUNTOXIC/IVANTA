"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Building2, LogOut, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useFavorites } from "@/contexts/FavoritesContext";

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [propertiesCount, setPropertiesCount] = useState(0);
  const { favorites } = useFavorites();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUserData(data.data);
        
        // Redirect builders to their specific dashboard in new tab
        if (data.data.role === 'Builder') {
          window.open('/dashboard/builder', '_blank');
          // Don't load the user dashboard for builders
          setLoading(false);
          return;
        }
        
        fetchUserProperties(data.data.email);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProperties = async (email: string) => {
    try {
      const response = await fetch(`/api/user-properties?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        setPropertiesCount(data.data?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching user properties:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Welcome back, {userData?.name || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Manage your properties, saved listings, and account settings
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">{propertiesCount}</span>
            </div>
            <p className="text-sm text-muted-foreground">My Properties</p>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">{favorites.size}</span>
            </div>
            <p className="text-sm text-muted-foreground">Saved Properties</p>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Search className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">0</span>
            </div>
            <p className="text-sm text-muted-foreground">Recent Searches</p>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Bell className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">0</span>
            </div>
            <p className="text-sm text-muted-foreground">Notifications</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h2 className="text-xl font-heading font-bold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => router.push("/post-property")}
              className="gradient-primary text-primary-foreground h-auto py-4 flex flex-col items-center gap-2"
            >
              <Building2 className="w-6 h-6" />
              <span className="font-semibold">Post Property</span>
            </Button>
            
            <Button
              onClick={() => router.push("/properties")}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <Search className="w-6 h-6" />
              <span className="font-semibold">Browse Properties</span>
            </Button>
            
            <Button
              onClick={() => router.push("/dashboard/saved")}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <Heart className="w-6 h-6" />
              <span className="font-semibold">View Saved</span>
            </Button>
          </div>
        </div>

        {/* Account Menu */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-heading font-bold text-foreground mb-4">
            Account
          </h2>
          <div className="space-y-2">
            {/* <button
              onClick={() => router.push("/dashboard/profile")}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left"
            >
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground font-medium">My Profile</span>
            </button> */}
            
            <button
              onClick={() => router.push("/dashboard/properties")}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left"
            >
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground font-medium">My Properties</span>
            </button>
            
            <button
              onClick={() => router.push("/dashboard/saved")}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left"
            >
              <Heart className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground font-medium">Saved Properties</span>
            </button>
            
            {/* <button
              onClick={() => router.push("/dashboard/settings")}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground font-medium">Settings</span>
            </button> */}
            
            <div className="border-t border-border my-2"></div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-destructive/10 transition-colors text-left text-destructive"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground">
            🚧 This dashboard is under construction. More features coming soon!
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

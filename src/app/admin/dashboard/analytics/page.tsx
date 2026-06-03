"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Eye, Clock, TrendingUp, Monitor, Smartphone, Tablet, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnalyticsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

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
      fetchAnalytics();
    }
  }, [isAuthenticated, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?type=summary&days=${timeRange}`);
      const result = await response.json();
      
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
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

  const formatTotalDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground">Website Analytics</h1>
              <p className="text-xs text-muted-foreground">Visitor insights and engagement metrics</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-6 py-8">
        {/* Time Range Selector */}
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground mr-2">Time Range:</span>
          {[7, 30, 90].map((days) => (
            <Button
              key={days}
              variant={timeRange === days ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(days)}
            >
              Last {days} days
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        ) : analytics ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-card rounded-xl p-6 border border-border card-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">
                  {analytics.uniqueVisitors.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Unique Visitors</p>
              </div>

              <div className="bg-card rounded-xl p-6 border border-border card-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">
                  {analytics.totalVisits.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Page Views</p>
              </div>

              <div className="bg-card rounded-xl p-6 border border-border card-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">
                  {formatDuration(analytics.avgDuration)}
                </p>
                <p className="text-sm text-muted-foreground">Avg. Session Duration</p>
              </div>

              <div className="bg-card rounded-xl p-6 border border-border card-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">
                  {analytics.uniqueVisitors > 0 
                    ? (analytics.totalVisits / analytics.uniqueVisitors).toFixed(1)
                    : '0'}
                </p>
                <p className="text-sm text-muted-foreground">Pages per Visitor</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Device Breakdown */}
              <div className="bg-card rounded-xl border border-border card-shadow p-6">
                <h3 className="text-lg font-heading font-bold text-foreground mb-6">Device Breakdown</h3>
                <div className="space-y-4">
                  {analytics.deviceBreakdown?.map((device: any) => {
                    const total = analytics.totalVisits;
                    const percentage = total > 0 ? ((device.count / total) * 100).toFixed(1) : 0;
                    const Icon = device._id === 'mobile' ? Smartphone : device._id === 'tablet' ? Tablet : Monitor;
                    
                    return (
                      <div key={device._id}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-5 h-5 text-primary" />
                            <span className="text-sm font-medium text-foreground capitalize">{device._id}</span>
                          </div>
                          <span className="text-sm font-semibold text-foreground">{device.count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Pages */}
              <div className="bg-card rounded-xl border border-border card-shadow p-6">
                <h3 className="text-lg font-heading font-bold text-foreground mb-6">Most Visited Pages</h3>
                <div className="space-y-3">
                  {analytics.pageViews?.slice(0, 8).map((page: any, index: number) => {
                    const total = analytics.totalVisits;
                    const percentage = total > 0 ? ((page.count / total) * 100).toFixed(1) : 0;
                    
                    return (
                      <div key={page._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">#{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {page._id === '/' ? 'Home' : page._id}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-secondary rounded-full h-1.5">
                              <div 
                                className="bg-primary h-1.5 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{page.count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Daily Visitors Chart */}
            <div className="bg-card rounded-xl border border-border card-shadow p-6">
              <h3 className="text-lg font-heading font-bold text-foreground mb-6">Daily Visitors Trend</h3>
              <div className="space-y-2">
                {analytics.dailyVisitors?.slice(-14).map((day: any) => {
                  const maxVisitors = Math.max(...analytics.dailyVisitors.map((d: any) => d.uniqueVisitors));
                  const percentage = maxVisitors > 0 ? (day.uniqueVisitors / maxVisitors) * 100 : 0;
                  const date = new Date(day.date);
                  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  
                  return (
                    <div key={day.date} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-muted-foreground w-16">{formattedDate}</span>
                      <div className="flex-1 bg-secondary rounded-full h-8 relative overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-primary to-primary/70 h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-3" 
                          style={{ width: `${percentage}%` }}
                        >
                          {percentage > 15 && (
                            <span className="text-xs font-semibold text-primary-foreground">
                              {day.uniqueVisitors}
                            </span>
                          )}
                        </div>
                        {percentage <= 15 && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-foreground">
                            {day.uniqueVisitors}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground w-20 text-right">
                        {day.pageViews} views
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-card rounded-xl p-6 border border-border card-shadow">
                <p className="text-sm text-muted-foreground mb-2">Total Time Spent</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatTotalDuration(analytics.totalDuration || 0)}
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border card-shadow">
                <p className="text-sm text-muted-foreground mb-2">Bounce Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics.uniqueVisitors > 0 
                    ? ((analytics.uniqueVisitors / analytics.totalVisits) * 100).toFixed(1)
                    : '0'}%
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border card-shadow">
                <p className="text-sm text-muted-foreground mb-2">Avg. Pages/Session</p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics.uniqueVisitors > 0 
                    ? (analytics.totalVisits / analytics.uniqueVisitors).toFixed(1)
                    : '0'}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No analytics data available</p>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";

export default function LuxuryPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/properties');
        const result = await response.json();
        
        if (result.success) {
          const luxury = result.data.filter((p: any) => p.badge);
          setProperties(luxury);
          setFilteredProperties(luxury);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Filter by search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = properties.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.title?.toLowerCase().includes(query)
      );
      setFilteredProperties(filtered);
    } else {
      setFilteredProperties(properties);
    }
  }, [searchQuery, properties]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 lg:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">Luxury Properties</h1>
          <p className="text-muted-foreground text-sm mb-4">
            {loading ? 'Loading...' : `${filteredProperties.length} ${filteredProperties.length === 1 ? 'property' : 'properties'} available`}
          </p>
          {/* Search Input */}
          <div className="max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by property name..."
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        {loading ? (
          <div className="text-center py-20">Loading properties...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        )}
        {!loading && filteredProperties.length === 0 && (
          <p className="text-center text-muted-foreground py-20">
            {searchQuery.trim() ? 'No properties found matching your search.' : 'No luxury properties found.'}
          </p>
        )}
      </main>
    </div>
  );
}

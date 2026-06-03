"use client";

import { Search, Home, Building2, BadgePercent, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const HeroSection = () => {
  const router = useRouter();
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [builderProjectsCount, setBuilderProjectsCount] = useState(0);
  const [totalPropertiesCount, setTotalPropertiesCount] = useState(0);

  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const response = await fetch('/api/properties?limit=50');
        const data = await response.json();
        if (data.success) {
          const types = [...new Set(data.data.map((p: any) => p.subType))].filter(Boolean) as string[];
          setPropertyTypes(types);
          const uniqueAreas = [...new Set(data.data.map((p: any) => p.area))].filter(Boolean) as string[];
          setAreas(uniqueAreas);
        }
      } catch (error) {
        console.error('Error fetching property types:', error);
      }
    };
    
    const fetchCounts = async () => {
      try {
        // Fetch builder projects count
        const builderResponse = await fetch('/api/properties?type=new');
        const builderData = await builderResponse.json();
        if (builderData.success) {
          setBuilderProjectsCount(builderData.count);
        }
        
        // Fetch total properties count
        const totalResponse = await fetch('/api/properties');
        const totalData = await totalResponse.json();
        if (totalData.success) {
          setTotalPropertiesCount(totalData.count);
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };
    
    const timer = setTimeout(() => {
      fetchPropertyTypes();
      fetchCounts();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedPropertyType) params.append('subType', selectedPropertyType);
    if (selectedArea) params.append('area', selectedArea);
    
    router.push(`/properties${params.toString() ? '?' + params.toString() : ''}`);
  };
  return (
    <section className="relative overflow-hidden h-[calc(100vh-64px)] flex items-center">
      {/* Background */}
      <div className="absolute inset-0">
        <img src="/hero.png" alt="" className="w-full h-full object-cover animate-zoom" loading="eager" fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
        <div className="absolute inset-0 bg-white/70" />
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-0 md:py-0 lg:py-8 relative z-10">
        {/* Hero Content */}
        <div className="text-center max-w-5xl mx-auto mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full mb-3 md:mb-4 border border-primary/20">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            <span className="text-xs md:text-sm font-medium text-foreground">Rajkot's Trusted Property Platform</span>
          </div>
          
          <img src="/IvantaLogo.png" alt="Ivanta" className="h-20 md:h-24 lg:h-28 w-auto object-contain mx-auto mb-3 md:mb-4" />
          
          <h1 className="text-xl md:text-2xl lg:text-3xl font-medium mb-4 md:mb-6" style={{ color: "#000000" }}>
            Find Your Dream Property
          </h1>
        </div>
 
        {/* Enhanced Search Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl card-shadow-hover p-3 md:p-4 max-w-3xl mx-auto border border-white/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] gap-2">
            <select className="w-full px-3 py-2 md:py-2.5 rounded-lg border border-border bg-white text-foreground text-xs font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all hover:border-primary/50">
              <option>Buy or Rent</option>
              <option>Buy</option>
              <option>Rent</option>
            </select>
            <select 
              value={selectedPropertyType}
              onChange={(e) => setSelectedPropertyType(e.target.value)}
              className="w-full px-3 py-2 md:py-2.5 rounded-lg border border-border bg-white text-foreground text-xs font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all hover:border-primary/50"
            >
              <option value="">All Properties</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select 
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-3 py-2 md:py-2.5 rounded-lg border border-border bg-white text-foreground text-xs font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all hover:border-primary/50"
            >
              <option value="">Search Area</option>
              {areas.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
            <Button 
              onClick={handleSearch}
              className="gradient-primary text-primary-foreground h-9 md:h-10 px-6 text-xs font-bold gap-2 hover:scale-105 transition-transform sm:col-span-2 lg:col-span-1 lg:w-auto rounded-lg shadow-lg shadow-primary/30"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 lg:gap-6 max-w-4xl mx-auto mt-6 md:mt-8 lg:mt-10">
          <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-2.5 md:p-3 lg:p-4 border border-white/50">
            <Home className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-primary mx-auto mb-1 md:mb-1.5" />
            <p className="text-base md:text-xl lg:text-2xl font-bold text-foreground">{totalPropertiesCount}+</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">Total Properties</p>
          </div>
          <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-2.5 md:p-3 lg:p-4 border border-white/50">
            <Building2 className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-primary mx-auto mb-1 md:mb-1.5" />
            <p className="text-base md:text-xl lg:text-2xl font-bold text-foreground">{builderProjectsCount}+</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">Builder Projects</p>
          </div>
          <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-2.5 md:p-3 lg:p-4 border border-white/50">
            <BadgePercent className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-primary mx-auto mb-1 md:mb-1.5" />
            <p className="text-base md:text-xl lg:text-2xl font-bold text-foreground">₹ 0</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">Platform Fee</p>
          </div>
          <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-2.5 md:p-3 lg:p-4 border border-white/50">
            <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-primary mx-auto mb-1 md:mb-1.5" />
            <p className="text-base md:text-xl lg:text-2xl font-bold text-foreground">100%</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">Transparency</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

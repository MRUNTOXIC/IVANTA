"use client";

import { Suspense, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import { useSearchParams } from "next/navigation";
import { X, Filter, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateDistance, getUserLocation } from "@/lib/distance";
import { toast } from "sonner";

function PropertiesContent() {
  const searchParams = useSearchParams();
  const type = searchParams?.get("type");
  const urlSubType = searchParams?.get("subType");
  const urlArea = searchParams?.get("area");
  const urlCategory = searchParams?.get("category");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { data: allProperties = [], isLoading: loading } = useQuery({
    queryKey: ['properties', type, urlCategory],
    queryFn: async () => {
      let url = '/api/properties';
      
      if (type === 'buy') {
        url = '/api/properties?type=buy';
      } else if (type === 'commercial') {
        url = '/api/properties?type=commercial';
      } else if (type === 'plots' || type === 'plot') {
        url = '/api/properties?type=plot';
      } else if (type) {
        url = `/api/properties?type=${type}`;
      }
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        let data = result.data;
        // Filter by category if provided
        if (urlCategory) {
          data = data.filter((p: any) => p.category === urlCategory);
        }
        return data;
      }
      return [];
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });

  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [selectedSubTypes, setSelectedSubTypes] = useState<string[]>([]);
  const [selectedBedrooms, setSelectedBedrooms] = useState<string[]>([]);
  const [selectedBudgetRanges, setSelectedBudgetRanges] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [budgetFilterType, setBudgetFilterType] = useState<'range' | 'custom'>('range');
  const [minArea, setMinArea] = useState<string>("");
  const [maxArea, setMaxArea] = useState<string>("");
  const [selectedConstructionStatus, setSelectedConstructionStatus] = useState<string[]>([]);
  const [selectedFacing, setSelectedFacing] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [areaSearchQuery, setAreaSearchQuery] = useState<string>("");
  // PG/Hostel specific filters
  const [selectedRentalRanges, setSelectedRentalRanges] = useState<string[]>([]);
  const [selectedAvailableFor, setSelectedAvailableFor] = useState<string[]>([]);
  const [selectedSharingType, setSelectedSharingType] = useState<string[]>([]);
  const [foodAvailable, setFoodAvailable] = useState<boolean | null>(null);
  const [acAvailable, setAcAvailable] = useState<boolean | null>(null);

  // Restore scroll position when returning from property detail
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('propertyListingScroll');
    if (savedScroll) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        window.scrollTo({
          top: parseInt(savedScroll),
          behavior: 'instant' // Instant scroll for better UX
        });
        sessionStorage.removeItem('propertyListingScroll');
      }, 100);
    }
  }, []);

  // Initialize filtered properties when allProperties changes
  useEffect(() => {
    setFilteredProperties(allProperties);
    
    // Apply URL parameters as initial filters
    if (urlSubType) {
      setSelectedSubTypes([urlSubType]);
    }
    if (urlArea) {
      setSelectedAreas([urlArea]);
    }
  }, [allProperties, urlSubType, urlArea]);

  // Apply filters
  useEffect(() => {
    let filtered = [...allProperties];

    // Filter by search query (property name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.title?.toLowerCase().includes(query)
      );
    }

    // Filter by property type
    if (selectedPropertyTypes.length > 0) {
      filtered = filtered.filter(p => {
        // Handle Resi + Com filter for New Projects
        if (type === 'new' && selectedPropertyTypes.includes('resicom')) {
          return p.isResiCom === true;
        }
        return selectedPropertyTypes.includes(p.propertyType);
      });
    }

    // Filter by sub type
    if (selectedSubTypes.length > 0) {
      filtered = filtered.filter(p => selectedSubTypes.includes(p.subType));
    }

    // Filter by selected areas
    if (selectedAreas.length > 0) {
      filtered = filtered.filter(p => selectedAreas.includes(p.area));
    } else if (urlArea && !selectedSubTypes.length && !selectedPropertyTypes.length) {
      // Filter by area from URL parameter only if no other filters are active
      filtered = filtered.filter(p => p.area === urlArea);
    }

    // Filter by bedrooms (only for residential)
    if (selectedBedrooms.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.beds) return false;
        const propertyBeds = Array.isArray(p.beds) ? p.beds : [p.beds];
        return selectedBedrooms.some(selectedBed => propertyBeds.includes(selectedBed));
      });
    }

    // Filter by budget - either by ranges or custom min/max
    if (budgetFilterType === 'range' && selectedBudgetRanges.length > 0) {
      filtered = filtered.filter(p => {
        const price = extractPrice(p.price, p.priceFrom);
        if (price === null) return false;
        
        return selectedBudgetRanges.some(range => {
          switch(range) {
            case 'Min Price to Max Price':
              return true; // Show all properties
            case 'Below 5 Lakhs':
              return price < 500000;
            case '5 Lakhs - 25 Lakhs':
              return price >= 500000 && price < 2500000;
            case '25 Lakhs - 50 Lakhs':
              return price >= 2500000 && price < 5000000;
            case '50 Lakhs - 1 Crore':
              return price >= 5000000 && price < 10000000;
            case '1 Crore - 5 Crores':
              return price >= 10000000 && price < 50000000;
            case 'Above 5 Crores':
              return price >= 50000000;
            default:
              return false;
          }
        });
      });
    } else if (budgetFilterType === 'custom' && (minPrice || maxPrice)) {
      filtered = filtered.filter(p => {
        const price = extractPrice(p.price, p.priceFrom);
        if (price === null) return false;
        
        const min = minPrice ? parseFloat(minPrice) : 0;
        const max = maxPrice ? parseFloat(maxPrice) : Infinity;
        
        return price >= min && price <= max;
      });
    }

    // Filter by area (for commercial, rentals, and plots/lands)
    if ((minArea || maxArea) && (selectedPropertyTypes.includes('commercial') || selectedPropertyTypes.includes('plot') || type === 'rent' || type === 'commercial' || type === 'plots' || type === 'plot')) {
      filtered = filtered.filter(p => {
        if (!p.sqft) return false;
        
        const areaStr = p.sqft.replace(/[^0-9.]/g, '');
        const area = parseFloat(areaStr);
        
        if (isNaN(area)) return false;
        
        const min = minArea ? parseFloat(minArea) : 0;
        const max = maxArea ? parseFloat(maxArea) : Infinity;
        
        return area >= min && area <= max;
      });
    }

    // Filter by construction status (for residential and commercial)
    if (selectedConstructionStatus.length > 0) {
      filtered = filtered.filter(p => p.badge && selectedConstructionStatus.includes(p.badge));
    }

    // Filter by facing direction
    if (selectedFacing.length > 0) {
      filtered = filtered.filter(p => p.facing && selectedFacing.includes(p.facing));
    }

    // Filter by rental range (only for PG/Hostel)
    if (selectedRentalRanges.length > 0 && type === 'pg') {
      filtered = filtered.filter(p => {
        const price = extractPrice(p.price, p.priceFrom);
        if (price === null) return false;
        
        return selectedRentalRanges.some(range => {
          switch(range) {
            case 'Less than ₹5000':
              return price < 5000;
            case '₹5,000 - ₹7,000':
              return price >= 5000 && price <= 7000;
            case '₹7,000 - ₹10,000':
              return price >= 7000 && price <= 10000;
            case 'More than ₹10,000':
              return price > 10000;
            default:
              return false;
          }
        });
      });
    }

    // Filter by available for (only for PG/Hostel)
    if (selectedAvailableFor.length > 0 && type === 'pg') {
      filtered = filtered.filter(p => {
        if (!p.subType) return false;
        return selectedAvailableFor.includes(p.subType);
      });
    }

    // Filter by sharing type (only for PG/Hostel)
    if (selectedSharingType.length > 0 && type === 'pg') {
      filtered = filtered.filter(p => {
        if (!p.badge) return false;
        return selectedSharingType.includes(p.badge);
      });
    }

    // Filter by food availability (only for PG/Hostel)
    if (foodAvailable !== null && type === 'pg') {
      filtered = filtered.filter(p => p.foodAvailable === foodAvailable);
    }

    // Filter by AC availability (only for PG/Hostel)
    if (acAvailable !== null && type === 'pg') {
      filtered = filtered.filter(p => p.acAvailable === acAvailable);
    }

    // Sort by distance if enabled
    if (sortByDistance && userLocation) {
      filtered = filtered
        .map(p => {
          const lat = parseFloat(p.latitude);
          const lng = parseFloat(p.longitude);
          if (isNaN(lat) || isNaN(lng)) {
            return { ...p, distance: Infinity };
          }
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            lat,
            lng
          );
          return { ...p, distance };
        })
        .sort((a, b) => a.distance - b.distance);
    }

    setFilteredProperties(filtered);
  }, [searchQuery, selectedPropertyTypes, selectedSubTypes, selectedBedrooms, selectedBudgetRanges, minPrice, maxPrice, budgetFilterType, minArea, maxArea, selectedConstructionStatus, selectedFacing, selectedAreas, selectedRentalRanges, selectedAvailableFor, selectedSharingType, foodAvailable, acAvailable, allProperties, type, sortByDistance, userLocation, urlArea]);

  const handlePropertyTypeToggle = (propertyType: string) => {
    setSelectedPropertyTypes(prev => 
      prev.includes(propertyType) 
        ? prev.filter(t => t !== propertyType)
        : [...prev, propertyType]
    );
  };

  const handleSubTypeToggle = (subType: string) => {
    setSelectedSubTypes(prev => 
      prev.includes(subType) 
        ? prev.filter(t => t !== subType)
        : [...prev, subType]
    );
  };

  const handleBedroomToggle = (bedroom: string) => {
    setSelectedBedrooms(prev => 
      prev.includes(bedroom) 
        ? prev.filter(b => b !== bedroom)
        : [...prev, bedroom]
    );
  };

  const handleConstructionStatusToggle = (status: string) => {
    setSelectedConstructionStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleFacingToggle = (facing: string) => {
    setSelectedFacing(prev => 
      prev.includes(facing) 
        ? prev.filter(f => f !== facing)
        : [...prev, facing]
    );
  };

  const handleAreaToggle = (area: string) => {
    setSelectedAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const handleBudgetRangeToggle = (range: string) => {
    setSelectedBudgetRanges(prev => 
      prev.includes(range) 
        ? prev.filter(r => r !== range)
        : [...prev, range]
    );
  };

  const handleRentalRangeToggle = (range: string) => {
    setSelectedRentalRanges(prev => 
      prev.includes(range) 
        ? prev.filter(r => r !== range)
        : [...prev, range]
    );
  };

  const handleAvailableForToggle = (category: string) => {
    setSelectedAvailableFor(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSharingTypeToggle = (type: string) => {
    setSelectedSharingType(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Extract numeric price from string (e.g., "₹2.5 Cr" -> 25000000)
  const extractPrice = (priceStr: string, priceFrom?: string): number | null => {
    // For range prices, use priceFrom as the value to filter against
    const str = priceFrom || priceStr;
    if (!str) return null;
    
    const cleanPrice = str.replace(/[₹,\s]/g, '').toLowerCase();
    let multiplier = 1;
    let numStr = cleanPrice;
    
    if (cleanPrice.includes('cr') || cleanPrice.includes('crore')) {
      multiplier = 10000000;
      numStr = cleanPrice.replace(/cr|crore/g, '');
    } else if (cleanPrice.includes('l') || cleanPrice.includes('lac') || cleanPrice.includes('lakh')) {
      multiplier = 100000;
      numStr = cleanPrice.replace(/l|lac|lakh/g, '');
    } else if (cleanPrice.includes('k') || cleanPrice.includes('thousand')) {
      multiplier = 1000;
      numStr = cleanPrice.replace(/k|thousand/g, '');
    }
    
    const num = parseFloat(numStr);
    return isNaN(num) ? null : num * multiplier;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedPropertyTypes([]);
    setSelectedSubTypes([]);
    setSelectedBedrooms([]);
    setSelectedBudgetRanges([]);
    setMinPrice("");
    setMaxPrice("");
    setBudgetFilterType('range');
    setMinArea("");
    setMaxArea("");
    setSelectedConstructionStatus([]);
    setSelectedFacing([]);
    setSelectedAreas([]);
    setAreaSearchQuery("");
    setSelectedRentalRanges([]);
    setSelectedAvailableFor([]);
    setSelectedSharingType([]);
    setFoodAvailable(null);
    setAcAvailable(null);
    setSortByDistance(false);
    setUserLocation(null);
  };

  const handleNearbyProperties = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await getUserLocation();
      setUserLocation(location);
      setSortByDistance(true);
      toast.success('Location Detected', {
        description: 'Properties sorted by distance from your location.',
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Error getting location:', error);
      toast.error('Location Access Denied', {
        description: 'Please allow location access to see nearby properties.',
        duration: 4000,
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Get unique property types and subtypes from all properties
  const propertyTypes = type === 'new' 
    ? [
        { value: 'buy', label: 'Residential' },
        { value: 'commercial', label: 'Commercial' },
        { value: 'resicom', label: 'Resi + Com' }
      ]
    : type === 'buy' || type === 'commercial' || type === 'plots' || type === 'plot'
    ? [] // No property type filter for Residential, Commercial, or Plots/Lands tab
    : [
        { value: 'buy', label: 'Residential' },
        { value: 'commercial', label: 'Commercial' },
        { value: 'plot', label: 'Plot / Land' }
      ];

  // Get unique subtypes based on selected property types or all if none selected
  const getAvailableSubTypes = (): string[] => {
    const propertiesToCheck = selectedPropertyTypes.length > 0
      ? allProperties.filter((p: any) => selectedPropertyTypes.includes(p.propertyType))
      : allProperties;
    
    const subTypes = [...new Set(propertiesToCheck.map((p: any) => p.subType))].filter(Boolean) as string[];
    return subTypes.sort();
  };

  // Get unique bedrooms from residential properties
  const getAvailableBedrooms = (): string[] => {
    const residentialProperties = allProperties.filter((p: any) => p.propertyType === 'buy' && p.beds);
    const bedroomsSet = new Set<string>();
    
    residentialProperties.forEach((p: any) => {
      const beds = Array.isArray(p.beds) ? p.beds : [p.beds];
      beds.forEach((bed: string) => bedroomsSet.add(bed));
    });
    
    const bedrooms = Array.from(bedroomsSet);
    // Sort bedrooms: 1 BHK, 2 BHK, 2.5 BHK, 3 BHK, 4 BHK, 4+ BHK
    return bedrooms.sort((a: string, b: string) => {
      const aNum = parseFloat(a.replace(/[^0-9.]/g, ''));
      const bNum = parseFloat(b.replace(/[^0-9.]/g, ''));
      return aNum - bNum;
    });
  };

  const availableSubTypes = getAvailableSubTypes();
  const availableBedrooms = getAvailableBedrooms();
  const showBedroomFilter = type === 'buy' || selectedPropertyTypes.includes('buy');
  const showAreaFilter = type === 'rent' || type === 'commercial' || type === 'plots' || type === 'plot' || selectedPropertyTypes.includes('commercial') || selectedPropertyTypes.includes('plot');
  const showConstructionStatusFilter = type === 'rent' || type === 'buy' || type === 'commercial' || selectedPropertyTypes.includes('buy') || selectedPropertyTypes.includes('commercial');

  // Count helpers
  const countBySubType = (subType: string) => allProperties.filter((p: any) => p.subType === subType).length;
  const countByBedroom = (bedroom: string) => allProperties.filter((p: any) => {
    const beds = Array.isArray(p.beds) ? p.beds : [p.beds];
    return beds.includes(bedroom);
  }).length;
  const countByStatus = (status: string) => allProperties.filter((p: any) => p.badge === status).length;
  const countByFacing = (facing: string) => allProperties.filter((p: any) => p.facing === facing).length;
  const countByArea = (area: string) => allProperties.filter((p: any) => p.area === area).length;
  const countByBudgetRange = (range: string) => allProperties.filter((p: any) => {
    const price = extractPrice(p.price, p.priceFrom);
    if (price === null) return false;
    switch (range) {
      case 'Min Price to Max Price': return true;
      case 'Below 5 Lakhs': return price < 500000;
      case '5 Lakhs - 25 Lakhs': return price >= 500000 && price < 2500000;
      case '25 Lakhs - 50 Lakhs': return price >= 2500000 && price < 5000000;
      case '50 Lakhs - 1 Crore': return price >= 5000000 && price < 10000000;
      case '1 Crore - 5 Crores': return price >= 10000000 && price < 50000000;
      case 'Above 5 Crores': return price >= 50000000;
      default: return false;
    }
  }).length;
  const countByRentalRange = (range: string) => allProperties.filter((p: any) => {
    const price = extractPrice(p.price, p.priceFrom);
    if (price === null) return false;
    switch (range) {
      case 'Less than ₹5000': return price < 5000;
      case '₹5,000 - ₹7,000': return price >= 5000 && price <= 7000;
      case '₹7,000 - ₹10,000': return price >= 7000 && price <= 10000;
      case 'More than ₹10,000': return price > 10000;
      default: return false;
    }
  }).length;
  const countByAvailableFor = (option: string) => allProperties.filter((p: any) => p.subType === option).length;
  const countBySharingType = (option: string) => allProperties.filter((p: any) => p.badge === option).length;

  const budgetRanges = [
    'Min Price to Max Price',
    'Below 5 Lakhs',
    '5 Lakhs - 25 Lakhs',
    '25 Lakhs - 50 Lakhs',
    '50 Lakhs - 1 Crore',
    '1 Crore - 5 Crores',
    'Above 5 Crores'
  ];

  const constructionStatusOptions = [
    'New Launch',
    'Under Construction',
    'Ready to Move'
  ];

  const facingOptions = [
    'North',
    'South',
    'East',
    'West'
  ];

  const rentalRanges = [
    'Less than ₹5000',
    '₹5,000 - ₹7,000',
    '₹7,000 - ₹10,000',
    'More than ₹10,000'
  ];

  const availableForOptions = [
    'Boys',
    'Girls',
    'Student Friendly',
    'Working Professionals Friendly'
  ];

  const sharingTypeOptions = [
    'Private',
    '2 Sharing',
    '3 Sharing',
    '4 or More Sharing'
  ];

  const hasCustomPriceFilter = minPrice || maxPrice;
  const hasAreaFilter = minArea || maxArea;

  // Get unique areas from all properties
  const availableAreas = [...new Set(allProperties.map((p: any) => p.area))].filter(Boolean).sort() as string[];
  const filteredAreas = areaSearchQuery.trim()
    ? availableAreas.filter(area => area.toLowerCase().includes(areaSearchQuery.toLowerCase()))
    : availableAreas;

  const activeFiltersCount = (searchQuery.trim() ? 1 : 0) + selectedPropertyTypes.length + selectedSubTypes.length + selectedBedrooms.length + 
    (budgetFilterType === 'range' ? selectedBudgetRanges.length : (hasCustomPriceFilter ? 1 : 0)) +
    (hasAreaFilter ? 1 : 0) + selectedConstructionStatus.length + selectedFacing.length + selectedAreas.length + selectedRentalRanges.length + selectedAvailableFor.length + selectedSharingType.length + (foodAvailable !== null ? 1 : 0) + (acAvailable !== null ? 1 : 0);

  // Determine if filters should be shown based on property type
  const showFilters = !type || ['buy', 'commercial', 'plot', 'plots', 'pg', 'new'].includes(type);

  if (loading) {
    return (
      <main className="container mx-auto px-4 lg:px-6 py-2">
        <div className="text-center py-20">Loading properties...</div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-4">
      {urlCategory && (
        <div className="mb-3 sm:mb-4 pt-2 sm:pt-4">
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground">{urlCategory}</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">{allProperties.length} {allProperties.length === 1 ? 'property' : 'properties'} available</p>
        </div>
      )}
      <div className="mb-4 sm:mb-6 lg:mb-8 flex items-center justify-between gap-2">
        
        {/* Mobile Filter Button */}
        {showFilters && (
          <Button
            onClick={() => setIsFilterOpen(true)}
            className="lg:hidden gradient-primary text-primary-foreground gap-2"
            size="sm"
          >
            <Filter className="w-4 h-4" />
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
        )}

        {/* Nearby Properties Button */}
        <Button
          onClick={sortByDistance ? () => { setSortByDistance(false); setUserLocation(null); } : handleNearbyProperties}
          disabled={isLoadingLocation}
          variant={sortByDistance ? "default" : "outline"}
          className={sortByDistance ? "gradient-primary text-primary-foreground gap-2" : "gap-2"}
          size="sm"
        >
          {isLoadingLocation ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Detecting...
            </>
          ) : sortByDistance ? (
            <>
              <MapPin className="w-4 h-4" />
              Sorted by Distance
              <X className="w-3 h-3 ml-1" />
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              Nearby Properties
            </>
          )}
        </Button>
      </div>

      <div className={showFilters ? "flex gap-6" : ""}>
        {/* Filters Sidebar - Desktop */}
        {showFilters && (
        <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-heading font-bold text-foreground">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
              </p>

              {/* Search by Property Name */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-foreground mb-3">Search Property</h4>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by property name..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Property Type Filter - Hide for PG/Hostel, Residential, Commercial, and Plots/Lands tabs */}
              {type !== 'pg' && type !== 'buy' && type !== 'commercial' && type !== 'plots' && type !== 'plot' && propertyTypes.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-foreground mb-3">Property Type</h4>
                <div className="space-y-2">
                  {propertyTypes.map((pt) => (
                    <label
                      key={pt.value}
                      className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPropertyTypes.includes(pt.value)}
                        onChange={() => handlePropertyTypeToggle(pt.value)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                      />
                      <span className="text-sm text-foreground">{pt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              )}

              {/* Property Sub Type Filter - Show for Residential, Commercial, Plots/Lands tabs or when property types are selected */}
              {((type === 'buy' && availableSubTypes.length > 0) || (type === 'commercial' && availableSubTypes.length > 0) || (type === 'plots' && availableSubTypes.length > 0) || (type === 'plot' && availableSubTypes.length > 0) || (selectedPropertyTypes.length > 0 && availableSubTypes.length > 0)) && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Property Sub Type</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableSubTypes.map((subType) => (
                      <label
                        key={subType}
                        className="flex items-center justify-between gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedSubTypes.includes(subType)}
                            onChange={() => handleSubTypeToggle(subType)}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                          />
                          <span className="text-sm text-foreground">{subType}</span>
                        </div>
                        <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{countBySubType(subType)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Bedrooms Filter - Only show when Residential is selected */}
              {showBedroomFilter && availableBedrooms.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Bedrooms</h4>
                  <div className="space-y-2">
                    {availableBedrooms.map((bedroom) => (
                      <label
                        key={bedroom}
                        className="flex items-center justify-between gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedBedrooms.includes(bedroom)}
                            onChange={() => handleBedroomToggle(bedroom)}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                          />
                          <span className="text-sm text-foreground">{bedroom}</span>
                        </div>
                        <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{countByBedroom(bedroom)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Budget Filter - Hide for PG/Hostel, show for Residential, Commercial, and other tabs */}
              {type !== 'pg' && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-foreground mb-3">Budget</h4>
                
                {/* Tab Selection */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => {
                      setBudgetFilterType('range');
                      setMinPrice("");
                      setMaxPrice("");
                    }}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      budgetFilterType === 'range'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    Price Range
                  </button>
                  <button
                    onClick={() => {
                      setBudgetFilterType('custom');
                      setSelectedBudgetRanges([]);
                    }}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      budgetFilterType === 'custom'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    Custom Range
                  </button>
                </div>

                {/* Price Range Checkboxes */}
                {budgetFilterType === 'range' && (
                  <div className="space-y-2">
                    {budgetRanges.map((range) => (
                      <label
                        key={range}
                        className="flex items-center justify-between gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedBudgetRanges.includes(range)}
                            onChange={() => handleBudgetRangeToggle(range)}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                          />
                          <span className="text-sm text-foreground">{range}</span>
                        </div>
                        <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{countByBudgetRange(range)}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Custom Min/Max Price Inputs */}
                {budgetFilterType === 'custom' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Min Price (₹)</label>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="e.g., 500000"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Max Price (₹)</label>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="e.g., 10000000"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    {(minPrice || maxPrice) && (
                      <div className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded">
                        {minPrice && maxPrice ? (
                          <>Range: ₹{parseInt(minPrice).toLocaleString('en-IN')} - ₹{parseInt(maxPrice).toLocaleString('en-IN')}</>
                        ) : minPrice ? (
                          <>Min: ₹{parseInt(minPrice).toLocaleString('en-IN')}</>
                        ) : (
                          <>Max: ₹{parseInt(maxPrice).toLocaleString('en-IN')}</>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              )}

              {/* Area Filter - Show for Rentals, Commercial, and Plots/Lands */}
              {showAreaFilter && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Area (Sq.ft.)</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">From (Sq.ft.)</label>
                      <input
                        type="number"
                        value={minArea}
                        onChange={(e) => setMinArea(e.target.value)}
                        placeholder="e.g., 500"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">To (Sq.ft.)</label>
                      <input
                        type="number"
                        value={maxArea}
                        onChange={(e) => setMaxArea(e.target.value)}
                        placeholder="e.g., 5000"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    {(minArea || maxArea) && (
                      <div className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded">
                        {minArea && maxArea ? (
                          <>Range: {parseInt(minArea).toLocaleString('en-IN')} - {parseInt(maxArea).toLocaleString('en-IN')} sq.ft.</>
                        ) : minArea ? (
                          <>From: {parseInt(minArea).toLocaleString('en-IN')} sq.ft.</>
                        ) : (
                          <>To: {parseInt(maxArea).toLocaleString('en-IN')} sq.ft.</>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Construction Status Filter - Show for Rentals, Residential and Commercial */}
              {showConstructionStatusFilter && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Construction Status</h4>
                  <div className="space-y-2">
                    {constructionStatusOptions.map((status) => (
                      <label
                        key={status}
                        className="flex items-center justify-between gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedConstructionStatus.includes(status)}
                            onChange={() => handleConstructionStatusToggle(status)}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                          />
                          <span className="text-sm text-foreground">{status}</span>
                        </div>
                        <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{countByStatus(status)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Facing Direction Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-foreground mb-3">Facing Direction</h4>
                <div className="space-y-2">
                  {facingOptions.map((facing) => (
                    <label
                      key={facing}
                      className="flex items-center justify-between gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedFacing.includes(facing)}
                          onChange={() => handleFacingToggle(facing)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{facing}</span>
                      </div>
                      <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{countByFacing(facing)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Area Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-foreground mb-3">Filter by Area</h4>
                <input
                  type="text"
                  value={areaSearchQuery}
                  onChange={(e) => setAreaSearchQuery(e.target.value)}
                  placeholder="Search area..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mb-3"
                />
                {selectedAreas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedAreas.map((area) => (
                      <span
                        key={area}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {area}
                        <button
                          onClick={() => handleAreaToggle(area)}
                          className="hover:bg-primary/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredAreas.length > 0 ? (
                    filteredAreas.map((area) => (
                      <label
                        key={area}
                        className="flex items-center justify-between gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedAreas.includes(area)}
                            onChange={() => handleAreaToggle(area)}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                          />
                          <span className="text-sm text-foreground">{area}</span>
                        </div>
                        <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{countByArea(area)}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-2">No areas found</p>
                  )}
                </div>
              </div>

              {/* Rental Range Filter - Only show for PG/Hostel */}
              {type === 'pg' && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Rental Range</h4>
                  <div className="space-y-2">
                    {rentalRanges.map((range) => (
                      <label
                        key={range}
                        className="flex items-center justify-between gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedRentalRanges.includes(range)}
                            onChange={() => handleRentalRangeToggle(range)}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                          />
                          <span className="text-sm text-foreground">{range}</span>
                        </div>
                        <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{countByRentalRange(range)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Available For Filter - Only show for PG/Hostel */}
              {type === 'pg' && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Available For</h4>
                  <div className="space-y-2">
                    {availableForOptions.map((option) => (
                      <label
                        key={option}
                        className="flex items-center justify-between gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedAvailableFor.includes(option)}
                            onChange={() => handleAvailableForToggle(option)}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                          />
                          <span className="text-sm text-foreground">{option}</span>
                        </div>
                        <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{countByAvailableFor(option)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Private or Sharing Filter - Only show for PG/Hostel */}
              {type === 'pg' && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Private or Sharing</h4>
                  <div className="space-y-2">
                    {sharingTypeOptions.map((option) => (
                      <label
                        key={option}
                        className="flex items-center justify-between gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedSharingType.includes(option)}
                            onChange={() => handleSharingTypeToggle(option)}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                          />
                          <span className="text-sm text-foreground">{option}</span>
                        </div>
                        <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{countBySharingType(option)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Food Availability Filter - Only show for PG/Hostel */}
              {type === 'pg' && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Food Availability</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <input
                        type="radio"
                        name="foodAvailability"
                        checked={foodAvailable === null}
                        onChange={() => setFoodAvailable(null)}
                        className="w-4 h-4 border-border text-primary focus:ring-2 focus:ring-primary/30"
                      />
                      <span className="text-sm text-foreground">All</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <input
                        type="radio"
                        name="foodAvailability"
                        checked={foodAvailable === true}
                        onChange={() => setFoodAvailable(true)}
                        className="w-4 h-4 border-border text-primary focus:ring-2 focus:ring-primary/30"
                      />
                      <span className="text-sm text-foreground">Food Available</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <input
                        type="radio"
                        name="foodAvailability"
                        checked={foodAvailable === false}
                        onChange={() => setFoodAvailable(false)}
                        className="w-4 h-4 border-border text-primary focus:ring-2 focus:ring-primary/30"
                      />
                      <span className="text-sm text-foreground">Food Not Available</span>
                    </label>
                  </div>
                </div>
              )}

              {/* AC Availability Filter - Only show for PG/Hostel */}
              {type === 'pg' && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">AC Availability</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <input
                        type="radio"
                        name="acAvailability"
                        checked={acAvailable === null}
                        onChange={() => setAcAvailable(null)}
                        className="w-4 h-4 border-border text-primary focus:ring-2 focus:ring-primary/30"
                      />
                      <span className="text-sm text-foreground">All</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <input
                        type="radio"
                        name="acAvailability"
                        checked={acAvailable === true}
                        onChange={() => setAcAvailable(true)}
                        className="w-4 h-4 border-border text-primary focus:ring-2 focus:ring-primary/30"
                      />
                      <span className="text-sm text-foreground">AC Available</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <input
                        type="radio"
                        name="acAvailability"
                        checked={acAvailable === false}
                        onChange={() => setAcAvailable(false)}
                        className="w-4 h-4 border-border text-primary focus:ring-2 focus:ring-primary/30"
                      />
                      <span className="text-sm text-foreground">AC Not Available</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Mobile Filter Popup */}
        {showFilters && isFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsFilterOpen(false)}
            />
            
            {/* Filter Panel */}
            <div className="absolute inset-x-0 bottom-0 max-h-[90vh] bg-card overflow-y-auto rounded-t-3xl shadow-2xl">
              <div className="sticky top-0 bg-card border-b border-border p-4 z-10">
                {/* Drag Handle */}
                <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-3" />
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-heading font-bold text-lg text-foreground">Filters</h3>
                  <div className="flex items-center gap-2">
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-primary hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
                </p>
              </div>
              
              <div className="p-4">
                {/* Search by Property Name */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Search Property</h4>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by property name..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Property Type Filter - Hide for PG/Hostel, Residential, Commercial, and Plots/Lands tabs */}
                {type !== 'pg' && type !== 'buy' && type !== 'commercial' && type !== 'plots' && type !== 'plot' && propertyTypes.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Property Type</h4>
                  <div className="space-y-2">
                    {propertyTypes.map((pt) => (
                      <label
                        key={pt.value}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPropertyTypes.includes(pt.value)}
                          onChange={() => handlePropertyTypeToggle(pt.value)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{pt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                )}

                {/* Property Sub Type Filter */}
                {((type === 'buy' && availableSubTypes.length > 0) || (type === 'commercial' && availableSubTypes.length > 0) || (type === 'plots' && availableSubTypes.length > 0) || (type === 'plot' && availableSubTypes.length > 0) || (selectedPropertyTypes.length > 0 && availableSubTypes.length > 0)) && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Property Sub Type</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {availableSubTypes.map((subType) => (
                        <label
                          key={subType}
                          className="flex items-center justify-between gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedSubTypes.includes(subType)}
                              onChange={() => handleSubTypeToggle(subType)}
                              className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                            />
                            <span className="text-sm text-foreground">{subType}</span>
                          </div>
                          <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{countBySubType(subType)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bedrooms Filter */}
                {showBedroomFilter && availableBedrooms.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Bedrooms</h4>
                    <div className="space-y-2">
                      {availableBedrooms.map((bedroom) => (
                        <label
                          key={bedroom}
                          className="flex items-center justify-between gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedBedrooms.includes(bedroom)}
                              onChange={() => handleBedroomToggle(bedroom)}
                              className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                            />
                            <span className="text-sm text-foreground">{bedroom}</span>
                          </div>
                          <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{countByBedroom(bedroom)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Budget Filter */}
                {type !== 'pg' && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Budget</h4>
                  
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => {
                        setBudgetFilterType('range');
                        setMinPrice("");
                        setMaxPrice("");
                      }}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        budgetFilterType === 'range'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      Price Range
                    </button>
                    <button
                      onClick={() => {
                        setBudgetFilterType('custom');
                        setSelectedBudgetRanges([]);
                      }}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        budgetFilterType === 'custom'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      Custom Range
                    </button>
                  </div>

                  {budgetFilterType === 'range' && (
                    <div className="space-y-2">
                      {budgetRanges.map((range) => (
                        <label
                          key={range}
                          className="flex items-center justify-between gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedBudgetRanges.includes(range)}
                              onChange={() => handleBudgetRangeToggle(range)}
                              className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                            />
                            <span className="text-sm text-foreground">{range}</span>
                          </div>
                          <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{countByBudgetRange(range)}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {budgetFilterType === 'custom' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Min Price (₹)</label>
                        <input
                          type="number"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          placeholder="e.g., 500000"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Max Price (₹)</label>
                        <input
                          type="number"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder="e.g., 10000000"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                      {(minPrice || maxPrice) && (
                        <div className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded">
                          {minPrice && maxPrice ? (
                            <>Range: ₹{parseInt(minPrice).toLocaleString('en-IN')} - ₹{parseInt(maxPrice).toLocaleString('en-IN')}</>
                          ) : minPrice ? (
                            <>Min: ₹{parseInt(minPrice).toLocaleString('en-IN')}</>
                          ) : (
                            <>Max: ₹{parseInt(maxPrice).toLocaleString('en-IN')}</>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                )}

                {/* Area Filter */}
                {showAreaFilter && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Area (Sq.ft.)</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">From (Sq.ft.)</label>
                        <input
                          type="number"
                          value={minArea}
                          onChange={(e) => setMinArea(e.target.value)}
                          placeholder="e.g., 500"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">To (Sq.ft.)</label>
                        <input
                          type="number"
                          value={maxArea}
                          onChange={(e) => setMaxArea(e.target.value)}
                          placeholder="e.g., 5000"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                      {(minArea || maxArea) && (
                        <div className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded">
                          {minArea && maxArea ? (
                            <>Range: {parseInt(minArea).toLocaleString('en-IN')} - {parseInt(maxArea).toLocaleString('en-IN')} sq.ft.</>
                          ) : minArea ? (
                            <>From: {parseInt(minArea).toLocaleString('en-IN')} sq.ft.</>
                          ) : (
                            <>To: {parseInt(maxArea).toLocaleString('en-IN')} sq.ft.</>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Construction Status Filter */}
                {showConstructionStatusFilter && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Construction Status</h4>
                    <div className="space-y-2">
                      {constructionStatusOptions.map((status) => (
                        <label
                          key={status}
                          className="flex items-center justify-between gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedConstructionStatus.includes(status)}
                              onChange={() => handleConstructionStatusToggle(status)}
                              className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                            />
                            <span className="text-sm text-foreground">{status}</span>
                          </div>
                          <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{countByStatus(status)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Facing Direction Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Facing Direction</h4>
                  <div className="space-y-2">
                    {facingOptions.map((facing) => (
                      <label
                        key={facing}
                        className="flex items-center justify-between gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedFacing.includes(facing)}
                            onChange={() => handleFacingToggle(facing)}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                          />
                          <span className="text-sm text-foreground">{facing}</span>
                        </div>
                        <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{countByFacing(facing)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Area Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Filter by Area</h4>
                  <input
                    type="text"
                    value={areaSearchQuery}
                    onChange={(e) => setAreaSearchQuery(e.target.value)}
                    placeholder="Search area..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mb-3"
                  />
                  {selectedAreas.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedAreas.map((area) => (
                        <span
                          key={area}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {area}
                          <button
                            onClick={() => handleAreaToggle(area)}
                            className="hover:bg-primary/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {filteredAreas.length > 0 ? (
                      filteredAreas.map((area) => (
                        <label
                          key={area}
                          className="flex items-center justify-between gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedAreas.includes(area)}
                              onChange={() => handleAreaToggle(area)}
                              className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                            />
                            <span className="text-sm text-foreground">{area}</span>
                          </div>
                          <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{countByArea(area)}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-2">No areas found</p>
                    )}
                  </div>
                </div>

                {/* PG/Hostel Filters */}
                {type === 'pg' && (
                  <>
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-foreground mb-3">Rental Range</h4>
                      <div className="space-y-2">
                        {rentalRanges.map((range) => (
                          <label
                            key={range}
                            className="flex items-center justify-between gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedRentalRanges.includes(range)}
                                onChange={() => handleRentalRangeToggle(range)}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                              />
                              <span className="text-sm text-foreground">{range}</span>
                            </div>
                            <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{countByRentalRange(range)}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-foreground mb-3">Available For</h4>
                      <div className="space-y-2">
                        {availableForOptions.map((option) => (
                          <label
                            key={option}
                            className="flex items-center justify-between gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedAvailableFor.includes(option)}
                                onChange={() => handleAvailableForToggle(option)}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                              />
                              <span className="text-sm text-foreground">{option}</span>
                            </div>
                            <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{countByAvailableFor(option)}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-foreground mb-3">Private or Sharing</h4>
                      <div className="space-y-2">
                        {sharingTypeOptions.map((option) => (
                          <label
                            key={option}
                            className="flex items-center justify-between gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedSharingType.includes(option)}
                                onChange={() => handleSharingTypeToggle(option)}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                              />
                              <span className="text-sm text-foreground">{option}</span>
                            </div>
                            <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{countBySharingType(option)}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-foreground mb-3">Food Availability</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                          <input
                            type="radio"
                            name="foodAvailability"
                            checked={foodAvailable === null}
                            onChange={() => setFoodAvailable(null)}
                            className="w-4 h-4 border-border text-primary focus:ring-2 focus:ring-primary/30"
                          />
                          <span className="text-sm text-foreground">All</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                          <input
                            type="radio"
                            name="foodAvailability"
                            checked={foodAvailable === true}
                            onChange={() => setFoodAvailable(true)}
                            className="w-4 h-4 border-border text-primary focus:ring-2 focus:ring-primary/30"
                          />
                          <span className="text-sm text-foreground">Food Available</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                          <input
                            type="radio"
                            name="foodAvailability"
                            checked={foodAvailable === false}
                            onChange={() => setFoodAvailable(false)}
                            className="w-4 h-4 border-border text-primary focus:ring-2 focus:ring-primary/30"
                          />
                          <span className="text-sm text-foreground">Food Not Available</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3">AC Availability</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                          <input
                            type="radio"
                            name="acAvailability"
                            checked={acAvailable === null}
                            onChange={() => setAcAvailable(null)}
                            className="w-4 h-4 border-border text-primary focus:ring-2 focus:ring-primary/30"
                          />
                          <span className="text-sm text-foreground">All</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                          <input
                            type="radio"
                            name="acAvailability"
                            checked={acAvailable === true}
                            onChange={() => setAcAvailable(true)}
                            className="w-4 h-4 border-border text-primary focus:ring-2 focus:ring-primary/30"
                          />
                          <span className="text-sm text-foreground">AC Available</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                          <input
                            type="radio"
                            name="acAvailability"
                            checked={acAvailable === false}
                            onChange={() => setAcAvailable(false)}
                            className="w-4 h-4 border-border text-primary focus:ring-2 focus:ring-primary/30"
                          />
                          <span className="text-sm text-foreground">AC Not Available</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Apply Button */}
              <div className="sticky bottom-0 bg-card border-t border-border p-4">
                <Button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full gradient-primary text-primary-foreground font-semibold"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Properties Grid */}
        <div className={showFilters ? "flex-1" : "w-full"}>
          {showFilters && activeFiltersCount > 0 && (
            <div className="mb-3 sm:mb-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm text-muted-foreground">Active filters:</span>
              {searchQuery.trim() && (
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  Search: {searchQuery}
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedPropertyTypes.map(pt => (
                <span
                  key={pt}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {propertyTypes.find(p => p.value === pt)?.label}
                  <button
                    onClick={() => handlePropertyTypeToggle(pt)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedSubTypes.map(st => (
                <span
                  key={st}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {st}
                  <button
                    onClick={() => handleSubTypeToggle(st)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedBedrooms.map(bedroom => (
                <span
                  key={bedroom}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {bedroom}
                  <button
                    onClick={() => handleBedroomToggle(bedroom)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedBudgetRanges.map(range => (
                <span
                  key={range}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {range}
                  <button
                    onClick={() => handleBudgetRangeToggle(range)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {budgetFilterType === 'custom' && hasCustomPriceFilter && (
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {minPrice && maxPrice ? (
                    <>₹{parseInt(minPrice).toLocaleString('en-IN')} - ₹{parseInt(maxPrice).toLocaleString('en-IN')}</>
                  ) : minPrice ? (
                    <>Min: ₹{parseInt(minPrice).toLocaleString('en-IN')}</>
                  ) : (
                    <>Max: ₹{parseInt(maxPrice).toLocaleString('en-IN')}</>
                  )}
                  <button
                    onClick={() => {
                      setMinPrice("");
                      setMaxPrice("");
                    }}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {hasAreaFilter && (
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {minArea && maxArea ? (
                    <>{parseInt(minArea).toLocaleString('en-IN')} - {parseInt(maxArea).toLocaleString('en-IN')} sq.ft.</>
                  ) : minArea ? (
                    <>From: {parseInt(minArea).toLocaleString('en-IN')} sq.ft.</>
                  ) : (
                    <>To: {parseInt(maxArea).toLocaleString('en-IN')} sq.ft.</>
                  )}
                  <button
                    onClick={() => {
                      setMinArea("");
                      setMaxArea("");
                    }}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedConstructionStatus.map(status => (
                <span
                  key={status}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {status}
                  <button
                    onClick={() => handleConstructionStatusToggle(status)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedFacing.map(facing => (
                <span
                  key={facing}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  Facing: {facing}
                  <button
                    onClick={() => handleFacingToggle(facing)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedAreas.map(area => (
                <span
                  key={area}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  Area: {area}
                  <button
                    onClick={() => handleAreaToggle(area)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedRentalRanges.map(range => (
                <span
                  key={range}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {range}
                  <button
                    onClick={() => handleRentalRangeToggle(range)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedAvailableFor.map(option => (
                <span
                  key={option}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {option}
                  <button
                    onClick={() => handleAvailableForToggle(option)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedSharingType.map(type => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {type}
                  <button
                    onClick={() => handleSharingTypeToggle(type)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {foodAvailable !== null && (
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {foodAvailable ? 'Food Available' : 'Food Not Available'}
                  <button
                    onClick={() => setFoodAvailable(null)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {sortByDistance && (
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  Sorted by Distance
                  <button
                    onClick={() => {
                      setSortByDistance(false);
                      setUserLocation(null);
                    }}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {acAvailable !== null && (
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {acAvailable ? 'AC Available' : 'AC Not Available'}
                  <button
                    onClick={() => setAcAvailable(null)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProperties.map((p) => (
              <div key={p._id} className="relative">
                <PropertyCard property={p} />
                {sortByDistance && p.distance !== undefined && p.distance !== Infinity && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full shadow-lg z-10">
                    {p.distance < 1 ? `${(p.distance * 1000).toFixed(0)}m` : `${p.distance.toFixed(1)}km`} away
                  </div>
                )}
              </div>
            ))}
          </div>
          {filteredProperties.length === 0 && (
            <p className="text-center text-muted-foreground py-12 sm:py-20 text-sm sm:text-base">No properties found matching your filters.</p>
          )}
        </div>
      </div>
    </main>
  );
}

export default function PropertiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Suspense fallback={<div className="container mx-auto px-4 lg:px-6 py-10">Loading...</div>}>
        <PropertiesContent />
      </Suspense>
    </div>
  );
}

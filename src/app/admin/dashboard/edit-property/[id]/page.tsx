"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Home, ArrowLeft, Upload, X, GripVertical, MapPin, Plus, Copy, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getAmenityEmoji } from "@/lib/amenityEmojis";

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [landmarks, setLandmarks] = useState<string[]>([]);
  const [selectedLandmarks, setSelectedLandmarks] = useState<{ name: string; distance: string }[]>([]);
  const [brochureUrl, setBrochureUrl] = useState("");
  const [mapMarker, setMapMarker] = useState<{ lat: number; lng: number }>({ lat: 23.0225, lng: 72.5714 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [mapZoom, setMapZoom] = useState(15);
  const [propertySlug, setPropertySlug] = useState("");
  const [enableSubdomain, setEnableSubdomain] = useState(false);
  const [subdomain, setSubdomain] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    priceFrom: "",
    priceTo: "",
    priceType: "fixed" as "fixed" | "range",
    propertyType: "",
    subType: "",
    street1: "",
    street2: "",
    street3: "",
    street4: "",
    area: "",
    state: "",
    district: "",
    city: "",
    pincode: "",
    latitude: "",
    longitude: "",
    beds: [] as string[],
    baths: "",
    sqft: "",
    description: "",
    badge: "",
    category: "None",
    amenities: [] as string[],
    foodAvailable: false,
    acAvailable: false,
    rentalCategory: "",
    isNewProject: false,
    isResiCom: false,
    isOfficeCom: false,
    contactPhone: "",
    whatsappNumber: "",
    rera: "",
    facing: "",
    instagramLink: "",
    facebookLink: "",
    youtubeLink: "",
    projectStartDate: "",
    projectEndDate: "",
    possessionDate: "",
    totalFloors: "",
    flatsPerFloor: "",
    totalWings: "",
    parkingFourWheeler: "",
    parkingTwoWheeler: "",
    totalSoldFlats: "",
    isVerified: false,
  });

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    if (auth !== "true") {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchProperty();
      fetchAreas();
    }
  }, [isAuthenticated, id]);

  const fetchAreas = async () => {
    try {
      const response = await fetch('/api/settings');
      const result = await response.json();
      
      if (result.success) {
        setAreas(result.data.areas || ['Nana Mava']);
        setLandmarks(result.data.landmarks || []);
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
      setAreas(['Nana Mava']); // Fallback
    }
  };

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${id}`);
      const result = await response.json();
      
      if (result.success) {
        const property = result.data;
        setPropertySlug(property.slug || "");
        
        // Set subdomain if exists
        if (property.subdomain) {
          setSubdomain(property.subdomain);
          setEnableSubdomain(true);
        }
        
        setFormData({
          title: property.title || "",
          price: property.price || "",
          priceFrom: property.priceFrom || "",
          priceTo: property.priceTo || "",
          priceType: (property.priceFrom ? "range" : "fixed") as "fixed" | "range",
          propertyType: property.propertyType || "",
          subType: property.subType || "",
          street1: property.street1 || "",
          street2: property.street2 || "",
          street3: property.street3 || "",
          street4: property.street4 || "",
          area: property.area || "",
          state: property.state || "",
          district: property.district || "",
          city: property.city || "",
          pincode: property.pincode || "",
          latitude: property.latitude || "",
          longitude: property.longitude || "",
          beds: Array.isArray(property.beds) ? property.beds : (property.beds ? [property.beds] : []),
          baths: property.baths || "",
          sqft: property.sqft || "",
          description: property.description || "",
          badge: property.badge || "",
          category: property.category || "None",
          amenities: property.amenities || [],
          foodAvailable: property.foodAvailable || false,
          acAvailable: property.acAvailable || false,
          rentalCategory: property.rentalCategory || "",
          isNewProject: property.isNewProject || false,
          isResiCom: property.isResiCom || false,
          isOfficeCom: property.isOfficeCom || false,
          contactPhone: property.contactPhone || "",
          whatsappNumber: property.whatsappNumber || "",
          rera: property.rera || "",
          facing: property.facing || "",
          instagramLink: property.instagramLink || "",
          facebookLink: property.facebookLink || "",
          youtubeLink: property.youtubeLink || "",
          projectStartDate: property.projectStartDate || "",
          projectEndDate: property.projectEndDate || "",
          possessionDate: property.possessionDate || "",
          totalFloors: property.totalFloors?.toString() || "",
          flatsPerFloor: property.flatsPerFloor?.toString() || "",
          totalWings: property.totalWings?.toString() || "",
          parkingFourWheeler: property.parkingFourWheeler?.toString() || "",
          parkingTwoWheeler: property.parkingTwoWheeler?.toString() || "",
          totalSoldFlats: property.totalSoldFlats?.toString() || "",
          isVerified: property.isVerified || false,
        });
        setImages(property.images || []);
        setSelectedLandmarks(property.landmarks || []);
        setBrochureUrl(property.brochureUrl || "");
        const lat = parseFloat(property.latitude) || 23.0225;
        const lng = parseFloat(property.longitude) || 72.5714;
        setMapMarker({ lat, lng });
      } else {
        toast.error('Property Not Found', {
          description: 'The property you are looking for does not exist.',
          duration: 4000,
        });
        setTimeout(() => router.push('/admin/dashboard'), 1500);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Failed to Load Property', {
        description: 'An error occurred while loading the property.',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBedroomToggle = (bedroom: string) => {
    setFormData((prev) => ({
      ...prev,
      beds: prev.beds.includes(bedroom)
        ? prev.beds.filter((b) => b !== bedroom)
        : [...prev.beds, bedroom],
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleAddLandmark = () => {
    setSelectedLandmarks([...selectedLandmarks, { name: '', distance: '' }]);
  };

  const handleRemoveLandmark = (index: number) => {
    setSelectedLandmarks(selectedLandmarks.filter((_, i) => i !== index));
  };

  const handleLandmarkChange = (index: number, field: 'name' | 'distance', value: string) => {
    const updated = [...selectedLandmarks];
    updated[index][field] = value;
    setSelectedLandmarks(updated);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) {
          setImages((prev) => [...prev, data.url]);
        } else {
          toast.error('Image upload failed', { description: data.error });
        }
      } catch {
        toast.error('Image upload failed');
      }
    }
  };

  const handleBrochureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Invalid file type', { description: 'Please upload a PDF file' });
      return;
    }

    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        setBrochureUrl(data.url);
        toast.success('Brochure uploaded successfully');
      } else {
        toast.error('Brochure upload failed', { description: data.error });
      }
    } catch {
      toast.error('Brochure upload failed');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/html"));
    if (dragIndex === dropIndex) return;

    const newImages = [...images];
    const draggedImage = newImages[dragIndex];
    newImages.splice(dragIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    setImages(newImages);
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setMapMarker({ lat, lng });
        setFormData({ ...formData, latitude: lat.toFixed(6), longitude: lng.toFixed(6) });
        setIsDetectingLocation(false);
      },
      (error) => {
        console.error('Error detecting location:', error);
        alert('Unable to detect your location. Please set it manually on the map.');
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const offsetLat = (0.5 - y / rect.height) * 0.02;
    const offsetLng = (x / rect.width - 0.5) * 0.02;
    
    const newLat = mapMarker.lat + offsetLat;
    const newLng = mapMarker.lng + offsetLng;
    
    setMapMarker({ lat: newLat, lng: newLng });
    setFormData({ ...formData, latitude: newLat.toFixed(6), longitude: newLng.toFixed(6) });
  };

  const handleMarkerDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({ x: 0, y: 0 });
  };

  const zoomIn = () => {
    setMapZoom(prev => Math.min(prev + 1, 19));
  };

  const zoomOut = () => {
    setMapZoom(prev => Math.max(prev - 1, 3));
  };

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        const mapElement = document.getElementById('property-map');
        if (!mapElement) return;
        const rect = mapElement.getBoundingClientRect();
        
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const deltaX = mouseX - centerX;
        const deltaY = mouseY - centerY;
        
        setDragOffset({ x: deltaX, y: deltaY });
      };

      const handleMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        const mapElement = document.getElementById('property-map');
        if (!mapElement) return;
        const rect = mapElement.getBoundingClientRect();
        
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const deltaX = mouseX - centerX;
        const deltaY = mouseY - centerY;
        
        const scale = 0.00003 * Math.pow(2, 15 - mapZoom);
        const newLat = mapMarker.lat - deltaY * scale;
        const newLng = mapMarker.lng + deltaX * scale;
        
        setMapMarker({ lat: newLat, lng: newLng });
        setFormData(prev => ({ ...prev, latitude: newLat.toFixed(6), longitude: newLng.toFixed(6) }));
        
        setIsDragging(false);
        setDragOffset({ x: 0, y: 0 });
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, mapMarker, mapZoom]);

  const generateInstagramCaption = () => {
    let caption = `🏡 ${formData.title}\n\n`;
    
    if (formData.priceType === 'fixed' && formData.price) {
      caption += `💰 Price: ${formData.price}\n`;
    } else if (formData.priceType === 'range' && formData.priceFrom && formData.priceTo) {
      caption += `💰 Price: ${formData.priceFrom} - ${formData.priceTo}\n`;
    }
    
    if (formData.beds && formData.beds.length > 0) {
      caption += `🛏️ ${formData.beds.join(', ')}\n`;
    }
    
    if (formData.sqft) {
      caption += `📐 Area: ${formData.sqft} sq.ft\n`;
    }
    
    if (formData.area) {
      caption += `📍 Location: ${formData.area}, ${formData.city}\n`;
    }
    
    caption += `\n${formData.description || ''}\n\n`;
    
    if (formData.amenities && formData.amenities.length > 0) {
      caption += `✨ Amenities:\n${formData.amenities.slice(0, 5).map(a => `${getAmenityEmoji(a)} ${a}`).join('\n')}\n`;
      if (formData.amenities.length > 5) {
        caption += `...and ${formData.amenities.length - 5} more!\n`;
      }
    }
    
    // Add property link
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ivantaproperty.com';
    const propertyUrl = propertySlug ? `${baseUrl}/property/${propertySlug}` : `${baseUrl}/property/${id}`;
    caption += `\n🔗 View Full Details: ${propertyUrl}\n`;
    
    caption += `\n📞 Contact: ${formData.contactPhone || formData.whatsappNumber || 'DM for details'}\n`;
    caption += `\n#IvantaProperty #RealEstate #Property #${formData.city} #${formData.propertyType}`;
    
    return caption;
  };

  const handleCopyCaption = () => {
    const caption = generateInstagramCaption();
    
    navigator.clipboard.writeText(caption).then(() => {
      toast.success('Caption Copied!', {
        description: 'Social media caption has been copied to clipboard.',
        duration: 3000,
      });
    }).catch(() => {
      toast.error('Failed to Copy', {
        description: 'Could not copy caption. Please try again.',
        duration: 3000,
      });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const propertyData = {
        ...formData,
        images,
        landmarks: selectedLandmarks.filter(l => l.name && l.distance),
        brochureUrl: brochureUrl || undefined,
        subdomain: enableSubdomain && subdomain ? subdomain : null,
      };

      const response = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Property Updated Successfully!', {
          description: 'Your changes have been saved.',
          duration: 4000,
        });
        setTimeout(() => router.push('/admin/dashboard'), 1000);
      } else {
        toast.error('Failed to Update Property', {
          description: result.error || 'An error occurred while updating the property.',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error('Something Went Wrong', {
        description: 'Failed to update property. Please try again.',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading property...</p>
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
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground">Edit Property</h1>
              <p className="text-xs text-muted-foreground">Update property details</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-6 py-8 max-w-5xl">
        <div className="mb-6 flex justify-end">
          <Button
            type="button"
            onClick={handleCopyCaption}
            variant="outline"
            className="gap-2 border-primary text-primary hover:bg-primary/10"
          >
            <Copy className="w-4 h-4" />
            Copy Caption for Social Media
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-xl border border-border card-shadow p-6">
            <h3 className="text-lg font-heading font-bold text-foreground mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-2 block">Property Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-2 block">Price Type</label>
                <div className="flex gap-3 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="priceType" checked={formData.priceType === 'fixed'} onChange={() => setFormData({ ...formData, priceType: 'fixed', priceFrom: '', priceTo: '' })} className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Fixed Price</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="priceType" checked={formData.priceType === 'range'} onChange={() => setFormData({ ...formData, priceType: 'range', price: '' })} className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Price Range (From - To)</span>
                  </label>
                </div>
                {formData.priceType === 'fixed' ? (
                  <input type="text" name="price" value={formData.price} onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">From</label>
                      <input type="text" name="priceFrom" value={formData.priceFrom} onChange={handleInputChange} placeholder="e.g., ₹1.5 Cr" className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">To</label>
                      <input type="text" name="priceTo" value={formData.priceTo} onChange={handleInputChange} placeholder="e.g., ₹3 Cr" className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Property Type</label>
                <input
                  type="text"
                  value={formData.propertyType}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-secondary text-sm"
                  disabled
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-2 block">Sub Type</label>
                <input
                  type="text"
                  value={formData.subType}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-secondary text-sm"
                  disabled
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-2 block">Address Line 1</label>
                <input
                  type="text"
                  name="street1"
                  value={formData.street1}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-2 block">Address Line 2</label>
                <input
                  type="text"
                  name="street2"
                  value={formData.street2}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-2 block">Address Line 3</label>
                <input
                  type="text"
                  name="street3"
                  value={formData.street3}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-2 block">Address Line 4</label>
                <input
                  type="text"
                  name="street4"
                  value={formData.street4}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-2 block">Area</label>
                <select
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Select Area</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">District</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">Property Location on Map *</label>
                  <button
                    type="button"
                    onClick={detectCurrentLocation}
                    disabled={isDetectingLocation}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDetectingLocation ? (
                      <>
                        <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        Detecting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Detect Current Location
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Use "Detect Current Location" button, enter coordinates manually, or drag the red marker on the map to set precise location.</p>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1.5 block">Latitude *</label>
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      onChange={(e) => {
                        const lat = parseFloat(e.target.value);
                        setFormData({ ...formData, latitude: e.target.value });
                        if (!isNaN(lat)) {
                          setMapMarker({ ...mapMarker, lat });
                        }
                      }}
                      placeholder="e.g., 23.0225"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1.5 block">Longitude *</label>
                    <input
                      type="text"
                      name="longitude"
                      value={formData.longitude}
                      onChange={(e) => {
                        const lng = parseFloat(e.target.value);
                        setFormData({ ...formData, longitude: e.target.value });
                        if (!isNaN(lng)) {
                          setMapMarker({ ...mapMarker, lng });
                        }
                      }}
                      placeholder="e.g., 72.5714"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>

                <div 
                  id="property-map"
                  className="relative w-full h-[500px] rounded-lg border-2 border-border overflow-hidden bg-secondary/20 select-none"
                  onClick={handleMapClick}
                  style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                >
                  <iframe
                    key={`${mapMarker.lat}-${mapMarker.lng}-${mapZoom}`}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapMarker.lng - 0.01 / Math.pow(2, mapZoom - 15)},${mapMarker.lat - 0.01 / Math.pow(2, mapZoom - 15)},${mapMarker.lng + 0.01 / Math.pow(2, mapZoom - 15)},${mapMarker.lat + 0.01 / Math.pow(2, mapZoom - 15)}&layer=mapnik`}
                    className="w-full h-full border-0 pointer-events-none"
                    title="Property Location Map"
                  />

                  <div
                    className={`absolute w-12 h-12 -ml-6 -mt-12 z-30 ${
                      isDragging ? 'scale-125 cursor-grabbing' : 'cursor-grab hover:scale-110 transition-transform'
                    }`}
                    style={{
                      left: isDragging ? `calc(50% + ${dragOffset.x}px)` : '50%',
                      top: isDragging ? `calc(50% + ${dragOffset.y}px)` : '50%',
                      transition: isDragging ? 'none' : 'transform 0.2s',
                      pointerEvents: 'auto'
                    }}
                    onMouseDown={handleMarkerDragStart}
                    onClick={(e) => e.stopPropagation()}
                    draggable={false}
                  >
                    <MapPin className="w-12 h-12 text-red-500 drop-shadow-2xl pointer-events-none" fill="currentColor" />
                    {!isDragging && (
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg pointer-events-none">
                        Drag to move
                      </div>
                    )}
                  </div>

                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-border z-20 pointer-events-none">
                    <p className="text-xs font-semibold text-foreground">📍 {mapMarker.lat.toFixed(6)}°N, {mapMarker.lng.toFixed(6)}°E</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Zoom: {mapZoom}x</p>
                  </div>

                  <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        zoomIn();
                      }}
                      className="w-10 h-10 bg-white hover:bg-gray-50 rounded-lg shadow-lg border border-border flex items-center justify-center transition-colors"
                      title="Zoom In"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        zoomOut();
                      }}
                      className="w-10 h-10 bg-white hover:bg-gray-50 rounded-lg shadow-lg border border-border flex items-center justify-center transition-colors"
                      title="Zoom Out"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                  </div>

                  <div className="absolute bottom-4 right-4 z-20">
                    <a
                      href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-white hover:bg-gray-50 rounded-lg shadow-lg border border-border transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in Google Maps
                    </a>
                  </div>
                </div>
                
                <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-border">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">📍 Latitude:</span>
                        <span className="text-sm text-blue-600 font-mono font-bold">{formData.latitude}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">📍 Longitude:</span>
                        <span className="text-sm text-purple-600 font-mono font-bold">{formData.longitude}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-3 block">Bedrooms</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {["1 BHK", "2 BHK", "2.5 BHK", "3 BHK", "4 BHK", "4+ BHK"].map((bedroom) => (
                    <label
                      key={bedroom}
                      className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.beds.includes(bedroom)}
                        onChange={() => handleBedroomToggle(bedroom)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                      />
                      <span className="text-sm text-foreground font-medium">{bedroom}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-2 block">Area (sq.ft)</label>
                <input
                  type="text"
                  name="sqft"
                  value={formData.sqft}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Badge</label>
                <select
                  name="badge"
                  value={formData.badge}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {formData.propertyType === "pg" ? (
                    <>
                      <option value="">Select Option</option>
                      <option value="Private">Private</option>
                      <option value="2 Sharing">2 Sharing</option>
                      <option value="3 Sharing">3 Sharing</option>
                      <option value="4 or More Sharing">4 or More Sharing</option>
                    </>
                  ) : (
                    <>
                      <option value="">No Badge</option>
                      <option value="New Launch">New Launch</option>
                      <option value="Under Construction">Under Construction</option>
                      <option value="Ready to Move">Ready to Move</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="None">None</option>
                  <option value="Featured Property">Featured Property</option>
                  <option value="Luxury Property">Luxury Property</option>
                  <option value="Popular Property">Popular Property</option>
                  <option value="Upcoming Projects">Upcoming Projects</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-foreground">Enable Custom Subdomain</span>
                      <p className="text-xs text-muted-foreground mt-0.5">Create a dedicated subdomain for this property</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableSubdomain}
                      onChange={(e) => setEnableSubdomain(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                {enableSubdomain && (
                  <div className="mt-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <label className="text-sm font-medium text-foreground mb-2 block">Subdomain Name</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="property-name"
                        className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">.ivantaproperty.com</span>
                    </div>
                    {subdomain && (
                      <div className="mt-2 p-3 bg-background rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Property will be accessible at:</p>
                        <p className="text-sm font-mono font-semibold text-primary break-all">
                          https://{subdomain}.ivantaproperty.com
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      💡 Use lowercase letters, numbers, and hyphens only. Example: luxury-villa-ahmedabad
                    </p>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border-2 border-green-500/30 bg-green-50/50 hover:bg-green-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isVerified}
                    onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                    className="w-5 h-5 rounded border-green-500 text-green-600 focus:ring-2 focus:ring-green-500/30"
                  />
                  <div>
                    <span className="text-sm font-semibold text-green-700 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified by Ivanta
                    </span>
                    <p className="text-xs text-green-600 mt-0.5">Show green verified badge on property card</p>
                  </div>
                </label>
              </div>

              {formData.propertyType === "pg" && (
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.foodAvailable}
                      onChange={(e) => setFormData({ ...formData, foodAvailable: e.target.checked })}
                      className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                    />
                    <div>
                      <span className="text-sm font-medium text-foreground">Food Available</span>
                      <p className="text-xs text-muted-foreground mt-0.5">Check if food/meals are provided</p>
                    </div>
                  </label>
                </div>
              )}

              {formData.propertyType === "pg" && (
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.acAvailable}
                      onChange={(e) => setFormData({ ...formData, acAvailable: e.target.checked })}
                      className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                    />
                    <div>
                      <span className="text-sm font-medium text-foreground">Air Conditioner Available</span>
                      <p className="text-xs text-muted-foreground mt-0.5">Check if AC is available in the room</p>
                    </div>
                  </label>
                </div>
              )}

              {(formData.propertyType === "buy" || formData.propertyType === "commercial") && (
                <>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.isResiCom}
                        onChange={(e) => setFormData({ ...formData, isResiCom: e.target.checked })}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                      />
                      <div>
                        <span className="text-sm font-medium text-foreground">Resi + Com</span>
                        <p className="text-xs text-muted-foreground mt-0.5">Check if this property is both Residential and Commercial</p>
                      </div>
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.isOfficeCom}
                        onChange={(e) => setFormData({ ...formData, isOfficeCom: e.target.checked })}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                      />
                      <div>
                        <span className="text-sm font-medium text-foreground">Office + Com</span>
                        <p className="text-xs text-muted-foreground mt-0.5">Check if this property is both Office and Commercial</p>
                      </div>
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.isNewProject}
                        onChange={(e) => setFormData({ ...formData, isNewProject: e.target.checked })}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                      />
                      <div>
                        <span className="text-sm font-medium text-foreground">New Project</span>
                        <p className="text-xs text-muted-foreground mt-0.5">Check if this property should appear in New Projects section</p>
                      </div>
                    </label>
                  </div>

                  {formData.isNewProject && (
                    <div className="md:col-span-2 bg-blue-50/50 border border-blue-200 rounded-xl p-5 space-y-4">
                      <h4 className="text-sm font-semibold text-foreground">New Project Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">Project Start Date</label>
                          <input type="date" name="projectStartDate" value={formData.projectStartDate} onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">Project End Date</label>
                          <input type="date" name="projectEndDate" value={formData.projectEndDate} onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">Possession / Expected Possession Date</label>
                          <input type="date" name="possessionDate" value={formData.possessionDate} onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">Total Floors</label>
                          <input type="number" name="totalFloors" value={formData.totalFloors} onChange={handleInputChange} min="0" placeholder="e.g., 10" className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">Total Flats per Floor</label>
                          <input type="number" name="flatsPerFloor" value={formData.flatsPerFloor} onChange={handleInputChange} min="0" placeholder="e.g., 4" className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">Total Wings</label>
                          <input type="number" name="totalWings" value={formData.totalWings} onChange={handleInputChange} min="0" placeholder="e.g., 2" className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                      </div>
                      {(() => {
                        const floors = parseInt(formData.totalFloors) || 0;
                        const perFloor = parseInt(formData.flatsPerFloor) || 0;
                        const wings = parseInt(formData.totalWings) || 0;
                        const totalFlats = floors * perFloor * wings;
                        const sold = parseInt(formData.totalSoldFlats) || 0;
                        const remaining = Math.max(totalFlats - sold, 0);
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-background rounded-lg border border-border">
                              <p className="text-xs text-muted-foreground">Total Flats (Floors × Per Floor × Wings)</p>
                              <p className="text-2xl font-bold text-foreground mt-1">{totalFlats}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">Total Sold Flats</label>
                                <input type="number" name="totalSoldFlats" value={formData.totalSoldFlats} onChange={handleInputChange} min="0" max={totalFlats || undefined} placeholder="0" className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                              </div>
                              <div className="p-3 bg-background rounded-lg border border-border self-end">
                                <p className="text-xs text-muted-foreground">Remaining Flats</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{remaining}</p>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-foreground mb-2 block">Parking — 4 Wheeler (per flat)</label>
                              <input type="number" name="parkingFourWheeler" value={formData.parkingFourWheeler} onChange={handleInputChange} min="0" placeholder="e.g., 1" className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-foreground mb-2 block">Parking — 2 Wheeler (per flat)</label>
                              <input type="number" name="parkingTwoWheeler" value={formData.parkingTwoWheeler} onChange={handleInputChange} min="0" placeholder="e.g., 1" className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </>
              )}

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Contact Phone</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  placeholder="e.g., +91 98765 43210"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">WhatsApp Number</label>
                <input
                  type="tel"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., +91 98765 43210"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-2 block">RERA</label>
                <input
                  type="text"
                  name="rera"
                  value={formData.rera}
                  onChange={handleInputChange}
                  placeholder="Enter RERA registration number"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-3 block">Facing Direction</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="facing"
                      value="North"
                      checked={formData.facing === "North"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary/30"
                    />
                    <span className="text-sm font-medium text-foreground">North</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="facing"
                      value="South"
                      checked={formData.facing === "South"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary/30"
                    />
                    <span className="text-sm font-medium text-foreground">South</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="facing"
                      value="East"
                      checked={formData.facing === "East"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary/30"
                    />
                    <span className="text-sm font-medium text-foreground">East</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="facing"
                      value="West"
                      checked={formData.facing === "West"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary/30"
                    />
                    <span className="text-sm font-medium text-foreground">West</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="bg-card rounded-xl border border-border card-shadow p-6">
            <h3 className="text-lg font-heading font-bold text-foreground mb-4">Social Media Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Instagram Link</label>
                <input
                  type="url"
                  name="instagramLink"
                  value={formData.instagramLink}
                  onChange={handleInputChange}
                  placeholder="https://instagram.com/..."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Facebook Link</label>
                <input
                  type="url"
                  name="facebookLink"
                  value={formData.facebookLink}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/..."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">YouTube Link</label>
                <input
                  type="url"
                  name="youtubeLink"
                  value={formData.youtubeLink}
                  onChange={handleInputChange}
                  placeholder="https://youtube.com/..."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>

          {/* Nearby Landmarks */}
          <div className="bg-card rounded-xl border border-border card-shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-heading font-bold text-foreground">Nearby Landmarks</h3>
                <p className="text-sm text-muted-foreground mt-1">Add landmarks with distance in minutes</p>
              </div>
              <Button
                type="button"
                onClick={handleAddLandmark}
                className="gradient-primary text-primary-foreground gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Landmark
              </Button>
            </div>

            {selectedLandmarks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg">
                No landmarks added. Click "Add Landmark" to add nearby places.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedLandmarks.map((landmark, index) => (
                  <div key={index} className="flex gap-3 items-start p-4 rounded-lg border border-border bg-background">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1.5 block">Landmark</label>
                        <select
                          value={landmark.name}
                          onChange={(e) => handleLandmarkChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          <option value="">Select Landmark</option>
                          {landmarks.map((lm) => (
                            <option key={lm} value={lm}>{lm}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1.5 block">Distance (in minutes)</label>
                        <input
                          type="text"
                          value={landmark.distance}
                          onChange={(e) => handleLandmarkChange(index, 'distance', e.target.value)}
                          placeholder="e.g., 5 min"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLandmark(index)}
                      className="mt-6 h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Images Section */}
          <div className="bg-card rounded-xl border border-border card-shadow p-6">
            <h3 className="text-lg font-heading font-bold text-foreground mb-4">Property Images</h3>
            
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
              <input
                type="file"
                id="image-upload"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">Click to upload images</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 50MB each</p>
              </label>
            </div>

            {images.length > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground mb-3 mt-4">Uploaded Images (Drag to reorder)</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className="relative group cursor-move"
                    >
                      <div className="absolute top-2 left-2 z-10 w-6 h-6 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-4 h-4 text-foreground" />
                      </div>
                      <div className="absolute top-2 left-2 z-10 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <img
                        src={image}
                        alt={`Property ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-border group-hover:border-primary transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Brochure Upload */}
          <div className="bg-card rounded-xl border border-border card-shadow p-6">
            <h3 className="text-lg font-heading font-bold text-foreground mb-4">Property Brochure (PDF)</h3>
            
            {!brochureUrl ? (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  id="brochure-upload"
                  accept="application/pdf"
                  onChange={handleBrochureUpload}
                  className="hidden"
                />
                <label htmlFor="brochure-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">Click to upload brochure</p>
                  <p className="text-xs text-muted-foreground">PDF up to 50MB</p>
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Brochure uploaded</p>
                    <p className="text-xs text-muted-foreground">PDF document</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setBrochureUrl("")}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Amenities Section - Editable based on property type and subtype */}
          {((formData.propertyType === "buy" || formData.propertyType === "rent") && formData.subType === "Flat / Apartment") && (
            <div className="bg-card rounded-xl border border-border card-shadow p-6">
              <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  "24/7 Security with CCTV", "Intercom system", "Power backup / generator", "Covered parking / basement parking",
                  "High-speed elevators", "Fire safety system", "Water supply & water storage", "Visitor parking",
                  "Clubhouse", "Children play area", "Multipurpose hall / party hall", "Indoor games",
                  "Jogging track", "Community garden", "Senior citizen sitting area", "Library / reading room",
                  "Swimming pool", "Gym / fitness center", "Yoga & meditation deck", "Badminton court",
                  "Basketball court", "Open exercise park", "Cycling track", "Mini theatre",
                  "Rooftop lounge", "Smart home automation", "Guest rooms", "EV charging points",
                  "Wi-fi service", "Smart security access (face recognition / RFID)", "Rooftop gardens", "Movie theater"
                ].map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                    <input type="checkbox" checked={formData.amenities.includes(amenity)} onChange={() => handleAmenityToggle(amenity)} className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30" />
                    <span className="text-sm text-foreground">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {((formData.propertyType === "buy" || formData.propertyType === "rent") && formData.subType === "House / Villa") && (
            <div className="bg-card rounded-xl border border-border card-shadow p-6">
              <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  "Private parking / garage", "Private garden / lawn", "Large balcony or terrace", "24×7 gated community security",
                  "Power backup", "Water storage & borewell", "Wide internal roads", "Compound wall & private gate",
                  "Private swimming pool", "Outdoor sitting / patio", "Barbecue area", "Rooftop lounge",
                  "Landscaped backyard", "Garden gazebo", "Outdoor dining area", "Kids play lawn",
                  "Private gym", "Home theatre", "Yoga / meditation room", "Indoor games room",
                  "Entertainment lounge", "Smart home automation", "EV charging station", "Private elevator (in big villas)",
                  "Walk-in wardrobe", "Double height living room", "Glass façade architecture", "Private office / study room"
                ].map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                    <input type="checkbox" checked={formData.amenities.includes(amenity)} onChange={() => handleAmenityToggle(amenity)} className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30" />
                    <span className="text-sm text-foreground">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {(formData.propertyType === "pg" && (formData.subType === "Boys" || formData.subType === "Girls")) && (
            <div className="bg-card rounded-xl border border-border card-shadow p-6">
              <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  "Bed with mattress", "Wardrobe / cupboard", "Study table & chair", "Fan / air conditioning",
                  "Attached or shared bathroom", "Wi-Fi connection", "Power backup", "Cleaning service",
                  "Daily meal service (breakfast, lunch, dinner)", "Common dining area", "Shared kitchen", "Refrigerator",
                  "Microwave", "RO drinking water", "Laundry facility", "CCTV security",
                  "Biometric / access card entry", "24×7 security guard", "Visitor management", "Bike parking",
                  "Fire safety system", "Housekeeping services", "Common lounge", "TV / entertainment room",
                  "Gym", "Indoor games", "Rooftop seating area", "Co-working / study room", "Air-conditioned rooms"
                ].map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                    <input type="checkbox" checked={formData.amenities.includes(amenity)} onChange={() => handleAmenityToggle(amenity)} className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30" />
                    <span className="text-sm text-foreground">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {formData.amenities && formData.amenities.length > 0 && !(
            ((formData.propertyType === "buy" || formData.propertyType === "rent") && (formData.subType === "Flat / Apartment" || formData.subType === "House / Villa")) ||
            (formData.propertyType === "pg" && (formData.subType === "Boys" || formData.subType === "Girls"))
          ) && (
            <div className="bg-card rounded-xl border border-border card-shadow p-6">
              <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {formData.amenities.length} amenities selected. Full amenity editing for this property type coming soon.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {formData.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-foreground p-2 bg-secondary/50 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gradient-primary text-primary-foreground font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Property'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Upload, X, GripVertical } from "lucide-react";
import { toast } from "sonner";

export default function PostPropertyPage() {
  const router = useRouter();
  const [areas, setAreas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [propertyFor, setPropertyFor] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("");
  const [subPropertyTypes, setSubPropertyTypes] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [activePropertiesCount, setActivePropertiesCount] = useState(0);
  const [propertyLimit, setPropertyLimit] = useState(0);

  useEffect(() => {
    checkAuth();
    fetchAreas();
  }, []);

  useEffect(() => {
    if (propertyType === "Residential") {
      setSubPropertyTypes([
        "Flat / Apartment",
        "House / Villa",
        "Bungalow",
        "New Builder Project",
        "Pent House",
        "Studio Apartment",
        "Duplex",
        "Triplex",
        "Tenement"
      ]);
    } else if (propertyType === "Commercial") {
      setSubPropertyTypes([
        "Office",
        "Shop",
        "Showroom",
        "Warehouse / Godown",
        "Co Working Space",
        "Business Center / Business Park",
        "Commercial Land",
        "Industrial / Factory Building",
        "Industrial Sheds",
        "Hotel",
        "School",
        "Hospital"
      ]);
    } else if (propertyType === "Plot / Land") {
      setSubPropertyTypes([
        "Agriculture Land",
        "Industrial Land",
        "Residential Land",
        "Plots / Lands",
        "Farm House"
      ]);
    } else {
      setSubPropertyTypes([]);
    }
  }, [propertyType]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
      } else {
        const data = await response.json();
        setUserEmail(data.data.email);
        
        // Redirect builders to simplified page
        if (data.data.role === 'Builder') {
          router.push('/admin/dashboard/add-property?mode=builder');
          return;
        }
        
        // Set property limits based on role
        const limit = data.data.role === 'User' ? 1 : data.data.role === 'Broker' ? 10 : 0;
        setPropertyLimit(limit);
        
        // Fetch active properties count
        await fetchActivePropertiesCount(data.data.email);
        
        setIsLoading(false);
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchActivePropertiesCount = async (email: string) => {
    try {
      const response = await fetch(`/api/user-properties?email=${email}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Count only active properties (not sold or sold within last 10 days)
          const tenDaysAgo = new Date();
          tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
          
          const activeCount = result.data.filter((prop: any) => {
            if (!prop.isSold) return true;
            if (prop.soldDate && new Date(prop.soldDate) >= tenDaysAgo) return true;
            return false;
          }).length;
          
          setActivePropertiesCount(activeCount);
        }
      }
    } catch (error) {
      console.error('Error fetching properties count:', error);
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await fetch('/api/settings');
      const result = await response.json();
      
      if (result.success) {
        setAreas(result.data.areas || ['Nana Mava']);
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
      setAreas(['Nana Mava']);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);
            
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            setImages((prev) => [...prev, compressedBase64]);
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    // Determine correct propertyType based on Property For and Property Type
    let finalPropertyType = '';
    let rentalCategory = '';
    
    if (propertyFor === 'Sell') {
      // For Sell, map to buy/commercial/plot based on Property Type
      if (propertyType === 'Residential') {
        finalPropertyType = 'buy';
      } else if (propertyType === 'Commercial') {
        finalPropertyType = 'commercial';
      } else if (propertyType === 'Plot / Land') {
        finalPropertyType = 'plot';
      }
    } else if (propertyFor === 'Rent') {
      // For Rent, always use 'rent' and set rentalCategory
      finalPropertyType = 'rent';
      if (propertyType === 'Residential') {
        rentalCategory = 'residential';
      } else if (propertyType === 'Commercial') {
        rentalCategory = 'commercial';
      } else if (propertyType === 'Plot / Land') {
        rentalCategory = 'plot';
      }
    }
    
    const propertyData = {
      title: formData.get('title'),
      price: formData.get('price'),
      propertyType: finalPropertyType,
      subType: formData.get('subType'),
      rentalCategory: rentalCategory || undefined,
      street1: formData.get('address'),
      area: formData.get('area'),
      city: formData.get('city'),
      state: formData.get('state'),
      pincode: formData.get('pincode'),
      latitude: "23.0225",
      longitude: "72.5714",
      beds: [formData.get('beds')],
      baths: formData.get('baths'),
      sqft: formData.get('carpetArea'),
      description: formData.get('description'),
      amenities: [],
      images: images,
      contactPhone: formData.get('contactPhone'),
      whatsappNumber: formData.get('whatsappNumber'),
      userEmail: userEmail,
    };

    try {
      const response = await fetch('/api/user-properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Property Submitted!', {
          description: 'Your property has been submitted for review.',
          duration: 5000,
        });
        // Store email for my-properties page
        localStorage.setItem('userEmail', userEmail);
        router.push('/my-properties');
      } else {
        toast.error('Submission Failed', {
          description: result.error || 'Failed to submit property.',
          duration: 5000,
        });
      }
    } catch (error) {
      toast.error('Something Went Wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 lg:px-6 py-10">
          <div className="text-center py-20">
            <div>Checking authentication...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 lg:px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">Post Your Property</h1>
          <p className="text-muted-foreground text-sm mb-2">Fill in the details below to list your property for free</p>
          
          {/* Property Limit Info */}
          {propertyLimit > 0 && (
            <div className={`mb-6 p-4 rounded-lg border ${
              activePropertiesCount >= propertyLimit 
                ? 'bg-red-50 border-red-200' 
                : activePropertiesCount >= propertyLimit * 0.8 
                  ? 'bg-yellow-50 border-yellow-200' 
                  : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${
                    activePropertiesCount >= propertyLimit 
                      ? 'text-red-700' 
                      : activePropertiesCount >= propertyLimit * 0.8 
                        ? 'text-yellow-700' 
                        : 'text-blue-700'
                  }`}>
                    Property Limit: {activePropertiesCount} / {propertyLimit} active properties
                  </p>
                  <p className={`text-xs mt-1 ${
                    activePropertiesCount >= propertyLimit 
                      ? 'text-red-600' 
                      : activePropertiesCount >= propertyLimit * 0.8 
                        ? 'text-yellow-600' 
                        : 'text-blue-600'
                  }`}>
                    {activePropertiesCount >= propertyLimit 
                      ? 'You have reached your property limit. Mark an existing property as sold to post a new one.' 
                      : `You can post ${propertyLimit - activePropertiesCount} more ${propertyLimit - activePropertiesCount === 1 ? 'property' : 'properties'}.`
                    }
                  </p>
                </div>
                {activePropertiesCount >= propertyLimit && (
                  <button
                    onClick={() => router.push('/my-properties')}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Manage Properties
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="bg-card rounded-xl card-shadow p-6">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              
              {/* Property Information */}
              <div>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Property Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Property For *</label>
                    <select 
                      value={propertyFor}
                      onChange={(e) => setPropertyFor(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="">Select</option>
                      <option value="Sell">Sell</option>
                      <option value="Rent">Rent</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Property Type *</label>
                    <select 
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="">Select</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Plot / Land">Plot / Land</option>
                    </select>
                  </div>
                  {propertyType && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Sub Property Type *</label>
                      <select name="subType" required className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="">Select Sub Type</option>
                        {subPropertyTypes.map((subType) => (
                          <option key={subType} value={subType}>{subType}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Property Details */}
              <div>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Property Details</h3>
                <div className="flex flex-col gap-4">
                  <input name="title" type="text" placeholder="Property Title *" required className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select name="beds" className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">Bedrooms</option>
                      <option value="1 BHK">1 BHK</option>
                      <option value="2 BHK">2 BHK</option>
                      <option value="2.5 BHK">2.5 BHK</option>
                      <option value="3 BHK">3 BHK</option>
                      <option value="4 BHK">4 BHK</option>
                      <option value="4+ BHK">4+ BHK</option>
                    </select>
                    <input name="baths" type="number" placeholder="Bathrooms" min="1" className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>

                  <input name="carpetArea" type="number" placeholder="Carpet Area (sq.ft.) *" required className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <textarea name="description" rows={5} placeholder="Description *" required className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Pricing</h3>
                <input name="price" type="text" placeholder="Expected Price (₹) *" required className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>

              {/* Location */}
              <div>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Location</h3>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="city" type="text" placeholder="City *" required className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <select name="area" required className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">Select Area *</option>
                      {areas.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                  <input name="address" type="text" placeholder="Complete Address *" required className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="state" type="text" placeholder="State *" required className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <input name="pincode" type="text" placeholder="Pincode *" required maxLength={6} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
              </div>

              {/* Photos */}
              <div>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Property Photos</h3>
                
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <input type="file" id="image-upload" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">Click to upload images</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB each</p>
                  </label>
                </div>

                {images.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3 mt-4">Uploaded Images (Drag to reorder)</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)} className="relative group cursor-move">
                          <div className="absolute top-2 left-2 z-10 w-6 h-6 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="w-4 h-4 text-foreground" />
                          </div>
                          <div className="absolute top-2 left-2 z-10 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">{index + 1}</div>
                          <img src={image} alt={`Property ${index + 1}`} className="w-full h-32 object-cover rounded-lg border-2 border-border group-hover:border-primary transition-colors" />
                          <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Details */}
              <div>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="contactPhone" type="tel" placeholder="Phone Number *" required className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <input name="whatsappNumber" type="tel" placeholder="WhatsApp Number" className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || (propertyLimit > 0 && activePropertiesCount >= propertyLimit)} 
                  className="w-full gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity py-6 text-base disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 
                   (propertyLimit > 0 && activePropertiesCount >= propertyLimit) ? 'Property Limit Reached' : 
                   'Submit Property for Review'}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Your property will be reviewed by our team and published within 24 hours.
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

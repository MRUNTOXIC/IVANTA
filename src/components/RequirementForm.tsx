"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RequirementFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const RequirementForm = ({ isOpen, onClose }: RequirementFormProps) => {
  const [areas, setAreas] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    lookingFor: "", // Buy or Rent
    propertyType: "",
    propertySubType: "",
    areas: [] as string[], // Multiple areas
    budgetFrom: "",
    budgetTo: "",
    bhk: "",
    sqft: "",
    contactNumber: "",
    timeframe: "",
    email: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch areas from settings (all defined areas by admin)
        const settingsResponse = await fetch('/api/settings');
        const settingsData = await settingsResponse.json();
        if (settingsData.success) {
          setAreas(settingsData.data.areas || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Get sub types based on selected property type (matching admin panel options)
  const getSubTypeOptions = () => {
    if (!formData.propertyType) return [];
    
    const subTypeMap: { [key: string]: string[] } = {
      'residential': [
        'Flat / Apartment',
        'House / Villa',
        'Bungalow',
        'New Builder Project',
        'Pent House',
        'Studio Apartment',
        'Duplex',
        'Triplex',
        'Tenement'
      ],
      'commercial': [
        'Office',
        'Shop',
        'Showroom',
        'Warehouse / Godown',
        'Co Working Space',
        'Business Center / Business Park',
        'Commercial Land',
        'Industrial / Factory Building',
        'Industrial Sheds',
        'Hotel',
        'School',
        'Hospital'
      ],
      'plot': [
        'Agriculture Land',
        'Industrial Land',
        'Residential Land',
        'Plots / Lands',
        'Farm House'
      ]
    };
    
    return subTypeMap[formData.propertyType] || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contactNumber || !formData.email) {
      toast.error("Please fill in contact number and email");
      return;
    }

    if (!formData.lookingFor) {
      toast.error("Please select Buy or Rent");
      return;
    }

    try {
      const response = await fetch('/api/requirement-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Your inquiry has been submitted! We'll contact you soon.");
        setFormData({
          lookingFor: "",
          propertyType: "",
          propertySubType: "",
          areas: [],
          budgetFrom: "",
          budgetTo: "",
          bhk: "",
          sqft: "",
          contactNumber: "",
          timeframe: "",
          email: "",
        });
        onClose();
      } else {
        toast.error(result.error || "Failed to submit inquiry");
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleAreaChange = (area: string) => {
    setFormData(prev => ({
      ...prev,
      areas: prev.areas.includes(area)
        ? prev.areas.filter(item => item !== area)
        : [...prev.areas, area]
    }));
  };

  const handleRadioChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      lookingFor: value
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Looking For - Buy/Rent Radio Buttons */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">Property Inquiry</h2>
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Looking For <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="lookingFor"
                  value="buy"
                  checked={formData.lookingFor === 'buy'}
                  onChange={() => handleRadioChange('buy')}
                  className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary/30 cursor-pointer"
                />
                <span className="text-sm font-medium text-foreground">Buy</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="lookingFor"
                  value="rent"
                  checked={formData.lookingFor === 'rent'}
                  onChange={() => handleRadioChange('rent')}
                  className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary/30 cursor-pointer"
                />
                <span className="text-sm font-medium text-foreground">Rent</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Property Type */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Property Type
              </label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select Type</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="plot">Plot / Land</option>
              </select>
            </div>

            {/* Property Sub Type */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Property Sub Type
              </label>
              <select
                name="propertySubType"
                value={formData.propertySubType}
                onChange={handleInputChange}
                disabled={!formData.propertyType}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{formData.propertyType ? 'Select Sub Type' : 'Select Property Type First'}</option>
                {getSubTypeOptions().map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Area - Multiple Selection */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Area (Select one or more)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-border rounded-lg bg-background max-h-48 overflow-y-auto">
                {areas.map((area) => (
                  <label key={area} className="flex items-center gap-2 cursor-pointer hover:bg-secondary/50 p-2 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.areas.includes(area)}
                      onChange={() => handleAreaChange(area)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary/30 cursor-pointer"
                    />
                    <span className="text-sm text-foreground">{area}</span>
                  </label>
                ))}
              </div>
              {formData.areas.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Selected: {formData.areas.join(', ')}
                </p>
              )}
            </div>

            {/* Budget Range - From/To */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Budget Range (₹)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="budgetFrom"
                  value={formData.budgetFrom}
                  onChange={handleInputChange}
                  placeholder="From (e.g., 500000)"
                  min="0"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="number"
                  name="budgetTo"
                  value={formData.budgetTo}
                  onChange={handleInputChange}
                  placeholder="To (e.g., 2000000)"
                  min="0"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* BHK */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                BHK
              </label>
              <input
                type="text"
                name="bhk"
                value={formData.bhk}
                onChange={handleInputChange}
                placeholder="e.g., 2 BHK, 3 BHK"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Sq.ft. */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Carpet Area (Sq.ft.)
              </label>
              <input
                type="number"
                name="sqft"
                value={formData.sqft}
                onChange={handleInputChange}
                placeholder="e.g., 1200"
                min="0"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                pattern="[0-9]{10}"
                maxLength={10}
                required
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Timeframe */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Timeframe of Purchase
              </label>
              <input
                type="date"
                name="timeframe"
                value={formData.timeframe}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-primary text-primary-foreground font-semibold"
            >
              Submit Inquiry
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequirementForm;

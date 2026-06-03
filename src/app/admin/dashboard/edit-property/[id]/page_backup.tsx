"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, Building2, Store, MapPin, Upload, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

type PropertyType = "buy" | "rent" | "commercial" | "plot" | "pg" | "";

export default function AddPropertyPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [step, setStep] = useState(1);
  const [propertyType, setPropertyType] = useState<PropertyType>("");
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    street1: "",
    street2: "",
    street3: "",
    street4: "",
    area: "",
    state: "",
    district: "",
    city: "",
    pincode: "",
    latitude: "23.0225",
    longitude: "72.5714",
    beds: "",
    baths: "",
    sqft: "",
    description: "",
    badge: "",
    subType: "",
    amenities: [] as string[],
    foodAvailable: false,
    rentalCategory: "",
  });
  const [mapMarker, setMapMarker] = useState<{ lat: number; lng: number }>({ lat: 23.0225, lng: 72.5714 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [mapZoom, setMapZoom] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    // Calculate offset from center (marker is always at center)
    const offsetLat = (0.5 - y / rect.height) * 0.02; // 0.02 degree range
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
        
        // Get mouse position relative to map center
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const deltaX = mouseX - centerX;
        const deltaY = mouseY - centerY;
        
        // Store drag offset for visual marker position
        setDragOffset({ x: deltaX, y: deltaY });
      };

      const handleMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        const mapElement = document.getElementById('property-map');
        if (!mapElement) return;
        const rect = mapElement.getBoundingClientRect();
        
        // Calculate final position based on where mouse was released
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const deltaX = mouseX - centerX;
        const deltaY = mouseY - centerY;
        
        // Convert pixel movement to lat/lng
        const scale = 0.00003 * Math.pow(2, 15 - mapZoom);
        const newLat = mapMarker.lat - deltaY * scale;
        const newLng = mapMarker.lng + deltaX * scale;
        
        // Update map marker and form data
        setMapMarker({ lat: newLat, lng: newLng });
        setFormData(prev => ({ ...prev, latitude: newLat.toFixed(6), longitude: newLng.toFixed(6) }));
        
        // Reset drag state
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

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    if (auth !== "true") {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const propertyTypes = [
    {
      id: "buy",
      label: "Residential",
      description: "Apartments, Villas, Houses for Sale",
      icon: Home,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "rent",
      label: "Rental",
      description: "Properties Available for Rent",
      icon: Building2,
      color: "from-green-500 to-green-600",
    },
    {
      id: "commercial",
      label: "Commercial",
      description: "Offices, Shops, Warehouses",
      icon: Store,
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "plot",
      label: "Plot / Land",
      description: "Residential & Commercial Plots",
      icon: MapPin,
      color: "from-orange-500 to-orange-600",
    },
    {
      id: "pg",
      label: "PG / Hostel",
      description: "Paying Guest & Hostels",
      icon: Building2,
      color: "from-amber-500 to-amber-600",
    },
  ];

  const apartmentAmenities = [
    "24/7 Security with CCTV",
    "Intercom system",
    "Power backup / generator",
    "Covered parking / basement parking",
    "High-speed elevators",
    "Fire safety system",
    "Water supply & water storage",
    "Visitor parking",
    "Clubhouse",
    "Children play area",
    "Multipurpose hall / party hall",
    "Indoor games",
    "Jogging track",
    "Community garden",
    "Senior citizen sitting area",
    "Library / reading room",
    "Swimming pool",
    "Gym / fitness center",
    "Yoga & meditation deck",
    "Badminton court",
    "Basketball court",
    "Open exercise park",
    "Cycling track",
    "Mini theatre",
    "Rooftop lounge",
    "Smart home automation",
    "Guest rooms",
    "EV charging points",
    "Wi-fi service",
    "Smart security access (face recognition / RFID)",
    "Rooftop gardens",
    "Movie theater",
  ];

  const villaAmenities = [
    "Private parking / garage",
    "Private garden / lawn",
    "Large balcony or terrace",
    "24×7 gated community security",
    "Power backup",
    "Water storage & borewell",
    "Wide internal roads",
    "Compound wall & private gate",
    "Private swimming pool",
    "Outdoor sitting / patio",
    "Barbecue area",
    "Rooftop lounge",
    "Landscaped backyard",
    "Garden gazebo",
    "Outdoor dining area",
    "Kids play lawn",
    "Private gym",
    "Home theatre",
    "Yoga / meditation room",
    "Indoor games room",
    "Entertainment lounge",
    "Smart home automation",
    "EV charging station",
    "Private elevator (in big villas)",
    "Walk-in wardrobe",
    "Double height living room",
    "Glass façade architecture",
    "Private office / study room",
  ];

  const officeAmenities = [
    "Reception / lobby area",
    "High-speed elevators",
    "Visitor waiting area",
    "Basement / multilevel parking",
    "24×7 security",
    "CCTV surveillance",
    "Power backup (generator)",
    "Fire safety system",
    "Conference / meeting rooms",
    "Open workspace areas",
    "Private cabins",
    "Co-working spaces",
    "High-speed internet infrastructure",
    "IT server room",
    "Business lounge",
    "Training rooms",
    "Cafeteria / food court",
    "Breakout areas",
    "Pantry / coffee stations",
    "Terrace lounge",
    "Gym / wellness center",
    "Indoor games",
    "Relaxation zones",
    "Smart access control (RFID / biometric)",
    "EV charging stations",
    "Green building features",
    "Solar power systems",
    "Rooftop gardens",
    "Centralized HVAC system",
    "Video conferencing facilities",
    "Smart lighting & automation",
  ];

  const shopAmenities = [
    "Street-facing entrance",
    "Glass storefront / display windows",
    "Rolling shutter / security shutter",
    "Signage space",
    "Adequate lighting",
    "Electricity connection",
    "Water supply",
    "Fire safety equipment",
    "Customer parking",
    "Elevators / escalators",
    "Public restrooms",
    "Wide corridors / walkways",
    "Wheelchair accessibility",
    "Security & CCTV",
    "ATM nearby",
    "Storage room / inventory space",
    "Billing counter / POS system",
    "Air conditioning",
    "Back office space",
    "Internet connectivity",
    "Display racks / shelving",
    "CCTV inside shop",
    "Digital advertising screens",
  ];

  const showroomAmenities = [
    "Large display area",
    "Glass façade / storefront",
    "Reception or welcome desk",
    "High ceiling showroom space",
    "Good interior lighting",
    "Power backup",
    "CCTV security",
    "Fire safety system",
    "Customer waiting lounge",
    "Comfortable seating area",
    "Customer parking",
    "Refreshment / coffee area",
    "Air conditioning",
    "Restrooms",
    "Wheelchair accessibility",
    "Office cabins",
    "Billing counter / POS system",
    "Inventory storage room",
    "Product display racks",
    "Meeting rooms",
    "High-speed internet",
    "Security alarm system",
    "Digital display screens",
    "Interactive product displays",
    "Smart lighting systems",
    "Brand signage area",
    "Test drive area (for car showrooms)",
    "EV charging stations",
    "Customer experience zones",
  ];

  const warehouseAmenities = [
    "Large storage space",
    "High ceiling height",
    "Wide shutter / loading entrance",
    "Truck loading dock",
    "Industrial flooring",
    "24×7 security",
    "CCTV surveillance",
    "Fire safety system",
    "Truck parking area",
    "Loading / unloading bays",
    "Container access",
    "Wide internal roads",
    "Dock levelers",
    "Weighbridge nearby",
    "Easy highway connectivity",
    "Office space",
    "Staff rest area",
    "Storage racks / pallet systems",
    "Inventory management area",
    "Security control room",
    "Internet connectivity",
    "Washrooms",
    "Automated storage systems",
    "Warehouse management system (WMS)",
    "Cold storage facility",
    "Solar panels",
    "Energy-efficient lighting",
    "Temperature control",
    "EV truck charging",
  ];

  const commercialLandAmenities = [
    "Road access",
    "Wide frontage",
    "Boundary wall / fencing",
    "Electricity connection nearby",
    "Water supply availability",
    "Drainage system",
    "Street lighting",
    "Clear land title",
    "Highway connectivity",
    "Main road frontage",
    "Near metro / railway station",
    "Near city center",
    "Near industrial zones",
    "Corner plot",
    "Easy access for trucks",
    "Flat / leveled land",
    "Commercial zoning approval",
    "High Floor Space Index (FSI)",
    "Large plot size",
    "Parking development potential",
    "Heavy vehicle access",
    "Construction-ready site",
    "Near IT parks",
    "Near airports",
    "Near malls / commercial centers",
    "Near business districts",
    "High footfall potential",
    "Smart city development area",
    "Future growth zone",
  ];

  const agriculturalLandAmenities = [
    "Fertile soil",
    "Flat cultivable land",
    "Clear land title",
    "Boundary fencing",
    "Agricultural zoning",
    "Crop cultivation area",
    "Large plot size",
    "Borewell / tube well",
    "Irrigation system",
    "Water canal nearby",
    "Water storage tank",
    "Drip irrigation system",
    "Sprinkler irrigation",
    "Rainwater harvesting",
    "Farm access road",
    "Tractor access",
    "Farm equipment storage",
    "Farmhouse / small shed",
    "Electricity connection for pump",
    "Storage area for crops",
    "Worker shelter",
    "Greenhouse / polyhouse",
    "Solar irrigation pumps",
    "Organic farming setup",
    "Smart irrigation systems",
    "Cold storage nearby",
    "Agricultural research support",
    "Crop monitoring technology",
  ];

  const pgAmenities = [
    "Bed with mattress",
    "Wardrobe / cupboard",
    "Study table & chair",
    "Fan / air conditioning",
    "Attached or shared bathroom",
    "Wi-Fi connection",
    "Power backup",
    "Cleaning service",
    "Daily meal service (breakfast, lunch, dinner)",
    "Common dining area",
    "Shared kitchen",
    "Refrigerator",
    "Microwave",
    "RO drinking water",
    "Laundry facility",
    "CCTV security",
    "Biometric / access card entry",
    "24×7 security guard",
    "Visitor management",
    "Bike parking",
    "Fire safety system",
    "Housekeeping services",
    "Common lounge",
    "TV / entertainment room",
    "Gym",
    "Indoor games",
    "Rooftop seating area",
    "Co-working / study room",
    "Air-conditioned rooms",
  ];

  const hostelAmenities = [
    "Single / bunk beds",
    "Mattress and pillow",
    "Personal locker / wardrobe",
    "Study table & chair",
    "Fan or air conditioning",
    "Shared or attached bathrooms",
    "Wi-Fi internet",
    "Power backup",
    "Mess / meal service",
    "Dining hall",
    "Shared kitchen",
    "RO drinking water",
    "Refrigerator",
    "Microwave",
    "Snack / tea area",
    "Study room",
    "Library / reading room",
    "Common TV lounge",
    "Indoor games room",
    "Computer room",
    "Discussion rooms",
    "CCTV surveillance",
    "Security guard",
    "Biometric / ID card entry",
    "Laundry facility",
    "Bike / cycle parking",
    "Housekeeping services",
    "Medical assistance / first aid",
  ];

  const bungalowAmenities = [
    "Private parking / large garage",
    "Spacious private garden",
    "Large compound with boundary wall",
    "Private gate & entrance",
    "24×7 security",
    "Power backup",
    "Water storage & borewell",
    "Wide balconies",
    "Large terrace / rooftop",
    "Private swimming pool",
    "Outdoor sitting area",
    "Barbecue area",
    "Landscaped lawn",
    "Garden gazebo",
    "Kids play area",
    "Outdoor dining space",
    "Private gym",
    "Home theatre",
    "Library / study room",
    "Entertainment lounge",
    "Servant quarters",
    "Guest rooms",
    "Walk-in wardrobes",
    "Smart home automation",
    "EV charging station",
    "Solar panels",
    "Rainwater harvesting",
    "CCTV security",
    "Video door phone",
  ];

  const newBuilderProjectAmenities = [
    "Gated community",
    "24/7 Security with CCTV",
    "Grand entrance lobby",
    "High-speed elevators",
    "Power backup",
    "Covered parking",
    "Visitor parking",
    "Fire safety system",
    "Earthquake resistant structure",
    "Clubhouse",
    "Swimming pool",
    "Gym / fitness center",
    "Yoga & meditation area",
    "Indoor games room",
    "Children play area",
    "Jogging track",
    "Cycling track",
    "Badminton court",
    "Basketball court",
    "Tennis court",
    "Multipurpose hall",
    "Party lawn",
    "Amphitheatre",
    "Mini theatre",
    "Library",
    "Co-working spaces",
    "Cafeteria",
    "Convenience store",
    "Landscaped gardens",
    "Water features / fountains",
    "Rooftop lounge",
    "Sky deck",
    "Smart home features",
    "Video door phone",
    "EV charging stations",
    "Solar panels",
    "Rainwater harvesting",
    "Sewage treatment plant",
    "Wi-Fi connectivity",
  ];

  const pentHouseAmenities = [
    "Private elevator access",
    "Exclusive entrance",
    "Panoramic views",
    "Large private terrace",
    "Rooftop garden",
    "Private swimming pool",
    "Jacuzzi",
    "Outdoor lounge area",
    "Barbecue deck",
    "Sky dining area",
    "Floor-to-ceiling windows",
    "Double height living room",
    "Premium flooring",
    "Modular kitchen",
    "Walk-in wardrobes",
    "Master bedroom suite",
    "Private gym",
    "Home theatre",
    "Wine cellar",
    "Study / home office",
    "Guest rooms",
    "Servant quarters",
    "Smart home automation",
    "Central air conditioning",
    "Video door phone",
    "CCTV security",
    "Private parking (3-4 cars)",
    "EV charging point",
    "Power backup",
    "High-speed internet",
  ];

  const studioApartmentAmenities = [
    "Open floor plan",
    "Compact modular kitchen",
    "Built-in wardrobes",
    "Attached bathroom",
    "Balcony",
    "Air conditioning",
    "Ceiling fan",
    "Power backup",
    "24/7 security",
    "CCTV surveillance",
    "Intercom system",
    "Covered parking",
    "Elevator access",
    "Fire safety system",
    "Water supply",
    "Wi-Fi ready",
    "Gym access",
    "Swimming pool (shared)",
    "Clubhouse",
    "Laundry facility",
    "Visitor parking",
    "Children play area",
    "Jogging track",
    "Community garden",
    "Smart home features",
    "Video door phone",
    "EV charging points",
    "Rainwater harvesting",
  ];

  const duplexAmenities = [
    "Two-level living space",
    "Internal staircase",
    "Separate living & dining areas",
    "Modular kitchen",
    "Multiple balconies",
    "Private terrace",
    "Master bedroom suite",
    "Walk-in wardrobes",
    "Attached bathrooms",
    "Guest bedroom",
    "Study room",
    "Utility area",
    "Servant room",
    "Private parking",
    "24/7 security",
    "CCTV surveillance",
    "Video door phone",
    "Intercom system",
    "Power backup",
    "High-speed elevators",
    "Fire safety system",
    "Clubhouse access",
    "Swimming pool",
    "Gym / fitness center",
    "Children play area",
    "Jogging track",
    "Landscaped gardens",
    "Smart home automation",
    "EV charging station",
    "Wi-Fi connectivity",
  ];

  const triplexAmenities = [
    "Three-level living space",
    "Internal staircase",
    "Private elevator (optional)",
    "Spacious living areas",
    "Separate dining room",
    "Modular kitchen",
    "Multiple balconies",
    "Private terrace / rooftop",
    "Master bedroom suite",
    "Walk-in wardrobes",
    "Multiple bedrooms",
    "Attached bathrooms",
    "Guest rooms",
    "Study / home office",
    "Entertainment room",
    "Home theatre",
    "Gym room",
    "Utility area",
    "Servant quarters",
    "Private parking (2-3 cars)",
    "24/7 security",
    "CCTV surveillance",
    "Video door phone",
    "Smart home automation",
    "Central air conditioning",
    "Power backup",
    "Fire safety system",
    "Clubhouse access",
    "Swimming pool",
    "Landscaped gardens",
    "EV charging station",
  ];

  const tenementAmenities = [
    "Independent entrance",
    "Compact living space",
    "Kitchen area",
    "Bedroom(s)",
    "Bathroom",
    "Small balcony / window",
    "Basic electrical fittings",
    "Water supply",
    "Drainage system",
    "Ceiling fan",
    "Basic security",
    "Street parking",
    "Common staircase",
    "Shared compound",
    "Electricity meter",
    "Water meter",
    "Basic plumbing",
    "Ventilation",
    "Natural lighting",
    "Affordable pricing",
    "Near public transport",
    "Near markets",
    "Near schools",
    "Community living",
  ];

  const coWorkingSpaceAmenities = [
    "Hot desks / flexible seating",
    "Dedicated desks",
    "Private cabins",
    "Meeting rooms",
    "Conference rooms",
    "Phone booths / call rooms",
    "High-speed internet / Wi-Fi",
    "Printing & scanning facilities",
    "Reception services",
    "Mail handling",
    "24/7 access",
    "CCTV security",
    "Access control system",
    "Power backup",
    "Air conditioning",
    "Ergonomic furniture",
    "Breakout areas",
    "Cafeteria / pantry",
    "Coffee & tea stations",
    "Lounge area",
    "Gaming zone",
    "Nap rooms",
    "Event space",
    "Networking events",
    "Community manager",
    "IT support",
    "Parking facility",
    "Bike parking",
    "Lockers",
    "Whiteboard & stationery",
    "Video conferencing facilities",
    "Podcast studio",
    "EV charging stations",
  ];

  const businessCenterAmenities = [
    "Grade A office spaces",
    "Multiple towers / buildings",
    "Grand entrance lobby",
    "High-speed elevators",
    "Escalators",
    "24/7 security",
    "CCTV surveillance",
    "Access control system",
    "Visitor management",
    "Reception / concierge",
    "Multilevel parking",
    "Valet parking",
    "EV charging stations",
    "Power backup (DG sets)",
    "Centralized HVAC",
    "Fire safety system",
    "Earthquake resistant structure",
    "Conference centers",
    "Business lounges",
    "Meeting rooms",
    "Auditorium",
    "Food court / restaurants",
    "Cafeteria",
    "Coffee shops",
    "ATM facilities",
    "Banks",
    "Retail shops",
    "Convenience stores",
    "Gym / fitness center",
    "Wellness center",
    "Medical clinic",
    "Pharmacy",
    "Daycare center",
    "Helipad",
    "High-speed internet infrastructure",
    "IT server rooms",
    "Smart building automation",
    "Green building certification",
    "Solar panels",
    "Rainwater harvesting",
    "Sewage treatment plant",
    "Landscaped gardens",
    "Water features",
    "Outdoor seating areas",
  ];

  const industrialFactoryAmenities = [
    "Large production floor",
    "High ceiling height (20-40 ft)",
    "Heavy-duty flooring",
    "Wide entrance / loading bay",
    "Truck loading dock",
    "Container access",
    "Overhead cranes / EOT cranes",
    "Material handling equipment",
    "Three-phase power supply",
    "High voltage electricity",
    "Power backup (DG sets)",
    "Transformer on premises",
    "Water supply",
    "Borewell",
    "Effluent treatment plant",
    "Sewage treatment",
    "Fire safety system",
    "Fire hydrants",
    "Sprinkler system",
    "24/7 security",
    "CCTV surveillance",
    "Boundary wall / fencing",
    "Security gate",
    "Weighbridge",
    "Raw material storage area",
    "Finished goods storage",
    "Quality control lab",
    "Office space",
    "Administrative block",
    "Staff canteen",
    "Worker rest rooms",
    "Changing rooms",
    "Washrooms",
    "Parking for trucks",
    "Employee parking",
    "Wide internal roads",
    "Highway connectivity",
    "Pollution control equipment",
    "Ventilation system",
    "Industrial zoning approval",
  ];

  const industrialShedsAmenities = [
    "Pre-engineered building (PEB)",
    "Steel structure",
    "High ceiling height",
    "Large open space",
    "Industrial flooring",
    "Wide shutter entrance",
    "Loading / unloading bay",
    "Truck access",
    "Three-phase power supply",
    "High voltage connection",
    "Power backup",
    "Water supply",
    "Drainage system",
    "Fire safety equipment",
    "Fire exits",
    "Security fencing",
    "Security gate",
    "CCTV surveillance",
    "Watchman cabin",
    "Office cabin",
    "Storage racks",
    "Mezzanine floor (optional)",
    "Ventilation system",
    "Natural lighting",
    "Washrooms",
    "Parking area",
    "Wide internal roads",
    "Easy highway access",
    "Industrial zone location",
    "Pollution clearance",
  ];

  const hotelAmenities = [
    "Reception / front desk (24/7)",
    "Lobby / waiting area",
    "Concierge services",
    "Valet parking",
    "Multilevel parking",
    "High-speed elevators",
    "24/7 security",
    "CCTV surveillance",
    "Guest rooms / suites",
    "Air-conditioned rooms",
    "Attached bathrooms",
    "Room service (24/7)",
    "Housekeeping services",
    "Laundry services",
    "Wi-Fi connectivity",
    "Smart TV / cable TV",
    "Mini bar / refrigerator",
    "Tea/coffee maker",
    "Safe locker",
    "Restaurant / dining hall",
    "Multi-cuisine restaurant",
    "Bar / lounge",
    "Coffee shop",
    "Banquet halls",
    "Conference rooms",
    "Meeting rooms",
    "Business center",
    "Swimming pool",
    "Gym / fitness center",
    "Spa / wellness center",
    "Salon / beauty parlor",
    "Jacuzzi / sauna",
    "Rooftop restaurant",
    "Garden / lawn",
    "Kids play area",
    "Game room",
    "Shopping arcade",
    "Travel desk",
    "Airport shuttle",
    "Car rental services",
    "Doctor on call",
    "Power backup",
    "Fire safety system",
    "Wheelchair accessibility",
    "Pet-friendly rooms",
    "EV charging stations",
  ];

  const schoolAmenities = [
    "Spacious classrooms",
    "Smart classrooms",
    "Digital boards / projectors",
    "Well-ventilated rooms",
    "Natural lighting",
    "Library / reading room",
    "Computer lab",
    "Science laboratories",
    "Mathematics lab",
    "Language lab",
    "Art & craft room",
    "Music room",
    "Dance studio",
    "Auditorium / assembly hall",
    "Multipurpose hall",
    "Sports ground / playground",
    "Basketball court",
    "Volleyball court",
    "Badminton court",
    "Cricket pitch",
    "Football field",
    "Indoor sports facility",
    "Gymnasium",
    "Swimming pool",
    "Skating rink",
    "Cafeteria / canteen",
    "Drinking water (RO)",
    "Medical room / infirmary",
    "Counseling room",
    "Staff room",
    "Principal's office",
    "Administrative office",
    "Reception area",
    "Waiting area for parents",
    "CCTV surveillance",
    "Security guards",
    "Biometric attendance",
    "Fire safety equipment",
    "Emergency exits",
    "First aid facility",
    "Bus facility / transport",
    "Parking area",
    "Disabled-friendly access",
    "Ramps & elevators",
    "Power backup",
    "Solar panels",
    "Rainwater harvesting",
    "Green campus",
    "Garden / landscaping",
  ];

  const hospitalAmenities = [
    "Emergency department (24/7)",
    "Outpatient department (OPD)",
    "Inpatient department (IPD)",
    "ICU / Critical care unit",
    "NICU / Pediatric ICU",
    "Operation theaters",
    "Modular OTs",
    "Recovery rooms",
    "General wards",
    "Private rooms",
    "Deluxe / VIP rooms",
    "Isolation rooms",
    "Maternity ward",
    "Labor rooms",
    "Neonatal care unit",
    "Dialysis unit",
    "Chemotherapy unit",
    "Radiology / X-ray",
    "CT scan",
    "MRI facility",
    "Ultrasound / sonography",
    "Pathology lab",
    "Blood bank",
    "Pharmacy (24/7)",
    "Physiotherapy center",
    "Rehabilitation center",
    "Dental clinic",
    "Eye care center",
    "Cardiology department",
    "Orthopedic department",
    "Neurology department",
    "Gastroenterology",
    "Consultation rooms",
    "Doctor's chambers",
    "Nursing stations",
    "Waiting areas",
    "Reception / registration",
    "Cafeteria / canteen",
    "Ambulance services",
    "Parking facility",
    "Wheelchair accessibility",
    "Ramps & elevators",
    "CCTV surveillance",
    "24/7 security",
    "Fire safety system",
    "Power backup (DG sets)",
    "Oxygen supply system",
    "Medical gas pipeline",
    "Centralized AC",
    "Ventilation system",
    "Waste management system",
    "Biomedical waste disposal",
    "Water treatment plant",
    "Solar power system",
    "Green building features",
  ];

  const industrialLandAmenities = [
    "Road access",
    "Wide frontage",
    "Boundary wall / fencing",
    "Electricity connection nearby",
    "High voltage power availability",
    "Three-phase power supply",
    "Water supply availability",
    "Borewell feasibility",
    "Drainage system",
    "Street lighting",
    "Clear land title",
    "Industrial zoning approval",
    "Pollution clearance",
    "Highway connectivity",
    "Main road frontage",
    "Near industrial zones",
    "Near ports / airports",
    "Railway siding nearby",
    "Container access",
    "Flat / leveled land",
    "Heavy vehicle access",
    "Truck parking potential",
    "Large plot size",
    "High Floor Space Index (FSI)",
    "Construction-ready site",
    "Weighbridge nearby",
    "Effluent treatment facility nearby",
    "Labor availability",
    "Raw material sourcing nearby",
    "Future growth zone",
  ];

  const residentialLandAmenities = [
    "Internal paved roads",
    "Plot demarcation / boundary stones",
    "Street lighting",
    "Electricity connection availability",
    "Water supply connection",
    "Drainage / sewage system",
    "Gated community entrance",
    "Security",
    "Community park / garden",
    "Children's play area",
    "Jogging track",
    "Clubhouse",
    "Open green spaces",
    "Senior citizen sitting area",
    "Yoga / meditation lawn",
    "Wide internal roads",
    "Corner plots available",
    "Near schools",
    "Near hospitals",
    "Near markets",
    "Public transport access",
    "Highway connectivity",
    "Solar street lighting",
    "Rainwater harvesting",
    "Underground electricity cables",
    "Smart security systems",
    "Landscaped entrance gate",
    "Eco-friendly development",
    "Clear land title",
    "Approved layout plan",
  ];

  const plotsLandsAmenities = [
    "Road access",
    "Plot demarcation",
    "Boundary marking",
    "Electricity connection nearby",
    "Water supply availability",
    "Drainage system",
    "Street lighting",
    "Clear land title",
    "Approved layout",
    "Main road frontage",
    "Corner plot",
    "Flat / leveled land",
    "Gated community",
    "Security",
    "Near schools",
    "Near hospitals",
    "Near markets",
    "Public transport access",
    "Highway connectivity",
    "Residential zoning",
    "Commercial zoning",
    "Construction-ready",
    "High FSI",
    "Wide frontage",
    "Compound wall",
    "Underground utilities",
    "Rainwater harvesting",
    "Solar street lights",
    "Green development",
    "Investment potential",
  ];

  const farmHouseAmenities = [
    "Large land area",
    "Farmhouse building",
    "Boundary wall / fencing",
    "Main gate entrance",
    "Private road access",
    "Electricity connection",
    "Power backup / generator",
    "Borewell / tube well",
    "Water storage tank",
    "Irrigation system",
    "Drip irrigation",
    "Sprinkler system",
    "Agricultural land",
    "Cultivable area",
    "Fruit orchards",
    "Vegetable garden",
    "Flower garden",
    "Landscaped lawn",
    "Tree plantation",
    "Greenhouse / polyhouse",
    "Farm equipment storage",
    "Tractor shed",
    "Worker quarters",
    "Caretaker room",
    "Guest rooms",
    "Outdoor sitting area",
    "Gazebo",
    "Barbecue area",
    "Swimming pool",
    "Kids play area",
    "Parking space",
    "Cattle shed (optional)",
    "Poultry farm (optional)",
    "Fish pond (optional)",
    "Organic farming setup",
    "Solar panels",
    "Rainwater harvesting",
    "Eco-friendly features",
    "Scenic views",
    "Peaceful environment",
  ];

  const studentFriendlyAmenities = [
    "Bed with mattress",
    "Study table & chair",
    "Wardrobe / cupboard",
    "Personal locker",
    "Attached or shared bathroom",
    "Fan / air conditioning",
    "Wi-Fi connection (high-speed)",
    "Power backup",
    "24/7 electricity",
    "RO drinking water",
    "Mess / meal service",
    "Vegetarian / non-vegetarian options",
    "Common dining area",
    "Shared kitchen",
    "Refrigerator",
    "Microwave",
    "Study room / library",
    "Reading room",
    "Discussion rooms",
    "Co-working space",
    "Computer room",
    "Printing facility",
    "Common TV lounge",
    "Indoor games room",
    "Outdoor games area",
    "Gym / fitness area",
    "Laundry facility",
    "Washing machine",
    "Housekeeping services",
    "CCTV surveillance",
    "24/7 security",
    "Biometric / access card entry",
    "Visitor management",
    "Bike / cycle parking",
    "Fire safety equipment",
    "First aid facility",
    "Near colleges / universities",
    "Near libraries",
    "Near coaching centers",
    "Public transport access",
    "Affordable pricing",
    "Flexible payment options",
    "No brokerage",
  ];

  const workingProfessionalsFriendlyAmenities = [
    "Fully furnished rooms",
    "Bed with premium mattress",
    "Work desk & ergonomic chair",
    "Wardrobe / storage space",
    "Attached bathroom",
    "Air conditioning",
    "High-speed Wi-Fi",
    "Power backup",
    "24/7 electricity",
    "RO drinking water",
    "Meal service (breakfast, lunch, dinner)",
    "Flexible meal plans",
    "Modern kitchen",
    "Refrigerator",
    "Microwave",
    "Dishwasher",
    "Coffee / tea maker",
    "Co-working space",
    "Meeting rooms",
    "Conference room",
    "High-speed internet",
    "Printing & scanning",
    "Smart TV / entertainment",
    "Netflix / OTT subscriptions",
    "Gaming zone",
    "Gym / fitness center",
    "Yoga / meditation area",
    "Swimming pool",
    "Rooftop lounge",
    "BBQ area",
    "Laundry service",
    "Dry cleaning service",
    "Housekeeping (daily)",
    "Room service",
    "CCTV surveillance",
    "24/7 security",
    "Smart lock / biometric entry",
    "Intercom facility",
    "Visitor parking",
    "Bike / car parking",
    "EV charging points",
    "Fire safety system",
    "Power backup (DG)",
    "Near IT parks / offices",
    "Near metro / bus stops",
    "Near shopping malls",
    "Near restaurants / cafes",
    "Flexible lease terms",
    "Professional community",
    "Networking events",
  ];

  const handleTypeSelect = (type: PropertyType) => {
    setPropertyType(type);
    setStep(2);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages((prev) => [...prev, reader.result as string]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const propertyData = {
        ...formData,
        propertyType,
        images,
      };

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Property added successfully!');
        router.push('/admin/dashboard');
      } else {
        alert('❌ Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding property:', error);
      alert('❌ Failed to add property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => step === 1 ? router.push("/admin/dashboard") : setStep(1)}
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
              <h1 className="text-xl font-heading font-bold text-foreground">Add New Property</h1>
              <p className="text-xs text-muted-foreground">
                Step {step} of 2 - {step === 1 ? "Select Property Type" : "Property Details"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-6 py-8 max-w-5xl">
        {/* Step 1: Property Type Selection */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                What type of property do you want to add?
              </h2>
              <p className="text-muted-foreground">Select the category that best describes your property</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {propertyTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id as PropertyType)}
                  className="bg-card rounded-xl p-6 border-2 border-border hover:border-primary transition-all text-left group card-shadow-hover"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <type.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-foreground mb-1">{type.label}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Property Details Form */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="bg-card rounded-xl border border-border card-shadow p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${propertyTypes.find(t => t.id === propertyType)?.color} flex items-center justify-center`}>
                  {propertyTypes.find(t => t.id === propertyType)?.icon && (
                    <div className="w-6 h-6 text-white">
                      {(() => {
                        const Icon = propertyTypes.find(t => t.id === propertyType)!.icon;
                        return <Icon className="w-6 h-6" />;
                      })()}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-foreground">
                    {propertyTypes.find(t => t.id === propertyType)?.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">Fill in the property details below</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-card rounded-xl border border-border card-shadow p-6">
                <h3 className="text-lg font-heading font-bold text-foreground mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {propertyType === "buy" && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-foreground mb-2 block">Property Sub-Type</label>
                      <select
                        name="subType"
                        value={formData.subType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        required
                      >
                        <option value="">Select Property Type</option>
                        <option value="Flat / Apartment">Flat / Apartment</option>
                        <option value="House / Villa">House / Villa</option>
                        <option value="Bungalow">Bungalow</option>
                        <option value="New Builder Project">New Builder Project</option>
                        <option value="Pent House">Pent House</option>
                        <option value="Studio Apartment">Studio Apartment</option>
                        <option value="Duplex">Duplex</option>
                        <option value="Triplex">Triplex</option>
                        <option value="Tenement">Tenement</option>
                      </select>
                    </div>
                  )}

                  {propertyType === "rent" && (
                    <>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-foreground mb-3 block">Property Category</label>
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="rentalCategory"
                              value="residential"
                              checked={formData.rentalCategory === "residential"}
                              onChange={(e) => setFormData({ ...formData, rentalCategory: e.target.value, subType: "" })}
                              className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary/30"
                              required
                            />
                            <span className="text-sm font-medium text-foreground">Residential</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="rentalCategory"
                              value="commercial"
                              checked={formData.rentalCategory === "commercial"}
                              onChange={(e) => setFormData({ ...formData, rentalCategory: e.target.value, subType: "" })}
                              className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary/30"
                              required
                            />
                            <span className="text-sm font-medium text-foreground">Commercial</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="rentalCategory"
                              value="plot"
                              checked={formData.rentalCategory === "plot"}
                              onChange={(e) => setFormData({ ...formData, rentalCategory: e.target.value, subType: "" })}
                              className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary/30"
                              required
                            />
                            <span className="text-sm font-medium text-foreground">Plot / Land</span>
                          </label>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-foreground mb-2 block">Property Sub-Type</label>
                        <select
                          name="subType"
                          value={formData.subType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          required
                          disabled={!formData.rentalCategory}
                        >
                          <option value="">Select Property Type</option>
                          {formData.rentalCategory === "residential" && (
                            <>
                              <option value="Flat / Apartment">Flat / Apartment</option>
                              <option value="House / Villa">House / Villa</option>
                              <option value="Bungalow">Bungalow</option>
                              <option value="New Builder Project">New Builder Project</option>
                              <option value="Pent House">Pent House</option>
                              <option value="Studio Apartment">Studio Apartment</option>
                              <option value="Duplex">Duplex</option>
                              <option value="Triplex">Triplex</option>
                              <option value="Tenement">Tenement</option>
                            </>
                          )}
                          {formData.rentalCategory === "commercial" && (
                            <>
                              <option value="Office">Office</option>
                              <option value="Shop">Shop</option>
                              <option value="Showroom">Showroom</option>
                              <option value="Co Working Space">Co Working Space</option>
                              <option value="Warehouse / Godown">Warehouse / Godown</option>
                              <option value="Industrial / Factory Building">Industrial / Factory Building</option>
                              <option value="Industrial Sheds">Industrial Sheds</option>
                              <option value="Hotel">Hotel</option>
                              <option value="School">School</option>
                              <option value="Hospital">Hospital</option>
                            </>
                          )}
                          {formData.rentalCategory === "plot" && (
                            <>
                              <option value="Agriculture Land">Agriculture Land</option>
                              <option value="Industrial Land">Industrial Land</option>
                              <option value="Residential Land">Residential Land</option>
                              <option value="Plots / Lands">Plots / Lands</option>
                              <option value="Farm House">Farm House</option>
                            </>
                          )}
                        </select>
                      </div>
                    </>
                  )}

                  {propertyType === "pg" && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-foreground mb-2 block">Property Sub-Type</label>
                      <select
                        name="subType"
                        value={formData.subType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        required
                      >
                        <option value="">Select Property Type</option>
                        <option value="Boys PG">Boys PG</option>
                        <option value="Girls PG">Girls PG</option>
                        <option value="Co-living PG">Co-living PG</option>
                        <option value="Boys Hostel">Boys Hostel</option>
                        <option value="Girls Hostel">Girls Hostel</option>
                        <option value="Co-living Hostel">Co-living Hostel</option>
                        <option value="Student Friendly">Student Friendly</option>
                        <option value="Working Professionals Friendly">Working Professionals Friendly</option>
                      </select>
                    </div>
                  )}

                  {propertyType === "commercial" && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-foreground mb-2 block">Property Sub-Type</label>
                      <select
                        name="subType"
                        value={formData.subType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        required
                      >
                        <option value="">Select Property Type</option>
                        <option value="Office">Office</option>
                        <option value="Shop">Shop</option>
                        <option value="Showroom">Showroom</option>
                        <option value="Warehouse / Godown">Warehouse / Godown</option>
                        <option value="Co Working Space">Co Working Space</option>
                        <option value="Business Center / Business Park">Business Center / Business Park</option>
                        <option value="Commercial Land">Commercial Land</option>
                        <option value="Industrial / Factory Building">Industrial / Factory Building</option>
                        <option value="Industrial Sheds">Industrial Sheds</option>
                        <option value="Hotel">Hotel</option>
                        <option value="School">School</option>
                        <option value="Hospital">Hospital</option>
                      </select>
                    </div>
                  )}

                  {propertyType === "plot" && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-foreground mb-2 block">Property Sub-Type</label>
                      <select
                        name="subType"
                        value={formData.subType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        required
                      >
                        <option value="">Select Property Type</option>
                        <option value="Agriculture Land">Agriculture Land</option>
                        <option value="Industrial Land">Industrial Land</option>
                        <option value="Residential Land">Residential Land</option>
                        <option value="Plots / Lands">Plots / Lands</option>
                        <option value="Farm House">Farm House</option>
                      </select>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-foreground mb-2 block">Property Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Luxury Villa in Green Valley"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Price</label>
                    <input
                      type="text"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="e.g., ₹2.5 Cr"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-foreground mb-2 block">Address Line 1 *</label>
                    <input
                      type="text"
                      name="street1"
                      value={formData.street1}
                      onChange={handleInputChange}
                      placeholder="Building/House Number"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-foreground mb-2 block">Address Line 2</label>
                    <input
                      type="text"
                      name="street2"
                      value={formData.street2}
                      onChange={handleInputChange}
                      placeholder="Street Name"
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
                      placeholder="Locality"
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
                      placeholder="Landmark"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-foreground mb-2 block">Area *</label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      placeholder="Area"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="e.g., Gujarat"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">District</label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      placeholder="e.g., Ahmedabad"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g., Ahmedabad"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="e.g., 380001"
                      maxLength={6}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
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
                    
                    {/* Coordinate Inputs */}
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
                          required
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
                          required
                        />
                      </div>
                    </div>

                    {/* Single Interactive Map with Real Streets and Draggable Marker */}
                    <div 
                      id="property-map"
                      className="relative w-full h-[500px] rounded-lg border-2 border-border overflow-hidden bg-secondary/20 select-none"
                      onClick={handleMapClick}
                      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                    >
                      {/* Real Map Background - OpenStreetMap */}
                      <iframe
                        key={`${mapMarker.lat}-${mapMarker.lng}-${mapZoom}`}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapMarker.lng - 0.01 / Math.pow(2, mapZoom - 15)},${mapMarker.lat - 0.01 / Math.pow(2, mapZoom - 15)},${mapMarker.lng + 0.01 / Math.pow(2, mapZoom - 15)},${mapMarker.lat + 0.01 / Math.pow(2, mapZoom - 15)}&layer=mapnik`}
                        className="w-full h-full border-0 pointer-events-none"
                        title="Property Location Map"
                      />

                      {/* Draggable Marker Overlay */}
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

                      {/* Map Controls Overlay */}
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-border z-20 pointer-events-none">
                        <p className="text-xs font-semibold text-foreground">📍 {mapMarker.lat.toFixed(6)}°N, {mapMarker.lng.toFixed(6)}°E</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Zoom: {mapZoom}x</p>
                      </div>

                      {/* Zoom Controls */}
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

                      {/* Open in Google Maps Button */}
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
                    
                    {/* Coordinates Display */}
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

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Bedrooms {(propertyType === "plot" && formData.subType !== "Farm House") ? "(Optional)" : ""}
                    </label>
                    <input
                      type="number"
                      name="beds"
                      value={formData.beds}
                      onChange={handleInputChange}
                      placeholder="e.g., 4"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required={propertyType !== "plot" || formData.subType === "Farm House"}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Bathrooms {(propertyType === "plot" && formData.subType !== "Farm House") ? "(Optional)" : ""}
                    </label>
                    <input
                      type="number"
                      name="baths"
                      value={formData.baths}
                      onChange={handleInputChange}
                      placeholder="e.g., 3"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required={propertyType !== "plot" || formData.subType === "Farm House"}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {propertyType === "plot" ? "Area (sq.ft / acres)" : "Area (sq.ft)"}
                    </label>
                    <input
                      type="text"
                      name="sqft"
                      value={formData.sqft}
                      onChange={handleInputChange}
                      placeholder={propertyType === "plot" ? "e.g., 5 acres or 2,500 sq.ft" : "e.g., 3,200"}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {propertyType === "pg" ? "Private or Sharing" : "Badge"}
                    </label>
                    <select
                      name="badge"
                      value={formData.badge}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {propertyType === "pg" ? (
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

                  {propertyType === "pg" && (
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

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the property features, amenities, and highlights..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Images Upload */}
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
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB each</p>
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

              {/* Amenities Section - Only for Apartments */}
              {((propertyType === "buy" || propertyType === "rent") && formData.subType === "Flat / Apartment") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {apartmentAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Only for Villas */}
              {((propertyType === "buy" || propertyType === "rent") && formData.subType === "House / Villa") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {villaAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Only for Offices */}
              {((propertyType === "commercial" || propertyType === "rent") && formData.subType === "Office") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {officeAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Only for Shops */}
              {((propertyType === "commercial" || propertyType === "rent") && formData.subType === "Shop") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {shopAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Only for Showrooms */}
              {((propertyType === "commercial" || propertyType === "rent") && formData.subType === "Showroom") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {showroomAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Only for Warehouses */}
              {((propertyType === "commercial" || propertyType === "rent") && formData.subType === "Warehouse / Godown") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {warehouseAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Agriculture Land */}
              {((propertyType === "plot" || propertyType === "rent") && formData.subType === "Agriculture Land") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {agriculturalLandAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Industrial Land */}
              {((propertyType === "plot" || propertyType === "rent") && formData.subType === "Industrial Land") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {industrialLandAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Residential Land */}
              {((propertyType === "plot" || propertyType === "rent") && formData.subType === "Residential Land") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {residentialLandAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Plots / Lands */}
              {((propertyType === "plot" || propertyType === "rent") && formData.subType === "Plots / Lands") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {plotsLandsAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Farm House */}
              {((propertyType === "plot" || propertyType === "rent") && formData.subType === "Farm House") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {farmHouseAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Only for PG (Boys, Girls, Co-living) */}
              {(propertyType === "pg" && (formData.subType === "Boys PG" || formData.subType === "Girls PG" || formData.subType === "Co-living PG")) && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pgAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Only for Hostels (Boys, Girls, Co-living) */}
              {(propertyType === "pg" && (formData.subType === "Boys Hostel" || formData.subType === "Girls Hostel" || formData.subType === "Co-living Hostel")) && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {hostelAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Student Friendly */}
              {(propertyType === "pg" && formData.subType === "Student Friendly") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {studentFriendlyAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Working Professionals Friendly */}
              {(propertyType === "pg" && formData.subType === "Working Professionals Friendly") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {workingProfessionalsFriendlyAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Bungalow */}
              {((propertyType === "buy" || propertyType === "rent") && formData.subType === "Bungalow") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {bungalowAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - New Builder Project */}
              {((propertyType === "buy" || propertyType === "rent") && formData.subType === "New Builder Project") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {newBuilderProjectAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Pent House */}
              {((propertyType === "buy" || propertyType === "rent") && formData.subType === "Pent House") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pentHouseAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Studio Apartment */}
              {((propertyType === "buy" || propertyType === "rent") && formData.subType === "Studio Apartment") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {studioApartmentAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Duplex */}
              {((propertyType === "buy" || propertyType === "rent") && formData.subType === "Duplex") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {duplexAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Triplex */}
              {((propertyType === "buy" || propertyType === "rent") && formData.subType === "Triplex") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {triplexAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Tenement */}
              {((propertyType === "buy" || propertyType === "rent") && formData.subType === "Tenement") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tenementAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Co Working Space */}
              {((propertyType === "commercial" || propertyType === "rent") && formData.subType === "Co Working Space") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {coWorkingSpaceAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Business Center / Business Park */}
              {((propertyType === "commercial" || propertyType === "rent") && formData.subType === "Business Center / Business Park") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {businessCenterAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Commercial Land (from commercial type) */}
              {(propertyType === "commercial" && formData.subType === "Commercial Land") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {commercialLandAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Industrial / Factory Building */}
              {((propertyType === "commercial" || propertyType === "rent") && formData.subType === "Industrial / Factory Building") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {industrialFactoryAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Industrial Sheds */}
              {((propertyType === "commercial" || propertyType === "rent") && formData.subType === "Industrial Sheds") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {industrialShedsAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Hotel */}
              {((propertyType === "commercial" || propertyType === "rent") && formData.subType === "Hotel") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {hotelAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - School */}
              {((propertyType === "commercial" || propertyType === "rent") && formData.subType === "School") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {schoolAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities Section - Hospital */}
              {((propertyType === "commercial" || propertyType === "rent") && formData.subType === "Hospital") && (
                <div className="bg-card rounded-xl border border-border card-shadow p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {hospitalAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  Back to Type Selection
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gradient-primary text-primary-foreground font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding Property...' : 'Add Property'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

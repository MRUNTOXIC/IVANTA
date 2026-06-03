import { 
  Wifi, 
  Car, 
  Dumbbell, 
  Waves,
  Trees,
  Shield,
  Zap,
  Wind,
  Droplets,
  Flame,
  Users,
  ShoppingCart,
  Building2,
  Sparkles,
  Baby,
  Dog,
  Bike,
  Camera,
  Home,
  Sofa,
  Utensils,
  Tv,
  WashingMachine,
  Refrigerator,
  AirVent,
  Sun,
  Moon,
  Lightbulb,
  Fence,
  TreePine,
  Flower2,
  Volleyball,
  LucideIcon
} from 'lucide-react';

export const amenityIconMap: Record<string, LucideIcon> = {
  // Internet & Connectivity
  'wifi': Wifi,
  'wi-fi': Wifi,
  'internet': Wifi,
  'broadband': Wifi,
  
  // Parking
  'parking': Car,
  'car parking': Car,
  'covered parking': Car,
  'visitor parking': Car,
  'bike parking': Bike,
  
  // Fitness & Recreation
  'gym': Dumbbell,
  'fitness center': Dumbbell,
  'fitness centre': Dumbbell,
  'gymnasium': Dumbbell,
  'swimming pool': Waves,
  'pool': Waves,
  'sports': Volleyball,
  'sports facility': Volleyball,
  'play area': Volleyball,
  'playground': Volleyball,
  'kids play area': Baby,
  'children play area': Baby,
  
  // Garden & Outdoor
  'garden': Trees,
  'landscaped garden': Trees,
  'terrace garden': Trees,
  'park': TreePine,
  'green area': Flower2,
  'lawn': Flower2,
  
  // Security
  'security': Shield,
  '24x7 security': Shield,
  '24/7 security': Shield,
  'cctv': Camera,
  'cctv camera': Camera,
  'security camera': Camera,
  'gated community': Fence,
  'gated society': Fence,
  
  // Power & Utilities
  'power backup': Zap,
  'generator': Zap,
  'backup generator': Zap,
  'water supply': Droplets,
  '24x7 water': Droplets,
  '24/7 water': Droplets,
  'water storage': Droplets,
  'gas pipeline': Flame,
  'piped gas': Flame,
  
  // Air & Ventilation
  'air conditioning': Wind,
  'ac': Wind,
  'central ac': Wind,
  'ventilation': AirVent,
  
  // Community Facilities
  'club house': Users,
  'clubhouse': Users,
  'community hall': Users,
  'banquet hall': Users,
  'party hall': Users,
  'shopping center': ShoppingCart,
  'shopping centre': ShoppingCart,
  'retail shops': ShoppingCart,
  
  // Building Features
  'lift': Building2,
  'elevator': Building2,
  'lifts': Building2,
  'elevators': Building2,
  'intercom': Home,
  'intercom facility': Home,
  
  // Maintenance
  'maintenance staff': Sparkles,
  'housekeeping': Sparkles,
  'cleaning service': Sparkles,
  
  // Pet Friendly
  'pet friendly': Dog,
  'pets allowed': Dog,
  
  // Furniture & Appliances
  'furnished': Sofa,
  'semi furnished': Sofa,
  'modular kitchen': Utensils,
  'kitchen': Utensils,
  'tv': Tv,
  'television': Tv,
  'washing machine': WashingMachine,
  'refrigerator': Refrigerator,
  'fridge': Refrigerator,
  
  // Lighting
  'street light': Lightbulb,
  'street lighting': Lightbulb,
  'solar lighting': Sun,
  'solar panel': Sun,
  'solar power': Sun,
  
  // Time-based
  'day care': Sun,
  'night security': Moon,
};

export function getAmenityIcon(amenity: string): LucideIcon {
  const normalizedAmenity = amenity.toLowerCase().trim();
  
  // Direct match
  if (amenityIconMap[normalizedAmenity]) {
    return amenityIconMap[normalizedAmenity];
  }
  
  // Partial match
  for (const [key, icon] of Object.entries(amenityIconMap)) {
    if (normalizedAmenity.includes(key) || key.includes(normalizedAmenity)) {
      return icon;
    }
  }
  
  // Default icon
  return Sparkles;
}

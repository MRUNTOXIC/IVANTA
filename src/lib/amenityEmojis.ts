export const amenityEmojiMap: Record<string, string> = {
  // Internet & Connectivity
  'wifi': '📶',
  'wi-fi': '📶',
  'internet': '📶',
  'broadband': '📶',
  'wi-fi service': '📶',
  
  // Parking
  'parking': '🚗',
  'car parking': '🚗',
  'covered parking': '🚗',
  'visitor parking': '🚗',
  'bike parking': '🏍️',
  'basement parking': '🚗',
  'private parking': '🚗',
  'garage': '🚗',
  'ev charging': '🔌',
  
  // Fitness & Recreation
  'gym': '💪',
  'fitness center': '💪',
  'fitness centre': '💪',
  'gymnasium': '💪',
  'swimming pool': '🏊',
  'pool': '🏊',
  'sports': '⚽',
  'sports facility': '⚽',
  'play area': '🎮',
  'playground': '🎮',
  'kids play area': '👶',
  'children play area': '👶',
  'badminton court': '🏸',
  'basketball court': '🏀',
  'tennis court': '🎾',
  'jogging track': '🏃',
  'cycling track': '🚴',
  'yoga': '🧘',
  'meditation': '🧘',
  
  // Garden & Outdoor
  'garden': '🌳',
  'landscaped garden': '🌳',
  'terrace garden': '🌳',
  'park': '🌲',
  'green area': '🌿',
  'lawn': '🌿',
  'rooftop garden': '🌳',
  'backyard': '🌳',
  'outdoor sitting': '🪑',
  'patio': '🪑',
  'barbecue': '🍖',
  'gazebo': '⛺',
  
  // Security
  'security': '🔒',
  '24x7 security': '🔒',
  '24/7 security': '🔒',
  'cctv': '📹',
  'cctv camera': '📹',
  'security camera': '📹',
  'gated community': '🚧',
  'gated society': '🚧',
  'security guard': '💂',
  'biometric': '👆',
  'access card': '🔑',
  'fire safety': '🧯',
  
  // Power & Utilities
  'power backup': '⚡',
  'generator': '⚡',
  'backup generator': '⚡',
  'water supply': '💧',
  '24x7 water': '💧',
  '24/7 water': '💧',
  'water storage': '💧',
  'borewell': '💧',
  'ro water': '💧',
  'drinking water': '💧',
  'gas pipeline': '🔥',
  'piped gas': '🔥',
  
  // Air & Ventilation
  'air conditioning': '❄️',
  'ac': '❄️',
  'central ac': '❄️',
  'ventilation': '🌬️',
  'fan': '🌀',
  
  // Community Facilities
  'club house': '🏛️',
  'clubhouse': '🏛️',
  'community hall': '🏛️',
  'banquet hall': '🎉',
  'party hall': '🎉',
  'multipurpose hall': '🏛️',
  'shopping center': '🛒',
  'shopping centre': '🛒',
  'retail shops': '🛒',
  'library': '📚',
  'reading room': '📚',
  'theatre': '🎬',
  'movie theater': '🎬',
  'mini theatre': '🎬',
  
  // Building Features
  'lift': '🛗',
  'elevator': '🛗',
  'lifts': '🛗',
  'elevators': '🛗',
  'intercom': '📞',
  'intercom facility': '📞',
  'smart home': '🏠',
  'automation': '🤖',
  'double height': '📐',
  
  // Maintenance
  'maintenance': '✨',
  'housekeeping': '🧹',
  'cleaning service': '🧹',
  'laundry': '🧺',
  
  // Pet Friendly
  'pet friendly': '🐕',
  'pets allowed': '🐕',
  
  // Furniture & Appliances
  'furnished': '🛋️',
  'semi furnished': '🛋️',
  'modular kitchen': '🍳',
  'kitchen': '🍳',
  'tv': '📺',
  'television': '📺',
  'washing machine': '🧺',
  'refrigerator': '🧊',
  'fridge': '🧊',
  'microwave': '🔥',
  'bed': '🛏️',
  'mattress': '🛏️',
  'wardrobe': '👔',
  'cupboard': '👔',
  'study table': '📝',
  'chair': '🪑',
  'sofa': '🛋️',
  
  // Dining & Food
  'dining': '🍽️',
  'meal service': '🍽️',
  'breakfast': '🍳',
  'lunch': '🍱',
  'dinner': '🍽️',
  'food': '🍽️',
  
  // Entertainment
  'games': '🎮',
  'indoor games': '🎮',
  'entertainment': '🎭',
  'lounge': '🛋️',
  'home theatre': '🎬',
  
  // Work & Study
  'co-working': '💼',
  'study room': '📚',
  'office': '💼',
  'work from home': '💻',
  
  // Lighting
  'street light': '💡',
  'street lighting': '💡',
  'solar': '☀️',
  'solar panel': '☀️',
  'solar power': '☀️',
  
  // Rooms & Spaces
  'balcony': '🏞️',
  'terrace': '🏞️',
  'guest room': '🛏️',
  'walk-in wardrobe': '👔',
  'living room': '🛋️',
  'bathroom': '🚿',
  'attached bathroom': '🚿',
  'shared bathroom': '🚿',
};

export function getAmenityEmoji(amenity: string): string {
  const normalizedAmenity = amenity.toLowerCase().trim();
  
  // Direct match
  if (amenityEmojiMap[normalizedAmenity]) {
    return amenityEmojiMap[normalizedAmenity];
  }
  
  // Partial match - check if any key is contained in the amenity
  for (const [key, emoji] of Object.entries(amenityEmojiMap)) {
    if (normalizedAmenity.includes(key)) {
      return emoji;
    }
  }
  
  // Default emoji for unmatched amenities
  return '✨';
}

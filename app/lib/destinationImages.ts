/**
 * Get Unsplash image URL for a destination
 * Uses Unsplash Source API for high-quality travel photos
 */

// Curated destination images for popular cities
const DESTINATION_IMAGES: Record<string, string> = {
  // Japan
  'tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  'kyoto': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
  'osaka': 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&q=80',

  // Southeast Asia
  'singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
  'bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
  'bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
  'kuala lumpur': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80',
  'penang': 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&q=80',
  'langkawi': 'https://images.unsplash.com/photo-1609946860441-a51ffcf22208?w=800&q=80',
  'melaka': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80',
  'sabah': 'https://images.unsplash.com/photo-1600050098406-2a3e6a6f33d0?w=800&q=80',
  'jakarta': 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=800&q=80',
  'hanoi': 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=800&q=80',
  'ho chi minh': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80',
  'chiang mai': 'https://images.unsplash.com/photo-1598935898639-81586f7d2129?w=800&q=80',
  'siem reap': 'https://images.unsplash.com/photo-1569432059818-7e1f1a0b8d8a?w=800&q=80',

  // Europe
  'paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
  'rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
  'barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
  'amsterdam': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80',
  'prague': 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&q=80',
  'vienna': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&q=80',
  'berlin': 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80',
  'munich': 'https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800&q=80',
  'zurich': 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800&q=80',
  'venice': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80',
  'florence': 'https://images.unsplash.com/photo-1543429258-c5ca3e3c7eb4?w=800&q=80',
  'lisbon': 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&q=80',
  'madrid': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80',
  'athens': 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80',
  'istanbul': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',

  // Americas
  'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
  'los angeles': 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&q=80',
  'san francisco': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80',
  'miami': 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=800&q=80',
  'las vegas': 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=800&q=80',
  'chicago': 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800&q=80',
  'toronto': 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=800&q=80',
  'vancouver': 'https://images.unsplash.com/photo-1559511260-66a68e7c8959?w=800&q=80',
  'mexico city': 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&q=80',
  'rio de janeiro': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80',
  'buenos aires': 'https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=800&q=80',

  // Middle East & Africa
  'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
  'abu dhabi': 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=800&q=80',
  'cairo': 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&q=80',
  'marrakech': 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80',
  'cape town': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80',

  // Australia & Oceania
  'sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80',
  'melbourne': 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800&q=80',
  'auckland': 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&q=80',
  'queenstown': 'https://images.unsplash.com/photo-1589871973318-9ca1258faa72?w=800&q=80',

  // South Asia
  'mumbai': 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800&q=80',
  'delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80',
  'goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
  'maldives': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
  'sri lanka': 'https://images.unsplash.com/photo-1586613835341-a3c3f29f90e9?w=800&q=80',

  // East Asia
  'seoul': 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&q=80',
  'busan': 'https://images.unsplash.com/photo-1596648426073-a5c4bdfabe40?w=800&q=80',
  'hong kong': 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800&q=80',
  'taipei': 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=800&q=80',
  'shanghai': 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=800&q=80',
  'beijing': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80',
};

// Default fallback image
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80';

/**
 * Extract city name from destination string
 */
function extractCityName(destination: string): string {
  // Remove country suffix (e.g., "Tokyo, Japan" -> "tokyo")
  const parts = destination.split(',');
  return parts[0].trim().toLowerCase();
}

/**
 * Get image URL for a destination
 * Returns null for unknown destinations to show gradient fallback
 */
export function getDestinationImage(destination: string): string | null {
  if (!destination) return null;

  const cityName = extractCityName(destination);

  // Check for exact match
  if (DESTINATION_IMAGES[cityName]) {
    return DESTINATION_IMAGES[cityName];
  }

  // Check for partial match
  for (const [key, url] of Object.entries(DESTINATION_IMAGES)) {
    if (cityName.includes(key) || key.includes(cityName)) {
      return url;
    }
  }

  return null;
}

/**
 * Get image URL with specific dimensions
 */
export function getDestinationImageWithSize(
  destination: string,
  width: number = 800,
  height: number = 600
): string | null {
  const baseUrl = getDestinationImage(destination);

  if (!baseUrl) {
    return null;
  }

  // If it's an Unsplash URL, add/modify dimensions
  if (baseUrl.includes('unsplash.com')) {
    // Remove existing size params and add new ones
    const urlWithoutParams = baseUrl.split('?')[0];
    return `${urlWithoutParams}?w=${width}&h=${height}&fit=crop&q=80`;
  }

  return baseUrl;
}

/**
 * Get a gradient overlay color based on destination
 * (for visual variety)
 */
export function getDestinationGradient(destination: string): string {
  const gradients = [
    'from-blue-900/70 to-purple-900/50',
    'from-orange-900/70 to-red-900/50',
    'from-green-900/70 to-teal-900/50',
    'from-indigo-900/70 to-blue-900/50',
    'from-pink-900/70 to-purple-900/50',
  ];

  // Generate consistent gradient based on destination name
  const hash = destination.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

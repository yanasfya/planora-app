import { geocodeLocation } from './geocoding';

// Helper function to calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export interface OpeningHours {
  openNow: boolean;
  weekdayText?: string[];
}

export interface Restaurant {
  placeId: string;
  name: string;
  vicinity: string;
  rating: number;
  userRatingsTotal: number;
  priceLevel: number;
  cuisine: string[];
  openNow: boolean;
  openingHours?: OpeningHours;
  distance: string;
  walkingTime: string;
  badges: string[];
  photoUrl?: string;
  googleMapsUrl: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface MealActivity {
  id: string;
  time: string;
  type: 'meal';
  mealType: 'breakfast' | 'lunch' | 'dinner';
  title: string;
  location: string;
  description: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  restaurantOptions: Restaurant[];
  icon: string;
}

interface DietaryPreferences {
  halal: boolean;
  nutAllergy: boolean;
  seafoodAllergy: boolean;
  vegetarian: boolean;
  vegan: boolean;
  wheelchairAccessible: boolean;
}

/**
 * Check if activity is an arrival/airport activity
 */
function isArrivalActivity(activity: any): boolean {
  const title = (activity.title || '').toLowerCase();
  const location = (activity.location || '').toLowerCase();
  return (
    title.includes('arrive at') ||
    title.includes('arrival') ||
    title.includes('airport') && title.includes('arrive') ||
    location.includes('airport') && title.includes('arrive')
  );
}

/**
 * Check if activity is a departure/airport activity (last day)
 */
function isDepartureActivity(activity: any): boolean {
  const title = (activity.title || '').toLowerCase();
  const location = (activity.location || '').toLowerCase();
  return (
    title.includes('depart from') ||
    title.includes('departure') ||
    title.includes('depart') ||
    (title.includes('airport') && (title.includes('leave') || title.includes('fly'))) ||
    (location.includes('airport') && title.includes('depart'))
  );
}

/**
 * Determine optimal meal times for a day based on existing activities
 */
export function determineMealTimes(activities: any[]): {
  breakfast: string | null;
  lunch: string | null;
  dinner: string | null;
} {
  if (!activities || activities.length === 0) {
    return { breakfast: '08:00', lunch: '12:30', dinner: '19:00' };
  }

  // Parse time from "HH:MM" format
  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const firstActivity = activities[0];
  const lastActivity = activities[activities.length - 1];

  const firstTime = parseTime(firstActivity.time);
  const lastTime = parseTime(lastActivity.time);

  let breakfast: string | null = null;
  let lunch: string | null = null;
  let dinner: string | null = null;

  // Check if this is Day 1 (arrival day) - if so, skip breakfast
  const isDay1 = isArrivalActivity(firstActivity);

  // Check if this is the last day (departure day)
  const isLastDay = isDepartureActivity(lastActivity);

  if (isDay1) {
    breakfast = null;
  } else {
    // Breakfast: 08:00 AM (if first activity starts after 9am)
    if (firstTime >= 9 * 60) {
      breakfast = '08:00';
    } else if (firstTime >= 8 * 60) {
      // 30min before first activity
      breakfast = formatTime(firstTime - 30);
    }
  }

  // Special handling for last day - use fixed logical times
  if (isLastDay) {
    console.log('[Meal Planning] Last day detected - using departure day meal times');
    // Last day: Lunch at 14:00 (after 13:00 checkout), Dinner at 19:00
    lunch = '14:00';

    // Only add dinner if departure is late enough (after 20:00)
    if (lastTime >= 20 * 60) {
      dinner = '19:00';
    } else if (lastTime >= 18 * 60) {
      // If departure is 18:00-20:00, skip dinner (no time)
      dinner = null;
    } else {
      // Early departure, normal dinner
      dinner = '19:00';
    }

    return { breakfast, lunch, dinner };
  }

  // Normal day logic for lunch
  const lunchStart = 11 * 60; // 11:00
  const lunchEnd = 14 * 60; // 14:00

  // Check if there's space for lunch
  const hasLunchGap = activities.some((activity, index) => {
    if (index === activities.length - 1) return false;
    const currentTime = parseTime(activity.time);
    const nextTime = parseTime(activities[index + 1].time);
    return currentTime <= lunchStart && nextTime >= lunchEnd;
  });

  if (hasLunchGap) {
    lunch = '12:30';
  } else {
    // Find the best gap
    for (let i = 0; i < activities.length - 1; i++) {
      const currentTime = parseTime(activities[i].time);
      const nextTime = parseTime(activities[i + 1].time);
      const gap = nextTime - currentTime;

      if (currentTime >= lunchStart && currentTime <= lunchEnd && gap >= 60) {
        lunch = formatTime(currentTime + Math.floor(gap / 2));
        break;
      }
    }

    // If still no lunch time found, default to 12:30
    if (!lunch) {
      lunch = '12:30';
    }
  }

  // Dinner: After last activity
  if (lastTime < 18 * 60) {
    // Last activity before 6pm, dinner at 7pm
    dinner = '19:00';
  } else if (lastTime >= 18 * 60 && lastTime <= 20 * 60) {
    // Last activity 6-8pm, 30min after
    dinner = formatTime(lastTime + 30);
  } else {
    // Last activity after 8pm
    dinner = formatTime(Math.max(lastTime + 30, 20 * 60 + 30));
  }

  return { breakfast, lunch, dinner };
}

/**
 * Build search keywords based on meal type and preferences
 */
function buildSearchKeywords(
  mealType: 'breakfast' | 'lunch' | 'dinner',
  dietaryPreferences: DietaryPreferences,
  interests: string[]
): string {
  const keywords: string[] = [];

  // Base meal type
  keywords.push(mealType);

  // Dietary preferences (highest priority)
  if (dietaryPreferences.halal) {
    // Use multiple halal keywords for better coverage
    keywords.push('halal');
    keywords.push('muslim');
    keywords.push('islamic');
    keywords.push('muslim-friendly');
  }
  if (dietaryPreferences.vegetarian) {
    keywords.push('vegetarian');
    keywords.push('veg');
  }
  if (dietaryPreferences.vegan) {
    keywords.push('vegan');
    keywords.push('plant-based');
  }

  // Cuisine preferences from interests
  if (interests.includes('Food')) {
    keywords.push('local cuisine');
    keywords.push('authentic');
  }
  if (interests.includes('Culture')) {
    keywords.push('traditional');
  }

  // Meal-specific keywords
  if (mealType === 'breakfast') {
    keywords.push('cafe', 'coffee', 'bakery');
  } else if (mealType === 'lunch') {
    keywords.push('casual dining', 'quick lunch');
  } else if (mealType === 'dinner') {
    keywords.push('fine dining', 'dinner restaurant');
  }

  return keywords.join(' ');
}

/**
 * Types to EXCLUDE for halal users (serve alcohol or non-halal food)
 */
const NON_HALAL_TYPES = [
  'bar',
  'pub',
  'night_club',
  'nightclub',
  'wine_bar',
  'cocktail_bar',
  'brewery',
  'liquor_store',
];

/**
 * Keywords in names to EXCLUDE for halal users
 */
const NON_HALAL_KEYWORDS = [
  'bar',
  'pub',
  'tavern',
  'ale house',
  'wine',
  'cocktail',
  'brewery',
  'beer garden',
  'whisky',
  'whiskey',
  'gin',
  'vodka',
  'liquor',
];

/**
 * Filter restaurants by dietary preferences
 */
function filterByDietary(place: any, preferences: DietaryPreferences): boolean {
  const types = place.types || [];
  const name = (place.name || '').toLowerCase();
  const vicinity = (place.vicinity || '').toLowerCase();

  if (preferences.halal) {
    for (const type of types) {
      if (NON_HALAL_TYPES.includes(type.toLowerCase())) {
        return false;
      }
    }

    for (const keyword of NON_HALAL_KEYWORDS) {
      if (name.includes(keyword)) {
        return false;
      }
    }
  }

  // Allergen warnings
  if (preferences.nutAllergy) {
    if (
      name.includes('nut') ||
      name.includes('almond') ||
      vicinity.includes('peanut')
    ) {
      return false;
    }
  }

  if (preferences.seafoodAllergy) {
    if (
      types.includes('seafood_restaurant') ||
      name.includes('seafood') ||
      name.includes('sushi') ||
      name.includes('fish')
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Filter restaurants by budget level
 */
function filterByBudget(place: any, budgetLevel: string): boolean {
  const priceLevel = place.price_level;

  if (!priceLevel) return true; // Include if no price info

  const budgetMap: Record<string, number[]> = {
    low: [1, 2], // $ and $$
    medium: [2, 3], // $$ and $$$
    high: [3, 4], // $$$ and $$$$
  };

  return budgetMap[budgetLevel]?.includes(priceLevel) || false;
}

/**
 * Extract cuisine types from place data
 */
function extractCuisineTypes(types: string[], name: string): string[] {
  const cuisineMap: Record<string, string> = {
    japanese_restaurant: 'Japanese',
    italian_restaurant: 'Italian',
    chinese_restaurant: 'Chinese',
    french_restaurant: 'French',
    indian_restaurant: 'Indian',
    thai_restaurant: 'Thai',
    korean_restaurant: 'Korean',
    mexican_restaurant: 'Mexican',
    vietnamese_restaurant: 'Vietnamese',
    american_restaurant: 'American',
    mediterranean_restaurant: 'Mediterranean',
    cafe: 'Cafe',
    bakery: 'Bakery',
    bar: 'Bar',
    fast_food_restaurant: 'Fast Food',
    ramen: 'Ramen',
    sushi: 'Sushi',
    pizza: 'Pizza',
    burger: 'Burger',
  };

  const detected: string[] = [];
  const searchText = name.toLowerCase();

  // Check types array
  for (const type of types) {
    if (cuisineMap[type]) {
      detected.push(cuisineMap[type]);
    }
  }

  // Check name for cuisine keywords
  for (const [key, value] of Object.entries(cuisineMap)) {
    if (searchText.includes(key.replace('_restaurant', '')) && !detected.includes(value)) {
      detected.push(value);
    }
  }

  return detected.length > 0 ? detected : ['Restaurant'];
}

/**
 * Enrich restaurant data with additional information
 */
async function enrichRestaurantData(
  place: any,
  userLocation: { lat: number; lng: number }
): Promise<Restaurant> {
  // Safety check for geometry data
  const coords = place.geometry?.location || userLocation;
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    coords.lat || userLocation.lat,
    coords.lng || userLocation.lng
  );
  const walkingTime = Math.ceil(distance / 80); // 80m/min walking speed

  // Detect badges
  const badges: string[] = [];
  const searchText = (place.name + ' ' + (place.vicinity || '')).toLowerCase();

  if (searchText.includes('halal') || searchText.includes('muslim')) {
    badges.push('halal');
  }
  if (searchText.includes('vegetarian') || searchText.includes('vegan')) {
    badges.push('vegetarian');
  }
  if (searchText.includes('michelin')) {
    badges.push('michelin');
  }
  if (place.rating >= 4.7 && place.user_ratings_total > 1000) {
    badges.push('highly-rated');
  }

  // Extract cuisine types
  const cuisine = extractCuisineTypes(place.types, place.name);

  // Get photo URL
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const photoUrl = place.photos?.[0]?.photo_reference && apiKey
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${apiKey}`
    : undefined;

  // Extract opening hours if available
  const openNowValue = place.opening_hours?.open_now !== false;
  const openingHours: OpeningHours = {
    openNow: openNowValue,
    weekdayText: place.opening_hours?.weekday_text || undefined,
  };

  return {
    placeId: place.place_id,
    name: place.name,
    vicinity: place.vicinity,
    rating: place.rating,
    userRatingsTotal: place.user_ratings_total,
    priceLevel: place.price_level || 2,
    cuisine,
    openNow: openNowValue,
    openingHours,
    distance: distance >= 1000 ? `${(distance / 1000).toFixed(1)} km away` : `${Math.round(distance)} m away`,
    walkingTime: `${walkingTime} min walk`,
    badges,
    photoUrl,
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`,
    coordinates: {
      lat: coords.lat,
      lng: coords.lng,
    },
  };
}

/**
 * Perform text search for restaurants as last resort
 * Uses Google Places Text Search API which searches by city name
 */
async function textSearchRestaurants(
  cityName: string,
  mealType: 'breakfast' | 'lunch' | 'dinner',
  dietaryPreferences: DietaryPreferences,
  apiKey: string
): Promise<Restaurant[]> {
  try {
    const isHalal = dietaryPreferences.halal;
    const query = isHalal
      ? `halal ${mealType} restaurant in ${cityName}`
      : `${mealType} restaurant in ${cityName}`;

    console.log(`[Meal Planning] Text search fallback: "${query}"`);

    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.set('query', query);
    url.searchParams.set('type', 'restaurant');
    url.searchParams.set('key', apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK' || !data.results?.length) {
      console.log(`[Meal Planning] Text search returned no results`);
      return [];
    }

    console.log(`[Meal Planning] Text search found ${data.results.length} results`);

    // Text Search API returns formatted_address instead of vicinity
    // Normalize the data structure to match Nearby Search format
    const normalizedResults = data.results.map((place: any) => ({
      ...place,
      vicinity: place.vicinity || place.formatted_address || 'Address not available',
    }));

    // Filter by dietary preferences
    let filtered = normalizedResults.filter((place: any) => filterByDietary(place, dietaryPreferences));

    // If halal filter is too strict, fall back to all results
    if (filtered.length === 0 && dietaryPreferences.halal) {
      console.log(`[Meal Planning] No halal results from text search, using all results`);
      filtered = normalizedResults;
    }

    // Take top 3
    const topResults = filtered.slice(0, 3);

    if (topResults.length === 0) {
      console.log(`[Meal Planning] Text search returned no usable results`);
      return [];
    }

    // Enrich with additional data
    const location = topResults[0]?.geometry?.location || { lat: 0, lng: 0 };
    const enrichedRestaurants = await Promise.all(
      topResults.map((place: any) => enrichRestaurantData(place, location))
    );

    return enrichedRestaurants;
  } catch (error) {
    console.error(`[Meal Planning] Text search error:`, error);
    return [];
  }
}

/**
 * Search configuration for progressive fallback
 */
interface SearchConfig {
  radius: number;
  minRating: number;
  strictBudget: boolean;
  level: number;
  description: string;
}

/**
 * Perform single restaurant search with given configuration
 */
async function searchRestaurantsWithConfig(
  location: { lat: number; lng: number },
  mealType: 'breakfast' | 'lunch' | 'dinner',
  budgetLevel: string,
  dietaryPreferences: DietaryPreferences,
  interests: string[],
  config: SearchConfig,
  apiKey: string,
  excludePlaceIds: string[] = [] // NEW: Exclude restaurants already used today
): Promise<Restaurant[]> {
  try {
    const keywords = buildSearchKeywords(mealType, dietaryPreferences, interests);

    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
    url.searchParams.set('location', `${location.lat},${location.lng}`);
    url.searchParams.set('radius', config.radius.toString());
    url.searchParams.set('type', 'restaurant');
    url.searchParams.set('keyword', keywords);
    url.searchParams.set('key', apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK') {
      return [];
    }

    let filtered = data.results
      .filter((place: any) => place.rating >= config.minRating)
      .filter((place: any) => filterByDietary(place, dietaryPreferences))
      .filter((place: any) => !excludePlaceIds.includes(place.place_id));

    if (config.strictBudget) {
      filtered = filtered.filter((place: any) => filterByBudget(place, budgetLevel));
    }

    // Sort by composite score
    const sorted = filtered.sort((a: any, b: any) => {
      const distA = calculateDistance(location.lat, location.lng, a.geometry.location.lat, a.geometry.location.lng);
      const distB = calculateDistance(location.lat, location.lng, b.geometry.location.lat, b.geometry.location.lng);

      const scoreA =
        a.rating * 0.4 +
        Math.log(a.user_ratings_total || 1) * 0.3 +
        ((config.radius - distA) / config.radius) * 0.3;
      const scoreB =
        b.rating * 0.4 +
        Math.log(b.user_ratings_total || 1) * 0.3 +
        ((config.radius - distB) / config.radius) * 0.3;

      return scoreB - scoreA;
    });

    // Take top 5 to allow for enrichment failures
    const topRestaurants = sorted.slice(0, 5);

    // Enrich with additional data
    const enrichedRestaurants = await Promise.all(
      topRestaurants.map((place: any) => enrichRestaurantData(place, location))
    );

    return enrichedRestaurants;
  } catch (error) {
    console.error(`[Meal Planning] Error in level ${config.level}:`, error);
    return [];
  }
}

/**
 * Find restaurants using Google Places API with progressive fallback
 * Returns real restaurants only - never placeholders
 * @param excludePlaceIds - Restaurant place IDs to exclude (prevents same-day duplicates)
 * @param cityName - City name for text search fallback
 */
export async function findRestaurants(
  location: { lat: number; lng: number },
  mealType: 'breakfast' | 'lunch' | 'dinner',
  budgetLevel: string,
  dietaryPreferences: DietaryPreferences,
  interests: string[],
  excludePlaceIds: string[] = [],
  cityName: string = '' // City name for text search fallback
): Promise<Restaurant[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn('[Meal Planning] No API key available - cannot search for restaurants');
    return []; // Return empty instead of placeholders
  }

  // Progressive fallback configurations - expanded for better results
  const searchConfigs: SearchConfig[] = [
    { radius: 2000, minRating: 4.0, strictBudget: true, level: 1, description: 'Primary (2km, 4.0+, strict budget)' },
    { radius: 5000, minRating: 4.0, strictBudget: true, level: 2, description: 'Fallback 1 (5km, 4.0+, strict budget)' },
    { radius: 10000, minRating: 3.5, strictBudget: true, level: 3, description: 'Fallback 2 (10km, 3.5+, strict budget)' },
    { radius: 10000, minRating: 3.5, strictBudget: false, level: 4, description: 'Fallback 3 (10km, 3.5+, any budget)' },
    { radius: 15000, minRating: 3.0, strictBudget: false, level: 5, description: 'Fallback 4 (15km, 3.0+, any budget)' },
    { radius: 20000, minRating: 0, strictBudget: false, level: 6, description: 'Ultimate Fallback (20km, any rating, any budget)' }
  ];

  // Collect all found restaurants across all search levels
  let allRestaurants: Restaurant[] = [];

  for (const config of searchConfigs) {
    const restaurants = await searchRestaurantsWithConfig(
      location,
      mealType,
      budgetLevel,
      dietaryPreferences,
      interests,
      config,
      apiKey,
      excludePlaceIds
    );

    // Add new restaurants that aren't already in our list
    for (const r of restaurants) {
      if (!allRestaurants.some(existing => existing.placeId === r.placeId)) {
        allRestaurants.push(r);
      }
    }

    // If we have at least 3 unique restaurants, return them
    if (allRestaurants.length >= 3) {
      console.log(`[Meal Planning] Found ${allRestaurants.length} restaurants at level ${config.level}`);
      return allRestaurants.slice(0, 3);
    }

    if (config.level < searchConfigs.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Last resort: Text search by city name
  if (cityName && allRestaurants.length < 3) {
    console.log(`[Meal Planning] Trying text search for ${mealType} in ${cityName}`);
    const textResults = await textSearchRestaurants(cityName, mealType, dietaryPreferences, apiKey);

    for (const r of textResults) {
      if (!allRestaurants.some(existing => existing.placeId === r.placeId)) {
        allRestaurants.push(r);
      }
    }
  }

  // Return whatever we found (even if less than 3, or empty)
  if (allRestaurants.length > 0) {
    console.log(`[Meal Planning] Returning ${allRestaurants.length} real restaurants for ${mealType}`);
    return allRestaurants.slice(0, 3);
  }

  // No restaurants found at all - return empty array (UI will handle gracefully)
  console.warn(`[Meal Planning] No restaurants found for ${mealType} - returning empty array`);
  return [];
}

/**
 * Create a meal activity object
 */
export function createMealActivity(
  mealType: 'breakfast' | 'lunch' | 'dinner',
  time: string,
  restaurants: Restaurant[]
): MealActivity {
  const icons = {
    breakfast: '🍳',
    lunch: '🍜',
    dinner: '🍱',
  };

  const topRestaurant = restaurants[0];

  return {
    id: `meal-${mealType}-${Date.now()}`,
    time,
    type: 'meal',
    mealType,
    title: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} at ${topRestaurant.name}`,
    location: topRestaurant.vicinity,
    description: `${topRestaurant.cuisine.join(', ')} • ${getPriceLevelText(topRestaurant.priceLevel)} • ${topRestaurant.distance}`,
    coordinates: topRestaurant.coordinates,
    restaurantOptions: restaurants,
    icon: icons[mealType],
  };
}

/**
 * Get price level text
 */
function getPriceLevelText(priceLevel: number): string {
  const levels = {
    1: '$',
    2: '$$',
    3: '$$$',
    4: '$$$$',
  };
  return levels[priceLevel as keyof typeof levels] || '$$';
}

/**
 * Find insert position for meal activity based on time
 */
function findInsertPosition(activities: any[], mealTime: string): number {
  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const mealMinutes = parseTime(mealTime);

  for (let i = 0; i < activities.length; i++) {
    const activityMinutes = parseTime(activities[i].time);
    if (activityMinutes > mealMinutes) {
      return i;
    }
  }

  return activities.length;
}

/**
 * Check if an activity is a meal activity (from Gemini or meal planner)
 */
function isMealActivity(activity: any): boolean {
  // Check if explicitly marked as meal type
  if (activity.type === 'meal') {
    return true;
  }

  // Check if it has restaurant options (meal planner activities)
  if (activity.restaurantOptions && activity.restaurantOptions.length > 0) {
    return true;
  }

  // Check title for meal keywords (Gemini-generated meals)
  const title = activity.title?.toLowerCase() || '';
  const mealKeywords = [
    'breakfast',
    'lunch',
    'dinner',
    'brunch',
    'snack',
    'eat at',
    'dine at',
    'meal at',
    'food at',
  ];

  return mealKeywords.some(keyword => title.includes(keyword));
}

/**
 * Cross-day restaurant tracking to prevent same restaurant for same meal type across days
 */
export interface CrossDayRestaurantTracking {
  breakfast: string[]; // Place IDs used for breakfast across all previous days
  lunch: string[];     // Place IDs used for lunch across all previous days
  dinner: string[];    // Place IDs used for dinner across all previous days
}

/**
 * Result of inserting meals - includes activities and used restaurants for tracking
 */
export interface InsertMealsResult {
  activities: any[];
  usedRestaurants: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
  };
}

/**
 * Insert meal activities for a single day
 * @param crossDayExclusions - Restaurants already used for each meal type across previous days (prevents same restaurant for same meal type)
 */
export async function insertMealsForDay(
  activities: any[],
  dayNumber: number,
  destination: string,
  budgetLevel: string,
  dietaryPreferences: DietaryPreferences,
  userPreferences: { interests: string[] },
  mealTimes: { breakfast: string | null; lunch: string | null; dinner: string | null },
  crossDayExclusions: CrossDayRestaurantTracking = { breakfast: [], lunch: [], dinner: [] }
): Promise<InsertMealsResult> {
  // Track restaurants used by THIS day for each meal type
  const usedByThisDay = {
    breakfast: [] as string[],
    lunch: [] as string[],
    dinner: [] as string[],
  };

  if (activities.length === 0) {
    return { activities, usedRestaurants: usedByThisDay };
  }

  const nonMealActivities = activities.filter((activity) => !isMealActivity(activity));

  const result: any[] = [...nonMealActivities];
  const mealsToInsert: MealActivity[] = [];

  // Track used restaurant place IDs to prevent duplicates within the same day
  const usedPlaceIdsToday: string[] = [];

  // Use non-meal activities for determining meal locations
  const firstActivity = nonMealActivities[0];
  const middleActivity = nonMealActivities[Math.floor(nonMealActivities.length / 2)];
  const lastActivity = nonMealActivities[nonMealActivities.length - 1];

  try {
    if (mealTimes.breakfast) {
      const location =
        firstActivity.coordinates ||
        (await geocodeLocation(firstActivity.location, destination));

      if (location) {
        const excludeForBreakfast = [...usedPlaceIdsToday, ...crossDayExclusions.breakfast];
        const restaurants = await findRestaurants(
          location,
          'breakfast',
          budgetLevel,
          dietaryPreferences,
          userPreferences.interests,
          excludeForBreakfast,
          destination // Pass city name for text search fallback
        );

        if (restaurants.length > 0) {
          const mealActivity = createMealActivity('breakfast', mealTimes.breakfast, restaurants);
          mealsToInsert.push(mealActivity);
          restaurants.forEach(r => {
            usedPlaceIdsToday.push(r.placeId);
            usedByThisDay.breakfast.push(r.placeId);
          });
        }
      }
    }

    if (mealTimes.lunch) {
      const location =
        middleActivity.coordinates ||
        (await geocodeLocation(middleActivity.location, destination));

      if (location) {
        const excludeForLunch = [...usedPlaceIdsToday, ...crossDayExclusions.lunch];
        const restaurants = await findRestaurants(
          location,
          'lunch',
          budgetLevel,
          dietaryPreferences,
          userPreferences.interests,
          excludeForLunch,
          destination // Pass city name for text search fallback
        );

        if (restaurants.length > 0) {
          const mealActivity = createMealActivity('lunch', mealTimes.lunch, restaurants);
          mealsToInsert.push(mealActivity);
          restaurants.forEach(r => {
            usedPlaceIdsToday.push(r.placeId);
            usedByThisDay.lunch.push(r.placeId);
          });
        }
      }
    }

    if (mealTimes.dinner) {
      const location =
        lastActivity.coordinates ||
        (await geocodeLocation(lastActivity.location, destination));

      if (location) {
        const excludeForDinner = [...usedPlaceIdsToday, ...crossDayExclusions.dinner];
        const restaurants = await findRestaurants(
          location,
          'dinner',
          budgetLevel,
          dietaryPreferences,
          userPreferences.interests,
          excludeForDinner,
          destination // Pass city name for text search fallback
        );

        if (restaurants.length > 0) {
          const mealActivity = createMealActivity('dinner', mealTimes.dinner, restaurants);
          mealsToInsert.push(mealActivity);
          restaurants.forEach(r => {
            usedPlaceIdsToday.push(r.placeId);
            usedByThisDay.dinner.push(r.placeId);
          });
        }
      }
    }

    for (const meal of mealsToInsert) {
      const insertIndex = findInsertPosition(result, meal.time);
      result.splice(insertIndex, 0, meal);
    }

    return { activities: result, usedRestaurants: usedByThisDay };
  } catch (error) {
    console.error(`[Meal Planning] Error inserting meals for Day ${dayNumber}:`, error);
    return { activities: nonMealActivities, usedRestaurants: usedByThisDay };
  }
}

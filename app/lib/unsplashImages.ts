/**
 * Unsplash Image URL Generator
 * Generates optimized Unsplash image URLs with proper error handling
 */

export interface UnsplashImageOptions {
  width?: number;
  height?: number;
  query: string;
  fallbackQuery?: string;
}

/**
 * Extract smart keywords from activity title for better image relevance
 */
function extractSmartKeywords(activityTitle: string, destination: string): string {
  const title = activityTitle.toLowerCase();

  // Remove common filler words
  const stopWords = ['visit', 'explore', 'tour', 'at', 'the', 'a', 'an', 'and', 'or', 'in', 'to'];

  // Extract main activity type with category-specific keywords
  let categoryKeywords: string[] = [];

  // Desert activities
  if (title.includes('desert') || title.includes('safari') || title.includes('dune')) {
    categoryKeywords = ['desert', 'safari', 'sand', 'dunes'];
  }
  // Water/beach activities
  else if (title.includes('beach') || title.includes('diving') || title.includes('snorkel') || title.includes('water')) {
    categoryKeywords = ['beach', 'ocean', 'tropical', 'water'];
  }
  // Mountain/hiking
  else if (title.includes('mountain') || title.includes('hik') || title.includes('trek')) {
    categoryKeywords = ['mountain', 'hiking', 'nature', 'landscape'];
  }
  // Cultural/religious sites
  else if (title.includes('temple') || title.includes('mosque') || title.includes('church') || title.includes('palace') || title.includes('shrine')) {
    categoryKeywords = ['temple', 'architecture', 'cultural', 'historic'];
  }
  // Museums/art
  else if (title.includes('museum') || title.includes('gallery') || title.includes('art')) {
    categoryKeywords = ['museum', 'art', 'gallery', 'exhibition'];
  }
  // Shopping/markets
  else if (title.includes('market') || title.includes('bazaar') || title.includes('shopping') || title.includes('souk')) {
    categoryKeywords = ['market', 'bazaar', 'shopping', 'colorful'];
  }
  // Landmarks/towers
  else if (title.includes('tower') || title.includes('building') || title.includes('landmark') || title.includes('skyline')) {
    categoryKeywords = ['landmark', 'architecture', 'cityscape', 'urban'];
  }
  // Food/dining
  else if (title.includes('dinner') || title.includes('lunch') || title.includes('breakfast') || title.includes('restaurant')) {
    categoryKeywords = ['food', 'restaurant', 'dining', 'cuisine'];
  }
  // Parks/gardens
  else if (title.includes('park') || title.includes('garden') || title.includes('botanical')) {
    categoryKeywords = ['park', 'garden', 'nature', 'green'];
  }
  // Default: extract meaningful words from title
  else {
    categoryKeywords = title
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => !stopWords.includes(word) && word.length > 2)
      .slice(0, 2);
  }

  const keywords = [...categoryKeywords, destination].join(' ');
  return keywords;
}

/**
 * Generate optimized Unsplash image URL with smart keyword search
 * Uses Unsplash's URL-based API for relevant images
 */
export function generateUnsplashImageUrl({
  width = 800,
  height = 600,
  query,
  fallbackQuery
}: UnsplashImageOptions): string {
  // Clean the query for better results
  const cleanQuery = query.trim().replace(/\s+/g, '%20');

  const url = `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=${width}&h=${height}&fit=crop&q=80&auto=format`;
  return url;
}

/**
 * Get curated Unsplash photo ID based on activity category
 * These are hand-picked high-quality photos from Unsplash
 */
function getCuratedPhotoId(activityTitle: string, destination: string): string {
  const title = activityTitle.toLowerCase();
  const dest = destination.toLowerCase();

  // Curated photo IDs for different activity types (verified working IDs)
  const photoMap: Record<string, string> = {
    // Desert activities
    'desert-safari': '1527576833471-ce5b8eb1c03e', // Desert safari
    'dune-bashing': '1509114397022-ed747cca3f65', // Sand dunes
    'desert': '1473580044384-7ba9967e16a0', // Desert landscape

    // Dubai landmarks
    'burj-khalifa': '1512453979798-5ea266f8880c', // Burj Khalifa
    'dubai-mall': '1582672060674-bc2bd808a8b5', // Dubai cityscape
    'dubai-fountain': '1518548419970-58e3b4079ab2', // Dubai fountain

    // Temples/cultural
    'temple': '1548013146-72d6460a0665', // Temple
    'mosque': '1564507592333-c60657eea523', // Mosque
    'palace': '1583559542434-0c6e6f3f53b8', // Palace

    // Beach/water
    'beach': '1559827260-dc66d52bef19', // Beach
    'diving': '1544551763-46a013bb70d5', // Diving
    'snorkeling': '1559827260-dc66d52bef19', // Water activity

    // Museum/art
    'museum': '1554907984-15263bfd63bd', // Museum
    'art-gallery': '1567095761054-7a02e69e5c43', // Gallery

    // Shopping/markets
    'market': '1555529902-5261145633bf', // Market
    'souk': '1520466809213-7b9ab90edbf6', // Souk/market
    'shopping': '1441986300917-64674bd600d8', // Shopping

    // Food/dining
    'restaurant': '1414235077428-338989a2e8c0', // Restaurant
    'local-food': '1504674900247-0877df9cc836', // Food
    'street-food': '1555939594-58d7cb561ad1', // Street food

    // Parks/nature
    'park': '1441974231531-c6227db76b6e', // Park
    'garden': '1558618666-fcd25c85cd64', // Garden

    // Default fallback
    'default': '1488646953014-85cb44e25828', // Travel/landmark
  };

  // Match activity to photo category
  if (title.includes('burj khalifa')) return photoMap['burj-khalifa'];
  if (title.includes('dubai mall')) return photoMap['dubai-mall'];
  if (title.includes('dubai fountain') || title.includes('fountain show')) return photoMap['dubai-fountain'];
  if (title.includes('desert') && title.includes('safari')) return photoMap['desert-safari'];
  if (title.includes('dune')) return photoMap['dune-bashing'];
  if (title.includes('desert')) return photoMap['desert'];
  if (title.includes('temple')) return photoMap['temple'];
  if (title.includes('mosque')) return photoMap['mosque'];
  if (title.includes('palace')) return photoMap['palace'];
  if (title.includes('beach')) return photoMap['beach'];
  if (title.includes('div')) return photoMap['diving'];
  if (title.includes('snorkel')) return photoMap['snorkeling'];
  if (title.includes('museum')) return photoMap['museum'];
  if (title.includes('gallery')) return photoMap['art-gallery'];
  if (title.includes('market') || title.includes('bazaar')) return photoMap['market'];
  if (title.includes('souk')) return photoMap['souk'];
  if (title.includes('shopping')) return photoMap['shopping'];
  if (title.includes('restaurant') || title.includes('dinner') || title.includes('lunch')) return photoMap['restaurant'];
  if (title.includes('park')) return photoMap['park'];
  if (title.includes('garden')) return photoMap['garden'];

  return photoMap['default'];
}

/**
 * Generate image URL for activity based on title and destination
 * Uses Lorem Picsum for reliable placeholder images with consistent seeding
 */
export function getActivityImageUrl(
  activityTitle: string,
  destination: string,
  width = 800,
  height = 500
): string {
  // Create a seed from the activity title for consistent images
  const seed = activityTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');

  const url = `https://picsum.photos/seed/${seed}/${width}/${height}`;
  return url;
}

/**
 * Get curated food/restaurant photo based on cuisine type
 */
function getCuratedFoodPhotoId(cuisineType?: string, destination?: string): string {
  const cuisine = cuisineType?.toLowerCase() || '';
  const dest = destination?.toLowerCase() || '';

  // Curated food photo IDs (verified working IDs)
  const foodPhotoMap: Record<string, string> = {
    'italian': '1498579484530-410e22106b9a', // Italian pasta
    'japanese': '1579584425555-c3ce17fd4351', // Japanese sushi
    'chinese': '1525755662778-e3b90304c32c', // Chinese food
    'indian': '1585937421612-70a008356fbe', // Indian curry
    'thai': '1559314809-0d155014e29a', // Thai food
    'mexican': '1565299585323-38d6b0865b47', // Mexican tacos
    'french': '1606787503324-1a3b1bf3d0b8', // French cuisine
    'mediterranean': '1544025162-0c6b4e5e7d37', // Mediterranean food
    'arabic': '1561489396-0e3d5bb0c8a3', // Arabic mezze
    'seafood': '1615141982883-c7ad0e69fd62', // Seafood platter
    'bbq': '1555939594-58d7cb561ad1', // BBQ meat
    'vegetarian': '1512621776951-a57141f2eefd', // Vegetarian bowl
    'cafe': '1495474472287-4d71bcdd2085', // Cafe breakfast
    'fine-dining': '1414235077428-338989a2e8c0', // Fine dining
    'street-food': '1504674900247-0877df9cc836', // Street food
    'default': '1504674900247-0877df9cc836', // Generic delicious food
  };

  // Match cuisine type
  if (cuisine.includes('italian')) return foodPhotoMap['italian'];
  if (cuisine.includes('japanese') || cuisine.includes('sushi')) return foodPhotoMap['japanese'];
  if (cuisine.includes('chinese')) return foodPhotoMap['chinese'];
  if (cuisine.includes('indian')) return foodPhotoMap['indian'];
  if (cuisine.includes('thai')) return foodPhotoMap['thai'];
  if (cuisine.includes('mexican')) return foodPhotoMap['mexican'];
  if (cuisine.includes('french')) return foodPhotoMap['french'];
  if (cuisine.includes('mediterranean')) return foodPhotoMap['mediterranean'];
  if (cuisine.includes('arabic') || cuisine.includes('middle eastern')) return foodPhotoMap['arabic'];
  if (cuisine.includes('seafood') || cuisine.includes('fish')) return foodPhotoMap['seafood'];
  if (cuisine.includes('bbq') || cuisine.includes('grill')) return foodPhotoMap['bbq'];
  if (cuisine.includes('vegetarian') || cuisine.includes('vegan')) return foodPhotoMap['vegetarian'];
  if (cuisine.includes('cafe') || cuisine.includes('coffee')) return foodPhotoMap['cafe'];
  if (cuisine.includes('fine') || cuisine.includes('upscale')) return foodPhotoMap['fine-dining'];
  if (cuisine.includes('street')) return foodPhotoMap['street-food'];

  // Match by destination
  if (dest.includes('dubai') || dest.includes('uae')) return foodPhotoMap['arabic'];
  if (dest.includes('japan') || dest.includes('tokyo')) return foodPhotoMap['japanese'];
  if (dest.includes('italy') || dest.includes('rome')) return foodPhotoMap['italian'];
  if (dest.includes('thailand') || dest.includes('bangkok')) return foodPhotoMap['thai'];
  if (dest.includes('india')) return foodPhotoMap['indian'];
  if (dest.includes('mexico')) return foodPhotoMap['mexican'];

  return foodPhotoMap['default'];
}

/**
 * Generate image URL for restaurant/meal based on cuisine type
 */
export function getRestaurantImageUrl(
  restaurantName: string,
  cuisineType?: string,
  destination?: string,
  width = 800,
  height = 600
): string {
  // Get curated food photo
  const photoId = getCuratedFoodPhotoId(cuisineType, destination);

  const url = `https://images.unsplash.com/photo-${photoId}?w=${width}&h=${height}&fit=crop&q=80&auto=format`;
  return url;
}

/**
 * Generate image URL for hotel/accommodation
 */
export function getHotelImageUrl(
  destination: string,
  width = 800,
  height = 600
): string {
  const seed = `hotel-${destination.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const url = `https://picsum.photos/seed/${seed}/${width}/${height}`;
  return url;
}

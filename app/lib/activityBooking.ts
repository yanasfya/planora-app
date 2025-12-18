/**
 * Activity Booking Link Generator
 * Generates direct booking links to Klook, GetYourGuide, Viator, and Booking.com
 * with smart platform selection based on destination and activity type
 */

export type BookingPlatform = 'klook' | 'getyourguide' | 'viator' | 'booking.com';

export interface BookingLink {
  platform: BookingPlatform;
  platformName: string;
  url: string;
  color: string; // Brand color for button
  isHotel?: boolean; // Flag for hotel bookings
}

/**
 * Detect if an activity is hotel-related
 */
export function isHotelActivity(activityTitle: string): boolean {
  const title = activityTitle.toLowerCase();

  const hotelKeywords = [
    'check in',
    'check-in',
    'check into hotel',
    'arrive at hotel',
    'hotel check',
    'check into',
    'settle into hotel',
    'arrive and check',
    'check in at',
    'hotel arrival',
    'arrive at accommodation',
    'check into accommodation',
    'check out',
    'check-out'
  ];

  return hotelKeywords.some(keyword => title.includes(keyword));
}

/**
 * Generate Booking.com hotel link
 */
export function generateHotelBookingLink(
  destination: string,
  checkInDate?: string,
  checkOutDate?: string,
  affiliateId?: string,
  guests: number = 2
): BookingLink {
  // Clean destination name
  const destinationQuery = encodeURIComponent(destination);

  // Build Booking.com URL
  let url = `https://www.booking.com/searchresults.html?ss=${destinationQuery}`;

  // Add dates if provided
  if (checkInDate && checkOutDate) {
    url += `&checkin=${checkInDate}`;
    url += `&checkout=${checkOutDate}`;
  }

  // Calculate rooms needed (1 room per 2 guests, minimum 1)
  const numRooms = Math.max(1, Math.ceil(guests / 2));

  // Add guest parameters
  url += `&group_adults=${guests}`;
  url += '&group_children=0';
  url += `&no_rooms=${numRooms}`;

  if (affiliateId) {
    url += `&aid=${affiliateId}`;
  }

  return {
    platform: 'booking.com',
    platformName: 'Booking.com',
    url,
    color: '#003580', // Booking.com blue
    isHotel: true
  };
}

/**
 * Determine the best booking platform based on activity and destination
 */
export function selectBookingPlatform(
  activityTitle: string,
  destination: string
): BookingPlatform {
  const title = activityTitle.toLowerCase();
  const dest = destination.toLowerCase();

  // Platform selection logic

  // 1. Check destination region
  const asianDestinations = [
    'tokyo', 'japan', 'seoul', 'korea', 'bangkok', 'thailand',
    'singapore', 'hong kong', 'bali', 'indonesia', 'vietnam',
    'malaysia', 'philippines', 'taiwan', 'china', 'india',
    'dubai', 'uae', 'cambodia', 'myanmar', 'laos', 'maldives',
    'sri lanka', 'nepal', 'mongolia', 'macau', 'brunei'
  ];

  const europeanDestinations = [
    'paris', 'france', 'london', 'uk', 'rome', 'italy',
    'barcelona', 'spain', 'berlin', 'germany', 'amsterdam',
    'netherlands', 'prague', 'vienna', 'budapest', 'athens',
    'greece', 'portugal', 'switzerland', 'austria', 'belgium',
    'poland', 'croatia', 'denmark', 'norway', 'sweden', 'finland',
    'ireland', 'scotland', 'iceland', 'czech', 'hungary'
  ];

  const isAsianDestination = asianDestinations.some(loc => dest.includes(loc));
  const isEuropeanDestination = europeanDestinations.some(loc => dest.includes(loc));

  // 2. Check activity type
  const isMuseumOrCulturalSite =
    title.includes('museum') ||
    title.includes('gallery') ||
    title.includes('palace') ||
    title.includes('castle') ||
    title.includes('cathedral') ||
    title.includes('temple') ||
    title.includes('historic') ||
    title.includes('monument') ||
    title.includes('basilica') ||
    title.includes('chapel');

  const isAdventureActivity =
    title.includes('hiking') ||
    title.includes('diving') ||
    title.includes('safari') ||
    title.includes('adventure') ||
    title.includes('climbing') ||
    title.includes('trek') ||
    title.includes('kayak') ||
    title.includes('snorkel') ||
    title.includes('ski') ||
    title.includes('paraglid');

  const isTourOrCruise =
    title.includes('tour') ||
    title.includes('cruise') ||
    title.includes('excursion') ||
    title.includes('experience') ||
    title.includes('guided') ||
    title.includes('walk') ||
    title.includes('boat trip') ||
    title.includes('river cruise');

  // Decision logic
  if (isAsianDestination) {
    return 'klook'; // Klook is strongest in Asia
  }

  if (isEuropeanDestination) {
    if (isMuseumOrCulturalSite) {
      return 'getyourguide'; // GetYourGuide excels at European museums
    }
    if (isTourOrCruise) {
      return 'viator'; // Viator good for European tours
    }
    return 'getyourguide'; // Default for Europe
  }

  // Americas or other regions
  if (isTourOrCruise) {
    return 'viator'; // Viator strong in Americas for tours
  }

  if (isAdventureActivity) {
    return 'klook'; // Klook good for adventure activities
  }

  // Default fallback
  return 'getyourguide'; // Most global coverage
}

/**
 * Generate booking link for an activity
 */
export function generateActivityBookingLink(
  activityTitle: string,
  destination: string,
  platform?: BookingPlatform,
  affiliateId?: string,
  checkInDate?: string,
  checkOutDate?: string
): BookingLink {
  if (isHotelActivity(activityTitle)) {
    return generateHotelBookingLink(
      destination,
      checkInDate,
      checkOutDate,
      affiliateId
    );
  }

  // Auto-select platform if not specified
  const selectedPlatform = platform || selectBookingPlatform(activityTitle, destination);

  // Clean and encode search query
  const searchQuery = encodeURIComponent(`${activityTitle} ${destination}`);

  // Generate URL based on platform
  let url: string;
  let platformName: string;
  let color: string;

  switch (selectedPlatform) {
    case 'klook':
      url = `https://www.klook.com/search/?query=${searchQuery}`;
      if (affiliateId) {
        url += `&aid=${affiliateId}`;
      }
      platformName = 'Klook';
      color = '#FF5722'; // Klook orange
      break;

    case 'getyourguide':
      url = `https://www.getyourguide.com/s/?q=${searchQuery}`;
      if (affiliateId) {
        url += `&partner_id=${affiliateId}`;
      }
      platformName = 'GetYourGuide';
      color = '#00D4AA'; // GetYourGuide teal
      break;

    case 'viator':
      url = `https://www.viator.com/searchResults/all?text=${searchQuery}`;
      if (affiliateId) {
        url += `&pid=${affiliateId}`;
      }
      platformName = 'Viator';
      color = '#00AA6C'; // Viator green
      break;

    default:
      // Fallback to GetYourGuide
      url = `https://www.getyourguide.com/s/?q=${searchQuery}`;
      platformName = 'GetYourGuide';
      color = '#00D4AA';
  }

  return {
    platform: selectedPlatform,
    platformName,
    url,
    color,
    isHotel: false
  };
}

/**
 * Generate multiple booking links (for comparison shopping)
 */
export function generateAllBookingLinks(
  activityTitle: string,
  destination: string,
  affiliateIds?: {
    klook?: string;
    getyourguide?: string;
    viator?: string;
  }
): BookingLink[] {
  return [
    generateActivityBookingLink(activityTitle, destination, 'klook', affiliateIds?.klook),
    generateActivityBookingLink(activityTitle, destination, 'getyourguide', affiliateIds?.getyourguide),
    generateActivityBookingLink(activityTitle, destination, 'viator', affiliateIds?.viator)
  ];
}

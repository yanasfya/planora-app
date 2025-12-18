import { geocodeLocation } from './geocoding';
import { calculateTransportation, getCountryCode, type TransportationDetails } from './transportationCalculator';

export interface Activity {
  title: string;
  time: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  transportToNext?: TransportationDetails;
  photoUrl?: string;
  placeId?: string;
}

/**
 * Fetch photo from Google Places API for a given location
 */
async function fetchPlacePhoto(location: string, destination: string): Promise<{ photoUrl?: string; placeId?: string }> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn('[Photo] Google Maps API key not found');
    return {};
  }

  try {
    // Search for the place using Text Search
    const searchQuery = `${location}, ${destination}`;
    const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    searchUrl.searchParams.set('query', searchQuery);
    searchUrl.searchParams.set('key', apiKey);

    console.log(`[Photo] Searching for: ${searchQuery}`);

    const response = await fetch(searchUrl.toString());
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const place = data.results[0];
      const photoReference = place.photos?.[0]?.photo_reference;
      const placeId = place.place_id;

      if (photoReference) {
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${apiKey}`;
        console.log(`[Photo] Found photo for: ${location}`);
        return { photoUrl, placeId };
      }
    }

    console.log(`[Photo] No photo found for: ${location}`);
    return {};
  } catch (error) {
    console.error(`[Photo] Error fetching photo for ${location}:`, error);
    return {};
  }
}

/**
 * Enriches an array of activities with transportation data between each activity
 * @param activities - Array of activities with location names
 * @param destination - City/country destination for context (e.g., "Paris, France")
 * @returns Array of activities with coordinates and transportToNext populated
 */
export async function enrichActivitiesWithTransportation(
  activities: Activity[],
  destination: string
): Promise<Activity[]> {
  if (!activities || activities.length === 0) {
    console.log('[Transport] No activities to enrich');
    return activities;
  }

  const cityName = destination.split(',')[0].trim();
  const countryCode = getCountryCode(destination);

  console.log(`[Transport] Enriching ${activities.length} activities for ${destination}`);
  console.log(`[Transport] City: ${cityName}, Country Code: ${countryCode}`);

  // Step 1: Geocode all activity locations
  const enrichedActivities: Activity[] = [];

  for (let i = 0; i < activities.length; i++) {
    const activity = activities[i];

    let enrichedActivity = { ...activity };

    // Geocode if coordinates don't exist
    if (!activity.coordinates) {
      const coords = await geocodeLocation(activity.location, destination);
      if (coords) {
        enrichedActivity.coordinates = coords;
        console.log(`[Transport] Geocoded: ${activity.location} -> ${coords.lat}, ${coords.lng}`);
      } else {
        console.warn(`[Transport] Failed to geocode: ${activity.location}`);
      }
    }

    // Fetch photo if not already present
    if (!activity.photoUrl) {
      const { photoUrl, placeId } = await fetchPlacePhoto(activity.location, destination);
      if (photoUrl) {
        enrichedActivity.photoUrl = photoUrl;
        enrichedActivity.placeId = placeId;
      }
    }

    enrichedActivities.push(enrichedActivity);

    // Small delay to avoid rate limiting (150ms for photo + geocode)
    if (i < activities.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }

  // Step 2: Calculate transportation between consecutive activities
  for (let i = 0; i < enrichedActivities.length - 1; i++) {
    const current = enrichedActivities[i];
    const next = enrichedActivities[i + 1];

    // Only calculate if both activities have coordinates
    if (current.coordinates && next.coordinates) {
      try {
        const transport = await calculateTransportation(
          {
            lat: current.coordinates.lat,
            lng: current.coordinates.lng,
            name: current.location,
          },
          {
            lat: next.coordinates.lat,
            lng: next.coordinates.lng,
            name: next.location,
          },
          cityName,
          countryCode
        );

        enrichedActivities[i].transportToNext = transport;
        console.log(
          `[Transport] ${current.location} -> ${next.location}: ${transport.mode} (${transport.duration}, ${transport.cost})`
        );
      } catch (error) {
        console.error(
          `[Transport] Failed to calculate transport: ${current.location} -> ${next.location}`,
          error
        );
      }

      // Small delay between transportation calculations
      if (i < enrichedActivities.length - 2) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
  }

  return enrichedActivities;
}

/**
 * Enriches a single day's activities with transportation data
 * @param dayActivities - Activities for a single day
 * @param destination - City/country destination
 * @returns Day activities with transportation data
 */
export async function enrichDayWithTransportation(
  dayActivities: Activity[],
  destination: string
): Promise<Activity[]> {
  return enrichActivitiesWithTransportation(dayActivities, destination);
}

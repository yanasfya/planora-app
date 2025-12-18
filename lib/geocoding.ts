export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Geocode a location name to coordinates using Google Geocoding API
 * @param locationName - The name of the location (e.g., "City Center", "Dutch Square")
 * @param cityContext - Optional city/country context for better accuracy (e.g., "Melaka, Malaysia")
 * @returns Coordinates object with lat/lng, or null if geocoding fails
 */
export async function geocodeLocation(
  locationName: string,
  cityContext?: string
): Promise<Coordinates | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn('[Geocoding] Google Maps API key not configured');
    return null;
  }

  try {
    // Construct the full address with context for better accuracy
    const fullAddress = cityContext
      ? `${locationName}, ${cityContext}`
      : locationName;

    const encodedAddress = encodeURIComponent(fullAddress);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    console.log(`[Geocoding] Requesting: ${fullAddress}`);

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`[Geocoding] API request failed with status: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      console.log(`[Geocoding] Success: ${fullAddress} -> ${location.lat}, ${location.lng}`);

      return {
        lat: location.lat,
        lng: location.lng,
      };
    } else if (data.status === 'ZERO_RESULTS') {
      console.warn(`[Geocoding] No results found for: ${fullAddress}`);
      return null;
    } else if (data.status === 'OVER_QUERY_LIMIT') {
      console.error('[Geocoding] API quota exceeded');
      return null;
    } else {
      console.warn(`[Geocoding] Geocoding failed with status: ${data.status}`);
      return null;
    }
  } catch (error) {
    console.error('[Geocoding] Error geocoding location:', error);
    return null;
  }
}

/**
 * Geocode multiple locations in batch
 * @param locations - Array of location objects with name and optional context
 * @returns Array of coordinates (null for failed geocoding)
 */
export async function geocodeLocations(
  locations: Array<{ name: string; context?: string }>
): Promise<Array<Coordinates | null>> {
  const results: Array<Coordinates | null> = [];

  // Add a small delay between requests to avoid rate limiting (50ms delay)
  for (const location of locations) {
    const coords = await geocodeLocation(location.name, location.context);
    results.push(coords);

    // Small delay to be respectful of API rate limits
    if (locations.indexOf(location) < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  return results;
}

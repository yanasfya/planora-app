interface Coordinates {
  lat: number;
  lng: number;
}

interface Mosque {
  name: string;
  address: string;
  coordinates: Coordinates;
  distance?: string;
  walkingTime?: string;
  rating?: number;
  photoReference?: string;
  placeId?: string;
}

/**
 * Find nearby mosques using Google Places API
 */
export async function findNearbyMosques(
  location: Coordinates,
  radius: number = 2000 // 2km radius
): Promise<Mosque[]> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error('[Mosque Search] Google Maps API key not configured');
      return [];
    }

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&type=mosque&keyword=masjid|mosque&key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Places API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('[Mosque Search] API error:', data.status, data.error_message);
      return [];
    }

    if (!data.results || data.results.length === 0) {
      return [];
    }

    const mosques: Mosque[] = data.results.slice(0, 3).map((place: any) => ({
      name: place.name,
      address: place.vicinity || place.formatted_address || '',
      coordinates: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      },
      rating: place.rating,
      photoReference: place.photos?.[0]?.photo_reference,
      placeId: place.place_id,
    }));

    return mosques;

  } catch (error) {
    console.error('[Mosque Search] Error:', error);
    return [];
  }
}

/**
 * Calculate distance and walking time between two points
 */
export async function calculateDistanceToMosque(
  from: Coordinates,
  to: Coordinates
): Promise<{ distance: string; duration: string } | null> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${from.lat},${from.lng}&destinations=${to.lat},${to.lng}&mode=walking&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
      const element = data.rows[0].elements[0];
      return {
        distance: element.distance.text,
        duration: element.duration.text,
      };
    }

    return null;
  } catch (error) {
    console.error('[Distance Calculation] Error:', error);
    return null;
  }
}

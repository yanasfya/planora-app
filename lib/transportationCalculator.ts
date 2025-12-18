interface Coordinates {
  lat: number;
  lng: number;
  name: string;
}

export interface TransportationDetails {
  mode: 'walking' | 'transit' | 'taxi' | 'driving' | 'flight' | 'ferry' | 'bicycle';
  icon: string;
  modeName: string;
  duration: string;
  distance: string;
  cost: string;
  steps?: string[];
}

const TRANSPORT_ICONS = {
  walking: '🚶',
  transit: '🚇',
  bus: '🚌',
  taxi: '🚕',
  driving: '🚗',
  bicycle: '🚴',
  ferry: '⛴️',
  flight: '✈️',
  train: '🚄'
};

const METRO_CITIES = [
  'Tokyo', 'Paris', 'London', 'New York', 'Singapore',
  'Hong Kong', 'Seoul', 'Bangkok', 'Kuala Lumpur', 'Dubai',
  'Barcelona', 'Madrid', 'Berlin', 'Rome', 'Milan'
];

const TRANSIT_COSTS: Record<string, string> = {
  JP: '¥200-400',
  FR: '€1.90',
  GB: '£2.50',
  US: '$2.75',
  SG: 'S$1.50',
  MY: 'RM2-4',
  TH: '฿15-45',
  AE: 'AED3-7',
  HK: 'HK$10',
  KR: '₩1,350',
  ES: '€2.40',
  DE: '€3.00',
  IT: '€1.50',
  default: '$2-5'
};

interface TaxiCostData {
  base: number;
  perKm: number;
  currency: string;
}

const TAXI_COSTS: Record<string, TaxiCostData> = {
  JP: { base: 500, perKm: 80, currency: '¥' },
  FR: { base: 7, perKm: 1.5, currency: '€' },
  GB: { base: 3, perKm: 2, currency: '£' },
  US: { base: 3, perKm: 2, currency: '$' },
  SG: { base: 3.5, perKm: 0.55, currency: 'S$' },
  MY: { base: 4, perKm: 0.8, currency: 'RM' },
  TH: { base: 35, perKm: 7, currency: '฿' },
  AE: { base: 12, perKm: 1.8, currency: 'AED' },
  default: { base: 5, perKm: 1.5, currency: '$' }
};

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

function estimateDuration(distance: number, mode: string): number {
  // Returns duration in minutes
  const speeds = {
    walking: 5000, // 5 km/h in meters/hour
    transit: 30000, // 30 km/h average
    taxi: 40000, // 40 km/h in city
    driving: 50000 // 50 km/h
  };

  const speed = speeds[mode as keyof typeof speeds] || speeds.taxi;
  return Math.ceil((distance / speed) * 60);
}

function estimateCost(
  mode: string,
  distance: number,
  countryCode: string
): string {
  if (mode === 'walking') {
    return 'Free';
  }

  if (mode === 'transit') {
    return TRANSIT_COSTS[countryCode] || TRANSIT_COSTS.default;
  }

  if (mode === 'taxi' || mode === 'driving') {
    const taxiData = TAXI_COSTS[countryCode] || TAXI_COSTS.default;
    const distanceKm = distance / 1000;
    const estimatedCost = taxiData.base + distanceKm * taxiData.perKm;
    return `~${taxiData.currency}${Math.ceil(estimatedCost)}`;
  }

  return 'N/A';
}

function determineBestMode(distance: number, cityName: string): string {
  // Very short distance
  if (distance < 800) {
    return 'walking';
  }

  // Short-medium distance
  if (distance >= 800 && distance < 5000) {
    // Check if city has good public transit
    if (METRO_CITIES.some(city => cityName.toLowerCase().includes(city.toLowerCase()))) {
      return 'transit';
    }
    return 'taxi';
  }

  // Medium distance
  if (distance >= 5000 && distance < 20000) {
    if (METRO_CITIES.some(city => cityName.toLowerCase().includes(city.toLowerCase()))) {
      return 'transit';
    }
    return 'taxi';
  }

  // Long distance
  return 'driving';
}

function getTransportIcon(mode: string): string {
  return TRANSPORT_ICONS[mode as keyof typeof TRANSPORT_ICONS] || '🚇';
}

function getModeName(mode: string): string {
  const names: Record<string, string> = {
    walking: 'Walk',
    transit: 'Public Transit',
    taxi: 'Taxi',
    driving: 'Drive',
    bicycle: 'Bicycle',
    ferry: 'Ferry',
    flight: 'Flight',
    train: 'Train'
  };
  return names[mode] || 'Transport';
}

export async function calculateTransportation(
  origin: Coordinates,
  destination: Coordinates,
  cityName: string,
  countryCode: string = 'default'
): Promise<TransportationDetails> {
  try {
    const distance = calculateDistance(
      origin.lat,
      origin.lng,
      destination.lat,
      destination.lng
    );

    const mode = determineBestMode(distance, cityName);
    const duration = estimateDuration(distance, mode);
    const cost = estimateCost(mode, distance, countryCode);

    // Try Google Directions API for more accurate data
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      try {
        const directionsResult = await fetchDirections(origin, destination, mode, apiKey);
        if (directionsResult) {
          return directionsResult;
        }
      } catch (error) {
        console.log('Directions API failed, using fallback calculation');
      }
    }

    // Fallback: Use calculated estimates
    return {
      mode: mode as TransportationDetails['mode'],
      icon: getTransportIcon(mode),
      modeName: getModeName(mode),
      duration: `${duration} min`,
      distance: `${(distance / 1000).toFixed(1)} km`,
      cost,
    };
  } catch (error) {
    console.error('Transportation calculation failed:', error);
    // Ultimate fallback
    return getFallbackTransport(origin, destination, countryCode);
  }
}

async function fetchDirections(
  origin: Coordinates,
  destination: Coordinates,
  mode: string,
  apiKey: string
): Promise<TransportationDetails | null> {
  if (!apiKey) return null;

  const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
  url.searchParams.set('origin', `${origin.lat},${origin.lng}`);
  url.searchParams.set('destination', `${destination.lat},${destination.lng}`);
  url.searchParams.set('mode', mode === 'taxi' ? 'driving' : mode);
  url.searchParams.set('key', apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
    return null;
  }

  const route = data.routes[0];
  const leg = route.legs[0];

  // Extract transit details if available
  let modeName = getModeName(mode);
  let icon = getTransportIcon(mode);

  if (mode === 'transit' && leg.steps) {
    const transitStep = leg.steps.find((step: any) => step.travel_mode === 'TRANSIT');
    if (transitStep && transitStep.transit_details) {
      const transitDetails = transitStep.transit_details;
      const line = transitDetails.line;
      if (line) {
        modeName = line.short_name ? `${line.vehicle.name} ${line.short_name}` : line.name;
        // Get specific transit icon
        const vehicleType = line.vehicle?.type?.toLowerCase();
        if (vehicleType === 'bus') icon = TRANSPORT_ICONS.bus;
        else if (vehicleType === 'train' || vehicleType === 'heavy_rail') icon = TRANSPORT_ICONS.train;
        else if (vehicleType === 'ferry') icon = TRANSPORT_ICONS.ferry;
      }
    }
  }

  return {
    mode: mode as TransportationDetails['mode'],
    icon,
    modeName,
    duration: leg.duration.text,
    distance: leg.distance.text,
    cost: estimateCost(mode, leg.distance.value, 'default'),
  };
}

function getFallbackTransport(
  origin: Coordinates,
  destination: Coordinates,
  countryCode: string
): TransportationDetails {
  const distance = calculateDistance(
    origin.lat,
    origin.lng,
    destination.lat,
    destination.lng
  );

  const mode = distance < 1000 ? 'walking' : 'taxi';
  const duration = estimateDuration(distance, mode);

  return {
    mode: mode as TransportationDetails['mode'],
    icon: getTransportIcon(mode),
    modeName: getModeName(mode),
    duration: `~${duration} min`,
    distance: `${(distance / 1000).toFixed(1)} km`,
    cost: estimateCost(mode, distance, countryCode),
  };
}

export function getCountryCode(destination: string): string {
  const COUNTRY_MAPPING: Record<string, string> = {
    'Tokyo': 'JP', 'Japan': 'JP', 'Osaka': 'JP', 'Kyoto': 'JP',
    'Paris': 'FR', 'France': 'FR', 'Lyon': 'FR',
    'London': 'GB', 'UK': 'GB', 'United Kingdom': 'GB',
    'New York': 'US', 'USA': 'US', 'Los Angeles': 'US', 'San Francisco': 'US',
    'Singapore': 'SG',
    'Kuala Lumpur': 'MY', 'Malaysia': 'MY', 'Penang': 'MY',
    'Bangkok': 'TH', 'Thailand': 'TH', 'Phuket': 'TH', 'Chiang Mai': 'TH',
    'Dubai': 'AE', 'UAE': 'AE', 'Abu Dhabi': 'AE',
    'Hong Kong': 'HK',
    'Seoul': 'KR', 'Korea': 'KR', 'South Korea': 'KR',
    'Istanbul': 'TR', 'Turkey': 'TR',
    'Barcelona': 'ES', 'Spain': 'ES', 'Madrid': 'ES',
    'Berlin': 'DE', 'Germany': 'DE', 'Munich': 'DE',
    'Rome': 'IT', 'Italy': 'IT', 'Milan': 'IT'
  };

  for (const [key, code] of Object.entries(COUNTRY_MAPPING)) {
    if (destination.toLowerCase().includes(key.toLowerCase())) {
      return code;
    }
  }

  return 'default';
}

interface Activity {
  type?: string;
  title?: string;
  restaurantOptions?: Array<{
    priceLevel?: number;
  }>;
  transportToNext?: {
    mode?: string;
    cost?: string;
  };
}

interface Day {
  activities: Activity[];
}

interface CostBreakdown {
  accommodation: number;
  activities: number;
  meals: number;
  transportation: number;
  total: number;
  currency: string;
  perPerson?: number;
  perDay?: number;
}

/**
 * Parse cost string to number and convert to USD
 * Examples: "$20", "¥1000", "€15-25", "$10-20", "¥200-400", "Rp50000"
 */
function parseCost(costString: string): number {
  if (!costString) return 0;

  // Detect currency symbol
  let detectedCurrency = 'USD'; // Default

  if (costString.includes('¥')) {
    detectedCurrency = 'JPY';
  } else if (costString.includes('€')) {
    detectedCurrency = 'EUR';
  } else if (costString.includes('£')) {
    detectedCurrency = 'GBP';
  } else if (costString.includes('₹')) {
    detectedCurrency = 'INR';
  } else if (costString.includes('Rp')) {
    detectedCurrency = 'IDR';
  } else if (costString.includes('RM')) {
    detectedCurrency = 'MYR';
  } else if (costString.includes('฿')) {
    detectedCurrency = 'THB';
  } else if (costString.includes('$')) {
    detectedCurrency = 'USD';
  }

  // Remove all currency symbols and non-numeric characters (except digits, dots, and hyphens)
  const cleaned = costString.replace(/[^0-9.\-]/g, '').trim();

  let amount = 0;

  // Handle range (e.g., "10-20" or "200-400")
  if (cleaned.includes('-')) {
    const [min, max] = cleaned.split('-').map(s => parseFloat(s.trim()));
    amount = (min + max) / 2; // Use average
  } else {
    // Single value
    amount = parseFloat(cleaned) || 0;
  }

  // Convert to USD using approximate exchange rates
  const exchangeRates: Record<string, number> = {
    'USD': 1.0,
    'JPY': 149.50,    // ¥100 = ~$0.67
    'EUR': 0.92,      // €1 = ~$1.09
    'GBP': 0.79,      // £1 = ~$1.27
    'INR': 83.12,     // ₹100 = ~$1.20
    'IDR': 15678.0,   // Rp10,000 = ~$0.64
    'MYR': 4.72,      // RM10 = ~$2.12
    'THB': 35.20,     // ฿100 = ~$2.84
    'CNY': 7.24,      // ¥100 = ~$13.81
  };

  const rate = exchangeRates[detectedCurrency] || 1.0;
  const amountInUSD = amount / rate;

  return amountInUSD;
}

/**
 * Estimate meal cost based on price level
 * priceLevel: 1 ($), 2 ($$), 3 ($$$), 4 ($$$$)
 */
function estimateMealCost(priceLevel?: number): number {
  if (!priceLevel) return 15; // Default mid-range

  switch (priceLevel) {
    case 1: return 7.5;   // $ = $5-10, average $7.5
    case 2: return 17.5;  // $$ = $10-25, average $17.5
    case 3: return 37.5;  // $$$ = $25-50, average $37.5
    case 4: return 75;    // $$$$ = $50-100, average $75
    default: return 15;
  }
}

/**
 * Estimate activity cost based on type
 */
function estimateActivityCost(activity: Activity): number {
  if (!activity.type || activity.type === 'meal' || activity.type === 'hotel') {
    return 0; // Don't count meals/hotels as activities
  }

  const title = activity.title?.toLowerCase() || '';

  // Free activities
  if (title.includes('walk') ||
      title.includes('explore') ||
      title.includes('stroll') ||
      title.includes('view') ||
      title.includes('photo') ||
      title.includes('check-in') ||
      title.includes('check-out') ||
      title.includes('arrive') ||
      title.includes('depart')) {
    return 0;
  }

  // Expensive activities
  if (title.includes('tour') ||
      title.includes('cruise') ||
      title.includes('experience')) {
    return 40;
  }

  // Museum/Temple/Attraction
  if (title.includes('museum') ||
      title.includes('temple') ||
      title.includes('palace') ||
      title.includes('tower') ||
      title.includes('shrine') ||
      title.includes('visit')) {
    return 20;
  }

  // Shopping (variable)
  if (title.includes('shop') || title.includes('market')) {
    return 30; // Optional spending
  }

  // Default activity cost
  return 25;
}

/**
 * Estimate transportation cost if not provided
 */
function estimateTransportCost(mode?: string): number {
  if (!mode) return 0;

  const modeLower = mode.toLowerCase();

  if (modeLower.includes('walk')) return 0;
  if (modeLower.includes('transit') || modeLower.includes('train') || modeLower.includes('subway')) return 3;
  if (modeLower.includes('taxi') || modeLower.includes('uber') || modeLower.includes('grab')) return 15;
  if (modeLower.includes('drive') || modeLower.includes('car')) return 10;

  return 5; // Default
}

/**
 * Calculate total trip costs
 */
export function calculateTripCosts(
  days: Day[],
  hotelPricePerNight: number = 0,
  numberOfTravelers: number = 1,
  currency: string = 'USD'
): CostBreakdown {
  let accommodationCost = 0;
  let activitiesCost = 0;
  let mealsCost = 0;
  let transportationCost = 0;

  // 1. Accommodation (hotels)
  const numberOfNights = Math.max(days.length - 1, 1); // N days = N-1 nights
  accommodationCost = hotelPricePerNight * numberOfNights;

  // 2. Loop through all activities
  days.forEach(day => {
    day.activities.forEach(activity => {
      // Count meals
      if (activity.type === 'meal' && activity.restaurantOptions) {
        // Average cost across 3 restaurant options
        const restaurantCosts = activity.restaurantOptions.map(
          restaurant => estimateMealCost(restaurant.priceLevel)
        );
        const avgMealCost = restaurantCosts.length > 0
          ? restaurantCosts.reduce((sum, cost) => sum + cost, 0) / restaurantCosts.length
          : 15;

        mealsCost += avgMealCost;
      }

      // Count activities (exclude meals and hotels)
      if (activity.type !== 'meal' && activity.type !== 'hotel') {
        activitiesCost += estimateActivityCost(activity);
      }

      // Count transportation
      if (activity.transportToNext) {
        if (activity.transportToNext.cost) {
          // Use actual cost if available
          transportationCost += parseCost(activity.transportToNext.cost);
        } else if (activity.transportToNext.mode) {
          // Estimate if mode is known but cost is missing
          transportationCost += estimateTransportCost(activity.transportToNext.mode);
        }
      }
    });
  });

  const total = accommodationCost + activitiesCost + mealsCost + transportationCost;

  return {
    accommodation: Math.round(accommodationCost * 100) / 100,
    activities: Math.round(activitiesCost * 100) / 100,
    meals: Math.round(mealsCost * 100) / 100,
    transportation: Math.round(transportationCost * 100) / 100,
    total: Math.round(total * 100) / 100,
    currency,
    perPerson: numberOfTravelers > 1 ? Math.round((total / numberOfTravelers) * 100) / 100 : undefined,
    perDay: days.length > 0 ? Math.round((total / days.length) * 100) / 100 : undefined,
  };
}


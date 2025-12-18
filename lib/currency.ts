export const CURRENCIES = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", rate: 1 },
  MYR: { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", rate: 4.5 },
  IDR: { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", rate: 15000 },
  THB: { code: "THB", symbol: "฿", name: "Thai Baht", rate: 35 },
  SGD: { code: "SGD", symbol: "S$", name: "Singapore Dollar", rate: 1.35 },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 150 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", rate: 0.92 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", rate: 0.79 },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 1.53 },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham", rate: 3.67 },
};

export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  Indonesia: "IDR",
  Jakarta: "IDR",
  Bali: "IDR",
  Malaysia: "MYR",
  "Kuala Lumpur": "MYR",
  Thailand: "THB",
  Bangkok: "THB",
  Singapore: "SGD",
  Japan: "JPY",
  Tokyo: "JPY",
  France: "EUR",
  Paris: "EUR",
  Spain: "EUR",
  Barcelona: "EUR",
  Italy: "EUR",
  Rome: "EUR",
  Germany: "EUR",
  UK: "GBP",
  "United Kingdom": "GBP",
  England: "GBP",
  London: "GBP",
  UAE: "AED",
  Dubai: "AED",
  Australia: "AUD",
  Sydney: "AUD",
  USA: "USD",
  "United States": "USD",
  "New York": "USD",
};

export function detectCurrencyFromDestination(destination: string): string {
  const destLower = destination.toLowerCase();

  for (const [country, currency] of Object.entries(COUNTRY_CURRENCY_MAP)) {
    if (destLower.includes(country.toLowerCase())) {
      return currency;
    }
  }

  return "USD"; // default
}

export function convertPrice(usdPrice: number, toCurrency: string): number {
  const currency = CURRENCIES[toCurrency as keyof typeof CURRENCIES];
  if (!currency) return usdPrice;

  const converted = usdPrice * currency.rate;

  // Round appropriately based on currency
  if (toCurrency === "IDR" || toCurrency === "JPY") {
    return Math.round(converted / 100) * 100; // Round to nearest 100
  } else if (toCurrency === "MYR" || toCurrency === "SGD" || toCurrency === "THB") {
    return Math.round(converted);
  } else {
    return Math.round(converted * 100) / 100; // 2 decimal places
  }
}

export function formatPrice(price: number, currencyCode: string): string {
  const currency = CURRENCIES[currencyCode as keyof typeof CURRENCIES];
  if (!currency) return `$${price}`;

  // Format based on currency type
  if (currencyCode === "IDR" || currencyCode === "JPY") {
    return `${currency.symbol}${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  } else if (currencyCode === "MYR" || currencyCode === "SGD" || currencyCode === "THB") {
    return `${currency.symbol}${price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  } else {
    return `${currency.symbol}${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

// Map currency symbols to currency codes
const SYMBOL_TO_CURRENCY: Record<string, string> = {
  '¥': 'JPY',
  '$': 'USD',
  '€': 'EUR',
  '£': 'GBP',
  'RM': 'MYR',
  '฿': 'THB',
  'S$': 'SGD',
  'A$': 'AUD',
  'Rp': 'IDR',
  'د.إ': 'AED',
  'AED': 'AED',
  'HK$': 'USD', // Approximate HKD as USD
  '₩': 'USD', // Approximate KRW - convert at display time
};

/**
 * Convert price from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  const fromRate = CURRENCIES[fromCurrency as keyof typeof CURRENCIES]?.rate || 1;
  const toRate = CURRENCIES[toCurrency as keyof typeof CURRENCIES]?.rate || 1;

  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  const converted = usdAmount * toRate;

  // Round appropriately
  if (toCurrency === "IDR" || toCurrency === "JPY") {
    return Math.round(converted / 100) * 100;
  } else if (toCurrency === "MYR" || toCurrency === "SGD" || toCurrency === "THB") {
    return Math.round(converted);
  } else {
    return Math.round(converted * 100) / 100;
  }
}

/**
 * Parse a transportation cost string (e.g., "¥200-400") and convert to target currency
 */
export function convertTransportCost(
  costString: string,
  targetCurrency: string
): string {
  if (!costString || costString === 'Free' || costString === 'N/A') {
    return costString;
  }

  // Try to detect the source currency from the string
  let sourceCurrency = 'USD';
  let cleanedString = costString;

  // Check for multi-character symbols first (RM, S$, A$, etc.)
  for (const [symbol, currency] of Object.entries(SYMBOL_TO_CURRENCY)) {
    if (costString.includes(symbol)) {
      sourceCurrency = currency;
      cleanedString = costString.replace(symbol, '');
      break;
    }
  }

  // If source and target are the same, return original
  if (sourceCurrency === targetCurrency) {
    return costString;
  }

  // Extract numbers from the string (handles "200-400", "~500", "$50-100")
  const numbers = cleanedString.match(/\d+/g);
  if (!numbers || numbers.length === 0) {
    return costString;
  }

  const minValue = parseInt(numbers[0]);
  const maxValue = numbers.length > 1 ? parseInt(numbers[1]) : minValue;

  // Convert values
  const convertedMin = convertCurrency(minValue, sourceCurrency, targetCurrency);
  const convertedMax = convertCurrency(maxValue, sourceCurrency, targetCurrency);

  // Format the result
  const targetSymbol = CURRENCIES[targetCurrency as keyof typeof CURRENCIES]?.symbol || '$';

  // Check if there was a ~ prefix (approximate)
  const isApproximate = costString.startsWith('~');

  if (minValue === maxValue || convertedMin === convertedMax) {
    return `${isApproximate ? '~' : ''}${targetSymbol}${Math.round(convertedMin).toLocaleString()}`;
  }

  return `${isApproximate ? '~' : ''}${targetSymbol}${Math.round(convertedMin).toLocaleString()}-${Math.round(convertedMax).toLocaleString()}`;
}

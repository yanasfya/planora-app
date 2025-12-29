/**
 * Currency Converter with Live Exchange Rates
 * Uses exchangerate-api.com for real-time conversion
 * Falls back to static rates if API fails
 */

// Static fallback exchange rates (base: USD)
const STATIC_RATES: Record<string, number> = {
  'USD': 1.0,
  'EUR': 0.92,
  'GBP': 0.79,
  'JPY': 149.50,
  'CNY': 7.24,
  'INR': 83.12,
  'IDR': 15678.0,
  'AUD': 1.52,
  'CAD': 1.36,
  'SGD': 1.34,
  'MYR': 4.72,
  'THB': 35.20,
  'KRW': 1320.0,
  'HKD': 7.83,
  'PHP': 56.50,
  'AED': 3.67,
};

// Cache for exchange rates
interface RateCache {
  rates: Record<string, number>;
  timestamp: number;
}

let rateCache: RateCache | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Fetch live exchange rates from API
 */
async function fetchExchangeRates(): Promise<Record<string, number>> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();

    if (data && data.rates) {
      return data.rates;
    } else {
      throw new Error('Invalid API response format');
    }
  } catch (error) {
    console.error('[Currency Converter] Failed to fetch live rates:', error);
    return STATIC_RATES;
  }
}

/**
 * Get exchange rates with caching
 */
async function getExchangeRates(): Promise<Record<string, number>> {
  const now = Date.now();

  if (rateCache && (now - rateCache.timestamp) < CACHE_DURATION) {
    return rateCache.rates;
  }

  const rates = await fetchExchangeRates();

  // Update cache
  rateCache = {
    rates,
    timestamp: now,
  };

  return rates;
}

/**
 * Convert amount from one currency to another (async)
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const rates = await getExchangeRates();

  // Convert from source currency to USD, then USD to target currency
  const amountInUSD = amount / (rates[fromCurrency] || 1);
  const convertedAmount = amountInUSD * (rates[toCurrency] || 1);

  return convertedAmount;
}

/**
 * Convert amount from one currency to another (sync with fallback)
 * Use this for immediate rendering with static rates
 */
export function convertCurrencySync(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Use cached rates if available, otherwise use static rates
  const rates = rateCache?.rates || STATIC_RATES;

  // Convert from source currency to USD, then USD to target currency
  const amountInUSD = amount / (rates[fromCurrency] || 1);
  const convertedAmount = amountInUSD * (rates[toCurrency] || 1);

  return convertedAmount;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CNY': '¥',
    'INR': '₹',
    'IDR': 'Rp',
    'AUD': 'A$',
    'CAD': 'C$',
    'SGD': 'S$',
    'MYR': 'RM',
    'THB': '฿',
    'KRW': '₩',
    'HKD': 'HK$',
    'PHP': '₱',
    'AED': 'د.إ',
  };

  return symbols[currency] || '$';
}

/**
 * Format currency amount with proper symbol and decimals
 */
export function formatCurrency(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);

  // JPY, IDR, KRW don't use decimals
  const noDecimalCurrencies = ['JPY', 'IDR', 'KRW'];
  const decimals = noDecimalCurrencies.includes(currency) ? 0 : 2;

  // Format with commas
  const formatted = amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `${symbol}${formatted}`;
}

/**
 * Preload exchange rates on module load (optional)
 */
export async function preloadExchangeRates(): Promise<void> {
  try {
    await getExchangeRates();
  } catch (error) {
    console.error('[Currency Converter] Failed to preload exchange rates:', error);
  }
}

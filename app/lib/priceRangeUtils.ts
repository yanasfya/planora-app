/**
 * Price ranges by currency (per person)
 */
const PRICE_RANGES: Record<string, Record<number, { min: number; max: number }>> = {
  USD: {
    1: { min: 5, max: 15 },
    2: { min: 15, max: 35 },
    3: { min: 35, max: 70 },
    4: { min: 70, max: 150 },
  },
  EUR: {
    1: { min: 5, max: 15 },
    2: { min: 15, max: 35 },
    3: { min: 35, max: 65 },
    4: { min: 65, max: 120 },
  },
  GBP: {
    1: { min: 5, max: 12 },
    2: { min: 12, max: 28 },
    3: { min: 28, max: 55 },
    4: { min: 55, max: 95 },
  },
  JPY: {
    1: { min: 800, max: 1500 },
    2: { min: 1500, max: 4500 },
    3: { min: 4500, max: 9000 },
    4: { min: 9000, max: 18000 },
  },
  MYR: {
    1: { min: 10, max: 30 },
    2: { min: 30, max: 90 },
    3: { min: 90, max: 180 },
    4: { min: 180, max: 350 },
  },
  SGD: {
    1: { min: 8, max: 20 },
    2: { min: 20, max: 55 },
    3: { min: 55, max: 115 },
    4: { min: 115, max: 230 },
  },
  THB: {
    1: { min: 100, max: 300 },
    2: { min: 300, max: 900 },
    3: { min: 900, max: 1800 },
    4: { min: 1800, max: 3500 },
  },
  IDR: {
    1: { min: 30000, max: 80000 },
    2: { min: 80000, max: 300000 },
    3: { min: 300000, max: 600000 },
    4: { min: 600000, max: 1200000 },
  },
  INR: {
    1: { min: 200, max: 500 },
    2: { min: 500, max: 1800 },
    3: { min: 1800, max: 3500 },
    4: { min: 3500, max: 7000 },
  },
  AUD: {
    1: { min: 10, max: 25 },
    2: { min: 25, max: 55 },
    3: { min: 55, max: 115 },
    4: { min: 115, max: 210 },
  },
  KRW: {
    1: { min: 8000, max: 15000 },
    2: { min: 15000, max: 40000 },
    3: { min: 40000, max: 90000 },
    4: { min: 90000, max: 180000 },
  },
};

/**
 * Currency symbols
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  MYR: 'RM',
  SGD: 'S$',
  THB: '฿',
  IDR: 'Rp',
  INR: '₹',
  AUD: 'A$',
  KRW: '₩',
  PHP: '₱',
  VND: '₫',
};

/**
 * Convert price level ($ to $$$$) to numeric level
 */
function parsePriceLevel(priceString?: string): number {
  if (!priceString) return 2; // Default to $$

  // Count dollar signs
  const dollarCount = (priceString.match(/\$/g) || []).length;

  if (dollarCount >= 4) return 4;
  if (dollarCount >= 3) return 3;
  if (dollarCount >= 2) return 2;
  if (dollarCount >= 1) return 1;

  // Try to parse from Google Places price_level (0-4)
  const numericLevel = parseInt(priceString, 10);
  if (!isNaN(numericLevel) && numericLevel >= 0 && numericLevel <= 4) {
    return Math.max(1, numericLevel); // Treat 0 as 1
  }

  return 2; // Default
}

/**
 * Format number with appropriate separators
 */
function formatNumber(num: number, currency: string): string {
  // Currencies that don't use decimals
  const noDecimalCurrencies = ['JPY', 'KRW', 'IDR', 'VND'];

  if (noDecimalCurrencies.includes(currency)) {
    // Use comma separator for thousands
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

/**
 * Get price range string from price level
 *
 * @param priceLevel - Price level string (e.g., "$", "$$", "$$$") or number (1-4)
 * @param currency - Currency code (e.g., "USD", "MYR", "JPY")
 * @returns Formatted price range string (e.g., "$15-30/person")
 */
export function getPriceRange(priceLevel?: string | number, currency: string = 'USD'): string {
  // Convert to numeric level
  let level: number;
  if (typeof priceLevel === 'number') {
    level = Math.min(4, Math.max(1, priceLevel));
  } else {
    level = parsePriceLevel(priceLevel);
  }

  // Get price range for currency (fallback to USD if not found)
  const currencyRanges = PRICE_RANGES[currency] || PRICE_RANGES['USD'];
  const range = currencyRanges[level] || currencyRanges[2];

  // Get currency symbol
  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  // Format the range
  const minFormatted = formatNumber(range.min, currency);
  const maxFormatted = formatNumber(range.max, currency);

  // Add "+" for highest tier
  const suffix = level === 4 ? '+' : '';

  return `${symbol}${minFormatted}-${maxFormatted}${suffix}/person`;
}

/**
 * Get price range without "/person" suffix (for compact display)
 */
export function getPriceRangeCompact(priceLevel?: string | number, currency: string = 'USD'): string {
  const fullRange = getPriceRange(priceLevel, currency);
  return fullRange.replace('/person', '');
}

/**
 * Get average price from price level
 */
export function getAveragePrice(priceLevel?: string | number, currency: string = 'USD'): number {
  let level: number;
  if (typeof priceLevel === 'number') {
    level = Math.min(4, Math.max(1, priceLevel));
  } else {
    level = parsePriceLevel(priceLevel);
  }

  const currencyRanges = PRICE_RANGES[currency] || PRICE_RANGES['USD'];
  const range = currencyRanges[level] || currencyRanges[2];

  return (range.min + range.max) / 2;
}

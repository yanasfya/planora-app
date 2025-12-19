"use client";

import { CURRENCIES } from "@/lib/currency";
import { useCurrency } from "@/app/contexts/CurrencyContext";

interface CurrencySelectorProps {
  variant?: "inline" | "dropdown";
  showLabel?: boolean;
  onCurrencyChange?: (currency: string) => void;
}

export default function CurrencySelector({
  variant = "dropdown",
  showLabel = true,
  onCurrencyChange,
}: CurrencySelectorProps) {
  const { getActiveCurrency, setPageCurrency, autoDetectedCurrency } = useCurrency();
  const activeCurrency = getActiveCurrency();

  const handleChange = (newCurrency: string) => {
    if (onCurrencyChange) {
      onCurrencyChange(newCurrency);
    }
    setPageCurrency(newCurrency);
  };

  return (
    <div className="flex items-center gap-2">
      {showLabel && <span className="text-sm font-medium text-gray-700">Currency:</span>}
      <select
        value={activeCurrency}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        {autoDetectedCurrency && (
          <option value={autoDetectedCurrency}>
            {CURRENCIES[autoDetectedCurrency as keyof typeof CURRENCIES]?.symbol}{" "}
            {autoDetectedCurrency} (Auto)
          </option>
        )}
        {Object.entries(CURRENCIES)
          .filter(([code]) => code !== autoDetectedCurrency)
          .map(([code, curr]) => (
            <option key={code} value={code}>
              {curr.symbol} {curr.code}
            </option>
          ))}
      </select>
    </div>
  );
}

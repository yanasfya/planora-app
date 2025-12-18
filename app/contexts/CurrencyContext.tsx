"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CURRENCIES } from "@/lib/currency";

interface CurrencyContextType {
  globalCurrency: string;
  setGlobalCurrency: (currency: string) => void;
  pageCurrency: string | null;
  setPageCurrency: (currency: string | null) => void;
  getActiveCurrency: () => string;
  autoDetectedCurrency: string | null;
  setAutoDetectedCurrency: (currency: string | null) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [globalCurrency, setGlobalCurrencyState] = useState<string>("USD");
  const [pageCurrency, setPageCurrency] = useState<string | null>(null);
  const [autoDetectedCurrency, setAutoDetectedCurrency] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("preferredCurrency");
    if (saved && CURRENCIES[saved as keyof typeof CURRENCIES]) {
      setGlobalCurrencyState(saved);
    }
  }, []);

  // Save to localStorage when changed
  const setGlobalCurrency = (currency: string) => {
    setGlobalCurrencyState(currency);
    localStorage.setItem("preferredCurrency", currency);
  };

  // Get active currency (priority: page > auto-detected > global)
  // Auto-detected takes precedence so Paris shows EUR, Tokyo shows JPY, etc.
  const getActiveCurrency = () => {
    return pageCurrency || autoDetectedCurrency || globalCurrency || "USD";
  };

  return (
    <CurrencyContext.Provider
      value={{
        globalCurrency,
        setGlobalCurrency,
        pageCurrency,
        setPageCurrency,
        getActiveCurrency,
        autoDetectedCurrency,
        setAutoDetectedCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}

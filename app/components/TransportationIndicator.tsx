"use client";

import { motion } from "framer-motion";
import type { TransportationDetails } from "@/lib/transportationCalculator";
import { useCurrency } from "@/app/contexts/CurrencyContext";
import { convertTransportCost } from "@/lib/currency";

interface TransportationIndicatorProps {
  transport: TransportationDetails;
}

export default function TransportationIndicator({ transport }: TransportationIndicatorProps) {
  const { getActiveCurrency } = useCurrency();
  const selectedCurrency = getActiveCurrency();

  // Convert the transport cost to the user's selected currency
  const displayCost = convertTransportCost(transport.cost, selectedCurrency);
  // Color scheme based on transport mode
  const getColorScheme = (mode: string) => {
    switch (mode) {
      case 'walking':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: 'text-green-600',
        };
      case 'transit':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: 'text-blue-600',
        };
      case 'taxi':
      case 'driving':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: 'text-yellow-600',
        };
      case 'bicycle':
        return {
          bg: 'bg-teal-50',
          border: 'border-teal-200',
          text: 'text-teal-700',
          icon: 'text-teal-600',
        };
      case 'ferry':
        return {
          bg: 'bg-cyan-50',
          border: 'border-cyan-200',
          text: 'text-cyan-700',
          icon: 'text-cyan-600',
        };
      case 'flight':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-700',
          icon: 'text-purple-600',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: 'text-gray-600',
        };
    }
  };

  const colors = getColorScheme(transport.mode);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="my-2 sm:my-3 flex items-center gap-2 sm:gap-3"
    >
      {/* Vertical connector line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="h-2 sm:h-3 w-0.5 bg-gray-300" />
        <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full ${colors.bg} ${colors.border} border-2`}>
          <span className={`text-lg sm:text-xl ${colors.icon}`}>{transport.icon}</span>
        </div>
        <div className="h-2 sm:h-3 w-0.5 bg-gray-300" />
      </div>

      {/* Transport details */}
      <div className={`flex-1 min-w-0 rounded-lg ${colors.bg} ${colors.border} border px-3 sm:px-4 py-2`}>
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-x-4 sm:gap-y-1">
          <span className={`text-sm sm:text-base font-semibold ${colors.text}`}>
            {transport.modeName}
          </span>

          <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-4 gap-y-1 text-xs sm:text-sm">
            <span className={`flex items-center gap-1 ${colors.text}`}>
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {transport.duration}
            </span>

            <span className={`flex items-center gap-1 ${colors.text}`}>
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {transport.distance}
            </span>

            <span className={`flex items-center gap-1 font-medium ${colors.text}`}>
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {displayCost}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

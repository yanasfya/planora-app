'use client';

import { useMemo } from 'react';
import { DollarSign, Hotel, Utensils, Map, TrendingUp } from 'lucide-react';
import { calculateTripCosts } from '@/app/lib/calculateTripCosts';
import { convertCurrencySync, formatCurrency } from '@/app/lib/currencyConverter';

interface Activity {
  type?: string;
  title?: string;
  restaurantOptions?: any[];
  transportToNext?: {
    mode?: string;
    cost?: string;
  };
}

interface Day {
  activities: Activity[];
}

interface BudgetWidgetProps {
  days: Day[];
  hotelPricePerNight?: number;
  numberOfTravelers?: number;
  selectedCurrency?: string; // The currency user selected in dropdown
}

export default function BudgetWidget({
  days,
  hotelPricePerNight = 120,
  numberOfTravelers = 1,
  selectedCurrency = 'USD'
}: BudgetWidgetProps) {

  /**
   * Calculate costs in USD (base currency)
   * Then convert to selected currency
   */
  const costs = useMemo(() => {
    // Step 1: Calculate all costs in USD
    const baseCosts = calculateTripCosts(days, hotelPricePerNight, numberOfTravelers, 'USD');

    // Step 2: Convert each cost to selected currency
    const convertedCosts = {
      accommodation: convertCurrencySync(baseCosts.accommodation, 'USD', selectedCurrency),
      activities: convertCurrencySync(baseCosts.activities, 'USD', selectedCurrency),
      meals: convertCurrencySync(baseCosts.meals, 'USD', selectedCurrency),
      transportation: convertCurrencySync(baseCosts.transportation, 'USD', selectedCurrency),
      total: convertCurrencySync(baseCosts.total, 'USD', selectedCurrency),
      currency: selectedCurrency,
      perPerson: baseCosts.perPerson
        ? convertCurrencySync(baseCosts.perPerson, 'USD', selectedCurrency)
        : undefined,
      perDay: baseCosts.perDay
        ? convertCurrencySync(baseCosts.perDay, 'USD', selectedCurrency)
        : undefined,
    };

    console.log('[BudgetWidget] Currency conversion:', {
      from: 'USD',
      to: selectedCurrency,
      baseTotalUSD: baseCosts.total,
      convertedTotal: convertedCosts.total,
    });

    return convertedCosts;
  }, [days, hotelPricePerNight, numberOfTravelers, selectedCurrency]);

  const categories = [
    {
      icon: Hotel,
      label: 'Accommodation',
      amount: costs.accommodation,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: Map,
      label: 'Activities',
      amount: costs.activities,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Utensils,
      label: 'Meals',
      amount: costs.meals,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      icon: TrendingUp,
      label: 'Transportation',
      amount: costs.transportation,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Trip Budget
        </h3>
      </div>

      {/* Cost Categories */}
      <div className="space-y-3 mb-6">
        {categories.map((category) => (
          <div key={category.label} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${category.bgColor} rounded-lg flex items-center justify-center`}>
                <category.icon className={`w-5 h-5 ${category.color}`} />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {category.label}
              </span>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(category.amount, costs.currency)}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

      {/* Total */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-base font-bold text-gray-900 dark:text-gray-100">
          Total Estimate
        </span>
        <span className="text-2xl font-bold text-green-600">
          {formatCurrency(costs.total, costs.currency)}
        </span>
      </div>

      {/* Per Person / Per Day */}
      <div className="space-y-2">
        {costs.perPerson && numberOfTravelers > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Per Person ({numberOfTravelers} travelers)
            </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(costs.perPerson, costs.currency)}
            </span>
          </div>
        )}
        {costs.perDay && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Per Day ({days.length} days)
            </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(costs.perDay, costs.currency)}
            </span>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-xs text-yellow-800 dark:text-yellow-200">
          💡 <strong>Note:</strong> These are estimated costs based on average prices. Actual costs may vary.
        </p>
      </div>
    </div>
  );
}

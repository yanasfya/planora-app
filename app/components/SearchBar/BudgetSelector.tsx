"use client";

import { DollarSign } from "lucide-react";
import { motion } from "framer-motion";

interface BudgetSelectorProps {
  budget: 'low' | 'medium' | 'high';
  onBudgetChange: (budget: 'low' | 'medium' | 'high') => void;
}

export default function BudgetSelector({ budget, onBudgetChange }: BudgetSelectorProps) {
  const budgetOptions = [
    { value: 'low' as const, label: '$', name: 'Budget', description: '$50-100/night', color: 'blue' },
    { value: 'medium' as const, label: '$$', name: 'Medium', description: '$100-250/night', color: 'purple' },
    { value: 'high' as const, label: '$$$', name: 'Luxury', description: '$250+/night', color: 'amber' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={(e) => e.stopPropagation()}
      className="search-bar-dropdown w-80 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
      data-dropdown="search-budget"
    >
      <div className="mb-4 flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Select Budget</h2>
      </div>

      <div className="space-y-3">
        {budgetOptions.map((option) => {
          const isSelected = budget === option.value;
          const colorClasses: Record<string, string> = {
            blue: isSelected ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-100 text-gray-600 border-gray-200',
            purple: isSelected ? 'bg-purple-500 text-white border-purple-500' : 'bg-gray-100 text-gray-600 border-gray-200',
            amber: isSelected ? 'bg-amber-500 text-white border-amber-500' : 'bg-gray-100 text-gray-600 border-gray-200',
          };

          return (
            <button
              key={option.value}
              onClick={() => onBudgetChange(option.value)}
              className={`flex w-full items-center justify-between rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                colorClasses[option.color]
              }`}
            >
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{option.label}</span>
                  <span className="text-lg font-semibold">{option.name}</span>
                </div>
                <p className={`text-sm ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                  {option.description}
                </p>
              </div>
              <div
                className={`h-5 w-5 rounded-full border-2 ${
                  isSelected
                    ? 'border-white bg-white'
                    : 'border-gray-300'
                }`}
              >
                {isSelected && (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className={`h-2 w-2 rounded-full ${
                      option.color === 'blue' ? 'bg-blue-500' :
                      option.color === 'purple' ? 'bg-purple-500' :
                      'bg-amber-500'
                    }`} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

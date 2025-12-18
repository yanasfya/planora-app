"use client";

import { Minus, Plus, Users } from "lucide-react";
import { motion } from "framer-motion";

interface WhoDropdownProps {
  groupType: 'solo' | 'couple' | 'family' | 'friends';
  adults: number;
  children: number;
  infants: number;
  onGroupTypeChange: (type: 'solo' | 'couple' | 'family' | 'friends') => void;
  onPassengerChange: (adults: number, children: number, infants: number) => void;
}

export default function WhoDropdown({
  groupType,
  adults,
  children,
  infants,
  onGroupTypeChange,
  onPassengerChange,
}: WhoDropdownProps) {
  const updateAdults = (value: number) => {
    const newAdults = Math.max(1, Math.min(10, value));
    onPassengerChange(newAdults, children, infants);
  };

  const updateChildren = (value: number) => {
    const newChildren = Math.max(0, Math.min(5, value));
    onPassengerChange(adults, newChildren, infants);
  };

  const updateInfants = (value: number) => {
    const newInfants = Math.max(0, Math.min(2, value));
    onPassengerChange(adults, children, newInfants);
  };

  const groupTypes: Array<{ value: 'solo' | 'couple' | 'family' | 'friends'; label: string }> = [
    { value: 'solo', label: 'Solo' },
    { value: 'couple', label: 'Couple' },
    { value: 'family', label: 'Family' },
    { value: 'friends', label: 'Friends' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={(e) => e.stopPropagation()}
      className="search-bar-dropdown w-full max-w-sm sm:w-96 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-2xl"
      data-dropdown="search-who"
    >
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-blue-600" />
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Who's Coming?</h2>
      </div>

      <div className="mb-4 sm:mb-6">
        <h3 className="mb-2 sm:mb-3 text-sm font-medium text-gray-700">Group Type</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {groupTypes.map((type) => (
            <button
              key={type.value}
              onClick={(e) => {
                e.stopPropagation();
                onGroupTypeChange(type.value);
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                groupType === type.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm sm:text-base font-medium text-gray-900">Adults</p>
            <p className="text-xs sm:text-sm text-gray-500">Ages 13+</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateAdults(adults - 1);
              }}
              disabled={adults <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 text-gray-700 transition-all hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Decrease adults"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-semibold text-gray-900">{adults}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateAdults(adults + 1);
              }}
              disabled={adults >= 10}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 text-gray-700 transition-all hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Increase adults"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm sm:text-base font-medium text-gray-900">Children</p>
            <p className="text-xs sm:text-sm text-gray-500">Ages 2-12</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateChildren(children - 1);
              }}
              disabled={children <= 0}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 text-gray-700 transition-all hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Decrease children"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-semibold text-gray-900">{children}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateChildren(children + 1);
              }}
              disabled={children >= 5}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 text-gray-700 transition-all hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Increase children"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm sm:text-base font-medium text-gray-900">Infants</p>
            <p className="text-xs sm:text-sm text-gray-500">Under 2</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateInfants(infants - 1);
              }}
              disabled={infants <= 0}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 text-gray-700 transition-all hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Decrease infants"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-semibold text-gray-900">{infants}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateInfants(infants + 1);
              }}
              disabled={infants >= 2}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 text-gray-700 transition-all hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Increase infants"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

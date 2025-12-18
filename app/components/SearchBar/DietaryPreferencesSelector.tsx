"use client";

import { motion } from "framer-motion";
import { Info } from "lucide-react";
import type { DietaryPreferences } from "./types";

interface DietaryPreferencesSelectorProps {
  preferences: DietaryPreferences;
  onPreferencesChange: (preferences: DietaryPreferences) => void;
}

const PREFERENCE_OPTIONS = [
  {
    key: 'halal' as keyof DietaryPreferences,
    icon: '🕌',
    label: 'Halal Food Only',
    description: 'Show prayer times & nearby mosques'
  },
  {
    key: 'nutAllergy' as keyof DietaryPreferences,
    icon: '🥜',
    label: 'Nut Allergies',
    description: 'Avoid restaurants serving nuts'
  },
  {
    key: 'seafoodAllergy' as keyof DietaryPreferences,
    icon: '🦐',
    label: 'Seafood Allergies',
    description: 'Avoid seafood restaurants'
  },
  {
    key: 'vegetarian' as keyof DietaryPreferences,
    icon: '🌱',
    label: 'Vegetarian Options',
    description: 'Prefer vegetarian-friendly restaurants'
  },
  {
    key: 'vegan' as keyof DietaryPreferences,
    icon: '🌿',
    label: 'Vegan Options',
    description: 'Prefer vegan-friendly restaurants'
  },
  {
    key: 'wheelchairAccessible' as keyof DietaryPreferences,
    icon: '♿',
    label: 'Wheelchair Accessible',
    description: 'Only accessible activities'
  },
];

export default function DietaryPreferencesSelector({
  preferences,
  onPreferencesChange,
}: DietaryPreferencesSelectorProps) {
  const togglePreference = (key: keyof DietaryPreferences) => {
    onPreferencesChange({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center gap-2">
        <h3 className="text-lg font-semibold text-gray-900">
          Dietary & Travel Preferences
        </h3>
        <div className="group relative">
          <Info className="h-4 w-4 text-gray-400 cursor-help" />
          <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white group-hover:block">
            Customize your itinerary based on dietary restrictions and travel needs
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PREFERENCE_OPTIONS.map((option) => {
          const isSelected = preferences[option.key];
          return (
            <motion.button
              key={option.key}
              onClick={() => togglePreference(option.key)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{option.icon}</span>
                <div className="flex-1">
                  <p className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                    {option.label}
                  </p>
                  <p className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                    {option.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

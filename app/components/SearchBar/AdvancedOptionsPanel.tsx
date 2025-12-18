"use client";

import { motion } from "framer-motion";
import type { DietaryPreferences } from "./types";

interface AdvancedOptionsPanelProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  dietaryPreferences: DietaryPreferences;
  onDietaryPreferencesChange: (prefs: DietaryPreferences) => void;
  specialRequirements: string;
  onSpecialRequirementsChange: (text: string) => void;
}

const INTERESTS = [
  'Culture', 'Food', 'Art', 'History', 'Nature',
  'Adventure', 'Beach', 'Shopping', 'Nightlife',
  'Photography', 'Wellness', 'Wildlife', 'Sports',
  'Architecture', 'Music', 'Technology'
];

const DIETARY_OPTIONS = [
  {
    id: 'halal' as keyof DietaryPreferences,
    icon: '🕌',
    label: 'Halal Food Only',
    description: 'Show prayer times & nearby mosques'
  },
  {
    id: 'nutAllergy' as keyof DietaryPreferences,
    icon: '🥜',
    label: 'Nut Allergies',
    description: 'Avoid restaurants serving nuts'
  },
  {
    id: 'seafoodAllergy' as keyof DietaryPreferences,
    icon: '🦐',
    label: 'Seafood Allergies',
    description: 'Avoid seafood restaurants'
  },
  {
    id: 'vegetarian' as keyof DietaryPreferences,
    icon: '🌱',
    label: 'Vegetarian',
    description: 'Prefer vegetarian-friendly restaurants'
  },
  {
    id: 'vegan' as keyof DietaryPreferences,
    icon: '🌿',
    label: 'Vegan',
    description: 'Prefer vegan-friendly restaurants'
  },
  {
    id: 'wheelchairAccessible' as keyof DietaryPreferences,
    icon: '♿',
    label: 'Wheelchair Accessible',
    description: 'Only accessible activities'
  }
];

export default function AdvancedOptionsPanel({
  selectedInterests,
  onInterestsChange,
  dietaryPreferences,
  onDietaryPreferencesChange,
  specialRequirements,
  onSpecialRequirementsChange,
}: AdvancedOptionsPanelProps) {

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      onInterestsChange(selectedInterests.filter(i => i !== interest));
    } else {
      onInterestsChange([...selectedInterests, interest]);
    }
  };

  const toggleDietary = (key: keyof DietaryPreferences) => {
    onDietaryPreferencesChange({
      ...dietaryPreferences,
      [key]: !dietaryPreferences[key],
    });
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg"
    >
      {/* Section 1: Interests & Activities */}
      <div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          🎯 Interests & Activities
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Select to personalize your itinerary (select at least one)
        </p>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5">
          {INTERESTS.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="my-6 border-gray-200" />

      {/* Section 2: Dietary & Accessibility */}
      <div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          🍽️ Dietary & Accessibility
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Customize for dietary needs & accessibility
        </p>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {DIETARY_OPTIONS.map((option) => {
            const isSelected = dietaryPreferences[option.id];
            return (
              <button
                key={option.id}
                onClick={() => toggleDietary(option.id)}
                className={`relative h-[72px] cursor-pointer rounded-lg border p-3 text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xl">{option.icon}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
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
              </button>
            );
          })}
        </div>
      </div>

      <hr className="my-6 border-gray-200" />

      {/* Section 3: Special Requirements */}
      <div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          📝 Special Requirements (Optional)
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Any specific needs or requests?
        </p>

        <div className="relative">
          <textarea
            value={specialRequirements}
            onChange={(e) => onSpecialRequirementsChange(e.target.value.slice(0, 500))}
            rows={4}
            maxLength={500}
            placeholder="E.g., 'Avoid crowded tourist spots', 'Prefer morning activities', 'Need wheelchair ramps', 'Halal food essential', 'Budget for shopping'..."
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <div className="mt-1 text-right text-xs text-gray-500">
            {specialRequirements.length}/500
          </div>
        </div>
      </div>
    </motion.div>
  );
}

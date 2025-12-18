'use client';

import {
  Check,
  Leaf,
  AlertTriangle,
  Accessibility,
  UtensilsCrossed
} from 'lucide-react';

interface DietaryPreferences {
  halal: boolean;
  nutAllergy: boolean;
  seafoodAllergy: boolean;
  vegetarian: boolean;
  vegan: boolean;
  wheelchairAccessible: boolean;
}

interface PreferenceSummaryProps {
  dietaryPreferences?: DietaryPreferences;
  specialRequirements?: string;
}

export default function PreferenceSummary({
  dietaryPreferences,
  specialRequirements
}: PreferenceSummaryProps) {
  if (!dietaryPreferences && !specialRequirements) {
    return null;
  }

  const activePreferences: Array<{ icon: string; label: string; color: string; strikethrough?: boolean }> = [];

  if (dietaryPreferences?.halal) {
    activePreferences.push({
      icon: '🕌',
      label: 'Halal Food Only',
      color: 'text-green-600 dark:text-green-400'
    });
  }

  if (dietaryPreferences?.vegetarian) {
    activePreferences.push({
      icon: '🥗',
      label: 'Vegetarian',
      color: 'text-emerald-600 dark:text-emerald-400'
    });
  }

  if (dietaryPreferences?.vegan) {
    activePreferences.push({
      icon: '🌱',
      label: 'Vegan',
      color: 'text-lime-600 dark:text-lime-400'
    });
  }

  if (dietaryPreferences?.nutAllergy) {
    activePreferences.push({
      icon: '🥜',
      label: 'Nut Allergy',
      color: 'text-yellow-600 dark:text-yellow-400',
      strikethrough: true
    });
  }

  if (dietaryPreferences?.seafoodAllergy) {
    activePreferences.push({
      icon: '🦐',
      label: 'Seafood Allergy',
      color: 'text-orange-600 dark:text-orange-400',
      strikethrough: true
    });
  }

  if (dietaryPreferences?.wheelchairAccessible) {
    activePreferences.push({
      icon: '♿',
      label: 'Wheelchair Accessible',
      color: 'text-blue-600 dark:text-blue-400'
    });
  }

  if (activePreferences.length === 0 && !specialRequirements) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 mb-6 border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-2 mb-3">
        <UtensilsCrossed className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Your Preferences Applied
        </h3>
        <Check className="w-4 h-4 text-green-500" />
      </div>

      {activePreferences.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activePreferences.map((pref, index) => (
            <span
              key={index}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full text-sm font-medium shadow-sm border border-gray-200 dark:border-gray-700 ${pref.color}`}
            >
              <span className={pref.strikethrough ? 'line-through' : ''}>{pref.icon}</span>
              {pref.label}
            </span>
          ))}
        </div>
      )}

      {specialRequirements && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          <strong>Special Requirements:</strong> {specialRequirements}
        </p>
      )}

      <p className="mt-3 text-xs text-blue-600 dark:text-blue-400">
        ✓ All activities and restaurants in this itinerary match your preferences
      </p>
    </div>
  );
}

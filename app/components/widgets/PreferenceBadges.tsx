'use client';

import {
  Leaf,
  AlertTriangle,
  Accessibility,
} from 'lucide-react';

interface PreferenceBadgesProps {
  preferences: {
    halal?: boolean;
    vegetarian?: boolean;
    vegan?: boolean;
    nutAllergy?: boolean;
    seafoodAllergy?: boolean;
    wheelchairAccessible?: boolean;
  };
  activityType?: string;
}

export default function PreferenceBadges({ preferences, activityType }: PreferenceBadgesProps) {
  const badges = [];

  if (preferences.halal) {
    badges.push({
      icon: '🥩',
      label: 'Halal',
      color: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
    });
  }

  if (preferences.vegetarian) {
    badges.push({
      icon: <Leaf className="w-3 h-3" />,
      label: 'Vegetarian',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700',
    });
  }

  if (preferences.vegan) {
    badges.push({
      icon: '🌱',
      label: 'Vegan',
      color: 'bg-lime-100 text-lime-800 border-lime-300 dark:bg-lime-900/30 dark:text-lime-400 dark:border-lime-700',
    });
  }

  if (preferences.nutAllergy) {
    badges.push({
      icon: <AlertTriangle className="w-3 h-3" />,
      label: 'Nut-Free',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
    });
  }

  if (preferences.seafoodAllergy) {
    badges.push({
      icon: '🦐',
      label: 'No Seafood',
      color: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700',
      strikethrough: true,
    });
  }

  if (preferences.wheelchairAccessible) {
    badges.push({
      icon: <Accessibility className="w-3 h-3" />,
      label: 'Accessible',
      color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
    });
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {badges.map((badge, index) => (
        <span
          key={index}
          className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${badge.color}`}
        >
          {typeof badge.icon === 'string' ? (
            <span className={badge.strikethrough ? 'line-through' : ''}>{badge.icon}</span>
          ) : (
            badge.icon
          )}
          {badge.label}
        </span>
      ))}
    </div>
  );
}

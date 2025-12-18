"use client";

import { useState } from "react";
import { MapPin, Star, DollarSign, ExternalLink, Check } from "lucide-react";
import { motion } from "framer-motion";
import ImageWithFallback from "./ImageWithFallback";
import { getRestaurantImageUrl } from "@lib/unsplashImages";
import { getPriceRangeCompact } from "@/app/lib/priceRangeUtils";

interface OpeningHours {
  openNow: boolean;
  weekdayText?: string[];
}

interface Restaurant {
  placeId: string;
  name: string;
  vicinity: string;
  rating: number;
  userRatingsTotal: number;
  priceLevel: number;
  cuisine: string[];
  openNow: boolean;
  openingHours?: OpeningHours;
  distance: string;
  walkingTime: string;
  badges: string[];
  photoUrl?: string;
  googleMapsUrl: string;
  coordinates: { lat: number; lng: number };
}

interface MealActivity {
  id: string;
  time: string;
  type: 'meal';
  mealType: 'breakfast' | 'lunch' | 'dinner';
  title: string;
  location: string;
  description: string;
  coordinates?: { lat: number; lng: number };
  restaurantOptions: Restaurant[];
  icon: string;
}

interface MealActivityCardProps {
  activity: MealActivity;
  onRestaurantSelect?: (restaurant: Restaurant) => void;
  currency?: string;
}

function Badge({ text }: { text: string }) {
  const badgeStyles: Record<string, string> = {
    halal: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    vegetarian: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    vegan: "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400",
    michelin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    "highly-rated": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  };

  const style = badgeStyles[text.toLowerCase()] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${style}`}>
      {text}
    </span>
  );
}

export default function MealActivityCard({ activity, onRestaurantSelect, currency = 'USD' }: MealActivityCardProps) {
  console.log('[MealActivityCard] Rendering meal activity:', activity.title);
  console.log('[MealActivityCard] Restaurant options count:', activity.restaurantOptions?.length || 0);
  console.log('[MealActivityCard] Full activity data:', activity);

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Check if restaurantOptions exists
  if (!activity.restaurantOptions || activity.restaurantOptions.length === 0) {
    console.warn('[MealActivityCard] No restaurant options provided for', activity.title);
    return (
      <div className="meal-activity-card bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-2xl shadow-md">
              {activity.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {activity.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {activity.time}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 text-center dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ⚠️ No restaurant recommendations available for this meal.
          </p>
        </div>
      </div>
    );
  }

  const selectedRestaurant = activity.restaurantOptions[selectedIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="meal-activity-card bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3 pt-4 sm:p-4 sm:pt-5 md:p-5 md:pt-6 shadow-sm"
    >
      {/* Header - RESPONSIVE: Different layout for mobile vs desktop */}
      <div className="mb-3 sm:mb-4">
        {/* Row 1: Icon + Time (mobile) OR Icon + Title + Time (desktop) */}
        <div className="flex items-center gap-2 sm:gap-3 pr-20 sm:pr-0">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-xl sm:text-2xl shadow-md flex-shrink-0">
            {activity.icon}
          </div>
          <div className="min-w-0 flex-1">
            {/* Desktop: Show title inline */}
            <h3 className="hidden sm:block text-lg font-semibold text-gray-900 dark:text-white leading-tight">
              {activity.title}
            </h3>
            {/* Mobile: Only show time in first row */}
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 sm:mt-0.5">
              {activity.time}
            </p>
          </div>
        </div>

        {/* Mobile Only: Full title below (no truncation) */}
        <h3 className="block sm:hidden text-base font-semibold text-gray-900 dark:text-white leading-tight mt-2">
          {activity.title}
        </h3>
      </div>

      {/* Description */}
      {activity.description && (
        <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
          {activity.description}
        </p>
      )}

      {/* Restaurant Options Tabs */}
      {activity.restaurantOptions.length > 0 && (
        <>
          <div className="mb-3 sm:mb-4 grid grid-cols-3 gap-1.5 sm:gap-2">
            {activity.restaurantOptions.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`flex items-center justify-center rounded-lg px-2 py-2 text-xs sm:text-sm font-medium transition-colors min-h-[44px] ${
                  selectedIndex === index
                    ? "bg-orange-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-orange-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-orange-900/30"
                }`}
              >
                <span className="whitespace-nowrap">Option {index + 1}</span>
              </button>
            ))}
          </div>

          {/* Selected Restaurant Details */}
          {selectedRestaurant && (
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg bg-white p-3 sm:p-4 shadow-sm dark:bg-gray-800"
            >
              {/* Restaurant Photo */}
              <div className="mb-3 overflow-hidden rounded-lg">
                <ImageWithFallback
                  src={selectedRestaurant.photoUrl || getRestaurantImageUrl(
                    selectedRestaurant.name,
                    selectedRestaurant.cuisine[0],
                    undefined,
                    800,
                    400
                  )}
                  alt={selectedRestaurant.name}
                  width={800}
                  height={400}
                  className="h-36 sm:h-40 md:h-48 w-full rounded-lg"
                  fallbackText={`${selectedRestaurant.name} - ${selectedRestaurant.cuisine[0] || 'Restaurant'}`}
                />
              </div>

              {/* Placeholder Warning */}
              {selectedRestaurant.placeId.startsWith('placeholder-') && (
                <div className="mb-3 rounded-lg bg-amber-50 border border-amber-200 p-2.5 sm:p-3 dark:bg-amber-900/20 dark:border-amber-800">
                  <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                    <span className="text-base sm:text-lg">ℹ️</span>
                    <span>This is a suggested location. Use &quot;View on Maps&quot; below to find specific restaurants nearby.</span>
                  </p>
                </div>
              )}

              {/* Restaurant Name and Status */}
              <div className="mb-2 sm:mb-3">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedRestaurant.name}
                </h4>
                <div className="mt-1 flex items-center gap-1.5 sm:gap-2">
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {selectedRestaurant.vicinity}
                  </p>
                </div>
              </div>

              {/* Rating and Reviews */}
              <div className="mb-2 sm:mb-3 flex flex-wrap items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                    {selectedRestaurant.rating.toFixed(1)}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    ({selectedRestaurant.userRatingsTotal.toLocaleString()} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-sm font-medium">
                    {getPriceRangeCompact(selectedRestaurant.priceLevel, currency)}
                  </span>
                </div>
              </div>

              {/* Cuisine Types */}
              {selectedRestaurant.cuisine.length > 0 && (
                <div className="mb-2 sm:mb-3 flex flex-wrap gap-1.5 sm:gap-2">
                  {selectedRestaurant.cuisine.map((cuisine) => (
                    <span
                      key={cuisine}
                      className="rounded-full bg-gray-100 px-2 py-0.5 sm:py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {cuisine}
                    </span>
                  ))}
                </div>
              )}

              {/* Badges */}
              {selectedRestaurant.badges.length > 0 && (
                <div className="mb-3 sm:mb-4 flex flex-wrap gap-1.5 sm:gap-2">
                  {selectedRestaurant.badges.map((badge) => (
                    <Badge key={badge} text={badge} />
                  ))}
                </div>
              )}

              {/* Action Buttons - Always stack vertically for consistent layout */}
              <div className="flex flex-col gap-2">
                <a
                  href={selectedRestaurant.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-orange-300 bg-white px-4 py-3 min-h-[44px] text-sm font-medium text-orange-700 transition-colors hover:bg-orange-50 dark:border-orange-700 dark:bg-gray-800 dark:text-orange-400 dark:hover:bg-orange-900/20"
                >
                  <ExternalLink className="h-4 w-4 flex-shrink-0" />
                  <span>View on Maps</span>
                </a>
                {onRestaurantSelect && (
                  <button
                    onClick={() => onRestaurantSelect(selectedRestaurant)}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 min-h-[44px] text-sm font-medium text-white transition-colors hover:bg-orange-700"
                  >
                    <Check className="h-4 w-4 flex-shrink-0" />
                    <span>Select</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Fallback if no restaurants */}
      {activity.restaurantOptions.length === 0 && (
        <div className="rounded-lg bg-white p-4 text-center dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No restaurant recommendations available for this meal.
          </p>
        </div>
      )}
    </motion.div>
  );
}

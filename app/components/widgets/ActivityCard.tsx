'use client';

import { motion } from 'framer-motion';
import { Clock, MapPin, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { generateActivityBookingLink, BookingLink } from '@lib/activityBooking';
import { getActivityImageUrl, getHotelImageUrl } from '@lib/unsplashImages';
import ImageWithFallback from '../ImageWithFallback';
import type { Activity } from '@lib/types';

interface ActivityCardProps {
  activity: Activity;
  destination: string;
  index: number;
  checkInDate?: string;
  checkOutDate?: string;
}

// Helper function to get activity-specific gradient
function getActivityGradient(title: string): string {
  const t = title.toLowerCase();

  if (t.includes('burj khalifa') || t.includes('tower')) return 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600';
  if (t.includes('desert') || t.includes('safari') || t.includes('dune')) return 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-600';
  if (t.includes('beach') || t.includes('diving') || t.includes('snorkel')) return 'bg-gradient-to-br from-cyan-400 via-teal-500 to-blue-600';
  if (t.includes('museum') || t.includes('gallery') || t.includes('art')) return 'bg-gradient-to-br from-purple-400 via-violet-500 to-indigo-600';
  if (t.includes('mall') || t.includes('shopping') || t.includes('market')) return 'bg-gradient-to-br from-pink-400 via-rose-500 to-red-600';
  if (t.includes('mosque') || t.includes('temple') || t.includes('church')) return 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600';
  if (t.includes('fountain') || t.includes('show') || t.includes('performance')) return 'bg-gradient-to-br from-blue-400 via-cyan-500 to-sky-600';
  if (t.includes('hotel') || t.includes('check')) return 'bg-gradient-to-br from-slate-400 via-gray-500 to-zinc-600';
  if (t.includes('airport') || t.includes('arrive') || t.includes('departure')) return 'bg-gradient-to-br from-indigo-400 via-blue-500 to-purple-600';
  if (t.includes('park') || t.includes('garden')) return 'bg-gradient-to-br from-lime-400 via-green-500 to-emerald-600';

  return 'bg-gradient-to-br from-violet-400 via-purple-500 to-fuchsia-600'; // Default
}

// Helper function to get activity-specific emoji icon
function getActivityIcon(title: string): string {
  const t = title.toLowerCase();

  if (t.includes('burj khalifa') || t.includes('tower')) return '🏙️';
  if (t.includes('desert') || t.includes('safari')) return '🏜️';
  if (t.includes('dune')) return '🐪';
  if (t.includes('beach')) return '🏖️';
  if (t.includes('diving') || t.includes('snorkel')) return '🤿';
  if (t.includes('museum')) return '🏛️';
  if (t.includes('gallery') || t.includes('art')) return '🎨';
  if (t.includes('mall') || t.includes('shopping')) return '🛍️';
  if (t.includes('market') || t.includes('souk')) return '🏪';
  if (t.includes('mosque')) return '🕌';
  if (t.includes('temple')) return '⛩️';
  if (t.includes('church')) return '⛪';
  if (t.includes('fountain') || t.includes('show')) return '⛲';
  if (t.includes('hotel') || t.includes('check')) return '🏨';
  if (t.includes('airport') || t.includes('arrive')) return '✈️';
  if (t.includes('park') || t.includes('garden')) return '🌳';
  if (t.includes('food') || t.includes('restaurant')) return '🍽️';

  return '📍'; // Default location pin
}

export default function ActivityCard({ activity, destination, index, checkInDate, checkOutDate }: ActivityCardProps) {
  const [bookingLink, setBookingLink] = useState<BookingLink | null>(null);

  // DEBUG: Log activity data on mount
  useEffect(() => {
    console.log(`[ActivityCard] ${activity.title}:`, {
      hasPhotoUrl: !!activity.photoUrl,
      photoUrl: activity.photoUrl?.substring(0, 100),
      hasPlaceId: !!activity.placeId,
      hasCoordinates: !!activity.coordinates
    });
  }, [activity]);

  // Generate booking link on component mount
  useEffect(() => {
    const link = generateActivityBookingLink(
      activity.title,
      destination,
      undefined, // auto-select platform
      undefined, // affiliate ID
      checkInDate,
      checkOutDate
    );
    setBookingLink(link);
  }, [activity.title, destination, checkInDate, checkOutDate]);

  // Check if activity has valid coordinates
  const hasCoordinates = activity.coordinates
    ? (activity.coordinates.lat !== 0 && activity.coordinates.lng !== 0)
    : (activity.lat !== undefined && activity.lng !== undefined && activity.lat !== 0 && activity.lng !== 0);

  const lat = activity.coordinates?.lat || activity.lat || 0;
  const lng = activity.coordinates?.lng || activity.lng || 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="relative rounded-xl border border-gray-100 bg-white overflow-hidden transition-all hover:border-blue-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500"
    >
      {/* Image Section - Real photos from Google Places or gradient fallback */}
      {activity.photoUrl ? (
        <div className="relative h-36 sm:h-40 md:h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
          <ImageWithFallback
            src={activity.photoUrl}
            alt={activity.title}
            width={800}
            height={500}
            className="h-36 sm:h-40 md:h-48 w-full"
            fallbackIcon={<div className="text-5xl sm:text-6xl">{getActivityIcon(activity.title)}</div>}
            fallbackText={activity.title}
          />
          {/* Time Badge Overlay */}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-lg">
            <Clock className="h-3 w-3" />
            {activity.time}
          </div>
        </div>
      ) : (
        <div className={`relative h-36 sm:h-40 md:h-48 w-full overflow-hidden ${getActivityGradient(activity.title)}`}>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
            <div className="text-5xl sm:text-6xl mb-2">{getActivityIcon(activity.title)}</div>
            <p className="text-white text-sm font-medium opacity-90 line-clamp-2">{activity.title}</p>
          </div>
          {/* Time Badge Overlay */}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-lg">
            <Clock className="h-3 w-3" />
            {activity.time}
          </div>
        </div>
      )}

      <div className="p-3 sm:p-4 md:p-5">
        {/* Header */}
        <div className="mb-2 sm:mb-3">
          <h4 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
            {activity.title}
          </h4>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
          <span>{activity.location}</span>
        </div>

        {/* Description (if available) */}
        {activity.description && (
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">
            {activity.description}
          </p>
        )}

        {/* Action Buttons - Always stack vertically for consistent layout */}
        <div className="flex flex-col gap-2 mt-3 sm:mt-4">
          {/* Book Now Button */}
          {bookingLink && (
            <a
              href={bookingLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-lg font-medium text-white transition-all hover:opacity-90 hover:shadow-md text-sm"
              style={{ backgroundColor: bookingLink.color }}
            >
              <ExternalLink className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">
                {bookingLink.isHotel
                  ? `Book on ${bookingLink.platformName}`
                  : `Book on ${bookingLink.platformName}`}
              </span>
            </a>
          )}

          {/* View on Maps Button */}
          {hasCoordinates && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors text-sm"
            >
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>View on Maps</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

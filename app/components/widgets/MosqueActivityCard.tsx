'use client';

import { MapPin, Navigation, Star, Clock } from 'lucide-react';
import ImageWithFallback from '@/app/components/ImageWithFallback';

interface MosqueActivityCardProps {
  activity: {
    id?: string;
    time: string;
    title: string;
    location: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    distance?: string;
    walkingTime?: string;
    rating?: number;
    photoReference?: string;
    placeId?: string;
  };
}

export default function MosqueActivityCard({ activity }: MosqueActivityCardProps) {
  const mosqueName = activity.title.replace('Nearby Mosque: ', '');

  // Generate Google Maps photo URL if available
  const photoUrl = activity.photoReference
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${activity.photoReference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    : null;

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-sm border-2 border-green-200 dark:border-green-700 overflow-hidden">
      {/* Mosque Image */}
      {photoUrl && (
        <div className="relative h-40">
          <ImageWithFallback
            src={photoUrl}
            alt={mosqueName}
            width={800}
            height={300}
            className="w-full h-40 object-cover"
            fallbackText="Mosque image unavailable"
          />

          {/* Mosque Icon Overlay */}
          <div className="absolute top-3 left-3 bg-green-600 text-white p-2 rounded-full shadow-lg">
            <span className="text-xl">🕌</span>
          </div>
        </div>
      )}

      {/* Mosque Content */}
      <div className="p-3 sm:p-4 md:p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🕌</span>
              <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded-full">
                Prayer Facility
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {mosqueName}
            </h3>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
          <span>{activity.location}</span>
        </div>

        {/* Distance & Time - only show if valid (not "Unknown") */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
          {activity.distance && !activity.distance.toLowerCase().includes('unknown') && (
            <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
              <Navigation className="w-4 h-4 text-green-600" />
              <span className="font-semibold">{activity.distance}</span>
            </div>
          )}
          {activity.walkingTime && !activity.walkingTime.toLowerCase().includes('unknown') && (
            <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
              <Clock className="w-4 h-4 text-green-600" />
              <span>{(() => {
                let time = activity.walkingTime || '';
                // Normalize "mins" to "min" for consistency
                time = time.replace('mins', 'min');
                // Add "walk" suffix if not present
                if (!time.includes('walk')) time = `${time} walk`;
                return time;
              })()}</span>
            </div>
          )}
          {activity.rating && (
            <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>{activity.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Action Buttons - Always stack vertically for consistent layout */}
        <div className="flex flex-col gap-2">
          {/* View on Maps */}
          {activity.coordinates && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${activity.coordinates.lat},${activity.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>View on Maps</span>
            </a>
          )}

          {/* Get Directions */}
          {activity.coordinates && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${activity.coordinates.lat},${activity.coordinates.lng}&travelmode=walking`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border-2 border-green-600 rounded-lg font-medium transition-colors"
            >
              <Navigation className="w-4 h-4 flex-shrink-0" />
              <span>Directions</span>
            </a>
          )}
        </div>

        {/* Helper Text */}
        <p className="text-xs text-green-700 dark:text-green-400 mt-3 text-center">
          ℹ️ Convenient location for prayers during your trip
        </p>
      </div>
    </div>
  );
}

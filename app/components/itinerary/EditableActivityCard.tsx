'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, Edit2, Trash2, Save, X, ExternalLink } from 'lucide-react';
import { useItineraryEdit } from '@/app/contexts/ItineraryEditContext';
import { useCurrency } from '@/app/contexts/CurrencyContext';
import ImageWithFallback from '@/app/components/ImageWithFallback';
import MealActivityCard from '@/app/components/MealActivityCard';
import MosqueActivityCard from '@/app/components/widgets/MosqueActivityCard';
import { generateActivityBookingLink, BookingLink } from '@/app/lib/activityBooking';
import { convertTransportCost } from '@/lib/currency';

interface Activity {
  id: string;
  time: string;
  title: string;
  location: string;
  description?: string;
  photoUrl?: string;
  type?: string;
  coordinates?: { lat: number; lng: number };
  restaurantOptions?: any[];
  transportToNext?: {
    mode: string;
    duration: string;
    distance: string;
    cost?: string;
  };
}

interface EditableActivityCardProps {
  activity: Activity;
  dayIndex: number;
  activityIndex: number;
  destination: string;
  checkInDate?: string;
  checkOutDate?: string;
}

export default function EditableActivityCard({
  activity,
  dayIndex,
  activityIndex,
  destination,
  checkInDate,
  checkOutDate
}: EditableActivityCardProps) {
  const { isEditMode, updateActivity, deleteActivity } = useItineraryEdit();
  const { getActiveCurrency } = useCurrency();
  const selectedCurrency = getActiveCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [bookingLink, setBookingLink] = useState<BookingLink | null>(null);

  // Edit form state
  const [editedTime, setEditedTime] = useState(activity.time);
  const [editedTitle, setEditedTitle] = useState(activity.title);
  const [editedLocation, setEditedLocation] = useState(activity.location);
  const [editedDescription, setEditedDescription] = useState(activity.description || '');

  /**
   * Sync local state when activity prop changes (e.g., after save updates context)
   */
  useEffect(() => {
    console.log('[EditableActivityCard] useEffect triggered - activity.time changed to:', activity.time);
    setEditedTime(activity.time);
    setEditedTitle(activity.title);
    setEditedLocation(activity.location);
    setEditedDescription(activity.description || '');
  }, [activity.time, activity.title, activity.location, activity.description]);

  /**
   * Generate booking link
   */
  useEffect(() => {
    if (activity.type !== 'meal') {
      const link = generateActivityBookingLink(
        activity.title,
        destination,
        undefined,
        undefined,
        checkInDate,
        checkOutDate
      );
      setBookingLink(link);
    }
  }, [activity.title, activity.type, destination, checkInDate, checkOutDate]);

  /**
   * Save edited activity
   */
  const handleSave = () => {
    console.log('[EditableActivityCard] handleSave - saving with time:', editedTime, 'at index:', activityIndex);
    updateActivity(dayIndex, activityIndex, {
      time: editedTime,
      title: editedTitle,
      location: editedLocation,
      description: editedDescription,
    });
    setIsEditing(false);
    console.log('[EditableActivityCard] Saved activity at index:', activityIndex, 'with time:', editedTime);
  };

  /**
   * Cancel editing
   */
  const handleCancel = () => {
    setEditedTime(activity.time);
    setEditedTitle(activity.title);
    setEditedLocation(activity.location);
    setEditedDescription(activity.description || '');
    setIsEditing(false);
  };

  /**
   * Delete activity
   */
  const handleDelete = () => {
    const confirmDelete = confirm(`Delete "${activity.title}"?`);
    if (confirmDelete) {
      deleteActivity(dayIndex, activityIndex);
      console.log('[EditableActivityCard] Deleted activity at index:', activityIndex);
    }
  };

  /**
   * CRITICAL: If this is a mosque activity, render MosqueActivityCard instead
   */
  if (activity.type === 'mosque' && !isEditing) {
    return (
      <div className="relative">
        {/* Edit/Delete Buttons Overlay for Mosque Cards (Only in Edit Mode) */}
        {isEditMode && (
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-colors shadow-lg"
              title="Edit mosque"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-colors shadow-lg"
              title="Remove mosque"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Render Mosque Card */}
        <MosqueActivityCard activity={activity as any} />
      </div>
    );
  }

  /**
   * CRITICAL: If this is a meal activity, render MealActivityCard instead
   */
  if (activity.type === 'meal' && activity.restaurantOptions && activity.restaurantOptions.length > 0 && !isEditing) {
    return (
      <div className="relative">
        {/* Edit/Delete Buttons Overlay for Meal Cards - Positioned outside header area */}
        {isEditMode && (
          <div className="absolute top-2 right-2 z-10 flex gap-1.5">
            <button
              onClick={() => setIsEditing(true)}
              className="w-8 h-8 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-colors shadow-md border border-gray-200 dark:border-gray-700"
              title="Edit activity"
              aria-label="Edit meal"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="w-8 h-8 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-colors shadow-md border border-gray-200 dark:border-gray-700"
              title="Delete activity"
              aria-label="Delete meal"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Render MealActivityCard */}
        <MealActivityCard activity={activity as any} currency={selectedCurrency} />

        {/* Transportation Indicator - Only show if complete data exists */}
        {activity.transportToNext &&
         activity.transportToNext.mode &&
         activity.transportToNext.duration &&
         activity.transportToNext.distance && (
          <div className="mt-4">
            <div className="flex items-center gap-3 py-3 px-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="text-2xl">
                {activity.transportToNext.mode === 'walking' ? '🚶' :
                 activity.transportToNext.mode === 'transit' ? '🚇' :
                 activity.transportToNext.mode === 'taxi' ? '🚕' :
                 activity.transportToNext.mode === 'driving' ? '🚗' :
                 activity.transportToNext.mode === 'flight' ? '✈️' :
                 activity.transportToNext.mode === 'ferry' ? '⛴️' :
                 activity.transportToNext.mode === 'bicycle' ? '🚲' : '🚌'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <span className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                    {activity.transportToNext.mode}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    ⏱️ {activity.transportToNext.duration}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    📍 {activity.transportToNext.distance}
                  </span>
                  {activity.transportToNext.cost && (
                    <span className="text-gray-600 dark:text-gray-400">
                      💰 {convertTransportCost(activity.transportToNext.cost, selectedCurrency)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /**
   * Regular Activity Card (Non-Meal)
   */
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      {/* Activity Image */}
      {activity.photoUrl && !isEditing && (
        <div className="relative h-48">
          <ImageWithFallback
            src={activity.photoUrl}
            alt={activity.title}
            width={800}
            height={400}
            className="w-full h-48 object-cover"
          />

          {/* Time Badge Overlay */}
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {activity.time}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Activity Content */}
      <div className="p-6">
        {!isEditing ? (
          /* View Mode */
          <>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {activity.time}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {activity.title}
                </h3>
                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{activity.location}</span>
                </div>
              </div>

              {/* Edit/Delete Buttons (Only in Edit Mode) */}
              {isEditMode && (
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                    title="Edit activity"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                    title="Delete activity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            {activity.description && (
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                {activity.description}
              </p>
            )}

            {/* Action Buttons (Booking & Maps) - Always stack vertically for mobile */}
            {activity.type !== 'meal' && (
              <div className="flex flex-col gap-2 mt-4">
                {/* Booking Button */}
                {bookingLink && (
                  <a
                    href={bookingLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-lg font-medium text-white transition-all hover:opacity-90 hover:shadow-md"
                    style={{ backgroundColor: bookingLink.color }}
                  >
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                      {bookingLink.isHotel
                        ? `Book on ${bookingLink.platformName}`
                        : `Book on ${bookingLink.platformName}`
                      }
                    </span>
                  </a>
                )}

                {/* View on Maps Button */}
                {activity.coordinates && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${activity.coordinates.lat},${activity.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-4 py-3 min-h-[44px] bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>View on Maps</span>
                  </a>
                )}
              </div>
            )}
          </>
        ) : (
          /* Edit Mode */
          <div className="space-y-4">
            {/* Time Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time
              </label>
              <input
                type="time"
                value={editedTime}
                onChange={(e) => setEditedTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                placeholder="Activity title"
              />
            </div>

            {/* Location Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                type="text"
                value={editedLocation}
                onChange={(e) => setEditedLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                placeholder="Location"
              />
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                placeholder="Activity description"
              />
            </div>

            {/* Save/Cancel Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transportation Indicator - Only show if complete data exists */}
      {activity.transportToNext &&
       activity.transportToNext.mode &&
       activity.transportToNext.duration &&
       activity.transportToNext.distance && (
        <div className="px-6 pb-4">
          <div className="flex items-center gap-3 py-3 px-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="text-2xl">
              {activity.transportToNext.mode === 'walking' ? '🚶' :
               activity.transportToNext.mode === 'transit' ? '🚇' :
               activity.transportToNext.mode === 'taxi' ? '🚕' :
               activity.transportToNext.mode === 'driving' ? '🚗' :
               activity.transportToNext.mode === 'flight' ? '✈️' :
               activity.transportToNext.mode === 'ferry' ? '⛴️' :
               activity.transportToNext.mode === 'bicycle' ? '🚲' : '🚌'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <span className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                  {activity.transportToNext.mode}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  ⏱️ {activity.transportToNext.duration}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  📍 {activity.transportToNext.distance}
                </span>
                {activity.transportToNext.cost && (
                  <span className="text-gray-600 dark:text-gray-400">
                    💰 {convertTransportCost(activity.transportToNext.cost, selectedCurrency)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

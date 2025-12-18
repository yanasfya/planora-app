'use client';

import { useState } from 'react';
import { useItineraryEdit } from '@/app/contexts/ItineraryEditContext';
import EditableActivityCard from './EditableActivityCard';
import AddActivityModal from './AddActivityModal';
import { Calendar, Plus } from 'lucide-react';

export default function EditableDayCard({
  days,
  startDate,
  destination,
  checkInDate,
  checkOutDate
}: {
  days: any[];
  startDate?: string;
  destination: string;
  checkInDate?: string;
  checkOutDate?: string;
}) {
  const { editedDays, isEditMode, addActivity } = useItineraryEdit();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  // Use edited days if in edit mode, otherwise use original
  const displayDays = editedDays.length > 0 ? editedDays : days;

  /**
   * Calculate and format date from startDate and day number
   */
  const formatDate = (dayNumber: number): string => {
    if (!startDate) return '';

    try {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) return '';

      // Calculate the date for this day (day 1 = startDate, day 2 = startDate + 1, etc.)
      const dayDate = new Date(start);
      dayDate.setDate(start.getDate() + (dayNumber - 1));

      if (!isNaN(dayDate.getTime())) {
        return dayDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return '';
    } catch (error) {
      console.error('[EditableDayCard] Error formatting date:', error);
      return '';
    }
  };

  /**
   * Handle opening add activity modal
   */
  const handleOpenAddModal = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
    setAddModalOpen(true);
    console.log('[Editable Day Card] Opening add modal for day:', dayIndex + 1);
  };

  /**
   * Handle adding new activity
   */
  const handleAddActivity = (newActivityData: any) => {
    // Generate unique ID
    const newActivity = {
      id: `custom-activity-${Date.now()}`,
      ...newActivityData,
    };

    addActivity(selectedDayIndex, newActivity);
    console.log('[Editable Day Card] Added new activity:', newActivity);
  };

  return (
    <>
      {displayDays.map((day, dayIndex) => (
        <div
          key={day.day}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6"
        >
          {/* Day Header - Mobile-optimized layout */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              {/* Day Number Badge */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white font-bold text-lg sm:text-xl">{day.day}</span>
              </div>
              {/* Title and Date */}
              <div className="flex-1 min-w-0 pt-0.5">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Day {day.day}
                </h2>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">
                    {formatDate(day.day)}
                  </span>
                </div>
              </div>
            </div>

            {/* Add Activity Button (Only in Edit Mode) */}
            {isEditMode && (
              <button
                onClick={() => handleOpenAddModal(dayIndex)}
                className="w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 min-h-[44px] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm flex-shrink-0"
                aria-label="Add activity"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Activity</span>
              </button>
            )}
          </div>

          {/* Day Summary */}
          {day.summary && (
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {day.summary}
            </p>
          )}

          {/* Activities */}
          <div className="space-y-4">
            {day.activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No activities yet. Click "Add Activity" to add one.
              </div>
            ) : (
              day.activities.map((activity: any, activityIndex: number) => (
                <EditableActivityCard
                  key={activity.id || `activity-${dayIndex}-${activityIndex}`}
                  activity={activity}
                  dayIndex={dayIndex}
                  activityIndex={activityIndex}
                  destination={destination}
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                />
              ))
            )}
          </div>
        </div>
      ))}

      {/* Add Activity Modal */}
      <AddActivityModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddActivity}
        dayNumber={selectedDayIndex + 1}
      />
    </>
  );
}

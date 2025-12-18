'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface Activity {
  id?: string;
  time: string;
  title: string;
  location: string;
  description?: string;
  type?: string;
  coordinates?: { lat: number; lng: number };
  photoUrl?: string;
  restaurantOptions?: any[];
  transportToNext?: any;
}

interface Day {
  day: number;
  date?: string;
  activities: Activity[];
  summary?: string;
}

interface ItineraryEditContextType {
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
  editedDays: Day[];
  setEditedDays: (days: Day[]) => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;

  // Activity operations - use activityIndex for reliable targeting
  updateActivity: (dayIndex: number, activityIndex: number, updates: Partial<Activity>) => void;
  deleteActivity: (dayIndex: number, activityIndex: number) => void;
  addActivity: (dayIndex: number, activity: Activity) => void;
  reorderActivities: (dayIndex: number, startIndex: number, endIndex: number) => void;
}

const ItineraryEditContext = createContext<ItineraryEditContextType | undefined>(undefined);

/**
 * Helper function to sort activities by time (chronological order)
 */
const sortActivitiesByTime = (activities: Activity[]): Activity[] => {
  return [...activities].sort((a, b) => {
    // Parse time strings like "14:00", "09:30", etc.
    const timeA = a.time || '00:00';
    const timeB = b.time || '00:00';

    // Compare as strings since they're in HH:MM format (lexicographic order works)
    return timeA.localeCompare(timeB);
  });
};

export function ItineraryEditProvider({ children, initialDays }: { children: ReactNode; initialDays: Day[] }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedDays, setEditedDays] = useState<Day[]>(initialDays);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  /**
   * Update a specific activity using index for reliable targeting
   * Automatically re-sorts activities by time after update
   */
  const updateActivity = (dayIndex: number, activityIndex: number, updates: Partial<Activity>) => {
    console.log('[Context] updateActivity called:', { dayIndex, activityIndex, updates });

    setEditedDays(prevDays => {
      console.log('[Context] prevDays before update:', prevDays[dayIndex]?.activities?.[activityIndex]?.time);

      // Use map() to create new array with new references at each level
      const newDays = prevDays.map((day, dIdx) => {
        if (dIdx !== dayIndex) return day;

        // Update the activity first
        const updatedActivities = day.activities.map((activity, aIdx) => {
          if (aIdx !== activityIndex) return activity;
          // Create new activity object with updates
          const updated = { ...activity, ...updates };
          console.log('[Context] Updated activity at index', activityIndex, ':', updated.time);
          return updated;
        });

        // Sort activities by time to maintain chronological order
        const sortedActivities = sortActivitiesByTime(updatedActivities);
        console.log('[Context] Activities sorted by time');

        // Create new day object with sorted activities array
        return {
          ...day,
          activities: sortedActivities
        };
      });

      return newDays;
    });
    setHasUnsavedChanges(true);
  };

  const deleteActivity = (dayIndex: number, activityIndex: number) => {
    setEditedDays(prevDays => {
      // Use map() to create new array with new references at each level
      const newDays = prevDays.map((day, dIdx) => {
        if (dIdx !== dayIndex) return day;

        return {
          ...day,
          activities: day.activities.filter((_, aIdx) => aIdx !== activityIndex)
        };
      });

      return newDays;
    });
    setHasUnsavedChanges(true);
  };

  const addActivity = (dayIndex: number, activity: Activity) => {
    setEditedDays(prevDays => {
      // Check for duplicate before adding
      if (activity.id) {
        const existingActivity = prevDays[dayIndex].activities.find(a => a.id === activity.id);
        if (existingActivity) {
          return prevDays;
        }
      }

      // Use map() to create new array with new references at each level
      const newDays = prevDays.map((day, idx) => {
        if (idx !== dayIndex) return day;

        // Add the new activity and sort by time
        const newActivities = [...day.activities, activity];
        const sortedActivities = sortActivitiesByTime(newActivities);

        return {
          ...day,
          activities: sortedActivities
        };
      });

      return newDays;
    });
    setHasUnsavedChanges(true);
  };

  const reorderActivities = (dayIndex: number, startIndex: number, endIndex: number) => {
    setEditedDays(prevDays => {
      // Use map() to create new array with new references at each level
      const newDays = prevDays.map((day, idx) => {
        if (idx !== dayIndex) return day;

        // Create new activities array with reordered items
        const activities = [...day.activities];
        const [movedActivity] = activities.splice(startIndex, 1);
        activities.splice(endIndex, 0, movedActivity);

        return {
          ...day,
          activities
        };
      });

      return newDays;
    });
    setHasUnsavedChanges(true);
  };

  return (
    <ItineraryEditContext.Provider
      value={{
        isEditMode,
        setIsEditMode,
        editedDays,
        setEditedDays,
        hasUnsavedChanges,
        setHasUnsavedChanges,
        updateActivity,
        deleteActivity,
        addActivity,
        reorderActivities,
      }}
    >
      {children}
    </ItineraryEditContext.Provider>
  );
}

export function useItineraryEdit() {
  const context = useContext(ItineraryEditContext);
  if (!context) {
    throw new Error('useItineraryEdit must be used within ItineraryEditProvider');
  }
  return context;
}

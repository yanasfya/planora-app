import type { OpeningHours } from '@/lib/mealPlanner';

/**
 * Get today's opening hours in readable format
 * @param openingHours - Opening hours data from Google Places
 * @returns Formatted string like "11:00 AM - 10:00 PM" or status text
 */
export function getTodayOpeningHours(openingHours?: OpeningHours): string {
  // If no opening hours data at all, show "Open now" as default (most restaurants are open)
  if (!openingHours) return 'Open now';

  // Try to get today's hours from weekday_text
  if (openingHours.weekdayText && openingHours.weekdayText.length > 0) {
    // Get today's day (0 = Sunday, 1 = Monday, etc.)
    const today = new Date().getDay();
    // weekday_text format: ["Monday: 11:00 AM – 10:00 PM", "Tuesday: ...", ...]
    // Array is 0-indexed starting from Monday, so adjust for Sunday
    const dayIndex = today === 0 ? 6 : today - 1;
    const todayText = openingHours.weekdayText[dayIndex];

    if (todayText) {
      // Extract just the hours part (remove day name)
      const hoursMatch = todayText.match(/:\s*(.+)/);
      if (hoursMatch) {
        const hours = hoursMatch[1].trim();
        // Handle "Closed" case
        if (hours.toLowerCase() === 'closed') {
          return 'Closed today';
        }
        return hours;
      }
      return todayText;
    }
  }

  // Fallback: Just show open/closed status based on openNow boolean
  if (openingHours.openNow === true) {
    return 'Open now';
  } else if (openingHours.openNow === false) {
    return 'Closed';
  }

  // Default to "Open now" if we have no data
  return 'Open now';
}

/**
 * Get the open/closed status with appropriate styling class
 * @param openingHours - Opening hours data
 * @returns Object with text and isOpen boolean for styling
 */
export function getOpenStatus(openingHours?: OpeningHours): { text: string; isOpen: boolean } {
  if (!openingHours) {
    return { text: 'Hours unknown', isOpen: true };
  }

  if (openingHours.openNow === true) {
    return { text: 'Open now', isOpen: true };
  } else if (openingHours.openNow === false) {
    return { text: 'Closed', isOpen: false };
  }

  return { text: 'Hours unknown', isOpen: true };
}

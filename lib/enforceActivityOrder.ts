interface Activity {
  id?: string;
  time: string;
  title: string;
  location: string;
  type?: string;
  coordinates?: { lat: number; lng: number };
  [key: string]: any;
}

interface Day {
  day: number;
  activities: Activity[];
}

/**
 * Convert time string to minutes for sorting
 */
function timeToMinutes(timeString: string): number {
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  } catch {
    return 0;
  }
}

/**
 * Convert minutes to time string (HH:MM format)
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Check if activity is an arrival/airport activity
 */
function isArrivalActivity(activity: Activity): boolean {
  const title = activity.title.toLowerCase();
  const type = activity.type?.toLowerCase() || '';

  return (
    type === 'airport' ||
    type === 'arrival' ||
    title.includes('arrive at') ||
    title.includes('arrival at') ||
    (title.includes('airport') && (title.includes('arrive') || title.includes('transfer to hotel')))
  );
}

/**
 * Check if activity is a hotel check-in
 */
function isHotelCheckIn(activity: Activity): boolean {
  const title = activity.title.toLowerCase();
  const type = activity.type?.toLowerCase() || '';

  return (
    type === 'hotel' ||
    title.includes('check-in') ||
    title.includes('check in') ||
    title.includes('transfer to hotel')
  );
}

/**
 * Check if activity is a departure activity
 */
function isDepartureActivity(activity: Activity): boolean {
  const title = activity.title.toLowerCase();
  const type = activity.type?.toLowerCase() || '';

  return (
    type === 'departure' ||
    title.includes('depart') ||
    title.includes('departure') ||
    (title.includes('airport') && (title.includes('depart') || title.includes('leave')))
  );
}

/**
 * Check if activity is a hotel checkout
 */
function isHotelCheckOut(activity: Activity): boolean {
  const title = activity.title.toLowerCase();
  const type = activity.type?.toLowerCase() || '';

  return (
    type === 'checkout' ||
    title.includes('check-out') ||
    title.includes('check out') ||
    (title.includes('hotel') && title.includes('checkout'))
  );
}

/**
 * Check if activity is a meal
 */
function isMealActivity(activity: Activity): boolean {
  return activity.type === 'meal';
}

/**
 * Adjust Last Day timing to ensure logical flow
 * Preserves proper meal spacing (breakfast 08:00, lunch 12:30, dinner before checkout)
 */
function adjustLastDayTiming(activities: Activity[]): Activity[] {
  if (activities.length === 0) return activities;

  // Find departure and checkout activities
  const departureIndex = activities.findIndex(isDepartureActivity);
  const checkoutIndex = activities.findIndex(isHotelCheckOut);

  if (departureIndex === -1) {
    console.log('[Activity Order] No departure activity found on Last Day');
    return activities;
  }

  const adjustedActivities = [...activities];

  // Set departure time to late afternoon/evening (18:00)
  const departureTime = 1080; // 18:00 in minutes
  adjustedActivities[departureIndex] = {
    ...adjustedActivities[departureIndex],
    time: minutesToTime(departureTime),
  };

  console.log(`[Activity Order] Set departure time to ${minutesToTime(departureTime)}`);

  // If checkout exists, set it 2-3 hours before departure
  if (checkoutIndex >= 0 && checkoutIndex !== departureIndex) {
    const checkoutTimeValue = departureTime - 180; // 3 hours before departure (15:00)
    adjustedActivities[checkoutIndex] = {
      ...adjustedActivities[checkoutIndex],
      time: minutesToTime(checkoutTimeValue),
    };
    console.log(`[Activity Order] Set checkout time to ${minutesToTime(checkoutTimeValue)}`);
  }

  const checkoutTime = checkoutIndex >= 0
    ? timeToMinutes(adjustedActivities[checkoutIndex].time)
    : departureTime;

  // Separate meals from other activities
  const meals: Array<{activity: Activity, index: number, mealType: string}> = [];
  const nonMeals: Array<{activity: Activity, index: number}> = [];

  for (let i = 0; i < adjustedActivities.length; i++) {
    if (i === departureIndex || i === checkoutIndex) continue;

    const activity = adjustedActivities[i];
    if (isMealActivity(activity)) {
      const mealType = (activity as any).mealType || 'unknown';
      meals.push({activity, index: i, mealType});
    } else {
      nonMeals.push({activity, index: i});
    }
  }

  // Set meal times with proper spacing
  // Breakfast: 08:00, Lunch: 12:30, Dinner: dynamically based on checkout
  const mealTimings: Record<string, number> = {
    breakfast: 480,  // 08:00
    lunch: 750,      // 12:30
    dinner: Math.min(checkoutTime - 90, 1110), // 1.5 hours before checkout, max 18:30
  };

  // If checkout is before 14:00, skip dinner entirely (too early)
  const skipDinner = checkoutTime <= 840; // 14:00

  for (const {activity, index, mealType} of meals) {
    if (mealType === 'dinner' && skipDinner) {
      console.log(`[Activity Order] Skipping dinner on last day - checkout too early`);
      continue;
    }

    if (mealTimings[mealType]) {
      const targetTime = mealTimings[mealType];
      adjustedActivities[index] = {
        ...activity,
        time: minutesToTime(targetTime),
      };
      console.log(`[Activity Order] Set ${mealType} to ${minutesToTime(targetTime)}`);
    }
  }

  // Now schedule non-meal activities to fit between meals
  // Sort by original time to maintain relative order
  nonMeals.sort((a, b) => timeToMinutes(a.activity.time) - timeToMinutes(b.activity.time));

  // Define time slots where non-meal activities can go:
  // - After breakfast (09:00 - 12:00)
  // - After lunch (13:30 - checkout)
  let currentTime = 540; // Start at 09:00 (after breakfast)

  for (const {activity, index} of nonMeals) {
    // Skip over meal times (don't schedule during meals)
    // Breakfast: 08:00-09:00, Lunch: 12:30-13:30, Dinner: varies
    if (currentTime >= 720 && currentTime < 810) { // 12:00-13:30 (lunch zone)
      currentTime = 810; // Skip to 13:30
    }

    const dinnerTime = mealTimings.dinner;
    if (!skipDinner && currentTime >= dinnerTime - 30 && currentTime < dinnerTime + 60) {
      currentTime = dinnerTime + 60; // Skip past dinner
    }

    // Don't schedule after checkout
    if (currentTime >= checkoutTime - 30) {
      console.log(`[Activity Order] Not enough time for "${activity.title}" before checkout`);
      // Set it to a reasonable time anyway (last available slot)
      currentTime = checkoutTime - 90;
    }

    adjustedActivities[index] = {
      ...activity,
      time: minutesToTime(currentTime),
    };
    console.log(`[Activity Order] Adjusted "${activity.title}" to ${minutesToTime(currentTime)}`);

    // Add appropriate gap
    if (activity.type === 'mosque') {
      currentTime += 45;
    } else {
      currentTime += 90;
    }
  }

  return adjustedActivities;
}

/**
 * Adjust Day 1 timing to ensure logical flow
 * NOTE: We do NOT force arrival to 08:00 - we keep Gemini's original time
 * This allows for realistic afternoon arrivals (e.g., 14:00, 15:00)
 */
function adjustDay1Timing(activities: Activity[]): Activity[] {
  if (activities.length === 0) return activities;

  // Find arrival activity
  const arrivalIndex = activities.findIndex(isArrivalActivity);
  if (arrivalIndex === -1) {
    console.log('[Activity Order] No arrival activity found on Day 1');
    return activities;
  }

  const adjustedActivities = [...activities];

  // KEEP the original Gemini-generated arrival time (don't force to 08:00)
  const arrivalTime = timeToMinutes(adjustedActivities[arrivalIndex].time);
  console.log(`[Activity Order] Keeping original arrival time: ${minutesToTime(arrivalTime)}`);

  // Adjust subsequent activities to be AFTER arrival
  let currentTime = arrivalTime;

  for (let i = 0; i < adjustedActivities.length; i++) {
    if (i === arrivalIndex) continue; // Skip arrival itself

    const activity = adjustedActivities[i];
    const activityTime = timeToMinutes(activity.time);

    // If activity time is BEFORE or equal to current time, push it forward
    if (activityTime <= currentTime) {
      // Add appropriate time gap based on activity type
      if (isHotelCheckIn(activity)) {
        currentTime += 90; // 1.5 hours for hotel check-in/transfer
      } else if (activity.type === 'meal') {
        currentTime += 60; // 1 hour for meals
      } else if (activity.type === 'mosque') {
        currentTime += 30; // 30 mins for mosque
      } else {
        currentTime += 90; // 1.5 hours for other activities
      }

      adjustedActivities[i] = {
        ...activity,
        time: minutesToTime(currentTime),
      };

      console.log(`[Activity Order] Adjusted "${activity.title}" to ${minutesToTime(currentTime)}`);
    } else {
      // Activity time is already after current time, use it
      currentTime = activityTime;
    }
  }

  return adjustedActivities;
}

/**
 * Enforce logical activity order for Day 1 and Last Day
 */
export function enforceActivityOrder(days: Day[]): Day[] {
  if (!days || days.length === 0) {
    return days;
  }

  console.log('[Activity Order] Enforcing logical activity order...');

  const processedDays = [...days];

  // ============================================
  // FIX DAY 1: Ensure arrival is FIRST with correct timing
  // ============================================
  if (processedDays[0]) {
    const day1 = processedDays[0];
    let activities = [...day1.activities];

    // Find arrival activity
    const arrivalIndex = activities.findIndex(isArrivalActivity);

    if (arrivalIndex > 0) {
      // Arrival exists but not first - move it to first position
      console.warn('[Activity Order] Day 1 arrival activity was at position', arrivalIndex, '- moving to first');

      const arrivalActivity = activities.splice(arrivalIndex, 1)[0];
      activities.unshift(arrivalActivity);

      console.log('[Activity Order] Day 1 fixed: Arrival is now first activity');
    } else if (arrivalIndex === 0) {
      console.log('[Activity Order] Day 1 correct: Arrival is already first activity');
    } else {
      console.warn('[Activity Order] Day 1: No arrival activity found');
    }

    // Sort activities by time initially
    activities = activities.sort((a, b) => {
      const aIsArrival = isArrivalActivity(a);
      const bIsArrival = isArrivalActivity(b);

      // Arrival always first
      if (aIsArrival) return -1;
      if (bIsArrival) return 1;

      // Others sorted by time
      return timeToMinutes(a.time) - timeToMinutes(b.time);
    });

    // Adjust timing to ensure logical flow
    activities = adjustDay1Timing(activities);

    // Log the final order for debugging
    console.log(`[Activity Order] Day 1 (Arrival Day) final order:`);
    activities.forEach((activity, index) => {
      console.log(`  ${index + 1}. ${activity.time} - ${activity.title}`);
    });

    processedDays[0] = {
      ...day1,
      activities,
    };
  }

  // ============================================
  // FIX LAST DAY: Ensure departure is LAST and checkout is before it
  // ============================================
  const lastDayIndex = processedDays.length - 1;
  if (processedDays[lastDayIndex] && lastDayIndex > 0) {
    const lastDay = processedDays[lastDayIndex];
    let activities = [...lastDay.activities];

    // Find departure and checkout activities
    const departureIndex = activities.findIndex(isDepartureActivity);
    const checkoutIndex = activities.findIndex(isHotelCheckOut);

    // Remove duplicate airport-related activities (like "Transfer to airport" or "Travel to airport")
    // We only want ONE departure activity on the last day
    if (departureIndex >= 0) {
      activities = activities.filter((activity, index) => {
        if (index === departureIndex) return true; // Keep the departure activity

        const title = activity.title.toLowerCase();
        const isDuplicateAirportActivity =
          (title.includes('airport') && !title.includes('depart')) ||
          (title.includes('transfer') && title.includes('airport')) ||
          (title.includes('travel') && title.includes('airport')) ||
          title.includes('head to airport') ||
          title.includes('go to airport');

        if (isDuplicateAirportActivity) {
          console.log(`[Activity Order] Removed duplicate airport activity: "${activity.title}"`);
          return false;
        }

        return true;
      });
    }

    // Re-find indices after filtering
    const newDepartureIndex = activities.findIndex(isDepartureActivity);
    const newCheckoutIndex = activities.findIndex(isHotelCheckOut);

    if (newDepartureIndex >= 0 && newDepartureIndex !== activities.length - 1) {
      // Departure exists but not last - move it to last position
      console.warn('[Activity Order] Last day departure activity was at position', newDepartureIndex, '- moving to last');

      const departureActivity = activities.splice(newDepartureIndex, 1)[0];
      activities.push(departureActivity);

      console.log('[Activity Order] Last day fixed: Departure is now last activity');
    } else if (newDepartureIndex === activities.length - 1) {
      console.log('[Activity Order] Last day correct: Departure is already last activity');
    } else {
      console.warn('[Activity Order] Last day: No departure activity found');
    }

    // Ensure checkout comes before departure (using updated indices)
    if (newCheckoutIndex >= 0 && newDepartureIndex >= 0) {
      const currentCheckoutIndex = activities.findIndex(isHotelCheckOut);
      const currentDepartureIndex = activities.findIndex(isDepartureActivity);

      if (currentCheckoutIndex > currentDepartureIndex) {
        console.warn('[Activity Order] Last day: Checkout was after departure - reordering');
        const checkoutActivity = activities.splice(currentCheckoutIndex, 1)[0];
        activities.splice(currentDepartureIndex, 0, checkoutActivity);
        console.log('[Activity Order] Last day fixed: Checkout is now before departure');
      }
    }

    // First, adjust timing to ensure logical flow
    const timingAdjustedActivities = adjustLastDayTiming(activities);

    // Then, ensure departure is at the end
    const finalDepartureIndex = timingAdjustedActivities.findIndex(isDepartureActivity);
    if (finalDepartureIndex >= 0 && finalDepartureIndex !== timingAdjustedActivities.length - 1) {
      const departureActivity = timingAdjustedActivities.splice(finalDepartureIndex, 1)[0];
      timingAdjustedActivities.push(departureActivity);
    }

    // Finally, sort all non-departure activities by time
    const departure = timingAdjustedActivities.pop(); // Remove departure temporarily
    const sortedActivities = timingAdjustedActivities.sort((a, b) => {
      return timeToMinutes(a.time) - timeToMinutes(b.time);
    });

    // Add departure back at the end
    const finalActivities = departure ? [...sortedActivities, departure] : sortedActivities;

    // Log the final order for debugging
    console.log(`[Activity Order] Day ${lastDay.day} (Last Day) final order:`);
    finalActivities.forEach((activity, index) => {
      console.log(`  ${index + 1}. ${activity.time} - ${activity.title}`);
    });

    processedDays[lastDayIndex] = {
      ...lastDay,
      activities: finalActivities,
    };
  }

  // ============================================
  // FIX ALL OTHER DAYS: Sort activities by time
  // ============================================
  for (let i = 1; i < processedDays.length - 1; i++) {
    processedDays[i].activities.sort((a, b) => {
      return timeToMinutes(a.time) - timeToMinutes(b.time);
    });

    // Log the final order for debugging
    console.log(`[Activity Order] Day ${processedDays[i].day} (Middle Day) final order:`);
    processedDays[i].activities.forEach((activity, index) => {
      console.log(`  ${index + 1}. ${activity.time} - ${activity.title}`);
    });
  }

  console.log('[Activity Order] All days processed and sorted correctly');

  return processedDays;
}

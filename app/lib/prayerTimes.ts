/**
 * Prayer Times Integration using Aladhan API
 * Free API, no key required
 * Documentation: https://aladhan.com/prayer-times-api
 */

export interface PrayerTimes {
  fajr: string;      // Dawn prayer
  dhuhr: string;     // Noon prayer
  asr: string;       // Afternoon prayer
  maghrib: string;   // Sunset prayer
  isha: string;      // Night prayer
  date: string;      // Date for these prayer times
  method: string;    // Calculation method name
}

/**
 * Fetch prayer times for a specific date and location
 * @param date - Date in YYYY-MM-DD format
 * @param latitude - Location latitude
 * @param longitude - Location longitude
 * @returns Promise<PrayerTimes | null>
 */
export async function fetchPrayerTimes(
  date: string,
  latitude: number,
  longitude: number
): Promise<PrayerTimes | null> {
  try {
    // Aladhan API endpoint
    const url = `https://api.aladhan.com/v1/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=2`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error('[Prayer Times] API request failed:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.code !== 200 || !data.data) {
      console.error('[Prayer Times] Invalid API response:', data);
      return null;
    }

    const timings = data.data.timings;
    const method = data.data.meta.method.name;

    const prayerTimes: PrayerTimes = {
      fajr: formatPrayerTime(timings.Fajr),
      dhuhr: formatPrayerTime(timings.Dhuhr),
      asr: formatPrayerTime(timings.Asr),
      maghrib: formatPrayerTime(timings.Maghrib),
      isha: formatPrayerTime(timings.Isha),
      date: data.data.date.readable,
      method
    };

    return prayerTimes;

  } catch (error) {
    console.error('[Prayer Times] Error fetching prayer times:', error);
    return null;
  }
}

/**
 * Format prayer time from "HH:MM (TIMEZONE)" to "HH:MM"
 */
function formatPrayerTime(time: string): string {
  // Remove timezone info if present
  return time.split(' ')[0];
}

/**
 * Fetch prayer times for multiple days of a trip
 * @param startDate - Trip start date (YYYY-MM-DD)
 * @param endDate - Trip end date (YYYY-MM-DD)
 * @param latitude - Destination latitude
 * @param longitude - Destination longitude
 * @returns Promise<Map<string, PrayerTimes>>
 */
export async function fetchPrayerTimesForTrip(
  startDate: string,
  endDate: string,
  latitude: number,
  longitude: number
): Promise<Map<string, PrayerTimes>> {
  const prayerTimesMap = new Map<string, PrayerTimes>();

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Fetch prayer times for each day
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const prayerTimes = await fetchPrayerTimes(dateStr, latitude, longitude);

      if (prayerTimes) {
        prayerTimesMap.set(dateStr, prayerTimes);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return prayerTimesMap;

  } catch (error) {
    console.error('[Prayer Times] Error fetching trip prayer times:', error);
    return prayerTimesMap;
  }
}

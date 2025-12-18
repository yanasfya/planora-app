import { findNearbyMosques, calculateDistanceToMosque } from '../app/lib/findNearbyMosques';

interface Activity {
  id?: string;
  time: string;
  title: string;
  location: string;
  type?: string;
  mealType?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  [key: string]: any;
}

interface Day {
  day: number;
  summary?: string;
  activities: Activity[];
}

interface Mosque {
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  photoReference?: string;
  placeId?: string;
  rating?: number;
}

/**
 * Check if a mosque is already added to today's itinerary
 */
function isMosqueAlreadyAdded(
  mosque: Mosque,
  addedMosques: Set<string>
): boolean {
  // Check by place_id (most reliable)
  if (mosque.placeId && addedMosques.has(mosque.placeId)) {
    return true;
  }

  // Fallback: Check by mosque name
  if (addedMosques.has(mosque.name)) {
    return true;
  }

  return false;
}

/**
 * Find a unique mosque that hasn't been added today
 */
async function findUniqueMosque(
  location: { lat: number; lng: number },
  addedMosques: Set<string>,
  initialRadius: number = 2000
): Promise<{ mosque: Mosque; distanceInfo: { distance: string; duration: string } | null } | null> {
  const maxRadius = 10000; // 10km maximum search radius
  let currentRadius = initialRadius;

  while (currentRadius <= maxRadius) {
    console.log(`[Mosque Search] Searching at ${currentRadius}m radius...`);

    const mosques = await findNearbyMosques(location, currentRadius);

    // Find the first mosque that hasn't been added today
    for (const mosque of mosques) {
      if (!isMosqueAlreadyAdded(mosque, addedMosques)) {
        // Calculate distance
        const distanceInfo = await calculateDistanceToMosque(location, mosque.coordinates);

        console.log(`[Mosque Search] Found unique mosque: ${mosque.name}`);
        return { mosque, distanceInfo };
      } else {
        console.log(`[Mosque Search] Skipping duplicate: ${mosque.name}`);
      }
    }

    // Expand search radius if all mosques at this radius are duplicates
    currentRadius += 2000; // Increase by 2km
  }

  console.log(`[Mosque Search] No unique mosques found within ${maxRadius}m`);
  return null;
}

/**
 * Add nearby mosques after each meal for halal travelers
 * Prevents duplicate mosques on the same day
 */
export async function enrichWithMosques(
  days: Day[],
  isHalalRequired: boolean
): Promise<Day[]> {
  if (!isHalalRequired) {
    console.log('[Mosque Enrichment] Halal not required, skipping mosque search');
    return days;
  }

  console.log('[Mosque Enrichment] Adding mosques for halal travelers...');

  const enrichedDays: Day[] = [];

  for (const day of days) {
    const enrichedActivities: Activity[] = [];

    // Track mosques added TODAY (reset for each day)
    const addedMosquesToday = new Set<string>();

    console.log(`\n[Mosque Enrichment] Processing Day ${day.day}`);

    for (let i = 0; i < day.activities.length; i++) {
      const activity = day.activities[i];
      enrichedActivities.push(activity);

      // Add mosque after LUNCH and DINNER only (NOT breakfast)
      if (activity.type === 'meal' && activity.coordinates) {

        // Check if this is breakfast - skip if yes
        const title = activity.title.toLowerCase();
        const isBreakfast = (
          title.includes('breakfast') ||
          title.includes('morning meal') ||
          title.includes('sarapan') // Indonesian for breakfast
        );

        if (isBreakfast) {
          console.log(`[Mosque Enrichment] Skipping mosque for breakfast: ${activity.title}`);
          continue; // Skip to next activity
        }

        // Only add mosques for lunch and dinner
        console.log(`[Mosque Enrichment] Finding mosque near ${activity.title} (lunch/dinner)`);

        try {
          // Find a unique mosque that hasn't been added today
          const result = await findUniqueMosque(activity.coordinates, addedMosquesToday);

          if (result) {
            const { mosque: nearestMosque, distanceInfo } = result;

            // Only add mosque if we have valid distance info
            if (!distanceInfo || !distanceInfo.distance || !distanceInfo.duration) {
              console.log(`[Mosque Enrichment] Skipping ${nearestMosque.name} - no valid distance data`);
              continue;
            }

            // Create mosque activity
            const mosqueActivity: Activity = {
              id: `mosque-${activity.id || i}-${Date.now()}`,
              time: activity.time, // Same time as meal
              title: `Nearby Mosque: ${nearestMosque.name}`,
              location: nearestMosque.address,
              type: 'mosque',
              coordinates: nearestMosque.coordinates,
              photoReference: nearestMosque.photoReference,
              placeId: nearestMosque.placeId,
              distance: distanceInfo.distance,
              walkingTime: `${distanceInfo.duration.replace('mins', 'min')} walk`,
              rating: nearestMosque.rating,
            };

            enrichedActivities.push(mosqueActivity);

            // Track this mosque as added (by place_id and name)
            if (nearestMosque.placeId) {
              addedMosquesToday.add(nearestMosque.placeId);
            }
            addedMosquesToday.add(nearestMosque.name);

            console.log(`[Mosque Enrichment] Added: ${nearestMosque.name} (${distanceInfo?.distance || 'unknown distance'})`);
          } else {
            console.log(`[Mosque Enrichment] No unique mosques found near ${activity.title}`);
          }

          // Add small delay to avoid API rate limits
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`[Mosque Enrichment] Error finding mosque near ${activity.title}:`, error);
          // Continue with next activity even if mosque search fails
        }
      }
    }

    enrichedDays.push({
      ...day,
      activities: enrichedActivities,
    });

    console.log(`[Mosque Enrichment] Day ${day.day} complete. Added ${addedMosquesToday.size} unique mosques.`);
  }

  console.log('\n[Mosque Enrichment] Mosque enrichment complete');
  return enrichedDays;
}
 

import { NextResponse } from "next/server";
import { dbConnect } from "@lib/db";
import ItineraryModel from "@lib/itineraryModel";
import { PrefsSchema } from "@lib/types";
import { generateItinerary } from "@lib/gemini";
import { enrichDayWithTransportation } from "@/lib/enrichWithTransportation";
import { determineMealTimes, insertMealsForDay, CrossDayRestaurantTracking } from "@/lib/mealPlanner";
import { enrichWithMosques } from "@/lib/enrichWithMosques";
import { enforceActivityOrder } from "@/lib/enforceActivityOrder";
import { auth } from "@/lib/auth";

// Helper function to add timeout to promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), timeoutMs))
  ]);
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    const body = await req.json();
    const parsed = PrefsSchema.safeParse(body);
    if (!parsed.success) {
      console.error("[Generate API] Validation error:", parsed.error.format());
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }
    const prefs = parsed.data;

    await dbConnect();

    try {
      const itinerary = await generateItinerary(prefs);

      // OPTIMIZATION: Process all enrichments in parallel where possible
      const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      const startTime = Date.now();

      // Step 1: Enrich ALL days with transportation in PARALLEL (with 15s timeout per day)
      if (apiKey) {
        console.log('[Generate API] Starting parallel transportation enrichment...');
        const transportPromises = itinerary.days.map(async (day, i) => {
          try {
            const enrichedActivities = await withTimeout(
              enrichDayWithTransportation(day.activities, prefs.destination),
              15000, // 15 second timeout per day
              day.activities // fallback to original activities
            );
            return { index: i, activities: enrichedActivities };
          } catch (error) {
            console.error(`[Transport] Failed to enrich day ${day.day}:`, error);
            return { index: i, activities: day.activities };
          }
        });

        const transportResults = await Promise.all(transportPromises);
        transportResults.forEach(result => {
          itinerary.days[result.index].activities = result.activities;
        });
        console.log(`[Generate API] Transportation done in ${Date.now() - startTime}ms`);
      }

      // Step 2: Insert meals - must be sequential for restaurant tracking, but faster
      const mealStartTime = Date.now();
      console.log('[Generate API] Starting meal planning...');
      const crossDayTracking: CrossDayRestaurantTracking = {
        breakfast: [],
        lunch: [],
        dinner: []
      };

      // Process meals with timeout (10s per day max)
      for (let i = 0; i < itinerary.days.length; i++) {
        const day = itinerary.days[i];
        try {
          const mealTimes = determineMealTimes(day.activities);

          const mealResult = await withTimeout(
            insertMealsForDay(
              day.activities,
              day.day,
              prefs.destination,
              prefs.budget,
              prefs.dietaryPreferences || {
                halal: false,
                nutAllergy: false,
                seafoodAllergy: false,
                vegetarian: false,
                vegan: false,
                wheelchairAccessible: false,
              },
              { interests: prefs.interests || [] },
              mealTimes,
              crossDayTracking
            ),
            10000, // 10 second timeout per day
            { activities: day.activities, usedRestaurants: { breakfast: [], lunch: [], dinner: [] } }
          );

          crossDayTracking.breakfast.push(...mealResult.usedRestaurants.breakfast);
          crossDayTracking.lunch.push(...mealResult.usedRestaurants.lunch);
          crossDayTracking.dinner.push(...mealResult.usedRestaurants.dinner);

          itinerary.days[i].activities = mealResult.activities;

          // Re-enrich with transportation now that meals are inserted
          // This ensures meal activities get transportToNext data
          if (apiKey && mealResult.activities.length > 0) {
            try {
              const reEnriched = await withTimeout(
                enrichDayWithTransportation(mealResult.activities, prefs.destination),
                10000, // 10 second timeout
                mealResult.activities // fallback to current activities
              );
              itinerary.days[i].activities = reEnriched;
            } catch (error) {
              console.error(`[Transport Re-enrichment] Failed for Day ${day.day}:`, error);
            }
          }
        } catch (error) {
          console.error(`[Meal Planning] Failed to add meals for Day ${day.day}:`, error);
        }
      }
      console.log(`[Generate API] Meals done in ${Date.now() - mealStartTime}ms`);

      // Step 3: Add mosques with timeout (only for halal travelers)
      const isHalalRequired = prefs.dietaryPreferences?.halal || false;
      if (isHalalRequired) {
        const mosqueStartTime = Date.now();
        console.log('[Generate API] Starting mosque enrichment...');
        const enrichedWithMosques = await withTimeout(
          enrichWithMosques(itinerary.days, isHalalRequired),
          20000, // 20 second timeout for all mosques
          itinerary.days // fallback to current days
        );
        itinerary.days = enrichedWithMosques;
        console.log(`[Generate API] Mosques done in ${Date.now() - mosqueStartTime}ms`);
      }

      console.log(`[Generate API] Total enrichment time: ${Date.now() - startTime}ms`);

      // Enforce logical activity order
      itinerary.days = enforceActivityOrder(itinerary.days);

      // Save itinerary
      const savedItinerary = await ItineraryModel.create({
        ...itinerary,
        prefs: {
          ...itinerary.prefs,
          interests: prefs.interests || [],
          dietaryPreferences: prefs.dietaryPreferences || {
            halal: false,
            nutAllergy: false,
            seafoodAllergy: false,
            vegetarian: false,
            vegan: false,
            wheelchairAccessible: false,
          },
          specialRequirements: prefs.specialRequirements,
          numberOfTravelers: prefs.numberOfTravelers || 1,
        },
        userId: session?.user?.id || null,
        currency: "USD",
        isPublic: false,
      });

      const response = {
        ...itinerary,
        _id: savedItinerary._id.toString(),
        userId: (savedItinerary as any).userId || null,
      };

      return NextResponse.json(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : undefined;
      console.error("[Generate API] Error:", errorMessage);
      return NextResponse.json({
        error: errorMessage,
        details: errorStack
      }, { status: 500 });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : undefined;
    console.error("[Generate API] Fatal error:", errorMessage);
    return NextResponse.json({
      error: errorMessage,
      details: errorStack
    }, { status: 500 });
  }
}

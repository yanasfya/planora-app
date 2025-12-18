import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import type { Prefs } from "@lib/types";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Single model - gemini-2.5-flash is available per API listing
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// Retry configuration
const MAX_RETRIES = 5;
const INITIAL_DELAY_MS = 5000; // 5 seconds

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is a rate limit error
 */
function isRateLimitError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("429") ||
         message.includes("quota") ||
         message.includes("rate") ||
         message.includes("Resource has been exhausted");
}

const BudgetEnum = z.enum(["low", "medium", "high"]);
const CoercedBudget = z.preprocess(
  (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
  BudgetEnum
);

const RESPONSE_SCHEMA = z.object({
  prefs: z.object({
    destination: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    budget: CoercedBudget,
    interests: z.array(z.string()).default([]),
  }),
  days: z
    .array(
      z.object({
        day: z.number().int().min(1),
        summary: z.string().optional(),
        activities: z
          .array(
            z.object({
              title: z.string(),
              time: z.string(),
              location: z.string(),
              coordinates: z.object({
                lat: z.number(),
                lng: z.number(),
              }).optional(),
            })
          )
          .min(1),
      })
    )
    .min(1),
});

export async function generateItinerary(prefs: Prefs) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Build dietary preferences context
      const dietaryContext = prefs.dietaryPreferences ? `

CRITICAL DIETARY & ACCESSIBILITY REQUIREMENTS:
========================================
${prefs.dietaryPreferences.halal ? `
HALAL FOOD REQUIRED - STRICT COMPLIANCE:
----------------------------------------
The user requires HALAL food. You MUST follow these rules EXACTLY:

ALLOWED - Only recommend these types of establishments:
- Halal-certified restaurants
- Muslim-owned restaurants
- Middle Eastern restaurants (Turkish, Lebanese, Persian, Arabic)
- South Asian restaurants (Pakistani, Bangladeshi, Indian Muslim)
- Malaysian/Indonesian restaurants (typically halal)
- Halal burger/pizza chains
- Vegetarian restaurants (as safe alternative)

STRICTLY FORBIDDEN - NEVER recommend these:
- ANY establishment with "Bar" in the name (e.g., "Speedboat Bar", "Wine Bar")
- ANY establishment categorized as "Bar", "Pub", "Tavern"
- Wine bars, cocktail bars, breweries
- Nightclubs or clubs
- Restaurants primarily known for alcohol service
- Pork-focused restaurants (German, Spanish tapas with jamon)
- Non-halal steakhouses
- ANY place where alcohol is the primary business

MEAL ACTIVITY RULES:
- For EVERY meal activity, use generic location names like "Local restaurant" or "Restaurant in [area]"
- Do NOT specify exact restaurant names (we will add real halal restaurants later)
- Example: "Lunch at local restaurant in Kota Tua" (CORRECT)
- Example: "Dinner at restaurant in Central Jakarta" (CORRECT)
- Example: "Lunch at Speedboat Bar" (NEVER!)
----------------------------------------
` : ''}
${prefs.dietaryPreferences.vegetarian ? 'VEGETARIAN: All restaurants MUST have vegetarian options. Prefer vegetarian-friendly venues.' : ''}
${prefs.dietaryPreferences.vegan ? 'VEGAN: All restaurants MUST have vegan options. Prefer vegan-friendly venues.' : ''}
${prefs.dietaryPreferences.nutAllergy ? 'NUT ALLERGY: All restaurants MUST be able to accommodate nut allergies. Avoid venues with high nut contamination risk.' : ''}
${prefs.dietaryPreferences.seafoodAllergy ? 'SEAFOOD ALLERGY: All restaurants MUST be able to accommodate seafood allergies. Avoid seafood-focused restaurants.' : ''}
${prefs.dietaryPreferences.wheelchairAccessible ? 'WHEELCHAIR ACCESSIBLE: ALL activities and venues MUST be wheelchair accessible. No stairs-only venues.' : ''}
${prefs.specialRequirements ? `SPECIAL REQUIREMENTS: ${prefs.specialRequirements}` : ''}

VERIFICATION REQUIREMENTS:
- Every restaurant/food activity MUST match ALL dietary preferences above
- Every attraction/activity MUST be wheelchair accessible if required
- Do NOT include any venue that cannot accommodate these requirements
- When in doubt, choose venues that explicitly cater to these needs
========================================
` : '';

      const prompt = `
Return ONLY valid JSON matching this shape (no prose):

{
  "prefs": {
    "destination": "${prefs.destination}",
    "startDate": "${prefs.startDate}",
    "endDate": "${prefs.endDate}",
    "budget": "${prefs.budget}"
  },
  "days": [
    {
      "day": <1-based day index>,
      "summary": "<one-sentence summary>",
      "activities": [
        { "title": "<what>", "time": "<HH:MM>", "location": "<where>" },
        { "title": "<what>", "time": "<HH:MM>", "location": "<where>" },
        { "title": "<what>", "time": "<HH:MM>", "location": "<where>" }
      ]
    }
  ]
}
${dietaryContext}

CRITICAL DAY 1 STRUCTURE:
========================================
Day 1 MUST start with arrival activities in this EXACT order:

1. FIRST ACTIVITY: "Arrive at [Airport Name] (AIRPORT_CODE)"
   - Time: MORNING arrival (10:00-11:00 is IDEAL for including lunch)
   - Location: Full airport name and city
   - Example: "Arrive at Soekarno-Hatta International Airport (CGK)"
   - IMPORTANT: Early arrival allows for lunch after hotel check-in

2. SECOND ACTIVITY: "Transfer to hotel"
   - Time: 1-1.5 hours after airport arrival (account for customs, baggage, travel)
   - Location: Hotel area or neighborhood name

3. THIRD ACTIVITY: "Check-in and freshen up at hotel"
   - Time: 30 minutes after arriving at hotel
   - Give travelers time to settle in

4. FIRST MEAL: Lunch (around 13:00-14:00)
   - CRITICAL: NO BREAKFAST on Day 1 (traveler arrives mid-morning!)
   - First meal MUST be LUNCH after hotel check-in
   - Time: Around 13:00-14:00 (after settling into hotel)

5. SUBSEQUENT ACTIVITIES: Light sightseeing and dinner
   - 1-2 light afternoon activities (14:30-18:00)
   - Dinner in the evening (19:00-20:00)
   - Optional evening activity after dinner
   - NO heavy sightseeing on arrival day
   - Total Day 1 activities: 6-7 (arrival + hotel + lunch + 1-2 activities + dinner + optional evening)

CORRECT Day 1 Example (Morning Arrival with Lunch):
- 10:00 - Arrive at Narita International Airport (NRT)
- 11:30 - Transfer to hotel in Shinjuku
- 12:00 - Check-in and freshen up at hotel
- 13:00 - Lunch at local restaurant
- 14:30 - Visit nearby temple or attraction
- 16:30 - Shopping or cafe break
- 19:00 - Dinner at izakaya
- 20:30 - Evening stroll in Shinjuku

INCORRECT Day 1 Example (DO NOT DO THIS):
- 08:00 - Breakfast (NO BREAKFAST on Day 1!)
- 09:00 - Breakfast at hotel (traveler not arrived yet!)
- 14:30 - Arrive at airport (too late - no time for lunch!)
- 14:30 - Arrive, then 09:00 - Breakfast (breakfast BEFORE arrival!)
- 10:00 - Arrive, then immediate full-day tour (need lunch first!)

Day 2 onwards: Normal full-day itinerary starting with breakfast at 08:00.

CRITICAL LAST DAY STRUCTURE:
========================================
Last Day MUST follow this EXACT schedule (departure at 21:00):

1. 08:00 - Breakfast at hotel area
2. 09:00-12:00 - 1-2 LIGHT morning activities ONLY (shopping, nearby attraction)
3. 13:00 - Check out from hotel (MUST be BEFORE lunch!)
4. 14:00 - Lunch (after checkout, normal lunch time)
5. 15:00-17:00 - Optional light activity OR free time
6. 19:00 - Dinner (normal dinner time!)
7. 21:00 - Depart from [Airport Name] (AIRPORT_CODE)

CRITICAL RULES FOR LAST DAY:
- Check out MUST be at 13:00 (BEFORE lunch)
- Lunch MUST be at 14:00 (AFTER checkout, normal time)
- Dinner MUST be at 19:00 (normal evening time)
- Departure MUST be at 21:00 (9pm)
- NEVER schedule lunch before 12:00
- NEVER schedule dinner before 18:00
- NEVER schedule checkout after lunch

CORRECT Last Day Example:
- 08:00 - Breakfast at hotel
- 09:30 - Last-minute souvenir shopping
- 11:00 - Visit nearby attraction
- 13:00 - Check out from hotel
- 14:00 - Lunch at local restaurant
- 16:00 - Relax at cafe near airport
- 19:00 - Dinner at restaurant
- 21:00 - Depart from Airport (CGK)

INCORRECT Last Day Example (DO NOT DO THIS):
- 10:30 - Lunch (TOO EARLY! Lunch must be 13:00-14:00)
- 12:00 - Dinner (TOO EARLY! Dinner must be 18:00-20:00)
- 15:00 - Check out (WRONG! Checkout must be BEFORE lunch)
- 08:00 - Full day tour (NO heavy activities on last day!)
- Having lunch at 10:30 then dinner at 12:00 (WRONG meal times!)

========================================

CRITICAL PACING REQUIREMENTS:
========================================
Every day MUST have activities between meals - NO large time gaps!

MINIMUM ACTIVITIES PER DAY:
- Day 1 (Arrival): 3-4 activities after arrival (arrival + hotel + 1-2 activities + meals)
- Full Days: 5-7 activities minimum (3 meals + 2-4 sightseeing/activities)
- Last Day: 3-4 activities before departure (meals + 1-2 light activities + checkout + departure)

DAILY STRUCTURE WITH ACTIVITIES:
Morning (08:00-12:00):
- 08:00 - Breakfast
- 09:30 - Morning Activity (temple/museum/market)
- 11:00 - Another Activity (shopping/walk/sightseeing)

Afternoon (12:00-18:00):
- 12:30 - Lunch
- 14:00 - Afternoon Activity (major attraction)
- 16:00 - Late Afternoon Activity (cafe/park/viewpoint)

Evening (18:00-21:00):
- 19:00 - Dinner
- Optional: Evening activity (night market/stroll)

ACTIVITY TYPES TO INCLUDE:
- Sightseeing: Temples, museums, landmarks, viewpoints, parks
- Shopping: Markets, malls, local shops, souvenir hunting
- Cultural: Traditional experiences, local crafts, performances
- Food: Street food tours, cafe visits, local specialties
- Photography: Scenic spots, sunset points, iconic locations
- Nature: Gardens, beaches, hiking, nature walks

GAP RULES:
- NO meal-to-meal without activities
- Maximum 2-hour gaps between activities
- Each day should feel packed but not rushed
- Include 1.5-2 hour duration for each activity

INCORRECT (DO NOT DO THIS):
- 09:00 - Breakfast
- 14:30 - Lunch (5.5 hour gap - WRONG!)
- 19:00 - Dinner (4.5 hour gap - WRONG!)

CORRECT (FOLLOW THIS):
- 08:00 - Breakfast at Hotel
- 09:30 - Visit Local Temple
- 11:00 - Explore Traditional Market
- 12:30 - Lunch at Local Restaurant
- 14:00 - Visit City Museum
- 16:00 - Shopping at Modern Mall
- 17:30 - Sunset at Viewpoint
- 19:00 - Dinner at Popular Restaurant

========================================

Rules:
- Output **only** JSON (no markdown fences).
- Keep "budget" lowercase exactly.
- Times in 24h HH:MM format.
- Ensure all required fields exist.
- Day 1 MUST start with airport arrival.
- NO meals before arrival on Day 1.
- Last Day MUST end with airport departure as the LAST activity.
- Last Day MUST include hotel checkout BEFORE departure.
- EVERY DAY must have activities between meals (minimum 5-7 activities per full day).
`;

      const res = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      let text = res.response.text().trim();

      if (text.startsWith('```json')) {
        text = text.replace(/^```json\s*\n/, '').replace(/\n```\s*$/, '');
      } else if (text.startsWith('```')) {
        text = text.replace(/^```\s*\n/, '').replace(/\n```\s*$/, '');
      }

    const json = JSON.parse(text);
    const validated = RESPONSE_SCHEMA.parse(json);

    return validated;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error(`[Gemini] Attempt ${attempt}/${MAX_RETRIES} failed:`, errorMessage);

      // Check for API key error - don't retry
      if (errorMessage.includes("API key")) {
        throw new Error("Invalid API key configuration. Please check your GOOGLE_API_KEY.");
      }

      // Check for rate limit error - retry with backoff
      if (isRateLimitError(e)) {
        lastError = new Error("API rate limit exceeded");

        if (attempt < MAX_RETRIES) {
          const delayMs = INITIAL_DELAY_MS * Math.pow(1.5, attempt - 1); // Exponential backoff: 5s, 7.5s, 11s, 17s, 25s
          console.log(`[Gemini] Rate limited. Retrying in ${Math.round(delayMs / 1000)}s... (attempt ${attempt}/${MAX_RETRIES})`);
          await sleep(delayMs);
          continue;
        }
      } else {
        // Non-rate-limit error - don't retry
        throw new Error(`Failed to generate itinerary: ${errorMessage}`);
      }
    }
  }

  // All retries exhausted
  throw new Error("API rate limit exceeded after multiple retries. Please wait a few minutes and try again.");
}

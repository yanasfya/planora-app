import { z } from "zod";

export const BudgetEnum = z.enum(["low", "medium", "high"]);

export const DietaryPreferencesSchema = z.object({
  halal: z.boolean(),
  nutAllergy: z.boolean(),
  seafoodAllergy: z.boolean(),
  vegetarian: z.boolean(),
  vegan: z.boolean(),
  wheelchairAccessible: z.boolean(),
}).optional();

export const TransportationDetailsSchema = z.object({
  mode: z.enum(['walking', 'transit', 'taxi', 'driving', 'flight', 'ferry', 'bicycle']),
  icon: z.string(),
  modeName: z.string(),
  duration: z.string(),
  distance: z.string(),
  cost: z.string(),
  steps: z.array(z.string()).optional(),
}).nullable().optional();

export const RestaurantSchema = z.object({
  placeId: z.string(),
  name: z.string(),
  vicinity: z.string(),
  rating: z.number(),
  userRatingsTotal: z.number(),
  priceLevel: z.number(),
  cuisine: z.array(z.string()),
  openNow: z.boolean(),
  distance: z.string(),
  walkingTime: z.string(),
  badges: z.array(z.string()),
  photoUrl: z.string().optional(),
  googleMapsUrl: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
});

export const ActivitySchema = z.object({
  title: z.string(),
  time: z.string(),
  location: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  transportToNext: TransportationDetailsSchema,
  // Google Places photo data
  photoUrl: z.string().optional(),
  placeId: z.string().optional(),
  // Meal-specific fields
  id: z.string().optional(),
  type: z.enum(['activity', 'meal', 'mosque']).optional(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner']).optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
  restaurantOptions: z.array(RestaurantSchema).optional(),
  // Mosque-specific fields
  photoReference: z.string().optional(),
  distance: z.string().optional(),
  walkingTime: z.string().optional(),
  rating: z.number().optional(),
});

export const DaySchema = z.object({
  day: z.number().int().min(1),
  summary: z.string().optional(),
  activities: z.array(ActivitySchema).min(1),
});

export const PrefsSchema = z.object({
  destination: z.string().min(1),
  startDate: z.string().min(4),
  endDate: z.string().min(4),
  budget: z.preprocess(
    (v) => (typeof v === "string" ? v.toLowerCase() : v),
    BudgetEnum
  ),
  interests: z.array(z.string()).default([]),
  dietaryPreferences: DietaryPreferencesSchema,
  specialRequirements: z.string().optional(),
  numberOfTravelers: z.number().int().min(1).default(1),
  numberOfAdults: z.number().int().min(1).default(1),
  numberOfChildren: z.number().int().min(0).default(0),
});

export const ItinerarySchema = z.object({
  _id: z.string().optional(),
  prefs: PrefsSchema,
  days: z.array(DaySchema).min(1),
  createdAt: z.string().optional(),
});

export type Activity = z.infer<typeof ActivitySchema>;
export type Day = z.infer<typeof DaySchema>;
export type Prefs = z.infer<typeof PrefsSchema>;
export type Itinerary = z.infer<typeof ItinerarySchema>;

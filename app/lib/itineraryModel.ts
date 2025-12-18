import mongoose from "mongoose";
import type { Itinerary } from "./types";

// Force schema refresh to avoid caching issues
if (mongoose.models.Itinerary) {
  delete mongoose.models.Itinerary;
}

const RestaurantSchema = new mongoose.Schema(
  {
    placeId: String,
    name: String,
    vicinity: String,
    rating: Number,
    userRatingsTotal: Number,
    priceLevel: Number,
    cuisine: [String],
    openNow: Boolean,
    distance: String,
    walkingTime: String,
    badges: [String],
    photoUrl: String,
    googleMapsUrl: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  { _id: false }
);

const ActivitySchema = new mongoose.Schema(
  {
    title: String,
    time: String,
    location: String,
    lat: Number,
    lng: Number,
    description: String,
    externalUrl: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
    transportToNext: {
      mode: {
        type: String,
        enum: ['walking', 'transit', 'taxi', 'driving', 'flight', 'ferry', 'bicycle'],
        required: false,
      },
      icon: String,
      modeName: String,
      duration: String,
      distance: String,
      cost: String,
      steps: [String],
    },
    // Google Places photo data
    photoUrl: String,
    placeId: String,
    // Meal-specific fields
    id: String,
    type: {
      type: String,
      enum: ['activity', 'meal', 'mosque'],
      required: false,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner'],
      required: false,
    },
    icon: String,
    restaurantOptions: [RestaurantSchema],
    // Mosque-specific fields
    photoReference: String,
    distance: String,
    walkingTime: String,
    rating: Number,
  },
  { _id: false }
);

const DaySchema = new mongoose.Schema(
  {
    day: Number,
    summary: String,
    activities: [ActivitySchema],
  },
  { _id: false }
);

const ItinerarySchema = new mongoose.Schema(
  {
    userId: { type: String, required: false, index: true }, // null for guests
    prefs: {
      destination: String,
      startDate: String,
      endDate: String,
      budget: String,
      interests: [String],
      dietaryPreferences: {
        halal: { type: Boolean, default: false },
        nutAllergy: { type: Boolean, default: false },
        seafoodAllergy: { type: Boolean, default: false },
        vegetarian: { type: Boolean, default: false },
        vegan: { type: Boolean, default: false },
        wheelchairAccessible: { type: Boolean, default: false },
      },
      specialRequirements: { type: String, required: false },
      numberOfTravelers: { type: Number, default: 1 },
    },
    days: [DaySchema],
    currency: { type: String, default: "USD" },
    isPublic: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "saved"],
      default: "draft",
    },
    expiresAt: {
      type: Date,
      default: function () {
        // Drafts expire in 7 days
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      },
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
ItinerarySchema.index({ userId: 1, status: 1, createdAt: -1 });
ItinerarySchema.index({ expiresAt: 1 }); // For cleanup

export default (mongoose.models.Itinerary as mongoose.Model<Itinerary>) ||
  mongoose.model<Itinerary>("Itinerary", ItinerarySchema);

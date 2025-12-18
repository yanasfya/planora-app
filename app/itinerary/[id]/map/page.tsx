"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Home } from "lucide-react";
import MapView from "@/app/components/itinerary/MapView";
import { ItinerarySchema, type Itinerary } from "@/app/lib/types";

export default function FullscreenMapPage() {
  const params = useParams();
  const router = useRouter();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<"all" | number>("all");

  useEffect(() => {
    async function fetchItinerary() {
      try {
        console.log("[Fullscreen Map] Fetching itinerary:", params.id);
        const response = await fetch(`/api/itineraries/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch itinerary");

        const data = await response.json();
        console.log("[Fullscreen Map] Data received:", data);

        // Validate with schema
        const validationResult = ItinerarySchema.safeParse(data);
        if (!validationResult.success) {
          console.warn("[Fullscreen Map] Validation warning, using data anyway");
          setItinerary(data as Itinerary);
        } else {
          setItinerary(validationResult.data);
        }
      } catch (error) {
        console.error("[Fullscreen Map] Error fetching itinerary:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchItinerary();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Itinerary not found
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Flatten all activities with day numbers
  const allActivities = itinerary.days.flatMap((day) =>
    day.activities
      .filter((activity) => activity.coordinates)
      .map((activity) => ({
        title: activity.title,
        time: activity.time,
        location: activity.location,
        coordinates: activity.coordinates,
        day: day.day,
      }))
  );

  // Filter by selected day
  const filteredActivities =
    selectedDay === "all"
      ? allActivities
      : allActivities.filter((activity) => activity.day === selectedDay);

  // Get unique days
  const uniqueDays = Array.from(new Set(itinerary.days.map((d) => d.day))).sort(
    (a, b) => a - b
  );

  // Day colors
  const getDayColor = (day: number): string => {
    const colors: Record<number, string> = {
      1: "#3B82F6", // Blue
      2: "#10B981", // Green
      3: "#F59E0B", // Amber
      4: "#EF4444", // Red
      5: "#8B5CF6", // Purple
      6: "#EC4899", // Pink
      7: "#14B8A6", // Teal
    };
    const colorIndex = ((day - 1) % 7) + 1;
    return colors[colorIndex];
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Itinerary</span>
          </button>

          {/* Title */}
          <div className="text-center flex-1 px-4">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">
              {itinerary.prefs.destination}
            </h1>
            <p className="text-white/90 text-sm">
              Showing {filteredActivities.length} locations
            </p>
          </div>

          {/* Home Button */}
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>
        </div>
      </div>

      {/* Day Filter Overlay */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
        <div className="flex gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg p-2">
          <button
            onClick={() => setSelectedDay("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedDay === "all"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            All Days
          </button>
          {uniqueDays.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
              style={{
                backgroundColor:
                  selectedDay === day ? getDayColor(day) : "transparent",
                color:
                  selectedDay === day
                    ? "#fff"
                    : "inherit",
              }}
            >
              Day {day}
            </button>
          ))}
        </div>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-6 left-6 z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
          Map Legend
        </h3>
        <div className="space-y-2">
          {uniqueDays.map((day) => {
            const dayActivities = itinerary.days
              .find((d) => d.day === day)
              ?.activities.filter((a) => a.coordinates);
            return (
              <div key={day} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getDayColor(day) }}
                ></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Day {day} ({dayActivities?.length || 0} locations)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Map */}
      <div className="w-full h-full">
        <MapView destination={itinerary.prefs.destination} activities={filteredActivities} fullscreen={true} />
      </div>
    </div>
  );
}

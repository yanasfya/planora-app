"use client";

import { MapPin, Maximize2 } from "lucide-react";
import { useRouter } from "next/navigation";
import MapView from "../itinerary/MapView";
import type { Day } from "@lib/types";

interface MapWidgetProps {
  destination: string;
  activityCount: number;
  days?: Day[];
  className?: string;
  itineraryId?: string;
}

export default function MapWidget({
  destination,
  activityCount,
  days = [],
  className = "",
  itineraryId,
}: MapWidgetProps) {
  const router = useRouter();

  // Flatten all activities with their day numbers and coordinates
  const activitiesWithCoords = days.flatMap((day) =>
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

  console.log('[MapWidget] Total days:', days.length);
  console.log('[MapWidget] Activities with coordinates:', activitiesWithCoords.length);
  console.log('[MapWidget] Sample activities:', activitiesWithCoords.slice(0, 3));

  /**
   * Open fullscreen map view
   */
  const handleFullscreenMap = () => {
    if (!itineraryId) {
      console.error('[MapWidget] No itinerary ID provided');
      return;
    }
    router.push(`/itinerary/${itineraryId}/map`);
    console.log('[MapWidget] Opening fullscreen map');
  };

  /**
   * Open Google Maps with all activity markers
   */
  const handleViewMap = () => {
    if (activitiesWithCoords.length === 0) {
      alert('No locations available to display on map');
      return;
    }

    // Create Google Maps URL with multiple markers
    const markers = activitiesWithCoords
      .map((activity, index) => {
        if (!activity.coordinates) return '';
        const { lat, lng } = activity.coordinates;
        const label = (index + 1).toString();
        return `markers=color:red%7Clabel:${label}%7C${lat},${lng}`;
      })
      .filter(Boolean)
      .join('&');

    // Center map on first activity
    const firstActivity = activitiesWithCoords[0];
    if (!firstActivity.coordinates) return;
    const center = `${firstActivity.coordinates.lat},${firstActivity.coordinates.lng}`;

    const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(destination)}&center=${center}&zoom=13&${markers}`;

    console.log('[MapWidget] Opening Google Maps with markers:', mapsUrl);
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  /**
   * Open Google Maps directions for the full route
   */
  const handleDirections = () => {
    if (activitiesWithCoords.length < 2) {
      alert('Need at least 2 locations to show directions');
      return;
    }

    // Origin: First activity
    const origin = activitiesWithCoords[0];
    if (!origin.coordinates) return;
    const originCoords = `${origin.coordinates.lat},${origin.coordinates.lng}`;

    // Destination: Last activity
    const dest = activitiesWithCoords[activitiesWithCoords.length - 1];
    if (!dest.coordinates) return;
    const destCoords = `${dest.coordinates.lat},${dest.coordinates.lng}`;

    // Waypoints: All activities in between (max 10 waypoints for free API)
    const waypoints = activitiesWithCoords
      .slice(1, -1)
      .slice(0, 10) // Google Maps allows max 10 waypoints
      .filter(activity => activity.coordinates)
      .map((activity) => `${activity.coordinates!.lat},${activity.coordinates!.lng}`)
      .join('|');

    // Build Google Maps Directions URL
    let directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originCoords}&destination=${destCoords}`;

    if (waypoints) {
      directionsUrl += `&waypoints=${waypoints}`;
    }

    directionsUrl += '&travelmode=driving';

    console.log('[MapWidget] Opening Google Maps Directions:', directionsUrl);
    console.log(`[MapWidget] Route: ${origin.title} -> ... -> ${dest.title}`);
    window.open(directionsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`flex flex-col p-4 ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Location</h3>
        </div>
        {itineraryId && (
          <button
            onClick={handleFullscreenMap}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Open fullscreen map"
            aria-label="Open fullscreen map"
          >
            <Maximize2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>

      <div className="mb-3">
        <MapView
          destination={destination}
          activities={activitiesWithCoords}
        />
      </div>

      {activitiesWithCoords.length > 0 && (
        <div className="mb-3 text-xs text-gray-600 dark:text-gray-400">
          Showing {activitiesWithCoords.length} of {activityCount} activities on map
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={handleViewMap}
          disabled={activitiesWithCoords.length === 0}
          className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          View Map
        </button>
        <button
          onClick={handleDirections}
          disabled={activitiesWithCoords.length < 2}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Directions
        </button>
      </div>
    </div>
  );
}

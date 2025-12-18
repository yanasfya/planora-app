"use client";

import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import { geocodeLocation } from "@/lib/geocoding";
import { MapPin, X, Plus, Minus } from "lucide-react";

interface LatLng {
  lat: number;
  lng: number;
}

interface ActivityWithCoords {
  title: string;
  time: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  day: number;
}

interface MapViewProps {
  destination: string;
  activities?: ActivityWithCoords[];
  fullscreen?: boolean;
}

// Day colors matching the design requirements
const DAY_COLORS: Record<number, string> = {
  1: '#3B82F6', // Blue
  2: '#10B981', // Green
  3: '#F59E0B', // Amber
  4: '#EF4444', // Red
  5: '#8B5CF6', // Purple
  6: '#EC4899', // Pink
  7: '#14B8A6', // Teal
};

// Get color for any day number (cycles through colors for days 8+)
const getColorForDay = (day: number): string => {
  const colorIndex = ((day - 1) % 7) + 1;
  return DAY_COLORS[colorIndex];
};

// Default fallback - world view
const DEFAULT_CENTER = { lat: 0, lng: 0 };
const DEFAULT_ZOOM = 2;

// Polylines Component
interface PolylinesProps {
  activitiesByDay: Record<number, ActivityWithCoords[]>;
  visibleDays: Set<number>;
  getColorForDay: (day: number) => string;
}

function Polylines({ activitiesByDay, visibleDays, getColorForDay }: PolylinesProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const polylines: google.maps.Polyline[] = [];

    Object.entries(activitiesByDay).forEach(([dayStr, activities]) => {
      const day = parseInt(dayStr);
      if (!visibleDays.has(day) || activities.length < 2) return;

      const path = activities.map(activity => ({
        lat: activity.coordinates!.lat,
        lng: activity.coordinates!.lng,
      }));

      const polyline = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: getColorForDay(day),
        strokeOpacity: 0.7,
        strokeWeight: 3,
        map,
      });

      polylines.push(polyline);
    });

    return () => {
      polylines.forEach(polyline => polyline.setMap(null));
    };
  }, [map, activitiesByDay, visibleDays, getColorForDay]);

  return null;
}

// Map Ref Updater - Updates parent ref when map is available
interface MapRefUpdaterProps {
  mapRef: React.RefObject<google.maps.Map | null>;
}

function MapRefUpdater({ mapRef }: MapRefUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    if (map && mapRef) {
      (mapRef as React.MutableRefObject<google.maps.Map | null>).current = map;
      console.log('[MapRefUpdater] Map instance captured:', map);
    }
  }, [map, mapRef]);

  return null;
}

// Custom Zoom Controls Component (uses map ref and state updater from parent)
interface CustomZoomControlsProps {
  mapRef: React.RefObject<google.maps.Map | null>;
  onZoomChange: (newZoom: number) => void;
}

function CustomZoomControls({ mapRef, onZoomChange }: CustomZoomControlsProps) {
  const map = useMap(); // Also get map from useMap hook

  const handleZoomIn = () => {
    const mapInstance = map || mapRef.current;
    if (!mapInstance) {
      console.error('[Zoom Controls] Map instance not available!');
      return;
    }
    const currentZoom = mapInstance.getZoom();
    if (currentZoom === undefined) {
      console.error('[Zoom Controls] Could not get current zoom level');
      return;
    }
    const newZoom = Math.min(currentZoom + 1, 21);

    // Update parent state to trigger re-render
    onZoomChange(newZoom);

    console.log(`[Zoom Controls] Zoom In: ${currentZoom} -> ${newZoom}`);
  };

  const handleZoomOut = () => {
    const mapInstance = map || mapRef.current;
    if (!mapInstance) {
      console.error('[Zoom Controls] Map instance not available!');
      return;
    }
    const currentZoom = mapInstance.getZoom();
    if (currentZoom === undefined) {
      console.error('[Zoom Controls] Could not get current zoom level');
      return;
    }
    const newZoom = Math.max(currentZoom - 1, 0);

    // Update parent state to trigger re-render
    onZoomChange(newZoom);

    console.log(`[Zoom Controls] Zoom Out: ${currentZoom} -> ${newZoom}`);
  };

  return (
    <div className="absolute right-3 top-3 flex flex-col gap-1 bg-white rounded-lg shadow-xl border-2 border-gray-300 overflow-hidden z-50">
      <button
        onClick={handleZoomIn}
        className="w-12 h-12 flex items-center justify-center hover:bg-blue-50 active:bg-blue-100 transition-colors border-b border-gray-200"
        aria-label="Zoom in"
        title="Zoom in"
      >
        <Plus className="w-6 h-6 text-gray-700" strokeWidth={3} />
      </button>
      <button
        onClick={handleZoomOut}
        className="w-12 h-12 flex items-center justify-center hover:bg-blue-50 active:bg-blue-100 transition-colors"
        aria-label="Zoom out"
        title="Zoom out"
      >
        <Minus className="w-6 h-6 text-gray-700" strokeWidth={3} />
      </button>
    </div>
  );
}

export default function MapView({ destination, activities = [], fullscreen = false }: MapViewProps) {
  console.log('[MapView] Component mounted/re-rendered');
  console.log('[MapView] Received props:', { destination, activitiesCount: activities.length, fullscreen });

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLng>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const [visibleDays, setVisibleDays] = useState<Set<number>>(new Set());
  const [showLegend, setShowLegend] = useState(true);

  // Filter activities that have coordinates
  const activitiesWithCoords = useMemo(() => {
    const filtered = activities.filter((activity) => activity.coordinates);
    console.log('[MapView] Total activities:', activities.length);
    console.log('[MapView] Activities with coordinates:', filtered.length);
    console.log('[MapView] Sample activity:', filtered[0]);
    return filtered;
  }, [activities]);

  // Get unique days from activities
  const uniqueDays = useMemo(() => {
    const days = new Set(activitiesWithCoords.map(a => a.day));
    return Array.from(days).sort((a, b) => a - b);
  }, [activitiesWithCoords]);

  // Initialize visible days (all days visible by default)
  useEffect(() => {
    console.log('[MapView] Unique days found:', uniqueDays);
    setVisibleDays(new Set(uniqueDays));
  }, [uniqueDays]);

  // Group activities by day for polylines
  const activitiesByDay = useMemo(() => {
    const grouped: Record<number, ActivityWithCoords[]> = {};
    activitiesWithCoords.forEach(activity => {
      if (!grouped[activity.day]) {
        grouped[activity.day] = [];
      }
      grouped[activity.day].push(activity);
    });
    return grouped;
  }, [activitiesWithCoords]);

  // Calculate map center and zoom
  useEffect(() => {
    const initializeMap = async () => {
      setIsLoading(true);

      if (activitiesWithCoords.length > 0) {
        const lats = activitiesWithCoords.map((a) => a.coordinates!.lat);
        const lngs = activitiesWithCoords.map((a) => a.coordinates!.lng);

        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;

        setMapCenter({ lat: centerLat, lng: centerLng });

        const latDiff = maxLat - minLat;
        const lngDiff = maxLng - minLng;
        const maxDiff = Math.max(latDiff, lngDiff);

        let newZoom = 13;
        if (maxDiff > 0.5) newZoom = 10;
        else if (maxDiff > 0.2) newZoom = 11;
        else if (maxDiff > 0.1) newZoom = 12;
        else if (maxDiff > 0.05) newZoom = 13;
        else newZoom = 14;

        setMapZoom(newZoom);
      } else {
        console.log(`[MapView] No activity coordinates, geocoding destination: ${destination}`);
        try {
          const coords = await geocodeLocation(destination);
          if (coords) {
            console.log(`[MapView] Geocoded ${destination} to:`, coords);
            setMapCenter(coords);
            setMapZoom(12);
          }
        } catch (error) {
          console.error(`[MapView] Error geocoding destination:`, error);
        }
      }

      setIsLoading(false);
    };

    initializeMap();
  }, [activitiesWithCoords, destination]);

  // Toggle day visibility
  const toggleDay = useCallback((day: number) => {
    setVisibleDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(day)) {
        newSet.delete(day);
      } else {
        newSet.add(day);
      }
      return newSet;
    });
  }, []);

  // Show/hide all days
  const toggleAllDays = useCallback((show: boolean) => {
    setVisibleDays(show ? new Set(uniqueDays) : new Set());
  }, [uniqueDays]);

  // Handle zoom change from controls
  const handleZoomChange = useCallback((newZoom: number) => {
    console.log('[MapView] Updating zoom to:', newZoom);
    setMapZoom(newZoom);
  }, []);

  if (!apiKey) {
    return (
      <div className={`flex w-full items-center justify-center ${fullscreen ? 'h-full bg-gray-50' : 'h-[400px] rounded-lg bg-gray-100 shadow-md'}`}>
        <p className="text-gray-600">Google Maps API key not configured</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex w-full items-center justify-center ${fullscreen ? 'h-full bg-gray-50' : 'h-[400px] rounded-lg bg-gray-100 shadow-md'}`}>
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  console.log('[MapView] Rendering component. Unique days:', uniqueDays.length, 'Visible days:', visibleDays.size);

  return (
    <div className={fullscreen ? "h-full flex flex-col" : "space-y-3"}>
      {/* Day Filter Controls */}
      {uniqueDays.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => toggleAllDays(true)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Show All
          </button>
          <button
            onClick={() => toggleAllDays(false)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Hide All
          </button>
          {uniqueDays.map(day => {
            const color = getColorForDay(day);
            const isVisible = visibleDays.has(day);
            return (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                  isVisible
                    ? 'text-white shadow-md'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: isVisible ? color : undefined,
                }}
              >
                Day {day}
              </button>
            );
          })}
        </div>
      )}

      {/* Map Container */}
      <div className={`relative w-full overflow-hidden ${fullscreen ? 'flex-1 rounded-none shadow-none' : 'h-[400px] rounded-lg shadow-md'}`}>
        <APIProvider apiKey={apiKey}>
          <Map
            center={mapCenter}
            zoom={mapZoom}
            mapTypeId="roadmap"
            disableDefaultUI={true}
            zoomControl={false}
            streetViewControl={false}
            mapTypeControl={false}
            fullscreenControl={false}
            gestureHandling="greedy"
            clickableIcons={true}
            className="h-full w-full"
            mapId="planora-map"
            reuseMaps={true}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Map Ref Updater - captures map instance */}
            <MapRefUpdater mapRef={mapRef} />

            {/* Custom Zoom Controls */}
            <CustomZoomControls mapRef={mapRef} onZoomChange={handleZoomChange} />

            {/* Test marker to verify AdvancedMarker works */}
            <AdvancedMarker
              position={mapCenter}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white font-bold"
              >
                T
              </div>
            </AdvancedMarker>

            {/* Polylines connecting activities */}
            <Polylines
              activitiesByDay={activitiesByDay}
              visibleDays={visibleDays}
              getColorForDay={getColorForDay}
            />

            {/* Render activity markers */}
            {(() => {
              console.log('[MapView] Rendering markers for', activitiesWithCoords.length, 'activities');
              console.log('[MapView] Visible days:', Array.from(visibleDays));

              return activitiesWithCoords.map((activity, index) => {
                if (!visibleDays.has(activity.day)) {
                  console.log('[MapView] Skipping activity', index, '- day', activity.day, 'not visible');
                  return null;
                }

                const dayColor = getColorForDay(activity.day);
                const activityNumber = activitiesByDay[activity.day]?.indexOf(activity) + 1 || index + 1;

                console.log('[MapView] Rendering marker', index, ':', {
                  title: activity.title,
                  day: activity.day,
                  color: dayColor,
                  number: activityNumber,
                  position: activity.coordinates,
                });

                return (
                  <AdvancedMarker
                    key={`activity-${activity.day}-${index}`}
                    position={activity.coordinates!}
                    onClick={() => {
                      console.log('[MapView] Marker clicked:', index);
                      setSelectedMarker(index);
                    }}
                  >
                    <div
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full font-bold text-white shadow-lg transition-transform hover:scale-110"
                      style={{
                        backgroundColor: dayColor,
                        opacity: 0.9,
                      }}
                    >
                      <span className="text-sm">{activityNumber}</span>
                    </div>
                  </AdvancedMarker>
                );
              });
            })()}

            {/* Info Window */}
            {selectedMarker !== null && activitiesWithCoords[selectedMarker] && (
              <InfoWindow
                position={activitiesWithCoords[selectedMarker].coordinates!}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="max-w-[300px] p-2">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="pr-4 font-semibold text-gray-900">
                      {activitiesWithCoords[selectedMarker].title}
                    </h3>
                    <button
                      onClick={() => setSelectedMarker(null)}
                      className="text-gray-400 transition-colors hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{activitiesWithCoords[selectedMarker].location}</span>
                    </div>
                    <div className="text-gray-600">
                      Time: {activitiesWithCoords[selectedMarker].time}
                    </div>
                    <div
                      className="mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium text-white"
                      style={{
                        backgroundColor: getColorForDay(activitiesWithCoords[selectedMarker].day),
                      }}
                    >
                      Day {activitiesWithCoords[selectedMarker].day}
                    </div>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Map Legend */}
        {showLegend && uniqueDays.length > 0 && (
          <div className="absolute bottom-4 left-4 rounded-lg bg-white p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-semibold text-gray-900">Map Legend</h4>
              <button
                onClick={() => setShowLegend(false)}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-1">
              {uniqueDays.slice(0, 5).map(day => (
                <div key={day} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: getColorForDay(day) }}
                  />
                  <span className="text-xs text-gray-600">Day {day}</span>
                </div>
              ))}
              {uniqueDays.length > 5 && (
                <div className="text-xs text-gray-500">+{uniqueDays.length - 5} more days</div>
              )}
            </div>
          </div>
        )}

        {/* Toggle Legend Button (when hidden) */}
        {!showLegend && (
          <button
            onClick={() => setShowLegend(true)}
            className="absolute bottom-4 left-4 rounded-lg bg-white p-2 shadow-lg transition-colors hover:bg-gray-50"
          >
            <MapPin className="h-4 w-4 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
}

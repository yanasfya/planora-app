"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudRain, CloudSnow, Sun, Wind, Loader2, AlertCircle } from "lucide-react";

interface WeatherData {
  current: {
    temp: number;
    description: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    day: string;
    temp_min: number;
    temp_max: number;
    temp: number;
    description: string;
    icon: string;
    precipitation?: number;
  }>;
  travelTip: string;
}

interface WeatherWidgetProps {
  destination: string;
  className?: string;
}

function getWeatherIcon(iconCode: string) {
  if (iconCode.startsWith("01")) return Sun;
  if (iconCode.startsWith("02") || iconCode.startsWith("03") || iconCode.startsWith("04"))
    return Cloud;
  if (iconCode.startsWith("09") || iconCode.startsWith("10")) return CloudRain;
  if (iconCode.startsWith("13")) return CloudSnow;
  if (iconCode.startsWith("50")) return Wind;
  return Cloud;
}

export default function WeatherWidget({ destination, className = "" }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/weather?destination=${encodeURIComponent(destination)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const data: WeatherData = await response.json();
        setWeather(data);
      } catch (err) {
        console.error("Weather fetch error:", err);
        setError("Unable to load weather");
      } finally {
        setLoading(false);
      }
    };

    if (destination) {
      fetchWeather();
    }
  }, [destination]);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weather Forecast</h3>
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        </div>
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl bg-gray-200 p-3 dark:bg-gray-700"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="h-16 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weather Forecast</h3>
          <AlertCircle className="h-5 w-5 text-orange-600" />
        </div>
        <div className="rounded-xl bg-orange-50 p-4 text-center dark:bg-orange-900/20">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {error || "Weather data unavailable"}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Pack for all weather conditions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weather Forecast</h3>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          {destination}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 lg:grid-cols-5">
        {weather.forecast.map((day, i) => {
          const Icon = getWeatherIcon(day.icon);
          return (
            <div
              key={i}
              className="flex flex-col items-center gap-2 rounded-xl bg-blue-50 p-3 transition-all hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
              title={day.description}
            >
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{day.day}</span>
              <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {day.temp}°C
              </span>
              {day.precipitation && day.precipitation > 0.3 && (
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {Math.round(day.precipitation * 100)}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-900/20">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Travel Tip:</span> {weather.travelTip}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Current: {weather.current.temp}°C</span>
        <span className="capitalize">{weather.current.description}</span>
      </div>
    </div>
  );
}

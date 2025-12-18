'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Info, ChevronDown } from 'lucide-react';
import { PrayerTimes, fetchPrayerTimesForTrip } from '@lib/prayerTimes';

interface PrayerTimesWidgetProps {
  startDate: string;        // YYYY-MM-DD
  endDate: string;          // YYYY-MM-DD
  destinationName: string;
  latitude: number;
  longitude: number;
}

export default function PrayerTimesWidget({
  startDate,
  endDate,
  destinationName,
  latitude,
  longitude
}: PrayerTimesWidgetProps) {
  const [prayerTimesMap, setPrayerTimesMap] = useState<Map<string, PrayerTimes>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(startDate);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadPrayerTimes = async () => {
      setLoading(true);
      setError(null);

      try {
        const times = await fetchPrayerTimesForTrip(
          startDate,
          endDate,
          latitude,
          longitude
        );

        if (times.size === 0) {
          setError('Unable to load prayer times');
        } else {
          setPrayerTimesMap(times);
        }
      } catch (err) {
        console.error('Error loading prayer times:', err);
        setError('Failed to load prayer times');
      } finally {
        setLoading(false);
      }
    };

    loadPrayerTimes();
  }, [startDate, endDate, latitude, longitude]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-green-600 rounded-xl">
            <span className="text-2xl">🕌</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Prayer Times
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading...
            </p>
          </div>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-600 rounded-xl">
            <span className="text-2xl">🕌</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Prayer Times
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const currentPrayerTimes = prayerTimesMap.get(selectedDate);

  if (!currentPrayerTimes) {
    return null;
  }

  const prayers = [
    { name: 'Fajr', time: currentPrayerTimes.fajr, icon: '🌅', label: 'Dawn' },
    { name: 'Dhuhr', time: currentPrayerTimes.dhuhr, icon: '☀️', label: 'Noon' },
    { name: 'Asr', time: currentPrayerTimes.asr, icon: '🌤️', label: 'Afternoon' },
    { name: 'Maghrib', time: currentPrayerTimes.maghrib, icon: '🌆', label: 'Sunset' },
    { name: 'Isha', time: currentPrayerTimes.isha, icon: '🌙', label: 'Night' }
  ];

  // Generate date options for multi-day trips
  const dateOptions: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);

  while (current <= end) {
    dateOptions.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 sm:p-6 border border-green-200 dark:border-green-800 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4">
        <div className="p-2.5 sm:p-3 bg-green-600 rounded-xl flex-shrink-0">
          <span className="text-xl sm:text-2xl">🕌</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
            Prayer Times
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{destinationName}</span>
          </p>
        </div>
      </div>

      {/* Date Selector - Custom dropdown for mobile compatibility */}
      {dateOptions.length > 1 && (
        <div className="mb-4 relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-3 py-2.5 text-sm border border-green-300 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[44px] cursor-pointer flex items-center justify-between"
          >
            <span>
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-green-300 dark:border-green-700 rounded-lg shadow-lg max-h-48 overflow-y-auto"
              >
                {dateOptions.map((date) => {
                  const dateObj = new Date(date);
                  const formattedDate = dateObj.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  });
                  const isSelected = date === selectedDate;
                  return (
                    <button
                      key={date}
                      type="button"
                      onClick={() => {
                        setSelectedDate(date);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 text-sm text-left min-h-[44px] flex items-center transition-colors ${
                        isSelected
                          ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 font-medium'
                          : 'text-gray-900 dark:text-gray-100 hover:bg-green-50 dark:hover:bg-green-900/30'
                      }`}
                    >
                      {formattedDate}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Prayer Times Grid */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 mb-4">
        {prayers.map((prayer) => (
          <div
            key={prayer.name}
            className="bg-white dark:bg-gray-800 rounded-lg p-2.5 sm:p-4 text-center border border-green-100 dark:border-green-800 hover:shadow-md transition-shadow"
          >
            <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{prayer.icon}</div>
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-0.5 sm:mb-1">
              {prayer.label}
            </p>
            <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
              {prayer.time}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 sm:mt-1">
              {prayer.name}
            </p>
          </div>
        ))}
      </div>

      {/* Info Footer */}
      <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400 bg-green-100/50 dark:bg-green-900/30 rounded-lg p-2.5 sm:p-3">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          Prayer times calculated using {currentPrayerTimes.method}. Times are shown in local time zone for {destinationName}.
        </p>
      </div>
    </motion.div>
  );
}

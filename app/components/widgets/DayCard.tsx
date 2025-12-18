"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { Day } from "@lib/types";
import TransportationIndicator from "../TransportationIndicator";
import MealActivityCard from "../MealActivityCard";
import MosqueActivityCard from "./MosqueActivityCard";
import ActivityCard from "./ActivityCard";

interface DayCardProps {
  day: Day;
  destination: string;
  checkInDate?: string;
  checkOutDate?: string;
  className?: string;
  currency?: string;
}

export default function DayCard({ day, destination, checkInDate, checkOutDate, className = "", currency = 'USD' }: DayCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`space-y-4 p-6 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded-xl bg-blue-50 p-4 text-left transition-all hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
      >
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Day {day.day}</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {day.activities.length} activities planned
          </p>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        </motion.div>
      </button>

      {day.summary && (
        <p className="text-sm italic text-gray-600 dark:text-gray-400">{day.summary}</p>
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {day.activities.map((activity, i) => {
              // Debug logging
              if (activity.type === 'meal') {
                console.log(`[DayCard] Day ${day.day} Activity ${i}:`, activity.title);
                console.log(`[DayCard] Is meal type:`, activity.type === 'meal');
                console.log(`[DayCard] Has restaurant options:`, !!activity.restaurantOptions);
                console.log(`[DayCard] Restaurant count:`, activity.restaurantOptions?.length || 0);
              }

              return (
              <div key={i}>
                {/* Render MealActivityCard for meal activities */}
                {activity.type === 'meal' ? (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                  >
                    <MealActivityCard
                      activity={activity as any}
                      currency={currency}
                    />
                  </motion.div>
                ) : activity.type === 'mosque' ? (
                  /* Render MosqueActivityCard for mosque/prayer activities */
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                  >
                    <MosqueActivityCard activity={activity as any} />
                  </motion.div>
                ) : (
                  /* Render ActivityCard for normal activities with booking links */
                  <ActivityCard
                    activity={activity}
                    destination={destination}
                    index={i}
                    checkInDate={checkInDate}
                    checkOutDate={checkOutDate}
                  />
                )}

                {/* Transportation indicator to next activity - Only show if complete data exists */}
                {activity.transportToNext &&
                 activity.transportToNext.mode &&
                 activity.transportToNext.duration &&
                 activity.transportToNext.distance && (
                  <TransportationIndicator transport={activity.transportToNext} />
                )}
              </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

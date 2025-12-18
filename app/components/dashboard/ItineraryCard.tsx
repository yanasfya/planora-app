"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Trash2,
  ExternalLink,
  MoreVertical,
} from "lucide-react";
import { getDestinationImage, getDestinationGradient } from "@/app/lib/destinationImages";

interface Itinerary {
  _id: string;
  prefs: {
    destination: string;
    startDate: string;
    endDate: string;
    budget?: string;
    interests?: string[];
  };
  days: any[];
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ItineraryCardProps {
  itinerary: Itinerary;
  onDelete?: (id: string) => void;
}

export default function ItineraryCard({ itinerary, onDelete }: ItineraryCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const imageUrl = getDestinationImage(itinerary.prefs.destination);
  const gradient = getDestinationGradient(itinerary.prefs.destination);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDelete = () => {
    if (onDelete && confirm("Are you sure you want to delete this itinerary?")) {
      onDelete(itinerary._id);
    }
    setShowMenu(false);
  };

  const numberOfDays = itinerary.days?.length || 0;
  const totalActivities = itinerary.days?.reduce(
    (sum, day) => sum + (day.activities?.length || 0),
    0
  ) || 0;

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image Section */}
      <div className="relative h-40 overflow-hidden">
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={itinerary.prefs.destination}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-white opacity-50" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${gradient}`} />

        {/* Destination Name on Image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-bold text-white drop-shadow-lg">
            {itinerary.prefs.destination}
          </h3>
        </div>

        {/* Menu Button */}
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              {/* Backdrop to close menu when clicking outside */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                <Link
                  href={`/itinerary/${itinerary._id}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  View
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>

        {/* Days Badge */}
        <div className="absolute top-2 left-2">
          <span className="px-2.5 py-1 bg-white/90 dark:bg-gray-900/90 rounded-full text-xs font-semibold text-gray-800 dark:text-gray-200">
            {numberOfDays} {numberOfDays === 1 ? "day" : "days"}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Date Range */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Calendar className="w-4 h-4" />
          <span>
            {formatDate(itinerary.prefs.startDate)} - {formatDate(itinerary.prefs.endDate)}
          </span>
        </div>

        {/* Activities Count */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <MapPin className="w-4 h-4" />
          <span>
            {totalActivities} {totalActivities === 1 ? "activity" : "activities"}
          </span>
        </div>

        {/* Interests Tags */}
        {itinerary.prefs.interests && itinerary.prefs.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {itinerary.prefs.interests.slice(0, 3).map((interest, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
              >
                {interest}
              </span>
            ))}
            {itinerary.prefs.interests.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                +{itinerary.prefs.interests.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Budget Badge */}
        {itinerary.prefs.budget && (
          <div className="mb-3">
            <span className="px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
              {itinerary.prefs.budget.charAt(0).toUpperCase() + itinerary.prefs.budget.slice(1)} Budget
            </span>
          </div>
        )}

        {/* View Button */}
        <Link
          href={`/itinerary/${itinerary._id}`}
          className="block w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-center text-sm font-medium rounded-lg transition-colors"
        >
          View Itinerary
        </Link>
      </div>
    </div>
  );
}

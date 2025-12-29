"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Sparkles,
  Clock,
  Bookmark,
  TrendingUp,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SearchBar from "../components/SearchBar/SearchBar";
import AdvancedOptionsPanel from "../components/SearchBar/AdvancedOptionsPanel";
import ItineraryCard from "../components/dashboard/ItineraryCard";
import ItineraryLoadingState from "../components/ItineraryLoadingState";
import type { SearchData, DietaryPreferences } from "../components/SearchBar/types";
import type { Prefs } from "@lib/types";

// Destination data with Unsplash images
const destinations = [
  {
    name: "Tokyo, Japan",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    description: "Culture & Technology",
  },
  {
    name: "Paris, France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    description: "Art & Romance",
  },
  {
    name: "New York, USA",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    description: "City & Entertainment",
  },
];

// Solid colors for card placeholders
const draftColors = ["bg-amber-500", "bg-orange-500", "bg-yellow-500"];
const savedColors = ["bg-emerald-500", "bg-teal-500", "bg-green-500"];

interface DashboardHomeProps {
  userId: string;
  userName: string;
}

interface Itinerary {
  _id: string;
  prefs: {
    destination: string;
    startDate: string;
    endDate: string;
    budget: string;
    interests?: string[];
  };
  days: any[];
  status: "draft" | "saved";
  expiresAt?: string;
}

export default function DashboardHome({ userName }: DashboardHomeProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState<{ destination: string; duration: number } | null>(null);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);

  // Unified search state (same as homepage)
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Culture', 'Food']);
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreferences>({
    halal: false,
    nutAllergy: false,
    seafoodAllergy: false,
    vegetarian: false,
    vegan: false,
    wheelchairAccessible: false,
  });
  const [specialRequirements, setSpecialRequirements] = useState("");

  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    try {
      const response = await fetch("/api/itineraries/user");
      if (response.ok) {
        const data = await response.json();
        setItineraries(data);
      }
    } catch (error) {
      console.error("Failed to fetch itineraries:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/itineraries/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItineraries((prev) => prev.filter((item) => item._id !== id));
      } else {
        alert("Failed to delete itinerary");
      }
    } catch (error) {
      console.error("Failed to delete itinerary:", error);
      alert("Failed to delete itinerary");
    }
  };

  const handleSearch = (data: SearchData) => {
    // Validation: At least 1 interest must be selected
    if (selectedInterests.length === 0) {
      alert("Please select at least one interest to personalize your trip");
      return;
    }

    // Calculate total number of travelers from SearchData
    const totalTravelers = data.adults + data.children + data.infants;

    const prefs: Prefs = {
      destination: data.destination,
      startDate: data.startDate?.toISOString().split("T")[0] || "",
      endDate: data.endDate?.toISOString().split("T")[0] || "",
      budget: data.budget,
      interests: selectedInterests,
      dietaryPreferences,
      specialRequirements: specialRequirements.trim() || undefined,
      numberOfTravelers: totalTravelers,
    };

    handleGenerate(prefs);
  };

  const handleGenerate = async (prefs: Prefs) => {
    // Calculate duration for loading screen
    const startDate = new Date(prefs.startDate);
    const endDate = new Date(prefs.endDate);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    setLoadingInfo({
      destination: prefs.destination,
      duration,
    });
    setLoading(true);

    try {
      const response = await fetch("/api/itineraries/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });

      if (response.ok) {
        const data = await response.json();
        if (data._id) {
          router.push(`/itinerary/${data._id}`);
        }
      } else {
        alert("Failed to generate itinerary");
        setLoading(false);
        setLoadingInfo(null);
      }
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate itinerary");
      setLoading(false);
      setLoadingInfo(null);
    }
  };

  const handleDestinationClick = (destination: string) => {
    setSelectedDestination(destination);
    // The SearchBar component will handle the destination update
  };

  const drafts = itineraries.filter((i) => i.status === "draft").slice(0, 3);
  const saved = itineraries.filter((i) => i.status === "saved").slice(0, 3);

  return (
    <>
      {/* Loading overlay - shown on top without unmounting the dashboard */}
      {loading && loadingInfo && (
        <ItineraryLoadingState
          destination={loadingInfo.destination}
          duration={loadingInfo.duration}
        />
      )}

      <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Welcome back, {userName}!
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:mt-2 sm:text-base">
            Where would you like to explore next?
          </p>
        </div>

        {/* Generator Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-800 sm:mb-12 sm:p-6 lg:p-8"
        >
          <div className="mb-4 flex items-center gap-3 sm:mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 sm:h-12 sm:w-12">
              <Sparkles className="h-5 w-5 text-white sm:h-6 sm:w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white sm:text-2xl">
                Plan Your Next Adventure
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                AI-powered itinerary in seconds
              </p>
            </div>
          </div>

          {/* Unified SearchBar Component */}
          <SearchBar onSearch={handleSearch} loading={loading} initialDestination={selectedDestination} />

          {/* Advanced Options Toggle */}
          <div className="mt-6">
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="mx-auto flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <Settings className="h-5 w-5" />
              <span className="font-medium">Customize Your Trip</span>
              {isAdvancedOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>

            <AnimatePresence>
              {isAdvancedOpen && (
                <div className="mt-4">
                  <AdvancedOptionsPanel
                    selectedInterests={selectedInterests}
                    onInterestsChange={setSelectedInterests}
                    dietaryPreferences={dietaryPreferences}
                    onDietaryPreferencesChange={setDietaryPreferences}
                    specialRequirements={specialRequirements}
                    onSpecialRequirementsChange={setSpecialRequirements}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Curated Sections */}
        <div className="space-y-8 sm:space-y-12">
          {/* For You */}
          <section>
            <div className="mb-4 flex items-center justify-between sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                  For You
                </h3>
              </div>
              <Link
                href="/"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Explore More →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {destinations.map((dest, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="cursor-pointer overflow-hidden rounded-xl bg-white shadow-md dark:bg-gray-800"
                  onClick={() => handleDestinationClick(dest.name)}
                >
                  <div className="relative h-40">
                    <Image
                      src={dest.image}
                      alt={dest.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {dest.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {dest.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Continue Drafts */}
          {drafts.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Clock className="h-5 w-5 text-yellow-600 sm:h-6 sm:w-6" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                    Continue Drafts
                  </h3>
                </div>
                <Link
                  href="/dashboard/itineraries"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {drafts.map((itinerary) => (
                  <ItineraryCard
                    key={itinerary._id}
                    itinerary={itinerary}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Saved Itineraries */}
          {saved.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Bookmark className="h-5 w-5 text-green-600 sm:h-6 sm:w-6" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                    Saved Itineraries
                  </h3>
                </div>
                <Link
                  href="/dashboard/itineraries"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {saved.map((itinerary) => (
                  <ItineraryCard
                    key={itinerary._id}
                    itinerary={itinerary}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Settings, ChevronDown, ChevronUp, MapPin, Calendar } from "lucide-react";
import { useState } from "react";
import type { Prefs } from "@lib/types";
import SearchBar from "./SearchBar/SearchBar";
import DestinationSection from "./DestinationSection";
import AdvancedOptionsPanel from "./SearchBar/AdvancedOptionsPanel";
import type { SearchData, DietaryPreferences } from "./SearchBar/types";
import SignInButton from "./auth/SignInButton";

interface HeroNewProps {
  onGenerate: (prefs: Prefs) => void;
  loading: boolean;
}

interface Destination {
  id: string;
  city: string;
  country: string;
}

const LOCAL_DESTINATIONS: Destination[] = [
  { id: '1', city: 'Penang', country: 'Malaysia' },
  { id: '2', city: 'Langkawi', country: 'Malaysia' },
  { id: '3', city: 'Melaka', country: 'Malaysia' },
  { id: '4', city: 'Sabah', country: 'Malaysia' },
];

const POPULAR_DESTINATIONS: Destination[] = [
  { id: '5', city: 'Tokyo', country: 'Japan' },
  { id: '6', city: 'Paris', country: 'France' },
  { id: '7', city: 'New York', country: 'USA' },
  { id: '8', city: 'Barcelona', country: 'Spain' },
  { id: '9', city: 'Bali', country: 'Indonesia' },
];

const BUDGET_DESTINATIONS: Destination[] = [
  { id: '10', city: 'Bangkok', country: 'Thailand' },
  { id: '11', city: 'Hanoi', country: 'Vietnam' },
  { id: '12', city: 'Chiang Mai', country: 'Thailand' },
  { id: '13', city: 'Siem Reap', country: 'Cambodia' },
];

export default function HeroNew({ onGenerate, loading }: HeroNewProps) {
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

    onGenerate(prefs);
  };

  const handleDestinationClick = (destination: string) => {
    setSelectedDestination(destination);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <motion.div
        className="absolute left-[-10%] top-[-10%] h-96 w-96 rounded-full bg-blue-400/30 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-[-10%] right-[-10%] h-96 w-96 rounded-full bg-orange-400/30 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute right-6 top-6 z-50 lg:right-8 lg:top-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SignInButton />
      </motion.div>

      <div className="relative mx-auto max-w-screen-xl px-6 py-12 lg:px-8">
        <motion.header
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            Plan<span className="text-blue-600">ora</span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-lg text-gray-600 sm:text-xl">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <p>AI-powered travel planning made simple</p>
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </div>
        </motion.header>

        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <SearchBar onSearch={handleSearch} loading={loading} initialDestination={selectedDestination} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="mx-auto flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
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
        </motion.div>

        <div className="space-y-12">
          <DestinationSection
            title="Local Escapes"
            subtitle="Discover hidden gems in Malaysia"
            destinations={LOCAL_DESTINATIONS}
            onDestinationClick={handleDestinationClick}
          />

          <DestinationSection
            title="Popular Worldwide"
            subtitle="Explore the world's most loved destinations"
            destinations={POPULAR_DESTINATIONS}
            onDestinationClick={handleDestinationClick}
          />

          <DestinationSection
            title="Budget-Friendly"
            subtitle="Amazing experiences without breaking the bank"
            destinations={BUDGET_DESTINATIONS}
            onDestinationClick={handleDestinationClick}
          />
        </div>

        <motion.div
          className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-2xl bg-white/80 p-6 shadow-lg backdrop-blur-sm"
          >
            <div className="mb-4 inline-flex rounded-full bg-blue-100 p-3">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">AI-Powered</h3>
            <p className="text-sm text-gray-600">
              Get personalized itineraries generated by advanced AI in seconds
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-2xl bg-white/80 p-6 shadow-lg backdrop-blur-sm"
          >
            <div className="mb-4 inline-flex rounded-full bg-orange-100 p-3">
              <MapPin className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Smart Planning</h3>
            <p className="text-sm text-gray-600">
              Optimize your trip with day-by-day activities and locations
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-2xl bg-white/80 p-6 shadow-lg backdrop-blur-sm sm:col-span-2 lg:col-span-1"
          >
            <div className="mb-4 inline-flex rounded-full bg-green-100 p-3">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Flexible Dates</h3>
            <p className="text-sm text-gray-600">
              Plan trips for any duration with customizable preferences
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

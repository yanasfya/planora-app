"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ItinerarySchema, type Prefs, type Itinerary } from "@lib/types";
import HeroSection from "./components/home/HeroSection";
import HowItWorks from "./components/home/HowItWorks";
import SectionHeader from "./components/home/SectionHeader";
import DestinationCard from "./components/home/DestinationCard";
import FeaturesSection from "./components/home/FeaturesSection";
import ItineraryLoadingState from "./components/ItineraryLoadingState";
import SearchBar from "./components/SearchBar/SearchBar";
import AdvancedOptionsPanel from "./components/SearchBar/AdvancedOptionsPanel";
import SignInButton from "./components/auth/SignInButton";
import { Sparkles, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SearchData, DietaryPreferences } from "./components/SearchBar/types";

// Destination data
const LOCAL_DESTINATIONS = [
  {
    name: 'Penang',
    country: 'Malaysia',
    // Georgetown rainbow umbrellas street art - verified ID: NstHWF3syb8
    image: 'https://images.unsplash.com/photo-1571783437166-230d53f33973?w=800&q=80',
    rating: 4.8,
    bestTime: 'Year-round',
    duration: '3-4 days',
  },
  {
    name: 'Langkawi',
    country: 'Malaysia',
    // Langkawi beach with people - verified ID: 0dF2fJjTHCw
    image: 'https://images.unsplash.com/photo-1591251010190-43c22baa46b0?w=800&q=80',
    rating: 4.7,
    bestTime: 'Nov-Mar',
    duration: '4-5 days',
  },
  {
    name: 'Melaka',
    country: 'Malaysia',
    // Melaka river boat with painted houses - verified ID: 0dKaJBeKPec
    image: 'https://images.unsplash.com/photo-1589733000502-225e3f26fb8f?w=800&q=80',
    rating: 4.6,
    bestTime: 'Year-round',
    duration: '2-3 days',
  },
  {
    name: 'Sabah',
    country: 'Malaysia',
    // Mount Kinabalu
    image: 'https://images.unsplash.com/photo-1438786657495-640937046d18?w=800&q=80',
    rating: 4.9,
    bestTime: 'Mar-Oct',
    duration: '5-7 days',
  },
];

const POPULAR_DESTINATIONS = [
  {
    name: 'Tokyo',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    rating: 4.9,
    bestTime: 'Mar-May',
    duration: '5-7 days',
  },
  {
    name: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    rating: 4.8,
    bestTime: 'Apr-Jun',
    duration: '5-7 days',
  },
  {
    name: 'New York',
    country: 'USA',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
    rating: 4.7,
    bestTime: 'Sep-Nov',
    duration: '5-7 days',
  },
  {
    name: 'Barcelona',
    country: 'Spain',
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
    rating: 4.8,
    bestTime: 'May-Jun',
    duration: '4-6 days',
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    rating: 4.9,
    bestTime: 'Apr-Oct',
    duration: '5-7 days',
  },
];

const BUDGET_DESTINATIONS = [
  {
    name: 'Bangkok',
    country: 'Thailand',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
    rating: 4.7,
    bestTime: 'Nov-Feb',
    duration: '4-5 days',
  },
  {
    name: 'Hanoi',
    country: 'Vietnam',
    // Hanoi Old Quarter / Hoan Kiem Lake
    image: 'https://images.unsplash.com/photo-1555921015-5532091f6026?w=800&q=80',
    rating: 4.6,
    bestTime: 'Oct-Dec',
    duration: '3-5 days',
  },
  {
    name: 'Chiang Mai',
    country: 'Thailand',
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80',
    rating: 4.8,
    bestTime: 'Nov-Feb',
    duration: '4-6 days',
  },
  {
    name: 'Siem Reap',
    country: 'Cambodia',
    // Angkor Wat temple - verified ID: EY3tC81nFt0
    image: 'https://images.unsplash.com/photo-1566706546199-a93ba33ce9f7?w=800&q=80',
    rating: 4.7,
    bestTime: 'Nov-Mar',
    duration: '3-4 days',
  },
];

export default function Page() {
  const router = useRouter();
  const [result, setResult] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState<Prefs | null>(null);
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

  const handleGenerate = async (prefs: Prefs) => {
    setLoading(true);
    setResult(null);
    setLoadingPrefs(prefs);

    try {
      const response = await fetch("/api/itineraries/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });

      const text = await response.text();
      setLoading(false);
      setLoadingPrefs(null);

      if (!response.ok) {
        let errorObj: Record<string, unknown> = {};
        try {
          errorObj = text ? JSON.parse(text) : {};
        } catch {
          errorObj = { error: text || "Failed" };
        }
        alert(
          errorObj?.error
            ? JSON.stringify(errorObj.error)
            : "Failed to generate itinerary"
        );
        return;
      }

      try {
        const json = JSON.parse(text);
        const validated = ItinerarySchema.parse(json);

        if (validated._id) {
          router.push(`/itinerary/${validated._id}`);
        } else {
          setResult(validated);
        }
      } catch (parseError) {
        alert("Invalid response from server");
      }
    } catch (error) {
      setLoading(false);
      setLoadingPrefs(null);
      const errorMessage =
        error instanceof Error ? error.message : "Network error";
      alert(errorMessage);
    }
  };

  const handleSearch = (data: SearchData) => {
    if (selectedInterests.length === 0) {
      alert("Please select at least one interest to personalize your trip");
      return;
    }

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
      numberOfAdults: data.adults,
      numberOfChildren: data.children + data.infants,
    };

    handleGenerate(prefs);
  };

  const handleDestinationClick = (destination: { name: string; country: string }) => {
    setSelectedDestination(`${destination.name}, ${destination.country}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate loading state info
  const loadingInfo = loadingPrefs ? {
    destination: loadingPrefs.destination,
    duration: Math.ceil((new Date(loadingPrefs.endDate).getTime() - new Date(loadingPrefs.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
  } : null;

  return (
    <>
      {/* Loading overlay - shown on top without unmounting the form */}
      {loading && loadingInfo && (
        <div className="fixed inset-0 z-[9999]">
          <ItineraryLoadingState
            destination={loadingInfo.destination}
            duration={loadingInfo.duration}
          />
        </div>
      )}

    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sign In Button - Fixed position */}
      <motion.div
        className="fixed right-6 top-6 z-50 lg:right-8 lg:top-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SignInButton />
      </motion.div>

      {/* Hero Section with Search */}
      <HeroSection>
        <div className="w-full max-w-4xl mx-auto" id="plan">
          <SearchBar onSearch={handleSearch} loading={loading} initialDestination={selectedDestination} />

          {/* Customize Your Trip */}
          <motion.div
            className="mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors text-sm font-medium mx-auto"
            >
              <Settings className="w-4 h-4" />
              <span>Customize Your Trip</span>
              {isAdvancedOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </motion.div>

          <AnimatePresence>
            {isAdvancedOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-4"
              >
                <AdvancedOptionsPanel
                  selectedInterests={selectedInterests}
                  onInterestsChange={setSelectedInterests}
                  dietaryPreferences={dietaryPreferences}
                  onDietaryPreferencesChange={setDietaryPreferences}
                  specialRequirements={specialRequirements}
                  onSpecialRequirementsChange={setSpecialRequirements}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </HeroSection>

      {/* How It Works Section */}
      <div className="relative z-10">
        <HowItWorks />
      </div>

      {/* Destinations Sections */}
      <section className="relative z-10 py-8 px-4 max-w-6xl mx-auto sm:py-12">
        {/* Local Escapes */}
        <SectionHeader
          icon="🌴"
          title="Local Escapes"
          subtitle="Discover hidden gems in Malaysia"
        />
        <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 sm:gap-6 sm:mb-12 lg:grid-cols-4">
          {LOCAL_DESTINATIONS.map((dest) => (
            <DestinationCard
              key={dest.name}
              {...dest}
              onClick={() => handleDestinationClick(dest)}
            />
          ))}
        </div>

        {/* Popular Worldwide */}
        <SectionHeader
          icon="🌍"
          title="Popular Worldwide"
          subtitle="Explore the world's most loved destinations"
        />
        <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 sm:gap-6 sm:mb-12 lg:grid-cols-5">
          {POPULAR_DESTINATIONS.map((dest) => (
            <DestinationCard
              key={dest.name}
              {...dest}
              onClick={() => handleDestinationClick(dest)}
            />
          ))}
        </div>

        {/* Budget-Friendly */}
        <SectionHeader
          icon="💰"
          title="Budget-Friendly"
          subtitle="Amazing experiences without breaking the bank"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {BUDGET_DESTINATIONS.map((dest) => (
            <DestinationCard
              key={dest.name}
              {...dest}
              onClick={() => handleDestinationClick(dest)}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <div className="relative z-10">
        <FeaturesSection />
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-8 bg-gray-900 text-center text-gray-400 border-t border-gray-800">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <p className="text-white font-semibold">Planora</p>
        </div>
        <p className="text-sm">© 2025 Made with ❤️ by Ilyana Sofiya</p>
        <p className="text-xs mt-1">Final Year Project - Sunway University</p>
      </footer>
    </main>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hotel as HotelIcon, Star, ExternalLink, Loader2, AlertCircle, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useCurrency } from "@/app/contexts/CurrencyContext";
import { formatPrice, convertPrice } from "@/lib/currency";

interface Hotel {
  id: string;
  name: string;
  price: number;
  priceUSD: number;
  currency: string;
  rating: number;
  image: string;
  amenities: string[];
  location: string;
  bookingUrl: string;
}

interface HotelsResponse {
  hotels: Hotel[];
  city: string;
  budget: string;
  currency: {
    code: string;
    symbol: string;
    autoDetected: boolean;
  };
  source?: "BOOKING_COM_API" | "SMART_RECOMMENDATIONS";
}

interface HotelWidgetProps {
  destination: string;
  budget: "low" | "medium" | "high";
  checkInDate?: string;
  checkOutDate?: string;
  guests?: number;
  className?: string;
}

export default function HotelWidget({
  destination,
  budget,
  checkInDate,
  checkOutDate,
  guests = 2,
  className = ""
}: HotelWidgetProps) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currencyInfo, setCurrencyInfo] = useState<{ code: string; symbol: string } | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { getActiveCurrency, setAutoDetectedCurrency } = useCurrency();
  const activeCurrency = getActiveCurrency();

  // Budget ranges stored as numeric USD values for conversion
  const budgetRangesUSD = {
    low: { label: "Budget", min: 50, max: 100 },
    medium: { label: "Moderate", min: 100, max: 250 },
    high: { label: "Luxury", min: 250, max: null }, // null means "+"
  };

  // Function to get converted range string
  const getConvertedRange = (budgetLevel: "low" | "medium" | "high"): string => {
    const range = budgetRangesUSD[budgetLevel];
    const minConverted = convertPrice(range.min, activeCurrency);

    if (range.max === null) {
      // For luxury, show "X+/night"
      return `${formatPrice(minConverted, activeCurrency)}+/night`;
    }

    const maxConverted = convertPrice(range.max, activeCurrency);
    return `${formatPrice(minConverted, activeCurrency)}-${formatPrice(maxConverted, activeCurrency)}/night`;
  };

  const currentBudget = {
    label: budgetRangesUSD[budget].label,
    range: getConvertedRange(budget)
  };

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build API URL with dates, currency, and guests
        let url = `/api/hotels?destination=${encodeURIComponent(destination)}&budget=${budget}`;

        if (checkInDate && checkOutDate) {
          url += `&dates=${checkInDate},${checkOutDate}`;
        }

        // Add currency parameter
        url += `&currency=${activeCurrency}`;

        // Add guests parameter
        url += `&guests=${guests}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch hotels");
        }

        const data: HotelsResponse = await response.json();
        setHotels(data.hotels);
        setCurrencyInfo(data.currency);

        // Set auto-detected currency from API if it was auto-detected
        if (data.currency?.autoDetected) {
          setAutoDetectedCurrency(data.currency.code);
        }
      } catch (err) {
        console.error("Hotels fetch error:", err);
        setError("Unable to load hotels");
      } finally {
        setLoading(false);
      }
    };

    if (destination && budget) {
      fetchHotels();
    }
  }, [destination, budget, checkInDate, checkOutDate, activeCurrency, guests]);

  const nextHotel = () => {
    setCurrentIndex((prev) => (prev + 1) % hotels.length);
  };

  const prevHotel = () => {
    setCurrentIndex((prev) => (prev - 1 + hotels.length) % hotels.length);
  };

  if (loading) {
    return (
      <div className={`space-y-4 p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HotelIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Finding Hotels...
            </h3>
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        </div>
        <div className="animate-pulse rounded-xl bg-gray-200 p-4 dark:bg-gray-700">
          <div className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || hotels.length === 0) {
    return (
      <div className={`space-y-4 p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HotelIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recommended Hotels
            </h3>
          </div>
          <AlertCircle className="h-5 w-5 text-orange-600" />
        </div>
        <div className="rounded-xl bg-orange-50 p-4 text-center dark:bg-orange-900/20">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {error || "No hotels available"}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Check Booking.com for options
          </p>
        </div>
      </div>
    );
  }

  const currentHotel = hotels[currentIndex];

  return (
    <div className={`space-y-4 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HotelIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recommended Hotels
          </h3>
        </div>
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
          {currentBudget.label}
        </span>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-700"
          >
            {currentHotel.image && currentHotel.image !== "/placeholder-hotel.jpg" && (
              <div className="relative h-40 w-full overflow-hidden bg-gray-100 dark:bg-gray-600">
                <img
                  src={currentHotel.image}
                  alt={currentHotel.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{currentHotel.name}</h4>
                  <div className="mt-1 flex items-center gap-1">
                    {Array.from({ length: currentHotel.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  {currentHotel.location && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="h-3 w-3" />
                      <span>{currentHotel.location}</span>
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {currentHotel.amenities.map((amenity, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatPrice(currentHotel.price, currentHotel.currency)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">per night</p>
                </div>
              </div>
              <a
                href={currentHotel.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Book Now
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
        </AnimatePresence>

        {hotels.length > 1 && (
          <>
            <button
              onClick={prevHotel}
              className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-gray-100 hover:shadow-xl dark:bg-gray-600 dark:hover:bg-gray-500"
              aria-label="Previous hotel"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={nextHotel}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-gray-100 hover:shadow-xl dark:bg-gray-600 dark:hover:bg-gray-500"
              aria-label="Next hotel"
            >
              <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
          </>
        )}
      </div>

      <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-900/30">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <span className="font-semibold">Range:</span> {currentBudget.range}
        </p>
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          {currentIndex + 1} of {hotels.length}
        </p>
      </div>
    </div>
  );
}

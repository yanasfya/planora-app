"use client";

import { MapPin, Clock, X, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo, useRef } from "react";

interface WhereDropdownProps {
  destination: string;
  onDestinationChange: (destination: string) => void;
  onSelectDestination: (destination: string) => void;
}

interface Destination {
  name: string;
  country: string;
  fullName: string;
}

const SUGGESTED_DESTINATIONS: Destination[] = [
  { name: "Tokyo", country: "Japan", fullName: "Tokyo, Japan" },
  { name: "Paris", country: "France", fullName: "Paris, France" },
  { name: "New York", country: "USA", fullName: "New York, USA" },
  { name: "Barcelona", country: "Spain", fullName: "Barcelona, Spain" },
  { name: "Bali", country: "Indonesia", fullName: "Bali, Indonesia" },
  { name: "Bangkok", country: "Thailand", fullName: "Bangkok, Thailand" },
  { name: "London", country: "UK", fullName: "London, UK" },
  { name: "Dubai", country: "UAE", fullName: "Dubai, UAE" },
  { name: "Rome", country: "Italy", fullName: "Rome, Italy" },
  { name: "Singapore", country: "Singapore", fullName: "Singapore" },
];

const POPULAR_DESTINATIONS: Destination[] = [
  { name: "Penang", country: "Malaysia", fullName: "Penang, Malaysia" },
  { name: "Langkawi", country: "Malaysia", fullName: "Langkawi, Malaysia" },
  { name: "Melaka", country: "Malaysia", fullName: "Melaka, Malaysia" },
  { name: "Kuala Lumpur", country: "Malaysia", fullName: "Kuala Lumpur, Malaysia" },
  { name: "Seoul", country: "South Korea", fullName: "Seoul, South Korea" },
  { name: "Istanbul", country: "Turkey", fullName: "Istanbul, Turkey" },
  { name: "Amsterdam", country: "Netherlands", fullName: "Amsterdam, Netherlands" },
  { name: "Sydney", country: "Australia", fullName: "Sydney, Australia" },
  { name: "Santorini", country: "Greece", fullName: "Santorini, Greece" },
  { name: "Maldives", country: "Maldives", fullName: "Maldives" },
  { name: "Phuket", country: "Thailand", fullName: "Phuket, Thailand" },
  { name: "Kyoto", country: "Japan", fullName: "Kyoto, Japan" },
  { name: "Venice", country: "Italy", fullName: "Venice, Italy" },
  { name: "Prague", country: "Czech Republic", fullName: "Prague, Czech Republic" },
  { name: "Lisbon", country: "Portugal", fullName: "Lisbon, Portugal" },
];

const STORAGE_KEY = "planora_recent_destinations";

export default function WhereDropdown({
  destination,
  onDestinationChange,
  onSelectDestination,
}: WhereDropdownProps) {
  const [recentDestinations, setRecentDestinations] = useState<Destination[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-focus the input when dropdown opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Load recent destinations from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentDestinations(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load recent destinations:", error);
    }
  }, []);

  // Filter destinations based on search
  const filteredSuggested = useMemo(() => {
    if (!destination.trim()) return SUGGESTED_DESTINATIONS;
    const query = destination.toLowerCase();
    return SUGGESTED_DESTINATIONS.filter(
      (dest) =>
        dest.name.toLowerCase().includes(query) ||
        dest.country.toLowerCase().includes(query) ||
        dest.fullName.toLowerCase().includes(query)
    );
  }, [destination]);

  const filteredPopular = useMemo(() => {
    if (!destination.trim()) return POPULAR_DESTINATIONS;
    const query = destination.toLowerCase();
    return POPULAR_DESTINATIONS.filter(
      (dest) =>
        dest.name.toLowerCase().includes(query) ||
        dest.country.toLowerCase().includes(query) ||
        dest.fullName.toLowerCase().includes(query)
    );
  }, [destination]);

  // Create flat list for keyboard navigation
  const allItems = useMemo(() => {
    const items: Destination[] = [];
    if (!destination.trim() && recentDestinations.length > 0) {
      items.push(...recentDestinations);
    }
    items.push(...filteredSuggested, ...filteredPopular);
    return items;
  }, [destination, recentDestinations, filteredSuggested, filteredPopular]);

  // Handle destination selection
  const handleSelect = (dest: Destination) => {
    // Update recent destinations
    const updated = [
      dest,
      ...recentDestinations.filter((d) => d.fullName !== dest.fullName),
    ].slice(0, 3);

    setRecentDestinations(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save recent destinations:", error);
    }

    onSelectDestination(dest.fullName);
  };

  // Remove from recent
  const removeRecent = (dest: Destination, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentDestinations.filter((d) => d.fullName !== dest.fullName);
    setRecentDestinations(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save recent destinations:", error);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < allItems.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < allItems.length) {
          handleSelect(allItems[focusedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        onDestinationChange("");
        setFocusedIndex(-1);
        break;
    }
  };

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const focusedElement = listRef.current.querySelector(
        `[data-index="${focusedIndex}"]`
      );
      focusedElement?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [focusedIndex]);

  // Reset focused index when search changes
  useEffect(() => {
    setFocusedIndex(-1);
  }, [destination]);

  // Calculate indices for sections
  const recentCount = !destination.trim() ? recentDestinations.length : 0;
  const suggestedStartIndex = recentCount;
  const popularStartIndex = recentCount + filteredSuggested.length;

  const hasResults = filteredSuggested.length > 0 || filteredPopular.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={handleKeyDown}
      className="search-bar-dropdown w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-2xl sm:max-w-96 overflow-hidden"
      data-dropdown="search-where"
    >
      {/* Header with Search Input */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Select Destination</h3>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={destination}
            onChange={(e) => onDestinationChange(e.target.value)}
            placeholder="Search destinations..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Scrollable List */}
      <div
        ref={listRef}
        className="max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {!hasResults && destination.trim() ? (
          /* Custom Destination Option */
          <div className="py-2">
            <div className="px-4 py-2 mb-2">
              <p className="text-xs text-gray-500">
                No matching destinations found
              </p>
            </div>
            <button
              onClick={() => handleSelect({
                name: destination.trim(),
                country: '',
                fullName: destination.trim()
              })}
              className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 group border-l-4 hover:bg-blue-50 border-transparent hover:border-blue-400"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                  Use &quot;{destination.trim()}&quot;
                </p>
                <p className="text-xs text-gray-500 group-hover:text-blue-500">
                  Search for this custom destination
                </p>
              </div>
              <span className="text-lg">✨</span>
            </button>
          </div>
        ) : !hasResults ? (
          /* Empty State - No search query */
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <MapPin className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              Start typing to search
            </p>
            <p className="text-xs text-gray-500">
              Or select from suggestions below
            </p>
          </div>
        ) : (
          <>
            {/* Recent Section */}
            {!destination.trim() && recentDestinations.length > 0 && (
              <div>
                <div className="sticky top-0 bg-gradient-to-b from-blue-50 to-white px-4 py-2 border-b border-blue-100">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-blue-600" />
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                      Recent
                    </p>
                  </div>
                </div>
                <div className="py-1">
                  {recentDestinations.map((dest, index) => (
                    <button
                      key={`recent-${dest.fullName}`}
                      data-index={index}
                      onClick={() => handleSelect(dest)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-150 group border-l-4 ${
                        focusedIndex === index
                          ? "bg-blue-100 border-blue-600"
                          : "hover:bg-blue-50 border-transparent hover:border-blue-400"
                      }`}
                    >
                      <Clock
                        className={`h-4 w-4 flex-shrink-0 transition-colors ${
                          focusedIndex === index
                            ? "text-blue-600"
                            : "text-gray-400 group-hover:text-blue-500"
                        }`}
                      />
                      <div className="flex-1 text-left min-w-0">
                        <p
                          className={`text-sm font-medium truncate transition-colors ${
                            focusedIndex === index
                              ? "text-blue-800"
                              : "text-gray-900 group-hover:text-blue-700"
                          }`}
                        >
                          {dest.name}
                        </p>
                        <p
                          className={`text-xs truncate transition-colors ${
                            focusedIndex === index
                              ? "text-blue-600"
                              : "text-gray-500 group-hover:text-blue-500"
                          }`}
                        >
                          {dest.country}
                        </p>
                      </div>
                      <button
                        onClick={(e) => removeRecent(dest, e)}
                        className="flex-shrink-0 p-1 rounded-full hover:bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove from recent"
                      >
                        <X className="h-3 w-3 text-gray-400 hover:text-red-500" />
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Section */}
            {filteredSuggested.length > 0 && (
              <div>
                <div className="sticky top-0 bg-gradient-to-b from-gray-50 to-white px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Suggested
                  </p>
                </div>
                <div className="py-1">
                  {filteredSuggested.map((dest, index) => {
                    const globalIndex = suggestedStartIndex + index;
                    return (
                      <button
                        key={`suggested-${dest.fullName}`}
                        data-index={globalIndex}
                        onClick={() => handleSelect(dest)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-150 group border-l-4 ${
                          focusedIndex === globalIndex
                            ? "bg-blue-100 border-blue-600"
                            : "hover:bg-blue-50 border-transparent hover:border-blue-400"
                        }`}
                      >
                        <MapPin
                          className={`h-4 w-4 flex-shrink-0 transition-colors ${
                            focusedIndex === globalIndex
                              ? "text-blue-600"
                              : "text-gray-400 group-hover:text-blue-500"
                          }`}
                        />
                        <div className="flex-1 text-left min-w-0">
                          <p
                            className={`text-sm font-medium truncate transition-colors ${
                              focusedIndex === globalIndex
                                ? "text-blue-800"
                                : "text-gray-900 group-hover:text-blue-700"
                            }`}
                          >
                            {dest.name}
                          </p>
                          <p
                            className={`text-xs truncate transition-colors ${
                              focusedIndex === globalIndex
                                ? "text-blue-600"
                                : "text-gray-500 group-hover:text-blue-500"
                            }`}
                          >
                            {dest.country}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Popular Section */}
            {filteredPopular.length > 0 && (
              <div>
                <div className="sticky top-0 bg-gradient-to-b from-gray-50 to-white px-4 py-2 border-y border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Popular
                  </p>
                </div>
                <div className="py-1">
                  {filteredPopular.map((dest, index) => {
                    const globalIndex = popularStartIndex + index;
                    return (
                      <button
                        key={`popular-${dest.fullName}`}
                        data-index={globalIndex}
                        onClick={() => handleSelect(dest)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-150 group border-l-4 ${
                          focusedIndex === globalIndex
                            ? "bg-blue-100 border-blue-600"
                            : "hover:bg-blue-50 border-transparent hover:border-blue-400"
                        }`}
                      >
                        <MapPin
                          className={`h-4 w-4 flex-shrink-0 transition-colors ${
                            focusedIndex === globalIndex
                              ? "text-blue-600"
                              : "text-gray-400 group-hover:text-blue-500"
                          }`}
                        />
                        <div className="flex-1 text-left min-w-0">
                          <p
                            className={`text-sm font-medium truncate transition-colors ${
                              focusedIndex === globalIndex
                                ? "text-blue-800"
                                : "text-gray-900 group-hover:text-blue-700"
                            }`}
                          >
                            {dest.name}
                          </p>
                          <p
                            className={`text-xs truncate transition-colors ${
                              focusedIndex === globalIndex
                                ? "text-blue-600"
                                : "text-gray-500 group-hover:text-blue-500"
                            }`}
                          >
                            {dest.country}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer with keyboard hint */}
      <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50">
        <p className="text-[10px] text-gray-500 text-center">
          <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[9px] font-mono">
            ↑↓
          </kbd>{" "}
          navigate{" "}
          <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[9px] font-mono mx-1">
            Enter
          </kbd>{" "}
          select{" "}
          <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[9px] font-mono">
            Esc
          </kbd>{" "}
          clear
        </p>
      </div>
    </motion.div>
  );
}

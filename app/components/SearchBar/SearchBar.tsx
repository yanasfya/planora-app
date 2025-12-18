"use client";

import { Search, MapPin, Calendar, Users, DollarSign } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import WhereDropdown from "./WhereDropdown";
import WhenDropdown from "./WhenDropdown";
import WhoDropdown from "./WhoDropdown";
import BudgetSelector from "./BudgetSelector";
import type { SearchData, DropdownType } from "./types";

interface SearchBarProps {
  onSearch: (data: SearchData) => void;
  loading?: boolean;
  initialDestination?: string;
}

interface DropdownPosition {
  top: number;
  left: number;
  width?: number;
}

export default function SearchBar({ onSearch, loading = false, initialDestination }: SearchBarProps) {
  const [searchData, setSearchData] = useState<SearchData>({
    destination: "",
    startDate: null,
    endDate: null,
    groupType: "solo",
    adults: 1,
    children: 0,
    infants: 0,
    budget: "medium",
  });

  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  const searchBarRef = useRef<HTMLDivElement>(null);
  // Desktop refs
  const whereRefDesktop = useRef<HTMLDivElement>(null);
  const whenRefDesktop = useRef<HTMLDivElement>(null);
  const whoRefDesktop = useRef<HTMLDivElement>(null);
  const budgetRefDesktop = useRef<HTMLDivElement>(null);
  // Mobile refs
  const whereRefMobile = useRef<HTMLDivElement>(null);
  const whenRefMobile = useRef<HTMLDivElement>(null);
  const whoRefMobile = useRef<HTMLDivElement>(null);
  const budgetRefMobile = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialDestination) {
      setSearchData(prev => ({ ...prev, destination: initialDestination }));
    }
  }, [initialDestination]);

  // Calculate dropdown position when active dropdown changes
  useEffect(() => {
    if (!activeDropdown || typeof window === 'undefined') return;

    const calculatePosition = () => {
      const isMobile = window.innerWidth < 768;
      let targetRef: React.RefObject<HTMLDivElement | null>;
      let dropdownWidth = 384; // default width

      // Select the correct ref based on screen size
      switch (activeDropdown) {
        case "where":
          targetRef = isMobile ? whereRefMobile : whereRefDesktop;
          dropdownWidth = 384;
          break;
        case "when":
          targetRef = isMobile ? whenRefMobile : whenRefDesktop;
          dropdownWidth = 400;
          break;
        case "who":
          targetRef = isMobile ? whoRefMobile : whoRefDesktop;
          dropdownWidth = 384;
          break;
        case "budget":
          targetRef = isMobile ? budgetRefMobile : budgetRefDesktop;
          dropdownWidth = 320;
          break;
        default:
          return;
      }

      const rect = targetRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return; // Skip if element is hidden

      if (isMobile) {
        // Mobile: full width below the trigger
        setDropdownPosition({
          top: rect.bottom + 8,
          left: 16,
          width: window.innerWidth - 32,
        });
      } else {
        // Desktop: position based on which button
        let left: number;

        if (activeDropdown === "where") {
          // Left-align with the button
          left = rect.left;
        } else if (activeDropdown === "when") {
          // Center under the button
          left = rect.left + (rect.width / 2) - (dropdownWidth / 2);
        } else {
          // Right-align for who and budget
          left = rect.right - dropdownWidth;
        }

        // Keep within viewport
        const minLeft = 16;
        const maxLeft = window.innerWidth - dropdownWidth - 16;
        left = Math.max(minLeft, Math.min(left, maxLeft));

        setDropdownPosition({
          top: rect.bottom + 8,
          left,
        });
      }
    };

    calculatePosition();

    // Recalculate on scroll/resize
    window.addEventListener("scroll", calculatePosition, true);
    window.addEventListener("resize", calculatePosition);

    return () => {
      window.removeEventListener("scroll", calculatePosition, true);
      window.removeEventListener("resize", calculatePosition);
    };
  }, [activeDropdown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if click is inside the search bar OR inside any dropdown
      const isClickInside = searchBarRef.current?.contains(target) ||
                           target.closest('.search-bar-dropdown') ||
                           target.closest('[data-dropdown]');

      if (!isClickInside) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateRange = () => {
    if (!searchData.startDate && !searchData.endDate) return "Select dates";
    if (!searchData.endDate) {
      return searchData.startDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return `${searchData.startDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${searchData.endDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  const formatGuests = () => {
    const total = searchData.adults + searchData.children + searchData.infants;
    if (total === 1) return "1 guest";
    return `${total} guests`;
  };

  const getBudgetLabel = () => {
    const labels = { low: "$", medium: "$$", high: "$$$" };
    return labels[searchData.budget];
  };

  const handleSearch = () => {
    if (!searchData.destination.trim()) return;
    if (!searchData.startDate || !searchData.endDate) return;

    onSearch(searchData);
    setActiveDropdown(null);
  };

  const isSearchDisabled = !searchData.destination.trim() || !searchData.startDate || !searchData.endDate || loading;

  // Render dropdown content based on active dropdown
  const renderDropdownContent = () => {
    switch (activeDropdown) {
      case "where":
        return (
          <WhereDropdown
            destination={searchData.destination}
            onDestinationChange={(destination) =>
              setSearchData({ ...searchData, destination })
            }
            onSelectDestination={(destination) => {
              setSearchData({ ...searchData, destination });
              setActiveDropdown("when");
            }}
          />
        );
      case "when":
        return (
          <WhenDropdown
            startDate={searchData.startDate}
            endDate={searchData.endDate}
            onDateChange={(start, end) => {
              setSearchData({ ...searchData, startDate: start, endDate: end });
            }}
            onClose={() => setActiveDropdown(null)}
          />
        );
      case "who":
        return (
          <WhoDropdown
            groupType={searchData.groupType}
            adults={searchData.adults}
            children={searchData.children}
            infants={searchData.infants}
            onGroupTypeChange={(type) => setSearchData({ ...searchData, groupType: type })}
            onPassengerChange={(adults, children, infants) =>
              setSearchData({ ...searchData, adults, children, infants })
            }
          />
        );
      case "budget":
        return (
          <BudgetSelector
            budget={searchData.budget}
            onBudgetChange={(budget) => setSearchData({ ...searchData, budget })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div ref={searchBarRef} className="relative w-full z-50">
      {/* Desktop Layout - horizontal bar */}
      <div className="mx-auto hidden w-full max-w-4xl items-center gap-0 rounded-full border border-gray-200 bg-white shadow-xl transition-shadow hover:shadow-2xl md:flex">
        {/* WHERE */}
        <div ref={whereRefDesktop} className="relative flex-1 rounded-l-full">
          <div
            onClick={() => setActiveDropdown(activeDropdown === "where" ? null : "where")}
            className={`cursor-pointer px-6 py-3 transition-colors ${
              activeDropdown === "where" ? "bg-blue-50" : "hover:bg-gray-50"
            } rounded-l-full`}
          >
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500">Where?</p>
                <input
                  type="text"
                  value={searchData.destination}
                  onChange={(e) => {
                    setSearchData({ ...searchData, destination: e.target.value });
                    if (!activeDropdown) {
                      setActiveDropdown("where");
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown("where");
                  }}
                  placeholder="Destination"
                  className="w-full bg-transparent text-center font-medium text-gray-900 placeholder-gray-900 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="h-8 w-px bg-gray-300" />

        {/* WHEN */}
        <div ref={whenRefDesktop} className="relative flex-1">
          <div
            onClick={() => setActiveDropdown(activeDropdown === "when" ? null : "when")}
            className={`cursor-pointer px-6 py-3 transition-colors ${
              activeDropdown === "when" ? "bg-blue-50" : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs font-medium text-gray-500">When?</p>
                <p className="font-medium text-gray-900">{formatDateRange()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-8 w-px bg-gray-300" />

        {/* WHO */}
        <div ref={whoRefDesktop} className="relative flex-1">
          <div
            onClick={() => setActiveDropdown(activeDropdown === "who" ? null : "who")}
            className={`cursor-pointer px-6 py-3 transition-colors ${
              activeDropdown === "who" ? "bg-blue-50" : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs font-medium text-gray-500">Who?</p>
                <p className="font-medium text-gray-900">{formatGuests()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-8 w-px bg-gray-300" />

        {/* BUDGET */}
        <div ref={budgetRefDesktop} className="relative">
          <div
            onClick={() => setActiveDropdown(activeDropdown === "budget" ? null : "budget")}
            className={`cursor-pointer px-6 py-3 transition-colors ${
              activeDropdown === "budget" ? "bg-blue-50" : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs font-medium text-gray-500">Budget</p>
                <p className="text-xl font-bold text-gray-900">{getBudgetLabel()}</p>
              </div>
            </div>
          </div>
        </div>

        <motion.button
          onClick={handleSearch}
          disabled={isSearchDisabled}
          whileHover={{ scale: isSearchDisabled ? 1 : 1.05 }}
          whileTap={{ scale: isSearchDisabled ? 1 : 0.95 }}
          className="m-2 flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Search className="h-5 w-5" />
          <span>{loading ? "Generating..." : "Generate"}</span>
        </motion.button>
      </div>

      {/* Mobile Layout - vertical stacked cards */}
      <div className="mx-auto flex w-full max-w-md flex-col gap-3 md:hidden">
        {/* WHERE - Mobile */}
        <div ref={whereRefMobile} className="relative">
          <div
            onClick={() => setActiveDropdown(activeDropdown === "where" ? null : "where")}
            className={`cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm transition-colors ${
              activeDropdown === "where" ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500">Where?</p>
                <input
                  type="text"
                  value={searchData.destination}
                  onChange={(e) => {
                    setSearchData({ ...searchData, destination: e.target.value });
                    if (!activeDropdown) {
                      setActiveDropdown("where");
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown("where");
                  }}
                  placeholder="Destination"
                  className="w-full bg-transparent text-center font-medium text-gray-900 placeholder-gray-900 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* WHEN - Mobile */}
        <div ref={whenRefMobile} className="relative">
          <div
            onClick={() => setActiveDropdown(activeDropdown === "when" ? null : "when")}
            className={`cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm transition-colors ${
              activeDropdown === "when" ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500">When?</p>
                <p className="font-medium text-gray-900">{formatDateRange()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* WHO - Mobile */}
          <div ref={whoRefMobile} className="relative">
            <div
              onClick={() => setActiveDropdown(activeDropdown === "who" ? null : "who")}
              className={`cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm transition-colors ${
                activeDropdown === "who" ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Who?</p>
                  <p className="font-medium text-gray-900">{formatGuests()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* BUDGET - Mobile */}
          <div ref={budgetRefMobile} className="relative">
            <div
              onClick={() => setActiveDropdown(activeDropdown === "budget" ? null : "budget")}
              className={`cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm transition-colors ${
                activeDropdown === "budget" ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Budget</p>
                  <p className="text-lg font-bold text-gray-900">{getBudgetLabel()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <motion.button
          onClick={handleSearch}
          disabled={isSearchDisabled}
          whileHover={{ scale: isSearchDisabled ? 1 : 1.02 }}
          whileTap={{ scale: isSearchDisabled ? 1 : 0.98 }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Search className="h-5 w-5" />
          <span>{loading ? "Generating..." : "Generate Itinerary"}</span>
        </motion.button>
      </div>

      {/* Dropdown Portal - renders dropdowns in document.body with fixed positioning */}
      {mounted && activeDropdown && createPortal(
        <AnimatePresence>
          <div
            style={{
              position: "fixed",
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width || "auto",
              zIndex: 99999,
            }}
          >
            {renderDropdownContent()}
          </div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

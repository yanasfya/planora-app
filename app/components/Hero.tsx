"use client";

import { motion } from "framer-motion";
import {
  Search,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Sparkles,
  Heart,
  Palmtree,
  UtensilsCrossed,
  Mountain,
  Palette,
  ShoppingBag,
} from "lucide-react";
import { useState } from "react";
import type { Prefs } from "@lib/types";
import Modal from "./Modal";

interface HeroProps {
  onGenerate: (prefs: Prefs) => void;
  loading: boolean;
}

type GroupType = "Solo" | "Couple" | "Family" | "Friends";
type BudgetType = "low" | "medium" | "high";

interface Interest {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function Hero({ onGenerate, loading }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [groupType, setGroupType] = useState<GroupType>("Solo");
  const [budget, setBudget] = useState<BudgetType>("medium");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Culture", "Food"]);

  const [showDatesModal, setShowDatesModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showInterestsModal, setShowInterestsModal] = useState(false);

  const interests: Interest[] = [
    { id: "Culture", label: "Culture", icon: Palette },
    { id: "Food", label: "Food", icon: UtensilsCrossed },
    { id: "Nature", label: "Nature", icon: Mountain },
    { id: "Adventure", label: "Adventure", icon: Mountain },
    { id: "Relaxation", label: "Relaxation", icon: Heart },
    { id: "Art", label: "Art", icon: Palette },
    { id: "Beach", label: "Beach", icon: Palmtree },
    { id: "Shopping", label: "Shopping", icon: ShoppingBag },
  ];

  const popularDestinations = ["Tokyo", "Paris", "New York", "Barcelona", "Bali"];

  const budgetOptions = [
    { value: "low" as const, label: "Budget", description: "$50-100/day" },
    { value: "medium" as const, label: "Moderate", description: "$100-250/day" },
    { value: "high" as const, label: "Luxury", description: "$250+/day" },
  ];

  const groupOptions: { value: GroupType; icon: string }[] = [
    { value: "Solo", icon: "👤" },
    { value: "Couple", icon: "💑" },
    { value: "Family", icon: "👨‍👩‍👧‍👦" },
    { value: "Friends", icon: "👥" },
  ];

  const getDatesDisplay = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return `${days} days`;
    }
    return "Select dates";
  };

  const getInterestsDisplay = () => {
    if (selectedInterests.length === 0) return "Add interests";
    if (selectedInterests.length <= 2) return selectedInterests.join(" & ");
    return `${selectedInterests.length} selected`;
  };

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleGenerate = () => {
    if (!searchQuery.trim()) return;

    const today = new Date();
    const defaultStart = new Date(today);
    defaultStart.setDate(today.getDate() + 7);
    const defaultEnd = new Date(defaultStart);
    defaultEnd.setDate(defaultStart.getDate() + 3);

    const prefs: Prefs = {
      destination: searchQuery.trim(),
      startDate: startDate || defaultStart.toISOString().split("T")[0],
      endDate: endDate || defaultEnd.toISOString().split("T")[0],
      budget,
      interests: selectedInterests,
      numberOfTravelers: 1,
      numberOfAdults: 1,
      numberOfChildren: 0,
    };

    onGenerate(prefs);
  };

  const handleDestinationClick = (destination: string) => {
    setSearchQuery(destination);
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

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.header
          className="mb-16 text-center"
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
          className="mx-auto max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            className="mb-8 rounded-2xl bg-white p-4 shadow-xl transition-shadow hover:shadow-2xl"
            animate={{ scale: isFocused ? 1.02 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-4">
              <Search className="h-6 w-6 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="Where do you want to travel?"
                className="flex-1 bg-transparent text-lg outline-none placeholder:text-gray-400"
                disabled={loading}
              />
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
                onClick={handleGenerate}
                disabled={loading || !searchQuery.trim()}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Generating..." : "Generate"}
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDatesModal(true)}
              className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-md transition-shadow hover:shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <div className="rounded-full bg-blue-100 p-3">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-gray-500">Dates</p>
                <p className="text-sm font-semibold text-gray-900">{getDatesDisplay()}</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowGroupModal(true)}
              className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-md transition-shadow hover:shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <div className="rounded-full bg-blue-100 p-3">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-gray-500">Group</p>
                <p className="text-sm font-semibold text-gray-900">{groupType}</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowBudgetModal(true)}
              className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-md transition-shadow hover:shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <div className="rounded-full bg-blue-100 p-3">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-gray-500">Budget</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">{budget}</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowInterestsModal(true)}
              className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-md transition-shadow hover:shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <div className="rounded-full bg-blue-100 p-3">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-gray-500">Interests</p>
                <p className="text-sm font-semibold text-gray-900">{getInterestsDisplay()}</p>
              </div>
            </motion.button>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <p className="mb-4 text-sm font-medium text-gray-600">Popular Destinations</p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularDestinations.map((destination, index) => (
                <motion.button
                  key={destination}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDestinationClick(destination)}
                  disabled={loading}
                  className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-blue-50 hover:text-blue-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 1.0 + index * 0.1 }}
                >
                  {destination}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>

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

      <Modal isOpen={showDatesModal} onClose={() => setShowDatesModal(false)} title="Select Dates">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <button
            onClick={() => setShowDatesModal(false)}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Confirm
          </button>
        </div>
      </Modal>

      <Modal isOpen={showGroupModal} onClose={() => setShowGroupModal(false)} title="Select Group Type">
        <div className="grid grid-cols-2 gap-3">
          {groupOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setGroupType(option.value);
                setShowGroupModal(false);
              }}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                groupType === option.value
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <span className="text-3xl">{option.icon}</span>
              <span className="font-medium text-gray-900">{option.value}</span>
            </button>
          ))}
        </div>
      </Modal>

      <Modal isOpen={showBudgetModal} onClose={() => setShowBudgetModal(false)} title="Select Budget">
        <div className="space-y-3">
          {budgetOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setBudget(option.value);
                setShowBudgetModal(false);
              }}
              className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                budget === option.value
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="font-semibold text-gray-900">{option.label}</div>
              <div className="text-sm text-gray-600">{option.description}</div>
            </button>
          ))}
        </div>
      </Modal>

      <Modal isOpen={showInterestsModal} onClose={() => setShowInterestsModal(false)} title="Select Interests">
        <div className="mb-4 grid grid-cols-2 gap-3">
          {interests.map((interest) => {
            const Icon = interest.icon;
            const isSelected = selectedInterests.includes(interest.id);
            return (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all ${
                  isSelected
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <Icon className={`h-6 w-6 ${isSelected ? "text-blue-600" : "text-gray-600"}`} />
                <span className={`text-sm font-medium ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                  {interest.label}
                </span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setShowInterestsModal(false)}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Confirm ({selectedInterests.length} selected)
        </button>
      </Modal>
    </div>
  );
}

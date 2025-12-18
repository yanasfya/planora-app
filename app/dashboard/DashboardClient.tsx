"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Trash2,
  ExternalLink,
  Clock,
  Bookmark,
  MapPin,
} from "lucide-react";
import { getDestinationImage, getDestinationGradient } from "@/app/lib/destinationImages";

interface Itinerary {
  _id: string;
  prefs: {
    destination: string;
    startDate: string;
    endDate: string;
    budget: string;
    interests: string[];
  };
  currency: string;
  status: "draft" | "saved";
  expiresAt?: string;
  createdAt: string;
}

interface DashboardClientProps {
  userId: string;
  userName: string;
}


export default function DashboardClient({
  userName,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"drafts" | "saved">("drafts");
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this itinerary?")) return;

    try {
      const response = await fetch(`/api/itineraries/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItineraries((prev) => prev.filter((i) => i._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete itinerary:", error);
    }
  };

  const getDaysUntilExpiry = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const days = Math.ceil(
      (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days > 0 ? days : 0;
  };

  const drafts = itineraries.filter((i) => i.status === "draft");
  const saved = itineraries.filter((i) => i.status === "saved");
  const displayedItineraries = activeTab === "drafts" ? drafts : saved;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your itineraries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-8 py-8">
        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("drafts")}
            className={`relative px-6 py-3 font-medium transition-colors ${
              activeTab === "drafts"
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Drafts ({drafts.length})
            {activeTab === "drafts" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`relative px-6 py-3 font-medium transition-colors ${
              activeTab === "saved"
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Saved ({saved.length})
            {activeTab === "saved" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
        </div>

        {/* Empty State */}
        {displayedItineraries.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white py-16 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            {activeTab === "drafts" ? (
              <>
                <Clock className="mb-4 h-16 w-16 text-gray-400 dark:text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  No drafts yet
                </h3>
                <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
                  Generated itineraries will appear here as drafts.
                  <br />
                  Review them and save the ones you love!
                </p>
              </>
            ) : (
              <>
                <Bookmark className="mb-4 h-16 w-16 text-gray-400 dark:text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  No saved itineraries
                </h3>
                <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
                  Save your favorite itineraries to keep them forever!
                </p>
              </>
            )}
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Create Your First Itinerary
              </motion.button>
            </Link>
          </motion.div>
        )}

        {/* Itinerary Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {displayedItineraries.map((itinerary, index) => {
              const daysUntilExpiry = getDaysUntilExpiry(itinerary.expiresAt);

              return (
                <motion.div
                  key={itinerary._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="group overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-xl dark:bg-gray-800"
                >
                  {/* Destination Image */}
                  <div className="relative h-48 overflow-hidden">
                    {getDestinationImage(itinerary.prefs.destination) ? (
                      <Image
                        src={getDestinationImage(itinerary.prefs.destination)!}
                        alt={itinerary.prefs.destination}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <MapPin className="w-12 h-12 text-white opacity-50" />
                      </div>
                    )}
                    {/* Gradient overlay for text readability */}
                    <div className={`absolute inset-0 ${getDestinationGradient(itinerary.prefs.destination)} opacity-40`} />

                    {/* Status Badge */}
                    {activeTab === "drafts" && daysUntilExpiry !== null && (
                      <div className="absolute right-3 top-3 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                        {daysUntilExpiry === 0
                          ? "Expires today"
                          : `${daysUntilExpiry}d left`}
                      </div>
                    )}

                    {activeTab === "saved" && (
                      <div className="absolute right-3 top-3 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                        Saved
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="line-clamp-1 text-xl font-bold text-gray-900 dark:text-white">
                      {itinerary.prefs.destination}
                    </h3>

                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(itinerary.prefs.startDate).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )}{" "}
                        -{" "}
                        {new Date(itinerary.prefs.endDate).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {itinerary.prefs.budget}
                      </span>

                      <div className="flex gap-2">
                        <Link href={`/itinerary/${itinerary._id}`}>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700"
                            title="View Itinerary"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </motion.button>
                        </Link>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(itinerary._id)}
                          className="rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                          title="Delete Itinerary"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Info Box for Drafts */}
        {activeTab === "drafts" && drafts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
          >
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium">About Drafts</p>
                <p className="mt-1">
                  Drafts are automatically saved for 7 days. Click &quot;Save
                  Permanently&quot; on any itinerary to keep it forever!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface SaveButtonProps {
  itineraryId: string;
  initialStatus?: "draft" | "saved";
  userId?: string | null;
}

export default function SaveButton({
  itineraryId,
  initialStatus = "draft",
  userId,
}: SaveButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // If not signed in, store itinerary ID and redirect to sign in
    if (!session?.user) {
      // Store itinerary ID in localStorage for claiming after sign-in
      if (typeof window !== 'undefined') {
        localStorage.setItem('planora_pending_claim', itineraryId);
      }
      // Redirect to signin page with callback URL to return to this itinerary
      router.push(`/signin?callbackUrl=${encodeURIComponent(`/itinerary/${itineraryId}`)}`);
      return;
    }

    setLoading(true);
    try {
      // If this is a guest itinerary, claim it first
      if (!userId) {
        const claimResponse = await fetch("/api/itineraries/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itineraryId }),
        });

        if (!claimResponse.ok) {
          throw new Error("Failed to claim itinerary");
        }
      }

      // Update status to 'saved' and remove expiry
      const response = await fetch(`/api/itineraries/${itineraryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "saved",
          expiresAt: null,
        }),
      });

      if (response.ok) {
        setStatus("saved");
        // Dispatch custom event to show success toast
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('itinerary-claimed', {
            detail: { itineraryId }
          }));
        }
      } else {
        throw new Error("Failed to save itinerary");
      }
    } catch (error) {
      console.error("Failed to save itinerary:", error);
      alert("Failed to save itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // If already saved, show saved state
  if (status === "saved") {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-green-700 dark:bg-green-900/20 dark:text-green-400"
      >
        <BookmarkCheck className="h-4 w-4" />
        <span className="text-sm font-medium">Saved</span>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleSave}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
    >
      <Bookmark className="h-4 w-4" />
      <span>
        {loading
          ? "Saving..."
          : session?.user
            ? "Save"
            : "Sign in to Save"}
      </span>
    </motion.button>
  );
}

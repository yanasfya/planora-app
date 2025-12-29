"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ItinerarySchema, type Itinerary } from "@lib/types";
import { ArrowLeft, Loader2, Share2, Download, Plus, Lightbulb, CheckCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import DayCard from "../../components/widgets/DayCard";
import WeatherWidget from "../../components/widgets/WeatherWidget";
import PrayerTimesWidget from "../../components/widgets/PrayerTimesWidget";
import MapWidget from "../../components/widgets/MapWidget";
import HotelWidget from "../../components/widgets/HotelWidget";
import BudgetWidget from "../../components/widgets/BudgetWidget";
import CurrencySelector from "../../components/CurrencySelector";
import SaveButton from "../../components/itinerary/SaveButton";
import ShareModal from "../../components/itinerary/ShareModal";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useSession } from "next-auth/react";
import { generateItineraryPDF } from "@lib/pdfExport";
import { ItineraryEditProvider, useItineraryEdit } from "../../contexts/ItineraryEditContext";
import EditModeHeader from "../../components/itinerary/EditModeHeader";
import EditableDayCard from "../../components/itinerary/EditableDayCard";
import { useCurrency } from "../../contexts/CurrencyContext";
import PreferenceSummary from "../../components/itinerary/PreferenceSummary";
import { detectCurrencyFromDestination } from "@/lib/currency";

export default function ItineraryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { setAutoDetectedCurrency } = useCurrency();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [itineraryUserId, setItineraryUserId] = useState<string | null>(null);
  const [itineraryStatus, setItineraryStatus] = useState<"draft" | "saved">("draft");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        console.log('[Frontend] Fetching itinerary:', params.id);
        const response = await fetch(`/api/itineraries/${params.id}`);
        console.log('[Frontend] Response status:', response.status, response.ok);

        if (!response.ok) {
          console.error('[Frontend] Response not OK:', response.status);
          setError("Itinerary not found");
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log('[Frontend] Data received:', data);
        console.log('[Frontend] Data.days:', data.days);
        console.log('[Frontend] First activity sample:', data.days?.[0]?.activities?.[0]);

        // Store the userId and status from the response before validation
        setItineraryUserId(data.userId || null);
        setItineraryStatus(data.status || "draft");

        console.log('[Frontend] Validating with ItinerarySchema...');
        const validationResult = ItinerarySchema.safeParse(data);

        if (!validationResult.success) {
          console.warn('[Frontend] Validation failed, using data anyway:', validationResult.error);
          // Use the data anyway - backend is trusted
          setItinerary(data as Itinerary);
        } else {
          console.log('[Frontend] Validation successful!');
          setItinerary(validationResult.data);
        }
      } catch (err) {
        console.error('[Frontend] ERROR loading itinerary:', err);
        console.error('[Frontend] Error details:', err instanceof Error ? err.message : String(err));
        if (err instanceof Error) {
          console.error('[Frontend] Error stack:', err.stack);
        }
        setError("Failed to load itinerary");
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [params.id]);

  // Auto-detect currency from destination when itinerary loads
  useEffect(() => {
    if (itinerary?.prefs?.destination) {
      const detected = detectCurrencyFromDestination(itinerary.prefs.destination);
      console.log('[Itinerary Page] Auto-detecting currency for', itinerary.prefs.destination, '→', detected);
      setAutoDetectedCurrency(detected);
    }
  }, [itinerary?.prefs?.destination, setAutoDetectedCurrency]);

  // Listen for claim success event from SaveButton
  useEffect(() => {
    const handleClaimSuccess = (event: CustomEvent) => {
      if (event.detail?.itineraryId === params.id) {
        setItineraryUserId(session?.user?.id || null);
        setItineraryStatus("saved"); // Update status so SaveButton shows green after remount
        setClaimMessage('Itinerary saved to your account!');
        // Clear message after 5 seconds
        setTimeout(() => setClaimMessage(null), 5000);
      }
    };

    window.addEventListener('itinerary-claimed' as any, handleClaimSuccess);
    return () => {
      window.removeEventListener('itinerary-claimed' as any, handleClaimSuccess);
    };
  }, [params.id, session?.user?.id]);

  const handleExportPDF = async () => {
    if (!itinerary) return;

    setIsExportingPDF(true);
    try {
      const pdfBlob = await generateItineraryPDF(itinerary);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${itinerary.prefs.destination.replace(/[^a-z0-9]/gi, '_')}_Itinerary.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleSaveItinerary = async (editedDays: any[]) => {
    try {
      console.log('[Itinerary Page] Saving itinerary with edited days:', editedDays);

      const response = await fetch(`/api/itineraries/${params.id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days: editedDays }),
      });

      if (!response.ok) {
        throw new Error('Failed to save itinerary');
      }

      const result = await response.json();
      console.log('[Itinerary Page] Save successful:', result);

      // Update local state with saved data
      setItinerary((prev) => prev ? { ...prev, days: editedDays } : null);
    } catch (error) {
      console.error('[Itinerary Page] Save failed:', error);
      throw error;
    }
  };

  // Loading state
  if (loading || status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading itinerary...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !itinerary) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {error || "Itinerary not found"}
          </h1>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            The itinerary you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  const totalActivities = itinerary.days.reduce(
    (acc, day) => acc + day.activities.length,
    0
  );

  // Inner component that uses edit context
  const ItineraryContentInner = () => {
    const { editedDays } = useItineraryEdit();

    // Use edited days if available, otherwise use original
    const displayDays = editedDays.length > 0 ? editedDays : itinerary.days;

    // Handler wrapper that has access to context
    const handleSaveWrapper = async () => {
      await handleSaveItinerary(editedDays);
    };

    return (
      <ItineraryContentComponent displayDays={displayDays} onSave={handleSaveWrapper} />
    );
  };

  // Content component to avoid duplication
  const ItineraryContentComponent = ({ displayDays, onSave }: { displayDays: any[]; onSave?: () => Promise<void> }) => {
    const { getActiveCurrency } = useCurrency();
    const selectedCurrency = getActiveCurrency();
    const { isEditMode } = useItineraryEdit();

    return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Success toast for claimed itinerary */}
      <AnimatePresence>
        {claimMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg"
          >
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">{claimMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header - only show for guests */}
      {!session && (
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  {itinerary.prefs.destination}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {itinerary.prefs.startDate} - {itinerary.prefs.endDate}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/">
                  <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">New Itinerary</span>
                  </button>
                </Link>
                <SaveButton
                  itineraryId={params.id}
                  initialStatus={itineraryStatus}
                  userId={itineraryUserId}
                />
                <CurrencySelector variant="inline" showLabel={false} />
                <button
                  onClick={() => setShowShareModal(true)}
                  className="hidden items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 sm:inline-flex"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Title and Actions for logged-in users */}
        {session && (
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {itinerary.prefs.destination}
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {itinerary.prefs.startDate} - {itinerary.prefs.endDate}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {itinerary.prefs.budget}
                </span>
                {itinerary.prefs.interests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons - Stack on mobile, flex wrap on larger screens */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Edit Mode: Show full-width Edit controls */}
              {session && onSave && isEditMode ? (
                <div className="w-full sm:w-auto">
                  <EditModeHeader
                    itineraryId={params.id}
                    onSave={onSave}
                  />
                </div>
              ) : (
                <>
                  {/* Row 1: Edit and Save */}
                  <div className="flex gap-2 sm:contents">
                    {session && onSave && (
                      <div className="flex-1 sm:flex-initial">
                        <EditModeHeader
                          itineraryId={params.id}
                          onSave={onSave}
                        />
                      </div>
                    )}
                    <div className="flex-1 sm:flex-initial">
                      <SaveButton
                        itineraryId={params.id}
                        initialStatus={itineraryStatus}
                        userId={itineraryUserId}
                      />
                    </div>
                  </div>

                  {/* Row 2: Currency and Share */}
                  <div className="flex gap-2 sm:contents">
                    <div className="flex-1 sm:flex-initial">
                      <CurrencySelector variant="inline" showLabel={false} />
                    </div>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 min-h-[44px] text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                  </div>

                  {/* Row 3: Export PDF */}
                  <button
                    onClick={handleExportPDF}
                    disabled={isExportingPDF}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 min-h-[44px] text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExportingPDF ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Export PDF
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Mobile title for guests */}
        {!session && (
          <div className="mb-6 md:hidden">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {itinerary.prefs.destination}
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {itinerary.prefs.startDate} - {itinerary.prefs.endDate}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {itinerary.prefs.budget}
              </span>
              {itinerary.prefs.interests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Guest tip banner */}
        {!session && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
          >
            <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Tip:</strong> Sign in to save this itinerary, export as PDF, and access it from any device!
            </p>
          </motion.div>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
          <div className="space-y-4 sm:space-y-6 lg:col-span-8">
            {/* Preference Summary - Show dietary and accessibility preferences */}
            <PreferenceSummary
              dietaryPreferences={itinerary.prefs.dietaryPreferences}
              specialRequirements={itinerary.prefs.specialRequirements}
            />

            {/* Prayer Times Widget - Only show if Halal preference is enabled */}
            {itinerary.prefs?.dietaryPreferences?.halal && (
              <div className="rounded-xl bg-white p-4 shadow-md dark:bg-gray-800 sm:p-6">
                <PrayerTimesWidget
                  startDate={itinerary.prefs.startDate}
                  endDate={itinerary.prefs.endDate}
                  destinationName={itinerary.prefs.destination}
                  latitude={itinerary.days[0]?.activities[0]?.coordinates?.lat || itinerary.days[0]?.activities[0]?.lat || 0}
                  longitude={itinerary.days[0]?.activities[0]?.coordinates?.lng || itinerary.days[0]?.activities[0]?.lng || 0}
                />
              </div>
            )}

            <div className="rounded-xl bg-white p-4 shadow-md dark:bg-gray-800 sm:p-6">
              <WeatherWidget destination={itinerary.prefs.destination} />
            </div>

            {/* Show EditableDayCard if session exists, otherwise regular DayCard */}
            {session ? (
              <EditableDayCard
                days={displayDays}
                startDate={itinerary.prefs.startDate}
                destination={itinerary.prefs.destination}
                checkInDate={itinerary.prefs.startDate}
                checkOutDate={itinerary.prefs.endDate}
              />
            ) : (
              displayDays.map((day) => (
                <DayCard
                  key={day.day}
                  day={day}
                  destination={itinerary.prefs.destination}
                  checkInDate={itinerary.prefs.startDate}
                  checkOutDate={itinerary.prefs.endDate}
                  currency={selectedCurrency}
                />
              ))
            )}
          </div>

          <div className="space-y-4 sm:space-y-6 lg:col-span-4">
            <div className="scrollbar-thin space-y-4 sm:space-y-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pb-4">
              <BudgetWidget
                days={displayDays}
                hotelPricePerNight={120}
                numberOfTravelers={itinerary.prefs.numberOfTravelers || 1}
                selectedCurrency={selectedCurrency}
              />

              <div className="rounded-xl bg-white p-4 shadow-md dark:bg-gray-800">
                <MapWidget
                  destination={itinerary.prefs.destination}
                  activityCount={totalActivities}
                  days={itinerary.days}
                  itineraryId={params.id}
                />
              </div>

              <div className="rounded-xl bg-white shadow-md dark:bg-gray-800">
                <HotelWidget
                  destination={itinerary.prefs.destination}
                  budget={itinerary.prefs.budget}
                  checkInDate={itinerary.prefs.startDate}
                  checkOutDate={itinerary.prefs.endDate}
                  guests={itinerary.prefs.numberOfTravelers || 2}
                  adults={itinerary.prefs.numberOfAdults || itinerary.prefs.numberOfTravelers || 2}
                  children={itinerary.prefs.numberOfChildren || 0}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  };

  // Wrap in DashboardLayout for logged-in users
  if (session) {
    return (
      <ItineraryEditProvider initialDays={itinerary.days}>
        <DashboardLayout
          userName={session.user?.name || "Traveler"}
          userEmail={session.user?.email || ""}
          userImage={session.user?.image || undefined}
        >
          <ItineraryContentInner />
        </DashboardLayout>
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          itineraryId={params.id}
          destination={itinerary.prefs.destination}
        />
      </ItineraryEditProvider>
    );
  }

  // Guest users see itinerary without sidebar (no edit mode for guests)
  // Still need ItineraryEditProvider because ItineraryContentComponent uses useItineraryEdit
  return (
    <ItineraryEditProvider initialDays={itinerary.days}>
      <ItineraryContentComponent displayDays={itinerary.days} />
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        itineraryId={params.id}
        destination={itinerary.prefs.destination}
      />
    </ItineraryEditProvider>
  );
}

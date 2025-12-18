"use client";

import { useCurrency } from "@/app/contexts/CurrencyContext";
import { CURRENCIES } from "@/lib/currency";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const { globalCurrency, setGlobalCurrency } = useCurrency();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push("/")}
          className="mb-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-medium text-gray-700 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        <h1 className="mb-8 text-3xl font-bold text-gray-900">Settings</h1>

        <div className="mb-6 overflow-hidden rounded-xl bg-white shadow-md">
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white p-6">
            <h2 className="text-xl font-semibold text-gray-900">Currency Preferences</h2>
            <p className="mt-2 text-sm text-gray-600">
              Set your preferred currency for hotel prices and budgets. This can be overridden on
              individual itinerary pages.
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-2">
              {Object.entries(CURRENCIES).map(([code, curr]) => (
                <label
                  key={code}
                  className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-all hover:bg-gray-50 ${
                    globalCurrency === code
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="currency"
                    value={code}
                    checked={globalCurrency === code}
                    onChange={(e) => setGlobalCurrency(e.target.value)}
                    className="h-5 w-5 cursor-pointer text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-700">{curr.symbol}</span>
                      <span className="font-semibold text-gray-900">{curr.code}</span>
                    </div>
                    <div className="text-sm text-gray-600">{curr.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-500">Exchange Rate</div>
                    <div className="text-sm text-gray-600">
                      1 USD = {curr.rate} {code}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border-2 border-blue-200 bg-blue-50 p-6">
          <div className="flex gap-3">
            <div className="text-2xl">i</div>
            <div className="flex-1">
              <h3 className="mb-2 font-semibold text-blue-900">How Currency Selection Works</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>
                    <strong>Auto-detection:</strong> Planora automatically detects the currency
                    based on your destination (e.g., Jakarta to IDR, Paris to EUR)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>
                    <strong>Per-itinerary override:</strong> You can change the currency using the
                    dropdown on any itinerary page
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>
                    <strong>Global default:</strong> The currency you select here will be used as
                    the default for all new itineraries
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/")}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
          >
            Save & Return Home
          </button>
        </div>
      </div>
    </main>
  );
}

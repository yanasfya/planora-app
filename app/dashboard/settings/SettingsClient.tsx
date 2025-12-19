"use client";

import { useState } from "react";
import { User, Bell, Globe, Palette } from "lucide-react";
import { useTheme } from "@/app/contexts/ThemeContext";
import { CURRENCIES } from "@/lib/currency";

interface SettingsClientProps {
  userName: string;
  userEmail: string;
  userImage: string;
}

export default function SettingsClient({
  userName,
  userEmail,
}: SettingsClientProps) {
  const { theme, setTheme } = useTheme();
  const [currency, setCurrency] = useState("USD");
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-8 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>

        <div className="space-y-6">
          {/* Profile Section */}
          <section className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-3">
              <User className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Profile
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  value={userName}
                  disabled
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={userEmail}
                  disabled
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </section>

          {/* Appearance Section */}
          <section className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-3">
              <Palette className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Appearance
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Theme
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex-1 rounded-lg border-2 p-4 transition-all ${
                      theme === "light"
                        ? "border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
                        : "border-gray-300 bg-white hover:border-gray-400 dark:border-gray-600 dark:bg-gray-700"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500">
                        <svg
                          className="h-6 w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        Light
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex-1 rounded-lg border-2 p-4 transition-all ${
                      theme === "dark"
                        ? "border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
                        : "border-gray-300 bg-white hover:border-gray-400 dark:border-gray-600 dark:bg-gray-700"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600">
                        <svg
                          className="h-6 w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                          />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        Dark
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-3">
              <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Preferences
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Default Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {Object.entries(CURRENCIES).map(([code, curr]) => (
                    <option key={code} value={code}>
                      {code} - {curr.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-3">
              <Bell className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h2>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">
                Email Notifications
              </span>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Map,
  Settings,
  Moon,
  Sun,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Plane,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useTheme } from "@/app/contexts/ThemeContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  userImage?: string;
}

interface MenuItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
  active: boolean;
  comingSoon?: boolean;
  badge?: string | number;
}

export default function DashboardLayout({
  children,
  userName,
  userEmail,
  userImage,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const menuItems: MenuItem[] = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      icon: Map,
      label: "My Itineraries",
      href: "/dashboard/itineraries",
      active: pathname === "/dashboard/itineraries",
    },
    {
      icon: MessageSquare,
      label: "Planora Chat",
      href: "/dashboard/chat",
      active: pathname === "/dashboard/chat",
      comingSoon: true,
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
    },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 280 }}
        className="relative flex flex-col border-r border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
      >
        {/* Logo & Tagline */}
        <div className="flex h-20 items-center justify-between border-b border-gray-200 px-6 dark:border-gray-700">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
                    Planora
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">AI Travel Planning</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.comingSoon ? "#" : item.href}
                className={`
                  group relative flex items-center gap-3 rounded-lg px-3 py-3 transition-all
                  ${
                    item.active
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }
                  ${item.comingSoon ? "cursor-not-allowed opacity-60" : ""}
                `}
                onClick={(e) => item.comingSoon && e.preventDefault()}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />

                <AnimatePresence>
                  {!isSidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex flex-1 items-center justify-between"
                    >
                      <span className="font-medium">{item.label}</span>
                      {item.comingSoon && (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                          Soon
                        </span>
                      )}
                      {item.badge && !item.comingSoon && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed state */}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-2 hidden whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-sm text-white group-hover:block">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`
              mb-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors
              ${isSidebarCollapsed ? "justify-center" : "justify-start"}
              hover:bg-gray-100 dark:hover:bg-gray-700
            `}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            )}
            {!isSidebarCollapsed && (
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {theme === "dark" ? "Light" : "Dark"} Mode
              </span>
            )}
          </button>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className={`
                flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-blue-500 dark:hover:bg-gray-600
                ${isSidebarCollapsed ? "justify-center" : ""}
              `}
            >
              {userImage ? (
                <Image
                  src={userImage}
                  alt={userName}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {userName.charAt(0)}
                </div>
              )}

              {!isSidebarCollapsed && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">{userEmail}</p>
                </div>
              )}
            </button>

            {/* User Dropdown */}
            <AnimatePresence>
              {showUserDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-700"
                >
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Collapse Toggle - Aligned with logo */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-8 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

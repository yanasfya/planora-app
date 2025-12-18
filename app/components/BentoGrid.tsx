"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface BentoGridProps {
  children: ReactNode;
}

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  gridArea?: string;
}

export function BentoGrid({ children }: BentoGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-6 lg:gap-6">
      {children}
    </div>
  );
}

export function BentoCard({ children, className = "", gridArea }: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className={`group rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl ${className}`}
      style={gridArea ? { gridArea } : undefined}
    >
      {children}
    </motion.div>
  );
}

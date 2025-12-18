"use client";

import { motion } from "framer-motion";
import DestinationCard from "./DestinationCard";

interface Destination {
  id: string;
  city: string;
  country: string;
}

interface DestinationSectionProps {
  title: string;
  subtitle?: string;
  destinations: Destination[];
  onDestinationClick: (destination: string) => void;
}

export default function DestinationSection({
  title,
  subtitle,
  destinations,
  onDestinationClick,
}: DestinationSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {destinations.map((destination, index) => (
          <motion.div
            key={destination.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <DestinationCard
              city={destination.city}
              country={destination.country}
              onClick={() => onDestinationClick(`${destination.city}, ${destination.country}`)}
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

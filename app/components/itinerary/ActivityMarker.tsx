"use client";

import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { motion } from "framer-motion";

interface ActivityMarkerProps {
  position: { lat: number; lng: number };
  color: string;
  label: string | number;
  onClick?: () => void;
}

export default function ActivityMarker({
  position,
  color,
  label,
  onClick,
}: ActivityMarkerProps) {
  return (
    <AdvancedMarker position={position} onClick={onClick}>
      <motion.div
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full shadow-lg transition-shadow hover:shadow-xl"
        style={{ backgroundColor: color }}
      >
        <span className="text-sm font-bold text-white">{label}</span>
      </motion.div>
    </AdvancedMarker>
  );
}

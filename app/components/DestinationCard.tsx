"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { getUnsplashImage } from "@/lib/unsplash";

interface DestinationCardProps {
  city: string;
  country: string;
  onClick: () => void;
}

export default function DestinationCard({
  city,
  country,
  onClick,
}: DestinationCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-2xl"
    >
      <div className="relative h-48 w-full">
        <Image
          src={getUnsplashImage(city)}
          alt={`${city}, ${country}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="text-xl font-bold drop-shadow-lg">{city}</h3>
        <p className="text-sm opacity-90 drop-shadow">{country}</p>
      </div>
    </motion.div>
  );
}

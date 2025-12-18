'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ArrowRight, Star } from 'lucide-react';

interface DestinationCardProps {
  name: string;
  country: string;
  image: string;
  rating?: number;
  bestTime?: string;
  duration?: string;
  onClick?: () => void;
}

export default function DestinationCard({
  name,
  country,
  image,
  rating = 4.8,
  bestTime = 'Year-round',
  duration = '5-7 days',
  onClick,
}: DestinationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg">
        {/* Image */}
        {!imageError ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-white/50" />
          </div>
        )}

        {/* Default Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Hover Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/50 to-blue-900/30"
        />

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-sm">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{rating}</span>
        </div>

        {/* Default Content - Always visible */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <motion.div
            animate={{ y: isHovered ? -48 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-bold text-white mb-0.5">{name}</h3>
            <p className="text-white/80 text-sm mb-1.5">{country}</p>
            {/* Quick Info - Always visible */}
            <div className="flex items-center gap-3 text-white/70 text-xs">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🌤</span>
                <span>{bestTime}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Hover Content - Plan Trip Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 right-0 p-4"
        >
          {/* Plan Trip Button */}
          <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors">
            <span>Plan Trip</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

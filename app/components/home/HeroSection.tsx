'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface HeroSectionProps {
  children?: React.ReactNode; // For the search form
}

export default function HeroSection({ children }: HeroSectionProps) {
  return (
    <section className="relative min-h-[500px] sm:min-h-[600px] flex flex-col items-center justify-center overflow-hidden">
      {/* Background with Gradient Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900" />

        {/* Animated gradient orbs - responsive sizes */}
        <div className="absolute top-0 left-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-blue-500/30 rounded-full blur-[80px] sm:blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[350px] h-[350px] sm:w-[600px] sm:h-[600px] bg-purple-500/30 rounded-full blur-[80px] sm:blur-[120px] animate-pulse" style={{ animationDelay: '1000ms' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] bg-indigo-500/20 rounded-full blur-[60px] sm:blur-[100px] animate-pulse" style={{ animationDelay: '500ms' }} />

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8 sm:py-12 text-center">
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 sm:mb-6"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4">
            <span className="text-white">Plan</span>
            <span className="text-blue-400">ora</span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-blue-200">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-lg">AI-powered travel planning made simple</span>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-blue-100/80 max-w-2xl mx-auto mb-6 sm:mb-10 px-2"
        >
          Plan your perfect trip in seconds with artificial intelligence
          that understands your travel style, preferences, and dreams.
        </motion.p>

        {/* Search Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative z-50 w-full max-w-4xl mx-auto"
        >
          {children}
        </motion.div>

      </div>
    </section>
  );
}

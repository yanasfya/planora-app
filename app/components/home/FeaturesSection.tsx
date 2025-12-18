'use client';

import { motion } from 'framer-motion';
import {
  Sparkles,
  Target,
  Calendar,
  Globe,
  Shield,
  Smartphone
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered',
    description: 'Advanced AI creates personalized itineraries tailored to your preferences in seconds.',
    color: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    icon: Target,
    title: 'Smart Planning',
    description: 'Optimized schedules with logical activity flow, travel times, and local insights.',
    color: 'from-purple-500 to-pink-500',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
  {
    icon: Calendar,
    title: 'Flexible Dates',
    description: 'Plan trips for any duration with customizable preferences and real-time updates.',
    color: 'from-green-500 to-emerald-500',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500',
  },
  {
    icon: Globe,
    title: 'Halal-Friendly',
    description: 'Prayer times, nearby mosques, and halal restaurant recommendations included.',
    color: 'from-orange-500 to-amber-500',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
  },
  {
    icon: Shield,
    title: 'Accessibility',
    description: 'Wheelchair accessible venues and activities for travelers with special needs.',
    color: 'from-teal-500 to-cyan-500',
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-500',
  },
  {
    icon: Smartphone,
    title: 'Mobile Ready',
    description: 'Access your itineraries anywhere with our responsive, mobile-friendly design.',
    color: 'from-indigo-500 to-violet-500',
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-500',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-full mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need to Plan
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Planora combines AI intelligence with practical travel features to give you
            the most comprehensive trip planning experience.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-white dark:hover:bg-gray-750 hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
              {/* Icon */}
              <div className={`w-14 h-14 ${feature.iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

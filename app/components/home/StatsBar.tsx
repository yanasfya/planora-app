'use client';

import { motion } from 'framer-motion';
import { MapPin, Plane, Star, Clock } from 'lucide-react';

const stats = [
  {
    icon: MapPin,
    value: '150+',
    label: 'Destinations',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Plane,
    value: '10,000+',
    label: 'Trips Planned',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Star,
    value: '4.9',
    label: 'User Rating',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  {
    icon: Clock,
    value: '30s',
    label: 'Avg. Generate Time',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
];

export default function StatsBar() {
  return (
    <section className="relative z-10 py-8 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-4"
            >
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

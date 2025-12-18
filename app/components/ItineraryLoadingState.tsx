'use client';

import { motion } from 'framer-motion';
import { Check, Loader2, Sparkles, MapPin, UtensilsCrossed, Route, Plane } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LoadingStep {
  id: string;
  label: string;
  icon: React.ElementType;
  estimatedDuration: number; // in seconds
}

const LOADING_STEPS: LoadingStep[] = [
  {
    id: 'ai-planning',
    label: 'AI is planning your perfect trip...',
    icon: Sparkles,
    estimatedDuration: 15,
  },
  {
    id: 'finding-activities',
    label: 'Finding amazing activities...',
    icon: MapPin,
    estimatedDuration: 10,
  },
  {
    id: 'meal-planning',
    label: 'Planning delicious meals...',
    icon: UtensilsCrossed,
    estimatedDuration: 15,
  },
  {
    id: 'routes',
    label: 'Calculating optimal routes...',
    icon: Route,
    estimatedDuration: 10,
  },
  {
    id: 'finalizing',
    label: 'Finalizing your itinerary...',
    icon: Plane,
    estimatedDuration: 5,
  },
];

interface ItineraryLoadingStateProps {
  destination?: string;
  duration?: number;
}

export default function ItineraryLoadingState({
  destination = 'your destination',
  duration = 3
}: ItineraryLoadingStateProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Calculate total estimated time
    const totalTime = LOADING_STEPS.reduce((sum, step) => sum + step.estimatedDuration, 0);

    // Progress interval (update every 500ms)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (totalTime * 2)); // *2 because 500ms intervals
        return Math.min(newProgress, 95); // Cap at 95% until actual completion
      });
    }, 500);

    // Step progression interval
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prevIndex) => {
        if (prevIndex < LOADING_STEPS.length - 1) {
          setCompletedSteps((prev) => [...prev, LOADING_STEPS[prevIndex].id]);
          return prevIndex + 1;
        }
        return prevIndex;
      });
    }, (totalTime / LOADING_STEPS.length) * 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  const currentStep = LOADING_STEPS[currentStepIndex];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 z-[9999] flex items-center justify-center p-4">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
            }}
            animate={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Main loading card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 md:p-12 max-w-2xl w-full mx-4"
      >
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="inline-block mb-3 sm:mb-4"
          >
            <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500" />
          </motion.div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Creating Your Adventure
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Planning an amazing {duration}-day trip to <span className="font-semibold text-blue-600 dark:text-blue-400">{destination}</span>
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Overall Progress
            </span>
            <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Loading steps */}
        <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
          {LOADING_STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStepIndex === index;
            const StepIcon = step.icon;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-600'
                    : isCompleted
                    ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700'
                    : 'bg-gray-50 dark:bg-gray-700/30 border-2 border-transparent'
                }`}
              >
                {/* Icon/Status indicator */}
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </motion.div>
                  ) : isCurrent ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                      <Loader2 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </motion.div>
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <StepIcon className="w-4 h-4 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Step label */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm sm:text-base font-medium truncate ${
                      isCurrent
                        ? 'text-blue-900 dark:text-blue-100'
                        : isCompleted
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>

                {/* Animated dots for current step */}
                {isCurrent && (
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-blue-500 rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Fun facts/tips while waiting */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800"
        >
          <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
            💡 <span className="font-semibold">Tip:</span> Your itinerary will include personalized restaurant recommendations, optimal routes, and activity booking links!
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

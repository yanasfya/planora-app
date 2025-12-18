'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackIcon?: React.ReactNode;
  fallbackText?: string;
  priority?: boolean;
}

export default function ImageWithFallback({
  src,
  alt,
  width = 400,
  height = 300,
  className = '',
  fallbackIcon,
  fallbackText,
  priority = false
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // If no src provided or error occurred, show fallback
  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 ${className}`}
        style={{ width: width ? `${width}px` : '100%', height: height ? `${height}px` : '100%' }}
      >
        {fallbackIcon || <ImageOff className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />}
        {fallbackText && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center px-4">
            {fallbackText}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse z-10">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-full object-cover"
        priority={priority}
        onError={() => {
          console.error(`[ImageWithFallback] Failed to load image: ${src}`);
          setHasError(true);
          setIsLoading(false);
        }}
        onLoad={() => {
          console.log(`[ImageWithFallback] Successfully loaded image: ${src}`);
          setIsLoading(false);
        }}
      />
    </div>
  );
}

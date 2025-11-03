/**
 * Image Optimization Hook
 * PATCH 542 - Client-side image optimization utilities
 */

import { useState, useEffect } from "react";
import { imageOptimizer, OptimizedImageResult } from "@/lib/images/image-optimizer";

export interface UseImageOptimizationOptions {
  quality?: number;
  format?: "webp" | "avif" | "original";
  generateBlurPlaceholder?: boolean;
}

export function useImageOptimization(
  imageUrl: string | undefined,
  options: UseImageOptimizationOptions = {}
) {
  const [result, setResult] = useState<OptimizedImageResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setResult(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    imageOptimizer
      .optimizeImage(imageUrl, options)
      .then((optimized) => {
        if (!cancelled) {
          setResult(optimized);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [imageUrl, options.quality, options.format, options.generateBlurPlaceholder]);

  return { result, isLoading, error };
}

export function useImageFormatSupport() {
  const [formats, setFormats] = useState({
    webp: false,
    avif: false,
    optimal: "jpeg" as "avif" | "webp" | "jpeg",
  });

  useEffect(() => {
    const checkSupport = async () => {
      const webp = imageOptimizer.supportsWebP();
      const avif = await imageOptimizer.supportsAVIF();
      const optimal = await imageOptimizer.getOptimalFormat();

      setFormats({ webp, avif, optimal });
    };

    checkSupport();
  }, []);

  return formats;
}

export function useImageDimensions(imageUrl: string | undefined) {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setDimensions(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    imageOptimizer
      .getImageDimensions(imageUrl)
      .then((dims) => {
        if (!cancelled) {
          setDimensions(dims);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  return { dimensions, isLoading, error };
}

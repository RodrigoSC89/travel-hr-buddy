/**
 * Image Optimization Utilities
 * Handles responsive images, lazy loading, and format detection
 * PATCH: Performance Optimization for 2Mb connections
 */

// Supported image formats in priority order
const FORMATS = ["avif", "webp", "jpg", "png"] as const;
type ImageFormat = typeof FORMATS[number];

// Image quality presets
const QUALITY_PRESETS = {
  high: { webp: 85, avif: 80, jpg: 85 },
  medium: { webp: 75, avif: 70, jpg: 75 },
  low: { webp: 60, avif: 55, jpg: 60 },
} as const;

// Responsive breakpoints
const BREAKPOINTS = [320, 480, 640, 768, 1024, 1280, 1536] as const;

/**
 * Check if browser supports a specific image format
 */
const formatSupport: Record<string, boolean | null> = {};

export const checkFormatSupport = async (format: ImageFormat): Promise<boolean> => {
  if (formatSupport[format] !== undefined && formatSupport[format] !== null) {
    return formatSupport[format] as boolean;
  }

  if (format === "jpg" || format === "png") {
    formatSupport[format] = true;
    return true;
  }

  const testImages: Record<string, string> = {
    webp: "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA",
    avif: "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKBzgABpAQ0AIIDhA",
  };

  if (!testImages[format]) {
    formatSupport[format] = false;
    return false;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      formatSupport[format] = true;
      resolve(true);
    };
    img.onerror = () => {
      formatSupport[format] = false;
      resolve(false);
    };
    img.src = testImages[format];
  });
};

/**
 * Get the best supported format
 */
export const getBestFormat = async (): Promise<ImageFormat> => {
  for (const format of FORMATS) {
    if (await checkFormatSupport(format)) {
      return format;
    }
  }
  return "jpg";
};

/**
 * Generate srcset for responsive images
 */
export const generateSrcSet = (
  baseUrl: string,
  widths: number[] = [...BREAKPOINTS]
): string => {
  return widths
    .map((width) => {
      const url = baseUrl.includes("?")
        ? `${baseUrl}&w=${width}`
        : `${baseUrl}?w=${width}`;
      return `${url} ${width}w`;
    })
    .join(", ");
};

/**
 * Generate sizes attribute for responsive images
 */
export const generateSizes = (
  defaultSize: string = "100vw",
  breakpoints: Array<{ maxWidth: number; size: string }> = []
): string => {
  const parts = breakpoints.map(
    ({ maxWidth, size }) => `(max-width: ${maxWidth}px) ${size}`
  );
  parts.push(defaultSize);
  return parts.join(", ");
};

/**
 * Get optimized image URL with parameters
 */
export const getOptimizedImageUrl = (
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: keyof typeof QUALITY_PRESETS;
    format?: ImageFormat;
  } = {}
): string => {
  const { width, height, quality = "medium", format } = options;
  const params = new URLSearchParams();

  if (width) params.set("w", width.toString());
  if (height) params.set("h", height.toString());
  if (format) params.set("f", format);
  
  const qualityValue = format && QUALITY_PRESETS[quality][format as keyof typeof QUALITY_PRESETS["medium"]];
  if (qualityValue) params.set("q", qualityValue.toString());

  const separator = url.includes("?") ? "&" : "?";
  return params.toString() ? `${url}${separator}${params.toString()}` : url;
};

/**
 * Create a placeholder for loading state
 */
export const createPlaceholder = (
  width: number,
  height: number,
  color = "#f3f4f6"
): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect fill="${color}" width="100%" height="100%"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

/**
 * Create a blur placeholder from image data
 */
export const createBlurPlaceholder = async (
  imageUrl: string,
  size = 10
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        resolve(createPlaceholder(size, size));
        return;
      }

      const aspectRatio = img.height / img.width;
      canvas.width = size;
      canvas.height = Math.round(size * aspectRatio);

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.1));
    };

    img.onerror = () => {
      resolve(createPlaceholder(size, size));
    };

    img.src = imageUrl;
  });
};

/**
 * Adaptive image quality based on network
 */
export const getAdaptiveQuality = (): keyof typeof QUALITY_PRESETS => {
  const conn = (navigator as any).connection;
  
  if (!conn) return "medium";
  
  if (conn.saveData) return "low";
  
  switch (conn.effectiveType) {
  case "slow-2g":
  case "2g":
    return "low";
  case "3g":
    return "medium";
  case "4g":
  default:
    return "high";
  }
};

/**
 * Preload critical images
 */
export const preloadImages = (urls: string[]): void => {
  urls.forEach((url) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Calculate optimal image dimensions based on container
 */
export const calculateOptimalDimensions = (
  containerWidth: number,
  aspectRatio: number,
  devicePixelRatio = window.devicePixelRatio || 1
): { width: number; height: number } => {
  // Find the closest breakpoint
  const breakpoint = BREAKPOINTS.find((bp) => bp >= containerWidth) || BREAKPOINTS[BREAKPOINTS.length - 1];
  
  // Account for device pixel ratio (capped at 2x for performance)
  const cappedDpr = Math.min(devicePixelRatio, 2);
  const width = Math.round(breakpoint * cappedDpr);
  const height = Math.round(width / aspectRatio);

  return { width, height };
};

/**
 * React hook-compatible image loader
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Check if image is in viewport
 */
export const isImageInViewport = (
  element: HTMLElement,
  threshold = 0.1
): boolean => {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  const verticalVisible =
    rect.top <= windowHeight * (1 + threshold) &&
    rect.bottom >= -windowHeight * threshold;
  const horizontalVisible =
    rect.left <= windowWidth * (1 + threshold) &&
    rect.right >= -windowWidth * threshold;

  return verticalVisible && horizontalVisible;
};

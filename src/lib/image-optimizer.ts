/**
 * Image Optimization Service
 * Automatic WebP/AVIF conversion and lazy loading for 2Mbps networks
 */

// Note: No React hook imports here - this runs before React initialization

export interface ImageOptimizationConfig {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  format: 'webp' | 'avif' | 'jpeg' | 'png';
  lazy: boolean;
}

const DEFAULT_CONFIG: ImageOptimizationConfig = {
  quality: 80,
  maxWidth: 1920,
  maxHeight: 1080,
  format: 'webp',
  lazy: true
};

const SLOW_NETWORK_CONFIG: ImageOptimizationConfig = {
  quality: 60,
  maxWidth: 800,
  maxHeight: 600,
  format: 'webp',
  lazy: true
};

/**
 * Check if browser supports WebP/AVIF
 */
export const checkImageSupport = async (): Promise<{
  webp: boolean;
  avif: boolean;
}> => {
  const checkFormat = (format: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      
      if (format === 'webp') {
        img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
      } else if (format === 'avif') {
        img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKBzgABo0xAP7/';
      }
    });
  };

  const [webp, avif] = await Promise.all([
    checkFormat('webp'),
    checkFormat('avif')
  ]);

  return { webp, avif };
};

/**
 * Get optimal image config based on network conditions
 */
export const getOptimalImageConfig = (isSlowConnection: boolean): ImageOptimizationConfig => {
  return isSlowConnection ? SLOW_NETWORK_CONFIG : DEFAULT_CONFIG;
};

/**
 * Generate responsive srcset for images
 */
export const generateSrcSet = (
  baseUrl: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1920]
): string => {
  return widths
    .map(w => `${baseUrl}?w=${w} ${w}w`)
    .join(', ');
};

/**
 * Generate sizes attribute for responsive images
 */
export const generateSizes = (breakpoints: Record<string, string> = {}): string => {
  const defaultBreakpoints = {
    '(max-width: 640px)': '100vw',
    '(max-width: 768px)': '80vw',
    '(max-width: 1024px)': '60vw',
    'default': '50vw'
  };

  const merged = { ...defaultBreakpoints, ...breakpoints };
  
  return Object.entries(merged)
    .filter(([key]) => key !== 'default')
    .map(([media, size]) => `${media} ${size}`)
    .concat([merged.default || '50vw'])
    .join(', ');
};

/**
 * Compress image using Canvas API
 */
export const compressImage = async (
  file: File,
  config: Partial<ImageOptimizationConfig> = {}
): Promise<Blob> => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      // Calculate dimensions
      let { width, height } = img;
      const aspectRatio = width / height;
      
      if (width > finalConfig.maxWidth) {
        width = finalConfig.maxWidth;
        height = width / aspectRatio;
      }
      
      if (height > finalConfig.maxHeight) {
        height = finalConfig.maxHeight;
        width = height * aspectRatio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        `image/${finalConfig.format}`,
        finalConfig.quality / 100
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Preload critical images
 */
export const preloadImages = (urls: string[]): void => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Create intersection observer for lazy loading
 */
export const createLazyLoadObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px 0px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, defaultOptions);
};

/**
 * Image optimization service singleton
 */
class ImageOptimizationService {
  private support: { webp: boolean; avif: boolean } | null = null;
  private observer: IntersectionObserver | null = null;
  
  async initialize(): Promise<void> {
    this.support = await checkImageSupport();
    
    this.observer = createLazyLoadObserver((entry) => {
      const img = entry.target as HTMLImageElement;
      const src = img.dataset.src;
      
      if (src) {
        img.src = src;
        img.removeAttribute('data-src');
        this.observer?.unobserve(img);
      }
    });
  }
  
  getSupport(): { webp: boolean; avif: boolean } | null {
    return this.support;
  }
  
  observeImage(img: HTMLImageElement): void {
    this.observer?.observe(img);
  }
  
  unobserveImage(img: HTMLImageElement): void {
    this.observer?.unobserve(img);
  }
  
  getBestFormat(): 'avif' | 'webp' | 'jpeg' {
    if (this.support?.avif) return 'avif';
    if (this.support?.webp) return 'webp';
    return 'jpeg';
  }
  
  async compress(file: File, isSlowConnection: boolean = false): Promise<Blob> {
    const config = getOptimalImageConfig(isSlowConnection);
    config.format = this.getBestFormat() as any;
    return compressImage(file, config);
  }
}

export const imageOptimizer = new ImageOptimizationService();

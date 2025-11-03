/**
 * Image Optimization Utilities
 * PATCH 542 Preparation - WebP/AVIF conversion & blur placeholders
 */

export interface ImageOptimizationConfig {
  quality: number;
  format: "webp" | "avif" | "original";
  width?: number;
  height?: number;
  generateBlurPlaceholder?: boolean;
}

export interface OptimizedImageResult {
  url: string;
  blurDataURL?: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

class ImageOptimizer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d");
    }
  }

  /**
   * Generate blur placeholder (base64 data URL)
   */
  async generateBlurPlaceholder(
    imageUrl: string,
    blurSize: number = 10
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        if (!this.canvas || !this.ctx) {
          reject(new Error("Canvas not available"));
          return;
        }

        // Set small canvas size for blur
        this.canvas.width = blurSize;
        this.canvas.height = blurSize;

        // Draw scaled down image
        this.ctx.drawImage(img, 0, 0, blurSize, blurSize);

        // Get base64 data URL
        const blurDataURL = this.canvas.toDataURL("image/jpeg", 0.1);
        resolve(blurDataURL);
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = imageUrl;
    });
  }

  /**
   * Check if browser supports WebP
   */
  supportsWebP(): boolean {
    if (typeof window === "undefined") return false;
    
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    
    return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  }

  /**
   * Check if browser supports AVIF
   */
  async supportsAVIF(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    return new Promise((resolve) => {
      const avif = new Image();
      avif.src = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=";
      avif.onload = () => resolve(true);
      avif.onerror = () => resolve(false);
    });
  }

  /**
   * Get optimal image format based on browser support
   */
  async getOptimalFormat(): Promise<"avif" | "webp" | "jpeg"> {
    const supportsAVIF = await this.supportsAVIF();
    if (supportsAVIF) return "avif";
    
    const supportsWebP = this.supportsWebP();
    if (supportsWebP) return "webp";
    
    return "jpeg";
  }

  /**
   * Generate responsive image srcset
   */
  generateSrcSet(baseUrl: string, widths: number[]): string {
    return widths
      .map(width => `${baseUrl}?w=${width} ${width}w`)
      .join(", ");
  }

  /**
   * Calculate aspect ratio
   */
  calculateAspectRatio(width: number, height: number): string {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    return `${width / divisor}/${height / divisor}`;
  }

  /**
   * Estimate image size reduction
   */
  estimateSizeReduction(
    originalFormat: string,
    targetFormat: "webp" | "avif",
    originalSize: number
  ): number {
    const reductionFactors = {
      webp: 0.25, // ~25% smaller than JPEG
      avif: 0.50  // ~50% smaller than JPEG
    };

    const factor = reductionFactors[targetFormat] || 0;
    return Math.round(originalSize * factor);
  }

  /**
   * Get image dimensions
   */
  async getImageDimensions(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = url;
    });
  }

  /**
   * Optimize image (client-side)
   */
  async optimizeImage(
    imageUrl: string,
    config: Partial<ImageOptimizationConfig> = {}
  ): Promise<OptimizedImageResult> {
    const defaultConfig: ImageOptimizationConfig = {
      quality: 0.8,
      format: "webp",
      generateBlurPlaceholder: true,
      ...config
    };

    const dimensions = await this.getImageDimensions(imageUrl);
    let blurDataURL: string | undefined;

    if (defaultConfig.generateBlurPlaceholder) {
      try {
        blurDataURL = await this.generateBlurPlaceholder(imageUrl);
      } catch (error) {
        console.warn("Failed to generate blur placeholder:", error);
      }
    }

    return {
      url: imageUrl,
      blurDataURL,
      width: dimensions.width,
      height: dimensions.height,
      format: defaultConfig.format,
      size: 0 // Would need server-side implementation for actual size
    };
  }
}

export const imageOptimizer = new ImageOptimizer();

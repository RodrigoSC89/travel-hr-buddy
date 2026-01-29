/**
 * CDN Configuration for Image Optimization
 * PATCH 542 - Prepare for CDN integration (Cloudflare/Vercel/Supabase)
 */

export interface CDNConfig {
  provider: "cloudflare" | "vercel" | "supabase" | "local";
  baseUrl: string;
  enabled: boolean;
  transformations: {
    webp: boolean;
    avif: boolean;
    quality: number;
    progressive: boolean;
  };
}

const CDN_CONFIGS: Record<string, CDNConfig> = {
  local: {
    provider: "local",
    baseUrl: "",
    enabled: false,
    transformations: {
      webp: false,
      avif: false,
      quality: 80,
      progressive: true,
    },
  },
  supabase: {
    provider: "supabase",
    baseUrl: "https://vnbptmixvwropvanyhdb.supabase.co",
    enabled: true,
    transformations: {
      webp: true,
      avif: false,
      quality: 80,
      progressive: true,
    },
  },
  cloudflare: {
    provider: "cloudflare",
    baseUrl: "",
    enabled: false,
    transformations: {
      webp: true,
      avif: true,
      quality: 85,
      progressive: true,
    },
  },
  vercel: {
    provider: "vercel",
    baseUrl: "",
    enabled: false,
    transformations: {
      webp: true,
      avif: true,
      quality: 75,
      progressive: true,
    },
  },
};

// Safe getter for env vars
const getEnv = (key: string): string | undefined => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] as string | undefined;
    }
  } catch {
    return undefined;
  }
  return undefined;
};

class CDNManager {
  private config: CDNConfig;

  constructor() {
    this.config = this.detectProvider();
  }

  private detectProvider(): CDNConfig {
    if (getEnv('VITE_CLOUDFLARE_CDN_URL')) {
      return { ...CDN_CONFIGS.cloudflare, baseUrl: getEnv('VITE_CLOUDFLARE_CDN_URL')!, enabled: true };
    }
    if (getEnv('VITE_VERCEL_URL')) {
      return { ...CDN_CONFIGS.vercel, baseUrl: getEnv('VITE_VERCEL_URL')!, enabled: true };
    }
    // Default to Supabase (always available)
    return CDN_CONFIGS.supabase;
  }

  getConfig(): CDNConfig {
    return this.config;
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getProvider(): string {
    return this.config.provider;
  }

  /**
   * Transform image URL with CDN parameters
   */
  transformUrl(
    originalUrl: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: "webp" | "avif" | "auto";
    } = {}
  ): string {
    if (!this.config.enabled) {
      return originalUrl;
    }

    const { width, height, quality, format = "auto" } = options;

    switch (this.config.provider) {
    case "supabase":
      return this.transformSupabaseUrl(originalUrl, { width, height, quality });

    case "cloudflare":
      return this.transformCloudflareUrl(originalUrl, { width, height, quality, format });

    case "vercel":
      return this.transformVercelUrl(originalUrl, { width, height, quality, format });

    default:
      return originalUrl;
    }
  }

  private transformSupabaseUrl(
    url: string,
    options: { width?: number; height?: number; quality?: number }
  ): string {
    if (!url.includes("supabase.co/storage")) {
      return url;
    }

    const params = new URLSearchParams();
    if (options.width) params.set("width", options.width.toString());
    if (options.height) params.set("height", options.height.toString());
    if (options.quality) params.set("quality", options.quality.toString());

    return `${url}?${params.toString()}`;
  }

  private transformCloudflareUrl(
    url: string,
    options: { width?: number; height?: number; quality?: number; format?: string }
  ): string {
    const params = new URLSearchParams();
    if (options.width) params.set("w", options.width.toString());
    if (options.height) params.set("h", options.height.toString());
    if (options.quality) params.set("q", options.quality.toString());
    if (options.format && options.format !== "auto") params.set("f", options.format);

    return `${this.config.baseUrl}/cdn-cgi/image/${params.toString()}/${url}`;
  }

  private transformVercelUrl(
    url: string,
    options: { width?: number; height?: number; quality?: number; format?: string }
  ): string {
    const params = new URLSearchParams();
    params.set("url", url);
    if (options.width) params.set("w", options.width.toString());
    if (options.height) params.set("h", options.height.toString());
    if (options.quality) params.set("q", options.quality.toString());
    if (options.format && options.format !== "auto") params.set("fm", options.format);

    return `/_next/image?${params.toString()}`;
  }

  /**
   * Generate multiple CDN URLs for srcset
   */
  generateSrcSet(originalUrl: string, widths: number[], format?: "webp" | "avif"): string {
    return widths
      .map((width) => {
        const url = this.transformUrl(originalUrl, {
          width,
          format,
          quality: this.config.transformations.quality,
        });
        return `${url} ${width}w`;
      })
      .join(", ");
  }
}

export const cdnManager = new CDNManager();

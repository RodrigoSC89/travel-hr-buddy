/**
 * UNIFIED Format Utilities
 * 
 * Unifica:
 * - src/utils/format-utils.ts
 * - src/lib/utils.ts (formatCurrency, formatDate)
 * - src/lib/validation/form-validation.ts (formatCPF, formatCNPJ, formatPhone, formatCurrency, formatDate)
 * - src/lib/dashboard-utils.ts (formatMetricValue)
 * - src/hooks/use-system-health.ts (formatBytes, formatMs)
 * - src/lib/offline/storage-quota.ts (formatBytes)
 * 
 * Centraliza todas as funções de formatação em um único módulo.
 */

// ==================== NUMBER FORMATTING ====================

/**
 * Format number with locale-specific separators
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat("pt-BR", options).format(value);
}

/**
 * Format currency value
 */
export function formatCurrency(value: number, currency: string = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value);
}

/**
 * Format percentage value
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format metric value with unit
 */
export function formatMetricValue(value: number | string, unit: string): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return String(value);
  
  switch (unit) {
  case "percent":
  case "%":
    return `${numValue.toFixed(1)}%`;
  case "currency":
  case "BRL":
    return formatCurrency(numValue);
  case "bytes":
    return formatBytes(numValue);
  case "ms":
    return formatDuration(numValue);
  default:
    return `${formatNumber(numValue)} ${unit}`;
  }
}

// ==================== DATE/TIME FORMATTING ====================

type DateFormat = "short" | "long" | "full" | "relative";

/**
 * Format date with various formats
 */
export function formatDate(
  date: Date | string,
  format: DateFormat = "short"
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return "Data inválida";
  }

  if (format === "relative") {
    return formatRelativeTime(d);
  }

  const formats: Record<Exclude<DateFormat, "relative">, Intl.DateTimeFormatOptions> = {
    short: { day: "2-digit", month: "2-digit", year: "numeric" },
    long: { day: "2-digit", month: "long", year: "numeric" },
    full: { weekday: "long", day: "2-digit", month: "long", year: "numeric" },
  };

  return new Intl.DateTimeFormat("pt-BR", formats[format]).format(d);
}

/**
 * Format time only
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    timeStyle: "short",
  }).format(d);
}

/**
 * Format date and time together
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

/**
 * Format relative time (e.g., "2 horas atrás")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "agora mesmo";
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;

  return formatDate(d, "short");
}

// ==================== FILE/SIZE FORMATTING ====================

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Alias for formatBytes
 */
export const formatFileSize = formatBytes;

// ==================== DURATION FORMATTING ====================

/**
 * Format duration in milliseconds to human-readable
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}m ${secs}s`;
  }

  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

/**
 * Format milliseconds for display
 */
export function formatMs(ms: number | null): string {
  if (ms === null || isNaN(ms)) return "-";
  return formatDuration(ms);
}

// ==================== DOCUMENT FORMATTING (BR) ====================

/**
 * Format CPF (Brazilian individual taxpayer ID)
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return cpf;
  
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
}

/**
 * Format CNPJ (Brazilian company taxpayer ID)
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, "");
  if (cleaned.length !== 14) return cnpj;
  
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
}

/**
 * Format phone number (Brazilian format)
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
}

/**
 * Alias for formatPhone
 */
export const formatPhoneNumber = formatPhone;

// ==================== TEXT FORMATTING ====================

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Convert to title case
 */
export function titleCase(text: string): string {
  return text.split(" ").map(capitalize).join(" ");
}

/**
 * Convert to slug format
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ==================== MARITIME/NAUTICAL FORMATTING ====================

/**
 * Format coordinates (latitude/longitude)
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

/**
 * Format speed in knots
 */
export function formatKnots(knots: number): string {
  return `${knots.toFixed(1)} kn`;
}

/**
 * Format distance in nautical miles
 */
export function formatNauticalMiles(nm: number): string {
  return `${nm.toFixed(1)} NM`;
}

/**
 * Format heading in degrees
 */
export function formatHeading(degrees: number): string {
  return `${Math.round(degrees)}°`;
}

// ==================== LEGACY EXPORTS ====================
// Para compatibilidade com imports existentes

export default {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatMetricValue,
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatBytes,
  formatFileSize,
  formatDuration,
  formatMs,
  formatCPF,
  formatCNPJ,
  formatPhone,
  formatPhoneNumber,
  truncateText,
  capitalize,
  titleCase,
  slugify,
  formatCoordinates,
  formatKnots,
  formatNauticalMiles,
  formatHeading,
};

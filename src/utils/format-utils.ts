/**
 * DEPRECATED: Use @/lib/unified instead
 * This file re-exports from the unified module for backward compatibility
 */

export {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatBytes as formatFileSize,
  formatDuration,
  truncateText,
  formatCPF,
  formatCNPJ,
  formatPhone as formatPhoneNumber,
  capitalize,
  titleCase,
  formatTime,
} from "@/lib/unified/format-utils.unified";

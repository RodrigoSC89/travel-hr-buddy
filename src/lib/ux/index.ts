/**
 * UX Utilities Index
 * PATCH 624 - Exportações centralizadas de utilitários UX
 */

// Hooks otimizados
export {
  useDebouncedState,
  usePersistedState,
  useSafeLoading,
  useIsMounted,
  usePrevious,
  useThrottle,
  useIntersectionObserver,
} from "@/hooks/useOptimizedState";

// Scroll
export {
  useScrollRestoration,
  useScrollToTop,
  useScrollDirection,
} from "@/hooks/useScrollRestoration";

// Components
export { SmoothPageTransition, FadeTransition, SlideTransition } from "@/components/ui/SmoothPageTransition";
export { ProgressiveLoader, ShimmerSkeleton, CardSkeleton, TableSkeleton } from "@/components/ui/ProgressiveLoader";
export { LazyImage, LazyAvatar } from "@/components/ui/LazyImage";

// Toasts
export {
  successToast,
  errorToast,
  warningToast,
  infoToast,
  loadingToast,
  showLoadingToast,
  dismissToast,
  undoToast,
  actionToast,
} from "@/components/ui/FeedbackToast";

// Performance
export { useConnectionAdaptive, useLightMode, useAdaptiveDebounce } from "@/hooks/useConnectionAdaptive";
export { useOfflineMode, useOfflineFetch } from "@/hooks/useOfflineMode";

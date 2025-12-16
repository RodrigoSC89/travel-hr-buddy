/**
 * UX Utilities Index
 * PATCH 836 - Revolutionary user experience features
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

// PATCH 836: Predictive UI
export { 
  predictiveUI, 
  usePredictiveUI, 
  useSmartPrefetching 
} from './predictive-ui';

// PATCH 836: Haptic Feedback
export { 
  hapticFeedback, 
  useHapticFeedback 
} from './haptic-feedback';

// PATCH 836: Gesture Navigation
export { 
  useGestureNavigation, 
  useSwipeNavigation 
} from './gesture-navigation';

// PATCH 836: Micro-interactions
export {
  getTransitionStyle,
  interactionClasses,
  useRippleEffect,
  useButtonPress,
  useStaggeredList,
  usePulseOnChange,
  useShakeOnError,
} from './micro-interactions';

// PATCH 836: Smart Suggestions
export {
  smartSuggestions,
  useSmartSuggestions,
  useContextualHelp,
} from './smart-suggestions';

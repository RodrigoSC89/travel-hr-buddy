import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Hook to detect mobile viewport
 * Uses useSyncExternalStore for consistent SSR-safe detection
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Safe initial check for SSR
    if (typeof window === "undefined") return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  React.useEffect(() => {
    // Ensure we have the correct value after hydration
    const checkMobile = () => window.innerWidth < MOBILE_BREAKPOINT;
    
    // Update immediately in case initial state was wrong
    setIsMobile(checkMobile());

    const handleResize = () => {
      setIsMobile(checkMobile());
    };

    // Use resize event for more reliable detection
    window.addEventListener("resize", handleResize);
    
    // Also listen to orientation change for mobile devices
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return isMobile;
}

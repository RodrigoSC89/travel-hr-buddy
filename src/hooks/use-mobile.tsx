import * as React from "react";

const MOBILE_BREAKPOINT = 1024; // Changed from 768 to cover tablets and landscape phones

/**
 * Hook to detect mobile viewport
 * Enhanced for PWA and iOS Safari detection
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return checkIsMobile();
  });

  React.useEffect(() => {
    // Update immediately in case initial state was wrong
    setIsMobile(checkIsMobile());

    const handleResize = () => {
      setIsMobile(checkIsMobile());
    };

    // Use resize event for more reliable detection
    window.addEventListener("resize", handleResize);
    
    // Also listen to orientation change for mobile devices
    window.addEventListener("orientationchange", handleResize);
    
    // Visual viewport API for iOS PWA with keyboard
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  return isMobile;
}

/**
 * Check if device is mobile using multiple signals
 */
function checkIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  
  const width = window.innerWidth;
  
  // Check for touch device
  const isTouchDevice = 'ontouchstart' in window || 
    navigator.maxTouchPoints > 0;
  
  // Check for mobile user agent (fallback)
  const isMobileUA = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  // Check if PWA standalone mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;
  
  // Consider mobile if:
  // 1. Width is below breakpoint, OR
  // 2. It's a touch device with mobile UA and width < 1280
  if (width < MOBILE_BREAKPOINT) return true;
  if (isTouchDevice && isMobileUA && width < 1280) return true;
  if (isStandalone && width < 1280) return true;
  
  return false;
}

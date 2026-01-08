import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Hook to detect mobile viewport
 * Returns true on mobile, false on desktop
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Set initial value
    const checkMobile = () => window.innerWidth < MOBILE_BREAKPOINT;
    setIsMobile(checkMobile());

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(checkMobile());
    
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

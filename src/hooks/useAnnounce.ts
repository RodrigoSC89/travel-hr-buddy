/**
 * Announce Hook for Screen Readers
 * Provides a simple way to announce dynamic content changes
 */
import { useCallback, useState, useEffect } from "react";

export interface AnnounceOptions {
  /** Politeness level - "polite" waits for user pause, "assertive" interrupts */
  politeness?: "polite" | "assertive";
  /** Clear the announcement after this many milliseconds */
  clearAfter?: number;
}

/**
 * useAnnounce provides a way to announce messages to screen readers.
 * Returns an announce function and a component to render in your app.
 * 
 * @example
 * function DataLoader() {
 *   const { announce, Announcer } = useAnnounce();
 *   
 *   const loadData = async () => {
 *     announce("Loading data...");
 *     await fetchData();
 *     announce("Data loaded successfully");
 *   };
 *   
 *   return (
 *     <>
 *       <button onClick={loadData}>Load</button>
 *       <Announcer />
 *     </>
 *   );
 * }
 */
export function useAnnounce() {
  const [message, setMessage] = useState<string>("");
  const [politeness, setPoliteness] = useState<"polite" | "assertive">("polite");

  const announce = useCallback((
    text: string, 
    options: AnnounceOptions = {}
  ) => {
    const { politeness: level = "polite", clearAfter = 5000 } = options;
    
    // Clear and re-set to force announcement even for same message
    setMessage("");
    setPoliteness(level);
    
    // Use requestAnimationFrame to ensure DOM update
    requestAnimationFrame(() => {
      setMessage(text);
    });

    // Auto-clear after timeout
    if (clearAfter > 0) {
      setTimeout(() => setMessage(""), clearAfter);
    }
  }, []);

  const clear = useCallback(() => {
    setMessage("");
  }, []);

  return {
    announce,
    clear,
    currentMessage: message,
  };
}

/**
 * Global announcement function for use outside React components
 * Creates a temporary live region in the DOM
 */
export function announceGlobal(
  message: string, 
  politeness: "polite" | "assertive" = "polite"
): void {
  // Check if we already have a global announcer
  let announcer = document.getElementById("global-announcer");
  
  if (!announcer) {
    announcer = document.createElement("div");
    announcer.id = "global-announcer";
    announcer.setAttribute("role", "status");
    announcer.setAttribute("aria-live", politeness);
    announcer.setAttribute("aria-atomic", "true");
    announcer.className = "sr-only";
    document.body.appendChild(announcer);
  }

  // Update politeness if needed
  announcer.setAttribute("aria-live", politeness);

  // Clear and set message
  announcer.textContent = "";
  requestAnimationFrame(() => {
    if (announcer) {
      announcer.textContent = message;
    }
  });

  // Auto-clear after 5 seconds
  setTimeout(() => {
    if (announcer) {
      announcer.textContent = "";
    }
  }, 5000);
}

export default useAnnounce;

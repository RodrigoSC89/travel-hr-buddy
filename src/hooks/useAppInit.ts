/**
 * useAppInit Hook - App initialization status
 */

import { useState, useEffect } from "react";
import { appBootstrap } from "@/lib/init/app-bootstrap";

export function useAppInit() {
  const [isReady, setIsReady] = useState(appBootstrap.isInitialized());

  useEffect(() => {
    if (!isReady) {
      appBootstrap.waitForInit().then(() => setIsReady(true));
    }
  }, [isReady]);

  return { isReady };
}

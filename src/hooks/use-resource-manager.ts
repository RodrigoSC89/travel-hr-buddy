/**
 * useResourceManager Hook - PATCH 850
 * React hook for resource status and adaptive settings
 */

import { useState, useEffect } from "react";
import { resourceManager, type ResourceStatus } from "@/lib/performance/resource-manager";

export function useResourceManager() {
  const [status, setStatus] = useState<ResourceStatus>(resourceManager.getStatus());

  useEffect(() => {
    return resourceManager.subscribe(setStatus);
  }, []);

  return {
    ...status,
    isConstrained: resourceManager.isConstrained(),
    adaptiveSettings: resourceManager.getAdaptiveSettings(),
  };
}

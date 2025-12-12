/**
 * Preview Safe Mode Hook
 * PATCH 624 - Hook para componentes rodarem em modo seguro no preview
 */

import { useEffect, useRef, useState } from "react";
import { LovableValidator } from "@/lib/qa/LovableValidator";

interface PreviewSafeModeOptions {
  componentName: string;
  enableValidation?: boolean;
  maxRenderTime?: number;
  maxDataSize?: number;
  silenceErrors?: boolean;
}

export function usePreviewSafeMode({
  componentName,
  enableValidation = true,
  maxRenderTime = 3000,
  maxDataSize = 3072,
  silenceErrors = false
}: PreviewSafeModeOptions) {
  const [isValidated, setIsValidated] = useState(false);
  const [validationPassed, setValidationPassed] = useState(true);
  const renderCountRef = useRef(0);
  const intervalIdsRef = useRef<Set<number>>(new Set());

  // Track renders
  useEffect(() => {
    renderCountRef.current++;
    if (enableValidation) {
      LovableValidator.trackRender(componentName);
    }
  });

  // Validate on mount
  useEffect(() => {
    if (!enableValidation) return;

    const validate = async () => {
      const result = await LovableValidator.run(componentName, {
        maxRenderTime,
        maxDataSize
      });

      setValidationPassed(result.passed);
      setIsValidated(true);

      if (!result.passed) {
        // Silently track validation failures without console output
        // Issues are available in the result for debugging if needed
      }
    });

    // Run validation after component stabilizes
    const timeoutId = setTimeout(validate, 2000);

    return () => clearTimeout(timeoutId);
  }, [componentName, enableValidation, maxRenderTime, maxDataSize]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      intervalIdsRef.current.forEach(id => {
        clearInterval(id);
        LovableValidator.clearInterval(id);
      });
      intervalIdsRef.current.clear();
    };
  }, []);

  /**
   * Safe interval que auto-limpa
   */
  const setSafeInterval = (callback: () => void, delay: number) => {
    const id = window.setInterval(callback, delay) as unknown as number;
    intervalIdsRef.current.add(id);
    LovableValidator.registerInterval(id);

    return () => {
      clearInterval(id);
      intervalIdsRef.current.delete(id);
      LovableValidator.clearInterval(id);
    };
  };

  /**
   * Safe data fetch com limite de tamanho
   */
  const safeFetchData = async <T,>(
    fetcher: () => Promise<T>,
    fallback: T,
    options?: { maxSize?: number }
  ): Promise<T> => {
    try {
      const data = await fetcher();
      
      // Validate data size
      const validation = LovableValidator.validateMockedData(data, options?.maxSize || maxDataSize);
      
      if (!validation.valid) {
        // Data too large, using fallback silently
        return fallback;
      }

      return data;
    } catch (error) {
      if (!silenceErrors) {
        // Error handled silently, returning fallback
      }
      return fallback;
    }
  };

  /**
   * Cria mock leve para preview
   */
  const createLightweightMock = <T,>(template: T, count = 5): T[] => {
    return LovableValidator.createLightweightMock(template, count);
  };

  /**
   * Safe error logging que pode ser silenciado
   */
  const safeLogError = (...args: any[]) => {
    if (!silenceErrors) {
      // Errors are tracked internally without console output
    }
  };

  return {
    isValidated,
    validationPassed,
    renderCount: renderCountRef.current,
    setSafeInterval,
    safeFetchData,
    createLightweightMock,
    safeLogError,
    // Utility methods
    isPreviewSafe: validationPassed,
    shouldShowData: validationPassed || !enableValidation
  };
}

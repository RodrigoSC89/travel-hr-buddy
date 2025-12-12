/**
 * Form Optimization Utilities - PATCH 831
 * Debounced inputs, form state management, validation caching
 */

import { useState, useCallback, useRef, useEffect, useMemo } from "react";

/**
 * Debounced input hook
 */
export function useDebouncedInput<T>(
  initialValue: T,
  delay: number = 300
): [T, T, (value: T) => void, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setValueWithDebounce = useCallback(
    (newValue: T) => {
      setValue(newValue);
      setIsDebouncing(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(newValue);
        setIsDebouncing(false);
      }, delay);
    },
    [delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [value, debouncedValue, setValueWithDebounce, isDebouncing];
}

/**
 * Throttled callback hook
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRunRef.current;

      if (timeSinceLastRun >= delay) {
        lastRunRef.current = now;
        return callback(...args);
      } else {
        lastArgsRef.current = args;

        if (!timeoutRef.current) {
          timeoutRef.current = setTimeout(() => {
            lastRunRef.current = Date.now();
            if (lastArgsRef.current) {
              callback(...lastArgsRef.current);
            }
            timeoutRef.current = null;
          }, delay - timeSinceLastRun);
        }
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Form field validation with caching
 */
interface ValidationRule<T> {
  validate: (value: T) => boolean | Promise<boolean>;
  message: string;
  debounce?: number;
}

interface FieldState<T> {
  value: T;
  error: string | null;
  isValidating: boolean;
  isDirty: boolean;
  isTouched: boolean;
}

export function useValidatedField<T>(
  initialValue: T,
  rules: ValidationRule<T>[],
  options: { validateOnChange?: boolean; validateOnBlur?: boolean } = {}
) {
  const { validateOnChange = true, validateOnBlur = true } = options;

  const [state, setState] = useState<FieldState<T>>({
    value: initialValue,
    error: null,
    isValidating: false,
    isDirty: false,
    isTouched: false,
  });

  const validationCacheRef = useRef<Map<string, boolean>>(new Map());
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const validate = useCallback(
    async (value: T): Promise<string | null> => {
      setState((prev) => ({ ...prev, isValidating: true }));

      for (const rule of rules) {
        const cacheKey = `${JSON.stringify(value)}-${rule.message}`;
        
        // Check cache first
        if (validationCacheRef.current.has(cacheKey)) {
          const isValid = validationCacheRef.current.get(cacheKey);
          if (!isValid) {
            setState((prev) => ({ ...prev, isValidating: false, error: rule.message }));
            return rule.message;
          }
          continue;
        }

        try {
          const isValid = await rule.validate(value);
          validationCacheRef.current.set(cacheKey, isValid);

          if (!isValid) {
            setState((prev) => ({ ...prev, isValidating: false, error: rule.message }));
            return rule.message;
          }
        } catch {
          setState((prev) => ({ ...prev, isValidating: false, error: rule.message }));
          return rule.message;
        }
      }

      setState((prev) => ({ ...prev, isValidating: false, error: null }));
      return null;
    },
    [rules]
  );

  const setValue = useCallback(
    (newValue: T) => {
      setState((prev) => ({
        ...prev,
        value: newValue,
        isDirty: true,
      }));

      if (validateOnChange) {
        // Find max debounce time from rules
        const maxDebounce = Math.max(...rules.map((r) => r.debounce || 0), 300);

        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
          validate(newValue);
        }, maxDebounce);
      }
    },
    [validate, validateOnChange, rules]
  );

  const onBlur = useCallback(() => {
    setState((prev) => ({ ...prev, isTouched: true }));

    if (validateOnBlur) {
      validate(state.value);
    }
  }, [validate, validateOnBlur, state.value]);

  const reset = useCallback(() => {
    setState({
      value: initialValue,
      error: null,
      isValidating: false,
      isDirty: false,
      isTouched: false,
    });
    validationCacheRef.current.clear();
  }, [initialValue]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    setValue,
    onBlur,
    validate: () => validate(state.value),
    reset,
    isValid: !state.error && !state.isValidating,
  };
}

/**
 * Form state manager with optimistic updates
 */
interface FormConfig<T> {
  initialValues: T;
  validate?: (values: T) => Record<keyof T, string | undefined> | Promise<Record<keyof T, string | undefined>>;
  onSubmit: (values: T) => Promise<void>;
  validateOnChange?: boolean;
}

export function useOptimizedForm<T extends Record<string, unknown>>(config: FormConfig<T>) {
  const { initialValues, validate, onSubmit, validateOnChange = false } = config;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  const runValidation = useCallback(async () => {
    if (!validate) return {};

    setIsValidating(true);
    try {
      const validationErrors = await validate(values);
      const filteredErrors: Partial<Record<keyof T, string>> = {};
      
      Object.entries(validationErrors).forEach(([key, value]) => {
        if (value) {
          filteredErrors[key as keyof T] = value;
        }
      });

      setErrors(filteredErrors);
      return filteredErrors;
    } finally {
      setIsValidating(false);
    }
  }, [validate, values]);

  const setFieldValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      if (validateOnChange) {
        runValidation();
      }
    },
    [validateOnChange, runValidation]
  );

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<keyof T, boolean>
      );
      setTouched(allTouched);

      // Run validation
      const validationErrors = await runValidation();

      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, runValidation, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsValidating(false);
  }, [initialValues]);

  const getFieldProps = useCallback(
    <K extends keyof T>(field: K) => ({
      value: values[field],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFieldValue(field, e.target.value as T[K]);
      },
      onBlur: () => setFieldTouched(field),
      error: touched[field] ? errors[field] : undefined,
    }),
    [values, errors, touched, setFieldValue, setFieldTouched]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValidating,
    isDirty,
    setFieldValue,
    setFieldTouched,
    handleSubmit,
    reset,
    getFieldProps,
    isValid: Object.keys(errors).length === 0,
  };
}

/**
 * Auto-save hook
 */
export function useAutoSave<T>(
  value: T,
  saveFn: (value: T) => Promise<void>,
  options: {
    delay?: number;
    enabled?: boolean;
    onSaveStart?: () => void;
    onSaveEnd?: () => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const { delay = 2000, enabled = true, onSaveStart, onSaveEnd, onError } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const previousValueRef = useRef<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Check if value changed
    if (JSON.stringify(value) === JSON.stringify(previousValueRef.current)) {
      return;
    }

    setHasUnsavedChanges(true);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      onSaveStart?.();

      try {
        await saveFn(value);
        previousValueRef.current = value;
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error("Save failed"));
      } finally {
        setIsSaving(false);
        onSaveEnd?.();
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, saveFn, delay, enabled, onSaveStart, onSaveEnd, onError]);

  // Save immediately
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsSaving(true);
    onSaveStart?.();

    try {
      await saveFn(value);
      previousValueRef.current = value;
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error("Save failed"));
    } finally {
      setIsSaving(false);
      onSaveEnd?.();
    }
  }, [value, saveFn, onSaveStart, onSaveEnd, onError]);

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    saveNow,
  };
}

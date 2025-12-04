/**
 * Form State Hook
 * Manages form state with validation and submission
 */

import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

interface UseFormOptions<T> {
  initialValues: T;
  schema?: z.ZodSchema<T>;
  onSubmit: (values: T) => Promise<void> | void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  schema,
  onSubmit,
  onSuccess,
  onError,
  successMessage = 'Salvo com sucesso!',
  errorMessage = 'Erro ao salvar'
}: UseFormOptions<T>) {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
    isDirty: false
  });

  const validate = useCallback((values: T): Partial<Record<keyof T, string>> => {
    if (!schema) return {};

    const result = schema.safeParse(values);
    if (result.success) return {};

    const errors: Partial<Record<keyof T, string>> = {};
    result.error.errors.forEach((err) => {
      const path = err.path[0] as keyof T;
      if (path) {
        errors[path] = err.message;
      }
    });
    return errors;
  }, [schema]);

  const setValue = useCallback(<K extends keyof T>(
    field: K,
    value: T[K]
  ) => {
    setState((prev) => {
      const newValues = { ...prev.values, [field]: value };
      const errors = validate(newValues);
      return {
        ...prev,
        values: newValues,
        errors,
        touched: { ...prev.touched, [field]: true },
        isValid: Object.keys(errors).length === 0,
        isDirty: true
      };
    });
  }, [validate]);

  const setValues = useCallback((values: Partial<T>) => {
    setState((prev) => {
      const newValues = { ...prev.values, ...values };
      const errors = validate(newValues);
      return {
        ...prev,
        values: newValues,
        errors,
        isValid: Object.keys(errors).length === 0,
        isDirty: true
      };
    });
  }, [validate]);

  const setError = useCallback(<K extends keyof T>(
    field: K,
    message: string
  ) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [field]: message },
      isValid: false
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setState((prev) => ({
      ...prev,
      errors: {},
      isValid: true
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
      isDirty: false
    });
  }, [initialValues]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();

    const errors = validate(state.values);
    if (Object.keys(errors).length > 0) {
      setState((prev) => ({
        ...prev,
        errors,
        isValid: false,
        touched: Object.keys(prev.values).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {} as Partial<Record<keyof T, boolean>>
        )
      }));
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      await onSubmit(state.values);
      toast.success(successMessage);
      onSuccess?.();
      reset();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(errorMessage);
      toast.error(err.message);
      onError?.(err);
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [state.values, validate, onSubmit, onSuccess, onError, successMessage, errorMessage, reset]);

  const getFieldProps = useCallback(<K extends keyof T>(field: K) => ({
    value: state.values[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : e.target.value;
      setValue(field, value as T[K]);
    },
    onBlur: () => {
      setState((prev) => ({
        ...prev,
        touched: { ...prev.touched, [field]: true }
      }));
    },
    error: state.touched[field] ? state.errors[field] : undefined
  }), [state.values, state.errors, state.touched, setValue]);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    isDirty: state.isDirty,
    setValue,
    setValues,
    setError,
    clearErrors,
    reset,
    handleSubmit,
    getFieldProps
  };
}

/**
 * Simple input change handler creator
 */
export function createChangeHandler<T extends Record<string, unknown>>(
  setValue: <K extends keyof T>(field: K, value: T[K]) => void
) {
  return <K extends keyof T>(field: K) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : e.target.value;
    setValue(field, value as T[K]);
  };
}

/**
 * FormField - Campo de Formulário Padronizado
 * Com label, helper text, validação inline e máscaras
 */

import { forwardRef, ReactNode, InputHTMLAttributes } from 'react';
import { AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  // Label
  label: string;
  htmlFor?: string;
  required?: boolean;
  
  // Helper & Validation
  helperText?: string;
  error?: string;
  success?: string;
  tooltip?: string;
  
  // Input variants
  inputType?: 'input' | 'textarea';
  rows?: number;
  
  // Size
  size?: 'sm' | 'md' | 'lg';
  
  // Custom content
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  prefix?: string;
  suffix?: string;
  
  // Container
  className?: string;
  inputClassName?: string;
}

const sizeClasses = {
  sm: 'h-8 text-sm',
  md: 'h-10 text-base',
  lg: 'h-12 text-lg',
};

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(({
  label,
  htmlFor,
  required,
  helperText,
  error,
  success,
  tooltip,
  inputType = 'input',
  rows = 3,
  size = 'md',
  leftIcon,
  rightIcon,
  prefix,
  suffix,
  className,
  inputClassName,
  disabled,
  ...inputProps
}, ref) => {
  const id = htmlFor || inputProps.id || inputProps.name;
  const hasError = !!error;
  const hasSuccess = !!success && !hasError;
  
  const statusColor = hasError 
    ? 'border-destructive focus-visible:ring-destructive' 
    : hasSuccess 
      ? 'border-success focus-visible:ring-success' 
      : '';

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label Row */}
      <div className="flex items-center justify-between">
        <Label 
          htmlFor={id}
          className={cn(
            'text-sm font-medium',
            disabled && 'text-muted-foreground'
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {/* Input Container */}
      <div className="relative">
        {/* Prefix */}
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {prefix}
          </span>
        )}
        
        {/* Left Icon */}
        {leftIcon && !prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </span>
        )}
        
        {/* Input */}
        {inputType === 'textarea' ? (
          <Textarea
            id={id}
            disabled={disabled}
            rows={rows}
            className={cn(
              'w-full resize-none',
              statusColor,
              inputClassName
            )}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            {...(inputProps as any)}
          />
        ) : (
          <Input
            ref={ref}
            id={id}
            disabled={disabled}
            className={cn(
              'w-full',
              sizeClasses[size],
              (leftIcon || prefix) && 'pl-10',
              (rightIcon || suffix || hasError || hasSuccess) && 'pr-10',
              statusColor,
              inputClassName
            )}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            {...inputProps}
          />
        )}
        
        {/* Right Icon / Status */}
        {(rightIcon || suffix || hasError || hasSuccess) && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {hasError ? (
              <AlertCircle className="w-4 h-4 text-destructive" />
            ) : hasSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-success" />
            ) : suffix ? (
              <span className="text-muted-foreground text-sm">{suffix}</span>
            ) : (
              rightIcon
            )}
          </span>
        )}
      </div>
      
      {/* Helper / Error Text */}
      {(helperText || error || success) && (
        <p
          id={hasError ? `${id}-error` : `${id}-helper`}
          className={cn(
            'text-sm',
            hasError && 'text-destructive',
            hasSuccess && 'text-success',
            !hasError && !hasSuccess && 'text-muted-foreground'
          )}
        >
          {error || success || helperText}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;

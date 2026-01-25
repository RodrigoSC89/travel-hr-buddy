/**
 * Accessible Form Field Component
 * WCAG 2.1 AA compliant form field with proper labeling
 */
import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Label } from "./label";

export interface FormFieldProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, hint, required, id, className, ...props }, ref) => {
    const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
    const errorId = `${fieldId}-error`;
    const hintId = `${fieldId}-hint`;
    
    const describedBy = [
      hint ? hintId : null,
      error ? errorId : null,
    ].filter(Boolean).join(" ") || undefined;

    return (
      <div className={cn("space-y-2", className)}>
        <Label 
          htmlFor={fieldId}
          className={cn(
            "text-sm font-medium",
            error && "text-destructive"
          )}
        >
          {label}
          {required && (
            <span className="text-destructive ml-1" aria-hidden="true">*</span>
          )}
          {required && <span className="sr-only">(required)</span>}
        </Label>
        
        <Input
          id={fieldId}
          ref={ref}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive"
          )}
          {...props}
        />
        
        {hint && !error && (
          <p 
            id={hintId} 
            className="text-sm text-muted-foreground"
          >
            {hint}
          </p>
        )}
        
        {error && (
          <p 
            id={errorId} 
            className="text-sm text-destructive"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export { FormField };

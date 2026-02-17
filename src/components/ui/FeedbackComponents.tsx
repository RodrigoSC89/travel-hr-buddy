/**
 * Feedback Components
 * Toast alternatives and inline feedback
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface InlineFeedbackProps {
  type: FeedbackType;
  message: string;
  show: boolean;
  onDismiss?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
  className?: string;
}

const feedbackConfig = {
  success: {
    icon: Check,
    bg: 'bg-success/10',
    border: 'border-success/20',
    text: 'text-success',
    iconBg: 'bg-success/20'
  },
  error: {
    icon: X,
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    text: 'text-destructive',
    iconBg: 'bg-destructive/20'
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    text: 'text-warning',
    iconBg: 'bg-warning/20'
  },
  info: {
    icon: Info,
    bg: 'bg-info/10',
    border: 'border-info/20',
    text: 'text-info',
    iconBg: 'bg-info/20'
  },
  loading: {
    icon: Loader2,
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    text: 'text-primary',
    iconBg: 'bg-primary/20'
  }
};

export const InlineFeedback: React.FC<InlineFeedbackProps> = ({
  type,
  message,
  show,
  onDismiss,
  autoHide = false,
  autoHideDelay = 3000,
  className
}) => {
  const config = feedbackConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (show && autoHide && onDismiss) {
      const timer = setTimeout(onDismiss, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [show, autoHide, autoHideDelay, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg border",
            config.bg,
            config.border,
            className
          )}
        >
          <div className={cn("p-1 rounded-full", config.iconBg)}>
            <Icon 
              className={cn(
                "h-4 w-4",
                config.text,
                type === 'loading' && "animate-spin"
              )} 
            />
          </div>
          <span className={cn("text-sm font-medium flex-1", config.text)}>
            {message}
          </span>
          {onDismiss && type !== 'loading' && (
            <button
              onClick={onDismiss}
              className={cn("p-1 rounded hover:bg-black/5", config.text)}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Save Indicator - Shows save status
 */
interface SaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  className?: string;
}

export const SaveIndicator: React.FC<SaveIndicatorProps> = ({
  status,
  className
}) => {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (status === 'saved') {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (status === 'idle' && !showSaved) return null;

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      {status === 'saving' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Salvando...</span>
        </>
      )}
      {(status === 'saved' || showSaved) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-1 text-success"
        >
          <Check className="h-4 w-4" />
          <span>Salvo</span>
        </motion.div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-1 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>Erro ao salvar</span>
        </div>
      )}
    </div>
  );
};

/**
 * Character Counter
 */
interface CharacterCounterProps {
  current: number;
  max: number;
  className?: string;
}

export const CharacterCounter: React.FC<CharacterCounterProps> = ({
  current,
  max,
  className
}) => {
  const percentage = (current / max) * 100;
  const isWarning = percentage >= 80;
  const isError = percentage >= 100;

  return (
    <span className={cn(
      "text-xs",
      isError ? "text-destructive" : isWarning ? "text-warning" : "text-muted-foreground",
      className
    )}>
      {current}/{max}
    </span>
  );
};

/**
 * Form Field Feedback
 */
interface FieldFeedbackProps {
  error?: string;
  hint?: string;
  success?: string;
}

export const FieldFeedback: React.FC<FieldFeedbackProps> = ({
  error,
  hint,
  success
}) => {
  if (!error && !hint && !success) return null;

  return (
    <AnimatePresence mode="wait">
      {error && (
        <motion.p
          key="error"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="text-sm text-destructive mt-1 flex items-center gap-1"
        >
          <AlertTriangle className="h-3 w-3" />
          {error}
        </motion.p>
      )}
      {success && !error && (
        <motion.p
          key="success"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="text-sm text-success mt-1 flex items-center gap-1"
        >
          <Check className="h-3 w-3" />
          {success}
        </motion.p>
      )}
      {hint && !error && !success && (
        <motion.p
          key="hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground mt-1"
        >
          {hint}
        </motion.p>
      )}
    </AnimatePresence>
  );
};

/**
 * Action Result Banner
 */
interface ActionResultProps {
  type: 'success' | 'error';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

export const ActionResult: React.FC<ActionResultProps> = ({
  type,
  title,
  description,
  action,
  onDismiss
}) => {
  const isSuccess = type === 'success';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={cn(
        "rounded-lg p-4 border",
        isSuccess 
          ? "bg-success/10 border-success/20" 
          : "bg-destructive/10 border-destructive/20"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "rounded-full p-1",
          isSuccess ? "bg-success/20" : "bg-destructive/20"
        )}>
          {isSuccess ? (
            <Check className="h-5 w-5 text-success" />
          ) : (
            <X className="h-5 w-5 text-destructive" />
          )}
        </div>
        <div className="flex-1">
          <h4 className={cn(
            "font-medium",
            isSuccess ? "text-success" : "text-destructive"
          )}>
            {title}
          </h4>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                "text-sm font-medium mt-2 underline underline-offset-4",
                isSuccess ? "text-success" : "text-destructive"
              )}
            >
              {action.label}
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

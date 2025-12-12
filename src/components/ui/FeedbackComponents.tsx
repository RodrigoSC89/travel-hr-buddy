/**
import { useEffect, useState, useCallback } from "react";;
 * Feedback Components
 * Toast alternatives and inline feedback
 */

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, X, AlertTriangle, Info, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type FeedbackType = "success" | "error" | "warning" | "info" | "loading";

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
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    text: "text-green-600 dark:text-green-400",
    iconBg: "bg-green-500/20"
  },
  error: {
    icon: X,
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    text: "text-red-600 dark:text-red-400",
    iconBg: "bg-red-500/20"
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    text: "text-yellow-600 dark:text-yellow-400",
    iconBg: "bg-yellow-500/20"
  },
  info: {
    icon: Info,
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-500/20"
  },
  loading: {
    icon: Loader2,
    bg: "bg-primary/10",
    border: "border-primary/20",
    text: "text-primary",
    iconBg: "bg-primary/20"
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
          animate={{ opacity: 1, y: 0, height: "auto" }}
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
                type === "loading" && "animate-spin"
              )} 
            />
          </div>
          <span className={cn("text-sm font-medium flex-1", config.text)}>
            {message}
          </span>
          {onDismiss && type !== "loading" && (
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
  status: "idle" | "saving" | "saved" | "error";
  className?: string;
}

export const SaveIndicator: React.FC<SaveIndicatorProps> = ({
  status,
  className
}) => {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (status === "saved") {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (status === "idle" && !showSaved) return null;

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      {status === "saving" && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Salvando...</span>
        </>
      )}
      {(status === "saved" || showSaved) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-1 text-green-600"
        >
          <Check className="h-4 w-4" />
          <span>Salvo</span>
        </motion.div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-1 text-red-600">
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
      isError ? "text-red-500" : isWarning ? "text-yellow-500" : "text-muted-foreground",
      className
    )}>
      {current}/{max}
    </span>
  );
});

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
          className="text-sm text-green-600 mt-1 flex items-center gap-1"
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
  type: "success" | "error";
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
  const isSuccess = type === "success";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={cn(
        "rounded-lg p-4 border",
        isSuccess 
          ? "bg-green-500/10 border-green-500/20" 
          : "bg-red-500/10 border-red-500/20"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "rounded-full p-1",
          isSuccess ? "bg-green-500/20" : "bg-red-500/20"
        )}>
          {isSuccess ? (
            <Check className="h-5 w-5 text-green-600" />
          ) : (
            <X className="h-5 w-5 text-red-600" />
          )}
        </div>
        <div className="flex-1">
          <h4 className={cn(
            "font-medium",
            isSuccess ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
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
                isSuccess ? "text-green-600" : "text-red-600"
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

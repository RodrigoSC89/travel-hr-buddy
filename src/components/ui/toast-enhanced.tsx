/**
 * Enhanced Toast Notifications
 * PATCH 860: UX Polimento Final - Toasts com animações
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface EnhancedToastProps {
  type: ToastType;
  title: string;
  description?: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  position?: "top-right" | "top-center" | "bottom-right" | "bottom-center";
}

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: "border-green-500/50 bg-green-500/10 text-green-500",
  error: "border-red-500/50 bg-red-500/10 text-red-500",
  warning: "border-amber-500/50 bg-amber-500/10 text-amber-500",
  info: "border-blue-500/50 bg-blue-500/10 text-blue-500",
};

const positionMap = {
  "top-right": "top-4 right-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-4 right-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
};

export const EnhancedToast: React.FC<EnhancedToastProps> = ({
  type,
  title,
  description,
  isVisible,
  onClose,
  duration = 5000,
  position = "top-right",
}) => {
  const Icon = iconMap[type];

  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(
            "fixed z-50 flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm shadow-lg max-w-sm",
            colorMap[type],
            positionMap[position]
          )}
        >
          <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">{title}</p>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Progress bar */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: duration / 1000, ease: "linear" }}
            className={cn(
              "absolute bottom-0 left-0 right-0 h-1 origin-left rounded-b-lg",
              type === "success" && "bg-green-500",
              type === "error" && "bg-red-500",
              type === "warning" && "bg-amber-500",
              type === "info" && "bg-blue-500"
            )}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook for toast management
export function useEnhancedToast() {
  const [toasts, setToasts] = React.useState<Array<{
    id: string;
    type: ToastType;
    title: string;
    description?: string;
  }>>([]);

  const showToast = React.useCallback((
    type: ToastType,
    title: string,
    description?: string
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, title, description }]);
    return id;
  }, []);

  const hideToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = React.useCallback((title: string, description?: string) => 
    showToast("success", title, description), [showToast]);
  
  const error = React.useCallback((title: string, description?: string) => 
    showToast("error", title, description), [showToast]);
  
  const warning = React.useCallback((title: string, description?: string) => 
    showToast("warning", title, description), [showToast]);
  
  const info = React.useCallback((title: string, description?: string) => 
    showToast("info", title, description), [showToast]);

  return { toasts, showToast, hideToast, success, error, warning, info };
}

export default EnhancedToast;

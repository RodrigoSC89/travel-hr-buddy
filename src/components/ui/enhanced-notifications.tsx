import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colorMap = {
  success: 'border-green-500 bg-green-50 text-green-900',
  error: 'border-red-500 bg-red-50 text-red-900',
  warning: 'border-yellow-500 bg-yellow-50 text-yellow-900',
  info: 'border-blue-500 bg-blue-50 text-blue-900',
};

export const NotificationItem: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  action,
  onDismiss
}) => {
  const Icon = iconMap[type];

  return (
    <div
      className={cn(
        "relative p-4 border-l-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out animate-slide-in-right max-w-md w-full",
        colorMap[type]
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-sm opacity-90 mt-1">{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="text-sm font-medium underline mt-2 hover:no-underline"
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => onDismiss(id)}
          className="text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

interface NotificationContainerProps {
  notifications: NotificationProps[];
  onDismiss: (id: string) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onDismiss
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          {...notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};
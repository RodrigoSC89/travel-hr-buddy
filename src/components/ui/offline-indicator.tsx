import React from 'react';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOnlineStatus } from '@/hooks/use-online-status';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Alert variant="destructive" className="rounded-none border-0 border-b">
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="font-medium">
          Você está offline. Algumas funcionalidades podem não funcionar corretamente.
        </AlertDescription>
      </Alert>
    </div>
  );
};
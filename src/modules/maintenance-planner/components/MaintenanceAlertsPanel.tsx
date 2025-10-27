import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface MaintenanceAlertsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MaintenanceAlertsPanel: React.FC<MaintenanceAlertsPanelProps> = ({ 
  open, 
  onOpenChange 
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Maintenance Alerts</SheetTitle>
        </SheetHeader>
        <p className="text-muted-foreground mt-4">Alerts panel - Full implementation pending</p>
      </SheetContent>
    </Sheet>
  );
};

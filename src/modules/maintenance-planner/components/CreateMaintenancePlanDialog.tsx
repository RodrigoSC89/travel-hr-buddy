import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CreateMaintenancePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateMaintenancePlanDialog: React.FC<CreateMaintenancePlanDialogProps> = ({ 
  open, 
  onOpenChange,
  onSuccess 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Maintenance Plan</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">Create plan dialog - Full implementation pending</p>
      </DialogContent>
    </Dialog>
  );
};

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface MaintenanceTasksTableProps {
  onRefresh: () => void;
}

export const MaintenanceTasksTable: React.FC<MaintenanceTasksTableProps> = ({ onRefresh }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-muted-foreground">Maintenance tasks table - Full implementation pending</p>
      </CardContent>
    </Card>
  );
};

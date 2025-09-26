import React from 'react';
import { OrganizationLayout } from '@/components/layout/organization-layout';
import { TaskManagement } from '@/components/tasks/task-management';

export default function TaskManagementPage() {
  return (
    <OrganizationLayout title="Gestão de Tarefas">
      <TaskManagement />
    </OrganizationLayout>
  );
}
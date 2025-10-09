import React from 'react';
import IntelligentNotificationSystem from '@/components/notifications/intelligent-notification-system';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';

const NotificationCenter = () => {
  return (
    <ModulePageWrapper gradient="orange">
      <IntelligentNotificationSystem />
    </ModulePageWrapper>
  );
};

export default NotificationCenter;
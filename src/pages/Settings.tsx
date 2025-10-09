import React from 'react';
import { EnhancedSettingsHub } from '@/components/settings/enhanced-settings-hub';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';

const Settings = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <ModulePageWrapper gradient="neutral">
        <EnhancedSettingsHub />
      </ModulePageWrapper>
    </ThemeProvider>
  );
};

export default Settings;
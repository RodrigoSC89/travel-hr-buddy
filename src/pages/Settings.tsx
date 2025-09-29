import React from 'react';
import { EnhancedSettingsHub } from '@/components/settings/enhanced-settings-hub';
import { ThemeProvider } from '@/components/layout/theme-provider';

const Settings = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <EnhancedSettingsHub />
    </ThemeProvider>
  );
};

export default Settings;
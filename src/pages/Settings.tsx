import React from 'react';
import { AdvancedSettings } from '@/components/settings/advanced-settings';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { Header } from '@/components/layout/header';
import { Settings as SettingsIcon } from 'lucide-react';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';

const Settings = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto p-6 space-y-6">
          <BackToDashboard />
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <SettingsIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Configurações</h1>
              <p className="text-muted-foreground">
                Personalize e configure seu sistema
              </p>
            </div>
          </div>
          
          <AdvancedSettings />
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Settings;
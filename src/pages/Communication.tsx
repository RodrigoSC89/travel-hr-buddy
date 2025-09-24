import React from 'react';
import { CommunicationModule } from '@/components/communication/communication-module';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { Header } from '@/components/layout/header';
import { MessageSquare } from 'lucide-react';

const Communication = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background">
        <Header />
        <main className="h-[calc(100vh-4rem)]">
          <CommunicationModule />
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Communication;
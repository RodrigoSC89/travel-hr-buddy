import React from 'react';
import { AdminPanel } from '@/components/auth/admin-panel';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { Header } from '@/components/layout/header';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';

const Admin = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto p-6 space-y-6">
          <BackToDashboard />
          <AdminPanel />
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Admin;
import React from 'react';
import { AdminPanel } from '@/components/auth/admin-panel';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { Header } from '@/components/layout/header';

const Admin = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto p-6">
          <AdminPanel />
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Admin;
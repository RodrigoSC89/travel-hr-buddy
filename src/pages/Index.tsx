import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/components/auth/auth-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { GlobalDashboard } from '@/components/dashboard/global-dashboard';
import { HRDashboard } from '@/components/hr/hr-dashboard';
import { FlightSearch } from '@/components/travel/flight-search';
import { HotelSearch } from '@/components/travel/hotel-search';
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';
import { ReservationsDashboard } from '@/components/reservations/reservations-dashboard';
import { ReportsDashboard } from '@/components/reports/reports-dashboard';

const Index = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const { user, isLoading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redirecionar para login se não estiver autenticado
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <GlobalDashboard />;
      case 'hr':
        return <HRDashboard />;
      case 'flights':
        return <FlightSearch />;
      case 'hotels':
        return <HotelSearch />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'reservations':
        return <ReservationsDashboard />;
      case 'reports':
        return <ReportsDashboard />;
      case 'settings':
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Settings Module</h2>
            <p className="text-muted-foreground">Em desenvolvimento...</p>
          </div>
        );
      default:
        return <GlobalDashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar 
          activeItem={activeModule} 
          onItemChange={setActiveModule}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;

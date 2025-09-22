import React, { useState, useEffect } from 'react';
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
import { CommunicationModule } from '@/components/communication/communication-module';
import { PriceAlertDashboard } from '@/components/price-alerts/price-alert-dashboard';
import { SettingsModule } from '@/components/settings/settings-module';
import { MobileNavigation } from '@/components/mobile/mobile-navigation';
import { MobileHeader } from '@/components/mobile/mobile-header';
import { MobileSplash } from '@/components/ui/mobile-splash';
import { useNotifications } from '@/hooks/use-notifications';
import { useIsMobile } from '@/hooks/use-mobile';
import { Toaster } from '@/components/ui/toaster';
import { OfflineIndicator } from '@/components/ui/offline-indicator';

const Index = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const { user, isLoading } = useAuth();
  const isMobile = useIsMobile();
  const { permissionGranted, scheduleNotification } = useNotifications();

  useEffect(() => {
    // Schedule a welcome notification for mobile users
    if (permissionGranted && isMobile) {
      scheduleNotification({
        title: "Bem-vindo ao Nautilus One!",
        body: "Sua central de gestão empresarial está pronta para uso.",
        id: 1,
      });
    }
  }, [permissionGranted, isMobile, scheduleNotification]);

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

  const getTitleAndSubtitle = () => {
    switch (activeModule) {
      case "dashboard":
        return { title: "Dashboard", subtitle: "Visão geral do sistema" };
      case "hr":
        return { title: "Recursos Humanos", subtitle: "Gestão de pessoas e certificados" };
      case "flights":
      case "hotels":
        return { title: "Viagens", subtitle: "Passagens e hospedagem" };
      case "price-alerts":
        return { title: "Alertas de Preços", subtitle: "Monitoramento em tempo real" };
      case "reservations":
        return { title: "Reservas", subtitle: "Gestão de reservas" };
      default:
        return { title: "Nautilus One", subtitle: "Sistema de gestão" };
    }
  };

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
      case 'price-alerts':
        return <PriceAlertDashboard />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'reservations':
        return <ReservationsDashboard />;
      case 'reports':
        return <ReportsDashboard />;
      case 'communication':
        return <CommunicationModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <GlobalDashboard />;
    }
  };

  const { title, subtitle } = getTitleAndSubtitle();

  if (isMobile) {
    return (
      <>
        <OfflineIndicator />
        <MobileSplash />
        <div className="min-h-screen bg-background pb-20">
        <MobileHeader
          title={title}
          subtitle={subtitle}
          notificationCount={3}
          onNotificationClick={() => console.log('Notifications clicked')}
          onSearchClick={() => console.log('Search clicked')}
          onProfileClick={() => console.log('Profile clicked')}
        />
        
        <main className="px-4 py-6">
          {renderContent()}
        </main>
        
        <MobileNavigation
          activeItem={activeModule}
          onItemChange={setActiveModule}
        />
        
        <Toaster />
      </div>
      </>
    );
  }

  return (
    <>
      <OfflineIndicator />
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
      
      <Toaster />
    </SidebarProvider>
    </>
  );
};

export default Index;
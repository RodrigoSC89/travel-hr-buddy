import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { GlobalDashboard } from '@/components/dashboard/global-dashboard';
import { HRDashboard } from '@/components/hr/hr-dashboard';
import { FlightSearch } from '@/components/travel/flight-search';
import { HotelSearch } from '@/components/travel/hotel-search';
import AnalyticsDashboard from '@/components/analytics/analytics-dashboard';
import { ReservationsDashboard } from '@/components/reservations/reservations-dashboard';
import ReportsDashboard from '@/components/reports/reports-dashboard';
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
import VoiceInterface from '@/components/voice/VoiceInterface';
import IntelligentChatbot from '@/components/voice/IntelligentChatbot';
import SmartTooltipSystem from '@/components/ui/smart-tooltip-system';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { PageTransition } from '@/components/ui/page-transition';
import { ErrorBoundary } from '@/components/layout/error-boundary';

// Import direto dos componentes administrativos
import { UserManagementDashboard } from '@/components/admin/user-management-dashboard';
import { ExecutiveDashboard } from '@/components/dashboard/executive-dashboard';

const Index = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const { user, isLoading } = useAuth();
  const isMobile = useIsMobile();
  const { permissionGranted, scheduleNotification } = useNotifications();

  const handleVoiceNavigation = (module: string) => {
    setActiveModule(module);
  };

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

  // Mostrar página de boas-vindas se não estiver autenticado
  if (!user) {
    return (
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
          <div className="text-center space-y-6 p-8">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <LogIn className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Sistema Corporativo</h1>
              <p className="text-muted-foreground">
                Acesse sua conta para utilizar o sistema
              </p>
            </div>
            <Button asChild size="lg">
              <Link to="/auth">
                <LogIn className="mr-2 h-4 w-4" />
                Fazer Login
              </Link>
            </Button>
          </div>
        </div>
      </ThemeProvider>
    );
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
        return <GlobalDashboard onNavigate={setActiveModule} />;
      case 'hr':
        return <HRDashboard />;
      case 'admin':
        return <UserManagementDashboard />;
      case 'executive':
        return <ExecutiveDashboard />;
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
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <OfflineIndicator />
        <MobileSplash />
        <div className="min-h-screen bg-background pb-20">
        <MobileHeader
          title={title}
        />
        
        <main className="px-4 py-6">
          {renderContent()}
        </main>
        
        <MobileNavigation />
        
        <VoiceInterface onNavigate={handleVoiceNavigation} />
        <IntelligentChatbot />
        <SmartTooltipSystem />
        <Toaster />
      </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
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
            <ErrorBoundary>
              <PageTransition>
                <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                  {renderContent()}
                </div>
              </PageTransition>
            </ErrorBoundary>
          </main>
        </div>
      </div>
      
      <ScrollToTop />
      <VoiceInterface onNavigate={handleVoiceNavigation} />
      <IntelligentChatbot />
      <SmartTooltipSystem />
      <Toaster />
    </SidebarProvider>
    </ThemeProvider>
  );
};

export default Index;
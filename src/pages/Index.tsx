import React, { useState } from 'react';
import { Navigation } from '@/components/ui/navigation';
import { GlobalDashboard } from '@/components/dashboard/global-dashboard';
import { HRDashboard } from '@/components/hr/hr-dashboard';
import { FlightSearch } from '@/components/travel/flight-search';
import { HotelSearch } from '@/components/travel/hotel-search';

const Index = () => {
  const [activeModule, setActiveModule] = useState('dashboard');

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
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Analytics Module</h2>
            <p className="text-muted-foreground">Em desenvolvimento...</p>
          </div>
        );
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
    <div className="min-h-screen bg-background">
      <Navigation 
        activeItem={activeModule} 
        onItemChange={setActiveModule}
      />
      
      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="p-6 lg:p-8 pt-20 lg:pt-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;

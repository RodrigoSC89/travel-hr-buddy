import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Lazy load all pages for better performance
const Index = React.lazy(() => import('./pages/Index'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const PriceAlerts = React.lazy(() => import('./pages/PriceAlerts'));
const Reports = React.lazy(() => import('./pages/Reports'));
const Reservations = React.lazy(() => import('./pages/Reservations'));
const ChecklistsInteligentes = React.lazy(() => import('./pages/ChecklistsInteligentes'));
const PEOTRAM = React.lazy(() => import('./pages/PEOTRAM'));
const PEODP = React.lazy(() => import('./pages/PEODP'));
const SGSO = React.lazy(() => import('./pages/SGSO'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Travel = React.lazy(() => import('./pages/Travel'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const HumanResources = React.lazy(() => import('./pages/HumanResources'));
const Communication = React.lazy(() => import('./pages/Communication'));
const Intelligence = React.lazy(() => import('./pages/Intelligence'));
const Maritime = React.lazy(() => import('./pages/Maritime'));
const MaritimeSupremo = React.lazy(() => import('./pages/MaritimeSupremo'));
const Innovation = React.lazy(() => import('./pages/Innovation'));
const Optimization = React.lazy(() => import('./pages/Optimization'));
const Collaboration = React.lazy(() => import('./pages/Collaboration'));
const Voice = React.lazy(() => import('./pages/Voice'));
const Portal = React.lazy(() => import('./pages/Portal'));
const AR = React.lazy(() => import('./pages/AR'));
const IoT = React.lazy(() => import('./pages/IoT'));
const Blockchain = React.lazy(() => import('./pages/Blockchain'));
const Gamification = React.lazy(() => import('./pages/Gamification'));
const PredictiveAnalytics = React.lazy(() => import('./pages/PredictiveAnalytics'));

// Create QueryClient instance
const queryClient = new QueryClient();

// Loading component for lazy loaded routes
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Carregando...</span>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
              <React.Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/price-alerts" element={<PriceAlerts />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/reservations" element={<Reservations />} />
                  <Route path="/checklists" element={<ChecklistsInteligentes />} />
                  <Route path="/peotram" element={<PEOTRAM />} />
                  <Route path="/peo-dp" element={<PEODP />} />
                  <Route path="/sgso" element={<SGSO />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/travel" element={<Travel />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/hr" element={<HumanResources />} />
                  <Route path="/communication" element={<Communication />} />
                  <Route path="/intelligence" element={<Intelligence />} />
                  <Route path="/maritime" element={<Maritime />} />
                  <Route path="/maritime-supremo" element={<MaritimeSupremo />} />
                  <Route path="/innovation" element={<Innovation />} />
                  <Route path="/optimization" element={<Optimization />} />
                  <Route path="/collaboration" element={<Collaboration />} />
                  <Route path="/voice" element={<Voice />} />
                  <Route path="/portal" element={<Portal />} />
                  <Route path="/ar" element={<AR />} />
                  <Route path="/iot" element={<IoT />} />
                  <Route path="/blockchain" element={<Blockchain />} />
                  <Route path="/gamification" element={<Gamification />} />
                  <Route path="/predictive" element={<PredictiveAnalytics />} />
                </Routes>
              </React.Suspense>
            </main>
          </div>
        </div>
        <Toaster position="top-right" />
      </Router>
    </QueryClientProvider>
  );
}

export default App;

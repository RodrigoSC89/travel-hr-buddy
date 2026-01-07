/**
 * App.tsx - Versão Mínima Funcional
 */
import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TooltipProvider } from "./components/ui/tooltip";

// Lazy load páginas essenciais
const Auth = lazy(() => import("@/pages/Auth"));
const CentralComando = lazy(() => import("@/pages/CentralComando"));

// Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

// Loader
const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      <p className="text-foreground">Carregando Nautilus One...</p>
    </div>
  </div>
);

// Componente de rota protegida simples
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <Loader />;
  if (!user) return <Navigate to="/auth" replace />;
  
  return <>{children}</>;
};

// Rotas internas
const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<Auth />} />
    <Route path="/" element={<Navigate to="/central-comando" replace />} />
    <Route path="/central-comando/*" element={
      <ProtectedRoute>
        <CentralComando />
      </ProtectedRoute>
    } />
    <Route path="*" element={<Navigate to="/auth" replace />} />
  </Routes>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <TooltipProvider>
            <Suspense fallback={<Loader />}>
              <AppRoutes />
            </Suspense>
            <Toaster />
          </TooltipProvider>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

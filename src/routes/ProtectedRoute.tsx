/**
 * ProtectedRoute - Authentication guard for routes
 * Supports demo mode bypass for unauthenticated showcase
 */
import * as React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDemoMode } from "@/contexts/DemoContext";
import { AppLoader } from "./AppLoader";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const { isDemoMode } = useDemoMode();
  const [showLoader, setShowLoader] = React.useState(false);
  
  React.useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isLoading && !isDemoMode) {
      timeout = setTimeout(() => setShowLoader(true), 300);
    } else {
      setShowLoader(false);
    }
    return () => clearTimeout(timeout);
  }, [isLoading, isDemoMode]);
  
  // Demo mode bypasses authentication
  if (isDemoMode) return <>{children}</>;
  
  if (isLoading) {
    if (showLoader) return <AppLoader />;
    return <div className="min-h-screen bg-background" />;
  }
  
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

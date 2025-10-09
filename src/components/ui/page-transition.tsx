import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out",
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-2"
      )}
    >
      {children}
    </div>
  );
};
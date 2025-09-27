import React, { useEffect, useState } from 'react';
import { Plane, Users, AlertTriangle } from 'lucide-react';

export const MobileSplash = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 flex items-center justify-center">
      <div className="text-center text-azure-50 animate-pulse">
        <div className="mb-8 relative">
          <div className="w-20 h-20 mx-auto mb-4 bg-azure-100/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <div className="w-12 h-12 bg-azure-100 rounded-full flex items-center justify-center">
              <Plane className="w-6 h-6 text-blue-900" />
            </div>
          </div>
          
          {/* Floating icons animation */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-azure-100/10 rounded-full flex items-center justify-center animate-bounce">
            <Users className="w-4 h-4" />
          </div>
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-azure-100/10 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2 font-display">
          Nautilus One
        </h1>
        <p className="text-blue-100 text-lg mb-8">
          Sistema de Gestão Empresarial
        </p>
        
        <div className="flex justify-center items-center space-x-2">
          <div className="w-2 h-2 bg-azure-100 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-azure-100 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-azure-100 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};
/**
import { useContext, useState } from "react";;
 * Global Brain Provider - Permite acesso ao Nautilus Brain de qualquer lugar
 */

import React, { createContext, useContext, useState, ReactNode } from "react";
import { NautilusBrainGlobal, NautilusBrainTrigger } from "./NautilusBrainGlobal";

interface BrainContextType {
  openBrain: (context?: string) => void;
  closeBrain: () => void;
  isOpen: boolean;
}

const BrainContext = createContext<BrainContextType | undefined>(undefined);

export const useBrain = () => {
  const context = useContext(BrainContext);
  if (!context) {
    throw new Error("useBrain must be used within GlobalBrainProvider");
  }
  return context;
};

interface GlobalBrainProviderProps {
  children: ReactNode;
  showTrigger?: boolean;
}

export const GlobalBrainProvider: React.FC<GlobalBrainProviderProps> = ({ 
  children, 
  showTrigger = true 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState("");

  const openBrain = (ctx?: string) => {
    setContext(ctx || "");
    setIsOpen(true);
  };

  const closeBrain = () => {
    setIsOpen(false);
  };

  return (
    <BrainContext.Provider value={{ openBrain, closeBrain, isOpen }}>
      {children}
      
      {showTrigger && !isOpen && (
        <NautilusBrainTrigger onClick={() => openBrain()} />
      )}
      
      <NautilusBrainGlobal
        isOpen={isOpen}
        onClose={closeBrain}
        initialContext={context}
      />
    </BrainContext.Provider>
  );
};

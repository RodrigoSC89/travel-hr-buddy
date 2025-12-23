// GlobalBrainProvider - PATCH 850.5 - Fixed React hooks issue
import * as React from "react";
import { useState, useContext, createContext, type ReactNode, type FC, Suspense, lazy } from "react";

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

// Lazy import to avoid circular dependencies and reduce initial bundle
const NautilusBrainGlobal = lazy(() => 
  import("./NautilusBrainGlobal").then(m => ({ default: m.NautilusBrainGlobal }))
);
const NautilusBrainTrigger = lazy(() => 
  import("./NautilusBrainGlobal").then(m => ({ default: m.NautilusBrainTrigger }))
);

export const GlobalBrainProvider: FC<GlobalBrainProviderProps> = ({ 
  children, 
  showTrigger = true 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [brainContext, setBrainContext] = useState("");

  const openBrain = (ctx?: string) => {
    setBrainContext(ctx || "");
    setIsOpen(true);
  };

  const closeBrain = () => {
    setIsOpen(false);
  };

  return (
    <BrainContext.Provider value={{ openBrain, closeBrain, isOpen }}>
      {children}
      
      <Suspense fallback={null}>
        {showTrigger && !isOpen && (
          <NautilusBrainTrigger onClick={() => openBrain()} />
        )}
        
        <NautilusBrainGlobal
          isOpen={isOpen}
          onClose={closeBrain}
          initialContext={brainContext}
        />
      </Suspense>
    </BrainContext.Provider>
  );
};

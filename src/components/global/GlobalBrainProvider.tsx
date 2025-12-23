/**
 * GlobalBrainProvider - Central Brain Context Provider
 * Uses only named imports to prevent multiple React instances
 */
import { useState, useContext, createContext, Suspense, lazy } from "react";
import type { ReactNode, FC } from "react";

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

// Lazy import to avoid circular dependencies
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

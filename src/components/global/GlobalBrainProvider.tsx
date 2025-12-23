import * as React from "react";
import { NautilusBrainGlobal, NautilusBrainTrigger } from "./NautilusBrainGlobal";

interface BrainContextType {
  openBrain: (context?: string) => void;
  closeBrain: () => void;
  isOpen: boolean;
}

const BrainContext = React.createContext<BrainContextType | undefined>(undefined);

export const useBrain = () => {
  const context = React.useContext(BrainContext);
  if (!context) {
    throw new Error("useBrain must be used within GlobalBrainProvider");
  }
  return context;
};

interface GlobalBrainProviderProps {
  children: React.ReactNode;
  showTrigger?: boolean;
}

export const GlobalBrainProvider: React.FC<GlobalBrainProviderProps> = ({ 
  children, 
  showTrigger = true 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [context, setContext] = React.useState("");

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

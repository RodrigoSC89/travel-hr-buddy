/**
 * Accessibility Provider Component
 * Provides skip links, announcements, and accessibility context
 */

import React, { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react';
import { useMediaPreferences, useSkipLink } from '@/hooks/useAccessibility';
import { announce } from '@/lib/accessibility';

interface AccessibilityContextType {
  // Preferences
  reducedMotion: boolean;
  highContrast: boolean;
  darkMode: boolean;
  
  // Actions
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  
  // Focus management
  skipToMain: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

// Optional hook that doesn't throw
export function useAccessibilityOptional() {
  return useContext(AccessibilityContext);
}

interface AccessibilityProviderProps {
  children: ReactNode;
  mainContentId?: string;
}

export function AccessibilityProvider({ 
  children, 
  mainContentId = 'main-content' 
}: AccessibilityProviderProps) {
  const preferences = useMediaPreferences();
  const [isSkipLinkVisible, setIsSkipLinkVisible] = useState(false);
  
  useSkipLink(mainContentId);
  
  const skipToMain = useCallback(() => {
    const mainContent = document.getElementById(mainContentId);
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: preferences.reducedMotion ? 'auto' : 'smooth' });
    }
  }, [mainContentId, preferences.reducedMotion]);
  
  const handleAnnounce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announce(message, priority);
  }, []);
  
  // Apply reduced motion class to body
  useEffect(() => {
    if (preferences.reducedMotion) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
  }, [preferences.reducedMotion]);
  
  // Apply high contrast class to body
  useEffect(() => {
    if (preferences.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [preferences.highContrast]);
  
  const value: AccessibilityContextType = {
    ...preferences,
    announce: handleAnnounce,
    skipToMain,
  };
  
  return (
    <AccessibilityContext.Provider value={value}>
      {/* Skip to main content link */}
      <a
        href={`#${mainContentId}`}
        data-skip-link
        className={`
          fixed top-0 left-0 z-[9999] px-4 py-2 
          bg-primary text-primary-foreground 
          font-medium rounded-br-md
          transform transition-transform duration-200
          focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring
          ${isSkipLinkVisible ? 'translate-y-0' : '-translate-y-full'}
        `}
        onFocus={() => setIsSkipLinkVisible(true)}
        onBlur={() => setIsSkipLinkVisible(false)}
        onClick={(e) => {
          e.preventDefault();
          skipToMain();
        }}
      >
        Pular para conteúdo principal
      </a>
      
      {children}
    </AccessibilityContext.Provider>
  );
}

export default AccessibilityProvider;

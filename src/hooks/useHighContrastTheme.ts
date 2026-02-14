import { useState, useEffect } from "react";

/**
 * Hook para gerenciar modo de alto contraste
 * Compatível com WCAG AAA (7:1 contrast ratio)
 */
export const useHighContrastTheme = () => {
  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    const stored = localStorage.getItem("nautilus-high-contrast");
    return stored === "true";
  });

  useEffect(() => {
    const root = document.documentElement;
    
    if (isHighContrast) {
      root.classList.add("high-contrast");
      root.setAttribute("data-high-contrast", "true");
    } else {
      root.classList.remove("high-contrast");
      root.removeAttribute("data-high-contrast");
    }
    
    localStorage.setItem("nautilus-high-contrast", String(isHighContrast));
  }, [isHighContrast]);

  const toggleHighContrast = () => {
    setIsHighContrast(prev => !prev);
  };

  return {
    isHighContrast,
    toggleHighContrast,
    setIsHighContrast
  };
};

export default useHighContrastTheme;

/**
 * Scroll Restoration Hook
 * PATCH 624 - Restauração de scroll entre navegações
 */

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const scrollPositions = new Map<string, number>();

/**
 * Hook para restaurar posição de scroll ao navegar
 */
export function useScrollRestoration() {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    // Salvar posição atual antes de mudar
    const prevPath = prevPathRef.current;
    if (prevPath !== location.pathname) {
      scrollPositions.set(prevPath, window.scrollY);
    }

    // Restaurar posição ou ir para o topo
    const savedPosition = scrollPositions.get(location.pathname);
    
    // Usar requestAnimationFrame para garantir que o DOM está atualizado
    requestAnimationFrame(() => {
      if (savedPosition !== undefined) {
        window.scrollTo({ top: savedPosition, behavior: "instant" });
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    });

    prevPathRef.current = location.pathname;
  }, [location.pathname]);
}

/**
 * Hook para scroll suave ao topo
 */
export function useScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);
}

/**
 * Hook para detectar direção do scroll
 */
export function useScrollDirection() {
  const lastScrollY = useRef(0);
  const direction = useRef<"up" | "down">("up");

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current) {
        direction.current = "down";
      } else {
        direction.current = "up";
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return direction.current;
}

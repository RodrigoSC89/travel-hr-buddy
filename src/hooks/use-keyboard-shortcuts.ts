import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = (onGlobalSearch?: () => void) => {
  const navigate = useNavigate();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: "k",
      ctrlKey: true,
      action: () => onGlobalSearch?.(),
      description: "Abrir busca global"
    },
    {
      key: "1",
      ctrlKey: true,
      action: () => navigate("/"),
      description: "Ir para Dashboard"
    },
    {
      key: "2",
      ctrlKey: true,
      action: () => navigate("/travel"),
      description: "Ir para Viagens"
    },
    {
      key: "3",
      ctrlKey: true,
      action: () => navigate("/maritime"),
      description: "Ir para Sistema Marítimo"
    },
    {
      key: "4",
      ctrlKey: true,
      action: () => navigate("/human-resources"),
      description: "Ir para RH"
    },
    {
      key: "5",
      ctrlKey: true,
      action: () => navigate("/price-alerts"),
      description: "Ir para Alertas"
    },
    {
      key: "6",
      ctrlKey: true,
      action: () => navigate("/communication"),
      description: "Ir para Comunicação"
    },
    {
      key: "s",
      ctrlKey: true,
      action: () => navigate("/settings"),
      description: "Ir para Configurações"
    }
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcut = shortcuts.find(s => 
        s.key.toLowerCase() === event.key.toLowerCase() &&
        !!s.ctrlKey === event.ctrlKey &&
        !!s.altKey === event.altKey &&
        !!s.shiftKey === event.shiftKey
      );

      if (shortcut) {
        event.preventDefault();
        event.stopPropagation();
        shortcut.action();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigate, onGlobalSearch, shortcuts]);

  return { shortcuts };
};
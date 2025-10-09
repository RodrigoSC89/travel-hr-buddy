import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Settings, Bell, MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { logUserAction } from "@/utils/enhanced-logging";

export const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const navigate = useNavigate();
  const { toast } = useToast();
  const actionButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const mainButtonRef = useRef<HTMLButtonElement>(null);

  const actions = [
    {
      icon: Search,
      label: "Buscar",
      action: () => {
        logUserAction("FAB_SEARCH_CLICKED", { source: "floating-action-button" });
        console.log("🔍 Busca Global ativada");
        toast({ title: "🔍 Busca Global", description: "Sistema de busca ativado" });
      },
    },
    {
      icon: Bell,
      label: "Notificações",
      action: () => {
        logUserAction("FAB_NOTIFICATIONS_CLICKED", { source: "floating-action-button" });
        console.log("🔔 Notificações ativada");
        navigate("/notifications");
        toast({ title: "🔔 Notificações", description: "Abrindo centro de notificações" });
      },
    },
    {
      icon: MessageSquare,
      label: "Mensagens",
      action: () => {
        logUserAction("FAB_MESSAGES_CLICKED", { source: "floating-action-button" });
        console.log("💬 Mensagens ativada");
        navigate("/communication");
        toast({ title: "💬 Mensagens", description: "Abrindo sistema de comunicação" });
      },
    },
    {
      icon: Settings,
      label: "Configurações",
      action: () => {
        logUserAction("FAB_SETTINGS_CLICKED", { source: "floating-action-button" });
        console.log("⚙️ Configurações ativada");
        navigate("/settings");
        toast({ title: "⚙️ Configurações", description: "Abrindo configurações do sistema" });
      },
    },
  ];

  const handleMainButtonClick = () => {
    const newState = !isOpen;
    logUserAction("FAB_MAIN_BUTTON_CLICKED", { isOpen: newState });
    console.log("🎯 FAB Main Button clicked, isOpen:", newState);
    setIsOpen(newState);
    if (newState) {
      setFocusedIndex(0);
    } else {
      setFocusedIndex(-1);
    }
  };

  const handleActionClick = (action: (typeof actions)[0]) => {
    console.log(`🎯 FAB Action clicked: ${action.label}`);
    action.action();
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  // Keyboard navigation for FAB menu
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          mainButtonRef.current?.focus();
          break;

        case "ArrowDown":
        case "ArrowUp": {
          e.preventDefault();
          const direction = e.key === "ArrowDown" ? 1 : -1;
          setFocusedIndex(prev => {
            const newIndex = prev + direction;
            if (newIndex < 0) return actions.length - 1;
            if (newIndex >= actions.length) return 0;
            return newIndex;
          });
          break;
        }

        case "Enter":
        case " ":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < actions.length) {
            handleActionClick(actions[focusedIndex]);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, focusedIndex, actions]);

  // Focus management
  useEffect(() => {
    if (focusedIndex >= 0 && actionButtonsRef.current[focusedIndex]) {
      actionButtonsRef.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action buttons */}
      <div
        className={cn(
          "flex flex-col-reverse gap-3 mb-3 transition-all duration-300",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {actions.map((action, index) => (
          <Button
            key={action.label}
            ref={el => {
              actionButtonsRef.current[index] = el;
            }}
            size="lg"
            className={cn(
              "h-12 w-12 rounded-full shadow-lg",
              "bg-primary hover:bg-primary/90 text-primary-foreground",
              "transition-all duration-300 transform hover:scale-110",
              "focus:outline-none focus:ring-4 focus:ring-primary/50",
              focusedIndex === index && "ring-4 ring-primary/50 scale-110"
            )}
            style={{
              transitionDelay: `${index * 50}ms`,
              zIndex: 60,
            }}
            onClick={() => handleActionClick(action)}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleActionClick(action);
              }
            }}
            aria-label={action.label}
            tabIndex={isOpen ? 0 : -1}
          >
            <action.icon className="h-5 w-5" />
          </Button>
        ))}
      </div>

      {/* Main FAB button */}
      <Button
        ref={mainButtonRef}
        size="lg"
        className={cn(
          "h-16 w-16 rounded-full shadow-2xl",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "transition-all duration-300 transform hover:scale-110 active:scale-95",
          "focus:outline-none focus:ring-4 focus:ring-primary/30",
          isOpen && "rotate-45"
        )}
        style={{ zIndex: 70 }}
        onClick={handleMainButtonClick}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleMainButtonClick();
          }
        }}
        aria-label={isOpen ? "Fechar menu de ações" : "Abrir menu de ações"}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  );
};

export default FloatingActionButton;

/**
 * SmartContextActionsBar - Context-aware quick actions strip
 * Shows relevant actions based on current route
 */
import { useNavigate } from "react-router-dom";
import { useSmartContextActions, type ContextAction } from "@/hooks/useSmartContextActions";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

function ActionChip({ action, onClick }: { action: ContextAction; onClick: () => void }) {
  const categoryStyles = {
    quick: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
    suggested: "bg-accent/10 text-accent-foreground border-accent/20 hover:bg-accent/20",
    ai: "bg-chart-4/10 text-chart-4 border-chart-4/20 hover:bg-chart-4/20",
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-colors whitespace-nowrap",
        categoryStyles[action.category]
      )}
      title={action.description}
    >
      <span>{action.icon}</span>
      <span>{action.label}</span>
      {action.category === "ai" && <Sparkles className="h-2.5 w-2.5" />}
    </motion.button>
  );
}

export function SmartContextActionsBar() {
  const { actions } = useSmartContextActions();
  const navigate = useNavigate();

  if (actions.length === 0) return null;

  const handleClick = (action: ContextAction) => {
    if (action.route) navigate(action.route);
    if (action.action) action.action();
  };

  return (
    <div className="flex items-center gap-1.5 px-4 py-1.5 border-b border-border/20 bg-card/20 backdrop-blur-sm overflow-x-auto scrollbar-none">
      <span className="text-[10px] text-muted-foreground font-medium shrink-0 mr-1">Ações:</span>
      <AnimatePresence mode="popLayout">
        {actions.slice(0, 5).map((action) => (
          <ActionChip key={action.id} action={action} onClick={() => handleClick(action)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

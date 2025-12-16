/**
 * Professional Header Component - PATCH 754
 * Header profissional com indicador de conexão
 */

import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import nautilusLogo from "@/assets/nautilus-logo.png";
import { ConnectionIndicator } from "@/components/ui/ConnectionIndicator";
import { toast } from "sonner";

interface ProfessionalHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  showRealTime?: boolean;
  actions?: React.ReactNode;
  onRefresh?: () => void | Promise<void>;
  onExport?: () => void | Promise<void>;
}

export function ProfessionalHeader({ 
  title, 
  subtitle, 
  showLogo = true,
  showRealTime = true,
  actions,
  onRefresh,
  onExport
}: ProfessionalHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        // Default behavior: reload page data
        window.location.reload();
      }
      toast.success("Dados atualizados com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar dados");
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      if (onExport) {
        await onExport();
      } else {
        // Default behavior: export to JSON
        const data = {
          exportedAt: new Date().toISOString(),
          title,
          type: "dashboard_export"
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      toast.success("Exportação concluída com sucesso");
    } catch (error) {
      toast.error("Erro ao exportar dados");
    } finally {
      setIsExporting(false);
    }
  }, [onExport, title]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 p-6 md:p-8 mb-6"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl -ml-32 -mb-32" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-6">
          {showLogo && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex-shrink-0"
            >
              <img 
                src={nautilusLogo} 
                alt="Nautilus One" 
                className="h-16 w-16 object-contain drop-shadow-2xl"
              />
            </motion.div>
          )}
          
          <div className="space-y-2">
            {/* WCAG 2.1 AA: Solid color for guaranteed 7:1+ contrast */}
            <h1 className="text-3xl md:text-4xl font-bold font-playfair text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="text-base md:text-lg text-foreground/80 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection indicator */}
          <ConnectionIndicator size="sm" />
          
          {showRealTime && (
            <Badge 
              variant="outline" 
              className="gap-2 px-3 py-1.5 text-sm hidden sm:flex border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300 font-medium bg-emerald-50 dark:bg-emerald-950/30"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
              Tempo Real
            </Badge>
          )}
          
          {actions || (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 hidden md:flex"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="hidden lg:inline">Atualizar</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 hidden md:flex"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="hidden lg:inline">Exportar</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

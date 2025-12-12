/**
 * PATCH 655 - Module Toggle Card Component
 * UI component for toggling module activation status
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, ExternalLink, History, Shield, Brain } from "lucide-react";
import { ModuleStatus } from "@/hooks/useNavigationStructure";

export interface ModuleToggleCardProps {
  id: string;
  name: string;
  description?: string;
  status: ModuleStatus;
  category: string;
  isActive: boolean;
  aiEnabled?: boolean;
  requiresRole?: string[];
  onToggle: (id: string, newState: boolean) => void;
  onViewHistory?: (id: string) => void;
  onNavigate?: (path: string) => void;
  path?: string;
}

const STATUS_COLORS: Record<ModuleStatus, string> = {
  production: "bg-green-500",
  development: "bg-yellow-500",
  experimental: "bg-purple-500",
  deprecated: "bg-red-500",
};

const STATUS_LABELS: Record<ModuleStatus, string> = {
  production: "✅ Production",
  development: "⚠️ Development",
  experimental: "🧪 Experimental",
  deprecated: "❌ Deprecated",
};

export const ModuleToggleCard: React.FC<ModuleToggleCardProps> = ({
  id,
  name,
  description,
  status,
  category,
  isActive,
  aiEnabled,
  requiresRole,
  onToggle,
  onViewHistory,
  onNavigate,
  path,
}) => {
  const handleToggle = (checked: boolean) => {
    if (status === "deprecated") {
      return; // Don't allow toggling deprecated modules
    }
    onToggle(id, checked);
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{name}</CardTitle>
              {aiEnabled && (
                <Badge variant="secondary" className="gap-1">
                  <Brain className="w-3 h-3" />
                  AI
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {category}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs ${STATUS_COLORS[status]} text-white`}
              >
                {STATUS_LABELS[status]}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onCheckedChange={handleToggle}
              disabled={status === "deprecated"}
              aria-label={`Toggle ${name}`}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {path && onNavigate && (
                  <DropdownMenuItem onClick={() => onNavigate(path)}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Module
                  </DropdownMenuItem>
                )}
                {onViewHistory && (
                  <DropdownMenuItem onClick={() => onViewHistory(id)}>
                    <History className="mr-2 h-4 w-4" />
                    View History
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {description && (
          <CardDescription className="text-sm mb-3">{description}</CardDescription>
        )}
        {requiresRole && requiresRole.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>Required roles: {requiresRole.join(", ")}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Empty State Prompt - Estado vazio inteligente
 */

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Inbox, Plus, Upload, Settings, Search, 
  FileText, Users, Ship, type LucideIcon 
} from "lucide-react";

interface EmptyStatePromptProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "card" | "inline";
  size?: "sm" | "md" | "lg";
}

export function EmptyStatePrompt({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  variant = "default",
  size = "md"
}: EmptyStatePromptProps) {
  const sizeClasses = {
    sm: {
      container: "py-6",
      icon: "h-8 w-8",
      iconWrapper: "p-3",
      title: "text-sm",
      description: "text-xs",
    },
    md: {
      container: "py-12",
      icon: "h-10 w-10",
      iconWrapper: "p-4",
      title: "text-lg",
      description: "text-sm",
    },
    lg: {
      container: "py-16",
      icon: "h-12 w-12",
      iconWrapper: "p-5",
      title: "text-xl",
      description: "text-base",
    },
  };

  const classes = sizeClasses[size];

  const content = (
    <div className={`flex flex-col items-center justify-center text-center ${classes.container}`}>
      <div className={`${classes.iconWrapper} rounded-full bg-muted mb-4`}>
        <Icon className={`${classes.icon} text-muted-foreground`} />
      </div>
      <h3 className={`${classes.title} font-semibold mb-1`}>{title}</h3>
      <p className={`${classes.description} text-muted-foreground max-w-md mb-4`}>
        {description}
      </p>
      <div className="flex items-center gap-2">
        {action && (
          <Button onClick={action.onClick}>
            {action.icon && <action.icon className="h-4 w-4 mr-2" />}
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );

  if (variant === "card") {
    return (
      <Card>
        <CardContent className="p-0">{content}</CardContent>
      </Card>
    );
  }

  if (variant === "inline") {
    return (
      <div className="border rounded-lg bg-muted/30">
        {content}
      </div>
    );
  }

  return content;
}

// Presets comuns
export const EmptyStates = {
  NoData: (props: Partial<EmptyStatePromptProps>) => (
    <EmptyStatePrompt
      icon={Inbox}
      title="Nenhum dado encontrado"
      description="Não há registros para exibir no momento."
      {...props}
    />
  ),
  NoSearch: (props: Partial<EmptyStatePromptProps>) => (
    <EmptyStatePrompt
      icon={Search}
      title="Nenhum resultado"
      description="Sua busca não retornou resultados. Tente termos diferentes."
      {...props}
    />
  ),
  NoDocuments: (props: Partial<EmptyStatePromptProps>) => (
    <EmptyStatePrompt
      icon={FileText}
      title="Nenhum documento"
      description="Faça upload ou crie seu primeiro documento para começar."
      action={{ label: "Adicionar Documento", icon: Plus, onClick: () => {} }}
      {...props}
    />
  ),
  NoCrew: (props: Partial<EmptyStatePromptProps>) => (
    <EmptyStatePrompt
      icon={Users}
      title="Nenhum tripulante"
      description="Adicione tripulantes para começar a gestão da equipe."
      action={{ label: "Adicionar Tripulante", icon: Plus, onClick: () => {} }}
      {...props}
    />
  ),
  NoVessels: (props: Partial<EmptyStatePromptProps>) => (
    <EmptyStatePrompt
      icon={Ship}
      title="Nenhuma embarcação"
      description="Cadastre sua primeira embarcação para começar."
      action={{ label: "Adicionar Embarcação", icon: Plus, onClick: () => {} }}
      {...props}
    />
  ),
};

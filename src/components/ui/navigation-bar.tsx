import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Users, Bot, Brain, Workflow, BarChart3, Trophy, Monitor } from "lucide-react";

const quickActions = [
  {
    title: "Colaboração",
    icon: Users,
    path: "/collaboration",
    description: "Colaboração em tempo real",
    color: "text-blue-600",
    bgColor: "hover:bg-blue-50 dark:hover:bg-blue-900/20",
  },
  {
    title: "Assistente IA",
    icon: Bot,
    path: "/ai-assistant",
    description: "Assistente inteligente",
    color: "text-green-600",
    bgColor: "hover:bg-green-50 dark:hover:bg-green-900/20",
  },
  {
    title: "IA Avançada",
    icon: Brain,
    path: "/ai-insights",
    description: "Insights avançados",
    color: "text-purple-600",
    bgColor: "hover:bg-purple-50 dark:hover:bg-purple-900/20",
  },
  {
    title: "Workflows",
    icon: Workflow,
    path: "/smart-workflow",
    description: "Automação inteligente",
    color: "text-orange-600",
    bgColor: "hover:bg-orange-50 dark:hover:bg-orange-900/20",
  },
  {
    title: "BI Analytics",
    icon: BarChart3,
    path: "/business-intelligence",
    description: "Business Intelligence",
    color: "text-indigo-600",
    bgColor: "hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
  },
  {
    title: "Gamificação",
    icon: Trophy,
    path: "/gamification",
    description: "Sistema de gamificação",
    color: "text-yellow-600",
    bgColor: "hover:bg-yellow-50 dark:hover:bg-yellow-900/20",
  },
  {
    title: "Status Sistema",
    icon: Monitor,
    path: "/system-monitor",
    description: "Monitoramento do sistema",
    color: "text-red-600",
    bgColor: "hover:bg-red-50 dark:hover:bg-red-900/20",
  },
];

export const NavigationBar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-card/50 border-b border-border shadow-sm backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {quickActions.map(action => (
            <Button
              key={action.path}
              variant="ghost"
              onClick={() => navigate(action.path)}
              className={`flex flex-col items-center gap-2 h-auto py-4 px-3 
                         transition-all duration-200 hover:scale-105 active:scale-95 
                         group relative ${action.bgColor} border border-border/30 
                         hover:border-border/60 hover:shadow-md`}
            >
              <div className={`${action.color} transition-transform group-hover:scale-110`}>
                <action.icon className="h-6 w-6" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-foreground group-hover:text-primary">
                  {action.title}
                </div>
                <div className="text-xs text-muted-foreground hidden lg:block">
                  {action.description}
                </div>
              </div>

              {/* Status Badge */}
              <Badge
                variant="secondary"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs
                           bg-primary/10 text-primary border-primary/20"
              >
                !
              </Badge>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

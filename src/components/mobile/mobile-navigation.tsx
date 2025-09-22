import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  Plane, 
  AlertTriangle, 
  MessageCircle, 
  BarChart3,
  Calendar,
  Menu
} from 'lucide-react';

interface MobileNavigationProps {
  activeItem: string;
  onItemChange: (item: string) => void;
  className?: string;
}

const navigationItems = [
  { id: 'dashboard', label: 'Início', icon: Home },
  { id: 'hr', label: 'RH', icon: Users },
  { id: 'travel', label: 'Viagens', icon: Plane },
  { id: 'alerts', label: 'Alertas', icon: AlertTriangle },
  { id: 'reservations', label: 'Reservas', icon: Calendar },
];

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeItem,
  onItemChange,
  className
}) => {
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border",
      "md:hidden",
      className
    )}>
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onItemChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center h-16 w-16 p-2 rounded-xl transition-all",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon 
                size={20} 
                className={cn(
                  "mb-1 transition-transform",
                  isActive && "scale-110"
                )} 
              />
              <span className="text-xs font-medium truncate">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </Button>
          );
        })}
        
        {/* Menu button for additional options */}
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center justify-center h-16 w-16 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <Menu size={20} className="mb-1" />
          <span className="text-xs font-medium">Mais</span>
        </Button>
      </div>
    </div>
  );
};
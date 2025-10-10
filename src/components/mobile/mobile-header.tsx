import React from "react";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { useEnhancedNotifications } from "@/hooks/use-enhanced-notifications";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileHeaderProps {
  title?: string;
  onMenuClick?: () => void;
  showSearch?: boolean;
  showNotifications?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title = "Sistema",
  onMenuClick,
  showSearch = true,
  showNotifications = true,
}) => {
  const { unreadCount } = useEnhancedNotifications();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        {/* Menu Button */}
        {onMenuClick && (
          <Button variant="ghost" size="icon" className="mr-2 h-8 w-8" onClick={onMenuClick}>
            <Menu className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        )}

        {/* Title */}
        <div className="flex-1">
          <h1 className="text-lg font-semibold truncate">{title}</h1>
        </div>

        {/* Search Button */}
        {showSearch && (
          <Button variant="ghost" size="icon" className="mr-2 h-8 w-8">
            <Search className="h-4 w-4" />
            <span className="sr-only">Buscar</span>
          </Button>
        )}

        {/* Notifications */}
        {showNotifications && <NotificationCenter />}
      </div>

      {/* Optional Search Bar */}
      {showSearch && (
        <div className="border-t px-4 py-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar..." className="pl-8 h-8" />
          </div>
        </div>
      )}
    </header>
  );
};

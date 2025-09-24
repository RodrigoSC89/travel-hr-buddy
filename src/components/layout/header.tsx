import React from 'react';
import { useSystemActions } from '@/hooks/use-system-actions';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/use-profile';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User, Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { NotificationCenter } from '@/components/notifications/notification-center';
import { GlobalSearch } from '@/components/ui/global-search';

export const Header: React.FC = () => {
  const { handleGlobalSearch, handleNavigateToSettings, isSearchOpen, setIsSearchOpen } = useSystemActions();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  if (!user) return null;

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Usuário';
  const userEmail = user.email || '';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4">
        {/* Mobile sidebar trigger */}
        <div className="mr-4 flex lg:hidden">
          <SidebarTrigger className="-ml-1" />
        </div>

        {/* Search bar - Hidden on mobile, visible on tablet+ */}
        <div className="hidden md:flex flex-1 items-center space-x-4 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar no sistema..."
              className="pl-10 h-9"
            />
          </div>
        </div>

        {/* Spacer for mobile */}
        <div className="flex-1 md:hidden" />

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          {/* Mobile search button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 md:hidden"
            onClick={handleGlobalSearch}
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Buscar</span>
          </Button>

          {/* Notifications */}
          <NotificationCenter />
          
          <ThemeToggle />
          
          {/* User name - Hidden on mobile */}
          <span className="text-sm text-muted-foreground hidden lg:inline font-medium">
            {displayName}
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-sm font-medium bg-primary text-primary-foreground">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  handleNavigateToSettings();
                }}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleNavigateToSettings}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={async () => {
                  if (confirm("Tem certeza que deseja sair?")) {
                    await signOut();
                  }
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <GlobalSearch 
        open={isSearchOpen} 
        onOpenChange={setIsSearchOpen} 
      />
    </header>
  );
};
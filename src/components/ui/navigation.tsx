import React from 'react';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Plane, 
  Building, 
  BarChart3,
  Calendar,
  FileText,
  Settings,
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  badge?: number;
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { id: 'hr', label: 'Recursos Humanos', icon: Users, href: '/hr' },
  { id: 'flights', label: 'Passagens Aéreas', icon: Plane, href: '/flights' },
  { id: 'hotels', label: 'Hospedagem', icon: Building, href: '/hotels' },
  { id: 'reservations', label: 'Reservas', icon: Calendar, href: '/reservations' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { id: 'reports', label: 'Relatórios', icon: FileText, href: '/reports' },
  { id: 'settings', label: 'Configurações', icon: Settings, href: '/settings' },
];

interface NavigationProps {
  activeItem?: string;
  onItemChange?: (itemId: string) => void;
  className?: string;
}

export const Navigation = ({ activeItem = 'dashboard', onItemChange, className }: NavigationProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary text-primary-foreground shadow-nautical"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Navigation Sidebar */}
      <nav className={cn(
        "fixed left-0 top-0 h-full w-64 gradient-depth transform transition-transform duration-300 z-40",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}>
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Nautilus One</h1>
              <p className="text-white/70 text-sm">Sistema de Gestão</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
            <input
              type="text"
              placeholder="Buscar módulos..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onItemChange?.(item.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-white/20 text-white shadow-wave"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-danger text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/10">
            <div className="w-10 h-10 rounded-full gradient-ocean flex items-center justify-center text-white font-bold">
              AM
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">Admin Master</p>
              <p className="text-white/70 text-xs">Gestor Geral</p>
            </div>
            <Bell className="text-white/70 hover:text-white cursor-pointer" size={18} />
          </div>
        </div>
      </nav>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
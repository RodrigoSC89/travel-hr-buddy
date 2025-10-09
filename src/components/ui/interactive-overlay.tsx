import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  BarChart3, 
  Users, 
  Settings, 
  MessageSquare,
  Brain,
  Globe,
  Rocket,
  Shield,
  Calendar,
  Target,
  Award,
  Zap,
  Star,
  Heart,
  Diamond,
  Crown,
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface FloatingAction {
  icon: React.ElementType;
  label: string;
  color: string;
  delay: number;
  action: () => void;
  ariaLabel: string;
}

const FloatingMenu = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const actions: FloatingAction[] = [
    { 
      icon: Brain, 
      label: "IA Assistant", 
      color: "from-purple-500 to-indigo-600",
      delay: 0,
      ariaLabel: "Abrir Assistente de IA",
      action: () => {
        console.log('🧠 IA Assistant clicked');
        navigate('/intelligence');
        toast({
          title: "🧠 IA Assistant",
          description: "Abrindo assistente de inteligência artificial"
        });
      }
    },
    { 
      icon: MessageSquare, 
      label: "Chat Premium", 
      color: "from-blue-500 to-cyan-600",
      delay: 100,
      ariaLabel: "Abrir Chat Premium",
      action: () => {
        console.log('💬 Chat Premium clicked');
        navigate('/communication');
        toast({
          title: "💬 Chat Premium",
          description: "Abrindo sistema de comunicação"
        });
      }
    },
    { 
      icon: BarChart3, 
      label: "Analytics", 
      color: "from-emerald-500 to-teal-600",
      delay: 200,
      ariaLabel: "Abrir Analytics",
      action: () => {
        console.log('📊 Analytics clicked');
        navigate('/analytics');
        toast({
          title: "📊 Analytics",
          description: "Abrindo painel de análises"
        });
      }
    },
    { 
      icon: Globe, 
      label: "Global Sync", 
      color: "from-orange-500 to-red-600",
      delay: 300,
      ariaLabel: "Abrir Relatórios Globais",
      action: () => {
        console.log('🌍 Global Sync clicked');
        navigate('/reports');
        toast({
          title: "🌍 Global Sync",
          description: "Abrindo relatórios e sincronização global"
        });
      }
    }
  ];

  return (
    <div className="fixed bottom-8 right-80 z-35 hidden md:block">
      <div className={`flex flex-col gap-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {actions.map((action, index) => (
          <div
            key={index}
            className={`transform transition-all duration-500 ${isVisible ? 'translate-x-0' : 'translate-x-16'}`}
            style={{ transitionDelay: `${action.delay}ms` }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(-1)}
          >
            <div className="relative group">
              {/* Tooltip */}
              <div className={`absolute right-16 top-1/2 transform -translate-y-1/2 
                bg-gray-900 text-azure-50 px-3 py-2 rounded-lg text-sm whitespace-nowrap
                transition-all duration-300 ${hoveredIndex === index ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                {action.label}
                <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 
                  w-2 h-2 bg-gray-900 rotate-45" />
              </div>

              <Button
                onClick={action.action}
                aria-label={action.ariaLabel}
                className={`w-14 h-14 rounded-full bg-gradient-to-r ${action.color} text-azure-50 
                  shadow-2xl hover:shadow-3xl transition-all duration-300 transform 
                  hover:scale-110 hover:-rotate-6 group relative overflow-hidden
                  border-2 border-azure-100/20 hover:border-azure-100/40
                  focus:outline-none focus:ring-4 focus:ring-primary/30`}
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-azure-100/20 to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-azure-100/30 to-transparent 
                  transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] 
                  transition-transform duration-1000" />
                
                <action.icon className="w-6 h-6 relative z-10 group-hover:scale-110 transition-transform" />
              </Button>
            </div>
          </div>
        ))}
        
        {/* Central Floating Hub */}
        <div className="relative group">
          <Button
            onClick={() => {
              console.log('🚀 Central Hub clicked');
              toast({
                title: "🚀 Central Hub",
                description: "Acesso rápido às principais funcionalidades do sistema"
              });
            }}
            aria-label="Central Hub - Acesso rápido"
            className="w-16 h-16 rounded-full bg-gradient-to-r from-primary via-primary-glow to-primary 
              text-azure-50 shadow-2xl hover:shadow-3xl transition-all duration-500 transform 
              hover:scale-125 hover:rotate-12 group relative overflow-hidden
              border-4 border-azure-100/30 hover:border-azure-100/50 animate-pulse-glow
              focus:outline-none focus:ring-4 focus:ring-primary/30"
          >
            {/* Multiple animated backgrounds */}
            <div className="absolute inset-0 bg-gradient-to-r from-azure-100/10 via-azure-100/20 to-azure-100/10 
              animate-gradient-shift opacity-50" />
            
            <div className="absolute inset-0 rounded-full border-2 border-azure-100/20 
              animate-ping" />
            
            <Rocket className="w-8 h-8 relative z-10 group-hover:scale-125 transition-transform animate-bounce" />
          </Button>
          
          {/* Orbiting particles */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '10s' }}>
            <div className="absolute -top-2 left-1/2 w-1 h-1 bg-azure-100 rounded-full animate-pulse" />
            <div className="absolute top-1/2 -right-2 w-1 h-1 bg-azure-100 rounded-full animate-pulse" />
            <div className="absolute -bottom-2 left-1/2 w-1 h-1 bg-azure-100 rounded-full animate-pulse" />
            <div className="absolute top-1/2 -left-2 w-1 h-1 bg-azure-100 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusWidget = () => {
  const [stats, setStats] = useState({
    performance: 0,
    health: 0,
    efficiency: 0
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        performance: 97,
        health: 100,
        efficiency: 94
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="fixed top-8 right-8 z-40 w-64 bg-gradient-to-br from-card/90 to-primary/10 
      backdrop-blur-xl border border-azure-200/30 shadow-2xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold font-display">System Status</h3>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-600">Online</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {[
            { label: "Performance", value: stats.performance, icon: TrendingUp, color: "emerald" },
            { label: "System Health", value: stats.health, icon: Heart, color: "red" },
            { label: "Efficiency", value: stats.efficiency, icon: Zap, color: "blue" }
          ].map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <item.icon className={`w-4 h-4 text-${item.color}-500`} />
                  <span className="text-sm">{item.label}</span>
                </div>
                <span className="text-sm font-bold">{item.value}%</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-2">
                <div 
                  className={`h-2 bg-gradient-to-r from-${item.color}-400 to-${item.color}-600 rounded-full 
                    transition-all duration-1000 ease-out`}
                  style={{ 
                    width: `${item.value}%`,
                    transitionDelay: `${index * 200}ms`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const InteractiveOverlay = () => {
  return (
    <>
      <FloatingMenu />
      <StatusWidget />
    </>
  );
};
import React from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Ship, 
  Home, 
  ArrowLeft, 
  Search, 
  Compass,
  Anchor,
  LifeBuoy,
  Map
} from "lucide-react";

const suggestedRoutes = [
  { path: "/", label: "Dashboard Principal", icon: Home },
  { path: "/maintenance-planner", label: "MMI - Manutenção", icon: Anchor },
  { path: "/crew", label: "Gestão de Tripulação", icon: LifeBuoy },
  { path: "/analytics", label: "Analytics", icon: Map },
];

const NotFoundProfessional: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <Helmet>
        <title>Página não encontrada | Nautilus One</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-primary/20 shadow-2xl overflow-hidden">
            {/* Header with animation */}
            <div className="relative h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 overflow-hidden">
              {/* Animated waves */}
              <motion.div
                className="absolute inset-0"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%230099ff' fill-opacity='0.1' d='M0,192L48,176C96,160,192,128,288,138.7C384,149,480,203,576,213.3C672,224,768,192,864,181.3C960,171,1056,181,1152,186.7C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E\")",
                  backgroundSize: "200% 100%"
                }}
              />
              
              {/* Ship icon */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="p-4 rounded-full bg-background/80 backdrop-blur shadow-lg">
                  <Ship className="h-12 w-12 text-primary" />
                </div>
              </motion.div>
              
              {/* Compass animation */}
              <motion.div
                className="absolute top-4 right-4"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Compass className="h-8 w-8 text-primary/40" />
              </motion.div>
            </div>

            <CardContent className="p-8 text-center">
              {/* 404 text */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-7xl font-bold text-primary/20 mb-2">404</h1>
                <h2 className="text-2xl font-bold mb-2">Rota fora do radar</h2>
                <p className="text-muted-foreground mb-6">
                  Parece que você navegou para águas desconhecidas. A página que procura não foi encontrada.
                </p>
              </motion.div>

              {/* Current path */}
              <div className="bg-muted/50 rounded-lg p-3 mb-6">
                <p className="text-xs text-muted-foreground">Caminho solicitado:</p>
                <code className="text-sm font-mono text-primary">{location.pathname}</code>
              </div>

              {/* Suggested routes */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-3">Sugestões de navegação:</p>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedRoutes.map((route) => {
                    const Icon = route.icon;
                    return (
                      <Button
                        key={route.path}
                        variant="outline"
                        className="justify-start h-auto py-3"
                        onClick={() => handlenavigate}
                      >
                        <Icon className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-sm">{route.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Main actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => handlenavigate}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={() => handlenavigate}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </div>

              {/* Help text */}
              <p className="text-xs text-muted-foreground mt-6">
                Use <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl+K</kbd> para busca rápida
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default NotFoundProfessional;

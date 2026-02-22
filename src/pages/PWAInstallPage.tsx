/**
 * PWA Install Page — Dedicated install experience for mobile users
 * Accessible at /install
 */
import { } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePWAInstall } from "@/hooks/use-pwa";
import {
  Download, Smartphone, Shield, WifiOff,
  Zap, CheckCircle2, Ship, Globe, Bell, HardDrive,
  Monitor, Tablet
} from "lucide-react";

const FEATURES = [
  { icon: WifiOff, title: "Funciona Offline", description: "Acesse dados críticos mesmo sem internet — ideal para alto-mar" },
  { icon: Zap, title: "Acesso Instantâneo", description: "Abra direto da tela inicial, sem abrir o navegador" },
  { icon: Bell, title: "Push Notifications", description: "Alertas em tempo real de compliance, manutenção e segurança" },
  { icon: HardDrive, title: "Cache Inteligente", description: "Dados sincronizados automaticamente quando a conexão retorna" },
  { icon: Shield, title: "Segurança Enterprise", description: "Mesma proteção do navegador com isolamento de dados" },
  { icon: Globe, title: "Sempre Atualizado", description: "Updates automáticos — sempre a versão mais recente" },
];

export default function PWAInstallPage() {
  const { canInstall, isInstalled } = usePWAInstall();
  const isInstallable = canInstall;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="max-w-2xl mx-auto text-center space-y-6"
        >
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <Ship className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Instale o <span className="text-primary">Nauti One</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Acesso rápido à gestão marítima direto da tela inicial do seu dispositivo
          </p>

          {isInstalled ? (
            <div className="flex items-center justify-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
              <span className="text-lg font-medium">App já instalado!</span>
            </div>
          ) : isInstallable ? (
            <Button size="lg" className="gap-2 text-lg px-8 py-6">
              <Download className="h-5 w-5" />
              Instalar Agora
            </Button>
          ) : (
            <div className="space-y-4">
              <Badge variant="outline" className="text-sm px-4 py-2">
                <Smartphone className="h-4 w-4 mr-2" />
                Instalação manual disponível
              </Badge>
              
              {isIOS && (
                <Card className="max-w-sm mx-auto">
                  <CardContent className="p-4 space-y-3">
                    <p className="font-medium text-foreground text-sm">No iPhone/iPad:</p>
                    <ol className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                        Toque no ícone de <strong>Compartilhar</strong> (□↑)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                        Role e toque em <strong>"Adicionar à Tela de Início"</strong>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                        Confirme tocando em <strong>"Adicionar"</strong>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              )}

              {isAndroid && (
                <Card className="max-w-sm mx-auto">
                  <CardContent className="p-4 space-y-3">
                    <p className="font-medium text-foreground text-sm">No Android:</p>
                    <ol className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                        Toque no menu <strong>(⋮)</strong> do Chrome
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                        Toque em <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              )}

              {!isIOS && !isAndroid && (
                <Card className="max-w-sm mx-auto">
                  <CardContent className="p-4 space-y-3">
                    <p className="font-medium text-foreground text-sm">No Desktop:</p>
                    <ol className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                        Clique no ícone de <strong>instalar</strong> (⊕) na barra de endereço
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                        Confirme clicando em <strong>"Instalar"</strong>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Device indicators */}
          <div className="flex justify-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1 text-xs">
              <Smartphone className="h-4 w-4" /> Mobile
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Tablet className="h-4 w-4" /> Tablet
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Monitor className="h-4 w-4" /> Desktop
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center text-foreground mb-8">
          Por que instalar?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full hover:border-primary/30 transition-colors">
                <CardContent className="p-4 space-y-2">
                  <feature.icon className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Specs */}
      <div className="max-w-2xl mx-auto px-6 pb-12">
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">~2MB</p>
                <p className="text-xs text-muted-foreground">Tamanho</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{"<"}1.5s</p>
                <p className="text-xs text-muted-foreground">Tempo de carregamento</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">100%</p>
                <p className="text-xs text-muted-foreground">Offline-first</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">PWA</p>
                <p className="text-xs text-muted-foreground">Padrão Web</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

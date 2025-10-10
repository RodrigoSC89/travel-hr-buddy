import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles, Zap, Palette, Smartphone } from "lucide-react";

/**
 * Demo page showcasing the Smart Sidebar and enhanced layout
 * This demonstrates the new UX improvements for Nautilus One
 */
export default function SmartLayoutDemo() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-10 h-10 text-blue-500" />
          Smart Layout Demo
        </h1>
        <p className="text-muted-foreground text-lg">
          Nova experiência de navegação com sidebar inteligente e design moderno
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Recursos Implementados
            </CardTitle>
            <CardDescription>Todas as melhorias do sistema Nautilus One</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-1" />
              <div>
                <p className="font-medium">Smart Sidebar</p>
                <p className="text-sm text-muted-foreground">
                  32 módulos organizados em 6 categorias temáticas
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-1" />
              <div>
                <p className="font-medium">Colapsável e Expansível</p>
                <p className="text-sm text-muted-foreground">
                  Cada categoria pode ser aberta/fechada com clique
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-1" />
              <div>
                <p className="font-medium">Ícones Intuitivos</p>
                <p className="text-sm text-muted-foreground">
                  Ship, Brain, Bell, BarChart2, Folder para cada grupo
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-1" />
              <div>
                <p className="font-medium">Tema Escuro/Claro</p>
                <p className="text-sm text-muted-foreground">
                  Toggle no header para alternar entre temas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Funcionalidades do Header
            </CardTitle>
            <CardDescription>Barra superior inteligente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">🌙 / ☀️</Badge>
              <span className="text-sm">Alternador de Tema</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">🔔</Badge>
              <span className="text-sm">Central de Notificações</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">🤖</Badge>
              <span className="text-sm">Assistente IA</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">🔍</Badge>
              <span className="text-sm">Busca Global</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-500" />
            Design System
          </CardTitle>
          <CardDescription>Padrões visuais modernos e consistentes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Cores</h4>
            <div className="flex gap-2 flex-wrap">
              <div className="w-16 h-16 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                Primary
              </div>
              <div className="w-16 h-16 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 text-xs font-bold shadow-md">
                Base
              </div>
              <div className="w-16 h-16 rounded-lg bg-green-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                Success
              </div>
              <div className="w-16 h-16 rounded-lg bg-red-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                Alert
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Tipografia</h4>
            <div className="space-y-1">
              <p className="text-3xl font-bold">Heading 1 - Bold</p>
              <p className="text-xl font-semibold text-muted-foreground">Heading 2 - Semibold</p>
              <p className="text-base">Body text - Regular weight</p>
              <p className="text-sm text-muted-foreground">Caption - Muted foreground</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-500" />
            Responsividade
          </CardTitle>
          <CardDescription>Adaptado para todos os dispositivos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📱 Mobile</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Menu colapsável com overlay e botão hamburger
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">📱 Tablet</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Layout adaptado para telas médias
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">🖥️ Desktop</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Sidebar fixa com navegação completa
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          Próximos Passos
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-blue-500">✓</span>
            <span>Sistema de Design unificado implementado</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">✓</span>
            <span>Smart Sidebar com 6 categorias e 32 módulos organizados</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">✓</span>
            <span>Header inteligente com tema, notificações e IA</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400">→</span>
            <span>Adicionar microanimações com Framer Motion</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400">→</span>
            <span>Implementar onboarding interativo para novos usuários</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400">→</span>
            <span>Integração profunda entre módulos</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

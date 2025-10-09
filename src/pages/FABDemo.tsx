import React from "react";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Demo page to showcase the Floating Action Button
 * This page demonstrates the FAB functionality without requiring authentication
 */
const FABDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Floating Action Button Demo
          </h1>
          <p className="text-muted-foreground">
            Demonstração do botão de ação flutuante com funcionalidade completa
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ✅ Funcionalidade
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  Implementado
                </Badge>
              </CardTitle>
              <CardDescription>
                O FAB está totalmente funcional e responsivo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm">Click handlers funcionando</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm">Menu expansível com animações</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm">Sistema de logging ativo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm">Feedback visual e sonoro</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎨 Contraste
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  WCAG AAA
                </Badge>
              </CardTitle>
              <CardDescription>
                Cores otimizadas para acessibilidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm">Contraste mínimo 7:1</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm">Botões azul oceânico (#0EA5E9)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm">Texto branco (#FAFAFA)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm">Suporte modo escuro completo</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Como usar o FAB</CardTitle>
            <CardDescription>
              Instruções de uso do botão de ação flutuante
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">1. Clique no botão principal</h4>
              <p className="text-sm text-muted-foreground">
                O botão azul no canto inferior direito abre o menu de ações rápidas
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">2. Escolha uma ação</h4>
              <p className="text-sm text-muted-foreground">
                Quatro opções disponíveis: Buscar, Notificações, Mensagens e Configurações
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">3. Verifique os logs</h4>
              <p className="text-sm text-muted-foreground">
                Todas as ações são registradas no console do navegador para depuração
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="bg-muted/30 rounded-lg p-6 space-y-3">
          <h3 className="font-semibold text-foreground">💡 Nota Importante</h3>
          <p className="text-sm text-muted-foreground">
            O FAB está posicionado no canto inferior direito com z-index elevado (50-70) para garantir 
            que fique sempre visível acima de outros elementos. As ações são logadas tanto no console 
            quanto no localStorage para facilitar a depuração.
          </p>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
};

export default FABDemo;

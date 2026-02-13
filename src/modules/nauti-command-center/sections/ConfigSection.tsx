/**
 * Seção: Configurações
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Brain, Bell, Plug, CheckCircle } from "lucide-react";

export function ConfigSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações do Command Center
        </CardTitle>
        <CardDescription>Personalize sua experiência</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="ai">IA</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="integrations">Integrações</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Tema Escuro</Label>
              <Switch defaultChecked={document.documentElement.classList.contains("dark")} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Auto-refresh (30s)</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label>Animações</Label>
              <Switch defaultChecked />
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Modelo IA</Label>
                <p className="text-xs text-muted-foreground">Gemini 2.5 Flash</p>
              </div>
              <Badge>Ativo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <Label>Insights Automáticos</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label>Análise Preditiva</Label>
              <Switch defaultChecked />
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Alertas Críticos</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label>Notificações Push</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label>Sons de Alerta</Label>
              <Switch />
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            {[
              { name: "Supabase", status: "connected" },
              { name: "Lovable AI", status: "connected" },
              { name: "Analytics", status: "connected" }
            ].map((int) => (
              <div key={int.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Plug className="h-4 w-4" />
                  <span>{int.name}</span>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Conectado
                </Badge>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

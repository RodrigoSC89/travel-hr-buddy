import { useState, useMemo, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Stethoscope,
  Pill,
  AlertTriangle,
  Users,
  Calendar,
  Clock,
  Brain,
  Sparkles,
  Send,
  FileText,
  Heart,
  Thermometer,
  Activity,
  ShieldCheck,
  Package,
} from "lucide-react";

interface MedicalSupply {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  expiryDate: string;
  status: "ok" | "low" | "expiring" | "critical";
}

interface MedicalRecord {
  id: string;
  crewMember: string;
  date: string;
  type: string;
  symptoms: string;
  treatment: string;
  status: "resolved" | "monitoring" | "referred";
}

const mockSupplies: MedicalSupply[] = [
  { id: "1", name: "Paracetamol 500mg", category: "Analgésicos", quantity: 120, minStock: 50, expiryDate: "2025-06-15", status: "ok" },
  { id: "2", name: "Dipirona 1g", category: "Analgésicos", quantity: 85, minStock: 40, expiryDate: "2024-03-20", status: "expiring" },
  { id: "3", name: "Bandagem elástica", category: "Curativos", quantity: 15, minStock: 20, expiryDate: "2026-12-01", status: "low" },
  { id: "4", name: "Soro fisiológico 500ml", category: "Soluções", quantity: 8, minStock: 15, expiryDate: "2024-08-10", status: "critical" },
  { id: "5", name: "Omeprazol 20mg", category: "Gastrointestinal", quantity: 60, minStock: 30, expiryDate: "2025-11-30", status: "ok" },
];

const mockRecords: MedicalRecord[] = [
  { id: "1", crewMember: "João Silva", date: "2024-01-15", type: "Consulta", symptoms: "Dor de cabeça, fadiga", treatment: "Paracetamol 500mg", status: "resolved" },
  { id: "2", crewMember: "Maria Santos", date: "2024-01-14", type: "Emergência", symptoms: "Corte na mão", treatment: "Sutura + curativo", status: "monitoring" },
  { id: "3", crewMember: "Carlos Lima", date: "2024-01-13", type: "Consulta", symptoms: "Enjoo, tontura", treatment: "Dramin + observação", status: "resolved" },
];

export default function InfirmaryDashboard() {
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Olá! Sou o assistente médico do Nautilus. Posso ajudar com triagem, medicamentos e protocolos de primeiros socorros. Como posso ajudar?" },
  ]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setChatHistory(prev => [...prev, { role: "user", content: chatMessage }]);
    
    setTimeout(() => {
      const responses: Record<string, string> = {
        dor: "Para dor de cabeça leve a moderada: Paracetamol 500mg (1-2 comprimidos) ou Dipirona 1g. Máximo 4x ao dia. Se persistir por mais de 48h, considere avaliação médica via telemedicina.",
        corte: "Protocolo para cortes: 1) Lavar com soro fisiológico, 2) Aplicar antisséptico, 3) Curativo oclusivo. Se profundo (>2cm) ou sangramento intenso, considere sutura. Verificar vacina antitetânica.",
        estoque: "Itens críticos: Soro fisiológico (8 un, mínimo 15). Próximos a vencer: Dipirona (mar/2024). Recomendo solicitar reposição imediata via módulo de Compras.",
        default: "Entendi. Posso ajudar com triagem de sintomas, protocolos de primeiros socorros, verificar interações medicamentosas ou gerar relatórios de atendimento. O que precisa?",
      };
      
      const key = chatMessage.toLowerCase().includes("dor") ? "dor" 
        : chatMessage.toLowerCase().includes("corte") || chatMessage.toLowerCase().includes("ferimento") ? "corte"
          : chatMessage.toLowerCase().includes("estoque") || chatMessage.toLowerCase().includes("medicamento") ? "estoque"
            : "default";
        
      setChatHistory(prev => [...prev, { role: "assistant", content: responses[key] }]);
    }, 1000);
    
    setChatMessage("");
  });

  const expiringItems = mockSupplies.filter(s => s.status === "expiring" || s.status === "critical").length;
  const lowStockItems = mockSupplies.filter(s => s.status === "low" || s.status === "critical").length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atendimentos (Mês)</p>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">3 em monitoramento</p>
              </div>
              <Stethoscope className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tripulação Saudável</p>
                <p className="text-2xl font-bold">98%</p>
                <p className="text-xs text-green-600">24/24 aptos</p>
              </div>
              <Heart className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Medicamentos Vencendo</p>
                <p className="text-2xl font-bold">{expiringItems}</p>
                <p className="text-xs text-amber-600">Próximos 90 dias</p>
              </div>
              <Pill className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                <p className="text-2xl font-bold">{lowStockItems}</p>
                <p className="text-xs text-red-600">Reposição urgente</p>
              </div>
              <Package className="h-8 w-8 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conformidade MLC</p>
                <p className="text-2xl font-bold">100%</p>
                <p className="text-xs text-blue-600">Certificado válido</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant + Records */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Medical Assistant */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-red-500/5 to-pink-500/5 border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-red-500" />
              Assistente Médico IA
              <Badge variant="secondary" className="ml-auto">
                <Sparkles className="h-3 w-3 mr-1" />
                Triagem
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-y-auto space-y-3 mb-4 p-3 bg-background/50 rounded-lg">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Descreva sintomas ou dúvidas..."
                value={chatMessage}
                onChange={handleChange}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={handleSetChatMessage}>
                Dor de cabeça
              </Button>
              <Button variant="outline" size="sm" onClick={handleSetChatMessage}>
                Ferimentos
              </Button>
              <Button variant="outline" size="sm" onClick={handleSetChatMessage}>
                Estoque
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Medical Records */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Atendimentos Recentes
              </CardTitle>
              <Button size="sm">
                <Stethoscope className="h-4 w-4 mr-2" />
                Novo Atendimento
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockRecords.map((record) => (
                <div key={record.id} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${record.type === "Emergência" ? "bg-red-500/10 text-red-600" : "bg-blue-500/10 text-blue-600"}`}>
                        {record.type === "Emergência" ? <AlertTriangle className="h-5 w-5" /> : <Stethoscope className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{record.crewMember}</p>
                        <p className="text-sm text-muted-foreground">{record.date} • {record.type}</p>
                      </div>
                    </div>
                    <Badge variant={record.status === "resolved" ? "default" : record.status === "monitoring" ? "secondary" : "destructive"}>
                      {record.status === "resolved" ? "Resolvido" : record.status === "monitoring" ? "Monitorando" : "Encaminhado"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Sintomas</p>
                      <p>{record.symptoms}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tratamento</p>
                      <p>{record.treatment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical Supplies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Estoque de Medicamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {mockSupplies.map((supply) => (
              <div key={supply.id} className={`p-4 rounded-lg border ${
                supply.status === "critical" ? "bg-red-500/10 border-red-500/30" :
                  supply.status === "expiring" ? "bg-amber-500/10 border-amber-500/30" :
                    supply.status === "low" ? "bg-yellow-500/10 border-yellow-500/30" :
                      "bg-muted/30 border-border"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={supply.status === "ok" ? "outline" : supply.status === "critical" ? "destructive" : "secondary"}>
                    {supply.category}
                  </Badge>
                  {supply.status !== "ok" && <AlertTriangle className={`h-4 w-4 ${supply.status === "critical" ? "text-red-500" : "text-amber-500"}`} />}
                </div>
                <p className="font-medium text-sm">{supply.name}</p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Qtd: {supply.quantity}</span>
                    <span>Mín: {supply.minStock}</span>
                  </div>
                  <Progress value={(supply.quantity / (supply.minStock * 2)) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">Validade: {supply.expiryDate}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

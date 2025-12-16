import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  Droplets,
  Leaf,
  AlertTriangle,
  FileText,
  Brain,
  Sparkles,
  Send,
  Recycle,
  Ship,
  MapPin,
  Calendar,
  CheckCircle2,
  TrendingDown,
} from "lucide-react";

interface WasteTank {
  id: string;
  name: string;
  type: "oily" | "sewage" | "garbage" | "bilge";
  capacity: number;
  currentLevel: number;
  unit: string;
  status: "ok" | "warning" | "critical";
  lastDischarge: string;
}

interface DischargeRecord {
  id: string;
  date: string;
  type: string;
  quantity: number;
  unit: string;
  location: string;
  method: string;
  certificate: string;
}

const mockTanks: WasteTank[] = [
  { id: "1", name: "Tanque de Óleo Usado", type: "oily", capacity: 5000, currentLevel: 3200, unit: "L", status: "warning", lastDischarge: "2024-01-10" },
  { id: "2", name: "Tanque de Esgoto", type: "sewage", capacity: 8000, currentLevel: 2100, unit: "L", status: "ok", lastDischarge: "2024-01-12" },
  { id: "3", name: "Água de Porão", type: "bilge", capacity: 3000, currentLevel: 2800, unit: "L", status: "critical", lastDischarge: "2024-01-05" },
  { id: "4", name: "Resíduos Sólidos", type: "garbage", capacity: 500, currentLevel: 180, unit: "kg", status: "ok", lastDischarge: "2024-01-14" },
];

const mockRecords: DischargeRecord[] = [
  { id: "1", date: "2024-01-14", type: "Resíduos Sólidos", quantity: 120, unit: "kg", location: "Porto de Macaé", method: "Empresa credenciada", certificate: "CERT-2024-001" },
  { id: "2", date: "2024-01-12", type: "Esgoto Sanitário", quantity: 4500, unit: "L", location: "Porto de Macaé", method: "Caminhão limpa-fossa", certificate: "CERT-2024-002" },
  { id: "3", date: "2024-01-10", type: "Óleo Usado", quantity: 2000, unit: "L", location: "Porto de Macaé", method: "Re-refino", certificate: "CERT-2024-003" },
];

export default function WasteDashboard() {
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Olá! Sou o assistente ambiental do Nautilus. Posso ajudar com MARPOL, descarte de resíduos e relatórios ambientais. Como posso ajudar?" },
  ]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setChatHistory(prev => [...prev, { role: "user", content: chatMessage }]);
    
    setTimeout(() => {
      const responses: Record<string, string> = {
        marpol: "MARPOL Anexo I (Óleo): Descarte em alto mar proibido dentro de 12mn da costa. Use separador de água e óleo (OWS) com alarme 15ppm. Registre no Oil Record Book. Anexo IV (Esgoto): Tratamento obrigatório ou descarte >12mn.",
        descarte: "Procedimento de descarte: 1) Verificar nível do tanque, 2) Contactar agente portuário, 3) Solicitar caminhão credenciado, 4) Acompanhar operação, 5) Obter manifesto e certificado, 6) Registrar no Garbage Record Book.",
        relatorio: "Relatórios disponíveis: Oil Record Book (atualizado), Garbage Record Book (atualizado), Sewage Log (atualizado). Próxima auditoria ambiental: 15/02/2024. Conformidade MARPOL: 100%.",
        default: "Posso ajudar com regulamentos MARPOL, procedimentos de descarte, geração de relatórios ou verificar níveis dos tanques. O que precisa?",
      };
      
      const key = chatMessage.toLowerCase().includes("marpol") ? "marpol" 
        : chatMessage.toLowerCase().includes("descart") ? "descarte"
        : chatMessage.toLowerCase().includes("relat") ? "relatorio"
        : "default";
        
      setChatHistory(prev => [...prev, { role: "assistant", content: responses[key] }]);
    }, 1000);
    
    setChatMessage("");
  };

  const criticalTanks = mockTanks.filter(t => t.status === "critical").length;
  const warningTanks = mockTanks.filter(t => t.status === "warning").length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-teal-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conformidade MARPOL</p>
                <p className="text-2xl font-bold">100%</p>
                <p className="text-xs text-teal-600">Todos os anexos</p>
              </div>
              <Leaf className="h-8 w-8 text-teal-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Descartes (Mês)</p>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-blue-600">Todos certificados</p>
              </div>
              <Recycle className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tanques Alerta</p>
                <p className="text-2xl font-bold">{warningTanks}</p>
                <p className="text-xs text-amber-600">&gt;60% capacidade</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tanques Críticos</p>
                <p className="text-2xl font-bold">{criticalTanks}</p>
                <p className="text-xs text-red-600">Descarte urgente</p>
              </div>
              <Droplets className="h-8 w-8 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reciclagem</p>
                <p className="text-2xl font-bold">78%</p>
                <p className="text-xs text-green-600">↑ 5% vs mês anterior</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant + Tanks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Environmental Assistant */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-teal-500/5 to-green-500/5 border-teal-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-teal-500" />
              Assistente MARPOL
              <Badge variant="secondary" className="ml-auto">
                <Sparkles className="h-3 w-3 mr-1" />
                LLM
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
                placeholder="Pergunte sobre MARPOL, descarte..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={() => setChatMessage("Regras MARPOL")}>
                MARPOL
              </Button>
              <Button variant="outline" size="sm" onClick={() => setChatMessage("Como fazer descarte?")}>
                Descarte
              </Button>
              <Button variant="outline" size="sm" onClick={() => setChatMessage("Gerar relatório")}>
                Relatório
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Waste Tanks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                Tanques de Resíduos
              </CardTitle>
              <Button size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Solicitar Descarte
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockTanks.map((tank) => (
                <div key={tank.id} className={`p-4 rounded-lg border ${
                  tank.status === "critical" ? "bg-red-500/10 border-red-500/30" :
                  tank.status === "warning" ? "bg-amber-500/10 border-amber-500/30" :
                  "bg-muted/30 border-border"
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {tank.type === "oily" && <Droplets className="h-5 w-5 text-amber-600" />}
                      {tank.type === "sewage" && <Droplets className="h-5 w-5 text-brown-600" />}
                      {tank.type === "bilge" && <Droplets className="h-5 w-5 text-gray-600" />}
                      {tank.type === "garbage" && <Trash2 className="h-5 w-5 text-green-600" />}
                      <span className="font-medium">{tank.name}</span>
                    </div>
                    <Badge variant={tank.status === "ok" ? "outline" : tank.status === "critical" ? "destructive" : "secondary"}>
                      {tank.status === "ok" ? "Normal" : tank.status === "warning" ? "Alerta" : "Crítico"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{tank.currentLevel} {tank.unit}</span>
                      <span className="text-muted-foreground">/ {tank.capacity} {tank.unit}</span>
                    </div>
                    <Progress value={(tank.currentLevel / tank.capacity) * 100} className={`h-3 ${
                      tank.status === "critical" ? "[&>div]:bg-red-500" :
                      tank.status === "warning" ? "[&>div]:bg-amber-500" : ""
                    }`} />
                    <p className="text-xs text-muted-foreground">Último descarte: {tank.lastDischarge}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discharge Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Registros de Descarte (Garbage/Oil Record Book)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-teal-500/10">
                    <Recycle className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium">{record.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {record.quantity} {record.unit} • {record.method}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {record.location}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {record.date}
                  </span>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {record.certificate}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Voyage Command Center - AI Copilot Tab
 */
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Route, Cloud, Fuel, Clock, DollarSign, AlertTriangle } from "lucide-react";

interface Props {
  aiMessages: { role: string; content: string }[];
  aiCopilotInput: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export function VoyageCopilotTab({ aiMessages, aiCopilotInput, onInputChange, onSend }: Props) {
  const features = [
    { icon: Route, title: "Otimização de Rotas", desc: "Sugere trajetos otimizados considerando clima e correntes" },
    { icon: Cloud, title: "Análise Meteorológica", desc: "Monitora condições e alerta sobre riscos" },
    { icon: Fuel, title: "Eficiência de Combustível", desc: "Calcula consumo e sugere economias" },
    { icon: Clock, title: "Previsão de ETA", desc: "Estima tempo de chegada com precisão" },
    { icon: DollarSign, title: "Análise de Custos", desc: "Identifica oportunidades de economia" },
    { icon: AlertTriangle, title: "Alertas Inteligentes", desc: "Notificações proativas sobre riscos e oportunidades" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Copiloto de Viagens IA
          </CardTitle>
          <CardDescription>Assistente inteligente para otimização de rotas</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {aiMessages.map((msg, idx) => (
              <div key={`ai-msg-${idx}-${msg.role}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Pergunte ao Copiloto IA..."
              value={aiCopilotInput}
              onChange={e => onInputChange(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onSend()}
            />
            <Button onClick={onSend}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recursos do Copiloto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {features.map(f => (
            <div key={f.title} className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <f.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">{f.title}</h4>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

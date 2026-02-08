/**
 * Voice Commands Page
 * Comandos de voz com ARIA para operações hands-free
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mic, MicOff, Volume2, Settings, Activity, 
  CheckCircle, Clock, MessageSquare, Zap, Brain
} from "lucide-react";

const VoiceCommandsPage = () => {
  const [listening, setListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  const recentCommands = [
    { command: "Mostrar status da frota", response: "Exibindo dashboard da frota com 12 embarcações ativas", time: "2 min atrás", success: true },
    { command: "Qual é o consumo de combustível do MT Atlântico?", response: "MT Atlântico: consumo médio 48.5 t/dia nos últimos 7 dias", time: "5 min atrás", success: true },
    { command: "Agendar manutenção do gerador principal", response: "Manutenção agendada para 22/01/2024 às 08:00", time: "10 min atrás", success: true },
    { command: "Enviar relatório de posição", response: "Relatório de posição enviado para escritório central", time: "15 min atrás", success: true }
  ];

  const commandCategories = [
    {
      category: "Navegação",
      icon: "🧭",
      commands: [
        "Mostrar posição atual",
        "Qual é a ETA?",
        "Exibir rota planejada",
        "Calcular distância para próximo porto"
      ]
    },
    {
      category: "Manutenção",
      icon: "🔧",
      commands: [
        "Listar manutenções pendentes",
        "Agendar inspeção",
        "Reportar defeito",
        "Status dos equipamentos"
      ]
    },
    {
      category: "Tripulação",
      icon: "👥",
      commands: [
        "Quem está de serviço?",
        "Listar tripulação a bordo",
        "Verificar horas de descanso",
        "Próximas trocas de tripulação"
      ]
    },
    {
      category: "Relatórios",
      icon: "📊",
      commands: [
        "Gerar relatório de viagem",
        "Enviar noon report",
        "Resumo do bunker",
        "Status de compliance"
      ]
    },
    {
      category: "Segurança",
      icon: "🛡️",
      commands: [
        "Status dos alarmes",
        "Verificar equipamentos de emergência",
        "Iniciar drill de segurança",
        "Reportar incidente"
      ]
    },
    {
      category: "Comunicação",
      icon: "📡",
      commands: [
        "Ligar para escritório",
        "Enviar mensagem para capitão",
        "Verificar emails",
        "Status da conexão satélite"
      ]
    }
  ];

  const stats = {
    commandsToday: 47,
    successRate: 96.8,
    avgResponseTime: "1.2s",
    favoriteCommand: "Mostrar status da frota"
  };

  const toggleListening = () => {
    setListening(!listening);
    if (!listening) {
      // Simular reconhecimento de voz
      setTimeout(() => {
        setLastCommand("Mostrar status do navio");
        setListening(false);
      }, 3000);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Mic className="h-8 w-8 text-primary" />
            ARIA Voice Commands
          </h1>
          <p className="text-muted-foreground mt-1">
            Comandos de voz inteligentes para operações hands-free
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 py-1.5">
            <Brain className="h-4 w-4 text-green-500" />
            NLU Ativo
          </Badge>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Voice Control */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-6">
            <button
              onClick={toggleListening}
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                listening 
                  ? "bg-primary animate-pulse shadow-lg shadow-primary/50" 
                  : "bg-muted hover:bg-primary/20"
              }`}
            >
              {listening ? (
                <Volume2 className="h-16 w-16 text-primary-foreground animate-pulse" />
              ) : (
                <Mic className="h-16 w-16 text-primary" />
              )}
            </button>
            
            <div className="text-center">
              {listening ? (
                <div className="space-y-2">
                  <p className="text-lg font-semibold">Ouvindo...</p>
                  <p className="text-sm text-muted-foreground">Diga seu comando</p>
                  <div className="flex items-center justify-center gap-1">
                    {[1,2,3,4,5].map((i) => (
                      <div 
                        key={i}
                        className="w-1 bg-primary rounded-full animate-pulse"
                        style={{ 
                          height: `${8 + (i * 7) % 24}px`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-semibold">Toque para falar</p>
                  <p className="text-sm text-muted-foreground">
                    Ou diga "Ei ARIA" para ativar
                  </p>
                </div>
              )}
            </div>

            {lastCommand && (
              <div className="p-4 bg-background rounded-lg border max-w-md w-full">
                <p className="text-sm text-muted-foreground">Último comando:</p>
                <p className="font-medium">"{lastCommand}"</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Comandos Hoje</p>
                <p className="text-2xl font-bold">{stats.commandsToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold">{stats.successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Tempo Resposta</p>
                <p className="text-2xl font-bold">{stats.avgResponseTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Mais Usado</p>
                <p className="text-sm font-bold truncate">{stats.favoriteCommand}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="commands" className="space-y-6">
        <TabsList>
          <TabsTrigger value="commands">Comandos Disponíveis</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="commands">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commandCategories.map((cat) => (
              <Card key={cat.category}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-xl">{cat.icon}</span>
                    {cat.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {cat.commands.map((cmd, idx) => (
                      <li 
                        key={idx}
                        className="text-sm text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-2"
                      >
                        <Mic className="h-3 w-3" />
                        "{cmd}"
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Comandos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCommands.map((cmd, idx) => (
                  <div key={idx} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4 text-primary" />
                        <span className="font-medium">"{cmd.command}"</span>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">{cmd.response}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {cmd.success && <CheckCircle className="h-4 w-4 text-green-500" />}
                      <span className="text-xs text-muted-foreground">{cmd.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Voz</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Palavra de Ativação</p>
                    <p className="text-sm text-muted-foreground">"Ei ARIA"</p>
                  </div>
                  <Button variant="outline" size="sm">Alterar</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Idioma</p>
                    <p className="text-sm text-muted-foreground">Português (Brasil)</p>
                  </div>
                  <Button variant="outline" size="sm">Alterar</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Voz de Resposta</p>
                    <p className="text-sm text-muted-foreground">ARIA Feminina</p>
                  </div>
                  <Button variant="outline" size="sm">Alterar</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Confirmação Sonora</p>
                    <p className="text-sm text-muted-foreground">Ativada</p>
                  </div>
                  <Button variant="outline" size="sm">Desativar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VoiceCommandsPage;

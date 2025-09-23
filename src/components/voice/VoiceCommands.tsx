import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Users, 
  Plane, 
  TrendingUp, 
  FileText, 
  Settings,
  Building,
  MapPin
} from 'lucide-react';

interface VoiceCommandsProps {
  onCommand: (command: string) => void;
  isConnected: boolean;
}

const commands = [
  {
    category: "Navegação",
    items: [
      { text: "Abrir dashboard", icon: Home, description: "Ir para página principal" },
      { text: "Mostrar RH", icon: Users, description: "Recursos humanos" },
      { text: "Buscar voos", icon: Plane, description: "Módulo de viagens" },
      { text: "Ver alertas", icon: TrendingUp, description: "Alertas de preço" },
      { text: "Abrir relatórios", icon: FileText, description: "Relatórios do sistema" },
      { text: "Configurações", icon: Settings, description: "Ajustes do sistema" }
    ]
  },
  {
    category: "Consultas",
    items: [
      { text: "Status do sistema", icon: Building, description: "Estado atual" },
      { text: "Certificados vencendo", icon: Users, description: "Alertas de RH" },
      { text: "Voos para São Paulo", icon: MapPin, description: "Busca específica" }
    ]
  }
];

const VoiceCommands: React.FC<VoiceCommandsProps> = ({ onCommand, isConnected }) => {
  return (
    <Card className="w-full max-w-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Comandos de Voz</h3>
        <Badge variant={isConnected ? "default" : "secondary"}>
          {isConnected ? "Conectado" : "Desconectado"}
        </Badge>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Clique nos comandos abaixo ou fale naturalmente com o assistente:
      </div>

      {commands.map((section) => (
        <div key={section.category} className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            {section.category}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {section.items.map((command) => {
              const IconComponent = command.icon;
              return (
                <Button
                  key={command.text}
                  variant="outline"
                  size="sm"
                  onClick={() => onCommand(command.text)}
                  disabled={!isConnected}
                  className="justify-start h-auto p-3 text-left"
                >
                  <div className="flex items-start gap-3 w-full">
                    <IconComponent className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{command.text}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {command.description}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="border-t pt-4">
        <div className="text-xs text-muted-foreground">
          <strong>Dicas:</strong> Você pode falar naturalmente. Por exemplo: "Quero ver os voos para Rio de Janeiro amanhã" 
          ou "Mostre-me os certificados que vencem esta semana".
        </div>
      </div>
    </Card>
  );
};

export default VoiceCommands;
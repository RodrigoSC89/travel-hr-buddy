import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Navigation, 
  BarChart3, 
  FileText, 
  Settings, 
  Ship, 
  MessageSquare,
  Users,
  Play,
  Volume2
} from 'lucide-react';

interface VoiceCommand {
  category: string;
  commands: {
    phrase: string;
    action: string;
    icon: React.ReactNode;
    example: string;
  }[];
}

const voiceCommands: VoiceCommand[] = [
  {
    category: 'Navegação',
    commands: [
      {
        phrase: 'ir para dashboard',
        action: 'Abre o painel principal',
        icon: <Navigation className="h-4 w-4" />,
        example: '"Ir para o dashboard" ou "Abrir painel principal"'
      },
      {
        phrase: 'mostrar analytics',
        action: 'Abre a página de análises',
        icon: <BarChart3 className="h-4 w-4" />,
        example: '"Mostrar analytics" ou "Abrir análises"'
      },
      {
        phrase: 'abrir relatórios',
        action: 'Navega para relatórios',
        icon: <FileText className="h-4 w-4" />,
        example: '"Abrir relatórios" ou "Ver relatórios"'
      }
    ]
  },
  {
    category: 'Módulos',
    commands: [
      {
        phrase: 'gestão marítima',
        action: 'Abre o módulo marítimo',
        icon: <Ship className="h-4 w-4" />,
        example: '"Gestão marítima" ou "Módulo naval"'
      },
      {
        phrase: 'abrir comunicação',
        action: 'Acessa o chat e mensagens',
        icon: <MessageSquare className="h-4 w-4" />,
        example: '"Abrir comunicação" ou "Ver mensagens"'
      },
      {
        phrase: 'painel administrativo',
        action: 'Acessa área de administração',
        icon: <Users className="h-4 w-4" />,
        example: '"Painel administrativo" ou "Área admin"'
      }
    ]
  },
  {
    category: 'Sistema',
    commands: [
      {
        phrase: 'abrir configurações',
        action: 'Acessa as configurações',
        icon: <Settings className="h-4 w-4" />,
        example: '"Abrir configurações" ou "Ver settings"'
      },
      {
        phrase: 'ajuda',
        action: 'Mostra comandos disponíveis',
        icon: <Volume2 className="h-4 w-4" />,
        example: '"Ajuda" ou "Que comandos posso usar?"'
      }
    ]
  }
];

interface VoiceCommandsProps {
  onTestCommand?: (command: string) => void;
}

const VoiceCommands: React.FC<VoiceCommandsProps> = ({ onTestCommand }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            Comandos de Voz Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {voiceCommands.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="font-semibold text-lg mb-3 text-primary">
                  {category.category}
                </h3>
                <div className="grid gap-3">
                  {category.commands.map((command, commandIndex) => (
                    <div 
                      key={commandIndex}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {command.icon}
                            <Badge variant="outline" className="font-mono text-xs">
                              {command.phrase}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {command.action}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            <strong>Exemplos:</strong> {command.example}
                          </div>
                        </div>
                        
                        {onTestCommand && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onTestCommand(command.phrase)}
                            className="ml-2"
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dicas de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <strong>Fale claramente:</strong> O assistente funciona melhor com comandos claros e pausados.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <strong>Use palavras-chave:</strong> Incluir palavras como "abrir", "ir para", "mostrar" ajuda na compreensão.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <strong>Aguarde confirmação:</strong> O assistente confirmará antes de executar navegações.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <strong>Conexão estável:</strong> Certifique-se de ter uma boa conexão para melhor performance.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceCommands;
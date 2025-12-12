/**
import { useCallback, useMemo, useEffect, useState } from "react";;
 * Advanced Voice Commands
 * Reconhecimento de voz contextual por perfil
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mic, MicOff, Volume2, Command, History,
  CheckCircle, XCircle, Loader2, HelpCircle,
  Ship, Wrench, Package, Users, FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceCommand {
  id: string;
  phrase: string;
  action: string;
  module: string;
  timestamp: Date;
  status: "success" | "error" | "processing";
  result?: string;
}

interface AvailableCommand {
  phrase: string;
  description: string;
  module: string;
  icon: React.ReactNode;
}

const availableCommands: AvailableCommand[] = [
  { phrase: "Mostrar status da frota", description: "Exibe o dashboard da frota", module: "Frota", icon: <Ship className="h-4 w-4" /> },
  { phrase: "Abrir manutenções pendentes", description: "Lista ordens de serviço abertas", module: "Manutenção", icon: <Wrench className="h-4 w-4" /> },
  { phrase: "Verificar estoque do Sirius", description: "Mostra estoque a bordo", module: "Estoque", icon: <Package className="h-4 w-4" /> },
  { phrase: "Quem está embarcado no Vega", description: "Lista tripulação atual", module: "Tripulação", icon: <Users className="h-4 w-4" /> },
  { phrase: "Gerar relatório de consumo", description: "Cria relatório de combustível", module: "Relatórios", icon: <FileText className="h-4 w-4" /> },
  { phrase: "Certificados vencendo", description: "Lista certificados próximos do vencimento", module: "Compliance", icon: <FileText className="h-4 w-4" /> },
  { phrase: "Agendar manutenção preventiva", description: "Cria ordem de serviço", module: "Manutenção", icon: <Wrench className="h-4 w-4" /> },
  { phrase: "Comparar fornecedores de óleo", description: "Abre comparador de preços", module: "Compras", icon: <Package className="h-4 w-4" /> }
];

export const VoiceCommandsAdvanced = memo(function() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([
    {
      id: "1",
      phrase: "Mostrar status da frota",
      action: "navigate",
      module: "Dashboard",
      timestamp: new Date(Date.now() - 300000),
      status: "success",
      result: "Dashboard da frota exibido"
    },
    {
      id: "2",
      phrase: "Quantas manutenções estão atrasadas",
      action: "query",
      module: "Manutenção",
      timestamp: new Date(Date.now() - 600000),
      status: "success",
      result: "3 manutenções atrasadas encontradas"
    }
  ]);
  const [showHelp, setShowHelp] = useState(false);

  const processCommand = useCallback(async (text: string) => {
    setIsProcessing(true);
    
    const newCommand: VoiceCommand = {
      id: Date.now().toString(),
      phrase: text,
      action: "processing",
      module: "Sistema",
      timestamp: new Date(),
      status: "processing"
    };
    
    setCommandHistory(prev => [newCommand, ...prev]);

    // Simulate command processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update command with result
    setCommandHistory(prev => prev.map(cmd => 
      cmd.id === newCommand.id 
        ? { 
          ...cmd, 
          status: "success" as const, 
          result: `Comando "${text}" executado com sucesso`,
          action: "executed"
        }
        : cmd
    ));

    setIsProcessing(false);
    setTranscript("");
  }, []);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      if (transcript) {
        processCommand(transcript);
      }
    } else {
      setIsListening(true);
      setTranscript("");
      
      // Simulate voice recognition
      const phrases = [
        "Mostrar status da frota",
        "Verificar estoque crítico",
        "Quem está embarcado hoje"
      ];
      
      setTimeout(() => {
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        let currentText = "";
        const words = randomPhrase.split(" ");
        
        words.forEach((word, index) => {
          setTimeout(() => {
            currentText += (index > 0 ? " " : "") + word;
            setTranscript(currentText);
          }, index * 300);
        });
      }, 500);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "error": return <XCircle className="h-4 w-4 text-destructive" />;
    case "processing": return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
    default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Voice Input */}
      <Card className="border-primary/30">
        <CardContent className="pt-6">
          <div className="text-center">
            <motion.button
              onClick={toggleListening}
              disabled={isProcessing}
              className={`relative inline-flex items-center justify-center w-32 h-32 rounded-full transition-all ${
                isListening 
                  ? "bg-destructive text-destructive-foreground" 
                  : "bg-primary text-primary-foreground"
              }`}
              whileTap={{ scale: 0.95 }}
              animate={isListening ? { 
                boxShadow: ["0 0 0 0 rgba(239, 68, 68, 0.4)", "0 0 0 20px rgba(239, 68, 68, 0)"]
              } : {}}
              transition={isListening ? { 
                duration: 1.5, 
                repeat: Infinity 
              } : {}}
            >
              {isProcessing ? (
                <Loader2 className="h-12 w-12 animate-spin" />
              ) : isListening ? (
                <MicOff className="h-12 w-12" />
              ) : (
                <Mic className="h-12 w-12" />
              )}
            </motion.button>

            <AnimatePresence mode="wait">
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-primary rounded-full"
                          animate={{ height: [8, 24, 8] }}
                          transition={{ 
                            duration: 0.5, 
                            repeat: Infinity, 
                            delay: i * 0.1 
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">Ouvindo...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {transcript && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 rounded-lg bg-muted"
              >
                <p className="text-lg font-medium">"{transcript}"</p>
              </motion.div>
            )}

            <p className="mt-6 text-muted-foreground">
              {isListening 
                ? "Clique para parar e executar o comando" 
                : "Clique no microfone e fale seu comando"}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Command History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Comandos
            </CardTitle>
            <Badge variant="outline">{commandHistory.length} comandos</Badge>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                <AnimatePresence>
                  {commandHistory.map((cmd, index) => (
                    <motion.div
                      key={cmd.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(cmd.status)}
                          <div>
                            <p className="font-medium text-sm">"{cmd.phrase}"</p>
                            {cmd.result && (
                              <p className="text-xs text-muted-foreground mt-1">{cmd.result}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {cmd.module}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {cmd.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Available Commands */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Command className="h-5 w-5" />
              Comandos Disponíveis
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSetShowHelp}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {availableCommands.map((cmd, index) => (
                  <motion.div
                    key={cmd.phrase}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => {
                      setTranscript(cmd.phrase);
                      processCommand(cmd.phrase);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        {cmd.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm flex items-center gap-2">
                          <Volume2 className="h-3 w-3 text-muted-foreground" />
                          "{cmd.phrase}"
                        </p>
                        <p className="text-xs text-muted-foreground">{cmd.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {cmd.module}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tips */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-medium mb-2">Dicas para comandos de voz</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Fale claramente e em português brasileiro</li>
                <li>• Mencione o nome da embarcação quando relevante</li>
                <li>• Use verbos de ação: "mostrar", "abrir", "verificar", "agendar"</li>
                <li>• Aguarde o feedback antes de falar outro comando</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

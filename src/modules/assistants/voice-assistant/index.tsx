import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Volume2, VolumeX, Radio, MessageSquare, Activity, Command } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceCommand {
  timestamp: string;
  transcript: string;
  response: string;
  action?: string;
}

const VoiceAssistant: React.FC = () => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const [volume, setVolume] = useState(1);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "pt-BR";
    recognitionRef.current.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);
      if (event.results[current].isFinal) {
        processCommand(transcriptText);
        setTranscript("");
      }
    };
    recognitionRef.current.onerror = () => setIsListening(false);
    synthRef.current = window.speechSynthesis;
    return () => {
      recognitionRef.current?.stop();
      synthRef.current?.cancel();
    };
  }, [isListening]);

  const toggleListening = () => {
    if (!isSupported) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      toast({ title: "Assistente pausado" });
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        toast({ title: "Assistente ativo", description: "Estou ouvindo..." });
      } catch (error) {
        toast({ title: "Erro ao iniciar", variant: "destructive" });
      }
    }
  };

  const processCommand = async (command: string) => {
    const lowerCommand = command.toLowerCase();
    let response = "";
    let action = "";
    if (lowerCommand.includes("dashboard")) { action = "navigate_dashboard"; response = "Abrindo dashboard..."; setTimeout(() => window.location.href = "/dashboard", 1000); }
    else if (lowerCommand.includes("relatório")) { action = "navigate_reports"; response = "Abrindo relatórios..."; setTimeout(() => window.location.href = "/reports", 1000); }
    else if (lowerCommand.includes("status")) { action = "query_status"; response = "Sistema operando normalmente."; }
    else { response = `Recebi: ${command}. Ainda estou aprendendo essa ação.`; }
    const newCommand: VoiceCommand = { timestamp: new Date().toISOString(), transcript: command, response, action };
    setCommands(prev => [newCommand, ...prev]);
    speak(response);
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.volume = volume;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6"><h1 className="text-3xl font-bold mb-2">Assistente de Voz</h1><p className="text-muted-foreground">PATCH 285 - Real Voice Processing</p></div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card><CardHeader><CardTitle>Controles de Voz</CardTitle></CardHeader><CardContent className="space-y-6">{!isSupported ? (<div className="text-center p-8 text-muted-foreground"><p>Navegador não suportado</p></div>) : (<><div className="flex justify-center"><Button size="lg" variant={isListening ? "destructive" : "default"} className="h-32 w-32 rounded-full" onClick={toggleListening}>{isListening ? (<div className="flex flex-col items-center"><Radio className="h-12 w-12 mb-2 animate-pulse" /><span className="text-xs">Ouvindo...</span></div>) : (<div className="flex flex-col items-center"><Mic className="h-12 w-12 mb-2" /><span className="text-xs">Ativar</span></div>)}</Button></div><div className="flex justify-center gap-4"><Badge variant={isListening ? "default" : "secondary"}>{isListening ? <Mic className="mr-1 h-3 w-3" /> : <MicOff className="mr-1 h-3 w-3" />}{isListening ? "Escutando" : "Pausado"}</Badge><Badge variant={isSpeaking ? "default" : "secondary"}>{isSpeaking ? <Volume2 className="mr-1 h-3 w-3" /> : <VolumeX className="mr-1 h-3 w-3" />}{isSpeaking ? "Falando" : "Silencioso"}</Badge></div>{transcript && (<Card className="bg-muted"><CardContent className="pt-4"><p className="text-sm text-muted-foreground mb-1">Ouvindo:</p><p className="font-medium">{transcript}</p></CardContent></Card>)}</>)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Command className="h-5 w-5" />Comandos Disponíveis</CardTitle></CardHeader><CardContent><ScrollArea className="h-[400px]"><div className="space-y-3"><div className="p-3 border rounded-lg"><p className="font-semibold text-sm mb-1">Navegação</p><ul className="text-sm text-muted-foreground space-y-1"><li>• "Ir para dashboard"</li><li>• "Abrir relatórios"</li></ul></div></div></ScrollArea></CardContent></Card>
      </div>
      <Card className="mt-6"><CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Histórico</CardTitle></CardHeader><CardContent>{commands.length === 0 ? (<p className="text-center text-muted-foreground py-8">Nenhum comando executado ainda</p>) : (<ScrollArea className="h-[300px]"><div className="space-y-4">{commands.map((cmd, index) => (<div key={index} className="border-l-2 border-primary pl-4 py-2"><div className="flex items-center gap-2 mb-2"><MessageSquare className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">{new Date(cmd.timestamp).toLocaleTimeString()}</span>{cmd.action && (<Badge variant="outline" className="text-xs">{cmd.action}</Badge>)}</div><p className="text-sm font-medium mb-1">Você: {cmd.transcript}</p><p className="text-sm text-muted-foreground">Assistente: {cmd.response}</p></div>))}</div></ScrollArea>)}</CardContent></Card>
    </div>
  );
};

export default VoiceAssistant;

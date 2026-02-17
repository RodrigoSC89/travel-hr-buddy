import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, X, Zap } from "lucide-react";

interface CentralComandoAIPanelProps {
  showAIPanel: boolean;
  isAITyping: boolean;
  messages: Array<{ role: string; content: string }>;
  onClose: () => void;
  onSendMessage: (msg: string) => void;
}

export const CentralComandoAIPanel: React.FC<CentralComandoAIPanelProps> = ({
  showAIPanel, isAITyping, messages, onClose, onSendMessage,
}) => {
  return (
    <AnimatePresence>
      {showAIPanel && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 360, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="fixed right-0 top-0 bottom-0 w-[360px] border-l bg-background/95 backdrop-blur-xl overflow-hidden z-[60] pt-16"
        >
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-accent-foreground" />
                <h3 className="font-semibold">Assistente IA</h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {isAITyping ? "Processando..." : "Pronto"}
                </Badge>
                <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8" title="Fechar chat" aria-label="Fechar painel de IA">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-180px)]">
            {messages.map((msg, i) => (
              <Card key={`cmd-msg-${msg.role}-${i}`} className={`${msg.role === 'assistant' ? 'bg-primary/5' : 'bg-muted/50'}`}>
                <CardContent className="p-3">
                  <p className="text-sm">{msg.content}</p>
                </CardContent>
              </Card>
            ))}
            {isAITyping && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-100" />
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-200" />
                </div>
                <span className="text-xs">IA pensando...</span>
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Pergunte algo..."
                className="flex-1 px-3 py-2 rounded-lg border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    onSendMessage(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <Button size="icon" variant="default" aria-label="Enviar comando" title="Enviar">
                <Zap className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

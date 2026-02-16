/**
 * RAG Assistant - Chat Message Component
 */
import { motion } from 'framer-motion';
import { Brain, MessageSquare, FileText, BookOpen, Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { title: string; relevance: number; path?: string }[];
  timestamp: Date;
  feedback?: 'positive' | 'negative';
}

interface ChatMessageProps {
  message: Message;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
  onFeedback: (id: string, feedback: 'positive' | 'negative') => void;
}

export const ChatMessage = ({ message, copiedId, onCopy, onFeedback }: ChatMessageProps) => (
  <motion.div
    key={message.id}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "flex gap-3",
      message.role === 'user' ? 'justify-end' : 'justify-start'
    )}
  >
    {message.role === 'assistant' && (
      <div className="p-2 rounded-full bg-primary/10 h-8 w-8 flex items-center justify-center flex-shrink-0">
        <Brain className="h-4 w-4 text-primary" />
      </div>
    )}
    <div
      className={cn(
        "max-w-[80%] rounded-2xl p-4",
        message.role === 'user'
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted'
      )}
    >
      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
      
      {message.sources && message.sources.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs font-medium mb-2 flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Fontes consultadas:
          </p>
          <div className="space-y-1">
            {message.sources.map((source) => (
              <div
                key={source.title}
                className="flex items-center justify-between text-xs bg-background/50 rounded p-2"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="h-3 w-3" />
                  {source.title}
                </span>
                <Badge variant="outline" className="text-xs">
                  {source.relevance}% relevante
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {message.role === 'assistant' && (
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onCopy(message.content, message.id)}
            aria-label="Copiar resposta"
            title="Copiar"
          >
            {copiedId === message.id ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", message.feedback === 'positive' && "text-success")}
            onClick={() => onFeedback(message.id, 'positive')}
            aria-label="Feedback positivo"
            title="Útil"
          >
            <ThumbsUp className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", message.feedback === 'negative' && "text-destructive")}
            onClick={() => onFeedback(message.id, 'negative')}
            aria-label="Feedback negativo"
            title="Não útil"
          >
            <ThumbsDown className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
    {message.role === 'user' && (
      <div className="p-2 rounded-full bg-primary h-8 w-8 flex items-center justify-center flex-shrink-0">
        <MessageSquare className="h-4 w-4 text-primary-foreground" />
      </div>
    )}
  </motion.div>
);

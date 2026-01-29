/**
 * User Feedback Widget - Coleta feedback dos usuários
 * PATCH 901: Sistema de Feedback
 */

import React, { useState } from 'react';
import { MessageCircle, Star, Send, X, ThumbsUp, ThumbsDown, Bug, Lightbulb, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface UserFeedbackWidgetProps {
  position?: 'bottom-right' | 'bottom-left';
}

type FeedbackType = 'suggestion' | 'bug' | 'question' | 'praise';

const feedbackTypes: { type: FeedbackType; icon: React.ReactNode; label: string; color: string }[] = [
  { type: 'suggestion', icon: <Lightbulb className="h-4 w-4" />, label: 'Sugestão', color: 'text-yellow-500' },
  { type: 'bug', icon: <Bug className="h-4 w-4" />, label: 'Bug', color: 'text-red-500' },
  { type: 'question', icon: <HelpCircle className="h-4 w-4" />, label: 'Dúvida', color: 'text-blue-500' },
  { type: 'praise', icon: <ThumbsUp className="h-4 w-4" />, label: 'Elogio', color: 'text-green-500' },
];

export function UserFeedbackWidget({ position = 'bottom-right' }: UserFeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'rating' | 'type' | 'message'>('rating');
  const [rating, setRating] = useState<number>(0);
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const positionClasses = position === 'bottom-right' 
    ? 'bottom-4 right-4' 
    : 'bottom-4 left-4';

  const handleRatingClick = (value: number) => {
    setRating(value);
    setStep('type');
  };

  const handleTypeClick = (type: FeedbackType) => {
    setFeedbackType(type);
    setStep('message');
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Inserir feedback na tabela existente
      const { error } = await supabase.from('user_feedback').insert({
        rating,
        type: feedbackType,
        title: `Feedback: ${feedbackType}`,
        description: message.trim(),
        page_url: window.location.pathname,
        browser_info: navigator.userAgent,
        status: 'pending',
      } as any);

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Obrigado pelo feedback!",
        description: "Sua opinião é muito importante para nós.",
      });

      // Reset após 2s
      setTimeout(() => {
        setIsOpen(false);
        setStep('rating');
        setRating(0);
        setFeedbackType(null);
        setMessage('');
        setSubmitted(false);
      }, 2000);

    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep('rating');
    setRating(0);
    setFeedbackType(null);
    setMessage('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed z-50 p-3 rounded-full shadow-lg transition-all duration-300",
          "bg-primary text-primary-foreground hover:scale-110",
          "animate-bounce-slow",
          positionClasses
        )}
        aria-label="Enviar feedback"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed z-50 w-80 bg-card border rounded-xl shadow-2xl overflow-hidden",
        "animate-in slide-in-from-bottom-4 duration-300",
        positionClasses
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/50">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Feedback
        </h3>
        <button
          onClick={handleClose}
          className="p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {submitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <ThumbsUp className="h-8 w-8 text-primary" />
            </div>
            <h4 className="font-semibold text-lg">Obrigado!</h4>
            <p className="text-sm text-muted-foreground">Seu feedback foi enviado.</p>
          </div>
        ) : (
          <>
            {/* Step 1: Rating */}
            {step === 'rating' && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Como está sua experiência?
                </p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleRatingClick(value)}
                      className={cn(
                        "p-2 rounded-full transition-all duration-200",
                        "hover:scale-125 hover:bg-primary/10",
                        rating >= value ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      <Star className={cn("h-7 w-7", rating >= value && "fill-current")} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Type */}
            {step === 'type' && (
              <div>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Que tipo de feedback?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {feedbackTypes.map(({ type, icon, label, color }) => (
                    <button
                      key={type}
                      onClick={() => handleTypeClick(type)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border transition-all",
                        "hover:bg-muted hover:border-primary",
                        feedbackType === type && "border-primary bg-muted"
                      )}
                    >
                      <span className={color}>{icon}</span>
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('rating')}
                  className="mt-3 w-full"
                >
                  Voltar
                </Button>
              </div>
            )}

            {/* Step 3: Message */}
            {step === 'message' && (
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Conte-nos mais:
                </p>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Descreva seu feedback..."
                  className="min-h-[100px] resize-none mb-3"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStep('type')}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!message.trim() || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <span className="animate-spin mr-2">⏳</span>
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Enviar
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default UserFeedbackWidget;

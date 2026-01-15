/**
 * Feedback Widget - NPS, Bugs, Feature Requests
 * Floating widget for collecting user feedback
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, Bug, Lightbulb, Star, Send, Loader2,
  ThumbsUp, ThumbsDown, Meh, X
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackData {
  type: 'nps' | 'bug' | 'feature';
  score?: number;
  title?: string;
  description: string;
  email?: string;
  module?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'nps' | 'bug' | 'feature'>('nps');
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [bugData, setBugData] = useState({ title: '', description: '', priority: 'medium' as const });
  const [featureData, setFeatureData] = useState({ title: '', description: '' });
  const [npsComment, setNpsComment] = useState('');

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      let feedbackPayload: FeedbackData;

      switch (activeTab) {
        case 'nps':
          if (npsScore === null) {
            toast.error('Por favor, selecione uma nota');
            setIsSubmitting(false);
            return;
          }
          feedbackPayload = {
            type: 'nps',
            score: npsScore,
            description: npsComment || `NPS Score: ${npsScore}`,
            module: window.location.pathname,
          };
          break;

        case 'bug':
          if (!bugData.title || !bugData.description) {
            toast.error('Preencha título e descrição do bug');
            setIsSubmitting(false);
            return;
          }
          feedbackPayload = {
            type: 'bug',
            title: bugData.title,
            description: bugData.description,
            priority: bugData.priority,
            module: window.location.pathname,
          };
          break;

        case 'feature':
          if (!featureData.title || !featureData.description) {
            toast.error('Preencha título e descrição da sugestão');
            setIsSubmitting(false);
            return;
          }
          feedbackPayload = {
            type: 'feature',
            title: featureData.title,
            description: featureData.description,
            module: window.location.pathname,
          };
          break;

        default:
          throw new Error('Invalid feedback type');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Store feedback in database
      const { error } = await supabase
        .from('ai_feedback_scores' as any)
        .insert({
          command_type: feedbackPayload.type,
          self_score: feedbackPayload.score || 0,
          command_data: feedbackPayload,
          feedback_data: {
            title: feedbackPayload.title,
            description: feedbackPayload.description,
            priority: feedbackPayload.priority,
            module: feedbackPayload.module,
            submitted_at: new Date().toISOString(),
          },
          user_id: user?.id,
        });

      if (error) throw error;

      toast.success('Obrigado pelo seu feedback! 🙏');
      
      // Reset forms
      setNpsScore(null);
      setNpsComment('');
      setBugData({ title: '', description: '', priority: 'medium' });
      setFeatureData({ title: '', description: '' });
      setIsOpen(false);

    } catch (error) {
      console.error('[Feedback] Error submitting:', error);
      toast.error('Erro ao enviar feedback. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNPSLabel = (score: number) => {
    if (score <= 6) return { label: 'Detrator', color: 'text-destructive', icon: ThumbsDown };
    if (score <= 8) return { label: 'Neutro', color: 'text-yellow-500', icon: Meh };
    return { label: 'Promotor', color: 'text-green-500', icon: ThumbsUp };
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-24 right-4 z-50 h-12 w-12 rounded-full shadow-lg md:bottom-6"
          size="icon"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Enviar Feedback</SheetTitle>
          <SheetDescription>
            Sua opinião é importante para melhorarmos o Nauti One
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="nps" className="gap-1">
                <Star className="h-4 w-4" />
                NPS
              </TabsTrigger>
              <TabsTrigger value="bug" className="gap-1">
                <Bug className="h-4 w-4" />
                Bug
              </TabsTrigger>
              <TabsTrigger value="feature" className="gap-1">
                <Lightbulb className="h-4 w-4" />
                Ideia
              </TabsTrigger>
            </TabsList>

            {/* NPS Tab */}
            <TabsContent value="nps" className="space-y-4 mt-4">
              <div>
                <Label className="text-base">
                  De 0 a 10, qual a probabilidade de você recomendar o Nauti One?
                </Label>
                <div className="flex gap-1 mt-3 justify-center flex-wrap">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                    const isSelected = npsScore === score;
                    const scoreInfo = getNPSLabel(score);
                    return (
                      <Button
                        key={score}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        className={`w-9 h-9 ${isSelected ? '' : score <= 6 ? 'hover:border-destructive' : score <= 8 ? 'hover:border-yellow-500' : 'hover:border-green-500'}`}
                        onClick={() => setNpsScore(score)}
                      >
                        {score}
                      </Button>
                    );
                  })}
                </div>
                {npsScore !== null && (
                  <div className="text-center mt-2">
                    <Badge 
                      variant="outline" 
                      className={getNPSLabel(npsScore).color}
                    >
                      {getNPSLabel(npsScore).label}
                    </Badge>
                  </div>
                )}
              </div>
              <div>
                <Label>Comentário (opcional)</Label>
                <Textarea
                  placeholder="O que podemos melhorar?"
                  value={npsComment}
                  onChange={(e) => setNpsComment(e.target.value)}
                  className="mt-1"
                />
              </div>
            </TabsContent>

            {/* Bug Report Tab */}
            <TabsContent value="bug" className="space-y-4 mt-4">
              <div>
                <Label>Título do Bug</Label>
                <Input
                  placeholder="Descreva o problema em poucas palavras"
                  value={bugData.title}
                  onChange={(e) => setBugData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Descrição Detalhada</Label>
                <Textarea
                  placeholder="Passos para reproduzir, o que aconteceu, o que era esperado..."
                  value={bugData.description}
                  onChange={(e) => setBugData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 min-h-24"
                />
              </div>
              <div>
                <Label>Prioridade</Label>
                <RadioGroup
                  value={bugData.priority}
                  onValueChange={(v) => setBugData(prev => ({ ...prev, priority: v as any }))}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low" className="text-sm">Baixa</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="text-sm">Média</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high" className="text-sm">Alta</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="critical" id="critical" />
                    <Label htmlFor="critical" className="text-sm text-destructive">Crítica</Label>
                  </div>
                </RadioGroup>
              </div>
              <p className="text-xs text-muted-foreground">
                Módulo atual: <code>{window.location.pathname}</code>
              </p>
            </TabsContent>

            {/* Feature Request Tab */}
            <TabsContent value="feature" className="space-y-4 mt-4">
              <div>
                <Label>Título da Sugestão</Label>
                <Input
                  placeholder="Qual funcionalidade você gostaria?"
                  value={featureData.title}
                  onChange={(e) => setFeatureData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Explique como essa funcionalidade te ajudaria..."
                  value={featureData.description}
                  onChange={(e) => setFeatureData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 min-h-24"
                />
              </div>
            </TabsContent>
          </Tabs>

          <Button 
            className="w-full mt-6" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Enviar Feedback
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default FeedbackWidget;

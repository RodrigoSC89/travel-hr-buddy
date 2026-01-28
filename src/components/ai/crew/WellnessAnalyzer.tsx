/**
 * Wellness Analyzer - NLP-based wellness analysis component
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Brain, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SentimentResult {
  score: number;
  label: 'positive' | 'neutral' | 'negative' | 'very_negative';
  emotions: Array<{ emotion: string; confidence: number }>;
  concerns: Array<{ type: string; severity: string }>;
}

interface WellnessAnalyzerProps {
  onAnalyze?: (text: string) => Promise<SentimentResult>;
  className?: string;
}

const LABEL_STYLES = {
  positive: { color: 'text-green-500', bg: 'bg-green-500/10', icon: TrendingUp },
  neutral: { color: 'text-gray-500', bg: 'bg-gray-500/10', icon: Minus },
  negative: { color: 'text-orange-500', bg: 'bg-orange-500/10', icon: TrendingDown },
  very_negative: { color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertTriangle },
};

export function WellnessAnalyzer({ onAnalyze, className }: WellnessAnalyzerProps) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    try {
      if (onAnalyze) {
        const analysis = await onAnalyze(text);
        setResult(analysis);
      } else {
        // Mock analysis
        const mockResult: SentimentResult = {
          score: Math.random() * 2 - 1,
          label: 'neutral',
          emotions: [
            { emotion: 'stress', confidence: 0.6 },
            { emotion: 'fatigue', confidence: 0.4 }
          ],
          concerns: []
        };
        mockResult.label = mockResult.score > 0.3 ? 'positive' : 
                          mockResult.score > -0.2 ? 'neutral' : 
                          mockResult.score > -0.5 ? 'negative' : 'very_negative';
        setResult(mockResult);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const labelStyle = result ? LABEL_STYLES[result.label] : null;
  const LabelIcon = labelStyle?.icon || Minus;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-500" />
          Wellness Sentinel
        </CardTitle>
        <CardDescription>
          Análise de sentimentos em comunicações (NLP)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input */}
        <div className="space-y-2">
          <Textarea
            placeholder="Cole aqui o texto da comunicação para análise..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[100px]"
          />
          <Button 
            onClick={handleAnalyze} 
            disabled={!text.trim() || isAnalyzing}
            className="w-full"
          >
            <Brain className="h-4 w-4 mr-2" />
            {isAnalyzing ? 'Analisando...' : 'Analisar Sentimento'}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4 pt-4 border-t">
            {/* Sentiment Score */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LabelIcon className={cn("h-5 w-5", labelStyle?.color)} />
                <span className="font-medium">Sentimento</span>
              </div>
              <Badge className={cn(labelStyle?.bg, labelStyle?.color, "border-0 capitalize")}>
                {result.label.replace('_', ' ')}
              </Badge>
            </div>

            {/* Score Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Negativo</span>
                <span>Positivo</span>
              </div>
              <div className="relative h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full">
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-800 rounded-full shadow"
                  style={{ left: `${((result.score + 1) / 2) * 100}%`, transform: 'translate(-50%, -50%)' }}
                />
              </div>
            </div>

            {/* Emotions */}
            {result.emotions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Emoções Detectadas</p>
                {result.emotions.map((e, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-sm capitalize w-20">{e.emotion}</span>
                    <Progress value={e.confidence * 100} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {(e.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Concerns */}
            {result.concerns.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Alertas de Bem-estar
                </p>
                {result.concerns.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-yellow-500/10 rounded">
                    <span className="text-sm capitalize">{c.type}</span>
                    <Badge variant="outline" className={cn(
                      c.severity === 'critical' && "border-red-500 text-red-500",
                      c.severity === 'high' && "border-orange-500 text-orange-500",
                      c.severity === 'medium' && "border-yellow-500 text-yellow-500"
                    )}>
                      {c.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WellnessAnalyzer;

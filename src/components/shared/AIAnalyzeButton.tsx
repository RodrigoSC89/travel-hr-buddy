import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Loader2, Sparkles, FileText, Download } from 'lucide-react';
import { useESGWasteAI } from '@/hooks/useESGWasteAI';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface AIAnalyzeButtonProps {
  analysisType: 'emissions' | 'waste' | 'compliance' | 'report';
  data: Record<string, unknown>;
  label?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const analysisConfig = {
  emissions: {
    title: 'Análise de Emissões',
    description: 'Análise detalhada de emissões com recomendações de redução',
    icon: '🌿',
  },
  waste: {
    title: 'Análise de Resíduos',
    description: 'Classificação e recomendações de gestão de resíduos',
    icon: '♻️',
  },
  compliance: {
    title: 'Verificação de Compliance',
    description: 'Análise de conformidade regulatória (IMO, MARPOL, EU MRV)',
    icon: '✅',
  },
  report: {
    title: 'Gerar Relatório IA',
    description: 'Relatório executivo gerado por inteligência artificial',
    icon: '📊',
  },
};

export function AIAnalyzeButton({
  analysisType,
  data,
  label,
  variant = 'outline',
  size = 'sm',
  className,
}: AIAnalyzeButtonProps) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { 
    analyzeEmissions, 
    classifyWaste, 
    checkCompliance, 
    generateReport, 
    isLoading 
  } = useESGWasteAI();

  const config = analysisConfig[analysisType];

  const runAnalysis = async () => {
    setResult(null);
    let response: string | null = null;

    switch (analysisType) {
      case 'emissions':
        response = await analyzeEmissions(data);
        break;
      case 'waste':
        response = await classifyWaste(JSON.stringify(data));
        break;
      case 'compliance':
        response = await checkCompliance(data);
        break;
      case 'report':
        response = await generateReport('executive', data);
        break;
    }

    if (response) {
      setResult(response);
    }
  };

  const handleExport = () => {
    if (!result) return;
    
    const blob = new Blob([result], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise-ia-${analysisType}-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Relatório exportado com sucesso');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Brain className="h-4 w-4 mr-2" />
          {label || config.title}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{config.icon}</span>
            {config.title}
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              IA
            </Badge>
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!result && !isLoading && (
            <div className="text-center py-8">
              <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground mb-4">
                Clique em "Iniciar Análise" para a IA processar os dados
              </p>
              <Button onClick={runAnalysis}>
                <Sparkles className="h-4 w-4 mr-2" />
                Iniciar Análise
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Processando análise com IA...</p>
              <p className="text-xs text-muted-foreground mt-1">Isso pode levar alguns segundos</p>
            </div>
          )}

          {result && (
            <>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={runAnalysis} disabled={isLoading}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Reanalisar
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar MD
                </Button>
              </div>
              <ScrollArea className="h-[400px] rounded-lg border p-4 bg-muted/30">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

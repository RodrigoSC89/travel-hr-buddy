import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { 
  PEOTRAM_SCORING, 
  NC_CLASSIFICATIONS,
  type PeotramItem,
  type PeotramElement 
} from "./peotram-13-elements-data";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  HelpCircle,
  Upload,
  Camera,
  Mic,
  FileText,
  Brain,
  ChevronLeft,
  ChevronRight,
  Save,
  Sparkles
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ItemEvaluation {
  itemId: string;
  score: number | null;
  status: 'compliant' | 'non_compliant' | 'observation' | 'not_applicable' | 'pending';
  ncClassification?: string;
  auditorNotes: string;
  photographicEvidence: string[];
  documentaryEvidence: string[];
}

interface PeotramItemEvaluatorProps {
  element: PeotramElement;
  item: PeotramItem;
  evaluation?: ItemEvaluation;
  onSave: (evaluation: ItemEvaluation) => void;
  onGenerateEvidence?: () => void;
  onVoiceChat?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export const PeotramItemEvaluator: React.FC<PeotramItemEvaluatorProps> = ({
  element,
  item,
  evaluation,
  onSave,
  onGenerateEvidence,
  onVoiceChat,
  onNext,
  onPrevious,
  hasNext = true,
  hasPrevious = true
}) => {
  const [currentEvaluation, setCurrentEvaluation] = useState<ItemEvaluation>(
    evaluation || {
      itemId: item.id,
      score: null,
      status: 'pending',
      auditorNotes: '',
      photographicEvidence: [],
      documentaryEvidence: []
    }
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleScoreChange = (scoreKey: string) => {
    const scoreData = PEOTRAM_SCORING[scoreKey];
    let status: ItemEvaluation['status'] = 'pending';
    
    if (scoreKey === 'NA') {
      status = 'not_applicable';
    } else if (scoreData.value !== null && scoreData.value >= 3) {
      status = 'compliant';
    } else if (scoreData.value !== null && scoreData.value <= 1) {
      status = 'non_compliant';
    } else if (scoreData.value === 2) {
      status = 'observation';
    }

    setCurrentEvaluation(prev => ({
      ...prev,
      score: scoreData.value,
      status
    }));
  };

  const handleNCClassification = (code: string) => {
    setCurrentEvaluation(prev => ({
      ...prev,
      ncClassification: code
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(currentEvaluation);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusIcon = () => {
    switch (currentEvaluation.status) {
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'non_compliant':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'observation':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'not_applicable':
        return <HelpCircle className="w-5 h-5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="outline" className="mb-2">
              Elemento {element.elementNumber} - {element.elementSigla}
            </Badge>
            <CardTitle className="flex items-center gap-2">
              Item {item.itemNumber}
              {getStatusIcon()}
            </CardTitle>
          </div>
          <Badge 
            className={
              item.criticalityLevel === 'critical' ? 'bg-destructive text-destructive-foreground' :
              item.criticalityLevel === 'major' ? 'bg-warning text-warning-foreground' :
              'bg-muted text-muted-foreground'
            }
          >
            {item.criticalityLevel.toUpperCase()}
          </Badge>
        </div>
        <CardDescription className="mt-2 text-base">
          {item.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Requisito e Referência */}
        <div className="p-4 bg-muted/30 rounded-lg space-y-3">
          <div>
            <Label className="text-sm font-medium">Requisito:</Label>
            <p className="text-sm text-muted-foreground mt-1">{item.requirement}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Referência Normativa:</Label>
            <Badge variant="outline" className="ml-2">{item.normReference}</Badge>
          </div>
        </div>

        {/* Evidências Necessárias */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Evidências Necessárias:</Label>
          <div className="flex flex-wrap gap-2">
            {item.evidenceRequired.map((evidence) => (
              <Badge key={evidence} variant="secondary" className="text-xs">
                {evidence}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Pontuação */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Avaliação:</Label>
          <RadioGroup 
            value={currentEvaluation.score?.toString() ?? 'pending'}
            onValueChange={handleScoreChange}
            className="grid grid-cols-2 md:grid-cols-3 gap-3"
          >
            {Object.entries(PEOTRAM_SCORING).map(([key, criteria]) => (
              <TooltipProvider key={key}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <RadioGroupItem 
                        value={key} 
                        id={`score-${key}`} 
                        className="peer sr-only" 
                      />
                      <Label
                        htmlFor={`score-${key}`}
                        className={`flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all
                          peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5
                          hover:bg-muted/50 ${
                            currentEvaluation.score === criteria.value ? 'border-primary bg-primary/5' : ''
                          }`}
                      >
                        <span className="text-2xl font-bold" style={{ color: criteria.color }}>
                          {key}
                        </span>
                        <span className="text-xs text-center mt-1">{criteria.label}</span>
                        <span className="text-xs text-muted-foreground">{criteria.percentage}%</span>
                      </Label>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{criteria.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </RadioGroup>
        </div>

        {/* Classificação NC (se não conforme) */}
        {currentEvaluation.status === 'non_compliant' && (
          <div>
            <Label className="text-sm font-medium mb-3 block">Classificação da Não-Conformidade:</Label>
            <RadioGroup 
              value={currentEvaluation.ncClassification}
              onValueChange={handleNCClassification}
              className="grid grid-cols-4 gap-3"
            >
              {Object.entries(NC_CLASSIFICATIONS).map(([key, nc]) => (
                <div key={key} className="relative">
                  <RadioGroupItem 
                    value={key} 
                    id={`nc-${key}`} 
                    className="peer sr-only" 
                  />
                  <Label
                    htmlFor={`nc-${key}`}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all
                      peer-data-[state=checked]:border-destructive peer-data-[state=checked]:bg-destructive/5
                      hover:bg-muted/50`}
                    style={{ borderColor: currentEvaluation.ncClassification === key ? nc.color : undefined }}
                  >
                    <span className="text-xl font-bold" style={{ color: nc.color }}>
                      {nc.code}
                    </span>
                    <span className="text-xs text-center">{nc.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        <Separator />

        {/* Notas do Auditor */}
        <div>
          <Label htmlFor="notes" className="text-sm font-medium mb-2 block">
            Notas do Auditor:
          </Label>
          <Textarea
            id="notes"
            value={currentEvaluation.auditorNotes}
            onChange={(e) => setCurrentEvaluation(prev => ({ ...prev, auditorNotes: e.target.value }))}
            placeholder="Observações, detalhes da verificação, justificativas..."
            rows={4}
          />
        </div>

        {/* Upload de Evidências */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Anexar Evidências:</Label>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload Arquivo
            </Button>
            <Button variant="outline" size="sm">
              <Camera className="w-4 h-4 mr-2" />
              Tirar Foto
            </Button>
            <Button variant="outline" size="sm">
              <Mic className="w-4 h-4 mr-2" />
              Gravar Áudio
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Vincular Documento
            </Button>
          </div>
        </div>

        {/* Ações IA */}
        {currentEvaluation.status === 'non_compliant' && (
          <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-medium">Assistência IA</span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onGenerateEvidence}
                className="border-primary/30 hover:bg-primary/10"
              >
                <Brain className="w-4 h-4 mr-2 text-primary" />
                Gerar Evidência Automática
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onVoiceChat}
                className="border-primary/30 hover:bg-primary/10"
              >
                <Mic className="w-4 h-4 mr-2 text-primary" />
                Consultar IA por Voz
              </Button>
            </div>
          </div>
        )}

        <Separator />

        {/* Navegação */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={onPrevious}
            disabled={!hasPrevious}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          
          <Button 
            onClick={handleSave}
            disabled={isSaving || currentEvaluation.status === 'pending'}
            className="bg-primary"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Avaliação'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onNext}
            disabled={!hasNext}
          >
            Próximo
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PeotramItemEvaluator;

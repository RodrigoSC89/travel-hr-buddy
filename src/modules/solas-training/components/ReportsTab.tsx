import { useState } from "react";;;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSOLASAI } from "../hooks/useSolasAI";
import { FileText, Download, Calendar, Loader2, Brain, Sparkles, FileCheck } from "lucide-react";
import { Drill, Certification, CrewMember } from "../types";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";

interface ReportsTabProps {
  drills: Drill[];
  certifications: Certification[];
  crewMembers: CrewMember[];
}

export default function ReportsTab({ drills, certifications, crewMembers }: ReportsTabProps) {
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [reportType, setReportType] = useState<string>("compliance");
  const { toast } = useToast();
  const { isLoading, generateReport, predictTraining, suggestSchedule } = useSOLASAI();

  const handleGenerateReport = async (type: string) => {
    setReportType(type);
    let result: string | null = null;
    
    if (type === "compliance") {
      result = await generateReport({ drills, certifications, crewMembers });
    } else if (type === "prediction") {
      result = await predictTraining({ drills, certifications, crewMembers });
    } else if (type === "schedule") {
      result = await suggestSchedule({ drills, crewMembers });
    }

    if (result) {
      setGeneratedReport(result);
      toast({ title: "Relatório Gerado", description: "O relatório foi gerado com sucesso pela IA." });
    }
  };

  const handleDownload = () => {
    if (!generatedReport) return;
    const blob = new Blob([generatedReport], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-solas-${format(new Date(), "yyyy-MM-dd")}.md`;
    a.click();
    toast({ title: "Download Iniciado", description: "O relatório está sendo baixado." });
  };

  const reportTypes = [
    { id: "compliance", name: "Relatório de Conformidade ISM", description: "Status geral de conformidade SOLAS/ISM", icon: FileCheck },
    { id: "prediction", name: "Análise Preditiva", description: "Previsão de necessidades de treinamento", icon: Brain },
    { id: "schedule", name: "Cronograma Sugerido", description: "Plano otimizado de drills", icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportTypes.map(type => (
          <Card key={type.id} className={`cursor-pointer transition-all hover:border-primary ${reportType === type.id ? "border-primary bg-primary/5" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <type.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{type.name}</h4>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              </div>
              <Button className="w-full mt-4" size="sm" onClick={() => handleGenerateReport(type.id)} disabled={isLoading}>
                {isLoading && reportType === type.id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Gerar com IA
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {generatedReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatório Gerado
                <Badge variant="secondary"><Sparkles className="h-3 w-3 mr-1" />IA</Badge>
              </span>
              <Button size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] p-4 bg-muted/30 rounded-lg">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{generatedReport}</ReactMarkdown>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Eye, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export function DocumentProcessingAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["doc-processing-analytics"],
    queryFn: async () => {
      const { data: docs, error } = await supabase
        .from("ai_documents")
        .select("id, ocr_status, file_type, confidence_score, created_at, file_size_bytes")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return docs || [];
    },
    staleTime: 60000,
  });

  if (isLoading) {
    return <Card className="animate-pulse"><CardContent className="h-64" /></Card>;
  }

  const docs = data || [];
  const total = docs.length;
  const completed = docs.filter(d => d.ocr_status === "completed").length;
  const pending = docs.filter(d => d.ocr_status === "pending").length;
  const failed = docs.filter(d => d.ocr_status === "error" || d.ocr_status === "failed").length;
  const avgConfidence = docs.filter(d => d.confidence_score).reduce((s, d) => s + (d.confidence_score || 0), 0) / (docs.filter(d => d.confidence_score).length || 1);
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // File type distribution
  const typeMap: Record<string, number> = {};
  docs.forEach(d => {
    const t = d.file_type || "unknown";
    typeMap[t] = (typeMap[t] || 0) + 1;
  });
  const topTypes = Object.entries(typeMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Total size
  const totalSizeMB = docs.reduce((s, d) => s + (d.file_size_bytes || 0), 0) / (1024 * 1024);

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Document Processing Analytics
          <Badge variant="outline" className="ml-auto text-xs">{total} docs</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* OCR Pipeline Status */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <CheckCircle className="h-4 w-4 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">{completed}</p>
            <p className="text-[10px] text-muted-foreground">Processados</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Clock className="h-4 w-4 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-warning">{pending}</p>
            <p className="text-[10px] text-muted-foreground">Na Fila</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <AlertTriangle className="h-4 w-4 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold text-destructive">{failed}</p>
            <p className="text-[10px] text-muted-foreground">Falhas</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Eye className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{avgConfidence.toFixed(0)}%</p>
            <p className="text-[10px] text-muted-foreground">Confiança</p>
          </div>
        </div>

        {/* Completion Rate */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Taxa de Processamento</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* File Type Distribution */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Tipos de Documento</p>
          <div className="flex flex-wrap gap-1.5">
            {topTypes.map(([type, count]) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type.toUpperCase()} ({count})
              </Badge>
            ))}
          </div>
        </div>

        {/* Storage */}
        <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t border-border/30">
          <span>Armazenamento total</span>
          <span className="font-medium text-foreground">{totalSizeMB.toFixed(1)} MB</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default DocumentProcessingAnalytics;

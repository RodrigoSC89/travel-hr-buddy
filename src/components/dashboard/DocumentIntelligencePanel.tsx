/**
 * Document Intelligence Panel - Wave 22
 * Real-time document processing and OCR analytics
 */

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, FileCheck, FileClock, FileWarning, Brain, Scan } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DocumentIntelligencePanel() {
  const { data: docs = [] } = useQuery({
    queryKey: ['dip-docs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ai_documents')
        .select('id, file_name, file_type, ocr_status, confidence_score, category, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['dip-templates'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ai_document_templates')
        .select('id, title, template_type')
        .limit(20);
      return data || [];
    },
    staleTime: 60000,
  });

  const metrics = useMemo(() => {
    const processed = docs.filter((d) => d.ocr_status === 'completed');
    const pending = docs.filter((d) => d.ocr_status === 'pending' || d.ocr_status === 'processing');
    const failed = docs.filter((d) => d.ocr_status === 'failed');
    const avgConf = processed.length > 0
      ? Math.round(processed.reduce((s, d) => s + (d.confidence_score || 0), 0) / processed.length * 100)
      : 0;

    // Category distribution
    const cats = new Map<string, number>();
    docs.forEach((d) => {
      const cat = d.category || d.file_type || 'other';
      cats.set(cat, (cats.get(cat) || 0) + 1);
    });
    const topCategories = Array.from(cats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      total: docs.length,
      processed: processed.length,
      pending: pending.length,
      failed: failed.length,
      avgConfidence: avgConf,
      templates: templates.length,
      topCategories,
    };
  }, [docs, templates]);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Scan className="h-5 w-5 text-primary" />
            Document Intelligence
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">{metrics.total} docs</Badge>
            {metrics.pending > 0 && (
              <Badge variant="outline" className="text-xs bg-warning/10 text-warning">{metrics.pending} processando</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total', value: metrics.total, icon: FileText, color: 'text-foreground' },
            { label: 'OCR OK', value: metrics.processed, icon: FileCheck, color: 'text-success' },
            { label: 'Pendentes', value: metrics.pending, icon: FileClock, color: 'text-warning' },
            { label: 'Templates', value: metrics.templates, icon: Brain, color: 'text-primary' },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="text-center p-2 rounded-lg bg-muted/30"
            >
              <kpi.icon className={`h-4 w-4 mx-auto mb-1 ${kpi.color}`} />
              <div className="text-lg font-bold">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Confidence bar */}
        {metrics.avgConfidence > 0 && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">OCR Confidence Média</span>
              <span className="font-medium">{metrics.avgConfidence}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${metrics.avgConfidence >= 85 ? 'bg-success' : metrics.avgConfidence >= 60 ? 'bg-warning' : 'bg-destructive'}`}
                initial={{ width: 0 }}
                animate={{ width: `${metrics.avgConfidence}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        )}

        {/* Failed docs alert */}
        {metrics.failed > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 text-destructive text-xs">
            <FileWarning className="h-3.5 w-3.5" />
            <span>{metrics.failed} documentos com falha no OCR</span>
          </div>
        )}

        {/* Recent docs */}
        <div className="space-y-1.5">
          <span className="text-xs text-muted-foreground font-medium">Documentos Recentes</span>
          {docs.slice(0, 6).map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted/30 transition-colors"
            >
              <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs truncate flex-1">{doc.file_name}</span>
              <Badge variant="outline" className={`text-[9px] h-4 ${
                doc.ocr_status === 'completed' ? 'text-success' : doc.ocr_status === 'failed' ? 'text-destructive' : 'text-warning'
              }`}>
                {doc.ocr_status}
              </Badge>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true, locale: ptBR })}
              </span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

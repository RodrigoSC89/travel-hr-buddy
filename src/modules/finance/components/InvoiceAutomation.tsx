/**
 * Invoice Automation Component
 * OCR + AI for automatic invoice processing
 */
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, Upload, Check, X, AlertTriangle, 
  Brain, Loader2, Eye, DollarSign, Calendar,
  Building2, Sparkles
} from 'lucide-react';
import { useFinanceProcurementAI, InvoiceProcessingResult } from '@/hooks/useFinanceProcurementAI';
import { motion } from 'framer-motion';

interface ProcessedInvoice {
  id: string;
  invoiceNumber: string;
  vendor: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'review';
  confidence: number;
  decision: string;
  issues: string[];
}

const mockInvoices: ProcessedInvoice[] = [
  { id: '1', invoiceNumber: 'INV-2024-0125', vendor: 'Shell Marine', amount: 45000, dueDate: '2024-02-15', status: 'approved', confidence: 98, decision: 'auto_approve', issues: [] },
  { id: '2', invoiceNumber: 'INV-2024-0126', vendor: 'MAN Energy', amount: 125000, dueDate: '2024-02-20', status: 'review', confidence: 72, decision: 'escalate', issues: ['Valor difere do PO em 5%'] },
  { id: '3', invoiceNumber: 'INV-2024-0127', vendor: 'Unknown Vendor', amount: 8500, dueDate: '2024-02-10', status: 'rejected', confidence: 45, decision: 'reject', issues: ['Fornecedor não cadastrado', 'Sem PO correspondente'] },
];

export function InvoiceAutomation() {
  const { isLoading, processInvoice } = useFinanceProcurementAI();
  const [invoices, setInvoices] = useState<ProcessedInvoice[]>(mockInvoices);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Simulate processing
      const newInvoice: ProcessedInvoice = {
        id: Date.now().toString(),
        invoiceNumber: `INV-2024-${Math.floor(Math.random() * 9000) + 1000}`,
        vendor: 'Processing...',
        amount: 0,
        dueDate: new Date().toISOString().split('T')[0],
        status: 'processing',
        confidence: 0,
        decision: '',
        issues: []
      };
      
      setInvoices(prev => [newInvoice, ...prev]);

      // Simulate AI processing
      setTimeout(() => {
        setInvoices(prev => prev.map(inv => 
          inv.id === newInvoice.id 
            ? {
                ...inv,
                vendor: 'Maritime Supplies Co.',
                amount: 32500,
                status: 'approved',
                confidence: 94,
                decision: 'auto_approve',
                issues: []
              }
            : inv
        ));
      }, 3000);
    }
  }, []);

  const statusConfig: Record<ProcessedInvoice['status'], { icon: React.ElementType; color: string; label: string }> = {
    pending: { icon: Clock, color: 'bg-gray-500', label: 'Pendente' },
    processing: { icon: Loader2, color: 'bg-blue-500', label: 'Processando' },
    approved: { icon: Check, color: 'bg-green-500', label: 'Aprovado' },
    rejected: { icon: X, color: 'bg-red-500', label: 'Rejeitado' },
    review: { icon: AlertTriangle, color: 'bg-amber-500', label: 'Revisão' }
  };

  const stats = {
    total: invoices.length,
    approved: invoices.filter(i => i.status === 'approved').length,
    rejected: invoices.filter(i => i.status === 'rejected').length,
    review: invoices.filter(i => i.status === 'review').length,
    autoRate: invoices.length > 0 
      ? (invoices.filter(i => i.status === 'approved').length / invoices.length) * 100 
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Automação de Faturas
          </h2>
          <p className="text-muted-foreground">
            OCR + IA processa, valida e aprova faturas automaticamente
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            <Sparkles className="h-4 w-4 mr-1 text-primary" />
            {stats.autoRate.toFixed(0)}% auto-aprovação
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Processado</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovados</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Revisão</p>
                <p className="text-2xl font-bold text-amber-600">{stats.review}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejeitados</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <X className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="pt-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Arraste faturas aqui</p>
            <p className="text-sm text-muted-foreground mt-1">
              PDF, imagens ou documentos escaneados
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              <Brain className="h-4 w-4 inline mr-1" />
              IA extrai dados automaticamente via OCR
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>Faturas Processadas</CardTitle>
          <CardDescription>Histórico de processamento com decisões da IA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice, idx) => {
              const config = statusConfig[invoice.status];
              const StatusIcon = config.icon;
              
              return (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <StatusIcon className={`h-5 w-5 text-white ${invoice.status === 'processing' ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        {invoice.vendor}
                      </div>
                      {invoice.issues.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {invoice.issues.map((issue, i) => (
                            <Badge key={i} variant="destructive" className="text-xs">
                              {issue}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold">${invoice.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {invoice.dueDate}
                      </div>
                    </div>

                    <div className="text-center min-w-[80px]">
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                        <Brain className="h-3 w-3" />
                        Confiança
                      </div>
                      <Progress value={invoice.confidence} className="h-2 w-16" />
                      <span className="text-xs font-medium">{invoice.confidence}%</span>
                    </div>

                    <Badge className={config.color}>
                      {config.label}
                    </Badge>

                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

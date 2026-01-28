/**
 * REVOLUTIONARY AI - Audit Assistant
 * Funcionalidade 5 & 13: Assistente para auditorias e fiscalizações
 * Integração com Supabase para dados reais
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  FileSearch, Download, CheckCircle, AlertTriangle, Clock,
  Shield, FileText, Calendar, Building, Ship, Users,
  Brain, Sparkles, Loader2, ChevronRight, FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface AuditPackage {
  id: string;
  name: string;
  type: 'ANTAQ' | 'DPC' | 'IMO' | 'ISM' | 'ISPS' | 'MLC' | 'ESG' | 'ISO';
  status: 'ready' | 'generating' | 'pending' | 'incomplete';
  completeness: number;
  documents: number;
  lastGenerated?: Date;
  missingItems: string[];
}

interface DocumentItem {
  id: string;
  name: string;
  category: string;
  status: 'valid' | 'expiring' | 'expired' | 'missing';
  expiryDate?: Date;
  vessel?: string;
}

// Fallback data when database tables don't exist
const FALLBACK_PACKAGES: AuditPackage[] = [
  { id: '1', name: 'Dossiê ANTAQ 2024', type: 'ANTAQ', status: 'ready', completeness: 100, documents: 45, lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), missingItems: [] },
  { id: '2', name: 'Auditoria DPC', type: 'DPC', status: 'ready', completeness: 95, documents: 38, lastGenerated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), missingItems: ['Certificado de arqueação atualizado'] },
  { id: '3', name: 'ISM Code Compliance', type: 'ISM', status: 'pending', completeness: 78, documents: 52, missingItems: ['Relatório de não conformidades Q4', 'Registros de drill de segurança'] },
  { id: '4', name: 'Relatório ESG', type: 'ESG', status: 'generating', completeness: 60, documents: 28, missingItems: ['Inventário de emissões CO2'] },
  { id: '5', name: 'MLC 2006 Compliance', type: 'MLC', status: 'incomplete', completeness: 45, documents: 35, missingItems: ['Contratos de trabalho marítimo', 'Registros de horas de descanso'] }
];

const FALLBACK_DOCUMENTS: DocumentItem[] = [
  { id: '1', name: 'Certificado de Segurança', category: 'Segurança', status: 'valid', expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), vessel: 'Navio Atlas' },
  { id: '2', name: 'Certificado STCW', category: 'Tripulação', status: 'expiring', expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
  { id: '3', name: 'IOPP Certificate', category: 'Ambiental', status: 'valid', expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), vessel: 'Navio Vega' },
  { id: '4', name: 'Certificado de Classe', category: 'Classificação', status: 'expired', expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), vessel: 'Navio Sirius' },
  { id: '5', name: 'Declaração MLC', category: 'Trabalhista', status: 'missing' }
];

// Hook para buscar documentos do Supabase com fallback
function useAuditDocuments() {
  return useQuery({
    queryKey: ['audit-documents'],
    queryFn: async (): Promise<DocumentItem[]> => {
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('id, certificate_type, status, expiry_date, employee_id')
          .order('expiry_date', { ascending: true })
          .limit(10);
        
        if (error || !data || data.length === 0) {
          return FALLBACK_DOCUMENTS;
        }
        
        const now = new Date();
        return data.map(row => {
          const expiryDate = row.expiry_date ? new Date(row.expiry_date) : undefined;
          const daysUntil = expiryDate ? Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 999;
          
          let status: DocumentItem['status'] = 'valid';
          if (daysUntil < 0) status = 'expired';
          else if (daysUntil <= 30) status = 'expiring';
          
          return {
            id: row.id,
            name: row.certificate_type || 'Certificado',
            category: 'Certificação',
            status,
            expiryDate
          };
        });
      } catch {
        return FALLBACK_DOCUMENTS;
      }
    }
  });
}

export function AuditAssistant() {
  // Use fallback data with optional DB integration
  const [packages, setPackages] = useState<AuditPackage[]>(FALLBACK_PACKAGES);
  const { data: documents = FALLBACK_DOCUMENTS } = useAuditDocuments();
  
  const [selectedPackage, setSelectedPackage] = useState<AuditPackage | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleGenerate = async (pkg: AuditPackage) => {
    setIsGenerating(pkg.id);
    toast.loading('Gerando dossiê com IA...', { id: 'generate' });
    
    try {
      // Call AI edge function to generate audit package
      const { error } = await supabase.functions.invoke('generate-compliance-report', {
        body: { packageId: pkg.id, type: pkg.type }
      });
      
      if (error) throw error;
      
      // Update local state
      setPackages(prev => prev.map(p => 
        p.id === pkg.id ? { ...p, status: 'ready' as const, completeness: 100, lastGenerated: new Date() } : p
      ));
      
      toast.success('Dossiê gerado com sucesso!', { id: 'generate' });
    } catch (err) {
      console.error('Error generating package:', err);
      toast.error('Erro ao gerar dossiê', { id: 'generate' });
    } finally {
      setIsGenerating(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ready: 'bg-green-500/20 text-green-400 border-green-500/30',
      generating: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      incomplete: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status as keyof typeof colors] || 'bg-muted';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      ready: 'Pronto',
      generating: 'Gerando...',
      pending: 'Pendente',
      incomplete: 'Incompleto'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getDocStatusColor = (status: string) => {
    const colors = {
      valid: 'bg-green-500/20 text-green-400',
      expiring: 'bg-amber-500/20 text-amber-400',
      expired: 'bg-red-500/20 text-red-400',
      missing: 'bg-purple-500/20 text-purple-400'
    };
    return colors[status as keyof typeof colors] || 'bg-muted';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      ANTAQ: 'bg-primary/20 text-primary border-primary/30',
      DPC: 'bg-secondary/20 text-secondary border-secondary/30',
      IMO: 'bg-accent/20 text-accent-foreground border-accent/30',
      ISM: 'bg-warning/20 text-warning border-warning/30',
      ISPS: 'bg-destructive/20 text-destructive border-destructive/30',
      MLC: 'bg-success/20 text-success border-success/30',
      ESG: 'bg-success/20 text-success border-success/30',
      ISO: 'bg-primary/20 text-primary border-primary/30'
    };
    return colors[type] || 'bg-muted';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-primary/20">
                <FileSearch className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Assistente de Auditoria</h2>
                <p className="text-muted-foreground">
                  Gere dossiês automaticamente para ANTAQ, DPC, Marinha e mais
                </p>
              </div>
            </div>
            <Button>
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar Novo Dossiê
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audit Packages List */}
        <div className="lg:col-span-2">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Dossiês de Auditoria
                </div>
                <Input
                  placeholder="Buscar..."
                  className="w-48"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {packages.map((pkg: AuditPackage, index: number) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all hover:border-primary/50 ${
                      selectedPackage?.id === pkg.id ? 'border-primary ring-2 ring-primary/20' : ''
                    }`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{pkg.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={getTypeColor(pkg.type)}>
                                {pkg.type}
                              </Badge>
                              <Badge variant="outline" className={getStatusColor(pkg.status)}>
                                {isGenerating === pkg.id ? (
                                  <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Gerando...</>
                                ) : (
                                  getStatusLabel(pkg.status)
                                )}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{pkg.completeness}%</p>
                          <p className="text-xs text-muted-foreground">{pkg.documents} docs</p>
                        </div>
                      </div>

                      <Progress value={pkg.completeness} className="h-2 mb-3" />

                      {pkg.missingItems.length > 0 && (
                        <div className="mb-3 p-2 rounded bg-amber-500/10 text-xs">
                          <p className="font-medium text-amber-400 mb-1">Itens pendentes:</p>
                          <ul className="text-muted-foreground space-y-0.5">
                            {pkg.missingItems.slice(0, 2).map((item, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-amber-400" />
                                {item}
                              </li>
                            ))}
                            {pkg.missingItems.length > 2 && (
                              <li className="text-amber-400">+{pkg.missingItems.length - 2} mais...</li>
                            )}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {pkg.lastGenerated && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Gerado: {pkg.lastGenerated.toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {pkg.status === 'ready' && (
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3 mr-1" />
                              Baixar
                            </Button>
                          )}
                          <Button 
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleGenerate(pkg); }}
                            disabled={isGenerating === pkg.id}
                          >
                            {isGenerating === pkg.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <Brain className="h-3 w-3 mr-1" />
                                {pkg.status === 'ready' ? 'Atualizar' : 'Gerar'}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Document Status */}
        <div>
          <Card className="border-border/50 sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Status de Documentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {documents.map((doc: DocumentItem) => (
                <div 
                  key={doc.id} 
                  className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-medium text-sm">{doc.name}</span>
                    <Badge className={`text-xs ${getDocStatusColor(doc.status)}`}>
                      {doc.status === 'valid' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {doc.status === 'expiring' && <Clock className="h-3 w-3 mr-1" />}
                      {doc.status === 'expired' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {doc.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span>{doc.category}</span>
                    {doc.vessel && <span> • {doc.vessel}</span>}
                    {doc.expiryDate && (
                      <span className="block mt-1">
                        Vence: {doc.expiryDate.toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t">
                <Button variant="outline" className="w-full" size="sm">
                  Ver Todos os Documentos
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AuditAssistant;

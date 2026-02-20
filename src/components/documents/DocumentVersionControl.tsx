/**
 * DocumentVersionControl - Controle de versão de documentos
 * Versionamento avançado, metadata e histórico de alterações
 */
import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, GitBranch, Clock, Search, Upload, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DocRecord {
  id: string;
  file_name: string;
  file_type: string;
  category: string | null;
  created_at: string;
  updated_at: string;
  ocr_status: string;
  title: string | null;
}

export function DocumentVersionControl() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['document-version-control'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_documents')
        .select('id, file_name, file_type, category, created_at, updated_at, ocr_status, title')
        .order('updated_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as DocRecord[];
    },
    staleTime: 30000,
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['document-version-control'] });
    toast.success('Documentos atualizados');
  };

  const filteredDocs = useMemo(() => {
    if (!search.trim()) return documents;
    const q = search.toLowerCase();
    return documents.filter(d => 
      d.file_name?.toLowerCase().includes(q) || 
      d.title?.toLowerCase().includes(q) ||
      d.category?.toLowerCase().includes(q)
    );
  }, [documents, search]);

  const stats = useMemo(() => ({
    total: documents.length,
    processed: documents.filter(d => d.ocr_status === 'completed').length,
    pending: documents.filter(d => d.ocr_status === 'pending').length,
    categories: new Set(documents.map(d => d.category).filter(Boolean)).size,
  }), [documents]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">Processados</span>
            </div>
            <div className="text-2xl font-bold text-success">{stats.processed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-xs text-muted-foreground">Pendentes</span>
            </div>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <GitBranch className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Categorias</span>
            </div>
            <div className="text-2xl font-bold">{stats.categories}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos por nome, título ou categoria..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Document List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Controle de Versão
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Nenhum documento encontrado.</p>
              <p className="text-xs mt-1">Faça upload de documentos no Document Center.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between py-3 px-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{doc.title || doc.file_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{doc.file_type}</span>
                        {doc.category && (
                          <>
                            <span>•</span>
                            <span>{doc.category}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{format(new Date(doc.updated_at), 'dd/MM/yyyy HH:mm')}</span>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'shrink-0 ml-2',
                      doc.ocr_status === 'completed' ? 'text-success border-success/30' :
                      doc.ocr_status === 'pending' ? 'text-warning border-warning/30' :
                      'text-muted-foreground'
                    )}
                  >
                    {doc.ocr_status === 'completed' ? 'Processado' : doc.ocr_status === 'pending' ? 'Pendente' : doc.ocr_status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DocumentVersionControl;

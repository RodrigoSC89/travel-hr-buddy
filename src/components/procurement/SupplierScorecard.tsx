/**
 * Supplier Scorecard - World-Class
 * Avaliação completa: qualidade, pontualidade, preço, certificações
 * Supera TM Master e UniSea
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Star, Building2, MapPin, Mail, Phone, Globe, Clock, Package,
  DollarSign, Award, TrendingUp, Search, CheckCircle2, XCircle,
  Shield, BarChart3, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Supplier {
  id: string;
  company_name: string;
  trading_name: string;
  category: string[];
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  city: string;
  country: string;
  rating: number;
  total_orders: number;
  total_value: number;
  lead_time_days: number;
  certifications: string[];
  is_approved: boolean;
  is_active: boolean;
  payment_terms: string;
}

function ScoreRing({ value, max = 5, size = 48, color = 'text-primary' }: { value: number; max?: number; size?: number; color?: string }) {
  const pct = (value / max) * 100;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="4" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor" className={color} strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold">{value.toFixed(1)}</span>
      </div>
    </div>
  );
}

export function SupplierScorecard() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showEvalDialog, setShowEvalDialog] = useState(false);
  const [evalData, setEvalData] = useState({ quality: 4, delivery: 4, price: 4, communication: 4, comments: '' });

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers-scorecard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });
      if (error) throw error;
      return (data || []) as Supplier[];
    },
  });

  const updateRatingMutation = useMutation({
    mutationFn: async ({ id, newRating }: { id: string; newRating: number }) => {
      const { error } = await supabase
        .from('suppliers')
        .update({ rating: newRating })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Avaliação registrada!');
      queryClient.invalidateQueries({ queryKey: ['suppliers-scorecard'] });
      setShowEvalDialog(false);
      setSelectedSupplier(null);
    },
  });

  const filtered = suppliers.filter(s =>
    s.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const avgRating = suppliers.length > 0
    ? suppliers.reduce((s, sup) => s + (sup.rating || 0), 0) / suppliers.length
    : 0;

  const topSuppliers = suppliers.filter(s => (s.rating || 0) >= 4);
  const atRisk = suppliers.filter(s => (s.rating || 0) < 3);

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Fornecedores</p>
              <p className="text-2xl font-bold">{suppliers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Star className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-sm text-muted-foreground">Rating Médio</p>
              <p className="text-2xl font-bold">{avgRating.toFixed(1)}/5.0</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-success/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Award className="h-8 w-8 text-success" />
            <div>
              <p className="text-sm text-muted-foreground">Top Performance</p>
              <p className="text-2xl font-bold">{topSuppliers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/30">
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-destructive" />
            <div>
              <p className="text-sm text-muted-foreground">Em Risco</p>
              <p className="text-2xl font-bold">{atRisk.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar fornecedores..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Supplier Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((supplier, idx) => {
            const rating = supplier.rating || 0;
            const ratingColor = rating >= 4 ? 'text-success' : rating >= 3 ? 'text-warning' : 'text-destructive';

            return (
              <motion.div
                key={supplier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card className={cn(
                  "hover:shadow-lg transition-all cursor-pointer group",
                  rating >= 4 ? "border-success/20 hover:border-success/50" :
                  rating < 3 ? "border-destructive/20 hover:border-destructive/50" :
                  "hover:border-primary/50"
                )}
                  onClick={() => setSelectedSupplier(supplier)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{supplier.company_name}</h3>
                          {supplier.is_approved && (
                            <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {supplier.city}, {supplier.country}
                        </div>
                      </div>
                      <ScoreRing value={rating} color={ratingColor} />
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-border/50">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Pedidos</p>
                        <p className="text-lg font-bold">{supplier.total_orders || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Lead Time</p>
                        <p className="text-lg font-bold">{supplier.lead_time_days || '—'}<span className="text-xs font-normal">d</span></p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Volume</p>
                        <p className="text-lg font-bold">${((supplier.total_value || 0) / 1000).toFixed(0)}k</p>
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {(supplier.category || []).slice(0, 3).map((cat, i) => (
                        <Badge key={i} variant="outline" className="text-[10px]">
                          {cat}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => { e.stopPropagation(); setSelectedSupplier(supplier); setShowEvalDialog(true); }}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Avaliar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => { e.stopPropagation(); setSelectedSupplier(supplier); }}
                      >
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedSupplier && !showEvalDialog} onOpenChange={() => setSelectedSupplier(null)}>
        <DialogContent className="max-w-2xl">
          {selectedSupplier && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {selectedSupplier.company_name}
                  {selectedSupplier.is_approved && <Badge className="bg-success/20 text-success">Aprovado</Badge>}
                </DialogTitle>
                <DialogDescription>{selectedSupplier.city}, {selectedSupplier.country}</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Score overview */}
                <div className="flex items-center justify-center gap-8 p-6 rounded-xl bg-muted/30">
                  <ScoreRing value={selectedSupplier.rating || 0} size={80} color={
                    (selectedSupplier.rating || 0) >= 4 ? 'text-success' : 
                    (selectedSupplier.rating || 0) >= 3 ? 'text-warning' : 'text-destructive'
                  } />
                  <div>
                    <p className="text-sm text-muted-foreground">Rating Geral</p>
                    <p className="text-3xl font-bold">{(selectedSupplier.rating || 0).toFixed(1)} / 5.0</p>
                    <p className="text-sm text-muted-foreground mt-1">{selectedSupplier.total_orders || 0} pedidos realizados</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedSupplier.contact_email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {selectedSupplier.contact_email}
                    </div>
                  )}
                  {selectedSupplier.contact_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {selectedSupplier.contact_phone}
                    </div>
                  )}
                  {selectedSupplier.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      {selectedSupplier.website}
                    </div>
                  )}
                  {selectedSupplier.payment_terms && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      {selectedSupplier.payment_terms}
                    </div>
                  )}
                </div>

                {/* Performance metrics */}
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-3 text-center">
                      <Package className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <p className="text-xl font-bold">{selectedSupplier.total_orders || 0}</p>
                      <p className="text-xs text-muted-foreground">Pedidos</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <Clock className="h-5 w-5 mx-auto mb-1 text-info" />
                      <p className="text-xl font-bold">{selectedSupplier.lead_time_days || '—'}</p>
                      <p className="text-xs text-muted-foreground">Lead Time (dias)</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <DollarSign className="h-5 w-5 mx-auto mb-1 text-success" />
                      <p className="text-xl font-bold">${((selectedSupplier.total_value || 0) / 1000).toFixed(0)}k</p>
                      <p className="text-xs text-muted-foreground">Volume Total</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <TrendingUp className="h-5 w-5 mx-auto mb-1 text-warning" />
                      <p className="text-xl font-bold">{((selectedSupplier.rating || 0) / 5 * 100).toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">Satisfação</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Categories & Certifications */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Categorias</p>
                    <div className="flex flex-wrap gap-1">
                      {(selectedSupplier.category || []).map((c, i) => (
                        <Badge key={i} variant="outline">{c}</Badge>
                      ))}
                      {(selectedSupplier.category || []).length === 0 && <span className="text-sm text-muted-foreground">Não informado</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Certificações</p>
                    <div className="flex flex-wrap gap-1">
                      {(selectedSupplier.certifications || []).map((c, i) => (
                        <Badge key={i} className="bg-primary/10 text-primary"><Shield className="h-3 w-3 mr-1" />{c}</Badge>
                      ))}
                      {(selectedSupplier.certifications || []).length === 0 && <span className="text-sm text-muted-foreground">Nenhuma</span>}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedSupplier(null)}>Fechar</Button>
                <Button onClick={() => setShowEvalDialog(true)}>
                  <Star className="h-4 w-4 mr-2" />
                  Nova Avaliação
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Evaluation Dialog */}
      <Dialog open={showEvalDialog} onOpenChange={(open) => { if (!open) { setShowEvalDialog(false); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avaliar Fornecedor</DialogTitle>
            <DialogDescription>{selectedSupplier?.company_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {(['quality', 'delivery', 'price', 'communication'] as const).map((metric) => {
              const labels: Record<string, string> = {
                quality: 'Qualidade dos Produtos',
                delivery: 'Pontualidade na Entrega',
                price: 'Competitividade de Preço',
                communication: 'Comunicação',
              };
              return (
                <div key={metric} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{labels[metric]}</Label>
                    <span className="text-sm font-medium">{evalData[metric]}/5</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        onClick={() => setEvalData({ ...evalData, [metric]: v })}
                        className="p-1"
                      >
                        <Star className={cn(
                          "h-6 w-6 transition-colors",
                          v <= evalData[metric] ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                        )} />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            <div className="space-y-2">
              <Label>Comentários</Label>
              <Textarea
                value={evalData.comments}
                onChange={(e) => setEvalData({ ...evalData, comments: e.target.value })}
                placeholder="Observações sobre o fornecedor..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEvalDialog(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (!selectedSupplier) return;
                const avg = (evalData.quality + evalData.delivery + evalData.price + evalData.communication) / 4;
                updateRatingMutation.mutate({ id: selectedSupplier.id, newRating: Number(avg.toFixed(1)) });
              }}
              disabled={updateRatingMutation.isPending}
            >
              {updateRatingMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Avaliação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

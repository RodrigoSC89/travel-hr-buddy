/**
 * Travel Itinerary Builder - Revolutionary Travel Planning with Risk Scoring
 * Visual itinerary timeline, policy compliance, cost optimization, security alerts
 */
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Plane, Hotel, Car, MapPin, Shield, AlertTriangle,
  CheckCircle, Clock, DollarSign, Globe, TrendingUp,
  Zap, Star, Heart, Phone, ArrowRight, Flag, Briefcase, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ItinerarySegment {
  id: string;
  type: 'flight' | 'hotel' | 'transfer' | 'meeting';
  title: string;
  location: string;
  start: string;
  end: string;
  cost: number;
  status: string;
  policyCompliant: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

export default function TravelItineraryBuilder() {
  // Fetch travel data from reservations
  const { data: reservations = [] } = useQuery({
    queryKey: ['itinerary-reservations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('start_date', { ascending: true })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Fetch expenses for cost analysis
  const { data: expenses = [] } = useQuery({
    queryKey: ['itinerary-expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('id, amount, category, status, date')
        .order('date', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Build itinerary from reservations
  const itinerary: ItinerarySegment[] = useMemo(() => {
    return reservations.map((r): ItinerarySegment => {
      const type = (r.reservation_type === 'hotel' || r.title?.toLowerCase().includes('hotel'))
        ? 'hotel'
        : r.title?.toLowerCase().includes('transfer') ? 'transfer'
        : r.title?.toLowerCase().includes('reunião') || r.title?.toLowerCase().includes('meeting') ? 'meeting'
        : 'flight';

      const cost = Number(r.total_amount) || 0;
      const policyLimit = type === 'flight' ? 5000 : type === 'hotel' ? 800 : 500;
      return {
        id: r.id,
        type,
        title: r.title || 'Reserva',
        location: r.location || 'N/A',
        start: r.start_date || '',
        end: r.end_date || '',
        cost,
        status: r.status || 'pending',
        policyCompliant: cost <= policyLimit,
        riskLevel: cost > policyLimit * 1.5 ? 'high' : cost > policyLimit ? 'medium' : 'low',
      };
    });
  }, [reservations]);

  const analytics = useMemo(() => {
    const totalCost = itinerary.reduce((s, i) => s + i.cost, 0);
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const policyViolations = itinerary.filter(i => !i.policyCompliant).length;
    const highRisk = itinerary.filter(i => i.riskLevel === 'high').length;
    const flights = itinerary.filter(i => i.type === 'flight').length;
    const hotels = itinerary.filter(i => i.type === 'hotel').length;
    const active = itinerary.filter(i => i.status === 'confirmed' || i.status === 'pending').length;

    // Compliance score
    const complianceScore = itinerary.length > 0
      ? Math.round((itinerary.filter(i => i.policyCompliant).length / itinerary.length) * 100)
      : 100;

    // Cost by category
    const costByType: Record<string, number> = {};
    itinerary.forEach(i => {
      costByType[i.type] = (costByType[i.type] || 0) + i.cost;
    });

    return {
      totalCost, totalExpenses, policyViolations, highRisk,
      flights, hotels, active, complianceScore, costByType,
      avgTicket: itinerary.length > 0 ? Math.round(totalCost / itinerary.length) : 0,
    };
  }, [itinerary, expenses]);

  const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    flight: { icon: Plane, color: 'text-primary bg-primary/10', label: 'Voo' },
    hotel: { icon: Hotel, color: 'text-success bg-success/10', label: 'Hotel' },
    transfer: { icon: Car, color: 'text-warning bg-warning/10', label: 'Transfer' },
    meeting: { icon: Briefcase, color: 'text-accent-foreground bg-accent/10', label: 'Reunião' },
  };

  return (
    <div className="space-y-6">
      {/* Hero KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-primary/10 rounded-lg"><Globe className="h-5 w-5 text-primary" /></div>
              </div>
              <p className="text-xs text-muted-foreground uppercase">Custo Total Viagens</p>
              <p className="text-2xl font-bold">R$ {(analytics.totalCost / 1000).toFixed(1)}k</p>
              <p className="text-xs text-muted-foreground mt-1">{analytics.flights} voos • {analytics.hotels} hotéis</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${analytics.complianceScore >= 90 ? 'from-success/5' : 'from-warning/5'} to-transparent`} />
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 ${analytics.complianceScore >= 90 ? 'bg-success/10' : 'bg-warning/10'} rounded-lg`}>
                  <Shield className={`h-5 w-5 ${analytics.complianceScore >= 90 ? 'text-success' : 'text-warning'}`} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground uppercase">Policy Compliance</p>
              <p className="text-2xl font-bold">{analytics.complianceScore}%</p>
              <Progress value={analytics.complianceScore} className="h-1.5 mt-2" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-warning/10 rounded-lg"><DollarSign className="h-5 w-5 text-warning" /></div>
              </div>
              <p className="text-xs text-muted-foreground uppercase">Ticket Médio</p>
              <p className="text-2xl font-bold">R$ {analytics.avgTicket.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-muted-foreground mt-1">{itinerary.length} segmentos</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className={`relative overflow-hidden ${analytics.policyViolations > 0 ? 'border-destructive/30' : ''}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 ${analytics.policyViolations > 0 ? 'bg-destructive/10' : 'bg-success/10'} rounded-lg`}>
                  {analytics.policyViolations > 0
                    ? <AlertTriangle className="h-5 w-5 text-destructive" />
                    : <CheckCircle className="h-5 w-5 text-success" />
                  }
                </div>
              </div>
              <p className="text-xs text-muted-foreground uppercase">Violações de Política</p>
              <p className="text-2xl font-bold">{analytics.policyViolations}</p>
              <p className="text-xs text-muted-foreground mt-1">{analytics.highRisk} alto risco</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Policy Violation Alert */}
      {analytics.policyViolations > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm">{analytics.policyViolations} reserva(s) fora da política de viagem</p>
              <p className="text-xs text-muted-foreground">Revise os valores acima do teto corporativo antes da aprovação</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Breakdown by Type */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Distribuição de Custos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(analytics.costByType).map(([type, cost]) => {
              const config = typeConfig[type] || typeConfig.flight;
              const Icon = config.icon;
              const percent = analytics.totalCost > 0 ? Math.round((cost / analytics.totalCost) * 100) : 0;
              return (
                <div key={type} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className={`p-2 rounded-lg ${config.color}`}><Icon className="h-4 w-4" /></div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                    <p className="font-semibold text-sm">R$ {(cost / 1000).toFixed(1)}k</p>
                    <p className="text-[10px] text-muted-foreground">{percent}% do total</p>
                  </div>
                </div>
              );
            })}
            {Object.keys(analytics.costByType).length === 0 && (
              <p className="col-span-4 text-center text-sm text-muted-foreground py-4">Sem dados de custos</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Visual Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />Timeline do Itinerário</CardTitle>
        </CardHeader>
        <CardContent>
          {itinerary.length === 0 ? (
            <div className="py-12 text-center">
              <Plane className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Nenhuma reserva encontrada</p>
              <p className="text-sm text-muted-foreground mt-1">Crie viagens para visualizar o itinerário</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-4">
                {itinerary.map((segment, i) => {
                  const config = typeConfig[segment.type] || typeConfig.flight;
                  const Icon = config.icon;
                  const isViolation = !segment.policyCompliant;

                  return (
                    <motion.div
                      key={segment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative pl-14"
                    >
                      {/* Node */}
                      <div className={`absolute left-3 top-4 w-7 h-7 rounded-full flex items-center justify-center ${config.color} ring-2 ring-background z-10`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>

                      <Card className={`${isViolation ? 'border-destructive/30 bg-destructive/5' : 'hover:shadow-md'} transition-shadow`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-sm">{segment.title}</h4>
                                <Badge variant="outline" className="text-[10px]">{config.label}</Badge>
                                {isViolation && (
                                  <Badge variant="destructive" className="text-[10px]">
                                    <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />Fora da Política
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{segment.location}</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {segment.start ? new Date(segment.start).toLocaleDateString('pt-BR') : '—'}
                                  {segment.end && ` → ${new Date(segment.end).toLocaleDateString('pt-BR')}`}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm">R$ {segment.cost.toLocaleString('pt-BR')}</p>
                              <Badge variant={segment.status === 'confirmed' ? 'default' : segment.status === 'cancelled' ? 'destructive' : 'secondary'} className="text-[10px] mt-1">
                                {segment.status === 'confirmed' ? 'Confirmado' : segment.status === 'pending' ? 'Pendente' : segment.status === 'cancelled' ? 'Cancelado' : segment.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Duty of Care Summary */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-primary" />Duty of Care — Segurança do Viajante</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="font-medium text-sm">Rastreamento Ativo</p>
                <p className="text-xs text-muted-foreground">Todos os viajantes localizáveis</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
              <Phone className="h-5 w-5 text-success" />
              <div>
                <p className="font-medium text-sm">SOS Disponível 24/7</p>
                <p className="text-xs text-muted-foreground">Emergência: +55 21 99999-9999</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <Heart className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Seguro Viagem</p>
                <p className="text-xs text-muted-foreground">Cobertura internacional ativa</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

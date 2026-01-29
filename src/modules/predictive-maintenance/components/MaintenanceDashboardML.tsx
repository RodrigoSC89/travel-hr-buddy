/**
 * 🔧 Predictive Maintenance Dashboard with ML
 * NAUTILUS ONE v5.0 - Revolutionary Maritime Maintenance
 * 
 * Visual interface for ML-powered maintenance predictions
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import {
  Wrench, AlertTriangle, CheckCircle, Clock, TrendingUp, DollarSign,
  Activity, RefreshCw, Calendar, Settings, Cpu, Thermometer, Gauge,
  BarChart3, Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  predictiveMaintenanceMLEngine, 
  type FailurePrediction, 
  type MaintenancePlan 
} from '../ai/PredictiveMaintenanceEngine';

const urgencyColors = {
  critical: 'bg-red-500/10 text-red-500 border-red-500/30',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
  low: 'bg-green-500/10 text-green-500 border-green-500/30'
};

const urgencyBadges = {
  critical: 'destructive',
  high: 'warning',
  medium: 'secondary',
  low: 'default'
} as const;

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue, 
  trend,
  className 
}: { 
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}) {
  return (
    <Card className={cn("bg-card/50 backdrop-blur-sm", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold">{value}</p>
              {trend && (
                <TrendingUp className={cn(
                  "h-4 w-4",
                  trend === 'up' && "text-green-500",
                  trend === 'down' && "text-red-500 rotate-180"
                )} />
              )}
            </div>
            {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PredictionCard({ prediction, onClick }: { prediction: FailurePrediction; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
    >
      <Card className={cn(
        "cursor-pointer transition-all border",
        urgencyColors[prediction.urgency]
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold">{prediction.equipmentName}</h3>
              <p className="text-xs text-muted-foreground">{prediction.predictedFailureMode}</p>
            </div>
            <Badge variant={urgencyBadges[prediction.urgency] as any}>
              {prediction.urgency}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Failure Probability</span>
              <span className="font-medium">{prediction.failureProbability}%</span>
            </div>
            <Progress value={prediction.failureProbability} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>{prediction.estimatedDaysUntilFailure} days</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
              <span>${prediction.preventiveCost.toLocaleString()}</span>
            </div>
          </div>

          <p className="text-xs mt-3 text-muted-foreground line-clamp-2">
            {prediction.recommendedAction}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PredictionDetails({ prediction, onClose }: { prediction: FailurePrediction; onClose: () => void }) {
  return (
    <Card className="border-2 border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              {prediction.equipmentName}
            </CardTitle>
            <CardDescription>{prediction.predictedFailureMode}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-primary">{prediction.failureProbability}%</p>
            <p className="text-xs text-muted-foreground">Failure Risk</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold">{prediction.estimatedDaysUntilFailure}</p>
            <p className="text-xs text-muted-foreground">Days Until Action</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold">{prediction.confidence}%</p>
            <p className="text-xs text-muted-foreground">ML Confidence</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-green-500">
              ${(prediction.estimatedRepairCost - prediction.preventiveCost).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Potential Savings</p>
          </div>
        </div>

        {/* Risk Factors */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Risk Factors
          </h4>
          <div className="space-y-2">
            {prediction.riskFactors.map((factor, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span className="text-sm">{factor.factor}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {factor.contribution}% impact
                  </Badge>
                  <Badge variant={
                    factor.trend === 'increasing' ? 'destructive' :
                    factor.trend === 'decreasing' ? 'default' : 'secondary'
                  } className="text-xs">
                    {factor.trend}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Reasoning */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Analysis
          </h4>
          <div className="bg-muted/30 rounded-lg p-3">
            <ul className="space-y-1 text-sm">
              {prediction.aiReasoning.map((reason, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Cost Comparison */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Cost Analysis
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
              <p className="text-lg font-bold text-green-500">${prediction.preventiveCost.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Preventive Cost</p>
            </div>
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
              <p className="text-lg font-bold text-red-500">${prediction.estimatedRepairCost.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Repair Cost</p>
            </div>
            <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg text-center">
              <p className="text-lg font-bold text-orange-500">{prediction.estimatedDowntime}h</p>
              <p className="text-xs text-muted-foreground">Est. Downtime</p>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
          <h4 className="font-medium mb-2">Recommended Action</h4>
          <p className="text-sm">{prediction.recommendedAction}</p>
          <Button className="mt-3 w-full">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Maintenance
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function MaintenanceDashboardML() {
  const [selectedPrediction, setSelectedPrediction] = useState<FailurePrediction | null>(null);

  // Fetch predictions
  const { data: predictions = [], isLoading, refetch } = useQuery({
    queryKey: ['predictive-maintenance-ml'],
    queryFn: () => predictiveMaintenanceMLEngine.predictAllFailures('demo-vessel'),
    staleTime: 5 * 60 * 1000
  });

  // Fetch maintenance plan
  const { data: plan } = useQuery({
    queryKey: ['maintenance-plan'],
    queryFn: () => predictiveMaintenanceMLEngine.generateMaintenancePlan('demo-vessel'),
    staleTime: 5 * 60 * 1000
  });

  const criticalCount = predictions.filter(p => p.urgency === 'critical').length;
  const highCount = predictions.filter(p => p.urgency === 'high').length;
  const avgConfidence = predictions.length > 0
    ? Math.round(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length)
    : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Wrench className="h-8 w-8 text-primary" />
            Predictive Maintenance ML
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered failure prediction using TensorFlow.js and Weibull analysis
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Refresh Analysis
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard 
          icon={AlertTriangle} 
          label="Critical Issues" 
          value={criticalCount}
          className={criticalCount > 0 ? "border-red-500/50" : ""}
        />
        <StatCard 
          icon={Clock} 
          label="High Priority" 
          value={highCount}
          className={highCount > 0 ? "border-orange-500/50" : ""}
        />
        <StatCard icon={Activity} label="Equipment Monitored" value={predictions.length} />
        <StatCard icon={Brain} label="ML Confidence" value={`${avgConfidence}%`} />
        <StatCard 
          icon={DollarSign} 
          label="Potential Savings" 
          value={`$${plan?.savings.total.toLocaleString() || '0'}`} 
          trend="up"
        />
        <StatCard 
          icon={Gauge} 
          label="System Health" 
          value={`${100 - Math.round(predictions.reduce((sum, p) => sum + p.failureProbability, 0) / Math.max(predictions.length, 1))}%`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Predictions List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Equipment Health Predictions
            </CardTitle>
            <CardDescription>
              Click on any equipment to view detailed analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                  {predictions.map((prediction) => (
                    <PredictionCard
                      key={prediction.equipmentId}
                      prediction={prediction}
                      onClick={() => setSelectedPrediction(prediction)}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Details Panel */}
        <div>
          {selectedPrediction ? (
            <PredictionDetails
              prediction={selectedPrediction}
              onClose={() => setSelectedPrediction(null)}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan && (
                  <>
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <h4 className="font-medium text-green-500 mb-2">Total Savings</h4>
                      <p className="text-3xl font-bold text-green-500">
                        ${plan.savings.total.toLocaleString()}
                      </p>
                      <div className="text-xs text-muted-foreground mt-2 space-y-1">
                        <p>Preventive: ${plan.savings.preventive.toLocaleString()}</p>
                        <p>Avoided Downtime: ${plan.savings.avoidedDowntime.toLocaleString()}</p>
                        <p>Extended Life: ${plan.savings.extendedLifespan.toLocaleString()}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Scheduled Maintenance</h4>
                      <div className="space-y-2">
                        {plan.schedule.slice(0, 5).map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                            <span className="truncate flex-1">{item.equipmentName}</span>
                            <Badge variant="outline" className="ml-2">
                              {new Date(item.scheduledDate).toLocaleDateString()}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Parts Required</h4>
                      <div className="flex flex-wrap gap-1">
                        {plan.spareParts.slice(0, 6).map((part) => (
                          <Badge key={part.partNumber} variant="secondary" className="text-xs">
                            {part.description} (x{part.quantity})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Button className="w-full" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure ML Model
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default MaintenanceDashboardML;

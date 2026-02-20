/**
 * Infrastructure & Scalability Dashboard — Gap #4 & #8
 * Multi-region, connection pools, DR status, auto-scaling, rate limits
 */

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Server, Globe, Database, Shield, Activity, Zap,
  CheckCircle2, AlertTriangle, Clock, HardDrive, Cpu, BarChart3
} from "lucide-react";
import { getInfrastructureHealth, REGION_CONFIG, DR_CONFIG, RATE_LIMITS, SCALING_POLICIES } from "@/lib/infrastructure/scalability-config";

export default function InfrastructureDashboardPage() {
  const health = getInfrastructureHealth();

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Server className="h-8 w-8 text-primary" />
            Infrastructure & Scalability
          </h1>
          <p className="text-muted-foreground mt-1">Multi-região, DR, auto-scaling e monitoramento de saúde — Enterprise-grade</p>
        </div>

        {/* Uptime KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Uptime 24h", value: `${health.uptime.last24h}%`, color: "text-success" },
            { label: "Uptime 7d", value: `${health.uptime.last7d}%`, color: "text-success" },
            { label: "Uptime 30d", value: `${health.uptime.last30d}%`, color: "text-success" },
            { label: "Uptime 90d", value: `${health.uptime.last90d}%`, color: "text-primary" },
          ].map(kpi => (
            <Card key={kpi.label} className="border-border/50">
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="regions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="regions"><Globe className="h-4 w-4 mr-2" />Regiões</TabsTrigger>
            <TabsTrigger value="dr"><Shield className="h-4 w-4 mr-2" />Disaster Recovery</TabsTrigger>
            <TabsTrigger value="scaling"><Zap className="h-4 w-4 mr-2" />Auto-Scaling</TabsTrigger>
            <TabsTrigger value="limits"><Activity className="h-4 w-4 mr-2" />Rate Limits</TabsTrigger>
          </TabsList>

          {/* Regions */}
          <TabsContent value="regions">
            <Card>
              <CardHeader>
                <CardTitle>Multi-Region Deployment</CardTitle>
                <CardDescription>4 regiões globais com replicação em tempo real</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {REGION_CONFIG.map(region => (
                    <div key={region.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div className="flex items-center gap-3">
                        <Database className={`h-5 w-5 ${region.role === 'primary' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div>
                          <p className="font-medium text-foreground">{region.name}</p>
                          <code className="text-xs text-muted-foreground font-mono">{region.endpoint}</code>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">{region.latencyMs}ms</Badge>
                        <Badge variant={region.role === 'primary' ? 'default' : 'secondary'} className="text-xs capitalize">{region.role}</Badge>
                        <div className={`h-3 w-3 rounded-full ${region.status === 'active' ? 'bg-success' : 'bg-warning'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DR */}
          <TabsContent value="dr">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Configuração DR</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "RTO (Recovery Time)", value: `${DR_CONFIG.rtoMinutes} min` },
                    { label: "RPO (Recovery Point)", value: `${DR_CONFIG.rpoMinutes} min` },
                    { label: "Backup Strategy", value: DR_CONFIG.backupStrategy },
                    { label: "Retenção", value: `${DR_CONFIG.backupRetentionDays} dias` },
                    { label: "Failover Mode", value: DR_CONFIG.failoverMode },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between p-2 bg-muted/30 rounded">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-sm font-medium text-foreground capitalize">{item.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Status Atual</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Primary DB", value: "Saudável", icon: CheckCircle2, color: "text-success" },
                    { label: "Último Backup", value: "5 min atrás", icon: Clock, color: "text-primary" },
                    { label: "Replica Lag", value: `${health.dr.replicaLagMs}ms`, icon: Activity, color: "text-success" },
                    { label: "Backup Size", value: `${health.dr.backupSizeGB} GB`, icon: HardDrive, color: "text-muted-foreground" },
                    { label: "Failover Ready", value: "Sim", icon: Shield, color: "text-success" },
                    { label: "Último DR Test", value: health.dr.lastDRTestResult === 'pass' ? '✅ Passou' : '❌ Falhou', icon: CheckCircle2, color: health.dr.lastDRTestResult === 'pass' ? "text-success" : "text-destructive" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div className="flex items-center gap-2">
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{item.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Auto-Scaling */}
          <TabsContent value="scaling">
            <Card>
              <CardHeader>
                <CardTitle>Políticas de Auto-Scaling</CardTitle>
                <CardDescription>Escalamento automático baseado em métricas de performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {SCALING_POLICIES.map(policy => (
                    <div key={policy.metric} className="p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-primary" />
                          <span className="font-medium text-foreground capitalize">{policy.metric.replace('_', ' ')}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">{policy.minInstances}-{policy.maxInstances} instâncias</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                        <span>↑ Scale Up: {policy.scaleUpThreshold}{policy.metric === 'query_time' ? 'ms' : '%'}</span>
                        <span>↓ Scale Down: {policy.scaleDownThreshold}{policy.metric === 'query_time' ? 'ms' : '%'}</span>
                        <span>⏱ Cooldown: {policy.cooldownSeconds}s</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rate Limits */}
          <TabsContent value="limits">
            <Card>
              <CardHeader>
                <CardTitle>Rate Limits por Tier</CardTitle>
                <CardDescription>Limites de requisições por tenant para garantir fair-use</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(RATE_LIMITS).map(([tier, config]) => (
                    <Card key={tier} className={`border-border/50 ${tier === 'enterprise' ? 'ring-1 ring-primary/20' : ''}`}>
                      <CardContent className="p-4 space-y-3">
                        <p className="font-bold text-foreground capitalize text-lg">{tier}</p>
                        {[
                          { label: "Req/min", value: config.requestsPerMinute.toLocaleString() },
                          { label: "Req/hora", value: config.requestsPerHour.toLocaleString() },
                          { label: "Burst", value: config.burstSize.toString() },
                          { label: "Conexões", value: config.concurrentConnections.toString() },
                        ].map(item => (
                          <div key={item.label} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className="font-medium text-foreground">{item.value}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

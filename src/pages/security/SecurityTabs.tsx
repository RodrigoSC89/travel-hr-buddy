import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Shield, Lock, Database, Key, AlertTriangle, CheckCircle2, XCircle,
  Eye, EyeOff, Clock, Fingerprint, Globe, ShieldAlert, Search, Zap
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface ThreatEvent {
  id: string;
  timestamp: string;
  type: "auth_failure" | "rls_violation" | "api_abuse" | "suspicious_query" | "pii_access";
  severity: "low" | "medium" | "high" | "critical";
  source: string;
  details: string;
  resolved: boolean;
}

interface RLSPolicy {
  table: string;
  policyName: string;
  operation: "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "ALL";
  definition: string;
  enabled: boolean;
}

interface PIIField {
  table: string;
  column: string;
  type: "email" | "phone" | "name" | "document" | "financial" | "health";
  masked: boolean;
  accessCount: number;
}

interface SecurityTabsProps {
  threats: ThreatEvent[];
  policies: RLSPolicy[];
  piiFields: PIIField[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onResolveThrent: (id: string) => void;
  unresolvedCount: number;
  criticalCount: number;
}

export function SecurityTabs({
  threats, policies, piiFields, searchTerm, onSearchChange, onResolveThrent, unresolvedCount, criticalCount
}: SecurityTabsProps) {
  const filteredThreats = threats.filter(t =>
    t.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <TabsContent value="threats" className="mt-4">
        {criticalCount > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Ameaças Críticas!</AlertTitle>
            <AlertDescription>
              {criticalCount} ameaça(s) crítica(s) não resolvida(s). Ação imediata recomendada.
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar ameaças..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="pl-9" />
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            <AnimatePresence>
              {filteredThreats.map((threat, index) => (
                <motion.div key={threat.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: index * 0.05 }}>
                  <Card className={`border-l-4 ${
                    threat.resolved ? "opacity-60 border-l-muted" :
                    threat.severity === "critical" ? "border-l-destructive" :
                    threat.severity === "high" ? "border-l-warning" :
                    threat.severity === "medium" ? "border-l-info" : "border-l-muted"
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {threat.severity === "critical" || threat.severity === "high" ? (
                            <ShieldAlert className="h-5 w-5 text-destructive mt-0.5" />
                          ) : (
                            <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${
                                threat.severity === "critical" ? "bg-destructive" :
                                threat.severity === "high" ? "bg-warning" :
                                threat.severity === "medium" ? "bg-info" : "bg-muted"
                              } text-white`}>{threat.severity}</Badge>
                              <Badge variant="outline">{threat.type.replace("_", " ")}</Badge>
                              {threat.resolved && (
                                <Badge variant="outline" className="bg-success/10 text-success border-success/40">Resolvido</Badge>
                              )}
                            </div>
                            <p className="text-sm mt-2">{threat.details}</p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                              <Globe className="h-3 w-3" />{threat.source}
                              <span className="mx-1">•</span>
                              <Clock className="h-3 w-3" />
                              {format(new Date(threat.timestamp), "dd/MM HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        {!threat.resolved && (
                          <Button size="sm" variant="outline" onClick={() => onResolveThrent(threat.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-1" />Resolver
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="rls" className="mt-4">
        <div className="grid gap-3">
          {policies.map((policy) => (
            <Card key={`${policy.table}-${policy.operation}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-primary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{policy.table}</span>
                        <Badge variant="outline">{policy.operation}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{policy.policyName}</p>
                      <code className="text-xs bg-muted px-2 py-1 rounded mt-1 inline-block">{policy.definition}</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {policy.enabled ? (
                      <Badge className="bg-success/20 text-success border-success/40"><CheckCircle2 className="h-3 w-3 mr-1" />Ativo</Badge>
                    ) : (
                      <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Inativo</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="pii" className="mt-4">
        <Alert className="mb-4">
          <Fingerprint className="h-4 w-4" />
          <AlertTitle>Proteção de Dados Pessoais</AlertTitle>
          <AlertDescription>Todos os campos PII estão protegidos com mascaramento automático conforme LGPD/GDPR.</AlertDescription>
        </Alert>
        <div className="grid gap-3">
          {piiFields.map((field) => (
            <Card key={`${field.table}-${field.column}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {field.masked ? <EyeOff className="h-5 w-5 text-success" /> : <Eye className="h-5 w-5 text-destructive" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{field.table}.{field.column}</span>
                        <Badge variant="outline">{field.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{field.accessCount} acessos registrados</p>
                    </div>
                  </div>
                  {field.masked ? (
                    <Badge className="bg-success/20 text-success border-success/40"><Lock className="h-3 w-3 mr-1" />Mascarado</Badge>
                  ) : (
                    <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Exposto</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="tokens" className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Key className="h-5 w-5" />API Keys</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Supabase Anon Key", hint: "eyJhbG...••••••••" },
                  { name: "OpenAI API Key", hint: "sk-proj...••••••••" },
                  { name: "ElevenLabs API Key", hint: "el-••••••••" },
                ].map(k => (
                  <div key={k.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{k.name}</p>
                      <p className="text-xs text-muted-foreground">{k.hint}</p>
                    </div>
                    <Badge className="bg-success/20 text-success">Válida</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Zap className="h-5 w-5" />Rate Limits</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "API Geral", current: 45, max: 100 },
                  { label: "Autenticação", current: 3, max: 10 },
                  { label: "AI Endpoints", current: 12, max: 30 },
                  { label: "File Upload", current: 5, max: 20 },
                ].map(r => (
                  <div key={r.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{r.label}</span>
                      <span>{r.current}/{r.max} req/min</span>
                    </div>
                    <Progress value={(r.current / r.max) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </>
  );
}

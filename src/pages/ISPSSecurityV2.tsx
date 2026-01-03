/**
 * ISPSSecurityV2 - ISPS Security V2
 * Segurança marítima e cibersegurança
 */

import { useState } from "react";
import { PageLayoutV2, CardV2, StatsGridV2, ModuleAIChat, ModuleEvidenceGenerator } from "@/components/v2";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Shield, Brain, Lock, AlertTriangle, CheckCircle, 
  Wifi, Server, Eye, Sparkles, ShieldAlert
} from "lucide-react";

const QUICK_QUESTIONS = [
  "O que é ISPS Code?",
  "Níveis de segurança MARSEC?",
  "Requisitos de cibersegurança?",
  "Como fazer Ship Security Assessment?",
  "Documentos obrigatórios ISPS?",
  "Treinamento SSO?"
];

const EVIDENCE_FIELDS = [
  { name: "security_area", label: "Área de Segurança", type: "select" as const, options: [
    { value: "physical", label: "Segurança Física" },
    { value: "cyber", label: "Cibersegurança" },
    { value: "access", label: "Controle de Acesso" },
    { value: "communication", label: "Comunicações" }
  ], required: true },
  { name: "observed_condition", label: "Vulnerabilidade/Observação", type: "textarea" as const, required: true },
  { name: "marsec_level", label: "Nível MARSEC", type: "select" as const, options: [
    { value: "1", label: "MARSEC 1 - Normal" },
    { value: "2", label: "MARSEC 2 - Elevado" },
    { value: "3", label: "MARSEC 3 - Excepcional" }
  ]},
];

export default function ISPSSecurityV2() {
  const [metrics] = useState({
    complianceScore: 94,
    physicalScore: 96,
    cyberScore: 88,
    accessScore: 95,
    marsecLevel: 1
  });

  const stats = [
    { label: "Compliance ISPS", value: `${metrics.complianceScore}%`, icon: Shield, color: "green" as const },
    { label: "Segurança Física", value: `${metrics.physicalScore}%`, icon: Lock, color: "blue" as const },
    { label: "Cibersegurança", value: `${metrics.cyberScore}%`, icon: Wifi, color: "purple" as const },
    { label: "MARSEC Level", value: metrics.marsecLevel, icon: ShieldAlert, color: "orange" as const },
  ];

  return (
    <PageLayoutV2
      icon={Shield}
      title="ISPS Security V2"
      description="Segurança marítima e cibersegurança conforme ISPS Code"
      gradient="indigo"
      badges={[
        { icon: Brain, label: "IA Análise" },
        { icon: Lock, label: "ISPS Code" },
        { icon: Wifi, label: "Cyber Security" },
        { icon: Sparkles, label: "Layout V2" }
      ]}
    >
      <StatsGridV2 stats={stats} columns={4} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="cyber">Cibersegurança</TabsTrigger>
          <TabsTrigger value="ai-assistant">IA Assistente</TabsTrigger>
          <TabsTrigger value="evidence">Evidências</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardV2 icon={Shield} title="Status ISPS" description="Conformidade com ISPS Code" gradient="green">
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-5xl font-bold text-green-500">{metrics.complianceScore}%</p>
                  <p className="text-muted-foreground">Score de Conformidade</p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Ship Security Plan", value: 100 },
                    { label: "SSO Training", value: 95 },
                    { label: "Access Control", value: 92 },
                    { label: "Drills & Exercises", value: 88 }
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-sm">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={item.value} className="w-24 h-2" />
                        <span className="text-xs">{item.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardV2>
            <CardV2 icon={ShieldAlert} title="MARSEC Level" description="Nível de alerta de segurança marítima" gradient="orange">
              <div className="space-y-4">
                <div className="text-center p-6 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-6xl font-bold text-green-500">{metrics.marsecLevel}</p>
                  <p className="text-muted-foreground mt-2">Operações Normais</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map(level => (
                    <div key={level} className={`p-3 rounded-lg text-center ${level === metrics.marsecLevel ? 'bg-green-500/20 border border-green-500' : 'bg-muted/50'}`}>
                      <p className="font-bold">Level {level}</p>
                      <p className="text-xs text-muted-foreground">
                        {level === 1 ? 'Normal' : level === 2 ? 'Elevado' : 'Excepcional'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardV2>
          </div>
        </TabsContent>

        <TabsContent value="cyber">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardV2 icon={Wifi} title="Cibersegurança" description="Proteção de sistemas e redes" gradient="purple">
              <div className="space-y-4">
                {[
                  { label: "Firewall", status: "active", icon: Shield },
                  { label: "Antivírus", status: "active", icon: CheckCircle },
                  { label: "VPN", status: "active", icon: Lock },
                  { label: "Backup", status: "warning", icon: Server }
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <item.icon className={`h-5 w-5 ${item.status === 'active' ? 'text-green-500' : 'text-orange-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                      {item.status === 'active' ? 'Ativo' : 'Atenção'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardV2>
            <CardV2 icon={Eye} title="Monitoramento" description="Detecção de ameaças em tempo real" gradient="blue">
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-500">Sem Ameaças Detectadas</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Última verificação: há 5 minutos</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Alertas (24h)</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-2xl font-bold">152</p>
                    <p className="text-xs text-muted-foreground">Scans Realizados</p>
                  </div>
                </div>
              </div>
            </CardV2>
          </div>
        </TabsContent>

        <TabsContent value="ai-assistant">
          <ModuleAIChat
            moduleName="ISPS Security"
            moduleContext="segurança marítima ISPS Code, cibersegurança, MARSEC levels e proteção de embarcações"
            systemPrompt="Você é especialista em segurança marítima e ISPS Code. Ajude com Ship Security Plan, cibersegurança, treinamento SSO e níveis MARSEC."
            quickQuestions={QUICK_QUESTIONS}
            edgeFunctionName="isps-security-ai"
            accentColor="indigo"
          />
        </TabsContent>

        <TabsContent value="evidence">
          <ModuleEvidenceGenerator
            moduleName="ISPS Security"
            moduleContext="segurança marítima, ISPS Code, cibersegurança, MARSEC"
            edgeFunctionName="isps-generate-evidence"
            fields={EVIDENCE_FIELDS}
            accentColor="indigo"
          />
        </TabsContent>
      </Tabs>
    </PageLayoutV2>
  );
}

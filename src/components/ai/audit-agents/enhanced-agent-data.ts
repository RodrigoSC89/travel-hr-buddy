/**
 * Enhanced Audit Agents Hub - Agent data and response generator
 */
import {
  Shield, Scale, FileCheck, ClipboardCheck, Ship,
  AlertTriangle, Navigation, Droplet, Leaf, Users
} from "lucide-react";
import type { AuditAgent } from "./types";

export const ENHANCED_AUDIT_AGENTS: AuditAgent[] = [
  {
    id: "peotram",
    name: "Agente PEOTRAM",
    shortName: "PEOTRAM",
    icon: Shield,
    color: "text-warning",
    bgColor: "from-warning/20 to-warning/10",
    description: "Programa de Excelência Operacional Petrobras - 13 Elementos",
    capabilities: ["Auditoria dos 13 elementos", "Geração de evidências", "Análise de não conformidades", "Planos de ação corretiva", "Relatórios para ANP"],
    compliance: ["PEOTRAM", "ANP", "NORMAM"],
    status: "active",
    lastActivity: "Auditou Elemento 6 - Manutenção"
  },
  {
    id: "peodp",
    name: "Agente PEO-DP",
    shortName: "PEO-DP",
    icon: Navigation,
    color: "text-primary",
    bgColor: "from-primary/20 to-info/20",
    description: "Posicionamento Dinâmico - NORMAM-101 & IMCA M 117",
    capabilities: ["Verificação DP Classe 2/3", "Checklist IMCA M 117", "Análise FMEA/FMECA", "Requisitos NORMAM-101", "Relatórios de conformidade DP"],
    compliance: ["NORMAM-101", "IMCA M 117", "IMO MSC"],
    status: "active",
    lastActivity: "Validou checklist DP Classe 3"
  },
  {
    id: "sgso",
    name: "Agente SGSO",
    shortName: "SGSO",
    icon: FileCheck,
    color: "text-success",
    bgColor: "from-success/20 to-success/10",
    description: "Sistema de Gestão de Segurança Operacional - ANP",
    capabilities: ["17 Práticas obrigatórias", "Dossiê ANP", "Tratamento de NCs", "CAPAs automáticas", "Indicadores SGSO"],
    compliance: ["Resolução ANP 43/2007", "API RP 75"],
    status: "active",
    lastActivity: "Gerou dossiê ANP completo"
  },
  {
    id: "mlc",
    name: "Agente MLC 2006",
    shortName: "MLC",
    icon: Scale,
    color: "text-accent-foreground",
    bgColor: "from-accent/20 to-accent/10",
    description: "Maritime Labour Convention - Direitos dos Marítimos",
    capabilities: ["5 Títulos MLC", "Inspeção de conformidade", "Contratos SEA", "Horas de descanso", "Condições de trabalho"],
    compliance: ["MLC 2006", "ILO", "Flag State"],
    status: "active",
    lastActivity: "Verificou SEA de 45 tripulantes"
  },
  {
    id: "ism",
    name: "Agente ISM Code",
    shortName: "ISM",
    icon: ClipboardCheck,
    color: "text-destructive",
    bgColor: "from-destructive/20 to-warning/20",
    description: "International Safety Management Code",
    capabilities: ["SMS - Safety Management System", "Auditoria DOC/SMC", "Gestão de emergências", "Controle operacional", "Melhoria contínua"],
    compliance: ["ISM Code", "SOLAS Cap IX", "IMO"],
    status: "active",
    lastActivity: "Revisou SMS completo"
  },
  {
    id: "isps",
    name: "Agente ISPS Code",
    shortName: "ISPS",
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "from-warning/20 to-destructive/20",
    description: "International Ship and Port Facility Security Code",
    capabilities: ["SSP - Ship Security Plan", "Níveis de segurança 1/2/3", "Drills de segurança", "Avaliação de ameaças", "Certificado ISSC"],
    compliance: ["ISPS Code", "SOLAS Cap XI-2", "MARSEC"],
    status: "idle",
    lastActivity: "Validou drill ISPS nível 2"
  },
  {
    id: "marpol",
    name: "Agente MARPOL",
    shortName: "MARPOL",
    icon: Droplet,
    color: "text-info",
    bgColor: "from-info/20 to-primary/20",
    description: "Marine Pollution Prevention - Anexos I-VI",
    capabilities: ["IOPP Certificate", "ORB - Oil Record Book", "Gestão de resíduos", "Emissões SOx/NOx", "Ballast Water"],
    compliance: ["MARPOL 73/78", "BWM Convention"],
    status: "active",
    lastActivity: "Verificou ORB Part I"
  },
  {
    id: "solas",
    name: "Agente SOLAS",
    shortName: "SOLAS",
    icon: Ship,
    color: "text-primary",
    bgColor: "from-primary/20 to-accent/20",
    description: "Safety of Life at Sea - Segurança da Vida Humana",
    capabilities: ["LSA - Life Saving Appliances", "FFE - Fire Fighting", "Navegação segura", "Estabilidade", "Certificados estatutários"],
    compliance: ["SOLAS 1974", "IMO Resolutions"],
    status: "active",
    lastActivity: "Auditou equipamentos salvatagem"
  },
  {
    id: "stcw",
    name: "Agente STCW",
    shortName: "STCW",
    icon: Users,
    color: "text-info",
    bgColor: "from-info/20 to-success/20",
    description: "Standards of Training, Certification and Watchkeeping",
    capabilities: ["Certificação de tripulantes", "Competência mínima", "Horas de descanso", "Treinamentos obrigatórios", "Qualificação DP"],
    compliance: ["STCW 1978/2010", "Manila Amendments"],
    status: "active",
    lastActivity: "Validou matriz STCW da tripulação"
  },
  {
    id: "esg",
    name: "Agente ESG Marítimo",
    shortName: "ESG",
    icon: Leaf,
    color: "text-success",
    bgColor: "from-success/20 to-success/10",
    description: "Environmental, Social and Governance para operações marítimas",
    capabilities: ["Carbon footprint", "CII Rating", "EEXI compliance", "Diversidade tripulação", "Relatórios GRI"],
    compliance: ["IMO 2050", "EU MRV", "GHG Strategy"],
    status: "active",
    lastActivity: "Calculou CII Rating"
  }
];

export const EDGE_FUNCTION_MAP: Record<string, string> = {
  peotram: "peotram-ai-chat",
  peodp: "peodp-ai-chat",
  sgso: "sgso-assistant",
  mlc: "mlc-assistant",
  ism: "compliance-ai",
  isps: "compliance-ai",
  marpol: "environmental-ai",
  solas: "safety-ai",
  stcw: "training-ai-assistant",
  esg: "environmental-ai"
};

export const generateAgentResponse = (agent: AuditAgent, question: string): string => {
  return `📋 **Análise ${agent.shortName}:**

Baseado nas normas ${agent.compliance.join(', ')}, analisei sua pergunta sobre "${question.slice(0, 50)}...".

🎯 **Recomendações:**
1. Verifique a documentação específica do requisito
2. Colete evidências conforme checklist padrão
3. Registre não conformidades encontradas
4. Defina plano de ação com prazos

📎 **Referências:** ${agent.compliance.join(', ')}

Precisa de mais detalhes sobre algum aspecto específico?`;
};

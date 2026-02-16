import {
  Shield, Scale, FileCheck, ClipboardCheck, Ship,
  AlertTriangle, Navigation, Droplet, Leaf, Users
} from "lucide-react";
import type { AuditAgent } from "./types";

export const AUDIT_AGENTS: AuditAgent[] = [
  {
    id: "peotram", name: "Agente PEOTRAM", shortName: "PEOTRAM", icon: Shield,
    color: "text-orange-500", bgColor: "from-orange-500/20 to-yellow-500/20",
    description: "Programa de Excelência Operacional Petrobras - 13 Elementos",
    capabilities: ["Auditoria dos 13 elementos", "Geração de evidências", "Análise de não conformidades", "Planos de ação corretiva", "Relatórios para ANP"],
    compliance: ["PEOTRAM", "ANP", "NORMAM"], status: "active", lastActivity: "Auditou Elemento 6 - Manutenção"
  },
  {
    id: "peodp", name: "Agente PEO-DP", shortName: "PEO-DP", icon: Navigation,
    color: "text-blue-500", bgColor: "from-blue-500/20 to-cyan-500/20",
    description: "Posicionamento Dinâmico - NORMAM-101 & IMCA M 117",
    capabilities: ["Verificação DP Classe 2/3", "Checklist IMCA M 117", "Análise FMEA/FMECA", "Requisitos NORMAM-101", "Relatórios de conformidade DP"],
    compliance: ["NORMAM-101", "IMCA M 117", "IMO MSC"], status: "active", lastActivity: "Validou checklist DP Classe 3"
  },
  {
    id: "sgso", name: "Agente SGSO", shortName: "SGSO", icon: FileCheck,
    color: "text-green-500", bgColor: "from-green-500/20 to-emerald-500/20",
    description: "Sistema de Gestão de Segurança Operacional - ANP",
    capabilities: ["17 Práticas obrigatórias", "Dossiê ANP", "Tratamento de NCs", "CAPAs automáticas", "Indicadores SGSO"],
    compliance: ["Resolução ANP 43/2007", "API RP 75"], status: "active", lastActivity: "Gerou dossiê ANP completo"
  },
  {
    id: "mlc", name: "Agente MLC 2006", shortName: "MLC", icon: Scale,
    color: "text-purple-500", bgColor: "from-purple-500/20 to-pink-500/20",
    description: "Maritime Labour Convention - Direitos dos Marítimos",
    capabilities: ["5 Títulos MLC", "Inspeção de conformidade", "Contratos SEA", "Horas de descanso", "Condições de trabalho"],
    compliance: ["MLC 2006", "ILO", "Flag State"], status: "active", lastActivity: "Verificou SEA de 45 tripulantes"
  },
  {
    id: "ism", name: "Agente ISM Code", shortName: "ISM", icon: ClipboardCheck,
    color: "text-red-500", bgColor: "from-red-500/20 to-orange-500/20",
    description: "International Safety Management Code",
    capabilities: ["SMS - Safety Management System", "Auditoria DOC/SMC", "Gestão de emergências", "Controle operacional", "Melhoria contínua"],
    compliance: ["ISM Code", "SOLAS Cap IX", "IMO"], status: "active", lastActivity: "Revisou SMS completo"
  },
  {
    id: "isps", name: "Agente ISPS Code", shortName: "ISPS", icon: AlertTriangle,
    color: "text-amber-500", bgColor: "from-amber-500/20 to-red-500/20",
    description: "International Ship and Port Facility Security Code",
    capabilities: ["SSP - Ship Security Plan", "Níveis de segurança 1/2/3", "Drills de segurança", "Avaliação de ameaças", "Certificado ISSC"],
    compliance: ["ISPS Code", "SOLAS Cap XI-2", "MARSEC"], status: "idle", lastActivity: "Validou drill ISPS nível 2"
  },
  {
    id: "marpol", name: "Agente MARPOL", shortName: "MARPOL", icon: Droplet,
    color: "text-cyan-500", bgColor: "from-cyan-500/20 to-blue-500/20",
    description: "Marine Pollution Prevention - Anexos I-VI",
    capabilities: ["IOPP Certificate", "ORB - Oil Record Book", "Gestão de resíduos", "Emissões SOx/NOx", "Ballast Water"],
    compliance: ["MARPOL 73/78", "BWM Convention"], status: "active", lastActivity: "Verificou ORB Part I"
  },
  {
    id: "solas", name: "Agente SOLAS", shortName: "SOLAS", icon: Ship,
    color: "text-indigo-500", bgColor: "from-indigo-500/20 to-purple-500/20",
    description: "Safety of Life at Sea - Segurança da Vida Humana",
    capabilities: ["LSA - Life Saving Appliances", "FFE - Fire Fighting", "Navegação segura", "Estabilidade", "Certificados estatutários"],
    compliance: ["SOLAS 1974", "IMO Resolutions"], status: "active", lastActivity: "Auditou equipamentos salvatagem"
  },
  {
    id: "stcw", name: "Agente STCW", shortName: "STCW", icon: Users,
    color: "text-teal-500", bgColor: "from-teal-500/20 to-green-500/20",
    description: "Standards of Training, Certification and Watchkeeping",
    capabilities: ["Certificação de tripulantes", "Competência mínima", "Horas de descanso", "Treinamentos obrigatórios", "Qualificação DP"],
    compliance: ["STCW 1978/2010", "Manila Amendments"], status: "active", lastActivity: "Validou matriz STCW da tripulação"
  },
  {
    id: "esg", name: "Agente ESG Marítimo", shortName: "ESG", icon: Leaf,
    color: "text-lime-500", bgColor: "from-green-600/20 to-lime-500/20",
    description: "Environmental, Social and Governance para operações marítimas",
    capabilities: ["Carbon footprint", "CII Rating", "EEXI compliance", "Diversidade tripulação", "Relatórios GRI"],
    compliance: ["IMO 2050", "EU MRV", "GHG Strategy"], status: "active", lastActivity: "Calculou CII Rating"
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
  const responses: Record<string, string> = {
    peotram: `Como especialista PEOTRAM, analisei sua pergunta sobre "${question}".

📋 **Contexto PEOTRAM:**
O Programa de Excelência Operacional possui 13 elementos obrigatórios que devem ser auditados periodicamente.

🎯 **Recomendações:**
1. Verifique a documentação do elemento específico
2. Colete evidências conforme checklist
3. Registre não conformidades encontradas
4. Defina plano de ação com prazos

📎 **Referências:** PEOTRAM Rev. 6, NORMAM-01

Precisa de mais detalhes sobre algum elemento específico?`,
    sgso: `Como especialista SGSO, analisei sua pergunta sobre "${question}".

📋 **Base Normativa:**
Resolução ANP nº 43/2007 define as 17 práticas obrigatórias para instalações de perfuração.

🎯 **Orientações:**
1. Identifique a prática relacionada à sua dúvida
2. Verifique os requisitos de evidenciação
3. Documente conforme padrão ANP
4. Mantenha rastreabilidade

📎 **Referências:** ANP 43/2007, API RP 75

Qual prática específica você gostaria de explorar?`,
    mlc: `Como especialista MLC 2006, analisei sua pergunta sobre "${question}".

⚖️ **Convenção MLC 2006:**
A Maritime Labour Convention estabelece direitos e condições mínimas para marítimos.

📋 **Títulos Relevantes:**
- Título 1: Requisitos mínimos
- Título 2: Condições de emprego
- Título 3: Acomodação
- Título 4: Saúde e segurança
- Título 5: Conformidade

📎 **Referências:** MLC 2006, ILO Guidelines

Como posso detalhar mais?`
  };

  return responses[agent.id] || `📋 **Análise ${agent.shortName}:**

Baseado nas normas ${agent.compliance.join(', ')}, analisei sua pergunta sobre "${question.slice(0, 50)}...".

🎯 **Recomendações:**
1. Verifique a documentação específica do requisito
2. Colete evidências conforme checklist padrão
3. Registre não conformidades encontradas
4. Defina plano de ação com prazos

📎 **Referências:** ${agent.compliance.join(', ')}

Precisa de mais detalhes sobre algum aspecto específico?`;
};

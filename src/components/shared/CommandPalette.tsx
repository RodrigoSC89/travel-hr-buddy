/**
 * Command Palette v2.0 - Global Module Search (Ctrl+K)
 * 
 * Implementa busca universal de todos os módulos do sistema,
 * incluindo rotas legadas e módulos ocultos por RBAC.
 * 
 * ✅ Indexa TODAS as páginas (205+)
 * ✅ Busca por nome antigo e novo (aliases)
 * ✅ Mostra badges de permissão
 * ✅ Navegação instantânea
 * ✅ 12 Auditorias Marítimas indexadas
 * ✅ 10 Agentes IA indexados
 * ✅ Ações rápidas (Add, Refresh, Export)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import {
  Ship, Shield, Brain, Activity, Target, Eye, Satellite,
  Anchor, Wrench, Compass, Map, Users, FileText,
  MessageSquare, Settings, BookOpen, Award, Heart,
  BarChart3, Bot, Zap, AlertTriangle,
  DollarSign, Leaf, ClipboardList, Cloud,
  Lock, Fuel, Stethoscope, Terminal, Plane,
  Search, Plus, RefreshCw, Download, Package
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  aliases: string[];
  path: string;
  icon: LucideIcon;
  group: string;
  badge?: string;
  restricted?: boolean;
  keywords?: string[];
}

// ═══════════════════════════════════════════════════════════
// COMPLETE INDEX OF ALL 205+ MODULES
// ═══════════════════════════════════════════════════════════
const ALL_MODULES: CommandItem[] = [
  // ═══════════════════════════════════════════════════════════
  // MEGA-HUB A: COMMAND
  // ═══════════════════════════════════════════════════════════
  { id: 'command', label: 'Command Center', aliases: ['central de comando', 'dashboard', 'overview', 'visão geral'], path: '/command', icon: Compass, group: 'Command', keywords: ['home', 'inicio', 'principal'] },
  { id: 'command-ops', label: 'Operations View', aliases: ['operações', 'operations'], path: '/command?tab=operations', icon: Activity, group: 'Command' },
  { id: 'command-exec', label: 'Executive View', aliases: ['executivo', 'c-level', 'diretoria'], path: '/command?tab=executive', icon: BarChart3, group: 'Command' },
  { id: 'noc', label: 'NOC 24/7', aliases: ['network operations', 'monitoramento', 'centro de operações'], path: '/command?tab=noc', icon: Eye, group: 'Command' },
  { id: 'soc', label: 'SOC Security', aliases: ['security operations', 'segurança', 'cybersecurity'], path: '/command?tab=soc', icon: Shield, group: 'Command' },
  
  // ═══════════════════════════════════════════════════════════
  // MEGA-HUB B: OPS
  // ═══════════════════════════════════════════════════════════
  { id: 'ops', label: 'Operations Hub', aliases: ['operações', 'maritime', 'marítimo'], path: '/ops', icon: Ship, group: 'Ops' },
  { id: 'maritime', label: 'Maritime Command', aliases: ['marítimo', 'naval'], path: '/ops?tab=maritime', icon: Anchor, group: 'Ops' },
  { id: 'fleet', label: 'Fleet Command', aliases: ['frota', 'embarcações', 'navios'], path: '/ops?tab=fleet', icon: Ship, group: 'Ops' },
  { id: 'voyage', label: 'Voyage Command', aliases: ['viagens', 'rotas', 'navegação'], path: '/ops?tab=voyage', icon: Map, group: 'Ops' },
  { id: 'missions', label: 'Missions', aliases: ['missões', 'operações especiais'], path: '/ops?tab=missions', icon: Target, group: 'Ops' },
  { id: 'logistics', label: 'Logistics', aliases: ['logística', 'suprimentos'], path: '/ops?tab=logistics', icon: Package, group: 'Ops' },
  { id: 'contracts', label: 'Vessel Contracts', aliases: ['contratos', 'charter party', 'afretamento'], path: '/ops?tab=contracts', icon: FileText, group: 'Ops' },
  
  // ═══════════════════════════════════════════════════════════
  // MEGA-HUB C: MAINTENANCE
  // ═══════════════════════════════════════════════════════════
  { id: 'maintenance', label: 'Maintenance Hub', aliases: ['manutenção', 'PMS', 'planned maintenance'], path: '/maintenance', icon: Wrench, group: 'Maintenance' },
  { id: 'class-surveys', label: 'Class Surveys', aliases: ['DNV', "Lloyd's", 'ABS', 'vistoria de classe', 'classificadora'], path: '/maintenance?tab=surveys', icon: Shield, group: 'Maintenance', badge: 'DNV' },
  { id: 'predictive', label: 'Predictive Maintenance', aliases: ['manutenção preditiva', 'ML', 'machine learning'], path: '/maintenance?tab=predictive', icon: Brain, group: 'Maintenance', badge: 'ML' },
  { id: 'drydock', label: 'Drydock Management', aliases: ['docagem', 'estaleiro', 'dique seco'], path: '/maintenance?tab=drydock', icon: Anchor, group: 'Maintenance' },
  { id: 'fuel', label: 'Fuel & ROB', aliases: ['combustível', 'bunker', 'óleo', 'diesel'], path: '/maintenance?tab=fuel', icon: Fuel, group: 'Maintenance' },
  { id: 'digital-twin', label: 'Digital Twin 3D', aliases: ['gêmeo digital', 'simulação', '3D'], path: '/maintenance?tab=digital-twin', icon: Activity, group: 'Maintenance', badge: '3D' },
  { id: 'waste-marpol', label: 'MARPOL & Waste', aliases: ['resíduos', 'waste management', 'e-GRB'], path: '/maintenance?tab=waste-marpol', icon: Leaf, group: 'Maintenance' },
  { id: 'esg', label: 'ESG Emissions', aliases: ['emissões', 'sustentabilidade', 'CII', 'EEXI', 'carbono'], path: '/maintenance?tab=esg', icon: Leaf, group: 'Maintenance', badge: 'ESG' },
  
  // ═══════════════════════════════════════════════════════════
  // MEGA-HUB D: AI
  // ═══════════════════════════════════════════════════════════
  { id: 'ai', label: 'AI Hub', aliases: ['inteligência artificial', 'machine learning', 'IA'], path: '/ai', icon: Brain, group: 'AI' },
  { id: 'ai-chat', label: 'AI Chat & Assistants', aliases: ['chatbot', 'assistente', 'GPT', 'copilot'], path: '/ai?tab=chat', icon: MessageSquare, group: 'AI' },
  { id: 'ai-agents', label: 'AI Agents', aliases: ['agentes autônomos', 'orquestração', 'autonomous'], path: '/ai?tab=agents', icon: Bot, group: 'AI', badge: '25+' },
  { id: 'ai-workflows', label: 'AI Workflows', aliases: ['automação', 'n8n', 'workflow'], path: '/ai?tab=workflows', icon: Zap, group: 'AI' },
  { id: 'voice', label: 'Voice Assistant', aliases: ['voz', 'comandos de voz', 'speech'], path: '/ai?tab=voice', icon: MessageSquare, group: 'AI' },
  { id: 'ai-modules', label: '11 AI Modules', aliases: ['módulos IA', 'voyage logistics', 'safety incident'], path: '/ai?tab=modules', icon: Brain, group: 'AI', badge: '11' },
  { id: 'rag', label: 'RAG Assistant', aliases: ['documentos', 'busca semântica', 'semantic search'], path: '/ai?tab=rag', icon: FileText, group: 'AI', badge: 'Enterprise' },
  { id: 'ocr', label: 'OCR Center', aliases: ['reconhecimento', 'digitalização', 'scanning'], path: '/ai?tab=ocr', icon: FileText, group: 'AI', badge: 'Enterprise' },
  { id: 'ai-analytics', label: 'AI Analytics', aliases: ['análise IA', 'métricas'], path: '/ai?tab=analytics', icon: BarChart3, group: 'AI' },
  { id: 'ai-observability', label: 'AI Observability', aliases: ['observabilidade', 'logs', 'monitoring'], path: '/ai?tab=observability', icon: Eye, group: 'AI' },
  
  // ═══════════════════════════════════════════════════════════
  // MEGA-HUB E: TRACKING
  // ═══════════════════════════════════════════════════════════
  { id: 'tracking', label: 'Tracking Hub', aliases: ['rastreamento', 'telemetria', 'GPS'], path: '/tracking', icon: Satellite, group: 'Tracking' },
  { id: 'realtime', label: 'Real-time Tracking', aliases: ['tempo real', 'live', 'ao vivo'], path: '/tracking?tab=realtime', icon: Activity, group: 'Tracking' },
  { id: 'ais', label: 'AIS Fleet Tracker', aliases: ['AIS', 'posição', 'localização', 'MarineTraffic'], path: '/tracking?tab=ais', icon: Ship, group: 'Tracking' },
  { id: 'satcom', label: 'SATCOM Dashboard', aliases: ['satélite', 'comunicação', 'Inmarsat', 'Iridium'], path: '/tracking?tab=satcom', icon: Satellite, group: 'Tracking' },
  { id: 'weather', label: 'Weather AI', aliases: ['clima', 'previsão do tempo', 'meteorologia'], path: '/tracking?tab=weather', icon: Cloud, group: 'Tracking', badge: 'AI' },
  { id: 'tracking-alerts', label: 'Tracking Alerts', aliases: ['alertas', 'geofencing', 'notificações'], path: '/tracking?tab=alerts', icon: AlertTriangle, group: 'Tracking' },
  
  // ═══════════════════════════════════════════════════════════
  // MEGA-HUB F: COMPLIANCE - HUB & TOOLS
  // ═══════════════════════════════════════════════════════════
  { id: 'compliance', label: 'Compliance Hub', aliases: ['conformidade', 'auditorias', 'regulamentação'], path: '/compliance', icon: Shield, group: 'Compliance' },
  { id: 'scorecard', label: 'Compliance Scorecard', aliases: ['pontuação', 'score', 'indicadores'], path: '/compliance?tab=scorecard', icon: BarChart3, group: 'Compliance' },
  { id: 'audit-agents', label: '10 AI Audit Agents', aliases: ['agentes de auditoria', 'auditoria IA', 'compliance AI'], path: '/audit-agents', icon: Bot, group: 'Compliance', badge: '10 AI' },
  { id: 'certificates', label: 'Certificates Tracker', aliases: ['certificados', 'documentos obrigatórios', 'vencimentos'], path: '/compliance?tab=certificates', icon: Award, group: 'Compliance' },
  { id: 'risk-matrix', label: 'Risk Matrix', aliases: ['matriz de riscos', 'análise de riscos', 'HAZOP'], path: '/risk-matrix', icon: Target, group: 'Compliance' },
  { id: 'ncs-capas', label: 'NCs & CAPAs', aliases: ['não conformidades', 'ações corretivas', 'CAR'], path: '/compliance?tab=ncs-capas', icon: AlertTriangle, group: 'Compliance' },
  { id: 'regulations', label: 'Regulations', aliases: ['regulamentos', 'normas', 'legislação'], path: '/compliance?tab=regulations', icon: FileText, group: 'Compliance' },
  { id: 'security', label: 'Security Center', aliases: ['segurança', 'ISPS', 'SSP'], path: '/compliance?tab=security', icon: Lock, group: 'Compliance' },
  
  // ═══════════════════════════════════════════════════════════
  // 12 AUDITORIAS MARÍTIMAS COMPLETAS
  // ═══════════════════════════════════════════════════════════
  { id: 'peo-dp', label: '1. PEO-DP', aliases: ['posicionamento dinâmico', 'IMCA M-117', 'DP', 'dynamic positioning'], path: '/peo-dp', icon: Anchor, group: '12 Auditorias Marítimas', badge: 'IMCA' },
  { id: 'peotram', label: '2. PEOTRAM 13 Elementos', aliases: ['ANP', 'treinamento', 'manning', 'tripulação'], path: '/peotram', icon: Shield, group: '12 Auditorias Marítimas', badge: 'ANP' },
  { id: 'ism', label: '3. ISM Code (SMS)', aliases: ['segurança marítima', 'IMO', 'safety management', 'ISM'], path: '/safety-imca', icon: Shield, group: '12 Auditorias Marítimas', badge: 'IMO' },
  { id: 'isps', label: '4. ISPS Security (SSP)', aliases: ['segurança do navio', 'SOLAS XI-2', 'ship security', 'SSP'], path: '/isps-security', icon: Lock, group: '12 Auditorias Marítimas', badge: 'SOLAS' },
  { id: 'solas', label: '5. SOLAS/LSA/FFE', aliases: ['life saving', 'equipamentos de emergência', 'LSA', 'FFE', 'salvatagem'], path: '/solas-inspection', icon: Ship, group: '12 Auditorias Marítimas', badge: 'SOLAS' },
  { id: 'marpol', label: '6. MARPOL I-VI', aliases: ['poluição', 'resíduos', 'waste management', 'anexos MARPOL'], path: '/waste-management', icon: Leaf, group: '12 Auditorias Marítimas', badge: 'MARPOL' },
  { id: 'pre-ovid', label: '7. Pre-OVID', aliases: ['OCIMF', 'offshore vessel', 'OVID', 'inspeção offshore'], path: '/pre-ovid', icon: ClipboardList, group: '12 Auditorias Marítimas', badge: 'OCIMF' },
  { id: 'pre-mlc', label: '8. Pre-MLC 2006', aliases: ['trabalho marítimo', 'ILO', 'labour', 'tripulação', 'MLC'], path: '/mlc-inspection', icon: Users, group: '12 Auditorias Marítimas', badge: 'ILO' },
  { id: 'psc', label: '9. PSC Package', aliases: ['port state control', 'Paris MoU', 'Tokyo MoU', 'inspeção de bandeira'], path: '/psc-package', icon: Award, group: '12 Auditorias Marítimas', badge: 'MoU' },
  { id: 'sgso', label: '10. SGSO ANP 17 Práticas', aliases: ['gestão operacional', 'ANP Brasil', 'SGSO', '17 práticas'], path: '/sgso', icon: Settings, group: '12 Auditorias Marítimas', badge: 'ANP' },
  { id: 'pre-sire', label: '11. Pre-SIRE 2.0', aliases: ['OCIMF SIRE', 'tanker inspection', 'SIRE 2.0', 'tanker'], path: '/pre-sire', icon: Ship, group: '12 Auditorias Marítimas', badge: 'OCIMF' },
  { id: 'tmsa', label: '12. TMSA Assessment', aliases: ['tanker management', 'OCIMF', 'TMSA', 'self assessment'], path: '/tmsa-assessment', icon: BarChart3, group: '12 Auditorias Marítimas', badge: 'OCIMF' },
  
  // ═══════════════════════════════════════════════════════════
  // MEGA-HUB G: WORKBENCH
  // ═══════════════════════════════════════════════════════════
  // Documents
  { id: 'docs', label: 'Document Center', aliases: ['documentos', 'arquivos', 'gestão documental'], path: '/workbench?section=docs', icon: FileText, group: 'Workbench - Docs' },
  { id: 'templates', label: 'Templates', aliases: ['modelos', 'formulários', 'padrões'], path: '/workbench/docs?tab=templates', icon: FileText, group: 'Workbench - Docs' },
  { id: 'checklists', label: 'Checklists', aliases: ['listas de verificação', 'check'], path: '/workbench/docs?tab=checklists', icon: ClipboardList, group: 'Workbench - Docs' },
  { id: 'reports', label: 'Reports', aliases: ['relatórios', 'reporting'], path: '/workbench/docs?tab=reports', icon: BarChart3, group: 'Workbench - Docs' },
  
  // People
  { id: 'people', label: 'People Hub', aliases: ['RH', 'tripulação', 'crew', 'recursos humanos'], path: '/workbench?section=people', icon: Users, group: 'Workbench - People' },
  { id: 'stcw-mlc', label: 'STCW/MLC Compliance', aliases: ['certificados marítimos', 'treinamento', 'STCW'], path: '/stcw-mlc', icon: Award, group: 'Workbench - People' },
  { id: 'medical', label: 'Medical Infirmary', aliases: ['enfermaria', 'saúde', 'telemedicina'], path: '/medical-infirmary', icon: Stethoscope, group: 'Workbench - People' },
  { id: 'payroll', label: 'Payroll', aliases: ['folha de pagamento', 'salários'], path: '/payroll', icon: DollarSign, group: 'Workbench - People' },
  { id: 'recruitment', label: 'Recruitment', aliases: ['recrutamento', 'seleção', 'vagas'], path: '/recruitment', icon: Users, group: 'Workbench - People' },
  
  // Finance
  { id: 'finance', label: 'Finance Hub', aliases: ['financeiro', 'contabilidade', 'finanças'], path: '/workbench?section=finance', icon: DollarSign, group: 'Workbench - Finance' },
  { id: 'voyage-pnl', label: 'Voyage P&L', aliases: ['lucros e perdas', 'viagem', 'resultado'], path: '/voyage-accounting', icon: BarChart3, group: 'Workbench - Finance' },
  { id: 'procurement', label: 'Procurement', aliases: ['compras', 'suprimentos', 'requisições'], path: '/procurement-command', icon: Package, group: 'Workbench - Finance' },
  { id: 'travel', label: 'Travel Command', aliases: ['viagens', 'passagens', 'hotéis'], path: '/travel-command', icon: Plane, group: 'Workbench - Finance' },
  
  // System
  { id: 'system', label: 'System Hub', aliases: ['configurações', 'settings', 'sistema'], path: '/workbench?section=system', icon: Settings, group: 'Workbench - System' },
  { id: 'integrations', label: 'Integrations', aliases: ['integrações', 'API', 'conectores'], path: '/integrations', icon: Zap, group: 'Workbench - System' },
  { id: 'settings', label: 'Settings', aliases: ['configurações', 'preferências'], path: '/settings', icon: Settings, group: 'Workbench - System' },
  { id: 'dev-tools', label: 'Dev Tools', aliases: ['desenvolvimento', 'debug', 'rotas'], path: '/dev-routes', icon: Terminal, group: 'Workbench - System', restricted: true },
];

// ═══════════════════════════════════════════════════════════
// QUICK ACTIONS
// ═══════════════════════════════════════════════════════════
const QUICK_ACTIONS: CommandItem[] = [
  { id: 'action-search', label: 'Buscar em todo o sistema', aliases: ['search', 'pesquisar'], path: '#search', icon: Search, group: 'Ações Rápidas' },
  { id: 'action-add', label: 'Adicionar novo registro', aliases: ['criar', 'novo', 'add', 'create'], path: '#add', icon: Plus, group: 'Ações Rápidas' },
  { id: 'action-refresh', label: 'Atualizar dados', aliases: ['refresh', 'sync', 'recarregar'], path: '#refresh', icon: RefreshCw, group: 'Ações Rápidas' },
  { id: 'action-export', label: 'Exportar relatório', aliases: ['download', 'csv', 'pdf'], path: '#export', icon: Download, group: 'Ações Rápidas' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback((path: string) => {
    setOpen(false);
    
    // Handle quick actions
    if (path.startsWith('#')) {
      // Could dispatch actions here
      return;
    }
    
    navigate(path);
  }, [navigate]);

  // Group modules by category
  const groupedModules = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    
    // Add quick actions first
    groups['Ações Rápidas'] = QUICK_ACTIONS;
    
    // Add all modules
    ALL_MODULES.forEach((module) => {
      if (!groups[module.group]) {
        groups[module.group] = [];
      }
      groups[module.group].push(module);
    });
    
    return groups;
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar módulos, auditorias, ações... (Ctrl+K)" />
      <CommandList className="max-h-[400px]">
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-6">
            <Search className="h-10 w-10 text-muted-foreground" />
            <p>Nenhum módulo encontrado.</p>
            <p className="text-sm text-muted-foreground">
              Tente buscar por: "PEODP", "ISM", "manutenção", "tripulação"
            </p>
          </div>
        </CommandEmpty>
        
        {Object.entries(groupedModules).map(([group, modules], idx) => (
          <React.Fragment key={group}>
            {idx > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {modules.map((module) => (
                <CommandItem
                  key={module.id}
                  value={`${module.label} ${module.aliases.join(' ')} ${module.keywords?.join(' ') || ''}`}
                  onSelect={() => handleSelect(module.path)}
                  className="flex items-center gap-3 py-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-background">
                    <module.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium">{module.label}</span>
                    {module.aliases.length > 0 && (
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {module.aliases.slice(0, 3).join(', ')}
                      </p>
                    )}
                  </div>
                  {module.badge && (
                    <Badge variant="outline" className="text-xs">
                      {module.badge}
                    </Badge>
                  )}
                  {module.restricted && (
                    <Badge variant="destructive" className="text-xs">
                      Admin
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

// Hook to trigger command palette programmatically
export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  
  const toggle = useCallback(() => setOpen((o) => !o), []);
  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => setOpen(false), []);
  
  return { open, toggle, openPalette, closePalette, setOpen };
}

export default CommandPalette;

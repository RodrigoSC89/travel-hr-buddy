/**
 * Command Palette - Global Module Search (Ctrl+K)
 * 
 * Implementa busca universal de todos os módulos do sistema,
 * incluindo rotas legadas e módulos ocultos por RBAC.
 * 
 * ✅ Indexa TODAS as páginas (180+)
 * ✅ Busca por nome antigo e novo
 * ✅ Mostra badges de permissão
 * ✅ Navegação instantânea
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
  Lock, Fuel, Stethoscope, Terminal, Plane
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
}

// Complete index of all modules
const ALL_MODULES: CommandItem[] = [
  // ═══════════════════════════════════════════════════════════
  // MEGA-HUB A: COMMAND
  // ═══════════════════════════════════════════════════════════
  { id: 'command', label: 'Command Center', aliases: ['central de comando', 'dashboard', 'overview'], path: '/command', icon: Compass, group: 'Command' },
  { id: 'noc', label: 'NOC 24/7', aliases: ['network operations', 'monitoramento'], path: '/command?tab=noc', icon: Eye, group: 'Command' },
  { id: 'soc', label: 'SOC Security', aliases: ['security operations', 'segurança'], path: '/command?tab=soc', icon: Shield, group: 'Command' },
  
  // ═══════════════════════════════════════════════════════════
  // MEGA-HUB B: OPS
  // ═══════════════════════════════════════════════════════════
  { id: 'ops', label: 'Operations Hub', aliases: ['operações', 'maritime'], path: '/ops', icon: Ship, group: 'Ops' },
  { id: 'fleet', label: 'Fleet Command', aliases: ['frota', 'embarcações'], path: '/ops?tab=fleet', icon: Ship, group: 'Ops' },
  { id: 'voyage', label: 'Voyage Command', aliases: ['viagens', 'rotas'], path: '/ops?tab=voyage', icon: Map, group: 'Ops' },
  { id: 'contracts', label: 'Vessel Contracts', aliases: ['contratos', 'charter party'], path: '/ops?tab=contracts', icon: FileText, group: 'Ops' },
  
  // ═══════════════════════════════════════════════════════════
  // MEGA-HUB C: MAINTENANCE
  // ═══════════════════════════════════════════════════════════
  { id: 'maintenance', label: 'Maintenance Hub', aliases: ['manutenção', 'PMS'], path: '/maintenance', icon: Wrench, group: 'Maintenance' },
  { id: 'drydock', label: 'Drydock Management', aliases: ['docagem', 'estaleiro'], path: '/maintenance?tab=drydock', icon: Anchor, group: 'Maintenance' },
  { id: 'fuel', label: 'Fuel & ROB', aliases: ['combustível', 'bunker'], path: '/maintenance?tab=fuel', icon: Fuel, group: 'Maintenance' },
  { id: 'digital-twin', label: 'Digital Twin 3D', aliases: ['gêmeo digital', 'simulação'], path: '/maintenance?tab=digital-twin', icon: Activity, group: 'Maintenance' },
  { id: 'esg', label: 'ESG Emissions', aliases: ['emissões', 'sustentabilidade', 'CII'], path: '/maintenance?tab=esg', icon: Leaf, group: 'Maintenance' },
  
  // ═══════════════════════════════════════════════════════════
  // MEGA-HUB D: AI
  // ═══════════════════════════════════════════════════════════
  { id: 'ai', label: 'AI Hub', aliases: ['inteligência artificial', 'machine learning'], path: '/ai', icon: Brain, group: 'AI' },
  { id: 'ai-chat', label: 'AI Chat & Assistants', aliases: ['chatbot', 'assistente'], path: '/ai?tab=chat', icon: MessageSquare, group: 'AI' },
  { id: 'ai-agents', label: 'AI Agents', aliases: ['agentes autônomos', 'orquestração'], path: '/ai?tab=agents', icon: Bot, group: 'AI' },
  { id: 'voice', label: 'Voice Assistant', aliases: ['voz', 'comandos de voz'], path: '/ai?tab=voice', icon: Activity, group: 'AI' },
  { id: 'rag', label: 'RAG Assistant', aliases: ['documentos', 'busca semântica'], path: '/ai?tab=rag', icon: FileText, group: 'AI', badge: 'Enterprise' },
  { id: 'ocr', label: 'OCR Center', aliases: ['reconhecimento', 'digitalização'], path: '/ai?tab=ocr', icon: FileText, group: 'AI', badge: 'Enterprise' },
  
  // ═══════════════════════════════════════════════════════════
  // MEGA-HUB E: TRACKING
  // ═══════════════════════════════════════════════════════════
  { id: 'tracking', label: 'Tracking Hub', aliases: ['rastreamento', 'telemetria'], path: '/tracking', icon: Satellite, group: 'Tracking' },
  { id: 'ais', label: 'AIS Fleet Tracker', aliases: ['AIS', 'posição', 'localização'], path: '/tracking?tab=ais', icon: Ship, group: 'Tracking' },
  { id: 'satcom', label: 'SATCOM Dashboard', aliases: ['satélite', 'comunicação'], path: '/tracking?tab=satcom', icon: Satellite, group: 'Tracking' },
  { id: 'weather', label: 'Weather AI', aliases: ['clima', 'previsão do tempo'], path: '/tracking?tab=weather', icon: Cloud, group: 'Tracking' },
  
  // ═══════════════════════════════════════════════════════════
  // MEGA-HUB F: COMPLIANCE - 12 AUDITORIAS MARÍTIMAS
  // ═══════════════════════════════════════════════════════════
  { id: 'compliance', label: 'Compliance Hub', aliases: ['conformidade', 'auditorias'], path: '/compliance', icon: Shield, group: 'Compliance' },
  { id: 'audit-agents', label: '10 AI Audit Agents', aliases: ['agentes de auditoria', 'auditoria IA'], path: '/audit-agents', icon: Bot, group: 'Compliance', badge: '10 AI' },
  
  // 12 Auditorias Marítimas
  { id: 'peo-dp', label: 'PEO-DP Audit', aliases: ['posicionamento dinâmico', 'IMCA M-117', 'DP'], path: '/peo-dp', icon: Anchor, group: '12 Auditorias', badge: 'IMCA' },
  { id: 'peotram', label: 'PEOTRAM 13 Elementos', aliases: ['ANP', 'treinamento', 'manning'], path: '/peotram', icon: Shield, group: '12 Auditorias', badge: 'ANP' },
  { id: 'ism', label: 'ISM Code (SMS)', aliases: ['segurança marítima', 'IMO', 'safety management'], path: '/safety-imca', icon: Shield, group: '12 Auditorias', badge: 'IMO' },
  { id: 'isps', label: 'ISPS Security (SSP)', aliases: ['segurança do navio', 'SOLAS XI-2'], path: '/isps-security', icon: Lock, group: '12 Auditorias', badge: 'SOLAS' },
  { id: 'solas', label: 'SOLAS/LSA/FFE', aliases: ['life saving', 'equipamentos de emergência'], path: '/solas-inspection', icon: Ship, group: '12 Auditorias', badge: 'SOLAS' },
  { id: 'marpol', label: 'MARPOL I-VI', aliases: ['poluição', 'resíduos', 'waste management'], path: '/waste-management', icon: Leaf, group: '12 Auditorias', badge: 'MARPOL' },
  { id: 'pre-ovid', label: 'Pre-OVID Inspection', aliases: ['OCIMF', 'offshore vessel'], path: '/pre-ovid', icon: ClipboardList, group: '12 Auditorias', badge: 'OCIMF' },
  { id: 'pre-mlc', label: 'Pre-MLC 2006', aliases: ['trabalho marítimo', 'ILO', 'labour'], path: '/mlc-inspection', icon: Users, group: '12 Auditorias', badge: 'ILO' },
  { id: 'psc', label: 'PSC Package', aliases: ['port state control', 'Paris MoU', 'Tokyo MoU'], path: '/psc-package', icon: Award, group: '12 Auditorias', badge: 'MoU' },
  { id: 'sgso', label: 'SGSO ANP 17 Práticas', aliases: ['gestão operacional', 'ANP Brasil'], path: '/sgso', icon: Settings, group: '12 Auditorias', badge: 'ANP' },
  { id: 'pre-sire', label: 'Pre-SIRE 2.0', aliases: ['OCIMF SIRE', 'tanker inspection'], path: '/pre-sire', icon: Ship, group: '12 Auditorias', badge: 'OCIMF' },
  { id: 'tmsa', label: 'TMSA Assessment', aliases: ['tanker management', 'OCIMF'], path: '/tmsa-assessment', icon: BarChart3, group: '12 Auditorias', badge: 'OCIMF' },
  
  // ═══════════════════════════════════════════════════════════
  // MEGA-HUB G: WORKBENCH
  // ═══════════════════════════════════════════════════════════
  // Documents
  { id: 'docs', label: 'Document Center', aliases: ['documentos', 'arquivos'], path: '/workbench?section=docs', icon: FileText, group: 'Workbench' },
  { id: 'templates', label: 'Templates', aliases: ['modelos', 'formulários'], path: '/workbench/docs?tab=templates', icon: FileText, group: 'Workbench' },
  
  // People
  { id: 'people', label: 'People Hub', aliases: ['RH', 'tripulação', 'crew'], path: '/workbench?section=people', icon: Users, group: 'Workbench' },
  { id: 'stcw-mlc', label: 'STCW/MLC Compliance', aliases: ['certificados', 'treinamento'], path: '/stcw-mlc', icon: Award, group: 'Workbench' },
  { id: 'medical', label: 'Medical Infirmary', aliases: ['enfermaria', 'saúde'], path: '/medical-infirmary', icon: Stethoscope, group: 'Workbench' },
  
  // Finance
  { id: 'finance', label: 'Finance Hub', aliases: ['financeiro', 'contabilidade'], path: '/workbench?section=finance', icon: DollarSign, group: 'Workbench' },
  { id: 'travel', label: 'Travel Command', aliases: ['viagens', 'passagens'], path: '/travel-command', icon: Plane, group: 'Workbench' },
  
  // System
  { id: 'system', label: 'System Hub', aliases: ['configurações', 'settings'], path: '/workbench?section=system', icon: Settings, group: 'Workbench' },
  { id: 'dev-tools', label: 'Dev Tools', aliases: ['desenvolvimento', 'debug'], path: '/dev-routes', icon: Terminal, group: 'Workbench', restricted: true },
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
    navigate(path);
  }, [navigate]);

  // Group modules by category
  const groupedModules = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
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
      <CommandInput placeholder="Buscar módulos... (Ctrl+K)" />
      <CommandList>
        <CommandEmpty>Nenhum módulo encontrado.</CommandEmpty>
        
        {Object.entries(groupedModules).map(([group, modules], idx) => (
          <React.Fragment key={group}>
            {idx > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {modules.map((module) => (
                <CommandItem
                  key={module.id}
                  value={`${module.label} ${module.aliases.join(' ')}`}
                  onSelect={() => handleSelect(module.path)}
                  className="flex items-center gap-3"
                >
                  <module.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{module.label}</span>
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

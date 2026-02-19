/**
 * LVS Acceptance Dashboard - Petrobras Vessel Acceptance Checklist
 * Estrutura: Seção → Subseção → Item LV → Evidência
 * Baseado na ET-3000.00-1500-91C-PLL-017
 */
import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ChevronRight, ChevronDown, Search, Download, Ship, Shield, CheckCircle2,
  XCircle, Clock, AlertTriangle, FileText, Camera, FolderOpen, FolderTree,
  BarChart3, Target, Brain, ClipboardCheck, Wrench, Anchor, Monitor,
  Wifi, Fuel, Users, Home, Package, Eye, Gauge
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Legend
} from "recharts";

// ─── Types ────────────────────────────────────────────────────
type ItemStatus = "approved" | "pending" | "rejected" | "not_applicable" | "not_verified";

interface LVItem {
  id: string;
  ref: string;
  question: string;
  methodology: string;
  status: ItemStatus;
  observations: string;
  pendency: string;
  deadline: string;
  hasPhoto: boolean;
}

interface SubSection {
  id: string;
  code: string;
  title: string;
  items: LVItem[];
}

interface Section {
  id: string;
  code: string;
  title: string;
  icon: React.ElementType;
  subsections: SubSection[];
}

// ─── LVS Data Structure (from ET-3000.00-1500-91C-PLL-017) ────
const LVS_SECTIONS: Section[] = [
  {
    id: "s4.1", code: "4.1", title: "Planejamento e Execução dos Serviços", icon: ClipboardCheck,
    subsections: [
      { id: "s4.1.rov", code: "4.1", title: "ROV e Operações Submarinas", items: [
        { id: "4.1b", ref: "4.1 b", question: "A embarcação possui um ou dois sistemas de ROV tipo workclass prestando serviço 24h/7d?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "4.1b.nota", ref: "4.1b.nota", question: "A CONTRATADA é capaz de operar os 2 ROVs de forma simultânea sem aviso prévio?", methodology: "Verificação de disponibilidade de equipe e teste na água", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "4.1c", ref: "4.1 c", question: "Tem condições de executar lançamento/recolhimento do ROV dentro do envelope de condições ambientais (Hs/Tp)?", methodology: "Avaliação Documental e testes com ROV", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "4.1c.nota", ref: "4.1.c.nota4", question: "Entregou a análise hidrodinâmica comprovando operação segura nas condições da tabela 1?", methodology: "Avaliação da análise hidrodinâmica", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "4.1d", ref: "4.1 d", question: "Tem condições de operar o ROV nos serviços 5.1/5.2 até os limites de condições ambientais?", methodology: "Avaliação Documental e testes", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "4.1e", ref: "4.1 e", question: "Tem condições de executar movimentação de cargas dentro do envelope ambiental?", methodology: "Avaliação Documental e testes", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "4.1f", ref: "4.1 f", question: "Tem estrutura para elaborar PE próprio com prazos de complexidade 1-4?", methodology: "Avaliar estrutura e pessoal", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "4.1g", ref: "4.1 g", question: "Mantém suporte onshore dedicado ao planejamento das operações?", methodology: "Formalização do suporte onshore", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "4.1l.1", ref: "4.1 l.nota1", question: "Possui procedimento de peação do ROV com indicação de elementos e pontos de fixação?", methodology: "Avaliação documental", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "4.1l.2", ref: "4.1 l.nota2", question: "Apresentou estudo de peação do ROV aprovado por classificadora?", methodology: "Avaliação documental", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "4.1n", ref: "4.1 n", question: "Apresentou catálogo digital com todas as ferramentas disponíveis?", methodology: "Avaliação documental", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
    ]
  },
  {
    id: "s4.2", code: "4.2", title: "Registros dos Serviços", icon: FileText,
    subsections: [
      { id: "s4.2.video", code: "4.2", title: "Vídeo, Relatórios e Dados", items: [
        { id: "4.2b", ref: "4.2 b", question: "Possui meios para gravar vídeos 1920x1080, H.264, 30fps, MPEG-4, trechos de 30min?", methodology: "Avaliação dos equipamentos a bordo", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "4.2c", ref: "4.2 c", question: "Possui infraestrutura de upload via internet em 96h dos arquivos para nuvem Petrobras?", methodology: "Teste de transferência", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "4.2e", ref: "4.2 e", question: "Possui meios de anexar gráfico A-SCAN e dados brutos de medição de espessura?", methodology: "Criação de arquivo teste", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "4.2f", ref: "4.2 f", question: "Possui meios de anexar gráfico pressão x torque de ferramentas de torque?", methodology: "Criação de arquivo teste", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
    ]
  },
  {
    id: "s4.3", code: "4.3", title: "Equipes e Qualificações", icon: Users,
    subsections: [
      { id: "s4.3.cert", code: "4.3", title: "Certificações e Qualificações da Equipe", items: [
        { id: "4.3b.i", ref: "4.3 b.i", question: "Equipe qualificada na norma ABENDI NA-003 (END subaquático)?", methodology: "Referência - sem exigência de certificado", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "4.3b.ii", ref: "4.3 b.ii", question: "Equipe qualificada na ABNT NBR 16244 (Inspeção visual subaquática)?", methodology: "Certificado ou treinamento aceito temporariamente", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "4.3b.iii", ref: "4.3 b.iii", question: "Equipe qualificada na ABNT NBR 16482 (Medição potencial eletroquímico)?", methodology: "Certificado ABENDI ou equivalente", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "4.3b.iv", ref: "4.3 b.iv", question: "Equipe qualificada na ABNT NBR 16794 (Medição espessura por ultrassom subaquático)?", methodology: "Certificado ABENDI ou equivalente", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "4.3b.v", ref: "4.3 b.v", question: "Equipe qualificada na ABNT NBR 15549 (Verificação aparelhagem medição espessura)?", methodology: "Certificado ABENDI ou equivalente", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "4.3c", ref: "4.3 c", question: "Profissionais capacitados conforme IMCA C 004 (Survey) e IMCA C 005 (ROV)?", methodology: "Nome e qualificação dos técnicos", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "4.3e", ref: "4.3 e.nota", question: "Disponibilizaram Técnico de Segurança para operações a bordo?", methodology: "Nome e qualificação do TSeg", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
    ]
  },
  {
    id: "s4.4", code: "4.4", title: "Qualidade e Conformidade", icon: Shield,
    subsections: [
      { id: "s4.4.qual", code: "4.4", title: "Controle de Qualidade", items: [
        { id: "4.4f", ref: "4.4 f", question: "Conexões das mangueiras hidráulicas das ferramentas ROV protegidas contra desenroscamento?", methodology: "Avaliar conexões", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
    ]
  },
  {
    id: "s4.5", code: "4.5", title: "Preparação dos ROVs", icon: Wrench,
    subsections: [
      { id: "s4.5.prep", code: "4.5", title: "Calibração e Manutenção de Ferramentas", items: [
        { id: "4.5a", ref: "4.5 a", question: "Certificados de aferição/calibração em dia: torque analyser, medidor ultrassônico, potencial eletroquímico, multímetros, eletrodos, blocos padrão?", methodology: "Apresentação dos certificados", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "4.5b", ref: "4.5 b", question: "Rotina de manutenções e testes periódicos em todas as ferramentas evidenciada?", methodology: "Plano de manutenção + registros", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "4.5e", ref: "4.5 e", question: "Dois conjuntos idênticos de ferramentas para equipar ambos ROVs simultaneamente?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
    ]
  },
  {
    id: "s5.1", code: "5.1", title: "Serviços Submarinos Principais", icon: Anchor,
    subsections: [
      { id: "s5.1.insp", code: "5.1.1", title: "Inspeção Submarina", items: [
        { id: "5.1.1a", ref: "5.1.1 a", question: "Dispositivos para inspeção visual, dragagem, limpeza e medição potencial no trecho estático (flowline)?", methodology: "Apresentação dispositivo + teste", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "5.1.1b", ref: "5.1.1 b", question: "Dispositivos para inspeção visual, dragagem, limpeza e medição no trecho dinâmico (riser)?", methodology: "Apresentação dispositivo + teste", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "5.1.1c", ref: "5.1.1 c", question: "Dispositivos para inspeção visual do duto até 20m da superfície + limpeza + potencial?", methodology: "Apresentação dispositivo + teste", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "5.1.1o", ref: "5.1.1 o", question: "Credenciada por classificadoras para inspeção de classe em unidades marítimas Petrobras?", methodology: "Documentação de credenciamento", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
      { id: "s5.1.2", code: "5.1.2", title: "Intervenção Leve e Média", items: [
        { id: "5.1.2d", ref: "5.1.2 d", question: "Gancho de içamento e ferramenta de inspeção de geratriz inferior (Ø 90mm-600mm)?", methodology: "Apresentação das ferramentas", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "5.1.2g", ref: "5.1.2 g", question: "Plano para disponibilizar skids de anodos para recomposição de proteção catódica?", methodology: "Apresentação do plano", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "5.1.2k", ref: "5.1.2 k", question: "Ferramenta para instalação de cubo cego grayloc?", methodology: "Verificação de disponibilidade", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
      { id: "s5.1.3", code: "5.1.3", title: "Intervenção Complexa", items: [
        { id: "5.1.3a", ref: "5.1.3 a", question: "Plano para calços (mecânico, poitas, grout bag) para eliminação de vãos livres em 90 dias?", methodology: "Apresentação do plano", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "5.1.3d", ref: "5.1.3 d", question: "Facilidades para bombeio/injeção de fluidos: diesel, peação, ar comprimido, energia elétrica?", methodology: "Verificação no convés", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "5.1.3f", ref: "5.1.3 f", question: "Plano para quebra/prevenção de hidratos em equipamentos submarinos?", methodology: "Apresentação do plano", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
    ]
  },
  {
    id: "s5.2", code: "5.2", title: "Equipamentos e Ferramentas Submarinas", icon: Wrench,
    subsections: [
      { id: "s5.2.me", code: "5.2.3-5.2.6", title: "Medição de Espessura e Potencial", items: [
        { id: "5.2.3", ref: "5.2.3", question: "Sistema de medição de espessura por ultrassom com resolução 0,1mm e range até 80mm?", methodology: "Avaliação do datasheet + teste", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "5.2.5", ref: "5.2.5", question: "Sistema de medição de potencial eletroquímico com eletrodos zinco e Ag/AgCl?", methodology: "Avaliação do datasheet + teste", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
      { id: "s5.2.torque", code: "5.2.7", title: "Ferramentas de Torque", items: [
        { id: "5.2.7", ref: "5.2.7", question: "Ferramentas de torque (torque tool) com torque analyser e gráfico pressão x torque?", methodology: "Avaliação do datasheet + teste", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
      { id: "s5.2.mov", code: "5.2.9", title: "Movimentação de Cargas Submarinas", items: [
        { id: "5.2.9.1a", ref: "5.2.9.1.a", question: "Sistema de cabos com SWL 10ton para movimentação até 3000m de profundidade?", methodology: "Avaliação do datasheet", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "5.2.9.2", ref: "5.2.9.2", question: "Meios para transbordo de cargas em áreas portuárias (ship-to-ship)?", methodology: "Avaliação do datasheet", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "5.2.9.5", ref: "5.2.9.5", question: "Área livre no convés (120-500m²) exclusiva para equipamentos Petrobras?", methodology: "Avaliação do desenho do convés", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
      { id: "s5.2.corte", code: "5.2.10", title: "Ferramentas de Corte", items: [
        { id: "5.2.10a", ref: "5.2.10.a", question: "Ferramenta de corte de cabos de aço até 3\" por guilhotinamento?", methodology: "Avaliação do datasheet", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "5.2.10b", ref: "5.2.10.b", question: "Ferramenta de corte por disco abrasivo (7\"-20\"), rotação 1800-3000rpm, pressão 2000-3000psi?", methodology: "Avaliação + teste no convés", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "5.2.10d", ref: "5.2.10.d", question: "Corte de dutos flexíveis/rígidos até 24\" por fita diamantada ou disco?", methodology: "Avaliação do datasheet", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
      { id: "s5.2.hidro", code: "5.2.11", title: "Hidrojateamento e Sucção", items: [
        { id: "5.2.11.1", ref: "5.2.11.1", question: "Ferramenta de hidrojateamento de alta pressão (210-350 bar, 15 ℓ/min)?", methodology: "Avaliação + teste", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "5.2.11.2a", ref: "5.2.11.2.a", question: "Ferramenta de sucção com capacidade de 60 ton/h de sedimentos?", methodology: "Avaliação do datasheet", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
      { id: "s5.2.coleta", code: "5.2.12", title: "Detecção e Coleta de Hidrocarbonetos", items: [
        { id: "5.2.12.1", ref: "5.2.12.1", question: "Ferramenta para detectar hidrocarbonetos, fluoresceína e HW na água do mar?", methodology: "Verificação do datasheet", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "5.2.12.3", ref: "5.2.12.3", question: "Recipiente estanque (mín. 1L) para coleta de amostras pelo ROV?", methodology: "Verificação dos dispositivos", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "5.2.12.4a", ref: "5.2.12.4.a", question: "Sistema campânula (0,6m³) + shuttle tank (3m³) + bomba + mangueiras?", methodology: "Verificação do datasheet", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
      { id: "s5.2.ultra", code: "5.2.14", title: "Jateamento de Ultrapressão", items: [
        { id: "5.2.14", ref: "5.2.14", question: "Sistema de ultrapressão 500-11000 psi, vazão mín. 27 L/min?", methodology: "Teste no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
      { id: "s5.2.oficina", code: "5.2.16", title: "Usinagem, Soldagem e Calderaria", items: [
        { id: "5.2.16a", ref: "5.2.16.a", question: "Oficina capacitada para usinagem, soldagem e caldeiraria?", methodology: "Verificação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
    ]
  },
  {
    id: "s6", code: "6", title: "Embarcação (DP, Propulsão, Navegação)", icon: Ship,
    subsections: [
      { id: "s6.dp", code: "6", title: "Sistema DP e Propulsão", items: [
        { id: "6.dp.class", ref: "6.1", question: "Embarcação com classe DP-2 ou superior válida?", methodology: "Verificação de certificado", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "6.nav", ref: "6.2", question: "Sistemas de navegação (ECDIS, radar, AIS) operacionais e calibrados?", methodology: "Verificação no passadiço", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "6.prop", ref: "6.3", question: "Redundância de propulsão e geração de energia conforme classe DP?", methodology: "Verificação técnica", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
    ]
  },
  {
    id: "s7", code: "7", title: "Habitabilidade", icon: Home,
    subsections: [
      { id: "s7.cam.fisc", code: "7.4", title: "Camarotes da Fiscalização", items: [
        { id: "7.4.1", ref: "7.4.1", question: "Dois camarotes individuais com banheiros privativos para fiscalização?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "7.4.1a", ref: "7.4.1.a", question: "Ramal interno para comunicação com todos os setores?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "7.4.1b", ref: "7.4.1.b", question: "TV para reprodução de TV via satélite?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "7.4.1c", ref: "7.4.1.c", question: "Acesso à internet wifi?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "7.4.1d", ref: "7.4.1.d", question: "Dois monitores para câmeras ROV, navegação e CFTV?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
      { id: "s7.cam.tec", code: "7.5", title: "Camarotes dos Técnicos Petrobras", items: [
        { id: "7.5.1", ref: "7.5.1", question: "Três camarotes duplos com banheiros privativos?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
      { id: "s7.escritorio", code: "7.6", title: "Escritório da Fiscalização", items: [
        { id: "7.6.1a", ref: "7.6.1.a", question: "Facilidades para reuniões de 4 pessoas?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "7.6.1b", ref: "7.6.1.b", question: "Seis pontos de rede (3 contratada + 3 Petrobras)?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "7.6.1c", ref: "7.6.1.c", question: "Dois desktops (rede Petrobras + rede contratada) + MS Office + Adobe Acrobat?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "7.6.1f", ref: "7.6.1.f", question: "Dois monitores 55\" com divisão de tela para 4 imagens ROV/CFTV cada?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "7.6.1k", ref: "7.6.1.k", question: "Dois rádios VHF (fixo + portátil)?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "7.6.1l", ref: "7.6.1.l", question: "Dois rádios UHF portáteis?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "7.6.1n", ref: "7.6.1.n", question: "Intercomunicador hands-free (tipo Tecpro) ligando passadiço, escritório, sala de operações e sala ROV?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
      { id: "s7.ops", code: "7.8", title: "Sala de Operações", items: [
        { id: "7.8.1a", ref: "7.8.1.a", question: "Duas cadeiras para suporte técnico e fiscalização?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "7.8.1b", ref: "7.8.1.b", question: "Computador com acesso à rede interna para Técnico de Operações?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
      { id: "s7.reuniao", code: "7.10", title: "Sala de Reunião", items: [
        { id: "7.10a", ref: "7.10.a", question: "Mesa de reunião para mínimo 10 lugares?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "7.10d", ref: "7.10.d", question: "TV 50\" mín. com entrada USB conectada ao computador?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
      { id: "s7.gym", code: "7.9", title: "Bem-Estar Físico", items: [
        { id: "7.9.1", ref: "7.9.1", question: "Ambiente para bem-estar físico com equipamentos profissionais + laudo?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
      { id: "s7.clima", code: "7.2", title: "Climatização", items: [
        { id: "7.2.1", ref: "7.2.1", question: "Ar condicionado conforme ABNT NBR 16401 em todos os ambientes?", methodology: "Avaliação de temperatura e umidade", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "7.2.2", ref: "7.2.2", question: "Equipamento calibrado para comprovação dos parâmetros de climatização?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
    ]
  },
  {
    id: "s8", code: "8", title: "Transferência de Pessoas", icon: Users,
    subsections: [
      { id: "s8.cesta", code: "8.1", title: "Cesta, Fundeio e Gangway", items: [
        { id: "8.1.1", ref: "8.1.1", question: "Coletes, áreas demarcadas e cestas operacionais e certificados?", methodology: "Verificação a bordo", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "8.1.2", ref: "8.1.2", question: "Procedimento de Transferência atende PE-1PBR-00243 e PE-1PBR-00241?", methodology: "Verificação do procedimento", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
    ]
  },
  {
    id: "s9", code: "9", title: "Autonomia (Combustível, Água, Consumíveis)", icon: Fuel,
    subsections: [
      { id: "s9.fuel", code: "9.1", title: "Combustível", items: [
        { id: "9.1.1", ref: "9.1.1", question: "Autonomia mínima de 42 dias sem interrupção para abastecimento?", methodology: "Avaliação tancagem vs consumo", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "9.1.7", ref: "9.1.7", question: "Bandejas de contenção (mín. 200L) em cada tomada de combustível?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
      { id: "s9.agua", code: "9.2", title: "Água Doce", items: [
        { id: "9.2.1", ref: "9.2.1", question: "Planta de dessalinização para autossuficiência parcial?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
    ]
  },
  {
    id: "s13", code: "13", title: "Movimentação de Cargas", icon: Package,
    subsections: [
      { id: "s13.cargas", code: "13", title: "Equipamentos de Movimentação", items: [
        { id: "13.1", ref: "13.1", question: "Equipamentos de movimentação de carga conforme escopo contratual?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
    ]
  },
  {
    id: "s14", code: "14", title: "Monitoramento de Imagens (CFTV)", icon: Monitor,
    subsections: [
      { id: "s14.cameras", code: "14.1", title: "Câmeras e CFTV", items: [
        { id: "14.1", ref: "14.1", question: "Câmeras cobrindo: operações de convés, lançamento ROV, guindastes, passadiço, praça de máquinas?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
        { id: "14.1h", ref: "14.1.h", question: "Imagens do sistema DP com resolução mín. 720p para distinção de parâmetros?", methodology: "Verificação remota da qualidade", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
    ]
  },
  {
    id: "s17", code: "17", title: "Internet e Telecomunicações", icon: Wifi,
    subsections: [
      { id: "s17.petro", code: "17.1", title: "Rede Petrobras", items: [
        { id: "17.1.1", ref: "17.1.1", question: "Internet, voz e dados criptografados conforme ET-0600.00-5510-760-PPT-542?", methodology: "Avaliação no local", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
      { id: "s17.contratada", code: "17.2", title: "Rede Contratada (Starlink/LEO)", items: [
        { id: "17.2.1", ref: "17.2.1", question: "Link Starlink/LEO segregado da rede Petrobras com cobertura offshore?", methodology: "Teste de disponibilidade e velocidade", status: "not_verified", observations: "", pendency: "", deadline: "", hasPhoto: false },
      ]},
    ]
  },
];

// ─── Helpers ──────────────────────────────────────────────────
const STATUS_CONFIG: Record<ItemStatus, { label: string; color: string; icon: React.ElementType }> = {
  approved: { label: "Aprovado", color: "bg-success/20 text-success", icon: CheckCircle2 },
  pending: { label: "Pendente", color: "bg-warning/20 text-warning", icon: Clock },
  rejected: { label: "Rejeitado", color: "bg-destructive/20 text-destructive", icon: XCircle },
  not_applicable: { label: "N/A", color: "bg-muted text-muted-foreground", icon: AlertTriangle },
  not_verified: { label: "Não Verificado", color: "bg-muted text-muted-foreground", icon: Eye },
};
const CHART_COLORS = ["hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))", "hsl(var(--muted))", "hsl(var(--primary))"];

// ─── Component ────────────────────────────────────────────────
export function LVSAcceptanceDashboard() {
  const [sections, setSections] = useState<Section[]>(LVS_SECTIONS);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedSubSections, setExpandedSubSections] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [mainTab, setMainTab] = useState("tree");
  const [editDialog, setEditDialog] = useState<LVItem | null>(null);

  // Toggle expand
  const toggleSection = (id: string) => setExpandedSections(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleSubSection = (id: string) => setExpandedSubSections(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // Update item status
  const updateItemStatus = useCallback((itemId: string, status: ItemStatus) => {
    setSections(prev => prev.map(sec => ({
      ...sec,
      subsections: sec.subsections.map(sub => ({
        ...sub,
        items: sub.items.map(item => item.id === itemId ? { ...item, status } : item)
      }))
    })));
    toast.success(`Status atualizado para ${STATUS_CONFIG[status].label}`);
  }, []);

  const updateItemFields = useCallback((itemId: string, fields: Partial<LVItem>) => {
    setSections(prev => prev.map(sec => ({
      ...sec,
      subsections: sec.subsections.map(sub => ({
        ...sub,
        items: sub.items.map(item => item.id === itemId ? { ...item, ...fields } : item)
      }))
    })));
  }, []);

  // Analytics
  const analytics = useMemo(() => {
    const allItems = sections.flatMap(s => s.subsections.flatMap(ss => ss.items));
    const total = allItems.length;
    const approved = allItems.filter(i => i.status === "approved").length;
    const pending = allItems.filter(i => i.status === "pending").length;
    const rejected = allItems.filter(i => i.status === "rejected").length;
    const notVerified = allItems.filter(i => i.status === "not_verified").length;
    const na = allItems.filter(i => i.status === "not_applicable").length;
    const applicable = total - na;
    const score = applicable > 0 ? Math.round((approved / applicable) * 100) : 0;

    const statusDist = [
      { name: "Aprovado", value: approved },
      { name: "Pendente", value: pending },
      { name: "Rejeitado", value: rejected },
      { name: "Não Verificado", value: notVerified },
      { name: "N/A", value: na },
    ].filter(d => d.value > 0);

    const sectionScores = sections.map(sec => {
      const items = sec.subsections.flatMap(ss => ss.items);
      const secApplicable = items.filter(i => i.status !== "not_applicable").length;
      const secApproved = items.filter(i => i.status === "approved").length;
      return {
        name: sec.code,
        score: secApplicable > 0 ? Math.round((secApproved / secApplicable) * 100) : 0,
        total: items.length,
        approved: secApproved,
      };
    });

    const radarData = sectionScores.filter(s => s.total > 0).map(s => ({
      metric: s.name,
      value: s.score,
    }));

    const withPendency = allItems.filter(i => i.pendency).length;

    return { total, approved, pending, rejected, notVerified, na, applicable, score, statusDist, sectionScores, radarData, withPendency };
  }, [sections]);

  // Filtering
  const filteredSections = useMemo(() => {
    if (!searchTerm && filterStatus === "all") return sections;
    return sections.map(sec => ({
      ...sec,
      subsections: sec.subsections.map(sub => ({
        ...sub,
        items: sub.items.filter(item => {
          const matchSearch = !searchTerm || item.question.toLowerCase().includes(searchTerm.toLowerCase()) || item.ref.toLowerCase().includes(searchTerm.toLowerCase());
          const matchStatus = filterStatus === "all" || item.status === filterStatus;
          return matchSearch && matchStatus;
        })
      })).filter(sub => sub.items.length > 0)
    })).filter(sec => sec.subsections.length > 0);
  }, [sections, searchTerm, filterStatus]);

  // CSV Export
  const exportCSV = () => {
    const headers = ["REF", "Questão", "Status", "Metodologia", "Observações", "Pendência", "Prazo", "Foto"];
    const allItems = sections.flatMap(s => s.subsections.flatMap(ss => ss.items));
    const rows = allItems.map(i => [i.ref, `"${i.question}"`, STATUS_CONFIG[i.status].label, `"${i.methodology}"`, `"${i.observations}"`, `"${i.pendency}"`, i.deadline, i.hasPhoto ? "Sim" : "Não"].join(","));
    const blob = new Blob([headers.join(",") + "\n" + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "lvs-aceitacao-petrobras.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado!");
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        {[
          { icon: ClipboardCheck, label: "Total Itens", value: analytics.total, color: "text-primary" },
          { icon: CheckCircle2, label: "Aprovados", value: analytics.approved, color: "text-success" },
          { icon: Clock, label: "Pendentes", value: analytics.pending, color: "text-warning" },
          { icon: XCircle, label: "Rejeitados", value: analytics.rejected, color: "text-destructive" },
          { icon: Eye, label: "Não Verificados", value: analytics.notVerified, color: "text-muted-foreground" },
          { icon: Target, label: "Score", value: `${analytics.score}%`, color: analytics.score >= 80 ? "text-success" : analytics.score >= 50 ? "text-warning" : "text-destructive" },
          { icon: AlertTriangle, label: "Pendências", value: analytics.withPendency, color: analytics.withPendency > 0 ? "text-warning" : "text-success" },
        ].map(kpi => (
          <Card key={kpi.label}><CardContent className="p-3 text-center">
            <kpi.icon className={`h-5 w-5 mx-auto mb-1 ${kpi.color}`} />
            <div className="text-lg font-bold">{kpi.value}</div>
            <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList>
          <TabsTrigger value="tree"><FolderTree className="h-3.5 w-3.5 mr-1" /> Pastas & Itens</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="h-3.5 w-3.5 mr-1" /> Analytics</TabsTrigger>
          <TabsTrigger value="pendencies"><AlertTriangle className="h-3.5 w-3.5 mr-1" /> Pendências ({analytics.withPendency})</TabsTrigger>
        </TabsList>

        {/* ─── Tree View ──────────────────── */}
        <TabsContent value="tree">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por REF ou texto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" /> CSV</Button>
            <Button variant="outline" size="sm" onClick={() => {
              setExpandedSections(new Set(sections.map(s => s.id)));
              setExpandedSubSections(new Set(sections.flatMap(s => s.subsections.map(ss => ss.id))));
            }}><FolderOpen className="h-4 w-4 mr-1" /> Expandir Tudo</Button>
          </div>

          {/* Score Progress */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Score Geral de Aceitação</span>
                <span className={`text-2xl font-bold ${analytics.score >= 80 ? 'text-success' : analytics.score >= 50 ? 'text-warning' : 'text-destructive'}`}>{analytics.score}%</span>
              </div>
              <Progress value={analytics.score} className="h-3" />
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span className="text-success">● {analytics.approved} Aprovados</span>
                <span className="text-warning">● {analytics.pending} Pendentes</span>
                <span className="text-destructive">● {analytics.rejected} Rejeitados</span>
                <span>● {analytics.notVerified} Não Verificados</span>
              </div>
            </CardContent>
          </Card>

          {/* Sections (Folders) */}
          <div className="space-y-2">
            {filteredSections.map(section => {
              const isExpanded = expandedSections.has(section.id);
              const sectionItems = section.subsections.flatMap(ss => ss.items);
              const secApproved = sectionItems.filter(i => i.status === "approved").length;
              const secTotal = sectionItems.length;
              const secScore = secTotal > 0 ? Math.round((secApproved / secTotal) * 100) : 0;
              const Icon = section.icon;

              return (
                <Collapsible key={section.id} open={isExpanded} onOpenChange={() => toggleSection(section.id)}>
                  <CollapsibleTrigger asChild>
                    <Card className="cursor-pointer hover:bg-muted/30 transition-colors">
                      <CardContent className="p-4 flex items-center gap-3">
                        {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                        <Icon className="h-5 w-5 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs shrink-0">{section.code}</Badge>
                            <span className="font-semibold text-sm truncate">{section.title}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={secScore} className="flex-1 h-1.5 max-w-[200px]" />
                            <span className="text-xs text-muted-foreground">{secApproved}/{secTotal}</span>
                          </div>
                        </div>
                        <Badge className={secScore === 100 ? "bg-success/20 text-success" : secScore >= 50 ? "bg-warning/20 text-warning" : "bg-muted"}>{secScore}%</Badge>
                      </CardContent>
                    </Card>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="ml-6 space-y-1 mt-1">
                    {section.subsections.map(sub => {
                      const subExpanded = expandedSubSections.has(sub.id);
                      const subApproved = sub.items.filter(i => i.status === "approved").length;
                      return (
                        <Collapsible key={sub.id} open={subExpanded} onOpenChange={() => toggleSubSection(sub.id)}>
                          <CollapsibleTrigger asChild>
                            <Card className="cursor-pointer hover:bg-muted/30 transition-colors">
                              <CardContent className="p-3 flex items-center gap-3">
                                {subExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium flex-1">{sub.title}</span>
                                <span className="text-xs text-muted-foreground">{subApproved}/{sub.items.length}</span>
                              </CardContent>
                            </Card>
                          </CollapsibleTrigger>

                          <CollapsibleContent className="ml-8 space-y-1 mt-1">
                            {sub.items.map(item => {
                              const cfg = STATUS_CONFIG[item.status];
                              const StatusIcon = cfg.icon;
                              return (
                                <Card key={item.id} className={`${item.status === "rejected" ? "border-destructive/50" : item.status === "pending" ? "border-warning/50" : ""}`}>
                                  <CardContent className="p-3">
                                    <div className="flex items-start gap-2">
                                      <StatusIcon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.color.split(" ")[1]}`} />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded shrink-0">{item.ref}</code>
                                          <Badge className={`text-[10px] ${cfg.color}`}>{cfg.label}</Badge>
                                          {item.hasPhoto && <Camera className="h-3 w-3 text-muted-foreground" />}
                                        </div>
                                        <p className="text-sm leading-snug">{item.question}</p>
                                        <p className="text-xs text-muted-foreground mt-1">📋 {item.methodology}</p>
                                        {item.pendency && <p className="text-xs text-warning mt-1">⚠️ {item.pendency}</p>}
                                        {item.observations && <p className="text-xs text-muted-foreground mt-1">💬 {item.observations}</p>}
                                      </div>
                                      <div className="flex flex-col gap-1 shrink-0">
                                        <Select value={item.status} onValueChange={(v) => updateItemStatus(item.id, v as ItemStatus)}>
                                          <SelectTrigger className="h-7 w-28 text-[10px]"><SelectValue /></SelectTrigger>
                                          <SelectContent>
                                            {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>)}
                                          </SelectContent>
                                        </Select>
                                        <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setEditDialog(item)}>Editar</Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </TabsContent>

        {/* ─── Analytics Tab ──────────────────── */}
        <TabsContent value="analytics">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Acceptance Readiness Radar</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={analytics.radarData}>
                    <PolarGrid className="stroke-border" />
                    <PolarAngleAxis dataKey="metric" className="text-xs" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                    <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Distribuição de Status</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {analytics.statusDist.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Score por Seção</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.sectionScores.filter(s => s.total > 0)}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Bar dataKey="score" name="Score %" radius={[4, 4, 0, 0]}>
                      {analytics.sectionScores.filter(s => s.total > 0).map((s, i) => (
                        <Cell key={i} fill={s.score >= 80 ? "hsl(var(--success))" : s.score >= 50 ? "hsl(var(--warning))" : "hsl(var(--destructive))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Pendencies Tab ──────────────────── */}
        <TabsContent value="pendencies">
          {(() => {
            const pendItems = sections.flatMap(s => s.subsections.flatMap(ss => ss.items.filter(i => i.status === "pending" || i.status === "rejected" || i.pendency)));
            return pendItems.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-success" />
                <p className="text-muted-foreground">Nenhuma pendência encontrada!</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-2">
                {pendItems.map(item => {
                  const cfg = STATUS_CONFIG[item.status];
                  return (
                    <Card key={item.id} className={item.status === "rejected" ? "border-destructive/50" : "border-warning/50"}>
                      <CardContent className="p-4 flex items-start gap-3">
                        <cfg.icon className={`h-5 w-5 mt-0.5 shrink-0 ${cfg.color.split(" ")[1]}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-xs bg-muted px-2 py-0.5 rounded">{item.ref}</code>
                            <Badge className={`text-[10px] ${cfg.color}`}>{cfg.label}</Badge>
                            {item.deadline && <span className="text-xs text-muted-foreground">📅 {item.deadline}</span>}
                          </div>
                          <p className="text-sm">{item.question}</p>
                          {item.pendency && <p className="text-xs text-warning mt-1">⚠️ Pendência: {item.pendency}</p>}
                        </div>
                        <Select value={item.status} onValueChange={(v) => updateItemStatus(item.id, v as ItemStatus)}>
                          <SelectTrigger className="h-7 w-28 text-[10px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            );
          })()}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Editar Item LV</DialogTitle></DialogHeader>
          {editDialog && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Referência</label>
                <Input value={editDialog.ref} readOnly className="bg-muted" />
              </div>
              <div>
                <label className="text-sm font-medium">Questão</label>
                <p className="text-sm text-muted-foreground border rounded p-2">{editDialog.question}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Observações</label>
                <Textarea value={editDialog.observations} onChange={e => setEditDialog({ ...editDialog, observations: e.target.value })} placeholder="Adicionar observações..." />
              </div>
              <div>
                <label className="text-sm font-medium">Pendência</label>
                <Textarea value={editDialog.pendency} onChange={e => setEditDialog({ ...editDialog, pendency: e.target.value })} placeholder="Descrever pendência..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Prazo</label>
                  <Input type="date" value={editDialog.deadline} onChange={e => setEditDialog({ ...editDialog, deadline: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={editDialog.status} onValueChange={v => setEditDialog({ ...editDialog, status: v as ItemStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full" onClick={() => {
                if (editDialog) {
                  updateItemFields(editDialog.id, {
                    observations: editDialog.observations,
                    pendency: editDialog.pendency,
                    deadline: editDialog.deadline,
                    status: editDialog.status,
                  });
                  setEditDialog(null);
                  toast.success("Item atualizado!");
                }
              }}>Salvar Alterações</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

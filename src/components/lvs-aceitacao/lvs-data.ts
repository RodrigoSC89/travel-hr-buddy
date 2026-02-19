/**
 * LVS Aceitação RSV Petrobras — Data completa extraída do documento rev6
 * 3 Especificações Técnicas:
 *   Page 1: ET-3000.00-1500-91C-PLL-017 (Passadiço - Serviços ROV)
 *   Page 2: ET-3000.00-1521-690-PLL-001 (ROV A - Características do ROV)
 *   Page 3: ET-3000.00-1500-91C-P1J028 (RSV - Embarcação Geral)
 */
import {
  ClipboardCheck, FileText, Users, Shield, Wrench, Anchor, Ship,
  Home, Fuel, Package, Monitor, Wifi, Eye, Camera, Gauge, Settings,
  Cpu, Radio, Zap, Box, Compass, Waves, type LucideIcon
} from "lucide-react";

export type ItemStatus = "approved" | "pending" | "rejected" | "not_applicable" | "not_verified";

export interface LVItem {
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

export interface SubSection {
  id: string;
  code: string;
  title: string;
  items: LVItem[];
}

export interface Section {
  id: string;
  code: string;
  title: string;
  icon: LucideIcon;
  etRef: string; // Which ET this section belongs to
  subsections: SubSection[];
}

// Helper to create items quickly
const item = (id: string, ref: string, question: string, methodology: string, status: ItemStatus = "not_verified", observations = "", pendency = "", deadline = "", hasPhoto = false): LVItem =>
  ({ id, ref, question, methodology, status, observations, pendency, deadline, hasPhoto });

// ═══════════════════════════════════════════════════════════════
// ET-3000.00-1500-91C-PLL-017 — Serviços ROV (Passadiço)
// ═══════════════════════════════════════════════════════════════
const ET_PLL_017: Section[] = [
  {
    id: "pll-4.1", code: "4.1", title: "Planejamento e Execução dos Serviços", icon: ClipboardCheck, etRef: "ET-PLL-017",
    subsections: [
      { id: "pll-4.1-rov", code: "4.1", title: "ROV e Operações Submarinas", items: [
        item("pll-4.1b", "4.1 b", "A embarcação possui um ou dois sistemas de ROV tipo workclass prestando serviço 24h/7d? Tipos I e VI: 1 ROV tipo A; Tipo II: 1 ROV tipo B; Tipos III e V: 2 ROV tipo A; Tipo IV: 1 ROV tipo A e 1 ROV tipo E", "Avaliação no local", "approved"),
        item("pll-4.1b.nota", "4.1b.nota", "A CONTRATADA é capaz de operar os 2 ROVs de forma simultânea sem aviso prévio da PETROBRAS?", "Verificação de disponibilidade de equipe, procedimentos e teste na água", "pending", "", "Falta teste na água"),
        item("pll-4.1c", "4.1 c", "Tem condições de executar lançamento/recolhimento do ROV dentro do envelope de condições ambientais (Hs/Tp)?", "Avaliação da Documentação Técnica e testes com ROV", "pending", "", "Falta teste na água"),
        item("pll-4.1c.nota4", "4.1.c.nota4", "Entregou a análise hidrodinâmica comprovando operação segura nas condições da tabela 1? Análise no domínio do tempo?", "Avaliação da análise hidrodinâmica", "approved"),
        item("pll-4.1d", "4.1 d", "Tem condições de operar o ROV nos serviços 5.1/5.2 até os limites de condições ambientais?", "Avaliação Documental e testes", "pending", "", "Falta teste na água"),
        item("pll-4.1d.nota4", "4.1.d.nota4", "Entregou análise hidrodinâmica comprovando capacidade nas condições do item 4.1.d? Considera geometria, tether, inércia e escoamento?", "Avaliação da análise hidrodinâmica", "approved"),
        item("pll-4.1e", "4.1 e", "Tem condições de executar movimentação de cargas dentro do envelope ambiental? Lingadas, peação, overboarding, ZVM, compensação, inboarding.", "Avaliação Documental e testes", "pending", "", "Apresentar documentação e realizar teste (Guindaste)"),
        item("pll-4.1e.nota2", "4.1.e.nota2", "Serviços de movimentação de cargas disponíveis 24h/7d ininterruptamente?", "Verificação de equipe dimensionada 24h", "pending", "Anexar no app BR", "Documentação vencida OCP Marinheiros e guindasteiros"),
        item("pll-4.1f", "4.1 f", "Tem estrutura para elaborar PE próprio com prazos de complexidade 1-4 (6h, 1d, 3d, 10d)?", "Avaliar estrutura e pessoal", "approved", "Foram apresentados modelos de PE. Responsável: William Almagro (base OCP) + plantonista"),
        item("pll-4.1g", "4.1 g", "Mantém suporte onshore dedicado ao planejamento das operações?", "Formalização do suporte onshore", "approved", "Responsável: William Almagro"),
        item("pll-4.1l.nota1", "4.1 l.nota1", "Possui procedimento de peação do ROV com indicação de elementos e pontos de fixação?", "Avaliação documental", "approved"),
        item("pll-4.1l.nota2", "4.1 l.nota2", "Apresentou estudo de peação do ROV aprovado por sociedade classificadora?", "Avaliação documental", "rejected", "", "Falta documento com aprovação da sociedade classificadora"),
        item("pll-4.1n", "4.1 n", "Apresentou catálogo digital com todas as ferramentas disponíveis?", "Avaliação documental", "pending", "", "Evidência apresentada não possui links válidos"),
      ]},
    ]
  },
  {
    id: "pll-4.2", code: "4.2", title: "Registros dos Serviços", icon: FileText, etRef: "ET-PLL-017",
    subsections: [
      { id: "pll-4.2-video", code: "4.2", title: "Vídeo, Relatórios e Dados", items: [
        item("pll-4.2b", "4.2 b", "Possui meios para gravar vídeos 1920x1080, H.264, 30fps, MPEG-4, trechos de 30min?", "Avaliação dos equipamentos a bordo", "approved"),
        item("pll-4.2c", "4.2 c", "Possui infraestrutura de upload via internet em 96h para nuvem Petrobras?", "Teste de transferência", "approved"),
        item("pll-4.2e", "4.2 e", "Possui meios de anexar gráfico A-SCAN e dados brutos de medição de espessura?", "Criação de arquivo teste", "approved"),
        item("pll-4.2f", "4.2 f", "Possui meios de anexar gráfico pressão x torque de ferramentas de torque?", "Criação de arquivo teste", "pending", "", "Aguardando teste subsea para geração de dados brutos"),
      ]},
    ]
  },
  {
    id: "pll-4.3", code: "4.3", title: "Equipes e Qualificações", icon: Users, etRef: "ET-PLL-017",
    subsections: [
      { id: "pll-4.3-cert", code: "4.3", title: "Certificações ABENDI/IMCA", items: [
        item("pll-4.3b.i", "4.3 b.i", "Equipe qualificada na norma ABENDI NA-003 (END subaquático)?", "Referência - sem exigência de certificado", "approved"),
        item("pll-4.3b.ii", "4.3 b.ii", "Equipe qualificada na ABNT NBR 16244 (Inspeção visual subaquática)?", "Certificado ou treinamento aceito temporariamente", "approved"),
        item("pll-4.3b.iii", "4.3 b.iii", "Equipe qualificada na ABNT NBR 16482 (Medição potencial eletroquímico)?", "Certificado ABENDI ou equivalente", "approved"),
        item("pll-4.3b.iv", "4.3 b.iv", "Equipe qualificada na ABNT NBR 16794 (Medição espessura por ultrassom subaquático)?", "Certificado ABENDI ou equivalente", "approved"),
        item("pll-4.3b.v", "4.3 b.v", "Equipe qualificada na ABNT NBR 15549 (Verificação aparelhagem medição espessura)?", "Certificado ABENDI ou equivalente", "approved"),
        item("pll-4.3c", "4.3 c", "Profissionais capacitados conforme IMCA C 004 (Survey) e IMCA C 005 (ROV)?", "Nome e qualificação dos técnicos", "rejected", "", "Falta documentação segundo IMCA C 004 e IMCA C 005"),
        item("pll-4.3e", "4.3 e.nota", "Disponibilizaram Técnico de Segurança para operações a bordo?", "Nome e qualificação do TSeg", "approved"),
      ]},
    ]
  },
  {
    id: "pll-4.4", code: "4.4", title: "Qualidade e Conformidade", icon: Shield, etRef: "ET-PLL-017",
    subsections: [
      { id: "pll-4.4-qual", code: "4.4", title: "Controle de Qualidade", items: [
        item("pll-4.4f", "4.4 f", "Conexões das mangueiras hidráulicas das ferramentas ROV protegidas contra desenroscamento?", "Avaliar conexões", "approved"),
      ]},
    ]
  },
  {
    id: "pll-4.5", code: "4.5", title: "Preparação dos ROVs", icon: Wrench, etRef: "ET-PLL-017",
    subsections: [
      { id: "pll-4.5-prep", code: "4.5", title: "Calibração e Manutenção de Ferramentas", items: [
        item("pll-4.5a", "4.5 a", "Certificados de aferição/calibração em dia: torque analyser, medidor ultrassônico, potencial eletroquímico, multímetros, eletrodos, blocos padrão?", "Apresentação dos certificados", "pending", "", "Falta certificado da Torque Analyser e eletrodo de referência"),
        item("pll-4.5b", "4.5 b", "Rotina de manutenções e testes periódicos em todas as ferramentas evidenciada?", "Plano de manutenção + registros", "approved"),
        item("pll-4.5e", "4.5 e", "Dois conjuntos idênticos de ferramentas para equipar ambos ROVs simultaneamente?", "Avaliação no local", "pending", "", "Faltam: manuseio de válvulas, HFL, hot stab, corte por disco, inspeção de classe/jaquetas, estojos"),
      ]},
    ]
  },
  {
    id: "pll-5.1", code: "5.1", title: "Serviços Submarinos Principais", icon: Anchor, etRef: "ET-PLL-017",
    subsections: [
      { id: "pll-5.1.1", code: "5.1.1", title: "Inspeção Submarina", items: [
        item("pll-5.1.1a", "5.1.1 a", "Dispositivos para inspeção visual, dragagem, limpeza e medição potencial no trecho estático (flowline)?", "Apresentação dispositivo + teste", "pending", "", "Falta teste subsea"),
        item("pll-5.1.1b", "5.1.1 b", "Dispositivos para inspeção visual, dragagem, limpeza e medição no trecho dinâmico (riser)?", "Apresentação dispositivo + teste", "pending", "", "Falta teste subsea"),
        item("pll-5.1.1c", "5.1.1 c", "Dispositivos para inspeção visual do duto até 20m da superfície + limpeza + potencial?", "Apresentação dispositivo + teste", "pending", "", "Falta teste subsea"),
        item("pll-5.1.1c.n1", "5.1.1 c.n1", "Dispositivos de limpeza (jato de cavitação ou alta pressão) no trecho PIDF-3?", "Apresentação dispositivo + teste", "pending", "", "Falta teste subsea"),
        item("pll-5.1.1c.n2a", "5.1.1 c.n2a", "Ferramentas de limpeza/potencial adaptadas para operação a distância (umbilicais 10m)?", "Apresentação dispositivo + teste", "pending", "", "Falta teste subsea"),
        item("pll-5.1.1c.n2b", "5.1.1 c.n2b", "Adaptadores magnéticos/clamp para medição de potencial em conectores riser/riser?", "Apresentação dispositivo + teste", "pending", "", "Falta teste subsea"),
        item("pll-5.1.1h", "5.1.1 h", "Bastão flexível para toque em estojos de conexões flangeadas?", "Apresentação do dispositivo", "approved"),
        item("pll-5.1.1o", "5.1.1 o", "Credenciada por classificadoras para inspeção de classe em unidades marítimas Petrobras?", "Documentação de credenciamento", "approved"),
        item("pll-5.1.1q", "5.1.1 q", "Recursos para intervenção em conexão grayloc 2,5\", 4\" e 6\"?", "Verificação de disponibilidade", "approved"),
        item("pll-5.1.1dddd", "5.1.1 dddd", "Ponteira para remoção de concreto para jateadora de ultrapressão?", "Verificar disponibilidade", "approved"),
        item("pll-5.1.1eeee", "5.1.1 eeee", "Recursos para abertura de janela em revestimentos (super grinder/serra copo) + minicâmera até 30m?", "Apresentação das ferramentas", "rejected", "", "Faltam evidências da serra copo e minicâmera com iluminação"),
        item("pll-5.1.1ffff", "5.1.1 ffff", "Ferramenta de jateamento por cavitação para limpeza de cascos, mancais de turrets?", "Apresentação da ferramenta", "approved"),
      ]},
      { id: "pll-5.1.2", code: "5.1.2", title: "Intervenção Leve e Média", items: [
        item("pll-5.1.2d", "5.1.2 d", "Gancho de içamento e ferramenta de inspeção de geratriz inferior (Ø 90mm-600mm)?", "Apresentação das ferramentas", "pending", "", "Foto da FIGI"),
        item("pll-5.1.2g", "5.1.2 g", "Plano para disponibilizar skids de anodos para recomposição de proteção catódica?", "Apresentação do plano", "approved"),
        item("pll-5.1.2k", "5.1.2 k", "Ferramenta para instalação de cubo cego grayloc?", "Verificação de disponibilidade", "approved"),
        item("pll-5.1.2n", "5.1.2 n.nota", "Capaz de medir classe de limpeza e enquadrar fluido para classe 6 (NAS 1638)?", "Apresentação do método", "pending", "", "Verificar"),
        item("pll-5.1.2r", "5.1.2 r", "Pelo menos 2 cavaletes para posicionamento das extremidades das interligações submarinas?", "Registro fotográfico", "approved"),
      ]},
      { id: "pll-5.1.3", code: "5.1.3", title: "Intervenção Complexa", items: [
        item("pll-5.1.3a", "5.1.3 a", "Plano para calços (mecânico, poitas, grout bag) para eliminação de vãos livres em 90 dias?", "Apresentação do plano", "approved"),
        item("pll-5.1.3d", "5.1.3 d", "Facilidades para bombeio/injeção: diesel, peação, ar comprimido, energia elétrica no convés?", "Verificação no convés", "pending", "", "Passadiço"),
        item("pll-5.1.3f", "5.1.3 f", "Plano para quebra/prevenção de hidratos em equipamentos submarinos?", "Apresentação do plano", "approved"),
      ]},
      { id: "pll-5.1.6", code: "5.1.6", title: "Serviços de Geodésia", items: [
        item("pll-5.1.6", "5.1.6", "Procedimentos e recursos (equipamentos e softwares) para Metrologia?", "Apresentação dos datasheets", "pending", "", "Verificar"),
      ]},
    ]
  },
  {
    id: "pll-5.2", code: "5.2", title: "Equipamentos e Ferramentas Submarinas", icon: Wrench, etRef: "ET-PLL-017",
    subsections: [
      { id: "pll-5.2.1", code: "5.2.1", title: "Inspeção Visual Externa", items: [
        item("pll-5.2.1", "5.2.1", "Dispositivo para inspeção em locais de difícil acesso (geratriz de dutos)?", "Apresentação do dispositivo", "pending", "", "Foto da FIGI"),
      ]},
      { id: "pll-5.2.2", code: "5.2.2", title: "Medição de Potencial Eletroquímico", items: [
        item("pll-5.2.2a", "5.2.2 a", "Dispositivo para medição por contato em estruturas com duas células Ag/AgCl (NBR 16482)?", "Apresentação do dispositivo", "approved"),
        item("pll-5.2.2b", "5.2.2 b", "Dispositivo para medição em conexões riser x riser?", "Teste de medição", "approved"),
        item("pll-5.2.2c", "5.2.2 c", "Dados transmitidos à superfície, visualizados no overlay e armazenados digitalmente?", "Teste de medição", "approved"),
        item("pll-5.2.2d", "5.2.2 d", "Medidor certificado e aferido?", "Apresentação da documentação", "pending", "", "Certificado"),
        item("pll-5.2.2n1", "5.2.2.n1", "Dispositivo para remoção localizada de pintura nos pontos de medição?", "Apresentação do dispositivo", "approved"),
        item("pll-5.2.2n2", "5.2.2.n2", "Hastes de 2m para inserção do medidor em locais de difícil acesso?", "Apresentação do dispositivo", "pending", "", "Foto"),
      ]},
      { id: "pll-5.2.3", code: "5.2.3", title: "Medição de Espessura", items: [
        item("pll-5.2.3a", "5.2.3 a", "Ferramenta de medição de espessura por ultrassom: planas e curvas (Ø≥2\"), pintadas ou não?", "Teste no local", "pending", "", "Teste"),
        item("pll-5.2.3a.n1", "5.2.3 a.n1", "Medição em superfícies aquecidas até temperatura admissível?", "Verificação do datasheet", "approved"),
        item("pll-5.2.3a.n2", "5.2.3 a.n2", "Medição da temperatura da superfície onde será executada a medição?", "Verificação do datasheet", "approved"),
        item("pll-5.2.3c", "5.2.3 c", "Técnicas single-echo, echo-echo e multiple-echoes disponíveis?", "Teste no local", "pending", "", "Teste"),
        item("pll-5.2.3d", "5.2.3 d", "Transdutores de todos os diâmetros e frequências disponíveis comercialmente?", "Verificação do datasheet", "approved"),
        item("pll-5.2.3e", "5.2.3 e.nota", "Suporte magnético para autoposicionar transdutor perpendicularmente?", "Teste no local", "pending", "", "Teste"),
        item("pll-5.2.3f", "5.2.3 f", "Dados transmitidos à superfície com overlay + A-Scan?", "Teste no local", "pending", "", "Teste"),
        item("pll-5.2.3g", "5.2.3 g", "Bloco padrão certificado emerso e submerso?", "Verificação do datasheet", "approved"),
        item("pll-5.2.3k", "5.2.3 k", "Handle fishtail ou T-handle com 3 posições ortogonais?", "Teste no local", "pending", "", "Teste"),
      ]},
      { id: "pll-5.2.4", code: "5.2.4", title: "Manuseio de Válvulas", items: [
        item("pll-5.2.4.1a", "5.2.4.1", "Ferramenta de torque API classes 1-4 com latch?", "Verificação do datasheet", "approved"),
        item("pll-5.2.4.1b", "5.2.4.1", "Ferramenta de torque padrão PETROBRAS (25-2000 lbf.ft)?", "Verificação do datasheet", "approved"),
        item("pll-5.2.4.1c", "5.2.4.1 a", "Operação horário e anti-horário?", "Teste", "pending", "", "Teste"),
        item("pll-5.2.4.1d", "5.2.4.1 b", "Controle remoto com acurácia 1% FE?", "Teste", "pending", "", "Teste"),
        item("pll-5.2.4.1e", "5.2.4.1 c", "Aferição na superfície com equipamento certificado?", "Teste", "pending", "", "Teste"),
        item("pll-5.2.4.1f", "5.2.4.1 d", "Ajuste remoto de torque sem recolhimento do ROV?", "Teste", "pending", "", "Teste"),
        item("pll-5.2.4.1g", "5.2.4.1 e", "Limitação de giro (1/10 volta) para overtorque de override?", "Teste", "pending", "", "Teste"),
        item("pll-5.2.4.1h", "5.2.4.1 f", "Contador de voltas (resolução 36°) digital na superfície?", "Teste", "pending", "", "Teste"),
        item("pll-5.2.4.1i", "5.2.4.1 g", "Controle de velocidade de rotação (ajuste 1 RPM, mín 1 RPM, máx 10 RPM)?", "Teste", "pending", "", "Teste"),
        item("pll-5.2.4.1j", "5.2.4.1 h", "Leitura e registro gráfico de torque (incerteza ≤10%)?", "Teste", "pending", "", "Teste"),
        item("pll-5.2.4.1k", "5.2.4.1 i", "Mudança de interface API/PETROBRAS sem recolhimento?", "Teste", "pending", "", "Teste"),
        item("pll-5.2.4.1l", "5.2.4.1 l", "2 tipos soquetes sextavado PBR (encamisamento 40mm)? Hexagonal + projetado ≤6 lados.", "Teste", "pending", "", "Teste"),
        item("pll-5.2.4.1m", "5.2.4.1 m", "Dureza do soquete ≤27HRC?", "Teste", "pending", "", "Teste"),
        item("pll-5.2.4.2", "5.2.4.2", "Ferramentas de baixo torque (25-130 lbf.ft)?", "Verificação do datasheet", "approved"),
        item("pll-5.2.4.2a", "5.2.4.2 a", "Até 6 torques sem recolhimento?", "Verificação do datasheet", "approved"),
        item("pll-5.2.4.2b", "5.2.4.2 b", "Variação de 10 em 10 lbf.ft?", "Verificação do datasheet", "approved"),
        item("pll-5.2.4.2c", "5.2.4.2 c", "Imprecisão ≤10% (≥50 lbf.ft) ou ≤15% (<50 lbf.ft)?", "Verificação do datasheet", "pending", "", "Datasheet não apresenta informação sobre imprecisão máxima"),
        item("pll-5.2.4.2d", "5.2.4.2 d", "Chave tipo garfo para atuação direta pelo manipulador 7F?", "Verificação do datasheet", "approved"),
        item("pll-5.2.4.3", "5.2.4.3", "Override linear ISO 13628-8 tipo A e B?", "Verificação + teste funcional", "approved", "Será disponibilizado pela Petrobras"),
        item("pll-5.2.4.4a", "5.2.4.4 a", "Válvulas diver assisted override sextavado (múltiplas bitolas) via manipulador com limitação de torque?", "Verificação do datasheet", "rejected", "", "Não apresentado ferramenta para sextavado"),
        item("pll-5.2.4.4b", "5.2.4.4 b", "Override perfil volante via manipulador com limitação de torque?", "Verificação do datasheet", "rejected", "", "Não apresentado ferramenta para volante"),
        item("pll-5.2.4.4c", "5.2.4.4 c", "Ferramenta de torque completa (7 requisitos: horário/anti-horário, 2% FE, aferição, remoto, 25-120 lbf.ft, 120-400 lbf.ft, quebra 1000 lbf.ft)?", "Verificação do datasheet", "approved"),
        item("pll-5.2.4.4d", "5.2.4.4 d", "Braço de reação para diver assisted (0.5m, 1m, 1.5m)?", "Verificação do datasheet", "rejected", "", "Não fornecido braço de reação"),
        item("pll-5.2.4.4e", "5.2.4.4 e", "Haste de extensão (1m, 2m, 3.5m) + minicâmera 480p na extremidade?", "Verificação do datasheet", "rejected", "", "Não fornecida haste de extensão"),
        item("pll-5.2.4.4f", "5.2.4.4 f.i", "Dispositivo de docagem ROV em tubulações 15-50cm (hastes 1m e 2m)?", "Verificação do datasheet", "approved"),
      ]},
      { id: "pll-5.2.5", code: "5.2.5", title: "Manuseio de Flying Leads", items: [
        item("pll-5.2.5", "5.2.5", "Ferramenta para HFL com interface API e base hidraulicamente acionada?", "Teste no convés", "pending", "", "Teste"),
        item("pll-5.2.5a", "5.2.5 a", "Roll mínimo ±15°?", "Teste no convés", "pending", "", "Teste"),
        item("pll-5.2.5b", "5.2.5 b", "Pitch mínimo +60°/-90°?", "Teste no convés", "pending", "", "Teste"),
        item("pll-5.2.5c", "5.2.5 c", "Avanço/retração horizontal 0-300mm (face frontal ROV)?", "Teste no convés", "pending", "", "Teste"),
        item("pll-5.2.5d", "5.2.5 d", "Avanço/retração horizontal 0-300mm (FLOT vs ROV)?", "Teste no convés", "pending", "", "Teste"),
        item("pll-5.2.5e", "5.2.5 e", "Envelope FLOT+TT: largura ≤18\", face HFL-conjunto ≥35mm?", "Avaliação dimensional", "pending", "", "Teste"),
      ]},
      { id: "pll-5.2.6", code: "5.2.6", title: "Atuação Hot Stab", items: [
        item("pll-5.2.6a", "5.2.6 a", "Ferramenta para injeção de fluidos (MEG, etanol) via hot stab API 17H Type 2?", "Avaliação do datasheet", "approved"),
        item("pll-5.2.6b", "5.2.6 b", "Stab cego para tamponar receptáculos?", "Avaliação do datasheet", "approved"),
        item("pll-5.2.6c1", "5.2.6 c", "Sistema de pressurização independente?", "Avaliação do equipamento", "not_verified"),
        item("pll-5.2.6c2", "5.2.6 c.t", "Tanque ≥80L?", "Avaliação do datasheet", "approved"),
        item("pll-5.2.6c3", "5.2.6 c.ab", "Pressurização/retorno independente portas A e B?", "Teste no convés", "pending", "", "Teste"),
        item("pll-5.2.6c4", "5.2.6 c.ret", "Seleção retorno (mar ou tanque)?", "Teste no convés", "pending", "", "Teste"),
        item("pll-5.2.6c5", "5.2.6 c.cil", "Pressurizar uma porta e retorno pela outra (cilindro duplo efeito)?", "Teste no convés", "pending", "", "Teste"),
        item("pll-5.2.6d1", "5.2.6 d", "Sensor digital com registro gráfico (precisão 0,25% FE)?", "Avaliação do datasheet", "approved"),
        item("pll-5.2.6d2", "5.2.6 d.vaz", "Medir vazões ≥25 ml/min?", "Avaliação do datasheet", "approved"),
        item("pll-5.2.6e", "5.2.6 e", "Pressão controlada remotamente (34,5-690 bar)?", "Teste no convés", "pending", "", "Teste"),
        item("pll-5.2.6f", "5.2.6 f", "Vazão ≥4 gpm a 10.000 psi?", "Avaliação do datasheet", "approved"),
        item("pll-5.2.6g", "5.2.6 g", "Receptáculo de teste de estanqueidade no fundo?", "Teste no convés", "pending", "", "Teste"),
        item("pll-5.2.6h", "5.2.6 h", "Alcance em toda área de carga do convés?", "Verificação", "approved"),
      ]},
      { id: "pll-5.2.7", code: "5.2.7", title: "Limpeza", items: [
        item("pll-5.2.7.1", "5.2.7.1", "Escovas rotativas ≥2700 RPM, sem dano às vedações?", "Avaliação datasheet + teste", "approved"),
        item("pll-5.2.7.1b", "5.2.7.1 b", "Escovas nylon, latão, aço inox, aço carbono?", "Avaliação das escovas", "approved"),
        item("pll-5.2.7.1c", "5.2.7.1 c", "Limpeza submersa com 2 tipos de escova sem retornar ao convés?", "Teste", "approved"),
        item("pll-5.2.7.2a", "5.2.7.2", "Escova rotativa para SCPS (vedação luva BAP + anéis VX/VT)?", "Avaliação do datasheet", "approved"),
        item("pll-5.2.7.2b", "5.2.7.2b", "Desacoplar parte luva da parte anel VX?", "Teste no convés", "approved"),
        item("pll-5.2.7.2c", "5.2.7.2c", "Ferramentas para 16¾\" e 18¾\"?", "Avaliação do datasheet", "approved"),
        item("pll-5.2.7.3", "5.2.7.3", "Caviblaster para limpeza até 50m LDA?", "Avaliação + teste", "pending", "", "Teste"),
      ]},
      { id: "pll-5.2.8", code: "5.2.8", title: "Manuseio de Estojos, Porcas e Flanges", items: [
        item("pll-5.2.8a", "5.2.8 a", "Ferramentas para parafusos/porcas de 1\" a 2\" e respectivas porcas?", "Verificação datasheet", "approved"),
        item("pll-5.2.8b", "5.2.8 b", "Posicionar, instalar e retirar estojos nos furos de conexões flangeadas?", "Verificação dos dispositivos", "approved"),
        item("pll-5.2.8c", "5.2.8 c", "Instalar/retirar porcas com dispositivos vazados e estriados + fixação magnética?", "Verificação datasheet", "approved"),
        item("pll-5.2.8d", "5.2.8 d", "Chaves de impacto estriadas e magnéticas para travar porcas?", "Verificação dos dispositivos", "approved"),
        item("pll-5.2.8e1", "5.2.8 e", "Torqueamento com mecanismo contínuo/intermitente, interfaces vazadas?", "Verificação dos dispositivos", "approved"),
        item("pll-5.2.8e2", "5.2.8 e.tab", "Ferramentas por faixa de torque e bitolas conforme tabela?", "Verificação datasheet", "rejected", "", "Faltam evidências das bitolas"),
        item("pll-5.2.8f", "5.2.8 f", "Ferramentas compactas para flanges API/ASME (folga 0,5mm)?", "Análise dimensional", "approved"),
        item("pll-5.2.8g", "5.2.8 g", "Ferramentas para serviços especiais com dificuldade de acesso?", "Verificação dos dispositivos", "pending", "", "Pendente Envio"),
        item("pll-5.2.8h", "5.2.8 h", "Solução de interferência proposital estojo/flange cego?", "Verificação dos dispositivos", "not_verified"),
        item("pll-5.2.8i", "5.2.8 i", "Suportes para elevação de dutos (poitas/cavaletes)?", "Verificação dos dispositivos", "approved"),
      ]},
      { id: "pll-5.2.9", code: "5.2.9", title: "Movimentação de Cargas Submarinas", items: [
        item("pll-5.2.9.1", "5.2.9.1", "Meios de lançamento, recolhimento e movimentação no convés/água/leito?", "Teste no local", "pending", "", "Passadiço"),
        item("pll-5.2.9.1a", "5.2.9.1 a", "Carga líquida conforme tabela a 3000m LDA?", "Teste no local", "pending", "", "Passadiço"),
        item("pll-5.2.9.1a.n1", "5.2.9.1 a.n1", "Curvas do equipamento para profundidades <3000m?", "Avaliação datasheet", "pending", "", "Passadiço"),
        item("pll-5.2.9.1a.n4", "5.2.9.1 a.n4", "Componentes com capacidades compatíveis?", "Avaliação datasheet", "pending", "", "Passadiço"),
        item("pll-5.2.9.1c", "5.2.9.1 c", "Velocidade média descida/subida >30m/min?", "Teste no local", "pending", "", "Passadiço"),
        item("pll-5.2.9.1d", "5.2.9.1 d", "Sistema AHC (Active Heave Compensation)?", "Avaliação datasheet", "pending", "", "Passadiço"),
        item("pll-5.2.9.1d.n1", "5.2.9.1 d.n1", "AHC: excursão ≤50cm por 2h no envelope?", "Teste no local", "pending", "", "Passadiço"),
        item("pll-5.2.9.2", "5.2.9.2", "Meios para transbordo ship-to-ship no porto?", "Avaliação datasheet", "pending", "", "Passadiço"),
        item("pll-5.2.9.2a", "5.2.9.2 a", "SWL 10ton, raio 20m da borda?", "Avaliação datasheet", "pending", "", "Passadiço"),
        item("pll-5.2.9.5", "5.2.9.5", "Área livre exclusiva (120-500m²) para equipamentos Petrobras?", "Avaliação do desenho", "pending", "", "Passadiço"),
        item("pll-5.2.9.5.n1", "5.2.9.5 n1", "Resistência mínima do piso: 5-10 ton/m²?", "Avaliação datasheet", "pending", "", "Passadiço"),
      ]},
      { id: "pll-5.2.10", code: "5.2.10", title: "Ferramentas de Corte", items: [
        item("pll-5.2.10a", "5.2.10 a", "Corte de cabos de aço até 3\" por guilhotinamento?", "Avaliação datasheet", "approved"),
        item("pll-5.2.10b", "5.2.10 b", "Discos rotativos 7\"-20\", 1800-3000rpm, 2000-3000psi?", "Avaliação + teste", "approved"),
        item("pll-5.2.10c", "5.2.10 c", "Mini grinder OMM50 disco 4\" + proteção para tubings inox?", "Avaliação datasheet", "pending", "", "Pendente proteção do disco"),
        item("pll-5.2.10d", "5.2.10 d", "Corte de dutos flexíveis/rígidos até 24\" por fita diamantada ou disco?", "Avaliação datasheet", "pending", "", "Verificar quantidade de spare"),
        item("pll-5.2.10e", "5.2.10 e", "Fita diamantada ou disco para amarras 70-130mm operadas a distância?", "Teste no local", "pending", "", "Teste"),
      ]},
      { id: "pll-5.2.11", code: "5.2.11", title: "Hidrojateamento e Sucção", items: [
        item("pll-5.2.11.1", "5.2.11.1", "Hidrojateamento de alta pressão (210-350 bar, 15 ℓ/min)?", "Avaliação + teste", "pending", "", "Teste"),
        item("pll-5.2.11.2a", "5.2.11.2 a", "Sucção de sólidos ≥60 ton/h?", "Avaliação datasheet", "approved"),
        item("pll-5.2.11.2b", "5.2.11.2 b", "Linhas hidráulicas operam na potência máxima?", "Teste (flowmeter + manômetro)", "pending", "", "Teste"),
        item("pll-5.2.11.2c", "5.2.11.2 c", "Desagregação + descompactação do solo?", "Teste no local", "pending", "", "Teste"),
        item("pll-5.2.11.2d", "5.2.11.2 d", "Sem necessidade de skids ou potência extra além do ROV?", "Teste no local", "pending", "", "Teste"),
      ]},
      { id: "pll-5.2.12", code: "5.2.12", title: "Detecção e Coleta de Hidrocarbonetos", items: [
        item("pll-5.2.12.1", "5.2.12.1", "Ferramenta para detectar HC, fluoresceína e HW na água do mar?", "Verificação datasheet", "approved"),
        item("pll-5.2.12.2", "5.2.12.2", "Detecção de gás na superfície?", "Verificação datasheet", "approved"),
        item("pll-5.2.12.3", "5.2.12.3", "Recipiente estanque (≥1L) para coleta de amostras?", "Verificação dos dispositivos", "approved"),
        item("pll-5.2.12.4a", "5.2.12.4 a", "Sistema campânula (0,6m³) + shuttle tank (3m³) + bomba + mangueiras?", "Verificação datasheet", "approved"),
        item("pll-5.2.12.4b", "5.2.12.4 b", "Sistema hot stab para injetar inibidor na campânula/shuttle tank?", "Montagem no convés", "pending", "", "Ferramenta não apresentada"),
        item("pll-5.2.12.4e", "5.2.12.4 e", "Tanque ≥5m³ para armazenamento do fluido coletado?", "Verificação dos dispositivos", "approved"),
        item("pll-5.2.12.4i", "5.2.12.4 i", "Licenças para manuseio e transporte de fluidos?", "Verificação documentação", "pending", "", "Passadiço"),
      ]},
      { id: "pll-5.2.14", code: "5.2.14", title: "Jateamento de Ultrapressão", items: [
        item("pll-5.2.14a", "5.2.14", "Sistema 500-11000 psi, vazão ≥27 L/min?", "Teste no local", "pending", "", "Teste"),
        item("pll-5.2.14b", "5.2.14.b", "Ultrapressão + dragagem simultânea?", "Teste no local", "pending", "", "Teste"),
      ]},
      { id: "pll-5.2.15", code: "5.2.15", title: "Quebra/Prevenção de Hidratos", items: [
        item("pll-5.2.15a", "5.2.15 a", "Bomba duplex para quebra de hidrato (10.000psi, 3-8gpm admissão)?", "Verificação procedimento", "pending", "", "Fotos"),
      ]},
      { id: "pll-5.2.16", code: "5.2.16", title: "Usinagem, Soldagem e Calderaria", items: [
        item("pll-5.2.16a", "5.2.16 a", "Oficina para usinagem, soldagem e caldeiraria?", "Verificação no local", "pending", "", "Passadiço"),
        item("pll-5.2.16a.i", "5.2.16 a.i", "Furadeira de coluna?", "Verificação", "pending", "", "Passadiço"),
        item("pll-5.2.16a.ii", "5.2.16 a.ii", "Torno mecânico?", "Verificação", "pending", "", "Passadiço"),
        item("pll-5.2.16a.iii", "5.2.16 a.iii", "Solda oxiacetilênica e oxicorte?", "Verificação", "pending", "", "Passadiço"),
        item("pll-5.2.16a.iv", "5.2.16 a.iv", "Soldagem elétrica?", "Verificação", "pending", "", "Passadiço"),
        item("pll-5.2.16c", "5.2.16 c", "Profissionais habilitados para operar equipamentos?", "Verificação", "pending", "", "Passadiço"),
        item("pll-5.2.16d", "5.2.16 d", "Materiais consumíveis em estoque (barras, chapas, eletrodos, tarugos)?", "Verificação", "pending", "", "Passadiço"),
      ]},
      { id: "pll-5.2.17", code: "5.2.17", title: "Apoio a Geodésia", items: [
        item("pll-5.2.17a", "5.2.17 a", "Posicionamento submarino (hidroacústico + inercial)?", "Verificação procedimento", "pending", "", "Passadiço"),
        item("pll-5.2.17b", "5.2.17 b", "Levantamento visual/sonográfico para impactos ambientais?", "Verificação", "pending", "", "Passadiço"),
        item("pll-5.2.17c", "5.2.17 c", "Sonar alta resolução / ecobatímetro multifeixe?", "Verificação", "pending", "", "Passadiço"),
      ]},
    ]
  },
  // --- Seções finais ET-PLL-017 (Embarcação, Habitabilidade, etc.) ---
  {
    id: "pll-6", code: "6", title: "Embarcação (DP, Propulsão, Navegação)", icon: Ship, etRef: "ET-PLL-017",
    subsections: [
      { id: "pll-6.dp", code: "6", title: "Sistema DP e Propulsão", items: [
        item("pll-6.dp.class", "6.1", "Embarcação com classe DP-2 ou superior válida?", "Verificação de certificado", "approved"),
        item("pll-6.nav", "6.2", "Sistemas de navegação (ECDIS, radar, AIS) operacionais e calibrados?", "Verificação no passadiço", "approved"),
        item("pll-6.prop", "6.3", "Redundância de propulsão e geração conforme classe DP?", "Verificação técnica", "approved"),
      ]},
    ]
  },
  {
    id: "pll-7", code: "7", title: "Habitabilidade", icon: Home, etRef: "ET-PLL-017",
    subsections: [
      { id: "pll-7.2", code: "7.2", title: "Climatização", items: [
        item("pll-7.2.1", "7.2.1", "Ar condicionado ABNT NBR 16401 em todos os ambientes?", "Avaliação temperatura/umidade", "rejected", "", "Não temos termo-higrômetros, pedido emergencial 918332", "2026-02-19"),
        item("pll-7.2.2", "7.2.2", "Equipamento calibrado para comprovação dos parâmetros?", "Avaliação no local", "rejected", "", "Pedido emergencial 918332", "2026-02-19"),
      ]},
      { id: "pll-7.4", code: "7.4", title: "Camarotes da Fiscalização", items: [
        item("pll-7.4.1", "7.4.1", "Dois camarotes individuais com banheiros privativos?", "Avaliação no local", "approved"),
        item("pll-7.4.1a", "7.4.1 a", "Ramal interno para comunicação com todos os setores?", "Avaliação no local", "approved"),
        item("pll-7.4.1b", "7.4.1 b", "TV com reprodução de TV via satélite?", "Avaliação no local", "approved"),
        item("pll-7.4.1c", "7.4.1 c", "Acesso à internet wifi?", "Avaliação no local", "approved"),
        item("pll-7.4.1d", "7.4.1 d", "Dois monitores para câmeras ROV, navegação e CFTV?", "Avaliação no local", "approved"),
      ]},
      { id: "pll-7.5", code: "7.5", title: "Camarotes Técnicos Petrobras", items: [
        item("pll-7.5.1", "7.5.1", "Três camarotes duplos com banheiros privativos?", "Avaliação no local", "approved", "Camarotes 475, 477, 479"),
      ]},
      { id: "pll-7.6", code: "7.6", title: "Escritório da Fiscalização", items: [
        item("pll-7.6.1a", "7.6.1 a", "Facilidades para reuniões de 4 pessoas?", "Avaliação no local", "approved"),
        item("pll-7.6.1b", "7.6.1 b", "6 pontos de rede (3+3)?", "Avaliação no local", "approved"),
        item("pll-7.6.1c", "7.6.1 c", "2 desktops + MS Office + Adobe Acrobat?", "Avaliação no local", "approved"),
        item("pll-7.6.1c.n1", "7.6.1 c.n1", "MS Windows, Office 365, MS Project, Adobe Acrobat Pro?", "Avaliação no local", "rejected", "", "Falta MS Project e Adobe Acrobat Pro", "2026-02-19"),
        item("pll-7.6.1f", "7.6.1 f", "Dois monitores 55\" com divisão 4 imagens ROV/CFTV cada?", "Avaliação no local", "approved"),
        item("pll-7.6.1k", "7.6.1 k", "Dois rádios VHF (fixo + portátil)?", "Avaliação no local", "approved"),
        item("pll-7.6.1l", "7.6.1 l", "Dois rádios UHF portáteis?", "Avaliação no local", "rejected", "", "Será disponibilizado pelo TI", "2026-02-19"),
        item("pll-7.6.1n", "7.6.1 n", "Intercomunicador hands-free Tecpro (passadiço↔escritório↔sala ops↔sala ROV)?", "Avaliação no local", "approved"),
      ]},
      { id: "pll-7.8", code: "7.8", title: "Sala de Operações", items: [
        item("pll-7.8.1a", "7.8.1 a", "Duas cadeiras para suporte técnico e fiscalização?", "Avaliação no local", "approved"),
        item("pll-7.8.1b", "7.8.1 b", "Computador com acesso à rede interna para Técnico de Operações?", "Avaliação no local", "approved"),
      ]},
      { id: "pll-7.10", code: "7.10", title: "Sala de Reunião", items: [
        item("pll-7.10a", "7.10 a", "Mesa de reunião ≥10 lugares?", "Avaliação no local", "approved"),
        item("pll-7.10c", "7.10 c", "2 pontos de rede (contratada + Petrobras)?", "Avaliação no local", "rejected", "", "Somente um ponto OCP", "2026-02-19"),
        item("pll-7.10d", "7.10 d", "TV 50\" mín. com USB + computador?", "Avaliação no local", "approved"),
      ]},
    ]
  },
  {
    id: "pll-8", code: "8", title: "Transferência de Pessoas", icon: Users, etRef: "ET-PLL-017",
    subsections: [
      { id: "pll-8.1", code: "8.1", title: "Cesta, Fundeio e Gangway", items: [
        item("pll-8.1.1", "8.1.1", "Coletes, áreas demarcadas e cestas operacionais e certificados?", "Verificação a bordo", "approved"),
        item("pll-8.1.2", "8.1.2", "Procedimento atende PE-1PBR-00243 e PE-1PBR-00241?", "Verificação do procedimento", "approved"),
      ]},
    ]
  },
  {
    id: "pll-9", code: "9", title: "Autonomia (Combustível, Água)", icon: Fuel, etRef: "ET-PLL-017",
    subsections: [
      { id: "pll-9.1", code: "9.1", title: "Combustível", items: [
        item("pll-9.1.1", "9.1.1", "Autonomia mínima 42 dias sem interrupção?", "Tancagem vs consumo", "approved", "13m³/dia consumo médio"),
        item("pll-9.1.7", "9.1.7", "Bandejas de contenção (≥200L) em cada tomada de combustível?", "Avaliação no local", "approved"),
      ]},
      { id: "pll-9.2", code: "9.2", title: "Água Doce", items: [
        item("pll-9.2.1", "9.2.1", "Planta de dessalinização para autossuficiência parcial?", "Avaliação no local", "approved"),
      ]},
    ]
  },
  {
    id: "pll-13", code: "13", title: "Movimentação de Cargas", icon: Package, etRef: "ET-PLL-017",
    subsections: [
      { id: "pll-13.1", code: "13", title: "Equipamentos de Movimentação", items: [
        item("pll-13.1", "13.1", "Equipamentos conforme escopo contratual?", "Avaliação no local", "approved"),
      ]},
    ]
  },
  {
    id: "pll-14", code: "14", title: "Monitoramento de Imagens (CFTV)", icon: Monitor, etRef: "ET-PLL-017",
    subsections: [
      { id: "pll-14.1", code: "14.1", title: "Câmeras e CFTV", items: [
        item("pll-14.1", "14.1", "Câmeras cobrindo: convés, lançamento ROV, guindastes, passadiço, praça de máquinas?", "Avaliação no local", "rejected", "", "Imagens não disponíveis remotamente via CFTV PB", "2026-02-19"),
        item("pll-14.1h", "14.1 h", "Imagens do sistema DP com resolução mín. 720p?", "Verificação remota", "rejected", "", "Imagens não disponíveis remotamente"),
      ]},
    ]
  },
  {
    id: "pll-17", code: "17", title: "Internet e Telecomunicações", icon: Wifi, etRef: "ET-PLL-017",
    subsections: [
      { id: "pll-17.1", code: "17.1", title: "Rede Petrobras", items: [
        item("pll-17.1.1", "17.1.1", "Internet, voz e dados criptografados conforme ET-0600.00-5510-760-PPT-542?", "Avaliação no local", "approved"),
      ]},
      { id: "pll-17.2", code: "17.2", title: "Rede Contratada (Starlink/LEO)", items: [
        item("pll-17.2.1", "17.2.1", "Link Starlink/LEO segregado da rede Petrobras com cobertura offshore?", "Teste de disponibilidade e velocidade", "approved", "Rede: Parcel do Bandolim - Client"),
      ]},
    ]
  },
];

// ═══════════════════════════════════════════════════════════════
// ET-3000.00-1521-690-PLL-001 — Características do ROV
// ═══════════════════════════════════════════════════════════════
const ET_ROV: Section[] = [
  {
    id: "rov-2", code: "2", title: "Características do ROV", icon: Cpu, etRef: "ET-ROV-001",
    subsections: [
      { id: "rov-2.1", code: "2.1", title: "Características Operacionais Básicas", items: [
        item("rov-2", "2", "ROV workclass com propulsão hidráulica/elétrica/híbrida?", "Verificação datasheet", "approved"),
        item("rov-2.1a", "2.1 a", "Operação 24h/7d sem interrupção em LDA 0-3000m?", "Teste + datasheet", "approved"),
        item("rov-2.1d", "2.1 d", "Empuxo horizontal ≥725 Kgf e vertical ≥450 Kgf?", "Verificação datasheet", "approved"),
        item("rov-2.1e", "2.1 e", "Controle de lançamento por TMS (Top Hat ou Gaiola)?", "Verificação datasheet", "approved"),
      ]},
      { id: "rov-2.2.1", code: "2.2.1", title: "Guincho do ROV e Convés", items: [
        item("rov-2.2.1a", "2.2.1 a", "Guincho com AHC (Active Heave Compensation)?", "Verificação datasheet", "approved"),
        item("rov-2.2.1b", "2.2.1 b", "Controle remoto e local (wireless)?", "Teste no local", "approved"),
        item("rov-2.2.1c", "2.2.1 c", "Velocidade ≥40m/min?", "Teste no local", "pending", "", "Foto"),
        item("rov-2.2.1d", "2.2.1 d", "Freio de emergência fail-safe?", "Verificação datasheet", "approved"),
      ]},
      { id: "rov-2.2.4", code: "2.2.4", title: "TMS (Top Hat ou Gaiola)", items: [
        item("rov-2.2.4a", "2.2.4 a", "Tether ≥250m?", "Verificação datasheet", "approved"),
        item("rov-2.2.4b", "2.2.4 b", "Monitoramento de imagens do tambor do TMS?", "Teste no local", "approved"),
        item("rov-2.2.4c", "2.2.4 c", "Monitoramento de quantidade de tether liberado?", "Teste no local", "pending", "", "Foto"),
      ]},
      { id: "rov-2.2.5", code: "2.2.5", title: "Gravação e Reprodução de Imagens", items: [
        item("rov-2.2.5a", "2.2.5 a", "2 transmissores UHF + CFTV com alcance ≥5000m?", "Teste no local", "pending", "", "Foto"),
        item("rov-2.2.5b", "2.2.5 b", "PC com captura + digitalização HD (AVI/MPEG4)?", "Verificação datasheet", "approved"),
        item("rov-2.2.5c", "2.2.5 c", "3 sistemas gravação HD (1080 linhas) + legendas + 8 vídeos independentes?", "Avaliação no local", "pending", "", "Foto"),
        item("rov-2.2.5d", "2.2.5 d", "Black Box para últimas 2160h de operação?", "Teste de gravação", "pending", "", "Teste"),
        item("rov-2.2.5e", "2.2.5 e", "Overlay: data, hora, aproamento, LDA, UTM, OS?", "Avaliação no local", "approved"),
        item("rov-2.2.5h", "2.2.5 h", "Vídeos HD 1920x1080 30fps MPEG4 H.264/H.265?", "Verificação datasheet", "approved"),
      ]},
    ]
  },
  {
    id: "rov-2.3", code: "2.3", title: "Sensores de Navegação e Telemetria", icon: Compass, etRef: "ET-ROV-001",
    subsections: [
      { id: "rov-2.3-nav", code: "2.3", title: "Profundímetro, DVL, INS, Sonar", items: [
        item("rov-2.3.1a", "2.3.1 a", "Profundímetro Cristal de Quartzo, range 3000m?", "Verificação datasheet", "approved"),
        item("rov-2.3.2", "2.3.2", "Perfilador CTD/SVP integrado ao ROV?", "Teste no local", "pending", "", "Teste"),
        item("rov-2.3.3", "2.3.3", "Guincho + correntômetro até 3000m, precisão 0,05m/s?", "Verificação datasheet", "approved"),
        item("rov-2.3.5", "2.3.5", "DVL (altimetria 0,5-25m, acurácia ±0,2%)?", "Verificação datasheet", "approved"),
        item("rov-2.3.6", "2.3.6", "Sonar de imagem colorida, alcance ≥200m, alvo 300mm/2000mm?", "Teste no local", "pending", "", "Foto"),
        item("rov-2.3.9", "2.3.9", "INS integrado ao controle (station-keeping)?", "Verificação datasheet", "approved"),
        item("rov-2.3.10", "2.3.10", "Precisão: altitude ±30cm, heading ±2°, depth ±30cm, position ±30cm?", "Teste no local", "pending", "", "Foto"),
        item("rov-2.3.11", "2.3.11", "Integrado ao DP para follow-sub?", "Teste no local", "pending", "", "Foto"),
      ]},
    ]
  },
  {
    id: "rov-2.5", code: "2.5", title: "Sistemas de Tele-Presença", icon: Camera, etRef: "ET-ROV-001",
    subsections: [
      { id: "rov-2.5-cam", code: "2.5", title: "Câmeras e Iluminação", items: [
        item("rov-2.5.1", "2.5.1", "8 canais de vídeo simultâneos?", "Avaliação no local", "pending", "", "Foto"),
        item("rov-2.5.2a", "2.5.2 a", "2 sistemas pan & tilt na proa?", "Avaliação no local", "approved"),
        item("rov-2.5.2b", "2.5.2 b", "2 câmeras HD (1080p progressiva, zoom 8:1)?", "Verificação datasheet", "approved"),
        item("rov-2.5.2c", "2.5.2 c", "1 câmera SIT baixa luminosidade (560 linhas)?", "Verificação datasheet", "approved"),
        item("rov-2.5.2d", "2.5.2 d", "2 minicâmeras (480p, LED, haste 2m, espelho 90°, cabo 10m)?", "Verificação datasheet", "approved"),
        item("rov-2.5.3a", "2.5.3 a", "Iluminação proa ≥40.000 lumens, 8 canais?", "Verificação datasheet", "approved"),
        item("rov-2.5.3b", "2.5.3 b", "Iluminação popa ≥7.000 lumens?", "Verificação datasheet", "approved"),
      ]},
    ]
  },
  {
    id: "rov-2.6", code: "2.6", title: "Sistemas de Manipulação", icon: Settings, etRef: "ET-ROV-001",
    subsections: [
      { id: "rov-2.6-manip", code: "2.6", title: "Manipuladores 7 DOF", items: [
        item("rov-2.6", "2.6", "2 manipuladores hidráulicos de 7 DOF?", "Verificação no local", "approved"),
        item("rov-2.6.1a", "2.6.1 a", "Boreste: servo-controlado master/slave?", "Verificação datasheet", "approved"),
        item("rov-2.6.1b", "2.6.1 b", "Boreste: comprimento estendido 1660mm?", "Verificação datasheet", "approved"),
        item("rov-2.6.1c", "2.6.1 c", "Boreste: levantamento estendido 120kg?", "Verificação datasheet", "approved"),
        item("rov-2.6.1d", "2.6.1 d", "Boreste: levantamento máximo 450kg?", "Verificação datasheet", "approved"),
        item("rov-2.6.2a", "2.6.2 a", "Bombordo: solenóide on/off ou proporcional?", "Verificação datasheet", "approved"),
        item("rov-2.6.2g", "2.6.2 g", "Bombordo: garras paralela, 3 dedos, 4 dedos 152mm?", "Verificação datasheet", "pending", "", "Foto"),
      ]},
    ]
  },
  {
    id: "rov-2.7", code: "2.7", title: "Circuito Hidráulico", icon: Gauge, etRef: "ET-ROV-001",
    subsections: [
      { id: "rov-2.7-hyd", code: "2.7", title: "Pressão, Vazão e Válvulas", items: [
        item("rov-2.7.1a", "2.7.1 a", "Pressão 206 bar (3000 psi)?", "Teste com manômetro", "pending", "", "Foto"),
        item("rov-2.7.1b", "2.7.1 b", "Vazão 150 l/min?", "Teste com flow meter", "pending", "", "Foto"),
        item("rov-2.7.1c", "2.7.1 c", "Ajuste remoto de pressão (escala 5 bar)?", "Teste no local", "pending", "", "Foto"),
        item("rov-2.7.1d", "2.7.1 d", "Ajuste local de vazão (escala 3 l/min)?", "Teste no local", "pending", "", "Foto"),
        item("rov-2.7.2", "2.7.2", "10 válvulas 4-vias/3-posições centro fechado/TANDEM?", "Verificação datasheet", "approved"),
        item("rov-2.7.2hf", "2.7.2 hf", "2 válvulas hi-flow (150 l/min @ 3000 psi) independentes?", "Verificação datasheet", "approved"),
      ]},
    ]
  },
  {
    id: "rov-2.9", code: "2.9", title: "Tooling Skid", icon: Box, etRef: "ET-ROV-001",
    subsections: [
      { id: "rov-2.9-ts", code: "2.9", title: "Skid e Gaveta Retrátil", items: [
        item("rov-2.9", "2.9", "Tooling skid para montagem de ferramentas?", "Verificação no local", "approved"),
        item("rov-2.9.1", "2.9.1", "Área para FLOT?", "Verificação no local", "approved"),
        item("rov-2.9.2", "2.9.2", "Receptáculo hot stab retrátil?", "Verificação no local", "pending", "", "Foto"),
        item("rov-2.9.3", "2.9.3", "Gaveta retrátil para 3 conjuntos de ferramentas?", "Teste no convés", "approved"),
      ]},
    ]
  },
  {
    id: "rov-2.10", code: "2.10", title: "Integridade do ROV", icon: Shield, etRef: "ET-ROV-001",
    subsections: [
      { id: "rov-2.10-maint", code: "2.10", title: "Manutenção Preventiva/Preditiva", items: [
        item("rov-2.10.1", "2.10.1", "Planos de manutenção preventiva/preditiva?", "Verificação procedimentos", "pending", "", "Foto TMV2"),
        item("rov-2.10.2a", "2.10.2 a", "Reterminação cabo armado: periodicidade anual?", "Verificação procedimentos", "approved"),
        item("rov-2.10.2b", "2.10.2 b", "Reterminação tether: periodicidade semestral?", "Verificação procedimentos", "approved"),
        item("rov-2.10.2c", "2.10.2 c", "Troca de mangueiras hidráulicas: periodicidade trienal?", "Verificação procedimentos", "approved"),
        item("rov-2.10.2d", "2.10.2 d", "Certificado de teste hidrostático (≤1 ano)?", "Verificação procedimentos", "pending", "", "Certificados"),
        item("rov-2.10.2e", "2.10.2 e", "Sistemática de reaperto periódico?", "Verificação procedimentos", "pending", "", "Foto TMV2"),
        item("rov-2.10.3", "2.10.3", "Procedimentos executivos + equipes treinadas?", "Verificação gestão", "approved"),
      ]},
    ]
  },
];

// ═══════════════════════════════════════════════════════════════
// ET-3000.00-1500-91C-P1J028 — RSV Embarcação (Disposições Gerais)
// ═══════════════════════════════════════════════════════════════
const ET_RSV: Section[] = [
  {
    id: "rsv-1", code: "1", title: "Disposições Gerais da Embarcação", icon: Ship, etRef: "ET-RSV-028",
    subsections: [
      { id: "rsv-1-geral", code: "1", title: "Disposições Gerais", items: [
        item("rsv-1.5", "1.5", "Ambientes e mobiliários atendem NR-17 (ergonomia)?", "Apresentação de laudo", "approved", "Documento anexo"),
        item("rsv-1.6", "1.6", "Casco limpo, livre de incrustações e bio-invasoras + laudo profissional?", "Apresentação de laudo", "approved", "Relatório e certificado anexos"),
      ]},
      { id: "rsv-3", code: "3", title: "Portos e Docagem", items: [
        item("rsv-3.2.4", "3.2.4", "Arranjo permite atracação por bombordo e boreste?", "Avaliação do arranjo", "approved", "Arranjo Geral anexo"),
        item("rsv-3.3.1", "3.3.1", "Dimensões permitem docagem em estaleiros no Brasil?", "Coleta de evidência", "approved", "Foto anexa"),
      ]},
    ]
  },
  {
    id: "rsv-6", code: "6", title: "SMS (Segurança, Meio Ambiente e Saúde)", icon: Shield, etRef: "ET-RSV-028",
    subsections: [
      { id: "rsv-6-sms", code: "6", title: "SMS e Enfermaria", items: [
        item("rsv-6.1", "6.1", "Diques de contenção em todos os pontos de vazamento potencial?", "Avaliação no local", "approved", "Fotos anexas"),
        item("rsv-6.2", "6.2", "Sistema de tratamento de esgoto sanitário?", "Avaliação no local", "approved", "Fotos da ETE + manual"),
        item("rsv-6.5", "6.5", "Caixa para lâmpadas com material tóxico?", "Avaliação no local", "approved", "Foto anexa"),
        item("rsv-6.7", "6.7", "Bancada de teste/aferição para medidores de gás (periodicidade ≤6 meses)?", "Avaliação no local", "approved", "Fotos e documentações"),
        item("rsv-6.8", "6.8", "Técnico de Segurança contínuo a bordo?", "Verificação dos nomes", "approved", "Listas de tripulantes"),
        item("rsv-6.9.1", "6.9.1", "Enfermaria com materiais e equipamentos conforme legislação?", "Avaliação no local", "approved", "Fotos anexas"),
        item("rsv-6.9.2", "6.9.2", "Controle de medicamentos e prazos de validade?", "Avaliação no local", "approved", "Planilha de controle"),
        item("rsv-6.9.3", "6.9.3", "Enfermeiro/técnico com COREN e ≥6 meses offshore?", "Solicitação dos nomes", "approved", "COREN e CIR anexos"),
      ]},
    ]
  },
  {
    id: "rsv-7", code: "7", title: "Ambientes de Trabalho e Acomodações (RSV)", icon: Home, etRef: "ET-RSV-028",
    subsections: [
      { id: "rsv-7.1", code: "7.1", title: "Camarotes e Banheiros", items: [
        item("rsv-7.1.1a", "7.1.1 a", "Camarotes separados por sexo (sem alternância diurna/noturna)?", "Avaliação no local", "approved"),
        item("rsv-7.1.1b", "7.1.1 b", "Camarotes com máximo 4 pessoas?", "Avaliação no local", "approved"),
        item("rsv-7.1.2a", "7.1.2 a", "Banheiros coletivos separados por sexo?", "Avaliação no local", "approved"),
        item("rsv-7.1.2b", "7.1.2 b", "Portas com fechamento interno + abertura emergencial externa?", "Avaliação no local", "approved"),
        item("rsv-7.1.2c", "7.1.2 c", "Banheiros femininos com papel higiênico + coletor de absorvente?", "Avaliação no local", "pending", "", "Falta coletor de absorvente"),
      ]},
      { id: "rsv-7.3", code: "7.3", title: "Ruído Interno", items: [
        item("rsv-7.3.1", "7.3.1", "Limites de ruído conforme IMO CODE ON NOISE LEVELS?", "Avaliação documentação", "rejected", "", "Apresentação do laudo de ruídos"),
      ]},
    ]
  },
];

// ═══════════════════════════════════════════════════════════════
// Exportação consolidada
// ═══════════════════════════════════════════════════════════════
export const ALL_LVS_SECTIONS: Section[] = [...ET_PLL_017, ...ET_ROV, ...ET_RSV];

export const ET_REFERENCES = [
  { id: "ET-PLL-017", label: "ET-3000.00-1500-91C-PLL-017", description: "Serviços ROV (Passadiço)", sections: ET_PLL_017.length },
  { id: "ET-ROV-001", label: "ET-3000.00-1521-690-PLL-001", description: "Características do ROV", sections: ET_ROV.length },
  { id: "ET-RSV-028", label: "ET-3000.00-1500-91C-P1J028", description: "Embarcação RSV (Geral)", sections: ET_RSV.length },
];

export const STATUS_CONFIG: Record<ItemStatus, { label: string; color: string; icon: string }> = {
  approved: { label: "Aprovado", color: "bg-success/20 text-success", icon: "CheckCircle2" },
  pending: { label: "Pendente", color: "bg-warning/20 text-warning", icon: "Clock" },
  rejected: { label: "Rejeitado", color: "bg-destructive/20 text-destructive", icon: "XCircle" },
  not_applicable: { label: "N/A", color: "bg-muted text-muted-foreground", icon: "AlertTriangle" },
  not_verified: { label: "Não Verificado", color: "bg-muted text-muted-foreground", icon: "Eye" },
};

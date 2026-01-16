/**
 * PEO-DP 2026 - Programa de Excelência em Operações DP
 * Baseado no documento oficial Petrobras PEO-DP_03-11-2021
 * Atualizado para 2026 com todas as seções, itens e evidências
 */

import type { PEODPRequirement, PEODPSection } from "@/types/peodp-checklist";

// =============================================
// SEÇÃO 3.2 - GESTÃO (24 itens)
// =============================================
export const PEODP_GESTAO_REQUIREMENTS: PEODPRequirement[] = [
  {
    id: "peodp-3.2.1.1",
    section: "gestao",
    code: "3.2.1.1",
    title: "Gestão de Riscos alinhada com objetivos",
    description: "A empresa CONTRATADA deverá descrever como a Gestão de Riscos está alinhada com os objetivos, estratégias e cultura da sua Organização.",
    reference: "PE-2LEP-00001",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.2.1.2",
    section: "gestao",
    code: "3.2.1.2",
    title: "Gestão de Riscos integrada às atividades",
    description: "A empresa CONTRATADA deverá descrever como a Gestão de Riscos está integrada em todas as atividades da sua Organização.",
    reference: "ISO 31000",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.2.1.3",
    section: "gestao",
    code: "3.2.1.3",
    title: "Segurança como valor principal",
    description: "A empresa CONTRATADA deverá descrever como a segurança das operações de suas embarcações é um dos seus principais valores.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.2.2",
    section: "gestao",
    code: "3.2.2",
    title: "Estudo de riscos das operações",
    description: "A empresa CONTRATADA deverá, sempre que solicitada pela PETROBRAS, entregar uma cópia atualizada do estudo de riscos das operações de suas embarcações.",
    reference: "PE-2LEP-00001",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.2.3",
    section: "gestao",
    code: "3.2.3",
    title: "Plano de Ação aprovado pela direção",
    description: "A empresa CONTRATADA deverá ter o seu Plano de Ação aprovado pela mais alta direção da empresa.",
    mandatory: true,
    weight: 10
  },
  {
    id: "peodp-3.2.4",
    section: "gestao",
    code: "3.2.4",
    title: "Revisão anual do Plano de Ação",
    description: "A empresa CONTRATADA deverá revisar anualmente o seu Plano de Ação para assegurar abrangência de acidentes, incidentes e desvios.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.2.5",
    section: "gestao",
    code: "3.2.5",
    title: "Plano de Ação no Sistema de Gestão Integrado",
    description: "A empresa CONTRATADA deverá entregar à PETROBRAS, quando solicitada, evidência de que o seu Plano de Ação faz parte do seu Sistema de Gestão Integrado.",
    reference: "ISO 9001",
    mandatory: true,
    weight: 7
  },
  {
    id: "peodp-3.2.6",
    section: "gestao",
    code: "3.2.6",
    title: "Melhoria contínua do Plano de Ação",
    description: "A empresa CONTRATADA deverá implantar, implementar e gerir continuamente seu Plano de Ação, considerando as melhores práticas e lições aprendidas.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.2.7",
    section: "gestao",
    code: "3.2.7",
    title: "Fatores Humanos na cultura de segurança",
    description: "A empresa CONTRATADA deverá descrever como aspectos ligados a Fatores Humanos estão integrados à sua cultura de segurança operacional.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.2.8",
    section: "gestao",
    code: "3.2.8",
    title: "Recursos para gestão de riscos",
    description: "A empresa CONTRATADA deverá assegurar que os recursos necessários sejam alocados para gerenciar os riscos tratados no Plano de Ação.",
    mandatory: true,
    weight: 7
  },
  {
    id: "peodp-3.2.9",
    section: "gestao",
    code: "3.2.9",
    title: "Sistema de consequências e reconhecimento",
    description: "A empresa CONTRATADA deverá descrever como será elaborado e atualizado um sistema de consequências para violações e um sistema de reconhecimento pelo desempenho em segurança.",
    mandatory: true,
    weight: 7
  },
  {
    id: "peodp-3.2.10",
    section: "gestao",
    code: "3.2.10",
    title: "Comunicação do Plano de Ação",
    description: "A empresa CONTRATADA deverá descrever como será comunicado o Plano de Ação a toda a força de trabalho envolvida nas operações DP.",
    mandatory: true,
    weight: 7
  },
  {
    id: "peodp-3.2.11",
    section: "gestao",
    code: "3.2.11",
    title: "Matriz de responsabilidades",
    description: "A empresa CONTRATADA deverá elaborar e manter atualizada uma matriz de responsabilidades para todas as funções críticas em operações DP.",
    reference: "IMCA M 117",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.2.12",
    section: "gestao",
    code: "3.2.12",
    title: "Indicadores de desempenho DP",
    description: "A empresa CONTRATADA deverá estabelecer e monitorar indicadores de desempenho específicos para as operações DP de sua frota.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.2.13",
    section: "gestao",
    code: "3.2.13",
    title: "Auditorias internas do sistema DP",
    description: "A empresa CONTRATADA deverá realizar auditorias internas periódicas do sistema de gestão DP, com frequência mínima anual.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.2.14",
    section: "gestao",
    code: "3.2.14",
    title: "Análise crítica mensal de eficiência",
    description: "A empresa CONTRATADA deverá realizar mensalmente uma análise crítica de cada embarcação de sua frota em termos de eficiência operacional.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.2.15",
    section: "gestao",
    code: "3.2.15",
    title: "Gestão de mudanças em operações DP",
    description: "A empresa CONTRATADA deverá implementar um sistema formal de gestão de mudanças para quaisquer alterações que afetem as operações DP.",
    reference: "IMCA M 220",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.2.16",
    section: "gestao",
    code: "3.2.16",
    title: "Política de segurança DP documentada",
    description: "A empresa CONTRATADA deverá manter uma política de segurança DP documentada e aprovada pela alta direção.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.2.17",
    section: "gestao",
    code: "3.2.17",
    title: "Indicador IPCLV",
    description: "Índice de Preenchimento Correto das Listas de Verificação para entrada na Zona de 500 metros da Unidade Marítima - Meta: 100%.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.2.18",
    section: "gestao",
    code: "3.2.18",
    title: "Registro de tempo em modo DP",
    description: "A empresa CONTRATADA deverá manter registro detalhado do tempo de operação em modo DP de cada embarcação.",
    mandatory: true,
    weight: 7
  },
  {
    id: "peodp-3.2.19",
    section: "gestao",
    code: "3.2.19",
    title: "Gestão de alarmes e limites DP",
    description: "A empresa CONTRATADA deverá implementar sistema de gestão de alarmes e limites operacionais DP.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.2.20",
    section: "gestao",
    code: "3.2.20",
    title: "Análise de tendências DP",
    description: "A empresa CONTRATADA deverá realizar análise de tendências de desempenho do sistema DP periodicamente.",
    mandatory: true,
    weight: 7
  },
  {
    id: "peodp-3.2.21",
    section: "gestao",
    code: "3.2.21",
    title: "Relatórios de desempenho DP",
    description: "A empresa CONTRATADA deverá elaborar relatórios mensais de desempenho DP e apresentá-los à PETROBRAS quando solicitado.",
    mandatory: true,
    weight: 7
  },
  {
    id: "peodp-3.2.22",
    section: "gestao",
    code: "3.2.22",
    title: "Programa de verificação de conformidade",
    description: "A empresa CONTRATADA deverá implementar programa de verificação de conformidade com requisitos regulatórios e contratuais.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.2.23",
    section: "gestao",
    code: "3.2.23",
    title: "Registro de Drift off, Drive off e Large Excursion",
    description: "A empresa CONTRATADA deverá preencher o Anexo C e entrega-lo à PETROBRAS até o 8º dia útil do mês corrente para eventos de perda de posição.",
    mandatory: true,
    weight: 10
  },
  {
    id: "peodp-3.2.24",
    section: "gestao",
    code: "3.2.24",
    title: "Company DP Authority nomeado",
    description: "A empresa CONTRATADA deverá nomear formalmente uma pessoa responsável pela implementação e desenvolvimento de treinamentos (Company DP Authority), conforme IMCA M 117.",
    reference: "IMCA M 117",
    mandatory: true,
    weight: 10
  }
];

// =============================================
// SEÇÃO 3.3 - TREINAMENTOS (18 itens)
// =============================================
export const PEODP_TREINAMENTOS_REQUIREMENTS: PEODPRequirement[] = [
  {
    id: "peodp-3.3.1",
    section: "treinamentos",
    code: "3.3.1",
    title: "Levantamento de lacunas em treinamentos",
    description: "A empresa CONTRATADA deverá descrever como será desenvolvido e tratado o levantamento de lacunas em treinamentos da força de trabalho.",
    reference: "IMCA M 117",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.3.2",
    section: "treinamentos",
    code: "3.3.2",
    title: "Treinamentos em Análises de Riscos DP",
    description: "A empresa CONTRATADA deverá descrever como são realizados os treinamentos de toda a força de trabalho nas Análises de Riscos para as operações em modo DP.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.3.3",
    section: "treinamentos",
    code: "3.3.3",
    title: "Treinamentos em Bow-ties",
    description: "A empresa CONTRATADA deverá descrever como são realizados os treinamentos nos bow-ties ou ferramentas equivalentes de toda a força de trabalho.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.3.4",
    section: "treinamentos",
    code: "3.3.4",
    title: "Treinamento para Líderes e força de trabalho",
    description: "A empresa CONTRATADA deverá descrever como será ministrado e mantido o Treinamento para Líderes envolvidos no cumprimento do PEO-DP, incluindo cultura de segurança e Fatores Humanos.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.3.5",
    section: "treinamentos",
    code: "3.3.5",
    title: "Atualização em procedimentos de blackout",
    description: "A empresa CONTRATADA deverá descrever como manterá seus Oficiais das Seções de Convés e de Máquinas atualizados nos procedimentos de recuperação de blackout.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.3.6",
    section: "treinamentos",
    code: "3.3.6",
    title: "Manual do Sistema DP a bordo",
    description: "A empresa CONTRATADA deverá manter disponível, a bordo de cada embarcação de sua frota, uma cópia do Manual do Sistema DP.",
    mandatory: true,
    weight: 7
  },
  {
    id: "peodp-3.3.7",
    section: "treinamentos",
    code: "3.3.7",
    title: "Familiarização de oficiais em DP",
    description: "A empresa CONTRATADA deverá descrever no seu Plano de Ação como, onde e quando será realizada a familiarização do Oficial de Náutica e do Oficial de Máquinas nos sistemas DP.",
    reference: "STCW",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.3.8",
    section: "treinamentos",
    code: "3.3.8",
    title: "Avaliação de desempenho dos oficiais",
    description: "A empresa CONTRATADA deverá descrever como avaliará o desempenho de seus Oficiais de Náutica e Máquinas na operação dos sistemas DP.",
    mandatory: true,
    weight: 7
  },
  {
    id: "peodp-3.3.9",
    section: "treinamentos",
    code: "3.3.9",
    title: "Programa de DPO (DP Operator)",
    description: "A empresa CONTRATADA deverá manter programa de qualificação e certificação de DPOs conforme IMCA C 002.",
    reference: "IMCA C 002",
    mandatory: true,
    weight: 10
  },
  {
    id: "peodp-3.3.10",
    section: "treinamentos",
    code: "3.3.10",
    title: "Treinamento em simulador DP",
    description: "A empresa CONTRATADA deverá assegurar que todos os DPOs realizem treinamento periódico em simulador DP certificado.",
    reference: "IMCA M 117",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.3.11",
    section: "treinamentos",
    code: "3.3.11",
    title: "Treinamento específico por tipo de embarcação",
    description: "A empresa CONTRATADA deverá assegurar treinamento específico para cada tipo de embarcação DP de sua frota.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.3.12",
    section: "treinamentos",
    code: "3.3.12",
    title: "Treinamento em FMEA",
    description: "A empresa CONTRATADA deverá assegurar que todos os DPOs e oficiais recebam treinamento no FMEA específico de cada embarcação.",
    reference: "IMCA M 166",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.3.13",
    section: "treinamentos",
    code: "3.3.13",
    title: "Treinamento em ASOG",
    description: "A empresa CONTRATADA deverá assegurar treinamento em Activity Specific Operating Guidelines (ASOG) para toda tripulação DP.",
    reference: "IMCA M 220",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.3.14",
    section: "treinamentos",
    code: "3.3.14",
    title: "Programa de reciclagem periódica",
    description: "A empresa CONTRATADA deverá manter programa de reciclagem periódica para todos os profissionais envolvidos em operações DP.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.3.15",
    section: "treinamentos",
    code: "3.3.15",
    title: "Registro de horas de DP por profissional",
    description: "A empresa CONTRATADA deverá manter registro individualizado de horas de operação DP de cada profissional.",
    mandatory: true,
    weight: 7
  },
  {
    id: "peodp-3.3.16",
    section: "treinamentos",
    code: "3.3.16",
    title: "Avaliação prática de competência DP",
    description: "A empresa CONTRATADA deverá realizar avaliação prática de competência DP periodicamente para todos os DPOs.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.3.17",
    section: "treinamentos",
    code: "3.3.17",
    title: "Treinamento em comunicação bridge-team",
    description: "A empresa CONTRATADA deverá assegurar treinamento em comunicação efetiva entre os membros da equipe de passadiço.",
    mandatory: true,
    weight: 7
  },
  {
    id: "peodp-3.3.18",
    section: "treinamentos",
    code: "3.3.18",
    title: "Documentação de treinamentos",
    description: "A empresa CONTRATADA deverá manter documentação completa de todos os treinamentos DP realizados, disponível para verificação.",
    mandatory: true,
    weight: 7
  }
];

// =============================================
// SEÇÃO 3.4 - PROCEDIMENTOS (20 itens)
// =============================================
export const PEODP_PROCEDIMENTOS_REQUIREMENTS: PEODPRequirement[] = [
  {
    id: "peodp-3.4.1",
    section: "procedimentos",
    code: "3.4.1",
    title: "Procedimento de análise de desvios e incidentes",
    description: "A empresa CONTRATADA deverá elaborar e manter atualizado procedimento que contemple a análise e tratamento de desvios, incidentes e acidentes com a devida abrangência.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.4.2",
    section: "procedimentos",
    code: "3.4.2",
    title: "Elaboração de bow-ties por tipo de embarcação",
    description: "A empresa CONTRATADA deverá descrever como se dará a elaboração e a atualização constante dos bow-tie ou ferramentas equivalentes, específicos para cada tipo de projeto de embarcação DP.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.4.3",
    section: "procedimentos",
    code: "3.4.3",
    title: "Conhecimento de riscos em Turret e NT Ancorados",
    description: "A empresa CONTRATADA deverá manter nos seus procedimentos operacionais a necessidade de reforçar o conhecimento sobre os riscos das operações em unidades do tipo Turret e NT Ancorados.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.4.4",
    section: "procedimentos",
    code: "3.4.4",
    title: "Manual de Operações com configuração de referências DP",
    description: "A empresa CONTRATADA deverá assegurar que o Manual de Operações de cada embarcação especifique a melhor configuração dos sistemas de referências em modo DP.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.4.5",
    section: "procedimentos",
    code: "3.4.5",
    title: "Relative Heading Control em Turret/NT",
    description: "A empresa CONTRATADA deverá incluir no Manual de Operações a orientação para habilitar a função Relative Heading Control sempre que operar com unidades Turret e NT Ancorados.",
    mandatory: true,
    weight: 7
  },
  {
    id: "peodp-3.4.6",
    section: "procedimentos",
    code: "3.4.6",
    title: "Lista de verificação pré-operacional completa",
    description: "A empresa CONTRATADA deverá assegurar que todos os testes previstos na lista de verificação pré-operacional sejam realizados e que estabeleça a correta configuração do sistema DP.",
    mandatory: true,
    weight: 10
  },
  {
    id: "peodp-3.4.7",
    section: "procedimentos",
    code: "3.4.7",
    title: "Procedimentos de emergência DP",
    description: "A empresa CONTRATADA deverá manter procedimentos de emergência específicos para situações críticas em modo DP.",
    mandatory: true,
    weight: 10
  },
  {
    id: "peodp-3.4.8",
    section: "procedimentos",
    code: "3.4.8",
    title: "Procedimento de CAM (Critical Activity Mode)",
    description: "A empresa CONTRATADA deverá manter procedimento específico para entrada e operação em CAM.",
    reference: "IMCA M 220",
    mandatory: true,
    weight: 10
  },
  {
    id: "peodp-3.4.9",
    section: "procedimentos",
    code: "3.4.9",
    title: "Procedimento de handover de watch",
    description: "A empresa CONTRATADA deverá manter procedimento formal de passagem de serviço (handover) entre DPOs.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.4.10",
    section: "procedimentos",
    code: "3.4.10",
    title: "Procedimento de comunicação com unidade",
    description: "A empresa CONTRATADA deverá manter procedimento de comunicação com a unidade marítima durante operações em proximidade.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.4.11",
    section: "procedimentos",
    code: "3.4.11",
    title: "Procedimento de aproximação e afastamento",
    description: "A empresa CONTRATADA deverá manter procedimento detalhado para aproximação e afastamento de unidades marítimas.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.4.12",
    section: "procedimentos",
    code: "3.4.12",
    title: "Procedimento de operação em condições adversas",
    description: "A empresa CONTRATADA deverá manter procedimento para operação DP em condições meteorológicas e oceanográficas adversas.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.4.13",
    section: "procedimentos",
    code: "3.4.13",
    title: "Procedimento de resposta a perda de posição",
    description: "A empresa CONTRATADA deverá manter procedimento de resposta imediata a eventos de perda de posição.",
    mandatory: true,
    weight: 10
  },
  {
    id: "peodp-3.4.14",
    section: "procedimentos",
    code: "3.4.14",
    title: "Procedimento de monitoramento de consumo de combustível",
    description: "A empresa CONTRATADA deverá manter procedimento de monitoramento de consumo de combustível durante operações DP.",
    mandatory: true,
    weight: 7
  },
  {
    id: "peodp-3.4.15",
    section: "procedimentos",
    code: "3.4.15",
    title: "Procedimento de teste diário de DP",
    description: "A empresa CONTRATADA deverá manter procedimento para realização de testes diários do sistema DP.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.4.16",
    section: "procedimentos",
    code: "3.4.16",
    title: "Procedimento de registro em logbook",
    description: "A empresa CONTRATADA deverá manter procedimento detalhado para registro de eventos no DP logbook.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.4.17",
    section: "procedimentos",
    code: "3.4.17",
    title: "Procedimento de operação com múltiplas referências",
    description: "A empresa CONTRATADA deverá manter procedimento para seleção e uso de múltiplas referências de posição.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.4.18",
    section: "procedimentos",
    code: "3.4.18",
    title: "Procedimento de operação com sensores degradados",
    description: "A empresa CONTRATADA deverá manter procedimento para operação quando sensores de referência apresentarem degradação.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.4.19",
    section: "procedimentos",
    code: "3.4.19",
    title: "Procedimento de verificação pós-manutenção",
    description: "A empresa CONTRATADA deverá manter procedimento de verificação do sistema DP após qualquer manutenção.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.4.20",
    section: "procedimentos",
    code: "3.4.20",
    title: "Controle de revisões de procedimentos",
    description: "A empresa CONTRATADA deverá manter sistema de controle de revisões de todos os procedimentos DP.",
    mandatory: true,
    weight: 7
  }
];

// =============================================
// SEÇÃO 3.5 - OPERAÇÃO (22 itens)
// =============================================
export const PEODP_OPERACAO_REQUIREMENTS: PEODPRequirement[] = [
  {
    id: "peodp-3.5.1",
    section: "operacao",
    code: "3.5.1",
    title: "Identificação de problemas no sistema de energia",
    description: "A empresa CONTRATADA deverá descrever como se dará a identificação e o tratamento de eventuais problemas referentes ao sistema de geração, controle e distribuição de energia.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.5.2",
    section: "operacao",
    code: "3.5.2",
    title: "Atendimento às normas IMO, IMCA, OCIMF, MTS",
    description: "A empresa CONTRATADA deverá atender as Normas da Autoridade Marítima, regras da Sociedade Classificadora, padrões da PETROBRAS e recomendações aplicáveis.",
    reference: "IMO, IMCA, OCIMF, MTS",
    mandatory: true,
    weight: 10
  },
  {
    id: "peodp-3.5.3",
    section: "operacao",
    code: "3.5.3",
    title: "Lista de verificação pré-operacional no CCM",
    description: "A empresa CONTRATADA deverá assegurar que será mantida nos CCM das embarcações uma cópia da lista de verificação pré-operacional, com base na configuração testada do FMEA.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.5.4",
    section: "operacao",
    code: "3.5.4",
    title: "FMEA atualizado a bordo",
    description: "A empresa CONTRATADA deverá manter o FMEA atualizado e a bordo das embarcações e garantir que seja do total conhecimento dos Oficiais.",
    reference: "IMCA M 166",
    mandatory: true,
    weight: 10
  },
  {
    id: "peodp-3.5.5",
    section: "operacao",
    code: "3.5.5",
    title: "Referência UTC para sincronização",
    description: "A empresa CONTRATADA deverá assegurar no seu Plano de Ação a utilização da referência UTC para sincronização dos diferentes controladores.",
    mandatory: true,
    weight: 7
  },
  {
    id: "peodp-3.5.6",
    section: "operacao",
    code: "3.5.6",
    title: "Exercícios de recuperação de blackout semestrais",
    description: "A empresa CONTRATADA deverá fazer constar que exercícios simulados de recuperação de blackout (total e parcial) serão realizados a cada 6 meses.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.5.7",
    section: "operacao",
    code: "3.5.7",
    title: "Configuração DP conforme FMEA e ASOG",
    description: "A empresa CONTRATADA deverá fazer constar que será mantida a configuração do sistema DP conforme o FMEA e ASOG da embarcação durante toda a operação.",
    mandatory: true,
    weight: 10
  },
  {
    id: "peodp-3.5.8",
    section: "operacao",
    code: "3.5.8",
    title: "Monitoramento contínuo do sistema DP",
    description: "A empresa CONTRATADA deverá assegurar monitoramento contínuo de todos os parâmetros críticos do sistema DP durante operações.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.5.9",
    section: "operacao",
    code: "3.5.9",
    title: "Gestão de capacidade de propulsão",
    description: "A empresa CONTRATADA deverá manter gestão da capacidade de propulsão disponível versus requerida durante operações DP.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.5.10",
    section: "operacao",
    code: "3.5.10",
    title: "Verificação de redundância antes de CAM",
    description: "A empresa CONTRATADA deverá assegurar verificação completa de redundância antes de entrada em modo CAM.",
    mandatory: true,
    weight: 10
  },
  {
    id: "peodp-3.5.11",
    section: "operacao",
    code: "3.5.11",
    title: "Operação com mínimo 3 referências de posição",
    description: "A empresa CONTRATADA deverá assegurar operação com no mínimo 3 referências de posição independentes durante operações críticas.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.5.12",
    section: "operacao",
    code: "3.5.12",
    title: "Verificação de footprint e excursão",
    description: "A empresa CONTRATADA deverá verificar e documentar footprint e limites de excursão antes de cada operação.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.5.13",
    section: "operacao",
    code: "3.5.13",
    title: "Comunicação com ROV/mergulho",
    description: "A empresa CONTRATADA deverá manter comunicação efetiva com operações de ROV e mergulho quando aplicável.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.5.14",
    section: "operacao",
    code: "3.5.14",
    title: "Monitoramento meteorológico e oceanográfico",
    description: "A empresa CONTRATADA deverá manter monitoramento contínuo de condições meteorológicas e oceanográficas.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.5.15",
    section: "operacao",
    code: "3.5.15",
    title: "Plano de contingência por perda de posição",
    description: "A empresa CONTRATADA deverá manter plano de contingência ativo para cenários de perda de posição.",
    mandatory: true,
    weight: 10
  },
  {
    id: "peodp-3.5.16",
    section: "operacao",
    code: "3.5.16",
    title: "Operação em zonas de exclusão definidas",
    description: "A empresa CONTRATADA deverá operar respeitando zonas de exclusão definidas pela unidade marítima.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.5.17",
    section: "operacao",
    code: "3.5.17",
    title: "Gestão de alarmes em tempo real",
    description: "A empresa CONTRATADA deverá manter sistema de gestão e resposta a alarmes DP em tempo real.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.5.18",
    section: "operacao",
    code: "3.5.18",
    title: "Registro de eventos operacionais",
    description: "A empresa CONTRATADA deverá manter registro detalhado de todos os eventos operacionais relevantes.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.5.19",
    section: "operacao",
    code: "3.5.19",
    title: "Briefing pré-operacional obrigatório",
    description: "A empresa CONTRATADA deverá realizar briefing pré-operacional obrigatório antes de cada operação DP.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.5.20",
    section: "operacao",
    code: "3.5.20",
    title: "Debriefing pós-operacional",
    description: "A empresa CONTRATADA deverá realizar debriefing pós-operacional após cada operação significativa.",
    mandatory: true,
    weight: 7
  },
  {
    id: "peodp-3.5.21",
    section: "operacao",
    code: "3.5.21",
    title: "Controle de tráfego na zona de 500m",
    description: "A empresa CONTRATADA deverá participar ativamente do controle de tráfego marítimo na zona de 500 metros.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.5.22",
    section: "operacao",
    code: "3.5.22",
    title: "Operação com classe DP adequada",
    description: "A empresa CONTRATADA deverá assegurar que a classe DP da embarcação seja adequada para cada tipo de operação.",
    mandatory: true,
    weight: 10
  }
];

// =============================================
// SEÇÃO 3.6 - MANUTENÇÃO (16 itens)
// =============================================
export const PEODP_MANUTENCAO_REQUIREMENTS: PEODPRequirement[] = [
  {
    id: "peodp-3.6.1",
    section: "manutencao",
    code: "3.6.1",
    title: "Plano de Manutenção anual aprovado",
    description: "A empresa CONTRATADA deverá assegurar a existência de um Plano de Manutenção anual para sistemas e equipamentos críticos, aprovado pela alta direção.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.6.2",
    section: "manutencao",
    code: "3.6.2",
    title: "Cópia atualizada do Plano de Manutenção",
    description: "A empresa CONTRATADA deverá, sempre que for solicitada pela PETROBRAS, entregar uma cópia atualizada do Plano de Manutenção.",
    mandatory: true,
    weight: 7
  },
  {
    id: "peodp-3.6.3",
    section: "manutencao",
    code: "3.6.3",
    title: "Softwares e hardwares do Sistema DP atualizados",
    description: "A empresa CONTRATADA deverá assegurar que os softwares e hardwares do Sistema DP de cada embarcação encontram-se atualizados, com controle de vida útil.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.6.4",
    section: "manutencao",
    code: "3.6.4",
    title: "Planos de Manutenção de sistemas críticos",
    description: "A empresa CONTRATADA deverá ter os Planos de Manutenção de sistemas e equipamentos críticos das embarcações de sua frota.",
    reference: "Anexo G",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.6.5",
    section: "manutencao",
    code: "3.6.5",
    title: "Manutenção preventiva dos propulsores",
    description: "A empresa CONTRATADA deverá manter programa de manutenção preventiva para todos os propulsores.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.6.6",
    section: "manutencao",
    code: "3.6.6",
    title: "Manutenção de sistemas de referência de posição",
    description: "A empresa CONTRATADA deverá manter programa de manutenção específico para sistemas de referência de posição (DGPS, Fanbeam, Tautwire, etc.).",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.6.7",
    section: "manutencao",
    code: "3.6.7",
    title: "Manutenção de sensores de heading",
    description: "A empresa CONTRATADA deverá manter programa de manutenção para sensores de heading (girocompasso, MRU, etc.).",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.6.8",
    section: "manutencao",
    code: "3.6.8",
    title: "Manutenção do sistema de geração de energia",
    description: "A empresa CONTRATADA deverá manter programa de manutenção para o sistema de geração e distribuição de energia.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.6.9",
    section: "manutencao",
    code: "3.6.9",
    title: "Manutenção do sistema UPS",
    description: "A empresa CONTRATADA deverá manter programa de manutenção para sistemas UPS do sistema DP.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.6.10",
    section: "manutencao",
    code: "3.6.10",
    title: "Controle de sobressalentes críticos",
    description: "A empresa CONTRATADA deverá manter controle e estoque adequado de sobressalentes críticos para o sistema DP.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.6.11",
    section: "manutencao",
    code: "3.6.11",
    title: "Registro de manutenções realizadas",
    description: "A empresa CONTRATADA deverá manter registro detalhado de todas as manutenções realizadas no sistema DP.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.6.12",
    section: "manutencao",
    code: "3.6.12",
    title: "Programa de calibração de sensores",
    description: "A empresa CONTRATADA deverá manter programa de calibração periódica de todos os sensores do sistema DP.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.6.13",
    section: "manutencao",
    code: "3.6.13",
    title: "Manutenção preditiva baseada em condição",
    description: "A empresa CONTRATADA deverá implementar programa de manutenção preditiva baseada em condição para equipamentos críticos.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.6.14",
    section: "manutencao",
    code: "3.6.14",
    title: "Gestão de obsolescência de componentes",
    description: "A empresa CONTRATADA deverá manter programa de gestão de obsolescência de componentes do sistema DP.",
    mandatory: true,
    weight: 7
  },
  {
    id: "peodp-3.6.15",
    section: "manutencao",
    code: "3.6.15",
    title: "Suporte técnico do fabricante DP",
    description: "A empresa CONTRATADA deverá manter contrato de suporte técnico ativo com o fabricante do sistema DP.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.6.16",
    section: "manutencao",
    code: "3.6.16",
    title: "Backup de configurações do sistema DP",
    description: "A empresa CONTRATADA deverá manter backup atualizado de todas as configurações do sistema DP.",
    mandatory: true,
    weight: 8
  }
];

// =============================================
// SEÇÃO 3.7 - TESTES ANUAIS DP (14 itens)
// =============================================
export const PEODP_TESTES_ANUAIS_REQUIREMENTS: PEODPRequirement[] = [
  {
    id: "peodp-3.7.1",
    section: "testes_anuais",
    code: "3.7.1",
    title: "DP Annual Trials por profissionais competentes",
    description: "A empresa CONTRATADA deverá assegurar que os testes anuais DP serão realizados por profissionais que possuam comprovada competência técnica e experiência para embarcações DP classe 2.",
    reference: "IMCA M 190",
    mandatory: true,
    weight: 10
  },
  {
    id: "peodp-3.7.2",
    section: "testes_anuais",
    code: "3.7.2",
    title: "Escopo de testes baseado no FMEA",
    description: "A empresa CONTRATADA deverá assegurar que o escopo de testes será baseado no estudo FMEA da embarcação e cumprido em sua totalidade.",
    mandatory: true,
    weight: 10
  },
  {
    id: "peodp-3.7.3",
    section: "testes_anuais",
    code: "3.7.3",
    title: "Cronograma de testes para 5 anos",
    description: "A empresa CONTRATADA deverá entregar o seu cronograma de testes para os cinco anos seguintes ou até docagem seguinte.",
    mandatory: true,
    weight: 8
  },
  {
    id: "peodp-3.7.4",
    section: "testes_anuais",
    code: "3.7.4",
    title: "Relatórios dos testes anuais DP",
    description: "A empresa CONTRATADA deverá entregar à PETROBRAS os relatórios dos testes anuais DP de todas as embarcações DP de sua frota.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.7.5",
    section: "testes_anuais",
    code: "3.7.5",
    title: "CAMO, ASOG e FMEA atualizados",
    description: "A empresa CONTRATADA deverá entregar à PETROBRAS, quando solicitado, a versão mais atual do CAMO, ASOG e FMEA de todas as embarcações DP.",
    mandatory: true,
    weight: 10
  },
  {
    id: "peodp-3.7.6",
    section: "testes_anuais",
    code: "3.7.6",
    title: "Testes de blackout total",
    description: "A empresa CONTRATADA deverá realizar testes de recuperação de blackout total durante os DP Annual Trials.",
    mandatory: true,
    weight: 10
  },
  {
    id: "peodp-3.7.7",
    section: "testes_anuais",
    code: "3.7.7",
    title: "Testes de perda de propulsor",
    description: "A empresa CONTRATADA deverá realizar testes de perda de propulsores críticos durante os DP Annual Trials.",
    mandatory: true,
    weight: 10
  },
  {
    id: "peodp-3.7.8",
    section: "testes_anuais",
    code: "3.7.8",
    title: "Testes de perda de referência de posição",
    description: "A empresa CONTRATADA deverá realizar testes de perda de referências de posição durante os DP Annual Trials.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.7.9",
    section: "testes_anuais",
    code: "3.7.9",
    title: "Capability plots atualizados",
    description: "A empresa CONTRATADA deverá manter capability plots atualizados baseados nos resultados dos DP Trials.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.7.10",
    section: "testes_anuais",
    code: "3.7.10",
    title: "Testes de WCF (Worst Case Failure)",
    description: "A empresa CONTRATADA deverá realizar testes de Worst Case Failure conforme definido no FMEA.",
    mandatory: true,
    weight: 10
  },
  {
    id: "peodp-3.7.11",
    section: "testes_anuais",
    code: "3.7.11",
    title: "Testes de redundância do sistema",
    description: "A empresa CONTRATADA deverá realizar testes de redundância de todos os sistemas críticos do DP.",
    mandatory: true,
    weight: 10
  },
  {
    id: "peodp-3.7.12",
    section: "testes_anuais",
    code: "3.7.12",
    title: "Verificação de limites operacionais",
    description: "A empresa CONTRATADA deverá verificar e validar os limites operacionais durante os DP Trials.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.7.13",
    section: "testes_anuais",
    code: "3.7.13",
    title: "Análise de resultados e plano de ação",
    description: "A empresa CONTRATADA deverá elaborar análise dos resultados dos DP Trials e plano de ação para não conformidades.",
    mandatory: true,
    weight: 9
  },
  {
    id: "peodp-3.7.14",
    section: "testes_anuais",
    code: "3.7.14",
    title: "Participação da PETROBRAS nos DP Trials",
    description: "A empresa CONTRATADA deverá permitir e facilitar a participação de representantes da PETROBRAS nos DP Annual Trials.",
    mandatory: true,
    weight: 8
  }
];

// =============================================
// CONSOLIDAÇÃO - TODOS OS REQUISITOS PEO-DP 2026
// =============================================
export const PEODP_2026_ALL_REQUIREMENTS: PEODPRequirement[] = [
  ...PEODP_GESTAO_REQUIREMENTS,
  ...PEODP_TREINAMENTOS_REQUIREMENTS,
  ...PEODP_PROCEDIMENTOS_REQUIREMENTS,
  ...PEODP_OPERACAO_REQUIREMENTS,
  ...PEODP_MANUTENCAO_REQUIREMENTS,
  ...PEODP_TESTES_ANUAIS_REQUIREMENTS
];

// =============================================
// EVIDÊNCIAS SUGERIDAS POR SEÇÃO
// =============================================
export const PEODP_EVIDENCES = {
  gestao: [
    "Política de segurança DP assinada pela alta direção",
    "Plano de Ação PEO-DP aprovado e vigente",
    "Organograma com Company DP Authority nomeado",
    "Matriz de responsabilidades DP",
    "Relatórios mensais de análise crítica",
    "Indicadores IPCLV com histórico",
    "Registros de Drift off, Drive off e Large Excursion",
    "Atas de reuniões de análise crítica",
    "Certificado de Sistema de Gestão Integrado",
    "Programa de auditorias internas"
  ],
  treinamentos: [
    "Certificados DPO conforme IMCA C 002",
    "Registros de treinamento em simulador DP",
    "Registros de familiarização por embarcação",
    "Avaliações práticas de competência",
    "Registros de horas DP por profissional",
    "Certificados de treinamento em FMEA e ASOG",
    "Programa de reciclagem vigente",
    "Registros de treinamento em blackout recovery",
    "Matriz de competências atualizada",
    "Histórico de gap analysis de treinamentos"
  ],
  procedimentos: [
    "Manual de Operações DP vigente",
    "Procedimentos de emergência DP",
    "Procedimento de CAM atualizado",
    "Procedimento de handover",
    "Bow-ties ou análises equivalentes",
    "Lista de verificação pré-operacional",
    "Procedimentos de aproximação e afastamento",
    "Procedimento de resposta a perda de posição",
    "Registros de controle de revisões",
    "Checklist pós-manutenção"
  ],
  operacao: [
    "FMEA atualizado a bordo",
    "ASOG vigente",
    "Registros de briefing pré-operacional",
    "Logbook DP com eventos registrados",
    "Registros de exercícios de blackout",
    "Relatórios de monitoramento meteorológico",
    "Capability plots vigentes",
    "Registros de comunicação com unidade",
    "Planos de contingência documentados",
    "Registros de verificação de redundância"
  ],
  manutencao: [
    "Plano de Manutenção anual aprovado",
    "Registros de manutenções realizadas",
    "Certificados de calibração de sensores",
    "Controle de sobressalentes críticos",
    "Contrato de suporte técnico do fabricante",
    "Registros de atualizações de software/hardware",
    "Programa de manutenção preditiva",
    "Backup de configurações do sistema DP",
    "Registros de manutenção de propulsores",
    "Controle de vida útil de componentes"
  ],
  testes_anuais: [
    "Relatórios de DP Annual Trials",
    "Cronograma de testes para 5 anos",
    "Resultados de testes de blackout",
    "Resultados de testes de WCF",
    "Capability plots atualizados pós-trials",
    "CAMO atualizado",
    "Plano de ação para não conformidades",
    "Certificados dos profissionais que realizaram os trials",
    "Registros de participação PETROBRAS",
    "Análise comparativa com trials anteriores"
  ]
};

// =============================================
// ESTATÍSTICAS DO PEO-DP 2026
// =============================================
export const PEODP_2026_STATS = {
  totalRequirements: PEODP_2026_ALL_REQUIREMENTS.length,
  bySection: {
    gestao: PEODP_GESTAO_REQUIREMENTS.length,
    treinamentos: PEODP_TREINAMENTOS_REQUIREMENTS.length,
    procedimentos: PEODP_PROCEDIMENTOS_REQUIREMENTS.length,
    operacao: PEODP_OPERACAO_REQUIREMENTS.length,
    manutencao: PEODP_MANUTENCAO_REQUIREMENTS.length,
    testes_anuais: PEODP_TESTES_ANUAIS_REQUIREMENTS.length
  },
  mandatoryCount: PEODP_2026_ALL_REQUIREMENTS.filter(r => r.mandatory).length,
  totalWeight: PEODP_2026_ALL_REQUIREMENTS.reduce((sum, r) => sum + r.weight, 0),
  version: "2026.1",
  lastUpdate: new Date().toISOString(),
  references: [
    "IMCA M 103, M 109, M 115, M 117, M 166, M 182, M 190, M 196, M 206, M 220",
    "IMO MSC/Circ.645, 738, 1580",
    "ISO 9001, ISO 31000",
    "MTS DP Operations Guidance",
    "OCIMF DP Assurance Framework",
    "NORMAM-01, NORMAM-13, NR-30",
    "PE-2LEP-00001, PP-2LEP-00002"
  ]
};

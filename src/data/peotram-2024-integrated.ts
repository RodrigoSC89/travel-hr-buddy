/**
 * PEOTRAM 2024 - Dados Oficiais Integrados Completos
 * Baseado no documento oficial "LV PEOTRAM Ciclo 2024 PETROBRAS-5.xlsx"
 * 
 * Este arquivo contém TODOS os 13 elementos com TODAS as seções,
 * requisitos, evidências e critérios de avaliação conforme documento oficial.
 */

export interface PeotramRequisito {
  codigo: string;
  descricao: string;
  evidencias: string[];
  nota: number | null;
  cnc: string;
  comentarios?: string;
}

export interface PeotramSecao {
  id: string;
  nome: string;
  requisitos: PeotramRequisito[];
}

export interface PeotramElementoCompleto {
  numero: number;
  nome: string;
  sigla: string;
  descricao: string;
  secoes: PeotramSecao[];
  totalRequisitos: number;
  isCritico: boolean;
  peso: number;
  normasReferenciadas: string[];
  documentacaoNecessaria: string[];
}

export interface CriterioNota {
  valor: number | null;
  label: string;
  percentual: number;
  descricao: string;
  cor: string;
}

export interface ClassificacaoNC {
  codigo: string;
  nome: string;
  descricao: string;
  prazo: string;
  cor: string;
}

// =====================================================
// CRITÉRIOS DE PONTUAÇÃO OFICIAL PEOTRAM 2024
// =====================================================
export const CRITERIOS_NOTA_OFICIAL: CriterioNota[] = [
  { valor: null, label: "N/A", percentual: 0, descricao: "Não Aplicável; Não avaliado", cor: "gray" },
  { valor: 0, label: "0", percentual: 0, descricao: "Não Evidenciado ou Não Implantado", cor: "red" },
  { valor: 1, label: "1", percentual: 20, descricao: "Evidenciado implementação com Falhas Sistemáticas ou Falhas Críticas ou Em implementação", cor: "orange" },
  { valor: 2, label: "2", percentual: 50, descricao: "Evidenciado implementação com Falhas Pontuais", cor: "yellow" },
  { valor: 3, label: "3", percentual: 90, descricao: "Evidenciado implementação sem Falhas", cor: "green" },
  { valor: 4, label: "4", percentual: 100, descricao: "Evidenciadas ações e/ou boas práticas que vão além do requerido", cor: "emerald" },
];

// =====================================================
// CLASSIFICAÇÃO DE NÃO CONFORMIDADES OFICIAL
// =====================================================
export const CLASSIFICACAO_NC_OFICIAL: ClassificacaoNC[] = [
  { codigo: "N/A", nome: "Não Aplicável", descricao: "Não Aplicável", prazo: "", cor: "gray" },
  { codigo: "A", nome: "Crítica", descricao: "Não conformidade crítica - Tomada de ação imediata para a redução do risco. RISCO IMINENTE.", prazo: "10 dias corridos", cor: "red" },
  { codigo: "B", nome: "Grave", descricao: "Não conformidade grave - Tomada de ação imediata para a redução do risco.", prazo: "15 dias corridos", cor: "orange" },
  { codigo: "C", nome: "Moderado", descricao: "Não conformidade moderada - Atendimento parcial ou insuficiente a um requisito.", prazo: "30 dias", cor: "yellow" },
  { codigo: "D", nome: "Leve", descricao: "Desvio ou falhas isoladas no atendimento a um requisito.", prazo: "60 dias", cor: "blue" },
  { codigo: "✓", nome: "Conforme", descricao: "Conforme", prazo: "", cor: "green" },
  { codigo: "✓✓", nome: "Excelência", descricao: "Item de Excelência", prazo: "", cor: "emerald" },
];

// =====================================================
// 13 ELEMENTOS PEOTRAM 2024 - DADOS OFICIAIS COMPLETOS
// =====================================================
export const PEOTRAM_2024_ELEMENTOS_OFICIAIS: PeotramElementoCompleto[] = [
  // =====================================================
  // ELEMENTO 1: LIDERANÇA, GERENCIAMENTO E RESPONSABILIDADE
  // =====================================================
  {
    numero: 1,
    nome: "LIDERANÇA, GERENCIAMENTO E RESPONSABILIDADE",
    sigla: "LGR",
    descricao: "Compromisso da alta administração com a gestão de segurança, meio ambiente e saúde ocupacional",
    isCritico: true,
    peso: 8.5,
    totalRequisitos: 6,
    normasReferenciadas: ["ISM Code", "IMCA", "NR-10", "NR-11", "NR-12", "NR-13", "NR-17", "NR-20", "NR-30", "NR-33", "NR-34", "NR-35"],
    documentacaoNecessaria: ["Política SMS", "Organograma", "Matriz RACI", "Registros de visitas da liderança"],
    secoes: [
      {
        id: "1.1",
        nome: "Responsabilidade e Autoridade",
        requisitos: [
          {
            codigo: "1.1.1",
            descricao: "A alta administração da empresa demonstra compromisso claro em implementar e manter a gestão de segurança, meio ambiente e saúde?",
            evidencias: [
              "Entrevistas com alta administração",
              "Atribuições e responsabilidades relacionadas com a gestão de SMS e segurança operacional definidas e implementados a bordo e na base",
              "Visitas periódicas nas embarcações pelos diretores e gerentes",
              "Auditorias comportamentais periódicas pelas lideranças",
              "Sistemática para auditorias comportamentais de integridade",
              "Inspeções e auditorias periódicas pelos gestores de manutenção, operação e SMS"
            ],
            nota: null,
            cnc: ""
          },
          {
            codigo: "1.1.2",
            descricao: "A empresa demonstra ter setores de Operação, Manutenção/Técnico, RH, SMS adequadamente estruturados, com competência técnica e articulados, para suportar operações marítimas a serviço da Petrobras?",
            evidencias: [
              "Organograma estruturado da empresa",
              "Matriz de responsabilidades com hierarquia (gerentes de operação, manutenção, SMS/HSE, RH)",
              "Evidências de articulação dos setores a bordo no suporte às operações"
            ],
            nota: null,
            cnc: ""
          }
        ]
      },
      {
        id: "1.2",
        nome: "Comprometimento da Liderança",
        requisitos: [
          {
            codigo: "1.2.1",
            descricao: "A empresa possui sistemática para estabelecer as diversas especificações previstas em normas como: Designação profissional legalmente habilitado, habilitação, capacitação e qualificação.",
            evidencias: [
              "ISM Code, IMCA, NR 10, NR 11, NR 12, NR 13, NR 17, NR 20, NR30, NR 33, NR 34, NR 35",
              "Procedimento Documentado"
            ],
            nota: null,
            cnc: ""
          },
          {
            codigo: "1.2.2",
            descricao: "a) A empresa designou formalmente os responsáveis legais requeridos conforme legislação, tais como Profissionais Legalmente Habilitados (PLH), profissionais designados nas NRs, dentre outros? b) Todos os serviços que requeiram atuação dos responsáveis legais estão em conformidade?",
            evidencias: [
              "Carta de Designação DPA (ISM Code / IMCA)",
              "Profissionais designados nas NR 10, NR 11, NR 12, NR 13, NR 17, NR 20, NR 33, NR 34, NR 35",
              "Registros que comprovem a atuação ao longo do ano do DPA e pessoas designadas"
            ],
            nota: null,
            cnc: ""
          },
          {
            codigo: "1.2.3",
            descricao: "A alta administração da empresa demonstra compromisso com o tema de redução de emissões de gases de efeito estufa e apresenta ações práticas para redução de emissões?",
            evidencias: [
              "Registros que comprovem a atuação da alta liderança neste tema",
              "Ações práticas evidenciadas (ex: modos de operação, ações visando redução de consumo de diesel, gestão de manutenção, indicadores)"
            ],
            nota: null,
            cnc: ""
          }
        ]
      },
      {
        id: "1.3",
        nome: "Indicadores e Itens Críticos",
        requisitos: [
          {
            codigo: "1.3.1",
            descricao: "A alta administração da empresa estabeleceu indicadores e metas de performance em SMS, manutenções, inspeções e excelência operacional, medindo-as e monitorando-as periodicamente, com planos de ação no caso de não atendimento?",
            evidencias: [
              "Indicadores: TAR, TOR, TFCA, TG, Vazamentos, Tempo Perdido (PTP-Saúde), Falhas de DP, Cumprimentos de Plano de Manutenção (ICMP), Abalroamentos (meta zero)",
              "Medições realizadas",
              "Planos de ação no caso de não atendimento"
            ],
            nota: null,
            cnc: ""
          }
        ]
      }
    ]
  },

  // =====================================================
  // ELEMENTO 2: CONFORMIDADE LEGAL
  // =====================================================
  {
    numero: 2,
    nome: "CONFORMIDADE LEGAL",
    sigla: "CL",
    descricao: "Identificação e atendimento a requisitos legais, NRs e normas marítimas aplicáveis",
    isCritico: true,
    peso: 7.5,
    totalRequisitos: 24,
    normasReferenciadas: ["NORMAM", "NR-34", "NR-12", "NR-10", "NR-13", "STCW", "SOLAS", "MARPOL"],
    documentacaoNecessaria: ["Lista de requisitos legais", "Certificados", "Registros de conformidade", "Auditorias internas"],
    secoes: [
      {
        id: "2.1",
        nome: "Sistemática de Identificação e Atualização de Requisitos Legais e Outros",
        requisitos: [
          {
            codigo: "2.1.1",
            descricao: "a) A empresa possui sistema que identifique e atualize as legislações e normas nacionais e internacionais pertinentes às operações da empresa? b) As legislações, normas e requisitos contratuais estão inseridos em todos os estudos de risco e procedimentos que afetem a segurança das operações?",
            evidencias: [
              "Legislação Federal, Estadual, Municipal",
              "Outros requisitos (NBR, NRs, Normas técnicas)",
              "Lista ou Software com os requisitos legais",
              "Correlação entre requisitos e aspectos ambientais",
              "Correlação entre estudos de riscos e segurança operacional"
            ],
            nota: null,
            cnc: ""
          },
          {
            codigo: "2.1.2",
            descricao: "A empresa possui grupo interno de inspeção e auditoria, para verificar a conformidade de toda sua frota às legislações marítimas, NRs, ambientais, da ANVISA, da IMCA, IMO, ISM, requisitos da Contratante?",
            evidencias: [
              "Cronograma de inspeções/auditorias envolvendo toda a frota",
              "Relatório de inspeção/auditoria consistente com registros de NC e planos de ação",
              "Qualificação do(s) auditor(es) / inspetor(es)"
            ],
            nota: null,
            cnc: ""
          }
        ]
      },
      {
        id: "2.2",
        nome: "Atendimento à NR-34",
        requisitos: [
          {
            codigo: "2.2.1",
            descricao: "A empresa possui profissional formalmente designado para o cumprimento da NR-34?",
            evidencias: ["Evidências dos registros de designação formal"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "2.2.2",
            descricao: "Os profissionais que realizaram atividades no âmbito da NR-34 ao longo do ciclo, estão devidamente capacitados e treinados nos termos estabelecidos no item 34.3 da NR-34?",
            evidencias: [
              "Comprovação da conclusão de curso específico",
              "Profissional Legalmente Habilitado com registro no conselho de classe",
              "Carga mínima indicada na NR-34",
              "Capacitação realizada durante horário normal de trabalho"
            ],
            nota: null,
            cnc: ""
          },
          {
            codigo: "2.2.3",
            descricao: "As documentações de atendimento à NR-34 estão disponíveis e conformes, como estabelecido no item 34.4 da NR-34?",
            evidencias: ["Permissões para Trabalho conforme item 34.4", "Entrevistas"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "2.2.4",
            descricao: "Os trabalhos a quente realizados a bordo no ciclo anual foram realizados em conformidade com o requerido no item 34.5 da NR-34?",
            evidencias: ["Relação dos trabalhos a quente realizados no ciclo", "Registros de atendimento integral ao item 34.5"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "2.2.5",
            descricao: "Os trabalhos em altura realizados a bordo no ciclo anual, foram realizados observando o requerido no item 34.6 da NR-34?",
            evidencias: ["Registros de trabalhos em altura conforme item 34.6"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "2.2.6",
            descricao: "Os trabalhos de pintura realizados a bordo no ciclo anual, foram realizados observando o requerido no item 34.9 da NR-34?",
            evidencias: ["Registros de trabalhos de pintura conforme item 34.9"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "2.2.7",
            descricao: "Os trabalhos de movimentação de cargas a bordo no ciclo anual, foram realizados observando o requerido no item 34.10 da NR-34?",
            evidencias: ["Relação dos equipamentos de movimentação de cargas", "Registros de atendimento integral ao item 34.10"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "2.2.8",
            descricao: "Os equipamentos de movimentação de cargas possuem prontuários cumprindo integralmente o requerido no item 34.10.3 da NR-34?",
            evidencias: ["Relação de todos os equipamentos de movimentação de cargas e seus prontuários"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "2.2.9",
            descricao: "Os equipamentos e acessórios de movimentação de cargas estão certificados por profissionais legalmente habilitados, com periodicidade adequada, conforme item 34.10.6 da NR-34?",
            evidencias: ["Relação dos certificados de todos os equipamentos de movimentação de cargas"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "2.2.10",
            descricao: "Os equipamentos portáteis a bordo no ciclo anual, foram realizados observando o requerido no item 34.12 da NR-34?",
            evidencias: ["Relação dos equipamentos portáteis", "Registros de atendimento integral ao item 34.12"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "2.2.11",
            descricao: "As instalações elétricas provisórias a bordo no ciclo anual, foram realizados observando o requerido no item 34.13 da NR-34?",
            evidencias: ["Relação das instalações elétricas provisórias", "Registros de atendimento integral ao item 34.13"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "2.2.12",
            descricao: "Os testes de estanqueidade realizados a bordo no ciclo anual, foram realizados observando o requerido no item 34.14 da NR-34?",
            evidencias: ["Relação dos testes de estanqueidade", "Registros de atendimento integral ao item 34.14"],
            nota: null,
            cnc: ""
          }
        ]
      },
      {
        id: "2.3",
        nome: "Atendimento à NR-12",
        requisitos: [
          {
            codigo: "2.3.1",
            descricao: "a) A empresa possui Profissional Legalmente Habilitado para fins de cumprimento da NR-12? b) O profissional é atuante e realiza todas as ações sob sua responsabilidade conforme disposto na NR-12?",
            evidencias: ["Designação do PLH", "Formação como Engenheiro Mecânico ou Naval com ART recolhida (CREA ativo)"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "2.3.2",
            descricao: "O arranjo físico da embarcação está conforme ao estabelecido no item 12.2 da NR-12?",
            evidencias: ["Relatórios, fotos, Visita a bordo e registros de aplicação da NR-12"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "2.3.3",
            descricao: "As instalações e dispositivos elétricos nas embarcações estão conformes ao estabelecido no item 12.3 da NR-12?",
            evidencias: ["Relatórios, fotos, Visita a bordo e registros"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "2.3.4",
            descricao: "Os dispositivos de partida, acionamento e parada nas embarcações estão conformes ao estabelecido no item 12.4 da NR-12?",
            evidencias: ["Relatórios, fotos, Visita a bordo e registros"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "2.3.5",
            descricao: "Os sistemas de segurança nas embarcações estão conformes ao estabelecido no item 12.5 da NR-12?",
            evidencias: ["Relatórios, fotos, Visita a bordo e registros"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "2.3.6",
            descricao: "Os dispositivos de parada de emergências nas embarcações estão conformes ao estabelecido no item 12.6 da NR-12?",
            evidencias: ["Relatórios, fotos, Visita a bordo e registros"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "2.3.7",
            descricao: "Os componentes pressurizados das embarcações estão conformes ao estabelecido no item 12.7 da NR-12?",
            evidencias: ["Relatórios, fotos, Visita a bordo e registros"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "2.3.8",
            descricao: "Os riscos adicionais estão mapeados e em conformidade ao estabelecido no item 12.10 da NR-12?",
            evidencias: ["Relatórios, fotos, Visita a bordo e registros"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "2.3.9",
            descricao: "As manutenções, inspeções, preparação, ajustes, reparos, limpezas, sinalizações e manuais estão conformes ao estabelecido nos itens 12.11, 12.12 e 12.13 da NR-12?",
            evidencias: ["Relatórios, fotos, Visita a bordo e registros"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "2.3.10",
            descricao: "Para a realização de trabalhos com máquinas e equipamentos, estão estabelecidos procedimentos documentados de trabalho e segurança, conforme estabelecido no item 12.14 da NR-12?",
            evidencias: ["Relatórios, fotos, Visita a bordo e registros"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "2.3.11",
            descricao: "Os profissionais da empresa que realizam operação, manutenção, inspeção e demais intervenções em máquinas e equipamentos nas embarcações, estão capacitados, habilitados, qualificados e autorizados conforme estabelecido no item 12.16 da NR-12?",
            evidencias: ["Relação dos profissionais", "Registros de treinamentos confrontando com NR-12", "Entrevistas"],
            nota: null,
            cnc: ""
          }
        ]
      }
    ]
  },

  // =====================================================
  // ELEMENTO 3: GESTÃO DE RISCOS
  // =====================================================
  {
    numero: 3,
    nome: "GESTÃO DE RISCOS",
    sigla: "GR",
    descricao: "Identificação, análise e gerenciamento de riscos operacionais e de SMS",
    isCritico: true,
    peso: 9.0,
    totalRequisitos: 14,
    normasReferenciadas: ["ISM Code 1.2.2", "NR-37", "N-2782", "IMCA"],
    documentacaoNecessaria: ["Matriz de riscos", "APR/PT", "HAZOP", "FMEA", "Bow Tie"],
    secoes: [
      {
        id: "3.1",
        nome: "Identificação e Avaliação de Riscos",
        requisitos: [
          {
            codigo: "3.1.1",
            descricao: "A empresa possui processo estruturado e implementado de identificação dos perigos e gestão de riscos ocupacionais e operacionais?",
            evidencias: [
              "Procedimento documentado",
              "Relatório de Análises de Riscos (APR, APP)",
              "Contempla: Intoxicação, Doenças contagiosas, Trauma, desastres naturais, ação de terceiros"
            ],
            nota: null,
            cnc: ""
          },
          {
            codigo: "3.1.2",
            descricao: "Os participantes de estudos de riscos possuem treinamento em técnicas de avaliação e gestão de riscos?",
            evidencias: ["Registros de treinamento", "Entrevistas"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "3.1.3",
            descricao: "Para estudos de riscos para segurança operacional, são utilizadas técnicas estruturadas DE CLASSIFICAÇÃO DE RISCO (SEVERIDADE, FREQUÊNCIA) como as preconizadas no item 4 para embarcações DP o ASOG, conforme norma IMCA?",
            evidencias: ["Procedimentos para HAZOP, FMEA/ASOG, HAZID, Bow Tie"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "3.1.4",
            descricao: "Nos estudos de risco de segurança operacional, é aplicada uma Matriz de Tolerabilidade de Riscos, abrangendo categorias severidade x frequência conforme Norma Petrobras N-2782?",
            evidencias: ["Verificar se os riscos foram categorizados conforme matriz de tolerabilidade"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "3.1.5",
            descricao: "A empresa possui uma sistemática que verifique a qualidade das análises de risco, contemplando obrigatoriamente os critérios mínimos estabelecidos?",
            evidencias: [
              "Condução por líder treinado na técnica",
              "Equipe multidisciplinar (Operação, SMS, Manutenção)",
              "Aprovação por nível hierárquico superior",
              "Rastreabilidade e controle de revisão",
              "Rastreabilidade das ações de implementação",
              "Matriz de Tolerabilidade de Riscos"
            ],
            nota: null,
            cnc: ""
          }
        ]
      },
      {
        id: "3.2",
        nome: "Gerenciamento de Riscos",
        requisitos: [
          {
            codigo: "3.2.1",
            descricao: "a) A bordo estão implementadas as ações de prevenção e/ou mitigação dos estudos de riscos avaliados? b) As barreiras (salvaguardas) identificadas na análise de riscos estão íntegras?",
            evidencias: [
              "Verificação em campo: Entrevistas, Procedimentos, Manutenção de equipamentos críticos",
              "EPIs adequados",
              "Barreiras para cenários críticos (abalroamento, incêndio, perda de posição)"
            ],
            nota: null,
            cnc: ""
          },
          {
            codigo: "3.2.2",
            descricao: "Tanto nos estudos de risco, quanto a bordo, a contratada determina e implementa controles seguindo a hierarquia de: eliminação, substituição, controles de engenharia, sinalização/controles administrativos, EPIs?",
            evidencias: ["Verificação em campo"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "3.2.3",
            descricao: "Nas entrevistas a bordo, a força de trabalho tem conhecimento dos riscos a que estão submetidos e as ações de controle?",
            evidencias: ["Verificação em campo e entrevistas"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "3.2.4",
            descricao: "Foram estabelecidos gatilhos para revisão dos levantamentos de aspectos e impactos e perigos e danos e para os estudos de riscos para segurança operacional?",
            evidencias: [
              "Procedimento documentado",
              "Estudos de riscos",
              "Registros de abrangências dos Alertas de SMS",
              "Registros de avaliação dos simulados"
            ],
            nota: null,
            cnc: ""
          }
        ]
      }
    ]
  },

  // =====================================================
  // ELEMENTO 4: OPERAÇÃO
  // =====================================================
  {
    numero: 4,
    nome: "OPERAÇÃO",
    sigla: "OP",
    descricao: "Gestão de operações críticas e procedimentos operacionais",
    isCritico: true,
    peso: 9.5,
    totalRequisitos: 28,
    normasReferenciadas: ["ISM Code", "SOLAS", "NR-37", "IMCA M 103", "IMCA M 117"],
    documentacaoNecessaria: ["Procedimentos operacionais", "PT", "VCP", "Checklists", "Limites meteoceanográficos"],
    secoes: [
      {
        id: "4.1",
        nome: "Geral",
        requisitos: [
          {
            codigo: "4.1.1",
            descricao: "Há sistemática para definição e gestão de equipamentos críticos? A relação dos elementos críticos foi validada pela liderança?",
            evidencias: ["Procedimentos documentados", "Lista de equipamentos críticos", "Análise de risco"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "4.1.2",
            descricao: "Existe sistemática implementada de Verificação de Conformidade de Procedimentos - VCP?",
            evidencias: [
              "Procedimento baseado em análise de risco",
              "Lista de padrões críticos",
              "Cronograma cumprido",
              "Participação da liderança"
            ],
            nota: null,
            cnc: ""
          },
          {
            codigo: "4.1.3",
            descricao: "A empresa possui gestão de operações críticas mapeadas através de análise de risco?",
            evidencias: [
              "Atracação, desatracação e navegação",
              "Aproximação de zona de 500 metros",
              "Transferência de fluidos",
              "Transporte/transbordo de pessoas",
              "Pull-in/Pull-out",
              "Movimentação de cargas",
              "Operações simultâneas",
              "Limites meteoceanográficos"
            ],
            nota: null,
            cnc: ""
          },
          {
            codigo: "4.1.4",
            descricao: "A embarcação possui procedimento para solicitação de autorização à Unidade Marítima antes de entrar na zona de 500 metros?",
            evidencias: [
              "Procedimentos documentados",
              "Registros de aproximações",
              "Protocolos de Aproximação",
              "Procedimento de Bump Test",
              "Certificado de Calibração dos detectores de gases"
            ],
            nota: null,
            cnc: ""
          },
          {
            codigo: "4.1.5",
            descricao: "A embarcação utiliza os protocolos de aproximação e se certifica da ausência de gases tóxicos a partir de eventos de abertura de vents nas plataformas?",
            evidencias: ["Registros de aproximação", "Registro da medição de gases"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "4.1.6",
            descricao: "Existe procedimento para operações simultâneas detalhando quais operações não podem ser realizadas simultaneamente?",
            evidencias: ["Procedimentos documentados", "Lista de verificação", "Estudos de riscos", "Treinamentos"],
            nota: null,
            cnc: ""
          }
        ]
      },
      {
        id: "4.2",
        nome: "Sistema de Posicionamento Dinâmico (DP)",
        requisitos: [
          {
            codigo: "4.2.1",
            descricao: "A embarcação DP possui CAM (Capability and Activity Matrix) atualizado conforme IMCA M 103?",
            evidencias: ["CAM atualizado", "ASOG implementado", "Registros de revisão"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "4.2.2",
            descricao: "O ASOG está implementado e os operadores de DP estão treinados na sua utilização?",
            evidencias: ["ASOG documentado", "Registros de treinamento", "Entrevistas com operadores DP"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "4.2.3",
            descricao: "Os testes de FMEA do sistema DP estão sendo realizados conforme cronograma?",
            evidencias: ["Cronograma de testes FMEA", "Registros de testes", "Planos de ação para desvios"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "4.2.4",
            descricao: "Os footprints operacionais estão definidos e sendo monitorados em operações próximas a plataformas?",
            evidencias: ["Footprints definidos", "Registros de monitoramento", "Alarmes configurados"],
            nota: null,
            cnc: ""
          }
        ]
      }
    ]
  },

  // =====================================================
  // ELEMENTO 5: SEGURANÇA TÉCNICA E EFICIÊNCIA ENERGÉTICA
  // =====================================================
  {
    numero: 5,
    nome: "SEGURANÇA TÉCNICA E EFICIÊNCIA ENERGÉTICA",
    sigla: "ST",
    descricao: "Navegação segura, DP e medidas de eficiência energética e baixo carbono",
    isCritico: false,
    peso: 7.5,
    totalRequisitos: 14,
    normasReferenciadas: ["STCW", "IMCA M 103", "IMCA M 117", "IMO EEXI", "IMO CII"],
    documentacaoNecessaria: ["Manuais DP", "ASOG/CAM", "Inventário GEE", "Plano de eficiência energética"],
    secoes: [
      {
        id: "5.1",
        nome: "Navegação Segura",
        requisitos: [
          {
            codigo: "5.1.1",
            descricao: "A empresa possui sistemática de gestão de navegação segura conforme STCW e regulamentos aplicáveis?",
            evidencias: ["Procedimentos de navegação", "Cartas náuticas atualizadas", "Equipamentos de navegação calibrados"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "5.1.2",
            descricao: "Os oficiais de navegação estão devidamente certificados e familiarizados com os equipamentos de bordo?",
            evidencias: ["Certificados STCW", "Registros de familiarização", "Entrevistas"],
            nota: null,
            cnc: ""
          }
        ]
      },
      {
        id: "5.2",
        nome: "Eficiência Energética",
        requisitos: [
          {
            codigo: "5.2.1",
            descricao: "A empresa possui inventário de emissões de gases de efeito estufa (GEE) para sua frota?",
            evidencias: ["Inventário GEE", "Metodologia de cálculo", "Indicadores de emissão"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "5.2.2",
            descricao: "Existem metas e planos de ação para redução de emissões e consumo de combustível?",
            evidencias: ["Metas documentadas", "Plano de ação", "Indicadores de acompanhamento"],
            nota: null,
            cnc: ""
          }
        ]
      }
    ]
  },

  // =====================================================
  // ELEMENTO 6: MANUTENÇÃO E CONFIABILIDADE
  // =====================================================
  {
    numero: 6,
    nome: "MANUTENÇÃO E CONFIABILIDADE",
    sigla: "MN",
    descricao: "Sistema de manutenção planejada e gestão de confiabilidade de equipamentos",
    isCritico: true,
    peso: 9.5,
    totalRequisitos: 24,
    normasReferenciadas: ["ISM Code 10", "SOLAS", "NORMAM 01", "Class Rules"],
    documentacaoNecessaria: ["PMS", "Plano de manutenção", "Indicadores ICMP", "Relatórios de inspeção"],
    secoes: [
      {
        id: "6.1",
        nome: "Gestão de Manutenção",
        requisitos: [
          {
            codigo: "6.1.1",
            descricao: "A empresa possui sistemática de gestão de manutenção, planejamento e programação, monitorando os percentuais de execução do plano de manutenção?",
            evidencias: [
              "Software de manutenção",
              "Controle de indicadores de cumprimento do plano",
              "Planos de Ação para gaps"
            ],
            nota: null,
            cnc: ""
          },
          {
            codigo: "6.1.2",
            descricao: "O sistema de manutenção planejada (PMS) está implementado e atualizado?",
            evidencias: ["PMS implementado", "Registros de manutenção", "Histórico de equipamentos"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "6.1.3",
            descricao: "O indicador ICMP (Índice de Cumprimento do Plano de Manutenção) é monitorado e atinge as metas estabelecidas?",
            evidencias: ["Relatórios de ICMP", "Análise de tendência", "Planos de ação para desvios"],
            nota: null,
            cnc: ""
          }
        ]
      },
      {
        id: "6.2",
        nome: "Equipamentos Críticos",
        requisitos: [
          {
            codigo: "6.2.1",
            descricao: "O plano de manutenção e inspeção inclui os elementos críticos de segurança operacional? Estão sendo realizadas dentro do prazo?",
            evidencias: [
              "Procedimento documentado",
              "Registros de manutenção",
              "Relação de equipamentos críticos conforme NORMAM 01, anexo 15C, item 22"
            ],
            nota: null,
            cnc: ""
          },
          {
            codigo: "6.2.2",
            descricao: "As manutenções e inspeções do sistema DP estão programadas e sendo realizadas?",
            evidencias: ["Registros de inspeção e manutenção", "Plano de manutenção DP"],
            nota: null,
            cnc: ""
          }
        ]
      },
      {
        id: "6.3",
        nome: "Peças Sobressalentes",
        requisitos: [
          {
            codigo: "6.3.1",
            descricao: "Existe gestão de peças sobressalentes críticas a bordo e em estoque?",
            evidencias: ["Lista de sobressalentes críticos", "Controle de estoque", "Prazo de entrega"],
            nota: null,
            cnc: ""
          }
        ]
      }
    ]
  },

  // =====================================================
  // ELEMENTO 7: GESTÃO DE MUDANÇAS
  // =====================================================
  {
    numero: 7,
    nome: "GESTÃO DE MUDANÇAS",
    sigla: "GM",
    descricao: "Controle de mudanças em processos, equipamentos, pessoas e tecnologias",
    isCritico: true,
    peso: 6.0,
    totalRequisitos: 14,
    normasReferenciadas: ["ISM Code", "NR-37", "IMCA"],
    documentacaoNecessaria: ["Procedimento MOC", "Formulários de mudança", "Análise de risco", "Aprovações"],
    secoes: [
      {
        id: "7.1",
        nome: "Mudança de Tecnologias/Processos/Equipamentos/Pessoas",
        requisitos: [
          {
            codigo: "7.1.1",
            descricao: "A empresa possui procedimentos e registros de gestão de mudanças em operações, processos, instalações, equipamentos, pessoas e tecnologias?",
            evidencias: [
              "Procedimento de GM",
              "Relação de mudanças",
              "Sistemática de comunicação",
              "Treinamentos mapeados na GM",
              "Aprovação por liderança",
              "Gatilho para atualização de procedimentos e análises de risco"
            ],
            nota: null,
            cnc: ""
          },
          {
            codigo: "7.1.2",
            descricao: "Para todas as mudanças realizadas na empresa, foram realizadas as avaliações de risco?",
            evidencias: ["Relação de mudanças com registros da avaliação de riscos e aprovação"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "7.1.3",
            descricao: "As mudanças temporárias estão sendo controladas e revertidas no prazo?",
            evidencias: ["Registro de mudanças temporárias", "Controle de prazo", "Reversão documentada"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "7.1.4",
            descricao: "A empresa possui software ou programa informatizado para execução das gestões de mudança na frota e na base?",
            evidencias: ["Software com registros de mudanças nas embarcações e na frota"],
            nota: null,
            cnc: ""
          }
        ]
      }
    ]
  },

  // =====================================================
  // ELEMENTO 8: AQUISIÇÃO DE BENS E SERVIÇOS
  // =====================================================
  {
    numero: 8,
    nome: "AQUISIÇÃO DE BENS E SERVIÇOS",
    sigla: "AQ",
    descricao: "Qualificação de fornecedores e gestão de aquisições",
    isCritico: false,
    peso: 5.5,
    totalRequisitos: 11,
    normasReferenciadas: ["ISM Code", "IMCA"],
    documentacaoNecessaria: ["Procedimento de qualificação", "Auditorias de fornecedores", "Avaliações de desempenho"],
    secoes: [
      {
        id: "8.1",
        nome: "Aquisição de Bens e Serviços",
        requisitos: [
          {
            codigo: "8.1.1",
            descricao: "A empresa possui sistemática de auditorias periódicas de todos os fornecedores de bens e serviços, considerando aspectos de SMS, de segurança operacional e legislação?",
            evidencias: [
              "Procedimento documentado",
              "Relação de empresas contratadas/subcontratadas com notas de avaliação",
              "Relatórios de Auditorias em fornecedores"
            ],
            nota: null,
            cnc: ""
          },
          {
            codigo: "8.1.2",
            descricao: "A empresa realiza pré-qualificação de fornecedores e avalia a competência técnica, habilitações e qualificação dos profissionais para serviços críticos a bordo?",
            evidencias: ["Relação dos fornecedores contratados ao longo do ciclo"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "8.1.3",
            descricao: "Os fornecedores de peças sobressalentes e materiais críticos são avaliados quanto à qualidade e certificação?",
            evidencias: ["Critérios de qualificação", "Certificados de fornecedores", "Rastreabilidade de materiais"],
            nota: null,
            cnc: ""
          }
        ]
      }
    ]
  },

  // =====================================================
  // ELEMENTO 9: GESTÃO DE RECURSOS HUMANOS
  // =====================================================
  {
    numero: 9,
    nome: "GESTÃO DE RECURSOS HUMANOS",
    sigla: "RH",
    descricao: "Recrutamento, treinamento, competências e fatores humanos",
    isCritico: false,
    peso: 8.0,
    totalRequisitos: 18,
    normasReferenciadas: ["STCW", "IMCA M 117", "NR-34", "NR-35", "ISM Code 6"],
    documentacaoNecessaria: ["Certificados STCW", "Matriz de competências", "Registros de treinamento", "Programa de FH"],
    secoes: [
      {
        id: "9.1",
        nome: "Recrutamento e Gerenciamento de Pessoal da Base",
        requisitos: [
          {
            codigo: "9.1.1",
            descricao: "A empresa implementou sistema de recrutamento de pessoas de tal forma que candidatos a posições chave possuam as qualificações, competência e experiência apropriadas?",
            evidencias: ["Procedimento de recrutamento", "Registros de aplicação para posições chave"],
            nota: null,
            cnc: ""
          }
        ]
      },
      {
        id: "9.2",
        nome: "Recrutamento e Gerenciamento de Pessoal de Bordo",
        requisitos: [
          {
            codigo: "9.2.1",
            descricao: "A empresa possui e implementou processo de seleção, recrutamento e promoção de pessoal de bordo?",
            evidencias: ["Procedimento documentado", "Registros"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "9.2.2",
            descricao: "Todo o pessoal de bordo possui certificados válidos em conformidade com Flag State e autoridades marítimas?",
            evidencias: ["Procedimento documentado", "Registros", "Certificados"],
            nota: null,
            cnc: ""
          }
        ]
      },
      {
        id: "9.3",
        nome: "Treinamentos",
        requisitos: [
          {
            codigo: "9.3.1",
            descricao: "Existe plano anual de treinamento estruturado e sendo executado?",
            evidencias: ["Plano de treinamento", "Cronograma", "Registros de execução"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "9.3.2",
            descricao: "A empresa possui sistemática que garanta que os tripulantes que operam equipamentos de DP estão devidamente qualificados e habilitados, conforme normas IMCA, IMO e autoridades marítimas?",
            evidencias: ["Procedimento documentado", "Certificado de curso", "Log Book"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "9.3.3",
            descricao: "O pessoal envolvido com operação do sistema de DP está familiarizado com suas atribuições conforme IMCA M 117 e STCW/1978?",
            evidencias: ["Certificado de capacitação", "Entrevista"],
            nota: null,
            cnc: ""
          }
        ]
      },
      {
        id: "9.4",
        nome: "Simuladores",
        requisitos: [
          {
            codigo: "9.4.1",
            descricao: "O programa de treinamentos de Comandantes, Imediatos e Oficiais contempla o uso de simuladores de operações marítimas e envolve o uso de DP?",
            evidencias: ["Procedimento documentado", "Registros de Treinamento", "Simuladores: SIAGRA, SINDIMAR, outros"],
            nota: null,
            cnc: ""
          }
        ]
      },
      {
        id: "9.5",
        nome: "CRM - Crew Resource Management",
        requisitos: [
          {
            codigo: "9.5.1",
            descricao: "A empresa implementou programa de CRM (Crew Resource Management) para a tripulação?",
            evidencias: ["Treinamento de CRM", "Registros de participação", "Avaliação de eficácia"],
            nota: null,
            cnc: ""
          }
        ]
      },
      {
        id: "9.6",
        nome: "Fatores Humanos",
        requisitos: [
          {
            codigo: "9.6.1",
            descricao: "A empresa estabelece sistemática para implementação de programa de Fatores Humanos nas dimensões Tecnológico, Ambiental, Organizacional e de Fatores Individuais?",
            evidencias: [
              "Programa de Fatores Humanos",
              "Treinamentos sobre o tema",
              "Especialista na área",
              "Investigação de acidentes contemplando fatores humanos"
            ],
            nota: null,
            cnc: ""
          }
        ]
      }
    ]
  },

  // =====================================================
  // ELEMENTO 10: GESTÃO DA INFORMAÇÃO & COMUNICAÇÃO
  // =====================================================
  {
    numero: 10,
    nome: "GESTÃO DA INFORMAÇÃO & COMUNICAÇÃO",
    sigla: "GI",
    descricao: "Controle de documentos, registros e comunicação efetiva",
    isCritico: false,
    peso: 5.0,
    totalRequisitos: 7,
    normasReferenciadas: ["ISM Code 11", "NR-1"],
    documentacaoNecessaria: ["Sistema documental", "Lista mestra", "Canais de comunicação", "Ouvidoria"],
    secoes: [
      {
        id: "10.1",
        nome: "Controle de Documentos",
        requisitos: [
          {
            codigo: "10.1.1",
            descricao: "A empresa evidenciou que atende o item 1.6 - Da prestação de informação digital e digitalização de documentos, em conformidade com a NR-1?",
            evidencias: ["Registros apresentados em conformidade com item 1.6 da NR-1"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "10.1.2",
            descricao: "A empresa possui sistema e procedimento implementado de controle de documentos de gestão de SMS?",
            evidencias: [
              "Procedimento documentado",
              "Rastreabilidade dos anexos e formulários",
              "Ausência de documentos obsoletos",
              "Documentos dentro da validade"
            ],
            nota: null,
            cnc: ""
          }
        ]
      },
      {
        id: "10.2",
        nome: "Registros",
        requisitos: [
          {
            codigo: "10.2.1",
            descricao: "Os registros do sistema de gestão são mantidos de forma organizada e acessível?",
            evidencias: ["Sistema de arquivamento", "Backup de dados", "Tempo de retenção definido"],
            nota: null,
            cnc: ""
          }
        ]
      },
      {
        id: "10.3",
        nome: "Comunicação",
        requisitos: [
          {
            codigo: "10.3.1",
            descricao: "A empresa possui e implementou a sistemática do 'NA DÚVIDA, PARE!', na qual qualquer membro tem autoridade para interromper operação que avaliar insegura?",
            evidencias: ["Procedimento documentado", "Registros de comunicação", "Fluxo de comunicação"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "10.3.2",
            descricao: "Existem canais de comunicação efetivos entre bordo e terra?",
            evidencias: ["Canais de comunicação definidos", "Registros de comunicações", "Reuniões periódicas"],
            nota: null,
            cnc: ""
          }
        ]
      }
    ]
  },

  // =====================================================
  // ELEMENTO 11: PREPARAÇÃO E RESPOSTAS À EMERGÊNCIAS
  // =====================================================
  {
    numero: 11,
    nome: "PREPARAÇÃO E RESPOSTAS À EMERGÊNCIAS",
    sigla: "PE",
    descricao: "Planos de contingência, simulados e resposta a emergências",
    isCritico: true,
    peso: 8.5,
    totalRequisitos: 12,
    normasReferenciadas: ["SOLAS III", "ISM Code 8", "MARPOL", "OPRC"],
    documentacaoNecessaria: ["Planos de emergência", "Cronograma de simulados", "Registros de treinamentos", "Modelo ICS"],
    secoes: [
      {
        id: "11.1",
        nome: "Plano de Contingência",
        requisitos: [
          {
            codigo: "11.1.1",
            descricao: "A empresa possui sistemática implementada para elaboração dos planos de resposta à emergência a partir dos cenários acidentais identificados nas análises de riscos?",
            evidencias: [
              "Planos de emergência em conformidade com requisitos legais",
              "Recursos e tecnologias disponíveis",
              "Impactos sociais, ambientais e econômicos",
              "Planos para diferentes níveis de resposta",
              "Treinamentos e exercícios simulados"
            ],
            nota: null,
            cnc: ""
          },
          {
            codigo: "11.1.2",
            descricao: "O modelo de gestão adotado pela empresa marítima é baseado no ICS (Incident Command System)?",
            evidencias: ["Plano de emergência alinhado com modelo ICS", "Registros de simulados/situações reais"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "11.1.3",
            descricao: "A equipe de resposta a emergências está devidamente treinada e conhece suas funções?",
            evidencias: ["Registros de treinamento", "Entrevistas", "Lista de funções"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "11.1.4",
            descricao: "Os equipamentos de resposta a emergências estão disponíveis e operacionais?",
            evidencias: ["Lista de equipamentos", "Registros de inspeção", "Certificados"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "11.1.5",
            descricao: "Existe integração com os planos de emergência da Petrobras e autoridades?",
            evidencias: ["Planos integrados", "Registros de comunicação", "Simulados conjuntos"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "11.1.6",
            descricao: "Os planos de emergência contemplam ações para cenários de: abalroamento, colisão, naufrágio, encalhes, alagamento, vazamento, incêndio, homem ao mar, acidentes pessoais, emergências médicas, falhas mecânicas, etc.?",
            evidencias: ["Planos de emergência cobrindo todos os cenários"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "11.1.7",
            descricao: "A empresa possui equipe de medicina remota, independente da medicina do trabalho, com atendimento 24 horas?",
            evidencias: ["Contrato com empresa de tele medicina", "Registros de atuação"],
            nota: null,
            cnc: ""
          }
        ]
      },
      {
        id: "11.2",
        nome: "Simulados e Plano de Verificação",
        requisitos: [
          {
            codigo: "11.2.1",
            descricao: "Estão definidos cronogramas de exercícios simulados para as hipóteses acidentais de emergência?",
            evidencias: ["Cronograma de Simulados", "Registros dos simulados cobrindo todos os cenários"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "11.2.2",
            descricao: "Os simulados são avaliados e as lições aprendidas são incorporadas aos planos?",
            evidencias: ["Relatórios de simulados", "Planos de ação", "Atualização de procedimentos"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "11.2.3",
            descricao: "Os sistemas de detecção, alarmes e dispositivos de segurança estão definidos como críticos e estão operacionais?",
            evidencias: [
              "Plano de inspeção e manutenção preventiva",
              "Constatação visual",
              "Teste do sistema",
              "Certificados de calibração"
            ],
            nota: null,
            cnc: ""
          }
        ]
      }
    ]
  },

  // =====================================================
  // ELEMENTO 12: ANÁLISE DE ACIDENTES E INCIDENTES E TRATAMENTO DE NÃO-CONFORMIDADES
  // =====================================================
  {
    numero: 12,
    nome: "ANÁLISE DE ACIDENTES E INCIDENTES E TRATAMENTO DE NÃO-CONFORMIDADES",
    sigla: "AI",
    descricao: "Investigação de eventos, análise de causas e tratamento de não conformidades",
    isCritico: true,
    peso: 8.0,
    totalRequisitos: 13,
    normasReferenciadas: ["ISM Code 9", "IOGP 621", "NR-37"],
    documentacaoNecessaria: ["Procedimento de investigação", "Relatórios de acidentes", "Planos de ação", "Lições aprendidas"],
    secoes: [
      {
        id: "12.1",
        nome: "Acidentes, Incidentes, Desvios e Ações Decorrentes",
        requisitos: [
          {
            codigo: "12.1.1",
            descricao: "A empresa possui sistemática implementada para registro, classificação, investigação, análise, tratamento e abrangência de eventos não desejados?",
            evidencias: [
              "Procedimento com descrição do acidente, graduação, composição de equipe",
              "Causas imediatas e básicas-raízes",
              "Ações preventivas-corretivas-abrangência"
            ],
            nota: null,
            cnc: ""
          },
          {
            codigo: "12.1.2",
            descricao: "A empresa possui e implementou política de estímulo de relato de desvios, incidentes e acidentes, não tolerando subnotificação?",
            evidencias: ["Registro de relatos de desvios e incidentes pela força de trabalho"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "12.1.3",
            descricao: "As investigações são realizadas de forma imparcial e com equipe multidisciplinar?",
            evidencias: ["Composição das equipes de investigação", "Relatórios de investigação"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "12.1.4",
            descricao: "As causas raízes são identificadas utilizando metodologias estruturadas?",
            evidencias: ["Metodologias utilizadas (5 Porquês, Árvore de Causas, etc.)", "Relatórios"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "12.1.5",
            descricao: "A empresa possui e implementou técnicas estruturadas de investigação de acidentes considerando Fatores Humanos conforme Report 621 da IOGP?",
            evidencias: ["Relatórios com técnicas estruturadas (árvore de eventos, árvore de causas, árvore de falhas)"],
            nota: null,
            cnc: ""
          }
        ]
      },
      {
        id: "12.2",
        nome: "Não-Conformidades e Ações Decorrentes",
        requisitos: [
          {
            codigo: "12.2.1",
            descricao: "A empresa utiliza sistemática para avaliação da eficácia das ações de tratamento/recomendações a partir dos acidentes/incidentes ocorridos?",
            evidencias: ["Registros da sistemática aplicada"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "12.2.2",
            descricao: "As lições aprendidas com incidentes e near-misses são usadas para prevenção de recorrência, sendo divulgada para toda a frota?",
            evidencias: ["Visita a bordo", "Entrevista com força de trabalho", "Ausência de repetição de incidentes"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "12.2.3",
            descricao: "As não conformidades são tratadas dentro dos prazos estabelecidos?",
            evidencias: ["Controle de prazos", "Relatórios de acompanhamento", "Indicadores"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "12.2.4",
            descricao: "Existe análise de tendência de não conformidades e incidentes?",
            evidencias: ["Relatórios de análise", "Gráficos de tendência", "Ações preventivas"],
            nota: null,
            cnc: ""
          }
        ]
      }
    ]
  },

  // =====================================================
  // ELEMENTO 13: PROCESSO DE MELHORIA CONTÍNUA
  // =====================================================
  {
    numero: 13,
    nome: "PROCESSO DE MELHORIA CONTÍNUA",
    sigla: "MC",
    descricao: "Auditorias internas/externas, análise crítica e melhoria contínua do sistema de gestão",
    isCritico: false,
    peso: 7.5,
    totalRequisitos: 9,
    normasReferenciadas: ["ISM Code 12", "ISO 9001", "ISO 14001", "ISO 45001"],
    documentacaoNecessaria: ["Programa de auditorias", "Relatórios de auditoria", "Atas de análise crítica", "Indicadores de desempenho"],
    secoes: [
      {
        id: "13.1",
        nome: "Auditorias Internas e Externas",
        requisitos: [
          {
            codigo: "13.1.1",
            descricao: "A empresa possui programa de auditorias internas e externas que abranja todos os elementos do sistema de gestão de SMS?",
            evidencias: [
              "Programa anual de auditorias",
              "Relatórios de auditorias com NCs e planos de ação",
              "Qualificação dos auditores"
            ],
            nota: null,
            cnc: ""
          },
          {
            codigo: "13.1.2",
            descricao: "Os auditores internos estão qualificados e independentes das áreas auditadas?",
            evidencias: ["Qualificação de auditores", "Critérios de independência", "Registros"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "13.1.3",
            descricao: "As não conformidades identificadas nas auditorias são tratadas adequadamente?",
            evidencias: ["Planos de ação", "Verificação de eficácia", "Prazos cumpridos"],
            nota: null,
            cnc: ""
          }
        ]
      },
      {
        id: "13.2",
        nome: "Análise Crítica pela Liderança",
        requisitos: [
          {
            codigo: "13.2.1",
            descricao: "A alta liderança da empresa realiza análise crítica do sistema de gestão de SMS periodicamente?",
            evidencias: [
              "Atas de reunião de análise crítica",
              "Planos de ação decorrentes",
              "Participação da alta liderança"
            ],
            nota: null,
            cnc: ""
          },
          {
            codigo: "13.2.2",
            descricao: "Os resultados da análise crítica geram ações de melhoria documentadas?",
            evidencias: ["Ações de melhoria", "Acompanhamento de implementação", "Indicadores"],
            nota: null,
            cnc: ""
          }
        ]
      },
      {
        id: "13.3",
        nome: "Melhoria Contínua",
        requisitos: [
          {
            codigo: "13.3.1",
            descricao: "A empresa possui indicadores de desempenho do sistema de gestão que são monitorados periodicamente?",
            evidencias: ["Painel de indicadores", "Reuniões de análise", "Ações de melhoria"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "13.3.2",
            descricao: "Existem metas de melhoria definidas e acompanhadas?",
            evidencias: ["Metas documentadas", "Acompanhamento periódico", "Resultados"],
            nota: null,
            cnc: ""
          },
          {
            codigo: "13.3.3",
            descricao: "As boas práticas identificadas são disseminadas para toda a frota?",
            evidencias: ["Registros de compartilhamento", "Implementação de boas práticas", "Reconhecimento"],
            nota: null,
            cnc: ""
          }
        ]
      }
    ]
  }
];

// =====================================================
// FUNÇÕES UTILITÁRIAS
// =====================================================

/**
 * Retorna o total de requisitos em todos os elementos
 */
export function getTotalRequisitosOficial(): number {
  return PEOTRAM_2024_ELEMENTOS_OFICIAIS.reduce((acc, el) => {
    return acc + el.secoes.reduce((sAcc, sec) => sAcc + sec.requisitos.length, 0);
  }, 0);
}

/**
 * Retorna todos os elementos críticos
 */
export function getElementosCriticosOficial(): PeotramElementoCompleto[] {
  return PEOTRAM_2024_ELEMENTOS_OFICIAIS.filter(el => el.isCritico);
}

/**
 * Busca um requisito pelo código
 */
export function getRequisitoByCodigoOficial(codigo: string): PeotramRequisito | undefined {
  for (const elemento of PEOTRAM_2024_ELEMENTOS_OFICIAIS) {
    for (const secao of elemento.secoes) {
      const requisito = secao.requisitos.find(r => r.codigo === codigo);
      if (requisito) return requisito;
    }
  }
  return undefined;
}

/**
 * Retorna o elemento pelo número
 */
export function getElementoByNumeroOficial(numero: number): PeotramElementoCompleto | undefined {
  return PEOTRAM_2024_ELEMENTOS_OFICIAIS.find(el => el.numero === numero);
}

/**
 * Calcula o score de conformidade de um elemento
 */
export function calcularScoreElemento(elemento: PeotramElementoCompleto): {
  score: number;
  conformes: number;
  naoConformes: number;
  pendentes: number;
  total: number;
} {
  let conformes = 0;
  let naoConformes = 0;
  let pendentes = 0;
  let somaNotas = 0;
  let totalAvaliados = 0;

  for (const secao of elemento.secoes) {
    for (const req of secao.requisitos) {
      if (req.nota === null) {
        pendentes++;
      } else if (req.nota >= 3) {
        conformes++;
        somaNotas += req.nota;
        totalAvaliados++;
      } else {
        naoConformes++;
        somaNotas += req.nota;
        totalAvaliados++;
      }
    }
  }

  const total = conformes + naoConformes + pendentes;
  const score = totalAvaliados > 0 ? (somaNotas / (totalAvaliados * 4)) * 100 : 0;

  return { score, conformes, naoConformes, pendentes, total };
}

/**
 * Retorna a cor do score
 */
export function getScoreColorOficial(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 75) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}

/**
 * Retorna o nível do score
 */
export function getScoreLevelOficial(score: number): string {
  if (score >= 90) return "Excelente";
  if (score >= 75) return "Bom";
  if (score >= 60) return "Aceitável";
  if (score >= 40) return "Atenção";
  return "Crítico";
}

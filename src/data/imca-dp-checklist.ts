/**
 * IMCA DP Audit Checklist - 149 Items
 * Based on IMCA M103, M117, M166, M182, M190, M220 and IMO MSC.1/Circ.1580
 */

export interface DPChecklistItem {
  id: number;
  category: string;
  categoryCode: string;
  question: string;
  isImperative: boolean;
  evidence: string;
  standards: string[];
  applicableDPClass: ("DP1" | "DP2" | "DP3")[];
}

export interface DPChecklistCategory {
  code: string;
  name: string;
  description: string;
  icon: string;
  items: DPChecklistItem[];
}

export const DP_CHECKLIST_ITEMS: DPChecklistItem[] = [
  // ASOG/CAMO - Items 1-25
  {
    id: 1,
    category: "ASOG/CAMO",
    categoryCode: "ASOG",
    question: "A embarcação possui ASOG de acordo com o estabelecido no IMCA M220?",
    isImperative: true,
    evidence: "Verificação do ASOG e realizar GAP Analysis para checar conformidade com IMCA M220 e Manual de Garantia DP",
    standards: ["IMCA M220", "IMO MSC.1/Circ.1580"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 2,
    category: "ASOG/CAMO",
    categoryCode: "ASOG",
    question: "O CAMO/ASOG está sendo auditado rotineiramente pela tripulação e encontra-se em sua última revisão?",
    isImperative: true,
    evidence: "Verificação do CAMO/ASOG - data de revisão e registros de auditoria interna",
    standards: ["IMCA M220"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 3,
    category: "ASOG/CAMO",
    categoryCode: "ASOG",
    question: "Os limites operacionais estabelecidos nos ASOG garantem a redundância da embarcação após a ocorrência do WCF definido no FMEA?",
    isImperative: true,
    evidence: "Avaliação do ASOG - Verificar se os limites operacionais estão estabelecidos considerando o WCF e o FMEA",
    standards: ["IMCA M220", "IMCA M166"],
    applicableDPClass: ["DP2", "DP3"]
  },
  {
    id: 4,
    category: "ASOG/CAMO",
    categoryCode: "ASOG",
    question: "As pessoas chave de DP foram treinadas e tem total conhecimento do ASOG?",
    isImperative: true,
    evidence: "Verificação do certificado de treinamento de ASOG e Assessment/Avaliação escrita e/ou oral",
    standards: ["IMCA M117", "IMCA M220"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 5,
    category: "ASOG/CAMO",
    categoryCode: "ASOG",
    question: "As decisões relacionadas à continuidade da operação são tomadas de forma independente de questões comerciais?",
    isImperative: false,
    evidence: "Padrão de aplicação ASOG deve conter essa premissa documentada",
    standards: ["IMCA M220", "IMO MSC.1/Circ.1580"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 6,
    category: "ASOG/CAMO",
    categoryCode: "ASOG",
    question: "O fluxo para tomada de decisão baseada em risco (status azul/amarelo do ASOG) envolve a comunicação entre o passadiço e a operação?",
    isImperative: false,
    evidence: "Fluxograma de tomada de decisão e plano de resposta a emergência",
    standards: ["IMCA M220", "IMCA M205"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 7,
    category: "ASOG/CAMO",
    categoryCode: "ASOG",
    question: "Os limites operacionais são conhecidos pelos envolvidos na operação?",
    isImperative: false,
    evidence: "Evidência de comunicação via DDS, lista de presença ou similar",
    standards: ["IMCA M220"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 8,
    category: "ASOG/CAMO",
    categoryCode: "ASOG",
    question: "É realizado briefing pré operacional com participação do passadiço, operação e máquinas contemplando cenários de emergência?",
    isImperative: false,
    evidence: "Lista de presença dos participantes do briefing",
    standards: ["IMCA M182", "IMCA M220"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 9,
    category: "ASOG/CAMO",
    categoryCode: "ASOG",
    question: "Existe sistemática para realização de kickoff meeting para SIMOPS conforme IMCA M203?",
    isImperative: true,
    evidence: "Ata do kickoff meeting e avaliação do padrão SIMOPS",
    standards: ["IMCA M203", "IMCA M220"],
    applicableDPClass: ["DP2", "DP3"]
  },
  {
    id: 10,
    category: "ASOG/CAMO",
    categoryCode: "ASOG",
    question: "Todas as partes envolvidas participam das análises de riscos?",
    isImperative: true,
    evidence: "Lista de participantes nas análises de risco e MOC",
    standards: ["IMCA M220"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 11,
    category: "ASOG/CAMO",
    categoryCode: "ASOG",
    question: "O início das operações está adequado às janelas de previsão meteorológica?",
    isImperative: false,
    evidence: "Verificar limites do procedimento executivo x previsão ambiental x limites contratuais",
    standards: ["IMCA M220", "IMCA M182"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 12,
    category: "ASOG/CAMO",
    categoryCode: "ASOG",
    question: "A empresa possui sistemática para elaboração e cumprimento do ASOG?",
    isImperative: false,
    evidence: "Avaliação do documento e verificação da execução a bordo",
    standards: ["IMCA M220"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 13,
    category: "ASOG/CAMO",
    categoryCode: "ASOG",
    question: "Os sistemas críticos que exigem configuração redundante estão operacionais?",
    isImperative: true,
    evidence: "Checklist de equipamentos críticos, prints de tela IAS, fotos ou vídeos",
    standards: ["IMCA M220", "IMCA M166"],
    applicableDPClass: ["DP2", "DP3"]
  },
  {
    id: 14,
    category: "ASOG/CAMO",
    categoryCode: "CAMO",
    question: "A embarcação possui CAMO de acordo com o estabelecido no IMCA M220?",
    isImperative: true,
    evidence: "Verificação do CAMO e GAP Analysis com IMCA M220 e Manual de Garantia DP",
    standards: ["IMCA M220"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 15,
    category: "ASOG/CAMO",
    categoryCode: "CAMO",
    question: "As configurações do CAMO garantem redundância após WCF definido no FMEA?",
    isImperative: true,
    evidence: "Avaliação do CAMO considerando 'safest mode of operation' conforme FMEA",
    standards: ["IMCA M220", "IMCA M166"],
    applicableDPClass: ["DP2", "DP3"]
  },
  {
    id: 16,
    category: "ASOG/CAMO",
    categoryCode: "CAMO",
    question: "A tripulação foi treinada e tem total conhecimento do CAMO?",
    isImperative: true,
    evidence: "Certificado de treinamento CAMO e Assessment escrito/oral",
    standards: ["IMCA M117", "IMCA M220"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 17,
    category: "ASOG/CAMO",
    categoryCode: "CAMO",
    question: "Decisões de início de operação são tomadas independentemente de questões comerciais?",
    isImperative: true,
    evidence: "Padrão de aplicação CAMO com premissa documentada",
    standards: ["IMCA M220"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 18,
    category: "ASOG/CAMO",
    categoryCode: "CAMO",
    question: "São previstos testes periódicos no CAMO conforme IMCA M220?",
    isImperative: false,
    evidence: "Avaliação do CAMO conforme IMCA M220 e Manual de Garantia DP",
    standards: ["IMCA M220"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 19,
    category: "ASOG/CAMO",
    categoryCode: "CAMO",
    question: "Os testes do CAMO estão cadastrados no software de gestão de manutenção?",
    isImperative: false,
    evidence: "Verificar plano de manutenção com tarefas e datas para o ano corrente",
    standards: ["IMCA M220", "IMCA M190"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 20,
    category: "ASOG/CAMO",
    categoryCode: "CAMO",
    question: "O fluxo de tomada de decisão (status azul CAMO) envolve avaliação entre passadiço, máquinas, onshore e cliente?",
    isImperative: false,
    evidence: "Apresentação do padrão e participação do DP Authority",
    standards: ["IMCA M220"],
    applicableDPClass: ["DP2", "DP3"]
  },
  {
    id: 21,
    category: "ASOG/CAMO",
    categoryCode: "CAMO",
    question: "A embarcação possui checklist de DP conforme orientações contratuais?",
    isImperative: false,
    evidence: "Verificar checklist no padrão IMCA MSF 182 e contratante",
    standards: ["IMCA M182", "IMCA M220"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 22,
    category: "ASOG/CAMO",
    categoryCode: "CAMO",
    question: "Existe sistemática de controle de registros de cumprimento do checklist?",
    isImperative: false,
    evidence: "Apresentação do padrão de controle de registros",
    standards: ["IMCA M220"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 23,
    category: "ASOG/CAMO",
    categoryCode: "CAMO",
    question: "O CAMO indica nomenclatura e posição dos disjuntores/válvulas de acordo com FMEA?",
    isImperative: false,
    evidence: "Verificar conformidade da nomenclatura com FMEA",
    standards: ["IMCA M220", "IMCA M166"],
    applicableDPClass: ["DP2", "DP3"]
  },
  {
    id: 24,
    category: "ASOG/CAMO",
    categoryCode: "CAMO",
    question: "Existe auditoria de verificação do cumprimento do checklist CAMO?",
    isImperative: false,
    evidence: "Avaliação do programa de auditoria e execução a bordo",
    standards: ["IMCA M220"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 25,
    category: "ASOG/CAMO",
    categoryCode: "CAMO",
    question: "Existe auditoria de verificação do cumprimento do checklist de DP?",
    isImperative: false,
    evidence: "Avaliação do programa de auditoria e execução a bordo",
    standards: ["IMCA M220"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },

  // DOCUMENTAÇÃO - Items 26-35
  {
    id: 26,
    category: "Documentação e Controle",
    categoryCode: "DOC",
    question: "Está sistematizado o controle de revisões e versões de documentos?",
    isImperative: false,
    evidence: "Verificar FMEA e manual DP atualizados, sistema de controle de revisões",
    standards: ["IMCA M109", "IMCA M166"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 27,
    category: "Documentação e Controle",
    categoryCode: "DOC",
    question: "O FMEA e FMEA proving trials são atualizados a cada 5 anos e carimbados pela classe?",
    isImperative: true,
    evidence: "Procedimento de atualização de FMEA e FMEA Proving Trials",
    standards: ["IMCA M166", "IMO MSC.1/Circ.1580"],
    applicableDPClass: ["DP2", "DP3"]
  },
  {
    id: 28,
    category: "Documentação e Controle",
    categoryCode: "DOC",
    question: "A passagem de serviço está sistematizada e documentada?",
    isImperative: true,
    evidence: "Livro de passagem de serviço de máquinas e passadiço",
    standards: ["IMCA M117", "IMCA M182"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 29,
    category: "Documentação e Controle",
    categoryCode: "DOC",
    question: "É realizado monitoramento online dos sistemas críticos pelo fabricante?",
    isImperative: false,
    evidence: "Verificar sistema de monitoramento e condições operacionais",
    standards: ["IMCA M206"],
    applicableDPClass: ["DP2", "DP3"]
  },
  {
    id: 30,
    category: "Documentação e Controle",
    categoryCode: "DOC",
    question: "São realizadas análises preditivas dos sistemas críticos (óleo e vibração)?",
    isImperative: false,
    evidence: "Verificar análises, datas, frequência e atendimento a recomendações",
    standards: ["IMCA M190"],
    applicableDPClass: ["DP2", "DP3"]
  },
  {
    id: 31,
    category: "Documentação e Controle",
    categoryCode: "DOC",
    question: "O fluxo para failure reports está claramente definido no padrão de gestão?",
    isImperative: false,
    evidence: "Verificar fluxo de failure report e padrão de gestão de manutenção",
    standards: ["IMCA M109"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 32,
    category: "Documentação e Controle",
    categoryCode: "DOC",
    question: "Decisões sobre parâmetros operacionais são tomadas independentemente da operação?",
    isImperative: false,
    evidence: "Documento de Diretrizes Operacionais",
    standards: ["IMCA M220"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 33,
    category: "Documentação e Controle",
    categoryCode: "DOC",
    question: "Os envelopes operacionais são conhecidos pelos envolvidos na operação?",
    isImperative: false,
    evidence: "Ata de reunião pré operacional / implementação do ASOG",
    standards: ["IMCA M220"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 34,
    category: "Documentação e Controle",
    categoryCode: "DOC",
    question: "São realizados testes periódicos de equipamentos críticos com avaliação de performance?",
    isImperative: false,
    evidence: "Testes CAMO com frequência, resultados e recomendações",
    standards: ["IMCA M190", "IMCA M220"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 35,
    category: "Documentação e Controle",
    categoryCode: "DOC",
    question: "O monitoramento de parâmetros operacionais está alinhado com especificações técnicas?",
    isImperative: true,
    evidence: "Checagem dos parâmetros x manuais",
    standards: ["IMCA M206"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },

  // MANUTENÇÃO - Items 36-62
  {
    id: 36,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "O fluxo para failure reports de alarmes e falhas está claramente definido?",
    isImperative: false,
    evidence: "Verificar fluxo para failure reports",
    standards: ["IMCA M109"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 37,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "As rotinas de manutenção são executadas, registradas e estruturadas em sistema informatizado?",
    isImperative: true,
    evidence: "Banco de dados com plano de manutenção e verificação de tarefas vencidas",
    standards: ["IMCA M190"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 38,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "Existe política de sobressalentes?",
    isImperative: false,
    evidence: "Software de gestão com controle de spare parts e estoque mínimo",
    standards: ["IMCA M190"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 39,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "É realizado o cumprimento das premissas do plano de manutenção/inspeção?",
    isImperative: false,
    evidence: "Verificar cumprimento do estoque mínimo",
    standards: ["IMCA M190"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 40,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "Os critérios de priorização de manutenção estão definidos?",
    isImperative: false,
    evidence: "Verificar jobs postergados e critérios de priorização",
    standards: ["IMCA M190"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 41,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "Os procedimentos de manutenção são cumpridos conforme manuais técnicos?",
    isImperative: false,
    evidence: "Verificar procedimentos cadastrados para execução de jobs",
    standards: ["IMCA M190"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 42,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "Existe lista de equipamentos críticos?",
    isImperative: false,
    evidence: "Lista de elementos/sistemas críticos",
    standards: ["IMCA M166", "IMCA M190"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 43,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "Todos os equipamentos críticos são objeto de rotina de manutenção preventiva?",
    isImperative: false,
    evidence: "Auditoria de plano de manutenção",
    standards: ["IMCA M190"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 44,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "Existe sistemática de atendimento a atualizações de segurança do fabricante?",
    isImperative: false,
    evidence: "Documento com fluxo de tratativa de atualizações e interação com fabricante",
    standards: ["IMCA M190", "IMCA M206"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 45,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "O plano de manutenção preventiva dos equipamentos críticos está atualizado?",
    isImperative: false,
    evidence: "Avaliar plano de manutenção",
    standards: ["IMCA M190"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 46,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "As rotinas de manutenção preventiva são executadas com periodicidade adequada?",
    isImperative: false,
    evidence: "Avaliar plano de manutenção e registros",
    standards: ["IMCA M190"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 47,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "São realizadas manutenções preditivas dos sistemas críticos?",
    isImperative: false,
    evidence: "Avaliar plano de manutenção preditiva",
    standards: ["IMCA M190"],
    applicableDPClass: ["DP2", "DP3"]
  },
  {
    id: 48,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "As premissas do plano de manutenção/inspeção estão sendo atendidas?",
    isImperative: false,
    evidence: "Avaliar plano de manutenção",
    standards: ["IMCA M190"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 49,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "Existem critérios definidos para identificação de equipamentos críticos?",
    isImperative: false,
    evidence: "Verificar critérios para sistemas DP e auxiliares",
    standards: ["IMCA M166", "IMCA M190"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 50,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "As rotinas de manutenção estão contempladas em um Programa de Manutenção?",
    isImperative: true,
    evidence: "Avaliar plano de manutenção estruturado",
    standards: ["IMCA M190"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 51,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "O dimensionamento de recursos está adequado para os planos de manutenção?",
    isImperative: false,
    evidence: "Verificar itens sistemicamente atrasados",
    standards: ["IMCA M190"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 52,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "Existem recursos disponíveis para atendimento aos planos?",
    isImperative: false,
    evidence: "Verificar itens sistemicamente atrasados",
    standards: ["IMCA M190"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 53,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "O desempenho do processo de manutenção é eficazmente monitorado?",
    isImperative: false,
    evidence: "Apresentação dos KPIs de inspeção",
    standards: ["IMCA M190"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 54,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "O processo de inspeção é eficazmente monitorado?",
    isImperative: false,
    evidence: "Apresentação dos KPIs de manutenção",
    standards: ["IMCA M190"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 55,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "Os desvios identificados em manutenção são eficazmente tratados?",
    isImperative: false,
    evidence: "Atendimento às pendências levantadas nas inspeções",
    standards: ["IMCA M190"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 56,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "São realizados testes de performance para identificação de falhas ocultas?",
    isImperative: false,
    evidence: "Avaliação dos testes CAMO e relatório de realização",
    standards: ["IMCA M190", "IMCA M220"],
    applicableDPClass: ["DP2", "DP3"]
  },
  {
    id: 57,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "São realizados estudos FMECA/FMEA para gestão de integridade?",
    isImperative: true,
    evidence: "Apresentação FMEA/FMECA",
    standards: ["IMCA M166"],
    applicableDPClass: ["DP2", "DP3"]
  },
  {
    id: 58,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "São elaborados estudos específicos de confiabilidade?",
    isImperative: false,
    evidence: "Avaliação das justificativas de postergação baseada em confiabilidade",
    standards: ["IMCA M166"],
    applicableDPClass: ["DP2", "DP3"]
  },
  {
    id: 59,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "A sistemática de reporte de desvios é eficaz?",
    isImperative: false,
    evidence: "Avaliação dos failure reports",
    standards: ["IMCA M109"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 60,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "A empresa possui indicadores para planos de inspeção e manutenção?",
    isImperative: false,
    evidence: "Apresentação dos KPIs",
    standards: ["IMCA M190"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 61,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "Existe auditoria de verificação do cumprimento dos planos de manutenção?",
    isImperative: false,
    evidence: "Apresentação dos indicadores de auditorias da liderança",
    standards: ["IMCA M190"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 62,
    category: "Manutenção e Integridade",
    categoryCode: "MNT",
    question: "Decisões de manutenção são tomadas independentemente da operação?",
    isImperative: false,
    evidence: "Verificar quadro de pessoal, experiência, competência formal, plano de manutenção",
    standards: ["IMCA M190"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },

  // INFRAESTRUTURA - Items 63-67
  {
    id: 63,
    category: "Infraestrutura e Tecnologia",
    categoryCode: "INF",
    question: "A sinalização está adequada para painéis e comandos de emergência?",
    isImperative: true,
    evidence: "Verificação local das condições de sinalização",
    standards: ["IMO MSC.1/Circ.1580"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 64,
    category: "Infraestrutura e Tecnologia",
    categoryCode: "INF",
    question: "O passadiço fornece condições necessárias para realização do trabalho?",
    isImperative: false,
    evidence: "Verificação de itens mínimos de ergonomia e tecnologia",
    standards: ["IMCA M103", "IMO MSC.1/Circ.1580"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 65,
    category: "Infraestrutura e Tecnologia",
    categoryCode: "INF",
    question: "Existe sistemática de divulgação de alertas técnicos DP da IMCA?",
    isImperative: false,
    evidence: "Fluxo de papéis e responsabilidades, listas de presença, verificação de implementação",
    standards: ["IMCA M109"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 66,
    category: "Infraestrutura e Tecnologia",
    categoryCode: "INF",
    question: "O sistema de gestão prevê acompanhamento da implementação de alertas técnicos?",
    isImperative: false,
    evidence: "Sistemática de verificação da aderência aos alertas pela liderança",
    standards: ["IMCA M109"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 67,
    category: "Infraestrutura e Tecnologia",
    categoryCode: "INF",
    question: "Existe comprometimento da liderança na implementação das Regras de Ouro de DP?",
    isImperative: false,
    evidence: "Ata de reunião ou certificados de treinamento",
    standards: ["IMCA M117"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },

  // COMPETÊNCIA - Items 68-83
  {
    id: 68,
    category: "Competência e Pessoal DP",
    categoryCode: "COMP",
    question: "O sistema DP possui automação adequada para operar de forma segura?",
    isImperative: true,
    evidence: "Auditoria de aceitação + auditorias de rotina",
    standards: ["IMO MSC.1/Circ.1580", "IMCA M103"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 69,
    category: "Competência e Pessoal DP",
    categoryCode: "COMP",
    question: "A embarcação cumpre com os requisitos do IMCA M117?",
    isImperative: true,
    evidence: "Quadro DP Key Personnel conforme NORMAM-13/Contrato (IMCA M117)",
    standards: ["IMCA M117", "NORMAM-13"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 70,
    category: "Competência e Pessoal DP",
    categoryCode: "COMP",
    question: "A Autoridade DP participa do processo de tomada de decisão e tem autonomia para troca de tripulação?",
    isImperative: true,
    evidence: "Padrão de gestão de pessoal chave DP, quadro de nomeação, Job Description",
    standards: ["IMCA M117"],
    applicableDPClass: ["DP2", "DP3"]
  },
  {
    id: 71,
    category: "Competência e Pessoal DP",
    categoryCode: "COMP",
    question: "A Autoridade DP possui cargo dedicado para garantia de DP?",
    isImperative: false,
    evidence: "Padrão de gestão de pessoal chave DP e Job Description",
    standards: ["IMCA M117"],
    applicableDPClass: ["DP2", "DP3"]
  },
  {
    id: 72,
    category: "Competência e Pessoal DP",
    categoryCode: "COMP",
    question: "É realizada interrupção de atividades críticas sem contingente mínimo?",
    isImperative: true,
    evidence: "Padrão de gestão de pessoal chave DP",
    standards: ["IMCA M117"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 73,
    category: "Competência e Pessoal DP",
    categoryCode: "COMP",
    question: "Os recursos humanos disponíveis correspondem ao dimensionamento atualizado?",
    isImperative: true,
    evidence: "Quadro DP Key Personnel conforme NORMAM-13/Contrato",
    standards: ["IMCA M117", "NORMAM-13"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 74,
    category: "Competência e Pessoal DP",
    categoryCode: "COMP",
    question: "É verificado o atendimento a requisitos legais/contratuais/de certificadoras?",
    isImperative: false,
    evidence: "Resultado das auditorias",
    standards: ["IMCA M117", "IMO STCW"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 75,
    category: "Competência e Pessoal DP",
    categoryCode: "COMP",
    question: "As atividades críticas estão mapeadas?",
    isImperative: true,
    evidence: "CAMO/ASOG para cada atividade DP da embarcação",
    standards: ["IMCA M220"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 76,
    category: "Competência e Pessoal DP",
    categoryCode: "COMP",
    question: "A empresa atende requisitos IMCA M117 cap. VII, IX e X para competência e treinamento?",
    isImperative: true,
    evidence: "Padrão de gestão + auditoria local de treinamentos válidos",
    standards: ["IMCA M117"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 77,
    category: "Competência e Pessoal DP",
    categoryCode: "COMP",
    question: "A empresa atende IMCA M117 cap. VIII, Apêndices 5 e 6 para experiência e simulados?",
    isImperative: true,
    evidence: "Padrão de gestão + auditoria local de treinamentos",
    standards: ["IMCA M117"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 78,
    category: "Competência e Pessoal DP",
    categoryCode: "COMP",
    question: "O programa de treinamentos prevê retroalimentação e tratamento de gaps?",
    isImperative: false,
    evidence: "Padrão de gestão - avaliação, identificação e tratamento de gaps",
    standards: ["IMCA M117"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 79,
    category: "Competência e Pessoal DP",
    categoryCode: "COMP",
    question: "Existe programa de auditoria de terceira parte pela liderança técnica?",
    isImperative: false,
    evidence: "Padrão de gestão e auditorias anteriores de DP",
    standards: ["IMCA M117"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 80,
    category: "Competência e Pessoal DP",
    categoryCode: "COMP",
    question: "Os oficiais de náutica possuem treinamento no sistema DP específico?",
    isImperative: true,
    evidence: "Certificados de treinamento no sistema específico (ex: K-POS Familiarization)",
    standards: ["IMCA M117", "IMO MSC/Circ.738"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 81,
    category: "Competência e Pessoal DP",
    categoryCode: "COMP",
    question: "Os oficiais de máquinas possuem treinamento no PMS específico?",
    isImperative: true,
    evidence: "Certificados de treinamento PMS (ex: Kchief Step 1 e 2)",
    standards: ["IMCA M117"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 82,
    category: "Competência e Pessoal DP",
    categoryCode: "COMP",
    question: "Existe diretriz sobre obrigatoriedade de familiarização antes de tarefas?",
    isImperative: false,
    evidence: "Avaliação da tripulação, divulgação da diretriz, Regras de Ouro DP",
    standards: ["IMCA M117"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 83,
    category: "Competência e Pessoal DP",
    categoryCode: "COMP",
    question: "É realizado feedback do tratamento de desvios relatados?",
    isImperative: false,
    evidence: "Apresentação dos desvios, tratamentos e feedbacks",
    standards: ["IMCA M109"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },

  // MONITORAMENTO - Items 84-93
  {
    id: 84,
    category: "Monitoramento e Controle",
    categoryCode: "MON",
    question: "Há requisitos de monitoramento das operações?",
    isImperative: true,
    evidence: "CAMO/ASOG com padrão ou procedimento de monitoramento",
    standards: ["IMCA M220"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 85,
    category: "Monitoramento e Controle",
    categoryCode: "MON",
    question: "A embarcação possui registro de DP data log?",
    isImperative: false,
    evidence: "Apresentação do sistema de DP data log",
    standards: ["IMCA M109", "IMO MSC.1/Circ.1580"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 86,
    category: "Monitoramento e Controle",
    categoryCode: "MON",
    question: "A empresa realiza monitoramento remoto das operações?",
    isImperative: false,
    evidence: "Sistema de monitoramento com suporte à decisão",
    standards: ["IMCA M206"],
    applicableDPClass: ["DP2", "DP3"]
  },
  {
    id: 87,
    category: "Monitoramento e Controle",
    categoryCode: "MON",
    question: "Existe auditoria técnica do DP data log com foco em desvios operacionais?",
    isImperative: false,
    evidence: "Resultados das auditorias de alarmes e parâmetros",
    standards: ["IMCA M109"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 88,
    category: "Monitoramento e Controle",
    categoryCode: "MON",
    question: "Existe sistemática para tratamento de desvios do monitoramento remoto?",
    isImperative: false,
    evidence: "Desvios tratados e recomendações concluídas no prazo",
    standards: ["IMCA M109"],
    applicableDPClass: ["DP2", "DP3"]
  },
  {
    id: 89,
    category: "Monitoramento e Controle",
    categoryCode: "MON",
    question: "A embarcação possui tecnologia para monitoramento remoto do DP e PMS?",
    isImperative: false,
    evidence: "Verificação local x imagens recebidas (requisitos contratuais PMS)",
    standards: ["IMCA M206"],
    applicableDPClass: ["DP2", "DP3"]
  },
  {
    id: 90,
    category: "Monitoramento e Controle",
    categoryCode: "MON",
    question: "A abrangência de resultados de auditorias é realizada de forma eficaz?",
    isImperative: false,
    evidence: "Evidência de abrangência: reuniões, lista de presença",
    standards: ["IMCA M117"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 91,
    category: "Monitoramento e Controle",
    categoryCode: "MON",
    question: "Falhas em elementos críticos e incidentes de alto potencial são divulgados imediatamente?",
    isImperative: false,
    evidence: "Indicadores para eventos, registro e tratamento",
    standards: ["IMCA M109"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 92,
    category: "Monitoramento e Controle",
    categoryCode: "MON",
    question: "Há sistemática de abrangência de lições aprendidas com investigações?",
    isImperative: false,
    evidence: "Abrangência de lições aprendidas: reuniões, lista de presença",
    standards: ["IMCA M109"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 93,
    category: "Monitoramento e Controle",
    categoryCode: "MON",
    question: "As boas práticas e recomendações são retroalimentadas nos processos?",
    isImperative: false,
    evidence: "Atualização de processos e padrões a partir de boas práticas",
    standards: ["IMCA M109"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },

  // EMERGÊNCIA - Items 94-98
  {
    id: 94,
    category: "Resposta a Emergências",
    categoryCode: "EMG",
    question: "É realizada gestão de mudança para reestabelecimento da operação normal?",
    isImperative: true,
    evidence: "Procedimento de recuperação de falha - Regra de Ouro DP 6",
    standards: ["IMCA M220", "IMCA M117"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 95,
    category: "Resposta a Emergências",
    categoryCode: "EMG",
    question: "Os recursos e ações para responder a emergência estão formalizados em plano?",
    isImperative: true,
    evidence: "Plano de emergência em DP",
    standards: ["IMCA M117", "IMO MSC.1/Circ.1580"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 96,
    category: "Resposta a Emergências",
    categoryCode: "EMG",
    question: "São realizados simulados de emergência em DP?",
    isImperative: true,
    evidence: "Registro dos simulados",
    standards: ["IMCA M117"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 97,
    category: "Resposta a Emergências",
    categoryCode: "EMG",
    question: "A embarcação possui cenários de emergência DP conforme IMCA M117 Appendix?",
    isImperative: true,
    evidence: "Matriz de simulados de emergência em DP",
    standards: ["IMCA M117"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  },
  {
    id: 98,
    category: "Resposta a Emergências",
    categoryCode: "EMG",
    question: "Foram realizados simulados com práticas em cenários reais nos últimos 12 meses?",
    isImperative: true,
    evidence: "Matriz de simulados e registros",
    standards: ["IMCA M117"],
    applicableDPClass: ["DP1", "DP2", "DP3"]
  }
];

export const DP_CHECKLIST_CATEGORIES: DPChecklistCategory[] = [
  {
    code: "ASOG",
    name: "ASOG/CAMO",
    description: "Activity Specific Operating Guidelines e Critical Activity Mode of Operation",
    icon: "FileCheck",
    items: DP_CHECKLIST_ITEMS.filter(i => i.categoryCode === "ASOG" || i.categoryCode === "CAMO")
  },
  {
    code: "DOC",
    name: "Documentação e Controle",
    description: "Controle de documentos, FMEA, passagem de serviço e análises",
    icon: "FileText",
    items: DP_CHECKLIST_ITEMS.filter(i => i.categoryCode === "DOC")
  },
  {
    code: "MNT",
    name: "Manutenção e Integridade",
    description: "Planos de manutenção, sobressalentes, KPIs e integridade de ativos",
    icon: "Wrench",
    items: DP_CHECKLIST_ITEMS.filter(i => i.categoryCode === "MNT")
  },
  {
    code: "INF",
    name: "Infraestrutura e Tecnologia",
    description: "Sinalização, condições do passadiço, alertas técnicos",
    icon: "Monitor",
    items: DP_CHECKLIST_ITEMS.filter(i => i.categoryCode === "INF")
  },
  {
    code: "COMP",
    name: "Competência e Pessoal DP",
    description: "Autoridade DP, treinamentos, certificações IMCA M117",
    icon: "Users",
    items: DP_CHECKLIST_ITEMS.filter(i => i.categoryCode === "COMP")
  },
  {
    code: "MON",
    name: "Monitoramento e Controle",
    description: "DP Data Log, monitoramento remoto, lições aprendidas",
    icon: "Activity",
    items: DP_CHECKLIST_ITEMS.filter(i => i.categoryCode === "MON")
  },
  {
    code: "EMG",
    name: "Resposta a Emergências",
    description: "Planos de emergência, simulados, cenários IMCA M117",
    icon: "AlertTriangle",
    items: DP_CHECKLIST_ITEMS.filter(i => i.categoryCode === "EMG")
  }
];

export const IMCA_STANDARDS_REFERENCE = {
  "M103": { name: "Guidelines for Design and Operation of DP Vessels", year: 2019 },
  "M109": { name: "DP-Related Documentation", year: 2021 },
  "M117": { name: "Training and Experience of Key DP Personnel", year: 2022 },
  "M140": { name: "Specification for DP Capability Plots", year: 2020 },
  "M166": { name: "Guidance on FMEA", year: 2016 },
  "M182": { name: "Safe Operation of DP Offshore Supply Vessels", year: 2020 },
  "M190": { name: "DP Annual Trials Programmes", year: 2022 },
  "M203": { name: "Guidance on Simultaneous Operations", year: 2019 },
  "M205": { name: "Operational Communications", year: 2018 },
  "M206": { name: "Guide to DP Electrical Power and Control Systems", year: 2018 },
  "M220": { name: "Operational Activity Planning (ASOG/CAMO)", year: 2022 },
  "IMO MSC.1/Circ.1580": { name: "Guidelines for Vessels with DP Systems", year: 2017 },
  "IMO MSC/Circ.738": { name: "Training Guidelines for DP Operators", year: 1996 },
  "NORMAM-13": { name: "Normas da Autoridade Marítima - DP", year: 2023 },
  "IMO STCW": { name: "Manila Amendments - DP Guidance", year: 2010 }
};

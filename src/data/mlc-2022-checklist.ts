/**
 * MLC 2006 Checklist with 2022 Amendments
 * Based on ILO Maritime Labour Convention 2006 (as amended)
 * Complete checklist per Regulations 1.1 to 5.3
 */

export interface MLCCheckItem {
  id: string;
  code: string;
  regulation: string;
  standard: string;
  title: string;
  description: string;
  legalBasis: string;
  guidance: string;
  critical: boolean;
  inspectionPoints: string[];
  evidenceRequired: string[];
  deficiencyCode?: string;
}

export interface MLCRegulation {
  id: string;
  code: string;
  title: string;
  description: string;
  titleNumber: number;
  items: MLCCheckItem[];
}

export interface MLCTitle {
  id: string;
  number: number;
  title: string;
  description: string;
  regulations: MLCRegulation[];
}

export const MLC_2022_TITLES: MLCTitle[] = [
  {
    id: 'title1',
    number: 1,
    title: 'Requisitos Mínimos para Marítimos',
    description: 'Requisitos mínimos para que marítimos possam trabalhar em navios',
    regulations: [
      {
        id: 'reg1.1',
        code: '1.1',
        title: 'Idade Mínima',
        description: 'Idade mínima para trabalho a bordo',
        titleNumber: 1,
        items: [
          {
            id: '1.1.1',
            code: '1.1.1',
            regulation: 'Reg. 1.1',
            standard: 'A1.1.1',
            title: 'Idade mínima de 16 anos',
            description: 'Nenhuma pessoa com idade inferior a 16 anos pode ser empregada, contratada ou trabalhar a bordo',
            legalBasis: 'MLC 2006, Standard A1.1.1',
            guidance: 'Verificar documentos de identidade de todos os tripulantes. Menores de 18 anos têm restrições adicionais.',
            critical: true,
            inspectionPoints: [
              'Verificar documentos de identidade com data de nascimento',
              'Confirmar idade de todos os tripulantes',
              'Verificar se há menores de 18 anos em funções restritas'
            ],
            evidenceRequired: ['Passaportes ou documentos de identidade', 'Lista de tripulação com datas de nascimento']
          },
          {
            id: '1.1.2',
            code: '1.1.2',
            regulation: 'Reg. 1.1',
            standard: 'A1.1.2',
            title: 'Trabalho noturno para menores de 18',
            description: 'Proibição de trabalho noturno para marítimos menores de 18 anos',
            legalBasis: 'MLC 2006, Standard A1.1.2',
            guidance: 'Noite definida conforme legislação nacional, geralmente período de pelo menos 9 horas incluindo meia-noite.',
            critical: true,
            inspectionPoints: [
              'Verificar escalas de trabalho de menores de 18',
              'Confirmar que não há trabalho noturno para jovens'
            ],
            evidenceRequired: ['Registros de horas de trabalho', 'Escalas de serviço']
          },
          {
            id: '1.1.3',
            code: '1.1.3',
            regulation: 'Reg. 1.1',
            standard: 'A1.1.4',
            title: 'Trabalhos perigosos para menores de 18',
            description: 'Proibição de trabalhos perigosos ou insalubres para menores de 18 anos',
            legalBasis: 'MLC 2006, Standard A1.1.4',
            guidance: 'Inclui trabalho em espaços confinados, manuseio de cargas perigosas, operação de maquinário pesado.',
            critical: true,
            inspectionPoints: [
              'Verificar funções atribuídas a menores de 18',
              'Confirmar conformidade com lista de trabalhos proibidos'
            ],
            evidenceRequired: ['Descrição de funções', 'Avaliação de riscos']
          }
        ]
      },
      {
        id: 'reg1.2',
        code: '1.2',
        title: 'Certificado Médico',
        description: 'Certificados médicos para trabalho a bordo',
        titleNumber: 1,
        items: [
          {
            id: '1.2.1',
            code: '1.2.1',
            regulation: 'Reg. 1.2',
            standard: 'A1.2.2',
            title: 'Certificado médico válido',
            description: 'Todos os marítimos devem possuir certificado médico válido atestando aptidão',
            legalBasis: 'MLC 2006, Standard A1.2.2',
            guidance: 'Validade máxima de 2 anos (1 ano para menores de 18). Deve incluir testes de visão e audição.',
            critical: true,
            inspectionPoints: [
              'Verificar validade de todos os certificados médicos',
              'Confirmar que certificados são reconhecidos pelo Estado de Bandeira',
              'Verificar certificados de menores de 18 (validade 1 ano)'
            ],
            evidenceRequired: ['Certificados médicos originais', 'Tradução em inglês se necessário']
          },
          {
            id: '1.2.2',
            code: '1.2.2',
            regulation: 'Reg. 1.2',
            standard: 'A1.2.5',
            title: 'Exame de visão para navegação',
            description: 'Marítimos em funções de navegação devem ter exame de visão de cores',
            legalBasis: 'MLC 2006, Standard A1.2.5',
            guidance: 'Exame de visão de cores válido por até 6 anos.',
            critical: false,
            inspectionPoints: [
              'Verificar certificados de visão de cores',
              'Confirmar validade (máximo 6 anos)'
            ],
            evidenceRequired: ['Resultado de exame de visão de cores']
          },
          {
            id: '1.2.3',
            code: '1.2.3',
            regulation: 'Reg. 1.2',
            standard: 'A1.2.3',
            title: 'Médico qualificado',
            description: 'Certificado emitido por médico plenamente qualificado',
            legalBasis: 'MLC 2006, Standard A1.2.3',
            guidance: 'Médico deve ter conhecimento das condições de trabalho marítimo.',
            critical: true,
            inspectionPoints: [
              'Verificar credenciais do médico emissor',
              'Confirmar reconhecimento pelo Estado de Bandeira'
            ],
            evidenceRequired: ['Identificação do médico emissor', 'Registro profissional']
          }
        ]
      },
      {
        id: 'reg1.3',
        code: '1.3',
        title: 'Treinamento e Qualificações',
        description: 'Treinamento e certificação de competência',
        titleNumber: 1,
        items: [
          {
            id: '1.3.1',
            code: '1.3.1',
            regulation: 'Reg. 1.3',
            standard: 'A1.3.1',
            title: 'Certificados STCW válidos',
            description: 'Todos os marítimos devem possuir certificados de competência STCW válidos',
            legalBasis: 'MLC 2006, Standard A1.3.1; STCW Convention',
            guidance: 'Verificar validade, autenticidade e correspondência com função a bordo.',
            critical: true,
            inspectionPoints: [
              'Verificar certificados de competência de toda tripulação',
              'Confirmar validade e autenticidade',
              'Verificar correspondência com funções exercidas'
            ],
            evidenceRequired: ['Certificados STCW originais', 'Registros de treinamento', 'Endorsements do Estado de Bandeira']
          },
          {
            id: '1.3.2',
            code: '1.3.2',
            regulation: 'Reg. 1.3',
            standard: 'A1.3.2',
            title: 'Treinamento de segurança',
            description: 'Treinamento em segurança pessoal e responsabilidades antes de iniciar trabalho',
            legalBasis: 'MLC 2006, Standard A1.3.2',
            guidance: 'Familiarização com segurança do navio antes de assumir funções.',
            critical: true,
            inspectionPoints: [
              'Verificar registros de familiarização',
              'Confirmar treinamento de segurança básica'
            ],
            evidenceRequired: ['Registros de familiarização', 'Certificados de treinamento básico']
          }
        ]
      },
      {
        id: 'reg1.4',
        code: '1.4',
        title: 'Recrutamento e Colocação',
        description: 'Serviços de recrutamento e colocação de marítimos',
        titleNumber: 1,
        items: [
          {
            id: '1.4.1',
            code: '1.4.1',
            regulation: 'Reg. 1.4',
            standard: 'A1.4.5',
            title: 'Sem taxas de recrutamento',
            description: 'Marítimos não devem pagar taxas de recrutamento além de documentação',
            legalBasis: 'MLC 2006, Standard A1.4.5',
            guidance: 'Inclui proibição de taxas para obtenção de emprego. 2022 Amendment reforça proteção.',
            critical: true,
            inspectionPoints: [
              'Entrevistar marítimos sobre taxas pagas',
              'Verificar contratos com agências',
              'Confirmar conformidade com emenda 2022'
            ],
            evidenceRequired: ['Declaração de conformidade', 'Contrato com agência de recrutamento']
          },
          {
            id: '1.4.2',
            code: '1.4.2',
            regulation: 'Reg. 1.4',
            standard: 'A1.4.2',
            title: 'Agência certificada',
            description: 'Serviços de recrutamento operam conforme padrões MLC',
            legalBasis: 'MLC 2006, Standard A1.4.2',
            guidance: 'Agência deve ser licenciada/certificada pelo Estado apropriado.',
            critical: false,
            inspectionPoints: [
              'Verificar licença/certificação da agência',
              'Confirmar sistema de registro'
            ],
            evidenceRequired: ['Licença da agência', 'Certificação MLC']
          }
        ]
      }
    ]
  },
  {
    id: 'title2',
    number: 2,
    title: 'Condições de Emprego',
    description: 'Condições de emprego para marítimos',
    regulations: [
      {
        id: 'reg2.1',
        code: '2.1',
        title: 'Contratos de Emprego (SEA)',
        description: 'Acordos de emprego de marítimos',
        titleNumber: 2,
        items: [
          {
            id: '2.1.1',
            code: '2.1.1',
            regulation: 'Reg. 2.1',
            standard: 'A2.1.1',
            title: 'SEA assinado',
            description: 'Contrato de trabalho assinado pelo marítimo e armador/representante',
            legalBasis: 'MLC 2006, Standard A2.1.1',
            guidance: 'Marítimo deve receber cópia original assinada do contrato.',
            critical: true,
            inspectionPoints: [
              'Verificar se todos têm SEA assinado',
              'Confirmar que marítimo possui cópia',
              'Verificar assinaturas de ambas partes'
            ],
            evidenceRequired: ['SEA original assinado', 'Cópia do marítimo']
          },
          {
            id: '2.1.2',
            code: '2.1.2',
            regulation: 'Reg. 2.1',
            standard: 'A2.1.4',
            title: 'Conteúdo obrigatório do SEA',
            description: 'Contrato contém todos os itens obrigatórios conforme MLC 2006',
            legalBasis: 'MLC 2006, Standard A2.1.4',
            guidance: 'Inclui: nome, função, salário, férias, benefícios, repatriação, rescisão.',
            critical: true,
            inspectionPoints: [
              'Verificar presença de todos itens obrigatórios',
              'Confirmar clareza das cláusulas',
              'Verificar conformidade com CBA se aplicável'
            ],
            evidenceRequired: ['SEA completo', 'CBA se aplicável', 'Tradução em inglês']
          },
          {
            id: '2.1.3',
            code: '2.1.3',
            regulation: 'Reg. 2.1',
            standard: 'A2.1.5',
            title: 'Aviso prévio de rescisão',
            description: 'Período de aviso prévio não inferior a 7 dias',
            legalBasis: 'MLC 2006, Standard A2.1.5',
            guidance: 'Deve haver direito de rescindir por motivos compassivos com aviso menor.',
            critical: false,
            inspectionPoints: [
              'Verificar cláusula de rescisão',
              'Confirmar período de aviso prévio'
            ],
            evidenceRequired: ['Cláusula de rescisão no SEA']
          },
          {
            id: '2.1.4',
            code: '2.1.4',
            regulation: 'Reg. 2.1',
            standard: 'A2.1.7',
            title: 'Período máximo de embarque',
            description: 'Duração máxima de serviço a bordo não excede 11 meses',
            legalBasis: 'MLC 2006, Standard A2.1.7 (Emenda 2014)',
            guidance: 'Marítimo deve poder desembarcar após máximo 11 meses contínuos.',
            critical: true,
            inspectionPoints: [
              'Verificar datas de embarque de toda tripulação',
              'Identificar tripulantes próximos do limite',
              'Confirmar plano de relevo'
            ],
            evidenceRequired: ['Datas de embarque', 'Plano de relevo', 'Registros de viagem']
          }
        ]
      },
      {
        id: 'reg2.2',
        code: '2.2',
        title: 'Salários',
        description: 'Pagamento de salários',
        titleNumber: 2,
        items: [
          {
            id: '2.2.1',
            code: '2.2.1',
            regulation: 'Reg. 2.2',
            standard: 'A2.2.1',
            title: 'Pagamento regular',
            description: 'Salários pagos conforme SEA e CBA, geralmente mensais',
            legalBasis: 'MLC 2006, Standard A2.2.1',
            guidance: 'Pagamento deve ser regular e não atrasado.',
            critical: true,
            inspectionPoints: [
              'Verificar comprovantes de pagamento',
              'Confirmar regularidade dos pagamentos',
              'Verificar conformidade com valores do SEA'
            ],
            evidenceRequired: ['Comprovantes de pagamento', 'Extratos bancários', 'Recibos assinados']
          },
          {
            id: '2.2.2',
            code: '2.2.2',
            regulation: 'Reg. 2.2',
            standard: 'A2.2.2',
            title: 'Extrato mensal individual',
            description: 'Extrato mensal fornecido indicando salário, deduções, allotments',
            legalBasis: 'MLC 2006, Standard A2.2.2',
            guidance: 'Extrato deve ser claro e detalhado em idioma compreensível.',
            critical: true,
            inspectionPoints: [
              'Verificar emissão de extratos mensais',
              'Confirmar que marítimos recebem cópias',
              'Verificar clareza e completude'
            ],
            evidenceRequired: ['Extratos de pagamento', 'Recibos assinados']
          },
          {
            id: '2.2.3',
            code: '2.2.3',
            regulation: 'Reg. 2.2',
            standard: 'A2.2.4',
            title: 'Sem deduções não autorizadas',
            description: 'Deduções somente com autorização expressa do marítimo',
            legalBasis: 'MLC 2006, Standard A2.2.4',
            guidance: 'Deduções devem ser autorizadas por escrito. Marítimos não devem pagar custos de viagem ao navio.',
            critical: true,
            inspectionPoints: [
              'Verificar autorizações para deduções',
              'Confirmar que não há deduções indevidas',
              'Entrevistar marítimos sobre deduções'
            ],
            evidenceRequired: ['Autorizações de dedução assinadas', 'Política de deduções']
          },
          {
            id: '2.2.4',
            code: '2.2.4',
            regulation: 'Reg. 2.2',
            standard: 'A2.2.3',
            title: 'Sistema de allotment',
            description: 'Sistema para transferência de parte do salário para familiares',
            legalBasis: 'MLC 2006, Standard A2.2.3',
            guidance: 'Marítimo deve poder designar parte do salário para dependentes.',
            critical: false,
            inspectionPoints: [
              'Verificar disponibilidade de sistema de allotment',
              'Confirmar que marítimos conhecem o sistema'
            ],
            evidenceRequired: ['Formulários de allotment', 'Registros de transferências']
          }
        ]
      },
      {
        id: 'reg2.3',
        code: '2.3',
        title: 'Horas de Trabalho e Descanso',
        description: 'Limites de horas de trabalho e descanso',
        titleNumber: 2,
        items: [
          {
            id: '2.3.1',
            code: '2.3.1',
            regulation: 'Reg. 2.3',
            standard: 'A2.3.2',
            title: 'Tabela de serviço afixada',
            description: 'Tabela de serviço em inglês e idioma de trabalho afixada em local acessível',
            legalBasis: 'MLC 2006, Standard A2.3.2',
            guidance: 'Deve mostrar escalas de trabalho e descanso de cada função.',
            critical: true,
            inspectionPoints: [
              'Verificar afixação da tabela',
              'Confirmar idiomas adequados',
              'Verificar se está acessível a todos'
            ],
            evidenceRequired: ['Foto da tabela afixada', 'Cópia da tabela de serviço']
          },
          {
            id: '2.3.2',
            code: '2.3.2',
            regulation: 'Reg. 2.3',
            standard: 'A2.3.12',
            title: 'Registros de horas assinados',
            description: 'Registros precisos de trabalho/descanso assinados pelo Comandante e marítimo',
            legalBasis: 'MLC 2006, Standard A2.3.12',
            guidance: 'Registros devem ser mantidos em formato padrão.',
            critical: true,
            inspectionPoints: [
              'Verificar registros de horas de todos tripulantes',
              'Confirmar assinaturas',
              'Verificar formato conforme IMO/ILO'
            ],
            evidenceRequired: ['Registros de horas dos últimos 3 meses', 'Assinaturas']
          },
          {
            id: '2.3.3',
            code: '2.3.3',
            regulation: 'Reg. 2.3',
            standard: 'A2.3.5',
            title: 'Máximo 14h/24h trabalho',
            description: 'Horas de trabalho não excedem 14 horas em período de 24 horas',
            legalBasis: 'MLC 2006, Standard A2.3.5',
            guidance: 'Limite absoluto exceto emergências genuínas.',
            critical: true,
            inspectionPoints: [
              'Analisar registros de horas',
              'Identificar violações',
              'Verificar justificativas para exceções'
            ],
            evidenceRequired: ['Análise de registros de horas', 'Documentação de exceções']
          },
          {
            id: '2.3.4',
            code: '2.3.4',
            regulation: 'Reg. 2.3',
            standard: 'A2.3.5',
            title: 'Máximo 72h/7 dias trabalho',
            description: 'Horas de trabalho não excedem 72 horas em período de 7 dias',
            legalBasis: 'MLC 2006, Standard A2.3.5',
            guidance: 'Verificar média semanal de trabalho.',
            critical: true,
            inspectionPoints: [
              'Calcular média semanal por tripulante',
              'Identificar padrões de excesso'
            ],
            evidenceRequired: ['Análise semanal de horas']
          },
          {
            id: '2.3.5',
            code: '2.3.5',
            regulation: 'Reg. 2.3',
            standard: 'A2.3.5',
            title: 'Mínimo 10h/24h descanso',
            description: 'Horas de descanso não inferiores a 10 horas em período de 24 horas',
            legalBasis: 'MLC 2006, Standard A2.3.5',
            guidance: 'Descanso pode ser dividido em no máximo 2 períodos.',
            critical: true,
            inspectionPoints: [
              'Verificar horas de descanso diárias',
              'Confirmar divisão máxima em 2 períodos'
            ],
            evidenceRequired: ['Registros de descanso']
          },
          {
            id: '2.3.6',
            code: '2.3.6',
            regulation: 'Reg. 2.3',
            standard: 'A2.3.5',
            title: 'Mínimo 77h/7 dias descanso',
            description: 'Horas de descanso não inferiores a 77 horas em período de 7 dias',
            legalBasis: 'MLC 2006, Standard A2.3.5',
            guidance: 'Verificar total semanal de descanso.',
            critical: true,
            inspectionPoints: [
              'Calcular total semanal de descanso',
              'Identificar semanas com déficit'
            ],
            evidenceRequired: ['Análise semanal de descanso']
          },
          {
            id: '2.3.7',
            code: '2.3.7',
            regulation: 'Reg. 2.3',
            standard: 'A2.3.5',
            title: 'Período mínimo de 6h consecutivas',
            description: 'Um dos períodos de descanso deve ter pelo menos 6 horas consecutivas',
            legalBasis: 'MLC 2006, Standard A2.3.5',
            guidance: 'Intervalo entre períodos não pode exceder 14 horas.',
            critical: true,
            inspectionPoints: [
              'Verificar duração dos períodos de descanso',
              'Confirmar período mínimo de 6h'
            ],
            evidenceRequired: ['Análise de períodos de descanso']
          }
        ]
      },
      {
        id: 'reg2.4',
        code: '2.4',
        title: 'Férias',
        description: 'Direito a férias anuais remuneradas',
        titleNumber: 2,
        items: [
          {
            id: '2.4.1',
            code: '2.4.1',
            regulation: 'Reg. 2.4',
            standard: 'A2.4.2',
            title: 'Mínimo 2,5 dias/mês',
            description: 'Férias anuais não inferiores a 2,5 dias por mês de emprego',
            legalBasis: 'MLC 2006, Standard A2.4.2',
            guidance: 'Equivale a 30 dias por ano. Férias pagas integralmente.',
            critical: true,
            inspectionPoints: [
              'Verificar cálculo de férias no SEA',
              'Confirmar gozo efetivo de férias'
            ],
            evidenceRequired: ['Registros de férias', 'Cláusula de férias no SEA']
          }
        ]
      },
      {
        id: 'reg2.5',
        code: '2.5',
        title: 'Repatriação',
        description: 'Direito à repatriação',
        titleNumber: 2,
        items: [
          {
            id: '2.5.1',
            code: '2.5.1',
            regulation: 'Reg. 2.5',
            standard: 'A2.5.1',
            title: 'Direito à repatriação após 12 meses',
            description: 'Marítimo tem direito à repatriação após período máximo de 12 meses',
            legalBasis: 'MLC 2006, Standard A2.5.1',
            guidance: 'Período máximo a bordo antes de repatriação obrigatória.',
            critical: true,
            inspectionPoints: [
              'Verificar períodos de embarque',
              'Confirmar plano de repatriação'
            ],
            evidenceRequired: ['Registros de embarque', 'Política de repatriação']
          },
          {
            id: '2.5.2',
            code: '2.5.2',
            regulation: 'Reg. 2.5',
            standard: 'A2.5.2',
            title: 'Custos pelo armador',
            description: 'Armador arca com custos de repatriação (passagens, alimentação, hospedagem)',
            legalBasis: 'MLC 2006, Standard A2.5.2',
            guidance: 'Inclui transporte, alimentação, alojamento, bagagem, despesas médicas.',
            critical: true,
            inspectionPoints: [
              'Verificar política de custos de repatriação',
              'Confirmar garantia financeira'
            ],
            evidenceRequired: ['Garantia financeira', 'Certificado P&I', 'Política de repatriação']
          },
          {
            id: '2.5.3',
            code: '2.5.3',
            regulation: 'Reg. 2.5',
            standard: 'A2.5.2 (Emenda 2014)',
            title: 'Garantia financeira para repatriação',
            description: 'Sistema de garantia financeira para assegurar repatriação',
            legalBasis: 'MLC 2006, Standard A2.5.2 (Emenda 2014)',
            guidance: 'Evidência de garantia deve estar a bordo. Certificado ou outra prova documental.',
            critical: true,
            inspectionPoints: [
              'Verificar certificado de garantia financeira',
              'Confirmar validade e cobertura'
            ],
            evidenceRequired: ['Certificado de garantia financeira', 'Detalhes de contato do segurador']
          }
        ]
      },
      {
        id: 'reg2.6',
        code: '2.6',
        title: 'Indenização por Perda do Navio',
        description: 'Compensação em caso de perda ou naufrágio',
        titleNumber: 2,
        items: [
          {
            id: '2.6.1',
            code: '2.6.1',
            regulation: 'Reg. 2.6',
            standard: 'A2.6.1',
            title: 'Indenização por desemprego',
            description: 'Marítimos têm direito a indenização por desemprego causado pela perda do navio',
            legalBasis: 'MLC 2006, Standard A2.6.1',
            guidance: 'Indenização de 2 meses de salário ou conforme legislação nacional.',
            critical: false,
            inspectionPoints: [
              'Verificar cláusula no SEA',
              'Confirmar cobertura de seguro'
            ],
            evidenceRequired: ['Cláusula de indenização no SEA', 'Seguro P&I']
          }
        ]
      },
      {
        id: 'reg2.7',
        code: '2.7',
        title: 'Tripulação Mínima',
        description: 'Níveis de tripulação para operação segura',
        titleNumber: 2,
        items: [
          {
            id: '2.7.1',
            code: '2.7.1',
            regulation: 'Reg. 2.7',
            standard: 'A2.7',
            title: 'Documento de tripulação mínima',
            description: 'Navio tripulado conforme Documento de Tripulação Mínima Segura',
            legalBasis: 'MLC 2006, Standard A2.7',
            guidance: 'Emitido pelo Estado de Bandeira. Número e qualificações adequados.',
            critical: true,
            inspectionPoints: [
              'Verificar documento de tripulação mínima válido',
              'Confirmar que tripulação atual atende requisitos',
              'Verificar qualificações'
            ],
            evidenceRequired: ['Safe Manning Document', 'Lista de tripulação', 'Certificados de competência']
          }
        ]
      },
      {
        id: 'reg2.8',
        code: '2.8',
        title: 'Desenvolvimento de Carreira',
        description: 'Promoção de oportunidades de emprego e desenvolvimento',
        titleNumber: 2,
        items: [
          {
            id: '2.8.1',
            code: '2.8.1',
            regulation: 'Reg. 2.8',
            standard: 'A2.8',
            title: 'Políticas de desenvolvimento',
            description: 'Políticas nacionais para promover emprego e desenvolvimento de carreira',
            legalBasis: 'MLC 2006, Standard A2.8',
            guidance: 'Oportunidades de treinamento e promoção.',
            critical: false,
            inspectionPoints: [
              'Verificar registros de treinamento',
              'Confirmar oportunidades de desenvolvimento'
            ],
            evidenceRequired: ['Registros de treinamento', 'Plano de carreira']
          }
        ]
      }
    ]
  },
  {
    id: 'title3',
    number: 3,
    title: 'Alojamento, Lazer, Alimentação e Catering',
    description: 'Padrões de acomodação e alimentação a bordo',
    regulations: [
      {
        id: 'reg3.1',
        code: '3.1',
        title: 'Alojamento e Instalações Recreativas',
        description: 'Padrões de acomodação a bordo',
        titleNumber: 3,
        items: [
          {
            id: '3.1.1',
            code: '3.1.1',
            regulation: 'Reg. 3.1',
            standard: 'A3.1.2',
            title: 'Planta de acomodações',
            description: 'Planta de arranjo das acomodações disponível a bordo',
            legalBasis: 'MLC 2006, Standard A3.1.2',
            guidance: 'Mostra layout completo das áreas de acomodação.',
            critical: false,
            inspectionPoints: [
              'Verificar disponibilidade da planta',
              'Confirmar que está atualizada'
            ],
            evidenceRequired: ['Planta de arranjo geral']
          },
          {
            id: '3.1.2',
            code: '3.1.2',
            regulation: 'Reg. 3.1',
            standard: 'A3.1.17',
            title: 'Inspeções periódicas pelo Comandante',
            description: 'Inspeções regulares das acomodações documentadas',
            legalBasis: 'MLC 2006, Standard A3.1.17',
            guidance: 'Inspeções regulares para garantir condições adequadas.',
            critical: true,
            inspectionPoints: [
              'Verificar registros de inspeção',
              'Confirmar frequência adequada',
              'Verificar ações corretivas'
            ],
            evidenceRequired: ['Registros de inspeção', 'Relatórios de não conformidade']
          },
          {
            id: '3.1.3',
            code: '3.1.3',
            regulation: 'Reg. 3.1',
            standard: 'A3.1.6',
            title: 'Localização das acomodações',
            description: 'Acomodações localizadas acima da linha d\'água, não avante da antepara de colisão',
            legalBasis: 'MLC 2006, Standard A3.1.6',
            guidance: 'Para navios construídos após 2013.',
            critical: false,
            inspectionPoints: [
              'Verificar localização das cabines',
              'Confirmar conformidade para navios novos'
            ],
            evidenceRequired: ['Planta de arranjo', 'Data de construção']
          },
          {
            id: '3.1.4',
            code: '3.1.4',
            regulation: 'Reg. 3.1',
            standard: 'A3.1.9',
            title: 'Cabines com água quente e fria',
            description: 'Sistema de água potável quente e fria em todas as cabines',
            legalBasis: 'MLC 2006, Standard A3.1.9',
            guidance: 'Água corrente adequada.',
            critical: true,
            inspectionPoints: [
              'Verificar funcionamento do sistema de água',
              'Testar água quente e fria nas cabines'
            ],
            evidenceRequired: ['Teste do sistema de água']
          },
          {
            id: '3.1.5',
            code: '3.1.5',
            regulation: 'Reg. 3.1',
            standard: 'A3.1.7',
            title: 'Ventilação e climatização',
            description: 'Sistema adequado de ventilação e ar condicionado',
            legalBasis: 'MLC 2006, Standard A3.1.7',
            guidance: 'Manutenção adequada do sistema HVAC.',
            critical: true,
            inspectionPoints: [
              'Verificar funcionamento do ar condicionado',
              'Confirmar manutenção regular'
            ],
            evidenceRequired: ['Registros de manutenção HVAC', 'Teste de funcionamento']
          },
          {
            id: '3.1.6',
            code: '3.1.6',
            regulation: 'Reg. 3.1',
            standard: 'A3.1.8',
            title: 'Iluminação adequada',
            description: 'Iluminação suficiente natural e artificial',
            legalBasis: 'MLC 2006, Standard A3.1.8',
            guidance: 'Iluminação adequada para trabalho e descanso.',
            critical: false,
            inspectionPoints: [
              'Verificar níveis de iluminação',
              'Confirmar funcionamento de luminárias'
            ],
            evidenceRequired: ['Inspeção visual', 'Medições de lux se necessário']
          },
          {
            id: '3.1.7',
            code: '3.1.7',
            regulation: 'Reg. 3.1',
            standard: 'A3.1.6',
            title: 'Ruído e vibração',
            description: 'Níveis de ruído e vibração dentro dos limites',
            legalBasis: 'MLC 2006, Standard A3.1.6',
            guidance: 'Conforme IMO Resolution A.468(XII) ou equivalente.',
            critical: false,
            inspectionPoints: [
              'Verificar certificado de ruído se aplicável',
              'Avaliar condições nas acomodações'
            ],
            evidenceRequired: ['Certificado de ruído', 'Medições se necessário']
          },
          {
            id: '3.1.8',
            code: '3.1.8',
            regulation: 'Reg. 3.1',
            standard: 'A3.1.11',
            title: 'Instalações sanitárias',
            description: 'Instalações sanitárias acessíveis, higiênicas e funcionais',
            legalBasis: 'MLC 2006, Standard A3.1.11',
            guidance: 'Proporção adequada de instalações por tripulantes.',
            critical: true,
            inspectionPoints: [
              'Verificar quantidade de instalações',
              'Confirmar funcionamento e higiene'
            ],
            evidenceRequired: ['Inspeção visual', 'Lista de verificação']
          },
          {
            id: '3.1.9',
            code: '3.1.9',
            regulation: 'Reg. 3.1',
            standard: 'A3.1',
            title: 'Estado de conservação',
            description: 'Acomodações limpas e em bom estado de conservação',
            legalBasis: 'MLC 2006, Standard A3.1',
            guidance: 'Manutenção regular, equipamentos funcionando.',
            critical: true,
            inspectionPoints: [
              'Inspeção visual das acomodações',
              'Verificar estado de conservação',
              'Confirmar limpeza'
            ],
            evidenceRequired: ['Lista de verificação de limpeza', 'Registros de manutenção']
          },
          {
            id: '3.1.10',
            code: '3.1.10',
            regulation: 'Reg. 3.1',
            standard: 'A3.1.12',
            title: 'Instalações recreativas',
            description: 'Instalações recreativas e de lazer adequadas',
            legalBasis: 'MLC 2006, Standard A3.1.12',
            guidance: 'Espaço para descanso, TV, internet se possível.',
            critical: false,
            inspectionPoints: [
              'Verificar disponibilidade de áreas de lazer',
              'Confirmar funcionamento de equipamentos'
            ],
            evidenceRequired: ['Inspeção visual', 'Lista de instalações']
          }
        ]
      },
      {
        id: 'reg3.2',
        code: '3.2',
        title: 'Alimentação e Catering',
        description: 'Padrões de alimentação a bordo',
        titleNumber: 3,
        items: [
          {
            id: '3.2.1',
            code: '3.2.1',
            regulation: 'Reg. 3.2',
            standard: 'A3.2.2',
            title: 'Qualidade e quantidade de alimentos',
            description: 'Alimentação suficiente, nutritiva e de boa qualidade',
            legalBasis: 'MLC 2006, Standard A3.2.2',
            guidance: 'Adequada às condições de trabalho e viagem.',
            critical: true,
            inspectionPoints: [
              'Verificar cardápios',
              'Inspecionar provisões',
              'Entrevistar tripulação'
            ],
            evidenceRequired: ['Cardápios', 'Registros de compras', 'Inventário']
          },
          {
            id: '3.2.2',
            code: '3.2.2',
            regulation: 'Reg. 3.2',
            standard: 'A3.2.3',
            title: 'Cozinheiro qualificado',
            description: 'Cozinheiro com treinamento e certificação adequados',
            legalBasis: 'MLC 2006, Standard A3.2.3',
            guidance: 'Certificado reconhecido pelo Estado de Bandeira.',
            critical: true,
            inspectionPoints: [
              'Verificar certificado do cozinheiro',
              'Confirmar validade e reconhecimento'
            ],
            evidenceRequired: ['Certificado de cozinheiro', 'Registros de treinamento']
          },
          {
            id: '3.2.3',
            code: '3.2.3',
            regulation: 'Reg. 3.2',
            standard: 'A3.2.2',
            title: 'Higiene alimentar',
            description: 'Padrões de higiene e segurança alimentar mantidos',
            legalBasis: 'MLC 2006, Standard A3.2.2',
            guidance: 'Armazenamento, preparação e serviço adequados.',
            critical: true,
            inspectionPoints: [
              'Inspecionar cozinha e despensas',
              'Verificar temperaturas de armazenamento',
              'Confirmar práticas de higiene'
            ],
            evidenceRequired: ['Registros de higiene', 'Registros de temperatura']
          },
          {
            id: '3.2.4',
            code: '3.2.4',
            regulation: 'Reg. 3.2',
            standard: 'A3.2.7',
            title: 'Água potável',
            description: 'Água potável de qualidade adequada disponível',
            legalBasis: 'MLC 2006, Standard A3.2.7',
            guidance: 'Testes regulares de qualidade da água.',
            critical: true,
            inspectionPoints: [
              'Verificar análises de água',
              'Confirmar tratamento adequado',
              'Verificar disponibilidade'
            ],
            evidenceRequired: ['Análises de água', 'Registros de tratamento']
          }
        ]
      }
    ]
  },
  {
    id: 'title4',
    number: 4,
    title: 'Proteção de Saúde, Assistência Médica, Bem-Estar e Seguridade Social',
    description: 'Proteção da saúde e bem-estar dos marítimos',
    regulations: [
      {
        id: 'reg4.1',
        code: '4.1',
        title: 'Assistência Médica a Bordo e em Terra',
        description: 'Acesso a cuidados médicos',
        titleNumber: 4,
        items: [
          {
            id: '4.1.1',
            code: '4.1.1',
            regulation: 'Reg. 4.1',
            standard: 'A4.1.1',
            title: 'Assistência médica a bordo',
            description: 'Assistência médica adequada disponível a bordo',
            legalBasis: 'MLC 2006, Standard A4.1.1',
            guidance: 'Inclui medicamentos, equipamentos, tratamento.',
            critical: true,
            inspectionPoints: [
              'Verificar farmácia de bordo',
              'Confirmar equipamentos médicos',
              'Verificar pessoal treinado'
            ],
            evidenceRequired: ['Inventário médico', 'Certificados de treinamento médico']
          },
          {
            id: '4.1.2',
            code: '4.1.2',
            regulation: 'Reg. 4.1',
            standard: 'A4.1.4',
            title: 'Farmácia de bordo',
            description: 'Farmácia de bordo adequada e atualizada',
            legalBasis: 'MLC 2006, Standard A4.1.4',
            guidance: 'Conforme requisitos do Estado de Bandeira.',
            critical: true,
            inspectionPoints: [
              'Verificar conteúdo da farmácia',
              'Confirmar validade dos medicamentos',
              'Verificar reposição'
            ],
            evidenceRequired: ['Lista de medicamentos', 'Datas de validade', 'Registros de inspeção']
          },
          {
            id: '4.1.3',
            code: '4.1.3',
            regulation: 'Reg. 4.1',
            standard: 'A4.1.4',
            title: 'Guia médico a bordo',
            description: 'Guia médico internacional ou equivalente disponível',
            legalBasis: 'MLC 2006, Standard A4.1.4',
            guidance: 'International Medical Guide for Ships ou equivalente.',
            critical: false,
            inspectionPoints: [
              'Verificar disponibilidade do guia',
              'Confirmar versão atualizada'
            ],
            evidenceRequired: ['Guia médico']
          },
          {
            id: '4.1.4',
            code: '4.1.4',
            regulation: 'Reg. 4.1',
            standard: 'A4.1.2',
            title: 'Acesso a assistência médica em terra',
            description: 'Marítimos têm acesso a assistência médica em portos',
            legalBasis: 'MLC 2006, Standard A4.1.2',
            guidance: 'Sem custo para o marítimo.',
            critical: true,
            inspectionPoints: [
              'Verificar política de assistência médica',
              'Confirmar cobertura de custos'
            ],
            evidenceRequired: ['Política de assistência médica', 'Seguro P&I']
          }
        ]
      },
      {
        id: 'reg4.2',
        code: '4.2',
        title: 'Responsabilidade do Armador',
        description: 'Responsabilidade por doença e lesão',
        titleNumber: 4,
        items: [
          {
            id: '4.2.1',
            code: '4.2.1',
            regulation: 'Reg. 4.2',
            standard: 'A4.2.1',
            title: 'Proteção financeira em caso de doença/lesão',
            description: 'Armador responsável por custos médicos e salários durante doença/lesão',
            legalBasis: 'MLC 2006, Standard A4.2.1',
            guidance: 'Conforme legislação nacional ou CBA.',
            critical: true,
            inspectionPoints: [
              'Verificar cláusula no SEA',
              'Confirmar cobertura de seguro'
            ],
            evidenceRequired: ['Cláusula no SEA', 'Seguro P&I']
          },
          {
            id: '4.2.2',
            code: '4.2.2',
            regulation: 'Reg. 4.2',
            standard: 'A4.2.1 (Emenda 2014)',
            title: 'Garantia financeira',
            description: 'Sistema de garantia financeira para morte, incapacidade ou abandono',
            legalBasis: 'MLC 2006, Standard A4.2.1 (Emenda 2014)',
            guidance: 'Certificado de garantia financeira deve estar a bordo.',
            critical: true,
            inspectionPoints: [
              'Verificar certificado de garantia',
              'Confirmar validade e cobertura'
            ],
            evidenceRequired: ['Certificado de garantia financeira', 'Detalhes de contato']
          }
        ]
      },
      {
        id: 'reg4.3',
        code: '4.3',
        title: 'Proteção de Saúde e Segurança',
        description: 'Ambiente de trabalho seguro',
        titleNumber: 4,
        items: [
          {
            id: '4.3.1',
            code: '4.3.1',
            regulation: 'Reg. 4.3',
            standard: 'A4.3.1',
            title: 'Política de segurança ocupacional',
            description: 'Política documentada de segurança e saúde ocupacional',
            legalBasis: 'MLC 2006, Standard A4.3.1',
            guidance: 'Programa de prevenção de acidentes.',
            critical: true,
            inspectionPoints: [
              'Verificar política de SST',
              'Confirmar implementação',
              'Verificar treinamentos'
            ],
            evidenceRequired: ['Política de SST', 'Registros de treinamento']
          },
          {
            id: '4.3.2',
            code: '4.3.2',
            regulation: 'Reg. 4.3',
            standard: 'A4.3.2',
            title: 'Comitê de segurança',
            description: 'Comitê de segurança estabelecido em navios com 5+ tripulantes',
            legalBasis: 'MLC 2006, Standard A4.3.2',
            guidance: 'Reuniões regulares documentadas.',
            critical: false,
            inspectionPoints: [
              'Verificar existência do comitê',
              'Revisar atas de reuniões'
            ],
            evidenceRequired: ['Atas de reuniões', 'Composição do comitê']
          },
          {
            id: '4.3.3',
            code: '4.3.3',
            regulation: 'Reg. 4.3',
            standard: 'A4.3.6',
            title: 'EPIs disponíveis',
            description: 'Equipamentos de proteção individual adequados e disponíveis',
            legalBasis: 'MLC 2006, Standard A4.3.6',
            guidance: 'EPIs apropriados para cada função.',
            critical: true,
            inspectionPoints: [
              'Verificar disponibilidade de EPIs',
              'Confirmar uso adequado',
              'Verificar estado de conservação'
            ],
            evidenceRequired: ['Inventário de EPIs', 'Registros de distribuição']
          },
          {
            id: '4.3.4',
            code: '4.3.4',
            regulation: 'Reg. 4.3',
            standard: 'A4.3.5',
            title: 'Avaliação de riscos',
            description: 'Avaliações de risco realizadas e documentadas',
            legalBasis: 'MLC 2006, Standard A4.3.5',
            guidance: 'Identificação e mitigação de riscos.',
            critical: true,
            inspectionPoints: [
              'Verificar avaliações de risco',
              'Confirmar atualização regular'
            ],
            evidenceRequired: ['Avaliações de risco', 'Registros de inspeção']
          },
          {
            id: '4.3.5',
            code: '4.3.5',
            regulation: 'Reg. 4.3',
            standard: 'A4.3.1',
            title: 'Registros de acidentes',
            description: 'Investigação e registro de acidentes ocupacionais',
            legalBasis: 'MLC 2006, Standard A4.3.1',
            guidance: 'Notificação conforme requisitos.',
            critical: false,
            inspectionPoints: [
              'Verificar registros de acidentes',
              'Confirmar investigações realizadas'
            ],
            evidenceRequired: ['Registros de acidentes', 'Relatórios de investigação']
          }
        ]
      },
      {
        id: 'reg4.4',
        code: '4.4',
        title: 'Acesso a Instalações de Bem-Estar em Terra',
        description: 'Instalações de bem-estar em portos',
        titleNumber: 4,
        items: [
          {
            id: '4.4.1',
            code: '4.4.1',
            regulation: 'Reg. 4.4',
            standard: 'A4.4',
            title: 'Acesso a instalações em terra',
            description: 'Marítimos têm acesso a instalações de bem-estar em portos',
            legalBasis: 'MLC 2006, Standard A4.4',
            guidance: 'Licença em terra permitida quando possível.',
            critical: false,
            inspectionPoints: [
              'Verificar política de licença em terra',
              'Confirmar acesso a instalações'
            ],
            evidenceRequired: ['Política de licença em terra']
          }
        ]
      },
      {
        id: 'reg4.5',
        code: '4.5',
        title: 'Seguridade Social',
        description: 'Proteção de seguridade social',
        titleNumber: 4,
        items: [
          {
            id: '4.5.1',
            code: '4.5.1',
            regulation: 'Reg. 4.5',
            standard: 'A4.5',
            title: 'Cobertura de seguridade social',
            description: 'Marítimos têm acesso a proteção de seguridade social',
            legalBasis: 'MLC 2006, Standard A4.5',
            guidance: 'Conforme legislação do Estado de Bandeira ou residência.',
            critical: false,
            inspectionPoints: [
              'Verificar cobertura de seguridade',
              'Confirmar contribuições'
            ],
            evidenceRequired: ['Documentação de seguridade social']
          }
        ]
      }
    ]
  },
  {
    id: 'title5',
    number: 5,
    title: 'Conformidade e Aplicação',
    description: 'Responsabilidades de cumprimento e fiscalização',
    regulations: [
      {
        id: 'reg5.1',
        code: '5.1',
        title: 'Responsabilidades do Estado de Bandeira',
        description: 'Obrigações do Flag State',
        titleNumber: 5,
        items: [
          {
            id: '5.1.1',
            code: '5.1.1',
            regulation: 'Reg. 5.1.3',
            standard: 'A5.1.3',
            title: 'Certificado MLC válido',
            description: 'Maritime Labour Certificate válido emitido pelo Estado de Bandeira',
            legalBasis: 'MLC 2006, Standard A5.1.3',
            guidance: 'Certificado válido por 5 anos com inspeções intermediárias.',
            critical: true,
            inspectionPoints: [
              'Verificar MLC Certificate original',
              'Confirmar validade',
              'Verificar afixação'
            ],
            evidenceRequired: ['MLC Certificate original', 'Tradução se necessário']
          },
          {
            id: '5.1.2',
            code: '5.1.2',
            regulation: 'Reg. 5.1.3',
            standard: 'A5.1.3',
            title: 'DMLC Parte I',
            description: 'Declaration of Maritime Labour Compliance Part I emitida pelo Estado de Bandeira',
            legalBasis: 'MLC 2006, Standard A5.1.3',
            guidance: 'Lista requisitos nacionais por área da MLC.',
            critical: true,
            inspectionPoints: [
              'Verificar DMLC Parte I',
              'Confirmar completude',
              'Verificar correspondência com Flag State'
            ],
            evidenceRequired: ['DMLC Parte I', 'Tradução em inglês']
          },
          {
            id: '5.1.3',
            code: '5.1.3',
            regulation: 'Reg. 5.1.3',
            standard: 'A5.1.3',
            title: 'DMLC Parte II',
            description: 'Declaration of Maritime Labour Compliance Part II emitida pelo armador',
            legalBasis: 'MLC 2006, Standard A5.1.3',
            guidance: 'Descreve medidas de conformidade do armador.',
            critical: true,
            inspectionPoints: [
              'Verificar DMLC Parte II',
              'Confirmar que descreve medidas para cada área',
              'Verificar assinatura do armador'
            ],
            evidenceRequired: ['DMLC Parte II', 'Anexos de evidência']
          },
          {
            id: '5.1.4',
            code: '5.1.4',
            regulation: 'Reg. 5.1.4',
            standard: 'A5.1.4',
            title: 'Relatório da última inspeção',
            description: 'Cópia do relatório da última inspeção MLC disponível',
            legalBasis: 'MLC 2006, Standard A5.1.4',
            guidance: 'Uma cópia com Comandante, outra acessível à tripulação.',
            critical: false,
            inspectionPoints: [
              'Verificar disponibilidade do relatório',
              'Confirmar acessibilidade'
            ],
            evidenceRequired: ['Relatório de inspeção', 'Tradução se necessário']
          }
        ]
      },
      {
        id: 'reg5.2',
        code: '5.2',
        title: 'Responsabilidades do Port State',
        description: 'Inspeção por Estado do Porto',
        titleNumber: 5,
        items: [
          {
            id: '5.2.1',
            code: '5.2.1',
            regulation: 'Reg. 5.2.1',
            standard: 'A5.2.1',
            title: 'Cooperação com PSC',
            description: 'Navio preparado para inspeção por autoridades do Port State',
            legalBasis: 'MLC 2006, Standard A5.2.1',
            guidance: 'Documentos disponíveis, tripulação pode ser entrevistada.',
            critical: true,
            inspectionPoints: [
              'Verificar disponibilidade de documentos',
              'Confirmar prontidão para inspeção'
            ],
            evidenceRequired: ['Todos os documentos MLC organizados']
          }
        ]
      },
      {
        id: 'reg5.3',
        code: '5.3',
        title: 'Responsabilidades do Fornecedor de Mão de Obra',
        description: 'Obrigações do Labour-Supplying State',
        titleNumber: 5,
        items: [
          {
            id: '5.3.1',
            code: '5.3.1',
            regulation: 'Reg. 5.3',
            standard: 'A5.3',
            title: 'Serviços de recrutamento licenciados',
            description: 'Recrutamento através de agências licenciadas/certificadas',
            legalBasis: 'MLC 2006, Standard A5.3',
            guidance: 'Agências conforme requisitos MLC.',
            critical: false,
            inspectionPoints: [
              'Verificar licenciamento das agências',
              'Confirmar conformidade'
            ],
            evidenceRequired: ['Licença da agência', 'Contrato de fornecimento']
          }
        ]
      }
    ]
  }
];

// Helper functions
export function getTotalMLC2022Items(): number {
  return MLC_2022_TITLES.reduce(
    (total, title) => total + title.regulations.reduce(
      (regTotal, reg) => regTotal + reg.items.length, 0
    ), 0
  );
}

export function getCriticalMLC2022Items(): MLCCheckItem[] {
  const critical: MLCCheckItem[] = [];
  MLC_2022_TITLES.forEach(title => {
    title.regulations.forEach(reg => {
      reg.items.forEach(item => {
        if (item.critical) critical.push(item);
      });
    });
  });
  return critical;
}

export function getItemsByTitle(titleNumber: number): MLCCheckItem[] {
  const title = MLC_2022_TITLES.find(t => t.number === titleNumber);
  if (!title) return [];
  
  const items: MLCCheckItem[] = [];
  title.regulations.forEach(reg => {
    items.push(...reg.items);
  });
  return items;
}

export function getItemById(itemId: string): MLCCheckItem | undefined {
  for (const title of MLC_2022_TITLES) {
    for (const reg of title.regulations) {
      const item = reg.items.find(i => i.id === itemId);
      if (item) return item;
    }
  }
  return undefined;
}

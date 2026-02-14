/**
 * PEOTRAM - Programa de Excelência Operacional no Transporte Marítimo
 * Complete data structure with all 13 Elements and their items
 * Based on official Petrobras LV PEOTRAM Ciclo 2024/2025
 */

export interface PeotramItem {
  id: string;           // e.g., "1.1.1", "4.3.2"
  subelement: string;   // e.g., "Responsabilidade e Autoridade"
  description: string;  // Full requirement description
  evidences: string;    // Required evidence text
  weight: number;       // Item weight (default 3)
  isCritical: boolean;  // Whether item is critical for scoring
  norms: string[];      // Referenced norms (NR-34, ISM, SOLAS, etc.)
}

export interface PeotramSubelement {
  id: string;
  name: string;
  items: PeotramItem[];
}

export interface PeotramElement {
  id: number;
  name: string;
  sigla: string;
  description: string;
  weightPercentage: number;
  isCritical: boolean;
  importanceLevel: "critical" | "high" | "normal";
  subelements: PeotramSubelement[];
  icon: string;
  category: string;
}

export type NCClassification = "A" | "B" | "C" | "D" | "NA" | "conforme" | "excelencia";
export type ScoreValue = "NA" | 0 | 1 | 2 | 3 | 4;

export const SCORE_CRITERIA: Record<string, { label: string; percentage: number; color: string; description: string }> = {
  "NA": { label: "N/A", percentage: 0, color: "gray", description: "Não Aplicável; Não avaliado" },
  "0": { label: "0", percentage: 0, color: "red", description: "Não Evidenciado ou Não Implantado" },
  "1": { label: "1", percentage: 20, color: "red", description: "Implementação com Falhas Sistemáticas/Críticas ou Em implementação" },
  "2": { label: "2", percentage: 50, color: "yellow", description: "Implementação com Falhas Pontuais" },
  "3": { label: "3", percentage: 90, color: "green", description: "Implementação sem Falhas" },
  "4": { label: "4", percentage: 100, color: "blue", description: "Ações e/ou boas práticas além do requerido" },
};

export const NC_CLASSIFICATIONS: Record<NCClassification, { label: string; color: string; deadline: string; description: string }> = {
  "A": { label: "Crítica", color: "destructive", deadline: "10 dias", description: "Risco iminente a pessoas, meio ambiente, instalação ou operações. Comunicação imediata à Petrobras." },
  "B": { label: "Grave", color: "destructive", deadline: "15 dias", description: "Falta ou falha relevante no requisito SMS. NC similares a ciclos anteriores. Desvio sistêmico." },
  "C": { label: "Moderada", color: "warning", deadline: "30 dias", description: "Atendimento parcial ou insuficiente a requisito SMS." },
  "D": { label: "Leve", color: "default", deadline: "60 dias", description: "Desvio ou falhas isoladas no atendimento a requisito SMS." },
  "NA": { label: "N/A", color: "secondary", deadline: "-", description: "Não aplicável" },
  "conforme": { label: "Conforme", color: "success", deadline: "-", description: "Item conforme ✓" },
  "excelencia": { label: "Excelência", color: "primary", deadline: "-", description: "Item de Excelência ✓✓" },
};

export const PEOTRAM_ELEMENTS: PeotramElement[] = [
  {
    id: 1,
    name: "Liderança, Gerenciamento e Responsabilidade",
    sigla: "LGR",
    description: "Compromisso da alta administração com SMS e segurança operacional",
    weightPercentage: 8.5,
    isCritical: false,
    importanceLevel: "high",
    icon: "Users",
    category: "Gestão",
    subelements: [
      {
        id: "1.1",
        name: "Responsabilidade e Autoridade",
        items: [
          {
            id: "1.1.1",
            subelement: "Responsabilidade e Autoridade",
            description: "A alta administração da empresa demonstra compromisso claro em implementar e manter a gestão de segurança, meio ambiente e saúde? a) Atribuições e responsabilidades SMS definidas e implementadas a bordo e na base? b) Conhecimento e prática pelos tripulantes e pessoal de terra? Diretores/gerentes realizam visitas periódicas nas embarcações? Auditorias comportamentais periódicas com registro de desvios?",
            evidences: "Entrevistas com alta administração; Organograma; Matriz de responsabilidades; Registros de visitas; Registros de auditorias comportamentais e tratamento de desvios",
            weight: 3,
            isCritical: false,
            norms: ["ISM Code", "IMCA"]
          },
          {
            id: "1.1.2",
            subelement: "Responsabilidade e Autoridade",
            description: "A empresa demonstra ter setores de Operação, Manutenção/Técnico, RH, SMS adequadamente estruturados, com competência técnica e articulados, para suportar operações marítimas a serviço da Petrobras?",
            evidences: "Organograma estruturado; Matriz de responsabilidades; Evidências de articulação entre setores no suporte às operações",
            weight: 3,
            isCritical: false,
            norms: ["ISM Code"]
          }
        ]
      },
      {
        id: "1.2",
        name: "Comprometimento da Liderança",
        items: [
          {
            id: "1.2.1",
            subelement: "Comprometimento da Liderança",
            description: "A empresa possui sistemática para estabelecer as diversas especificações previstas em normas como: Designação profissional legalmente habilitado, habilitação, capacitação e qualificação?",
            evidences: "ISM Code, IMCA, NR 10-35; Procedimento documentado",
            weight: 3,
            isCritical: false,
            norms: ["ISM Code", "IMCA", "NR-10", "NR-11", "NR-12", "NR-13", "NR-17", "NR-20", "NR-30", "NR-33", "NR-34", "NR-35"]
          },
          {
            id: "1.2.2",
            subelement: "Comprometimento da Liderança",
            description: "a) A empresa designou formalmente os responsáveis legais (PLH, profissionais designados nas NRs)? b) Todos os serviços que requeiram atuação dos responsáveis legais estão em conformidade?",
            evidences: "Carta de Designação DPA (ISM Code / IMCA); Profissionais designados NR-10 a NR-35; Registros de atuação do DPA e designados",
            weight: 3,
            isCritical: false,
            norms: ["ISM Code", "IMCA", "NR-10", "NR-34", "NR-35"]
          },
          {
            id: "1.2.3",
            subelement: "Comprometimento da Liderança",
            description: "A alta administração demonstra compromisso com redução de emissões de gases de efeito estufa e apresenta ações práticas para redução de emissões?",
            evidences: "Registros de atuação da alta liderança; Ações práticas (modos de operação, redução de consumo de diesel, gestão de manutenção, indicadores)",
            weight: 3,
            isCritical: false,
            norms: ["MARPOL Annex VI", "IMO GHG Strategy"]
          },
          {
            id: "1.2.4",
            subelement: "Comprometimento da Liderança",
            description: "A alta administração demonstra efetivamente presença na frente operacional, demonstrando exemplo e realiza escuta ativa junto às tripulações?",
            evidences: "Registro da presença na frente operacional; Registros da escuta ativa (fotos, atas), com retorno aos tripulantes de ações tomadas",
            weight: 3,
            isCritical: false,
            norms: ["ISM Code"]
          }
        ]
      },
      {
        id: "1.3",
        name: "Indicadores e Itens Críticos",
        items: [
          {
            id: "1.3.1",
            subelement: "Indicadores e Itens Críticos",
            description: "A alta administração estabeleceu indicadores e metas de performance em SMS, manutenções, inspeções e excelência operacional, medindo-as e monitorando-as periodicamente, com planos de ação no caso de não atendimento?",
            evidences: "Indicadores: TAR, TOR, TFCA, TG, Vazamentos, PTP-Saúde, Falhas de DP, ICMP, Abalroamentos (meta zero); Medições realizadas; Planos de ação",
            weight: 3,
            isCritical: false,
            norms: ["ISM Code", "IMCA"]
          }
        ]
      },
      {
        id: "1.4",
        name: "Autoavaliação para otimização de auditorias",
        items: [
          {
            id: "1.4.1",
            subelement: "Autoavaliação",
            description: "a) A liderança garantiu a apresentação da autoavaliação e evidências nas pastas 15 dias antes da auditoria? b) Autoavaliação preenchida com observações esclarecedoras e referências documentais?",
            evidences: "Documentos: Procedimentos, ITR, IT, RT, ART, Cartas de Designação, Planilhas, Checklists, PTs, Registros",
            weight: 3,
            isCritical: false,
            norms: ["PEOTRAM"]
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Conformidade Legal",
    sigla: "CL",
    description: "Requisitos legais, NRs e normas marítimas",
    weightPercentage: 7.5,
    isCritical: false,
    importanceLevel: "high",
    icon: "Scale",
    category: "Legal",
    subelements: [
      {
        id: "2.1",
        name: "Sistemática de Identificação e Atualização de Requisitos Legais",
        items: [
          { id: "2.1.1", subelement: "Requisitos Legais", description: "A empresa possui sistema que identifique e atualize legislações e normas nacionais/internacionais pertinentes? Legislações e requisitos contratuais inseridos nos estudos de risco e procedimentos?", evidences: "Legislação Federal/Estadual/Municipal; Normas NBR, NRs, Normas técnicas; Lista/Software de requisitos legais", weight: 3, isCritical: false, norms: ["Legislação Brasileira", "NRs", "IMO"] },
          { id: "2.1.2", subelement: "Requisitos Legais", description: "A empresa possui grupo interno de inspeção e auditoria para verificar conformidade da frota às legislações marítimas, NRs, ambientais, ANVISA, IMCA, IMO, ISM?", evidences: "Cronograma de inspeções/auditorias; Relatório consistente; Registros de NC e planos de ação; Qualificação dos auditores/inspetores", weight: 3, isCritical: false, norms: ["ISM Code", "IMCA", "NRs"] },
          { id: "2.1.3", subelement: "Requisitos Legais", description: "A empresa possui política de álcool e drogas aplicada para a tripulação?", evidences: "Procedimento; Verificar nível aceitável de consumo; Período sem álcool antes do serviço", weight: 3, isCritical: false, norms: ["Lei 9.473/1997", "ANTAQ 2.134/2014"] }
        ]
      },
      {
        id: "2.2",
        name: "Atendimento à NR-34",
        items: [
          { id: "2.2.1", subelement: "NR-34", description: "Empresa possui profissional formalmente designado para cumprimento da NR-34?", evidences: "Carta de designação; ART; Evidências de habilitação e qualificação", weight: 3, isCritical: false, norms: ["NR-34"] },
          { id: "2.2.2", subelement: "NR-34", description: "Profissionais capacitados e treinados nos termos do item 34.3 da NR-34?", evidences: "Registros de treinamento; Comprovação de qualificação/habilitação/capacitação conforme 34.3", weight: 3, isCritical: false, norms: ["NR-34"] },
          { id: "2.2.3", subelement: "NR-34", description: "Documentações de atendimento à NR-34 disponíveis e conformes (item 34.4)?", evidences: "Permissões para Trabalho; Entrevistas", weight: 3, isCritical: false, norms: ["NR-34"] },
          { id: "2.2.4", subelement: "NR-34", description: "Trabalhos a quente conformes ao item 34.5 da NR-34?", evidences: "Relação de trabalhos a quente; Registros de atendimento integral", weight: 3, isCritical: false, norms: ["NR-34"] },
          { id: "2.2.5", subelement: "NR-34", description: "Trabalhos em altura conformes ao item 34.6 da NR-34?", evidences: "Registros de trabalhos em altura no ciclo anual", weight: 3, isCritical: false, norms: ["NR-34"] },
          { id: "2.2.6", subelement: "NR-34", description: "Trabalhos de pintura conformes ao item 34.9 da NR-34?", evidences: "Registros de trabalhos de pintura no ciclo anual", weight: 3, isCritical: false, norms: ["NR-34"] },
          { id: "2.2.7", subelement: "NR-34", description: "Trabalhos de movimentação de cargas conformes ao item 34.10 da NR-34?", evidences: "Relação de equipamentos de movimentação de cargas; Registros integrais", weight: 3, isCritical: false, norms: ["NR-34"] },
          { id: "2.2.8", subelement: "NR-34", description: "Equipamentos de movimentação de cargas possuem prontuários conforme item 34.10.3?", evidences: "Relação de equipamentos e respectivos prontuários", weight: 3, isCritical: false, norms: ["NR-34"] },
          { id: "2.2.9", subelement: "NR-34", description: "Equipamentos e acessórios de movimentação de cargas certificados por PLH, conforme item 34.10.6?", evidences: "Relação dos certificados de todos os equipamentos", weight: 3, isCritical: false, norms: ["NR-34"] },
          { id: "2.2.10", subelement: "NR-34", description: "Equipamentos portáteis conformes ao item 34.12 da NR-34?", evidences: "Relação de equipamentos portáteis; Registros integrais", weight: 3, isCritical: false, norms: ["NR-34"] },
          { id: "2.2.11", subelement: "NR-34", description: "Instalações elétricas provisórias conformes ao item 34.13 da NR-34?", evidences: "Relação de instalações elétricas provisórias; Registros", weight: 3, isCritical: false, norms: ["NR-34"] },
          { id: "2.2.12", subelement: "NR-34", description: "Testes de estanqueidade conformes ao item 34.14 da NR-34?", evidences: "Relação de testes de estanqueidade; Registros integrais", weight: 3, isCritical: false, norms: ["NR-34"] }
        ]
      },
      {
        id: "2.3",
        name: "Atendimento à NR-12",
        items: [
          { id: "2.3.1", subelement: "NR-12", description: "Empresa possui PLH para fins de cumprimento da NR-12? Profissional atuante?", evidences: "Evidências de designação; Formação (Eng. Mecânico ou Naval); ART/CREA ativo", weight: 3, isCritical: false, norms: ["NR-12"] },
          { id: "2.3.2", subelement: "NR-12", description: "Arranjo físico da embarcação conforme item 12.2 da NR-12?", evidences: "Relatórios, fotos, visita a bordo e registros", weight: 3, isCritical: false, norms: ["NR-12"] },
          { id: "2.3.3", subelement: "NR-12", description: "Instalações e dispositivos elétricos conformes ao item 12.3?", evidences: "Relatórios, fotos, visita a bordo e registros", weight: 3, isCritical: false, norms: ["NR-12"] },
          { id: "2.3.4", subelement: "NR-12", description: "Dispositivos de partida, acionamento e parada conformes ao item 12.4?", evidences: "Relatórios, fotos, visita a bordo e registros", weight: 3, isCritical: false, norms: ["NR-12"] },
          { id: "2.3.5", subelement: "NR-12", description: "Sistemas de segurança conformes ao item 12.5?", evidences: "Relatórios, fotos, visita a bordo e registros", weight: 3, isCritical: false, norms: ["NR-12"] },
          { id: "2.3.6", subelement: "NR-12", description: "Dispositivos de parada de emergências conformes ao item 12.6?", evidences: "Relatórios, fotos, visita a bordo e registros", weight: 3, isCritical: false, norms: ["NR-12"] },
          { id: "2.3.7", subelement: "NR-12", description: "Componentes pressurizados conformes ao item 12.7?", evidences: "Relatórios, fotos, visita a bordo e registros", weight: 3, isCritical: false, norms: ["NR-12"] },
          { id: "2.3.8", subelement: "NR-12", description: "Riscos adicionais mapeados e conformes ao item 12.10?", evidences: "Relatórios, fotos, visita a bordo e registros", weight: 3, isCritical: false, norms: ["NR-12"] },
          { id: "2.3.9", subelement: "NR-12", description: "Manutenções, inspeções, sinalizações e manuais conformes aos itens 12.11-12.13?", evidences: "Relatórios, fotos, visita a bordo e registros", weight: 3, isCritical: false, norms: ["NR-12"] },
          { id: "2.3.10", subelement: "NR-12", description: "Procedimentos documentados de trabalho e segurança conforme item 12.14?", evidences: "Relatórios, fotos, registros", weight: 3, isCritical: false, norms: ["NR-12"] },
          { id: "2.3.11", subelement: "NR-12", description: "Profissionais capacitados, habilitados, qualificados e autorizados conforme item 12.16?", evidences: "Relação dos profissionais; Registros de treinamentos; Entrevistas", weight: 3, isCritical: false, norms: ["NR-12"] }
        ]
      },
      {
        id: "2.4",
        name: "Atendimento à NR-33",
        items: [
          { id: "2.4.1", subelement: "NR-33", description: "Empresa possui Responsável Técnico para NR-33? Profissional atuante?", evidences: "Evidências de designação, atuação em registros, entrevistas", weight: 3, isCritical: false, norms: ["NR-33"] },
          { id: "2.4.2", subelement: "NR-33", description: "Obrigações referentes a espaços confinados conformes ao item 33.3?", evidences: "Relatórios, fotos, visita a bordo e registros", weight: 3, isCritical: false, norms: ["NR-33"] },
          { id: "2.4.3", subelement: "NR-33", description: "Trabalho em espaço confinado planejado, programado e avaliado conforme item 33.4?", evidences: "Relação de trabalhos em EC no ciclo; Relatórios; Visita a bordo. 100% conforme", weight: 3, isCritical: false, norms: ["NR-33"] },
          { id: "2.4.4", subelement: "NR-33", description: "Participantes (autorizados, vigias, supervisores) capacitados conforme item 33.6?", evidences: "Relação dos profissionais; Certificados; Ementa; Entrevista", weight: 3, isCritical: false, norms: ["NR-33"] }
        ]
      },
      {
        id: "2.5",
        name: "Atendimento à NR-35",
        items: [
          { id: "2.5.1", subelement: "NR-35", description: "Trabalhos acima de 2m com todos os requisitos do item 35.3 implementados?", evidences: "Relatórios, fotos, visita a bordo e registros", weight: 3, isCritical: false, norms: ["NR-35"] },
          { id: "2.5.2", subelement: "NR-35", description: "Profissionais capacitados conforme itens 35.4 e 35.7?", evidences: "Relação; Certificados; Ementa; Entrevista conforme 35.4", weight: 3, isCritical: false, norms: ["NR-35"] },
          { id: "2.5.3", subelement: "NR-35", description: "Trabalhos em altura planejados, organizados e executados conforme item 35.5?", evidences: "Relação dos trabalhos; Relatórios; Fotos; Registros", weight: 3, isCritical: false, norms: ["NR-35"] },
          { id: "2.5.4", subelement: "NR-35", description: "Sistemas de Proteção Contra Quedas instalados e conformes conforme item 35.6?", evidences: "Relação dos trabalhos em altura; Registros; SPIQ conformes", weight: 3, isCritical: false, norms: ["NR-35"] },
          { id: "2.5.5", subelement: "NR-35", description: "Equipes de resposta a emergências disponíveis conforme item 35.7?", evidences: "Relação da equipe; Planos; Relatórios; Visita a bordo", weight: 3, isCritical: false, norms: ["NR-35"] }
        ]
      },
      {
        id: "2.6",
        name: "Normas de Segurança das Operações Marítimas",
        items: [
          { id: "2.6.1", subelement: "Normas Marítimas", description: "Sistemática para cumprimento e monitoramento do STCW 95?", evidences: "Procedimento documentado; Registros; Visita a bordo", weight: 3, isCritical: false, norms: ["STCW 95"] },
          { id: "2.6.2", subelement: "Normas Marítimas", description: "Sistemática para cumprimento do ISM (International Safety Management)?", evidences: "Procedimento documentado; Registros; Visita a bordo", weight: 3, isCritical: false, norms: ["ISM Code"] },
          { id: "2.6.3", subelement: "Normas Marítimas", description: "Sistemática para cumprimento do SOLAS?", evidences: "Procedimento documentado; Registros; Visita a bordo", weight: 3, isCritical: false, norms: ["SOLAS"] },
          { id: "2.6.4", subelement: "Normas Marítimas", description: "Sistemática para cumprimento do RIPEAM 72?", evidences: "Procedimento documentado; Registros; Visita a bordo", weight: 3, isCritical: false, norms: ["RIPEAM 72"] },
          { id: "2.6.5", subelement: "Normas Marítimas", description: "Sistemática para cumprimento da MARPOL?", evidences: "Procedimento documentado; Registros; Visita a bordo", weight: 3, isCritical: false, norms: ["MARPOL 73/78"] },
          { id: "2.6.6", subelement: "Normas Marítimas", description: "Embarcações DP: cumprimento integral do IMCA 103?", evidences: "Procedimento documentado; Registros; Visita a bordo", weight: 3, isCritical: false, norms: ["IMCA 103"] },
          { id: "2.6.7", subelement: "Normas Marítimas", description: "Embarcações DP: cumprimento integral do IMCA 117?", evidences: "Procedimento documentado; Registros de qualificação e treinamento", weight: 3, isCritical: false, norms: ["IMCA 117"] }
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Gestão de Riscos",
    sigla: "GR",
    description: "Identificação, avaliação e gerenciamento de riscos operacionais",
    weightPercentage: 9.0,
    isCritical: false,
    importanceLevel: "high",
    icon: "AlertTriangle",
    category: "Riscos",
    subelements: [
      {
        id: "3.1",
        name: "Identificação e Avaliação de Riscos",
        items: [
          { id: "3.1.1", subelement: "Identificação de Riscos", description: "Empresa possui processo estruturado de identificação de perigos e gestão de riscos ocupacionais e operacionais?", evidences: "Procedimento; Relatórios de Análises de Riscos (APR, APP); Contempla: intoxicação, doenças, trauma, desastres naturais, terrorismo", weight: 3, isCritical: false, norms: ["ISM Code", "N-2782"] },
          { id: "3.1.2", subelement: "Identificação de Riscos", description: "Participantes de estudos de riscos possuem treinamento em técnicas de avaliação?", evidences: "Registros de treinamento e entrevistas", weight: 3, isCritical: false, norms: ["ISM Code"] },
          { id: "3.1.3", subelement: "Identificação de Riscos", description: "Utiliza técnicas estruturadas de classificação de risco (HAZOP, FMEA/ASOG, HAZID, Bow Tie)?", evidences: "Procedimentos específicos para HAZOP, FMEA/ASOG, HAZID, Bow Tie", weight: 3, isCritical: false, norms: ["IMCA", "ISM Code"] },
          { id: "3.1.4", subelement: "Identificação de Riscos", description: "Aplica Matriz de Tolerabilidade de Riscos (severidade x frequência) similar à N-2782?", evidences: "Verificar categorização dos riscos conforme matriz", weight: 3, isCritical: false, norms: ["N-2782", "Petrobras"] },
          { id: "3.1.5", subelement: "Identificação de Riscos", description: "Sistemática de qualidade das análises de risco: líder treinado, equipe multidisciplinar, aprovação hierárquica, rastreabilidade?", evidences: "Estudo de risco realizado conforme critérios a-f", weight: 3, isCritical: false, norms: ["ISM Code"] },
          { id: "3.1.6", subelement: "Identificação de Riscos", description: "Liderança monitora e registra percentuais de implementação de recomendações?", evidences: "Evidências de monitoramento e qualidade das análises", weight: 3, isCritical: false, norms: ["ISM Code"] },
          { id: "3.1.7", subelement: "Identificação de Riscos", description: "Análises de riscos contemplam acidentes/incidentes da própria empresa e alertas compartilhados pela Petrobras? Divulgados para tripulação?", evidences: "Verificar histórico de acidentes nos estudos (incêndio, explosão, vazamento, avaria, alagamento, perda de posição, colisão, black out)", weight: 3, isCritical: false, norms: ["ISM Code"] },
          { id: "3.1.8", subelement: "Identificação de Riscos", description: "Análises de riscos levam em consideração Guias e Manuais de Segurança da Petrobras?", evidences: "APR; APP; HAZID; Guia de Operações EAM e UM", weight: 3, isCritical: false, norms: ["Petrobras"] },
          { id: "3.1.9", subelement: "Identificação de Riscos", description: "Procedimentos de tarefas rotineiras baseados em avaliações de aspectos, impactos, perigos e riscos?", evidences: "Procedimento documentado; Confrontar padrão x operação", weight: 3, isCritical: false, norms: ["ISM Code"] },
          { id: "3.1.10", subelement: "Identificação de Riscos", description: "Para tarefas novas/não rotineiras/não planejadas, realiza avaliação prévia?", evidences: "Procedimento; Relatórios de Análises de Riscos", weight: 3, isCritical: false, norms: ["ISM Code"] },
          { id: "3.1.11", subelement: "Identificação de Riscos", description: "Estudos de risco abrangem cenários mínimos: abalroamento, colisão, incêndio, naufrágio, perda de posição, deriva, alagamento, homem ao mar, etc.?", evidences: "Estudos cobrindo cada cenário mínimo", weight: 3, isCritical: false, norms: ["ISM Code", "SOLAS"] },
          { id: "3.1.13", subelement: "Identificação de Riscos", description: "São identificados nos estudos de riscos os elementos críticos de Segurança Operacional (Equipamentos, Sistemas e Procedimentos)?", evidences: "Levantamento de aspectos e impactos; Relatórios de APR/APP; Guia de Operações EAM-UM", weight: 3, isCritical: false, norms: ["ISM Code 1.2.2", "NR-37"] }
        ]
      },
      {
        id: "3.2",
        name: "Gerenciamento de Riscos",
        items: [
          { id: "3.2.1", subelement: "Gerenciamento de Riscos", description: "A bordo estão implementadas as ações de prevenção/mitigação? Barreiras (salvaguardas) íntegras?", evidences: "Verificação em campo: entrevistas, procedimentos, manutenção de equipamentos críticos, EPIs", weight: 3, isCritical: false, norms: ["ISM Code"] },
          { id: "3.2.2", subelement: "Gerenciamento de Riscos", description: "Controles seguem hierarquia: eliminação, substituição, controles de engenharia, sinalização/administrativos, EPIs?", evidences: "Verificação em campo", weight: 3, isCritical: false, norms: ["ISM Code", "NR-1"] },
          { id: "3.2.3", subelement: "Gerenciamento de Riscos", description: "Nas entrevistas a bordo, a força de trabalho conhece os riscos e ações de controle?", evidences: "Verificação em campo e entrevistas", weight: 3, isCritical: false, norms: ["ISM Code"] },
          { id: "3.2.4", subelement: "Gerenciamento de Riscos", description: "Gatilhos estabelecidos para revisão dos levantamentos e estudos de riscos?", evidences: "Procedimento; Registros de abrangência de alertas SMS; Avaliação de simulados; Investigação de incidentes", weight: 3, isCritical: false, norms: ["ISM Code"] }
        ]
      }
    ]
  },
  {
    id: 4,
    name: "Operação",
    sigla: "OP",
    description: "Gestão de operações críticas - ELEMENTO DE MAIOR PESO",
    weightPercentage: 9.5,
    isCritical: true,
    importanceLevel: "critical",
    icon: "Anchor",
    category: "Operação",
    subelements: [
      { id: "4.1", name: "Geral", items: [
        { id: "4.1.1", subelement: "Geral", description: "Há sistemática para definição e gestão de equipamentos críticos? Relação validada pela liderança?", evidences: "Procedimentos; Definição de sistemas e equipamentos críticos; Lista de equipamentos; Registros; Análise de risco", weight: 3, isCritical: true, norms: ["ISM Code", "NORMAM 01"] },
        { id: "4.1.2", subelement: "Geral", description: "Sistemática implementada de VCP (Verificação de Conformidade de Procedimentos)?", evidences: "Procedimento baseado em análise de risco; Relatórios; Lista de padrões críticos; Cronograma cumprido; Participação da liderança", weight: 3, isCritical: true, norms: ["ISM Code"] },
        { id: "4.1.3", subelement: "Geral", description: "Empresa possui gestão de operações críticas? Todas mapeadas por análise de risco e procedimentadas?", evidences: "Operações críticas: atracação/desatracação, zona 500m, transferência de fluidos, transbordo de pessoas, pull-in/pull-out, movimentação de cargas, hook-up, pull back, SIMOPS, contenção de óleo, limites meteoceanográficos", weight: 3, isCritical: true, norms: ["ISM Code", "SOLAS", "NR-37"] },
        { id: "4.1.4", subelement: "Geral", description: "Procedimento para autorização à UM antes de entrar na zona de 500m?", evidences: "Procedimento; Registros de aproximações; Protocolos; Bump Test; Calibração detectores de gases", weight: 3, isCritical: true, norms: ["NORMAM", "NR-20"] },
        { id: "4.1.5", subelement: "Geral", description: "Utilização dos protocolos de aproximação e medição de gases tóxicos (vents)?", evidences: "Registros de aproximação; Medição de gases", weight: 3, isCritical: false, norms: ["NORMAM"] },
        { id: "4.1.6", subelement: "Geral", description: "Procedimento para operações simultâneas (SIMOPS)? Detalhamento de exclusões? Planejamento e estudos de riscos?", evidences: "Procedimentos; Listas de verificação; Registros; Treinamentos", weight: 3, isCritical: true, norms: ["ISM Code"] },
        { id: "4.1.7", subelement: "Geral", description: "Permissões para trabalho emitidas corretamente? APR, isolamentos, FISPQ, SIMOPS, rastreabilidade?", evidences: "Verificar PTs; Procedimentos; Regras de Ouro Petrobras; NR-10,20,30,33,34,35; Consolidação do ciclo anterior", weight: 3, isCritical: true, norms: ["NR-34", "NR-33", "NR-35", "NR-10", "NR-20"] }
      ]},
      { id: "4.2", name: "Transporte de Pessoas", items: [
        { id: "4.2.1", subelement: "Transporte de Pessoas", description: "Transferência de trabalhadores conforme NR-37 itens 37.11.4.1 e 37.11.5?", evidences: "Procedimentos; Evidências de implementação: período diurno, treinamento, colete, mãos livres, orientação, consentimento, condições físicas/psicológicas", weight: 3, isCritical: true, norms: ["NR-37", "NORMAM-01"] },
        { id: "4.2.2", subelement: "Transporte de Pessoas", description: "Efeitos de condições de tempo/mar considerados? Anemômetro operacional e calibrado?", evidences: "Procedimento documentado", weight: 3, isCritical: false, norms: ["NR-37"] }
      ]},
      { id: "4.3", name: "Transporte de Cargas e Granéis", items: [
        { id: "4.3.1", subelement: "Cargas e Granéis", description: "Procedimento para transporte de materiais/fontes radioativas (CNEN)? Arrumação conforme IMDG Code?", evidences: "Documentações; Autorizações e licenças", weight: 3, isCritical: false, norms: ["CNEN", "IMDG Code"] },
        { id: "4.3.2", subelement: "Cargas e Granéis", description: "Operação com cargas e graneis planejada, procedimentada? Questões de lastro e abastecimento?", evidences: "Procedimentos para carga, lastro, abastecimento; Oficial designado/PIC; Mangueiras adequadas; Computadores de estabilidade testados", weight: 3, isCritical: true, norms: ["SOLAS", "ISM Code"] },
        { id: "4.3.3", subelement: "Cargas e Granéis", description: "Comandante inicia transferência de granéis líquidos somente com mangotes totalmente desenrolados?", evidences: "Procedimento; Constatação durante operação", weight: 3, isCritical: false, norms: ["MARPOL"] },
        { id: "4.3.4", subelement: "Cargas e Granéis", description: "Mangotes com flutuadores visíveis no mar (mínimo 4, emendas com um de cada lado)?", evidences: "Procedimento; Constatação durante operação", weight: 3, isCritical: false, norms: ["MARPOL"] },
        { id: "4.3.5", subelement: "Cargas e Granéis", description: "Mangotes e conexões inspecionados a cada uso? Armazenamento adequado sem dobras/fissuras?", evidences: "Procedimento; Registro de inspeção; Certificado de qualidade", weight: 3, isCritical: false, norms: ["MARPOL"] }
      ]},
      { id: "4.4", name: "Segurança da Navegação", items: [
        { id: "4.4.1", subelement: "Navegação", description: "Designação de pessoal responsável pela navegação segura com procedimentos adequados?", evidences: "Designação em terra; Procedimentos de navegação; BRM; Manutenção de equipamentos operacionais", weight: 3, isCritical: true, norms: ["STCW", "ISM Code"] },
        { id: "4.4.2", subelement: "Navegação", description: "Avaliações periódicas para garantir a navegação segura?", evidences: "Auditoria de navegação pelo Comandante; Avaliações pelo pessoal de terra; Revisão regular dos procedimentos", weight: 3, isCritical: false, norms: ["ISM Code"] },
        { id: "4.4.3", subelement: "Navegação", description: "Procedimento para identificar defeitos recorrentes em equipamentos de navegação na frota?", evidences: "Procedimento; Registro de defeitos e correções", weight: 3, isCritical: false, norms: ["SOLAS"] },
        { id: "4.4.4", subelement: "Navegação", description: "Fornecimento de cartas, publicações e licenças eletrônicas gerenciado por agente reconhecido?", evidences: "Apresentar agente de cartas; Verificar fornecimento", weight: 3, isCritical: false, norms: ["SOLAS", "IMO"] },
        { id: "4.4.5", subelement: "Navegação", description: "Auditorias frequentes dos procedimentos de navegação?", evidences: "Auditorias de navegação durante passagem; Análise de tendências; Planos de melhoria", weight: 3, isCritical: false, norms: ["ISM Code"] },
        { id: "4.4.6", subelement: "Navegação", description: "Competências e qualificações do pessoal de navegação verificadas? Treinamento adequado e periódico em simulador BRM?", evidences: "Avaliação de competência; Treinamento em simulador credenciado", weight: 3, isCritical: false, norms: ["STCW", "IMCA 117"] }
      ]},
      { id: "4.5", name: "Equipamentos de Reboque e Amarração", items: [
        { id: "4.5.1", subelement: "Reboque e Amarração", description: "Procedimento de inspeção do equipamento de reboque/emergência?", evidences: "Procedimento; Registro de inspeção; Certificação", weight: 3, isCritical: false, norms: ["SOLAS"] },
        { id: "4.5.2", subelement: "Reboque e Amarração", description: "Limites operacionais estabelecidos para tarefa segura?", evidences: "Procedimento documentado", weight: 3, isCritical: false, norms: ["ISM Code"] },
        { id: "4.5.3", subelement: "Reboque e Amarração", description: "Todo equipamento de reboque certificado e certificados válidos disponíveis?", evidences: "Certificados", weight: 3, isCritical: false, norms: ["SOLAS"] },
        { id: "4.5.4", subelement: "Reboque e Amarração", description: "Procedimentos de amarração adequados garantindo segurança? Práticas seguras e supervisão?", evidences: "Procedimentos conforme regulamentos; Avaliação de risco; Planos de amarração dispersa", weight: 3, isCritical: false, norms: ["SOLAS"] }
      ]},
      { id: "4.6", name: "Convés", items: [
        { id: "4.6.1", subelement: "Convés", description: "Zonas de segurança demarcadas (Safety Zones e Dangerous Good Area)?", evidences: "Constatação visual", weight: 3, isCritical: false, norms: ["SOLAS"] },
        { id: "4.6.2", subelement: "Convés", description: "Escotilhas/portas com sinalização para fechamento durante navegação? Estanqueidade mantida?", evidences: "Procedimento; Constatação visual; Certificados", weight: 3, isCritical: false, norms: ["SOLAS", "Borda Livre"] },
        { id: "4.6.3", subelement: "Convés", description: "Equipamentos de salvatagem e combate a incêndio adequados e operacionais?", evidences: "Constatação visual; Checklist", weight: 3, isCritical: false, norms: ["SOLAS", "NORMAM-01"] },
        { id: "4.6.4", subelement: "Convés", description: "Suspiros, tela corta chamas, válvulas de fechamento operacionais?", evidences: "Constatação visual; Checklist", weight: 3, isCritical: false, norms: ["SOLAS"] },
        { id: "4.6.5", subelement: "Convés", description: "Equipamentos de movimentação de carga com SWL identificado e certificados válidos?", evidences: "Procedimento; Constatação visual; Certificados; Tabela de cargas", weight: 3, isCritical: true, norms: ["NR-34", "SOLAS"] },
        { id: "4.6.6", subelement: "Convés", description: "Acessórios de içamento com SWL identificado e certificados válidos?", evidences: "Procedimento; Constatação visual; Certificados", weight: 3, isCritical: true, norms: ["NR-34"] },
        { id: "4.6.7", subelement: "Convés", description: "Equipamentos com risco de queda em boas condições? Trava-quedas instalados?", evidences: "Constatação visual; Programa DROPS", weight: 3, isCritical: false, norms: ["ISM Code"] }
      ]},
      { id: "4.7", name: "Praça de Máquinas", items: [
        { id: "4.7.1", subelement: "Praça de Máquinas", description: "Obstáculos, partes móveis protegidos/sinalizados? Rotas de fuga sinalizadas?", evidences: "Constatação visual; Checklist", weight: 3, isCritical: false, norms: ["NR-12", "SOLAS"] },
        { id: "4.7.2", subelement: "Praça de Máquinas", description: "Procedimento para partida e parada dos principais equipamentos e sistemas?", evidences: "Procedimento documentado", weight: 3, isCritical: false, norms: ["ISM Code"] },
        { id: "4.7.3", subelement: "Praça de Máquinas", description: "Válvulas de esgoto sanitário com indicação de posição fechada no porto (MARPOL Anexo 4)? Travadas e lacradas?", evidences: "Procedimento; Indicação afixada; Constatação visual", weight: 3, isCritical: false, norms: ["MARPOL Annexo 4"] },
        { id: "4.7.4", subelement: "Praça de Máquinas", description: "Oil Record Book preenchido corretamente? Todas as manobras, assinaturas, sem rasuras?", evidences: "Verificação do livro de registro", weight: 3, isCritical: false, norms: ["MARPOL Annexo 1"] }
      ]},
      { id: "4.8", name: "Saúde", items: [
        { id: "4.8.1", subelement: "Saúde", description: "Área segregada para tratamento de saúde? Fluxo de atendimento para casos graves? Contato médico de terra? Controle de medicamentos? PCMSO?", evidences: "Constatação visual; Portaria 311/DPC; NORMAM-01; Portarias SVS; ANVISA", weight: 3, isCritical: false, norms: ["NR-7", "NORMAM-01", "ANVISA"] }
      ]},
      { id: "4.9", name: "Alimentos/Cozinha/Refeitório", items: [
        { id: "4.9.1", subelement: "Alimentos", description: "Temperatura e integridade dos alimentos verificados na recepção/armazenagem? Manutenções e calibrações periódicas?", evidences: "Constatação visual; Registros; Monitoramento de temperatura; Procedimento; Certificados", weight: 3, isCritical: false, norms: ["ANVISA"] },
        { id: "4.9.2", subelement: "Alimentos", description: "Equipamentos de distribuição sob temperatura controlada e em bom funcionamento?", evidences: "Constatação visual; Checklist; Certificado dedetização; ANVISA", weight: 3, isCritical: false, norms: ["ANVISA"] },
        { id: "4.9.3", subelement: "Alimentos", description: "Câmara de refrigeração/congelamento com termômetros visíveis, registros e alarme de segurança?", evidences: "Registros; Certificado de calibração dos termômetros", weight: 3, isCritical: false, norms: ["ANVISA"] },
        { id: "4.9.4", subelement: "Alimentos", description: "Equipamento de trituração de alimentos e balança para pesagem antes do descarte?", evidences: "Registro de pesagem e descarte; Certificado de calibração", weight: 3, isCritical: false, norms: ["MARPOL Annexo 5"] }
      ]}
    ]
  },
  {
    id: 5,
    name: "Segurança Técnica e Eficiência Energética",
    sigla: "ST",
    description: "Navegação, DP, Eficiência Energética e baixo carbono",
    weightPercentage: 7.5,
    isCritical: false,
    importanceLevel: "normal",
    icon: "Navigation",
    category: "Técnico",
    subelements: [
      { id: "5.1", name: "Segurança na Navegação", items: [
        { id: "5.1.1", subelement: "Navegação", description: "Pessoal de base designado e qualificado para procedimentos de navegação?", evidences: "Registro de designação; Evidências de qualificação", weight: 3, isCritical: false, norms: ["STCW"] },
        { id: "5.1.2", subelement: "Navegação", description: "Procedimentos robustos de segurança na navegação e monitoramento de manobras?", evidences: "Procedimentos; Definição de procedimento crítico; Padrões de manobra dos portos", weight: 3, isCritical: false, norms: ["ISM Code", "STCW"] },
        { id: "5.1.3", subelement: "Navegação", description: "Procedimento efetivo de BRM (Bridge Resource Management)?", evidences: "Procedimento; Planejamento de trajeto; Navegação eletrônica; Cartas eletrônicas; Relação prático-equipe", weight: 3, isCritical: false, norms: ["STCW A-II/1", "STCW A-III/1"] },
        { id: "5.1.4", subelement: "Navegação", description: "Equipamentos de navegação operacionais?", evidences: "Verificação na embarcação", weight: 3, isCritical: false, norms: ["SOLAS"] },
        { id: "5.1.5", subelement: "Navegação", description: "Setor responsável realiza verificações periódicas e VCPs nos procedimentos de navegação?", evidences: "Procedimentos; Revisões de VCP", weight: 3, isCritical: false, norms: ["ISM Code"] },
        { id: "5.1.6", subelement: "Navegação", description: "Sistema que garanta contratação de oficiais formados e habilitados pela autoridade marítima?", evidences: "Verificar sistemática de contratação", weight: 3, isCritical: false, norms: ["STCW"] },
        { id: "5.1.7", subelement: "Navegação", description: "Auditorias nas práticas de navegação, atracação, desatracação e operações com UMs?", evidences: "Verificar auditorias realizadas", weight: 3, isCritical: false, norms: ["ISM Code"] },
        { id: "5.1.8", subelement: "Navegação", description: "Oficiais passam por treinamentos periódicos em simuladores conforme IMCA 117?", evidences: "Treinamentos realizados; Entrevistas com comandantes", weight: 3, isCritical: false, norms: ["IMCA 117"] }
      ]},
      { id: "5.2", name: "Atividades de DP (Posicionamento Dinâmico)", items: [
        { id: "5.2.1", subelement: "DP", description: "ASOG/CAM implementado e atualizado para embarcações DP?", evidences: "Procedimento ASOG/CAM; Registros de aplicação; Treinamento da tripulação", weight: 3, isCritical: true, norms: ["IMCA 103", "IMCA 117"] },
        { id: "5.2.2", subelement: "DP", description: "Pessoal de DP qualificado conforme IMCA 117? Treinamento em simulador atualizado?", evidences: "Certificados DPO; Registros de treinamento; Logbook de DP", weight: 3, isCritical: true, norms: ["IMCA 117"] },
        { id: "5.2.3", subelement: "DP", description: "Testes de DP realizados conforme IMCA M 166?", evidences: "Registros de Annual DP Trials; FMEA do DP", weight: 3, isCritical: true, norms: ["IMCA M 166"] }
      ]},
      { id: "5.3", name: "Eficiência Energética", items: [
        { id: "5.3.1", subelement: "Eficiência Energética", description: "Empresa possui programa de eficiência energética e redução de emissões de GEE?", evidences: "Programa documentado; Indicadores de consumo; Metas de redução; SEEMP", weight: 3, isCritical: false, norms: ["MARPOL Annex VI", "IMO SEEMP"] },
        { id: "5.3.2", subelement: "Eficiência Energética", description: "Monitoramento de consumo de combustível e emissões por embarcação?", evidences: "Registros de consumo; Relatórios de emissões; Indicadores EEOI", weight: 3, isCritical: false, norms: ["MARPOL Annex VI"] }
      ]}
    ]
  },
  {
    id: 6,
    name: "Manutenção e Confiabilidade",
    sigla: "MN",
    description: "Sistema de manutenção planejado - ELEMENTO DE MAIOR PESO",
    weightPercentage: 9.5,
    isCritical: true,
    importanceLevel: "critical",
    icon: "Wrench",
    category: "Manutenção",
    subelements: [
      { id: "6.1", name: "Sistema de Manutenção Planejada (PMS)", items: [
        { id: "6.1.1", subelement: "PMS", description: "A empresa possui sistema informatizado de manutenção planejada (PMS) implementado e efetivo em toda frota?", evidences: "Sistema PMS; Evidências de uso efetivo; Indicadores ICMP; Registros de manutenção", weight: 3, isCritical: true, norms: ["ISM Code 10", "NORMAM 01"] },
        { id: "6.1.2", subelement: "PMS", description: "Plano de manutenção abrange todos os equipamentos e sistemas críticos?", evidences: "Plano de manutenção; Lista de equipamentos críticos; Cronograma; Jobs preventivos no PMS", weight: 3, isCritical: true, norms: ["ISM Code", "NORMAM 01"] },
        { id: "6.1.3", subelement: "PMS", description: "Indicadores de manutenção são monitorados (ICMP, backlog, MTBF, MTTR)?", evidences: "Indicadores registrados; Análises de tendência; Planos de ação para desvios", weight: 3, isCritical: true, norms: ["ISM Code 10"] },
        { id: "6.1.4", subelement: "PMS", description: "Sobressalentes críticos são gerenciados e disponíveis a bordo e em terra?", evidences: "Lista de sobressalentes críticos; Controle de estoque; Evidências de disponibilidade", weight: 3, isCritical: true, norms: ["ISM Code"] },
        { id: "6.1.5", subelement: "PMS", description: "Manutenções corretivas são registradas e analisadas para retroalimentar o plano preventivo?", evidences: "Registros de manutenção corretiva; Análise de falhas; Atualização do plano preventivo", weight: 3, isCritical: false, norms: ["ISM Code 10"] }
      ]},
      { id: "6.2", name: "Inspeção e Certificação", items: [
        { id: "6.2.1", subelement: "Inspeção e Certificação", description: "Todos os certificados estatutários e de classe da embarcação estão válidos?", evidences: "Lista de certificados; Datas de validade; Programação de renovação", weight: 3, isCritical: true, norms: ["SOLAS", "NORMAM 01"] },
        { id: "6.2.2", subelement: "Inspeção e Certificação", description: "Programa de inspeções periódicas implementado para equipamentos críticos e de segurança?", evidences: "Programa de inspeções; Registros; Relatórios de inspeção; Ações corretivas", weight: 3, isCritical: true, norms: ["ISM Code", "SOLAS"] },
        { id: "6.2.3", subelement: "Inspeção e Certificação", description: "Inspeções de classe e bandeira são planejadas e realizadas sem atrasos?", evidences: "Cronograma de inspeções de classe; Registros de inspeções; Status de condições de classe", weight: 3, isCritical: true, norms: ["SOLAS", "Sociedade Classificadora"] }
      ]},
      { id: "6.3", name: "Confiabilidade e Integridade", items: [
        { id: "6.3.1", subelement: "Confiabilidade", description: "Programa de manutenção baseada em confiabilidade (RCM) ou análise de falhas implementado?", evidences: "Metodologia RCM; Análises de falha; Árvore de falhas; Registro de falhas e tendências", weight: 3, isCritical: false, norms: ["ISM Code"] },
        { id: "6.3.2", subelement: "Confiabilidade", description: "Sistema de gestão de integridade estrutural da embarcação implementado?", evidences: "Programa de medição de chapas; Relatórios de espessura; Plano de docagem; Registros de reparos estruturais", weight: 3, isCritical: true, norms: ["SOLAS", "Sociedade Classificadora"] }
      ]}
    ]
  },
  {
    id: 7, name: "Gestão de Mudanças", sigla: "GM", description: "Controle de mudanças temporárias e permanentes", weightPercentage: 6.0, isCritical: false, importanceLevel: "normal", icon: "RefreshCw", category: "Gestão",
    subelements: [{ id: "7.1", name: "Gestão de Mudanças (MOC)", items: [
      { id: "7.1.1", subelement: "MOC", description: "Procedimento formal de gestão de mudanças (MOC) implementado? Cobre mudanças organizacionais, operacionais, equipamentos, processos?", evidences: "Procedimento MOC; Registros de mudanças; Análise de risco para mudanças; Aprovação hierárquica; Comunicação", weight: 3, isCritical: false, norms: ["ISM Code", "NR-37"] },
      { id: "7.1.2", subelement: "MOC", description: "Mudanças temporárias são controladas com prazo definido e reversão planejada?", evidences: "Registros de mudanças temporárias; Controle de prazos; Reversão documentada", weight: 3, isCritical: false, norms: ["ISM Code"] },
      { id: "7.1.3", subelement: "MOC", description: "Análise de risco realizada antes de toda mudança significativa? Impactos em SMS avaliados?", evidences: "Análises de risco de mudanças; Registros de avaliação de impacto", weight: 3, isCritical: false, norms: ["ISM Code"] }
    ]}]
  },
  {
    id: 8, name: "Aquisição de Bens e Serviços", sigla: "AQ", description: "Qualificação de fornecedores e requisitos de SMS na cadeia", weightPercentage: 5.5, isCritical: false, importanceLevel: "normal", icon: "ShoppingCart", category: "Suprimentos",
    subelements: [{ id: "8.1", name: "Qualificação e Gestão de Fornecedores", items: [
      { id: "8.1.1", subelement: "Fornecedores", description: "Sistemática de qualificação de fornecedores com critérios de SMS?", evidences: "Procedimento de qualificação; Critérios de SMS; Auditorias em fornecedores; Lista de fornecedores qualificados", weight: 3, isCritical: false, norms: ["ISM Code"] },
      { id: "8.1.2", subelement: "Fornecedores", description: "Avaliação periódica de desempenho de fornecedores com indicadores de SMS?", evidences: "Avaliações de desempenho; Indicadores; Planos de ação para desvios", weight: 3, isCritical: false, norms: ["ISM Code"] },
      { id: "8.1.3", subelement: "Fornecedores", description: "Fornecedores de serviços críticos (terceirizados a bordo) atendem aos mesmos requisitos de SMS da empresa?", evidences: "Contratos com requisitos de SMS; Evidências de monitoramento; Treinamentos para terceirizados", weight: 3, isCritical: false, norms: ["ISM Code", "NR-34"] }
    ]}]
  },
  {
    id: 9, name: "Gestão de Recursos Humanos", sigla: "RH", description: "Treinamentos, certificações, fatores humanos e CRM", weightPercentage: 8.0, isCritical: false, importanceLevel: "high", icon: "GraduationCap", category: "RH",
    subelements: [
      { id: "9.1", name: "Capacitação e Treinamento", items: [
        { id: "9.1.1", subelement: "Capacitação", description: "Matriz de treinamento implementada incluindo requisitos STCW, cliente, legais e organizacionais?", evidences: "Matriz de exigências de treinamento; Registros de treinamento; Software de gestão de tripulantes", weight: 3, isCritical: false, norms: ["STCW", "ISM Code"] },
        { id: "9.1.2", subelement: "Capacitação", description: "Treinamentos de familiarização a bordo realizados para todos os tripulantes?", evidences: "Registros de familiarização; Checklist de familiarização; Entrevistas", weight: 3, isCritical: false, norms: ["ISM Code", "STCW"] },
        { id: "9.1.3", subelement: "Capacitação", description: "Avaliação de eficácia dos treinamentos realizados?", evidences: "Avaliações de eficácia; Avaliações práticas; Entrevistas", weight: 3, isCritical: false, norms: ["ISM Code"] }
      ]},
      { id: "9.2", name: "Fatores Humanos", items: [
        { id: "9.2.1", subelement: "Fatores Humanos", description: "Programa de fatores humanos implementado (fadiga, CRM, BRM)?", evidences: "Programa de FH; Controle de horas de trabalho/descanso (MLC 2006); Treinamento CRM/BRM", weight: 3, isCritical: false, norms: ["STCW", "MLC 2006", "IMCA 117"] },
        { id: "9.2.2", subelement: "Fatores Humanos", description: "Controle efetivo de horas de trabalho e descanso conforme STCW/MLC 2006?", evidences: "Registros de horas; Software de controle; Conformidade com limites", weight: 3, isCritical: false, norms: ["STCW", "MLC 2006"] },
        { id: "9.2.3", subelement: "Fatores Humanos", description: "Investigação de incidentes considera fatores humanos na análise de causa raiz?", evidences: "Relatórios de investigação com análise de FH; Metodologia (Reason, HFACS)", weight: 3, isCritical: false, norms: ["ISM Code"] }
      ]}
    ]
  },
  {
    id: 10, name: "Gestão da Informação", sigla: "GI", description: "Sistema documental, comunicação e ouvidoria", weightPercentage: 5.0, isCritical: false, importanceLevel: "normal", icon: "FileText", category: "Informação",
    subelements: [{ id: "10.1", name: "Controle de Documentos e Comunicação", items: [
      { id: "10.1.1", subelement: "Documentos", description: "Sistema de controle de documentos implementado com lista mestra, revisões e aprovações?", evidences: "Lista mestra; Sistema de gestão documental; Procedimentos de aprovação e revisão", weight: 3, isCritical: false, norms: ["ISM Code 11"] },
      { id: "10.1.2", subelement: "Documentos", description: "Comunicação interna efetiva entre base e embarcações sobre mudanças em procedimentos, alertas de SMS?", evidences: "Registros de comunicação; Circulares; Evidências de recebimento; Ouvidoria", weight: 3, isCritical: false, norms: ["ISM Code 11"] },
      { id: "10.1.3", subelement: "Documentos", description: "Documentos e procedimentos disponíveis e atualizados a bordo?", evidences: "Verificação a bordo; Versões atualizadas; Acesso pelos tripulantes", weight: 3, isCritical: false, norms: ["ISM Code 11"] }
    ]}]
  },
  {
    id: 11, name: "Preparação e Resposta a Emergências", sigla: "PE", description: "Planos de contingência, simulados e ICS", weightPercentage: 8.5, isCritical: true, importanceLevel: "critical", icon: "Siren", category: "Emergência",
    subelements: [{ id: "11.1", name: "Planos de Emergência e Simulados", items: [
      { id: "11.1.1", subelement: "Emergências", description: "Planos de emergência (SOPEP, Contingência, Abandono) disponíveis, atualizados e conhecidos pela tripulação?", evidences: "Planos de emergência; Registros de treinamento; Entrevistas; Estações de emergência", weight: 3, isCritical: true, norms: ["ISM Code 8", "SOLAS III", "MARPOL"] },
      { id: "11.1.2", subelement: "Emergências", description: "Simulados de emergência realizados com periodicidade adequada cobrindo todos os cenários?", evidences: "Cronograma de simulados; Relatórios de simulados; Avaliações; Ações de melhoria", weight: 3, isCritical: true, norms: ["ISM Code 8", "SOLAS"] },
      { id: "11.1.3", subelement: "Emergências", description: "Sistema de Comando de Incidentes (ICS) implementado e treinado?", evidences: "Procedimento ICS; Treinamentos; Registros; Organização de crise", weight: 3, isCritical: true, norms: ["ISM Code 8"] },
      { id: "11.1.4", subelement: "Emergências", description: "Equipamentos de emergência (salvatagem, combate a incêndio) inspecionados e certificados?", evidences: "Certificados válidos; Registros de inspeção; Manutenção periódica", weight: 3, isCritical: true, norms: ["SOLAS III", "NORMAM-01"] },
      { id: "11.1.5", subelement: "Emergências", description: "Procedimento de notificação de emergências para autoridades competentes e Petrobras?", evidences: "Procedimento de notificação; Contatos atualizados; Registros de comunicação", weight: 3, isCritical: false, norms: ["ISM Code 8"] }
    ]}]
  },
  {
    id: 12, name: "Análise de Acidentes e Incidentes", sigla: "AI", description: "Investigação, análise de causa raiz e aprendizado organizacional", weightPercentage: 8.0, isCritical: true, importanceLevel: "critical", icon: "Search", category: "Segurança",
    subelements: [{ id: "12.1", name: "Investigação e Análise", items: [
      { id: "12.1.1", subelement: "Investigação", description: "Procedimento de investigação de acidentes/incidentes implementado com metodologia estruturada?", evidences: "Procedimento de investigação; Metodologia (IOGP 621, Bow-Tie, Reason); Registros de investigações realizadas", weight: 3, isCritical: true, norms: ["ISM Code 9", "IOGP 621"] },
      { id: "12.1.2", subelement: "Investigação", description: "Análises de causa raiz realizadas para todos os incidentes significativos?", evidences: "Relatórios de investigação com análise de causa raiz; Ações corretivas; Prazos de implementação", weight: 3, isCritical: true, norms: ["ISM Code 9"] },
      { id: "12.1.3", subelement: "Investigação", description: "Compartilhamento de lições aprendidas com toda a frota?", evidences: "Alertas de SMS; Comunicações; Reuniões de segurança; Registros de divulgação", weight: 3, isCritical: false, norms: ["ISM Code 9"] },
      { id: "12.1.4", subelement: "Investigação", description: "Sistema de reporte de quase-acidentes (near miss) implementado e incentivado?", evidences: "Procedimento de reporte; Registros de near miss; Análise e tratamento; Indicadores", weight: 3, isCritical: false, norms: ["ISM Code 9"] },
      { id: "12.1.5", subelement: "Investigação", description: "Notificação de acidentes para Petrobras e autoridades realizada conforme prazos definidos?", evidences: "Procedimento de notificação; Registros; Conformidade com prazos", weight: 3, isCritical: true, norms: ["ISM Code 9", "NORMAM"] }
    ]}]
  },
  {
    id: 13, name: "Processo de Melhoria Contínua", sigla: "MC", description: "Auditorias internas, análise crítica e indicadores de desempenho", weightPercentage: 7.5, isCritical: false, importanceLevel: "high", icon: "TrendingUp", category: "Melhoria",
    subelements: [{ id: "13.1", name: "Auditorias e Análise Crítica", items: [
      { id: "13.1.1", subelement: "Melhoria Contínua", description: "Programa de auditorias internas com cronograma para toda a frota cobrindo todos os elementos?", evidences: "Programa de auditorias; Cronograma; Relatórios; Qualificação dos auditores; Ações corretivas", weight: 3, isCritical: false, norms: ["ISM Code 12", "ISO 9001"] },
      { id: "13.1.2", subelement: "Melhoria Contínua", description: "Análise Crítica pela Direção (Management Review) realizada periodicamente?", evidences: "Atas de análise crítica; Indicadores revisados; Metas definidas; Planos de ação", weight: 3, isCritical: false, norms: ["ISM Code 12"] },
      { id: "13.1.3", subelement: "Melhoria Contínua", description: "Indicadores de desempenho de SMS são monitorados e analisados em tendências?", evidences: "Painel de indicadores; Análise de tendências; Benchmarking; Ações para desvios", weight: 3, isCritical: false, norms: ["ISM Code 12"] },
      { id: "13.1.4", subelement: "Melhoria Contínua", description: "Não conformidades de auditorias anteriores foram tratadas e eficácia verificada?", evidences: "Registros de NC; Ações corretivas; Verificação de eficácia; Fechamento no BROA", weight: 3, isCritical: false, norms: ["ISM Code 12"] }
    ]}]
  }
];

/**
 * Helper to get total items count
 */
export function getTotalItems(): number {
  return PEOTRAM_ELEMENTS.reduce((total, el) => 
    total + el.subelements.reduce((sub, s) => sub + s.items.length, 0), 0);
}

/**
 * Helper to get all items for a specific element
 */
export function getElementItems(elementId: number): PeotramItem[] {
  const element = PEOTRAM_ELEMENTS.find(e => e.id === elementId);
  if (!element) return [];
  return element.subelements.flatMap(s => s.items);
}

/**
 * Helper to get element by id
 */
export function getElementById(elementId: number): PeotramElement | undefined {
  return PEOTRAM_ELEMENTS.find(e => e.id === elementId);
}

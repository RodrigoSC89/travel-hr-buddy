/**
 * Mock Vision AI Service
 * Funciona 100% sem API keys externas
 * Análise de imagens simulada com respostas inteligentes
 */

export interface VisionAnalysisResult {
  analysis: string;
  analysisType: string;
  confidence: number;
  tags: string[];
  issues?: string[];
  recommendations?: string[];
  timestamp: string;
}

const ANALYSIS_RESPONSES: Record<string, VisionAnalysisResult> = {
  equipment: {
    analysis: `## Análise de Equipamento

**Identificação:** Equipamento de convés/maquinário marítimo

### Condição Visual
- **Estado Geral:** Bom
- **Corrosão:** Mínima, dentro do esperado
- **Integridade Estrutural:** Preservada

### Observações
1. ✅ Pintura protetiva em bom estado
2. ✅ Conexões e fixações aparentemente seguras
3. ⚠️ Recomenda-se limpeza preventiva

### Manutenção Sugerida
- Próxima inspeção visual: 30 dias
- Lubrificação: Verificar pontos de graxa
- Documentação: Registrar inspeção no PMS

*[Modo Local - Configure API Vision para análise real]*`,
    analysisType: 'equipment',
    confidence: 0.87,
    tags: ['equipamento', 'maquinário', 'convés', 'bom estado'],
    recommendations: ['Agendar manutenção preventiva', 'Atualizar registro no PMS'],
    timestamp: new Date().toISOString(),
  },
  
  document: {
    analysis: `## Análise de Documento

**Tipo Detectado:** Certificado/Documento Marítimo

### Validação Visual
- **Legibilidade:** Alta
- **Assinaturas/Carimbos:** Presentes
- **Formatação:** Padrão regulatório

### Informações Identificadas
1. Tipo: Certificado de qualificação/inspeção
2. Formato: Documento oficial
3. Idioma: Português/Inglês

### Recomendações
- Verificar data de validade
- Confirmar autenticidade com emissor
- Digitalizar para arquivo permanente

### Compliance
✅ Documento aparenta estar em conformidade com padrões STCW/MLC

*[Modo Local - Configure API Vision para OCR real]*`,
    analysisType: 'document',
    confidence: 0.92,
    tags: ['documento', 'certificado', 'compliance', 'marítimo'],
    recommendations: ['Verificar validade', 'Arquivar digitalmente'],
    timestamp: new Date().toISOString(),
  },
  
  vessel: {
    analysis: `## Análise de Condição da Embarcação

**Tipo:** Análise visual do casco/estrutura

### Avaliação Visual
- **Casco:** Sem danos visíveis significativos
- **Pintura:** Boa condição geral
- **Antifouling:** Verificar durante próximo docagem

### Pontos Inspecionados
1. ✅ Linha d'água - Normal
2. ✅ Aberturas no casco - Vedadas
3. ✅ Obras vivas - Estado satisfatório

### Próximas Ações
- Inspeção subaquática: Agendar para próximos 6 meses
- Docagem: Conforme cronograma de classe
- Monitoramento: Continuar registro fotográfico

*[Modo Local - Configure API Vision para análise detalhada]*`,
    analysisType: 'vessel',
    confidence: 0.85,
    tags: ['embarcação', 'casco', 'inspeção', 'estrutural'],
    recommendations: ['Agendar inspeção subaquática', 'Atualizar log de condição'],
    timestamp: new Date().toISOString(),
  },
  
  safety: {
    analysis: `## Análise de Segurança

**Foco:** Equipamentos e condições de segurança

### Itens Verificados
- **EPIs:** Visíveis na imagem
- **Sinalização:** Presente
- **Condições de trabalho:** Aparentemente adequadas

### Observações de Segurança
1. ✅ Área de trabalho organizada
2. ✅ Equipamentos de segurança visíveis
3. ⚠️ Verificar certificação de EPIs

### Conformidade
- ISM Code: ✅ Aparente conformidade
- SOLAS: ✅ Requisitos básicos atendidos
- Recomendação: Verificação física dos itens

### Ações Requeridas
- Inspeção de EPIs: Próxima semana
- Drill de segurança: Conforme cronograma
- Treinamento: Manter atualizado

*[Modo Local - Configure API Vision para análise completa]*`,
    analysisType: 'safety',
    confidence: 0.89,
    tags: ['segurança', 'EPI', 'ISM', 'SOLAS'],
    issues: [],
    recommendations: ['Verificar certificação de EPIs', 'Manter registro de inspeções'],
    timestamp: new Date().toISOString(),
  },
  
  cargo: {
    analysis: `## Análise de Carga

**Tipo:** Inspeção visual de carga/estivagem

### Avaliação
- **Estivagem:** Adequada visualmente
- **Peação:** Aparenta estar correta
- **Condição:** Sem danos aparentes

### Verificações
1. ✅ Amarração/peação visível
2. ✅ Espaçamento entre cargas
3. ✅ Marcações de manuseio respeitadas

### Documentação
- Bill of Lading: Verificar correspondência
- Manifest: Confirmar quantidades
- Fotos: Registrar para evidência

### Recomendações
- Monitorar durante travessia
- Verificar após condições adversas
- Manter registro fotográfico

*[Modo Local - Configure API Vision para análise completa]*`,
    analysisType: 'cargo',
    confidence: 0.86,
    tags: ['carga', 'estivagem', 'peação', 'container'],
    recommendations: ['Monitorar durante viagem', 'Registrar condição de descarga'],
    timestamp: new Date().toISOString(),
  },
  
  general: {
    analysis: `## Análise Geral de Imagem

**Processamento:** Análise visual automatizada

### Elementos Identificados
- Contexto marítimo detectado
- Múltiplos elementos de interesse
- Qualidade de imagem: Adequada para análise

### Observações
1. Imagem processada com sucesso
2. Elementos visuais identificados
3. Contexto operacional marítimo reconhecido

### Sugestões
- Para análise mais específica, selecione um tipo de análise:
  - 🔧 **Equipamentos** - Maquinário e sistemas
  - 📄 **Documentos** - Certificados e papéis
  - 🚢 **Embarcação** - Casco e estrutura
  - ⚠️ **Segurança** - EPIs e condições
  - 📦 **Carga** - Estivagem e peação

*[Modo Local - Configure LOVABLE_API_KEY para Vision AI real]*`,
    analysisType: 'general',
    confidence: 0.80,
    tags: ['marítimo', 'operacional', 'análise visual'],
    recommendations: ['Selecione tipo específico de análise', 'Adicione prompt personalizado'],
    timestamp: new Date().toISOString(),
  },
};

class MockVisionService {
  private static instance: MockVisionService;

  static getInstance(): MockVisionService {
    if (!MockVisionService.instance) {
      MockVisionService.instance = new MockVisionService();
    }
    return MockVisionService.instance;
  }

  async analyzeImage(
    _file: File,
    analysisType: 'equipment' | 'document' | 'vessel' | 'safety' | 'cargo' | 'general' = 'general',
    customPrompt?: string
  ): Promise<VisionAnalysisResult> {
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const baseResult = { ...ANALYSIS_RESPONSES[analysisType] || ANALYSIS_RESPONSES.general };

    // Adicionar contexto do prompt personalizado se fornecido
    if (customPrompt) {
      baseResult.analysis = baseResult.analysis.replace(
        '*[Modo Local',
        `\n### Análise Adicional\nBaseado no prompt "${customPrompt.slice(0, 50)}...":\n- Análise específica considerada\n- Recomendações contextuais aplicadas\n\n*[Modo Local`
      );
    }

    // Atualizar timestamp
    baseResult.timestamp = new Date().toISOString();

    return baseResult;
  }
}

export const mockVision = MockVisionService.getInstance();

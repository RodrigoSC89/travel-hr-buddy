# 📋 Guia do Usuário - Lista de Auditorias IMCA

## Introdução

Sistema de gerenciamento de auditorias técnicas IMCA com recursos avançados de análise e exportação.

## Acesso

**URL**: `/admin/lista-auditorias-imca`

**Navegação**: Admin → Lista de Auditorias IMCA

## Funcionalidades

### 1. 📊 Visualização de Auditorias

Ao acessar a página, você verá:

- **Título**: "📋 Auditorias Técnicas IMCA"
- **Botões de Exportação**: CSV e PDF no canto superior direito
- **Campo de Filtro**: Para buscar auditorias específicas
- **Painel de Frota**: Mostra todas as embarcações auditadas
- **Lista de Auditorias**: Cards com informações detalhadas

### 2. 🔍 Filtragem Inteligente

**Como usar**:
1. Digite no campo "🔍 Filtrar por navio, norma, item ou resultado..."
2. A lista é filtrada automaticamente enquanto você digita
3. Busca em múltiplos campos simultaneamente

**Exemplos de busca**:
- "Navio Alpha" - encontra auditorias deste navio
- "IMCA M103" - encontra auditorias desta norma
- "Não Conforme" - encontra todas as não conformidades
- "sistema de lastro" - busca por item auditado

### 3. 🎨 Badges de Status

Cada auditoria exibe um badge colorido indicando o resultado:

| Status | Badge | Significado |
|--------|-------|-------------|
| Conforme | 🟢 Verde | Item está em conformidade |
| Não Conforme | 🔴 Vermelho | Item precisa correção |
| Não Aplicável | ⚫ Cinza | Item não se aplica |

### 4. 📤 Exportação de Dados

#### Exportar CSV

**Passos**:
1. Clique em "Exportar CSV"
2. O arquivo `auditorias_imca_YYYY-MM-DD.csv` será baixado
3. Abra no Excel, Google Sheets ou similar

**Conteúdo**:
- Navio
- Data
- Norma
- Item Auditado
- Resultado
- Comentários

**Uso recomendado**:
- Análise de dados
- Relatórios periódicos
- Importação em outros sistemas

#### Exportar PDF

**Passos**:
1. Clique em "Exportar PDF"
2. Aguarde a geração (pode levar alguns segundos)
3. O arquivo `auditorias_imca_YYYY-MM-DD.pdf` será baixado

**Conteúdo**:
- Snapshot visual completo da lista atual
- Mantém cores e formatação
- Pronto para impressão ou apresentação

**Uso recomendado**:
- Relatórios oficiais
- Apresentações
- Arquivo físico

### 5. 🤖 Análise com IA (GPT-4)

Disponível **apenas para itens "Não Conforme"**.

**Como usar**:
1. Localize uma auditoria com status "Não Conforme"
2. Clique no botão "🧠 Análise IA e Plano de Ação"
3. Aguarde a geração (5-15 segundos)
4. Visualize os dois painéis que aparecem:

#### 📘 Explicação IA

Fornece análise técnica detalhada:

**Conteúdo**:
- **Significado da Não Conformidade**: O que significa estar não conforme
- **Riscos Associados**: Riscos de segurança e operacionais
- **Nível de Criticidade**: Crítica, Alta, Média ou Baixa
- **Referências Técnicas**: Seções específicas da norma IMCA

**Exemplo**:
```
Significado: O sistema de lastro não está operando 
conforme IMCA M103 seção 4.2.1...

Riscos: Risco de instabilidade da embarcação em 
operações offshore...

Criticidade: ALTA - Impacto direto na segurança...

Referências: IMCA M103 §4.2.1, §4.2.3...
```

#### 📋 Plano de Ação

Fornece roadmap estruturado para correção:

**Estrutura**:

1. **Ações Imediatas (7 dias)**
   - 2-3 ações prioritárias
   - Foco em mitigação de riscos

2. **Ações de Curto Prazo (1 mês)**
   - 3-4 ações estruturais
   - Melhorias de processo

3. **Responsáveis Sugeridos**
   - Departamentos envolvidos
   - Funções específicas

4. **Recursos Necessários**
   - Humanos, materiais, financeiros
   - Treinamentos requeridos

5. **KPIs de Validação**
   - Como medir a eficácia
   - Critérios de conformidade

**Exemplo**:
```
AÇÕES IMEDIATAS (7 dias):
1. Inspeção completa do sistema de lastro
2. Isolamento de áreas afetadas
3. Notificação ao Capitão e Gerente de Segurança

AÇÕES DE CURTO PRAZO (1 mês):
1. Retrofit completo do sistema
2. Atualização de procedimentos
...
```

### 6. 🚢 Painel de Frota

**Localização**: Abaixo do filtro

**Informação**: Lista todas as embarcações que têm auditorias registradas no período filtrado.

**Exemplo**:
```
🚢 Frota Auditada
Alpha, Beta, Charlie, Delta
```

## Informações do Card de Auditoria

Cada card exibe:

```
┌─────────────────────────────────────────┐
│ 🚢 Nome do Navio              [Badge]   │
│ DD/MM/YYYY - Norma: IMCA M103           │
├─────────────────────────────────────────┤
│ Item auditado:                          │
│ Sistema de lastro                       │
│                                         │
│ Comentários:                            │
│ Vazamento detectado na válvula...       │
│                                         │
│ [🧠 Análise IA e Plano de Ação]        │
└─────────────────────────────────────────┘
```

## Dicas de Uso

### ✅ Boas Práticas

1. **Filtro Eficiente**
   - Use termos específicos
   - Combine com exportação para subconjuntos

2. **Análise IA**
   - Gere análises para todas as não conformidades
   - Salve os planos de ação para referência futura
   - Use como base para documentação oficial

3. **Exportação Regular**
   - CSV semanal para análise de tendências
   - PDF mensal para arquivo oficial
   - Mantenha backups organizados

4. **Priorização**
   - Foque primeiro nas não conformidades
   - Use análise IA para estabelecer prioridades
   - Acompanhe planos de ação gerados

### ⚠️ Limitações

1. **Análise IA**
   - Requer conexão com internet
   - Pode levar 5-15 segundos
   - Disponível apenas para "Não Conforme"
   - Requer configuração de API key

2. **Exportação PDF**
   - Para muitos registros (>100), pode demorar
   - Considere filtrar antes de exportar
   - Qualidade depende do navegador

3. **Filtro**
   - Case-insensitive (não diferencia maiúsculas)
   - Busca por texto contido, não exato
   - Não suporta regex ou wildcards

## Fluxo de Trabalho Recomendado

### Análise Diária

```
1. Acesse /admin/lista-auditorias-imca
2. Filtre por data recente
3. Revise novas auditorias
4. Gere análise IA para não conformidades
5. Distribua planos de ação às equipes
```

### Relatório Semanal

```
1. Sem filtro (visualizar tudo)
2. Exportar CSV
3. Analisar tendências no Excel
4. Identificar navios com mais não conformidades
5. Agendar ações corretivas
```

### Relatório Mensal

```
1. Filtrar por mês específico
2. Exportar PDF para arquivo oficial
3. Revisar todas as análises IA geradas
4. Consolidar planos de ação
5. Apresentar para gestão
```

### Auditoria Específica

```
1. Filtrar por nome do navio
2. Revisar histórico completo
3. Gerar análise IA se necessário
4. Exportar subset em CSV/PDF
5. Acompanhar planos de ação pendentes
```

## Perguntas Frequentes

**Q: Posso editar uma auditoria?**
R: Não, esta é uma visualização read-only. Para editar, use o sistema de criação de auditorias.

**Q: A análise IA é confiável?**
R: Sim, usa GPT-4 com prompts especializados em segurança marítima. Sempre revise com expertise técnico.

**Q: Quantas auditorias posso visualizar?**
R: Sem limite, mas considere filtrar para melhor performance.

**Q: O filtro salva meu histórico?**
R: Não, o filtro é resetado ao sair da página.

**Q: Posso exportar apenas não conformidades?**
R: Sim, filtre por "Não Conforme" antes de exportar.

**Q: A análise IA tem custo?**
R: Sim, usa créditos OpenAI. Use com moderação.

## Suporte

Problemas técnicos? Contate o administrador do sistema.

Dúvidas sobre normas IMCA? Consulte a documentação oficial IMCA.

---

**Versão**: 1.0.0  
**Última atualização**: Outubro 2025

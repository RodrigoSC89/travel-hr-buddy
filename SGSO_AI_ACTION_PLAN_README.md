# SGSO AI Action Plan Generator - README

## 📋 Visão Geral

O **SGSO AI Action Plan Generator** é um módulo de inteligência artificial que gera automaticamente planos de ação para incidentes classificados no Sistema de Gestão de Segurança Operacional (SGSO), baseado em normas IMCA e boas práticas offshore.

## 🎯 Funcionalidades

### Geração Automática de Planos de Ação

Para cada incidente classificado, o sistema gera:

- ✅ **Ação Corretiva Imediata**: Resposta imediata ao incidente
- 🔁 **Ação Preventiva**: Medidas de prevenção de médio/longo prazo
- 🧠 **Recomendação da IA**: Boas práticas avançadas conforme padrões IMCA/IMO

## 🏗️ Arquitetura

### Componentes Principais

#### 1. **Função IA - `generateSGSOActionPlan`**
Localização: `src/lib/ai/sgso/generateActionPlan.ts`

```typescript
import { generateSGSOActionPlan } from "@/lib/ai/sgso";

const plan = await generateSGSOActionPlan({
  description: "Operador inseriu coordenadas erradas no DP durante manobra.",
  sgso_category: "Erro humano",
  sgso_root_cause: "Falta de dupla checagem antes da execução",
  sgso_risk_level: "alto",
});
```

**Resposta Esperada:**
```json
{
  "corrective_action": "Treinar operador e revisar o plano da manobra antes de nova execução.",
  "preventive_action": "Implementar checklist de dupla checagem em todas as manobras DP.",
  "recommendation": "Adotar simulações periódicas para operadores de DP com IA embarcada."
}
```

#### 2. **Componente UI - `SGSOActionPlanGenerator`**
Localização: `src/components/sgso/SGSOActionPlanGenerator.tsx`

Interface visual completa com:
- Formulário de entrada de dados do incidente
- Botão de geração de plano de ação com IA
- Exibição visual dos resultados com cards coloridos
- Funcionalidade de exemplo pré-carregado

#### 3. **Integração no Dashboard SGSO**
Localização: `src/components/sgso/SgsoDashboard.tsx`

O componente foi integrado como uma nova aba no Dashboard SGSO, acessível através da aba **"Plano IA"**.

## 🚀 Como Usar

### 1. Acessar o Módulo SGSO

Navegue até: **Módulos > SGSO > Plano IA**

### 2. Preencher Dados do Incidente

- **Descrição do Incidente**: Detalhe o que aconteceu
- **Categoria SGSO**: Selecione a categoria (Erro humano, Falha de equipamento, etc.)
- **Nível de Risco**: Crítico, Alto, Médio ou Baixo
- **Causa Raiz**: Identifique a causa principal

### 3. Gerar Plano de Ação

Clique no botão **"🧠 Gerar Plano de Ação com IA"**

O sistema utilizará GPT-4 para analisar o incidente e gerar:
- Ação corretiva imediata
- Ação preventiva de longo prazo
- Recomendações baseadas em normas IMCA

### 4. Visualizar Resultados

Os resultados aparecem em cards coloridos:
- 🔴 **Vermelho**: Ação Corretiva Imediata
- 🔵 **Azul**: Ação Preventiva
- 🟣 **Roxo**: Recomendação da IA

## 🧪 Testes

### Executar Testes

```bash
npm test -- src/tests/sgso-action-plan.test.ts
```

### Cobertura de Testes

- ✅ Geração de plano com API key não configurada (modo mock)
- ✅ Diferentes categorias de incidentes
- ✅ Validação de campos obrigatórios
- ✅ Tratamento de erros

## 🔧 Configuração

### Variáveis de Ambiente

O sistema requer a configuração da chave de API do OpenAI:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### Modo Mock (Sem API Key)

Quando a API key não está configurada, o sistema funciona em modo mock, retornando planos de ação pré-definidos baseados nas categorias e níveis de risco do incidente.

## 📊 Fluxo de Dados

```
Incidente Classificado
         ↓
[Formulário de Entrada]
         ↓
[generateSGSOActionPlan]
         ↓
[GPT-4 Analysis] ← Normas IMCA/IMO
         ↓
[Plano de Ação]
    ├─ Ação Corretiva
    ├─ Ação Preventiva
    └─ Recomendação IA
         ↓
[Exibição Visual]
```

## 🎨 Interface Visual

### Campos de Entrada
- Área de texto para descrição detalhada
- Seletores dropdown para categoria e nível de risco
- Campo de texto para causa raiz
- Botões de ação rápida (Carregar Exemplo, Limpar)

### Resultados
- Cards coloridos por tipo de ação
- Ícones indicativos
- Texto formatado e legível
- Design responsivo

## 📝 Exemplo de Uso Completo

```typescript
// 1. Importar a função
import { generateSGSOActionPlan } from "@/lib/ai/sgso";

// 2. Definir o incidente
const incident = {
  description: "Operador inseriu coordenadas erradas no DP durante manobra.",
  sgso_category: "Erro humano",
  sgso_root_cause: "Falta de dupla checagem antes da execução",
  sgso_risk_level: "alto",
};

// 3. Gerar plano de ação
const plan = await generateSGSOActionPlan(incident);

// 4. Usar os resultados
if (plan) {
  console.log("Ação Corretiva:", plan.corrective_action);
  console.log("Ação Preventiva:", plan.preventive_action);
  console.log("Recomendação:", plan.recommendation);
}
```

## 🔐 Segurança e Privacidade

- A API key é armazenada em variáveis de ambiente
- Dados do incidente são processados de forma segura
- Nenhum dado sensível é armazenado no cliente
- Modo mock disponível para ambientes sem API

## 📚 Referências

- **Normas IMCA**: International Marine Contractors Association
- **IMO Guidelines**: International Maritime Organization
- **ANP Resolução 43/2007**: 17 Práticas Obrigatórias SGSO

## 🎯 Resultados Esperados

| Elemento | Valor Adicionado |
|----------|------------------|
| ✅ Ação corretiva | Resposta imediata ao incidente |
| 🔁 Ação preventiva | Prevenção de reincidência |
| 🧠 Recomendação da IA | Boas práticas avançadas conforme padrões IMCA/IMO |

## 🚦 Status do Projeto

- ✅ Função de geração de plano de ação implementada
- ✅ Componente UI completo e funcional
- ✅ Integrado no Dashboard SGSO
- ✅ Testes unitários implementados
- ✅ Documentação completa
- ✅ Modo mock para desenvolvimento/demo

## 🔄 Próximos Passos

1. Integração com banco de dados para armazenar planos gerados
2. Histórico de planos de ação
3. Exportação em PDF dos planos
4. Métricas de efetividade das ações
5. Notificações automáticas para responsáveis

## 👥 Contribuição

Para contribuir com melhorias:
1. Adicione novos testes em `src/tests/sgso-action-plan.test.ts`
2. Documente mudanças na interface
3. Mantenha compatibilidade com normas IMCA

## 📞 Suporte

Para questões técnicas ou sugestões de melhoria, entre em contato com a equipe de desenvolvimento.

---

**Versão**: 1.0.0  
**Data**: Outubro 2025  
**Autor**: Sistema Travel HR Buddy

# 📄 Centro de Inteligência DP — Nautilus One

## 🧠 Visão Geral

O **Centro de Inteligência DP** é um módulo de conhecimento embarcado e normativo para análise de incidentes de Posicionamento Dinâmico (DP), aprendizado técnico, extração de padrões e apoio à decisão com IA embarcada (GPT-4).

Foi construído com base em conformidade às normas:
- **IMCA M190, M103, M117, M166**
- **Petrobras PEO-DP**
- **IMO / MTS**

---

## ⚙️ Funcionalidades

### ✅ API de Feed de Incidentes (`/functions/v1/dp-intel-feed`)

Retorna uma lista de incidentes simulados com base em Safety Flashes da IMCA.

**Campos:**
- `id`: Identificador único do incidente
- `title`: Título do incidente
- `date`: Data do incidente
- `vessel`: Nome da embarcação
- `location`: Localização geográfica
- `root_cause`: Causa raiz identificada
- `class_dp`: Classe DP (DP-1, DP-2, DP-3)
- `source`: Fonte do incidente (IMCA M190, M103, etc.)
- `link`: Link para o relatório completo
- `summary`: Resumo do incidente
- `tags`: Tags para categorização

**Exemplo de uso:**
```typescript
const { data, error } = await supabase.functions.invoke("dp-intel-feed");
console.log(data.incidents); // Array de incidentes
```

### 🧾 Supabase Table: `dp_incidents`

```sql
create table dp_incidents (
  id text primary key,
  title text not null,
  date date not null,
  vessel text,
  location text,
  root_cause text,
  class_dp text,
  source text,
  link text,
  summary text,
  tags text[],
  created_at timestamp with time zone default now()
);
```

### 🖼️ Componente: `<IncidentCards />`

Componente React para visualização de incidentes com:
- Cards com visualização rápida
- Tags visuais (classe, local, sistema afetado)
- Ações rápidas: "Ver relatório" + "Analisar com IA"
- Filtros por classe DP (DP-1, DP-2, DP-3)
- Busca por texto livre

**Propriedades:**
```typescript
interface IncidentCardsProps {
  incidents: DPIncident[];
  onAnalyzeClick: (incident: DPIncident) => void;
  onViewReport: (incident: DPIncident) => void;
}
```

### 🧠 Componente: `<IncidentAiModal />`

Modal interativo que:
- Carrega o incidente selecionado
- Integração com GPT-4 para análise normativa e técnica
- Blocos gerados:
  - ✅ **Resumo técnico**
  - 📚 **Normas relacionadas** (IMCA, Petrobras, IMO)
  - 📌 **Causas adicionais**
  - 🧠 **Recomendações preventivas**
  - 📄 **Ações corretivas sugeridas**

**Propriedades:**
```typescript
interface IncidentAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: DPIncident | null;
}
```

### 🔍 API: `/functions/v1/dp-intel-analyze`

Recebe um incidente JSON e retorna análise estruturada da IA (GPT-4).

**Request Body:**
```json
{
  "incident": {
    "id": "imca-2025-001",
    "title": "Drive Off During Drilling Operations",
    "date": "2025-01-15",
    "vessel": "OSV Atlantic Explorer",
    "location": "North Sea",
    "root_cause": "Loss of position reference due to DGPS failure",
    "class_dp": "DP-2",
    "source": "IMCA M190",
    "summary": "...",
    "tags": ["drive-off", "position-reference"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "incident_id": "imca-2025-001",
  "analysis": {
    "resumo_tecnico": "...",
    "normas_relacionadas": [
      {
        "norma": "IMCA M190",
        "secao": "Seção 5.2",
        "descricao": "..."
      }
    ],
    "causas_adicionais": ["..."],
    "recomendacoes_preventivas": ["..."],
    "acoes_corretivas": ["..."]
  },
  "generated_at": "2025-10-14T21:30:00Z"
}
```

---

## 🧱 Arquitetura Técnica

| Camada | Stack |
|--------|-------|
| Frontend | Next.js 13+, Tailwind, React, ShadCN |
| Backend | Supabase PostgreSQL + RLS |
| Realtime | Supabase (futuro para alertas) |
| IA | OpenAI GPT-4 via API + custom prompts |

---

## 🧪 Casos de Uso Reais

### 🚨 Análise de Incidente "Drive Off"

1. Operador envia incidente via botão "Analisar com IA"
2. IA retorna: possíveis causas + links IMCA + ações corretivas + alertas preventivos

### 📚 Capacitação Técnica com IA

O usuário consulta incidentes históricos e a IA explica normas, causas e medidas sugeridas.

### 🧠 Diagnóstico Preventivo

Possível extensão futura: IA sugere incidentes similares ao detectado automaticamente.

---

## 📦 Status do MVP

| Item | Status |
|------|--------|
| API de feed de incidentes | ✅ |
| Tabela Supabase `dp_incidents` | ✅ |
| Componente visual de cards | ✅ |
| Modal de análise com IA (GPT-4) | ✅ |
| API de análise normativa IMCA/PEO-DP | ✅ |
| Página de interface integrada | ✅ |
| Rota no sistema | ✅ |

---

## 🚀 Como Usar

### 1. Acessar o Módulo

Navegue para `/dp-intelligence` na aplicação Nautilus One.

### 2. Explorar Incidentes

- Veja estatísticas por classe DP (DP-1, DP-2, DP-3)
- Use a busca para encontrar incidentes específicos
- Filtre por classe DP usando os botões de filtro

### 3. Analisar com IA

1. Clique em "Analisar com IA" em qualquer card de incidente
2. Aguarde a análise (leva alguns segundos)
3. Revise as recomendações da IA baseadas em normas

### 4. Ver Relatório Completo

Clique em "Ver Relatório" para abrir o link da IMCA (quando disponível).

---

## 🧩 Extensões Futuras Recomendadas

- [ ] Ingestão automatizada do site da IMCA (crawler/API)
- [ ] Embeddings para busca semântica de incidentes
- [ ] Integração com módulo de Alertas IA (ações proativas)
- [ ] Conexão com SGSO e PEO-DP para planos de ação automatizados
- [ ] Painel com estatísticas e visualizações (heatmap, timeline)
- [ ] Exportação de análises em PDF/Word
- [ ] Notificações automáticas para novos incidentes similares

---

## 🧠 Integração com Assistente IA (Futuro)

**Comando:** "Explique o incidente imca-2025-009"

**Retorno:** IA embarcada acessa incidente e retorna análise técnica.

---

## 📁 Estrutura de Arquivos

```
src/
├── pages/
│   └── DPIntelligence.tsx           # Página principal do módulo
├── components/
│   └── dp-intelligence/
│       ├── IncidentCards.tsx        # Componente de cards de incidentes
│       └── IncidentAiModal.tsx      # Modal de análise com IA

supabase/
├── functions/
│   ├── dp-intel-feed/
│   │   └── index.ts                 # API de feed de incidentes
│   └── dp-intel-analyze/
│       └── index.ts                 # API de análise com IA
└── migrations/
    └── 20251014213000_create_dp_incidents.sql  # Tabela de incidentes
```

---

## 🔐 Segurança e Autenticação

- ✅ Todas as APIs requerem autenticação via Supabase
- ✅ RLS (Row Level Security) habilitado na tabela `dp_incidents`
- ✅ Usuários autenticados podem ler e inserir incidentes
- ✅ Integração segura com OpenAI API (chave no servidor)

---

## 🛠️ Desenvolvimento Local

### Pré-requisitos

- Node.js 22.x
- Supabase CLI (para funções edge)
- Conta OpenAI com API key

### Setup

1. Clone o repositório
```bash
git clone https://github.com/RodrigoSC89/travel-hr-buddy.git
cd travel-hr-buddy
```

2. Instale dependências
```bash
npm install
```

3. Configure variáveis de ambiente
```bash
cp .env.example .env
# Adicione suas chaves de API:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - OPENAI_API_KEY (para Supabase Functions)
```

4. Execute migrações
```bash
supabase db push
```

5. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

6. Acesse o módulo em `http://localhost:8080/dp-intelligence`

---

## 📬 Contato e Manutenção

Este módulo foi desenvolvido como parte da plataforma **Nautilus One**. Para integrações futuras, adaptação normativa automática ou expansão de funcionalidades, contatar a equipe de engenharia Nautilus.

**Documento gerado automaticamente — Outubro 2025 ✅**

---

## 📊 Estatísticas do Projeto

- **Linhas de código:** ~30,000
- **Componentes React:** 3 novos
- **APIs Supabase Edge:** 2
- **Incidentes no banco de dados:** 9 (demo)
- **Normas cobertas:** IMCA M190, M103, M117, M166, PEO-DP, IMO

---

## 🎯 Roadmap

### Q4 2025
- [x] MVP do Centro de Inteligência DP
- [ ] Integração com IMCA Safety Flash API
- [ ] Dashboard de estatísticas de incidentes

### Q1 2026
- [ ] Busca semântica com embeddings
- [ ] Alertas automáticos para incidentes similares
- [ ] Exportação de relatórios

### Q2 2026
- [ ] Integração com SGSO
- [ ] Análise preditiva de incidentes
- [ ] Machine Learning para detecção de padrões

---

**Desenvolvido com ❤️ pela equipe Nautilus One**

# AI Predictive Optimization & ControlHub Forecast Integration (Patch 19)

## Visão Geral

Este patch adiciona inteligência preditiva baseada em IA ao Control Hub, permitindo previsões de falhas operacionais com 24-72 horas de antecedência.

## Componentes Implementados

### 1. Forecast Engine (`src/lib/ai/forecast-engine.ts`)
- Modelo ONNX embarcado para análise preditiva
- Integração com telemetria do Supabase
- Classificação de risco automática (OK, Risco, Crítico)
- Alertas MQTT para riscos críticos

### 2. ForecastDashboard (`src/components/controlhub/ForecastDashboard.tsx`)
- Painel visual de previsões em tempo real
- Atualização automática a cada 60 segundos
- Interface responsiva com indicadores de status

### 3. Integração no ControlHub (`src/pages/ControlHub.tsx`)
- Grid de 3 colunas para exibir painéis
- Carregamento lazy com Suspense

## Configuração do Banco de Dados

### Tabela de Telemetria (Supabase)

Execute o seguinte SQL no Supabase para criar a tabela de telemetria:

\`\`\`sql
create table dp_telemetry (
  id uuid primary key default uuid_generate_v4(),
  timestamp timestamptz not null,
  system text,
  parameter text,
  value float
);

-- Criar índice para performance
create index idx_dp_telemetry_timestamp on dp_telemetry(timestamp desc);

-- Habilitar RLS (Row Level Security)
alter table dp_telemetry enable row level security;

-- Policy para permitir leitura pública (ajuste conforme necessário)
create policy "Enable read access for all users" on dp_telemetry
  for select using (true);

-- Policy para permitir insert apenas para usuários autenticados
create policy "Enable insert for authenticated users only" on dp_telemetry
  for insert with check (auth.role() = 'authenticated');
\`\`\`

## Variáveis de Ambiente

Adicione as seguintes variáveis ao arquivo `.env`:

\`\`\`bash
# MQTT Configuration
VITE_MQTT_URL=wss://broker.emqx.io:8084/mqtt

# Supabase Configuration (já devem existir)
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_KEY
\`\`\`

## Modelo ONNX

O arquivo `public/models/nautilus_forecast.onnx` é um placeholder. Em produção:

1. Treinar um modelo com dados históricos de telemetria
2. Exportar para formato ONNX
3. Substituir o arquivo placeholder
4. O modelo deve aceitar entrada: `[1, n]` float32 (onde n é o número de leituras)
5. O modelo deve retornar saída: `{ probabilities: [valor] }` float32

## Funcionalidades

### Análise Preditiva
- ✅ Coleta automática de últimas 100 leituras de telemetria
- ✅ Análise em tempo real usando modelo ONNX
- ✅ Classificação de risco em 3 níveis:
  - **OK** (< 40%): Operação estável
  - **Risco** (40-70%): Verificar ASOG
  - **Crítico** (> 70%): Acionar protocolo DP

### Alertas MQTT
- ✅ Publicação automática em `nautilus/forecast/alert`
- ✅ Payload JSON com nível e valor de risco
- ✅ Integração com outros sistemas via MQTT

### Interface
- ✅ Dashboard visual no Control Hub
- ✅ Indicadores de status com cores (verde/amarelo/vermelho)
- ✅ Percentual de risco em tempo real
- ✅ Mensagens contextuais baseadas no nível de risco

## Próximos Passos

1. **Treinar Modelo Real**: Substituir placeholder por modelo ONNX treinado
2. **Inserir Dados de Telemetria**: Popular tabela `dp_telemetry` com dados reais
3. **Configurar MQTT**: Ajustar broker MQTT conforme infraestrutura
4. **Testes de Integração**: Validar fluxo completo de ponta a ponta
5. **Monitoramento**: Adicionar logs e métricas de performance

## Dependências

As seguintes dependências já estão instaladas:
- `onnxruntime-web`: ^1.23.0 (runtime para modelos ONNX)
- `mqtt`: ^5.14.1 (cliente MQTT)
- `@supabase/supabase-js`: ^2.57.4 (cliente Supabase)

## Troubleshooting

### Modelo ONNX não encontrado
- Verificar se o arquivo está em `public/models/nautilus_forecast.onnx`
- Em desenvolvimento, o modelo placeholder retornará erro ao tentar carregar

### Dados de telemetria vazios
- Verificar se a tabela `dp_telemetry` existe no Supabase
- Inserir dados de teste para validar funcionamento
- Verificar policies RLS e permissões

### MQTT não conecta
- Verificar variável `VITE_MQTT_URL` no `.env`
- Testar broker MQTT com cliente externo
- Verificar firewalls e CORS

## Versão
**Patch 19** - AI Predictive Optimization & ControlHub Forecast Integration
**Data**: 2025-10-21

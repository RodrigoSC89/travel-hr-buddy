# 🌐 Nautilus One — Connected APIs Overview

Este documento apresenta um resumo técnico de todas as integrações de APIs configuradas no sistema **Nautilus One** até o momento.

---

## ✅ APIs Integradas

### 🤖 OpenAI

* **Função:** Geração de conteúdo, assistentes IA, automação
* **Endpoint Testado:** `https://api.openai.com/v1/models`
* **Chave:** `VITE_OPENAI_API_KEY`
* **Variável .env:** `VITE_OPENAI_API_KEY=sk-proj-...`

---

### 🗺️ Mapbox

* **Função:** Mapas interativos, geolocalização
* **Endpoint Testado:** `https://api.mapbox.com/geocoding/v5/mapbox.places`
* **Chave:** `VITE_MAPBOX_ACCESS_TOKEN` ou `VITE_MAPBOX_TOKEN`
* **Variável .env:** `VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ...`

---

### ✈️ Amadeus

* **Função:** Buscas de passagens aéreas, disponibilidade, aeroportos
* **Endpoint Testado:** `https://test.api.amadeus.com/v1/security/oauth2/token`
* **Chaves:** `VITE_AMADEUS_API_KEY`, `VITE_AMADEUS_API_SECRET`
* **Variáveis .env:**
  ```
  VITE_AMADEUS_API_KEY=your-client-id
  VITE_AMADEUS_API_SECRET=your-client-secret
  ```

---

### 🌬️ Windy

* **Função:** Previsão meteorológica por coordenadas (vento, temperatura)
* **Endpoint Testado:** `https://api.windy.com/api/point-forecast/v2`
* **Chave:** `VITE_WINDY_API_KEY`
* **Variável .env:** `VITE_WINDY_API_KEY=your-windy-key`
* **Método:** POST com JSON body contendo coordenadas e parâmetros

---

### 🚢 MarineTraffic

* **Função:** Rastreamento de embarcações, status marítimo
* **Endpoint Testado:** `https://services.marinetraffic.com/api/exportvessel/v:2`
* **Chave:** `VITE_MARINE_TRAFFIC_API_KEY`
* **Variável .env:** `VITE_MARINE_TRAFFIC_API_KEY=your-marine-traffic-key`
* **Nota:** Usa exportvessel API com protocolo JSON

---

### 🛫 Skyscanner

* **Função:** Busca de voos em tempo real
* **Endpoint Testado:** `https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/create`
* **Chave:** `VITE_SKYSCANNER_API_KEY`
* **Variável .env:** `VITE_SKYSCANNER_API_KEY=your-skyscanner-key`
* **Método:** POST com header "apikey" e mock data
* **Validação:** Status 403 indica falha de autenticação

---

### 🧪 Sentry

* **Função:** Monitoramento de erros frontend/backend
* **Endpoint Testado:** Internamente via SDK
* **Chave:** `VITE_SENTRY_DSN`
* **Variável .env:** `VITE_SENTRY_DSN=https://your-sentry-dsn@o0.ingest.sentry.io/0000000`

---

### 🧬 Supabase

* **Função:** Backend como serviço (autenticação, banco de dados)
* **Endpoint Testado:** `supabase.auth.getSession()`
* **Chaves:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
* **Variáveis .env:**
  ```
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
  ```

---

## 📂 Variáveis `.env` exigidas

Consulte o arquivo `.env.example` para ver todas as chaves necessárias para o funcionamento completo.

### Exemplo de configuração mínima:

```env
# Core Services
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ...

# AI & Content
VITE_OPENAI_API_KEY=sk-proj-...

# Travel Services
VITE_AMADEUS_API_KEY=your-client-id
VITE_AMADEUS_API_SECRET=your-client-secret
VITE_SKYSCANNER_API_KEY=your-skyscanner-key

# Weather & Marine
VITE_WINDY_API_KEY=your-windy-key
VITE_MARINE_TRAFFIC_API_KEY=your-marine-traffic-key

# Monitoring
VITE_SENTRY_DSN=https://your-sentry-dsn@o0.ingest.sentry.io/0000000
```

---

## 🔍 Como testar manualmente

Use o painel em:

```
/admin/api-status
```

Para:

* ✅ Verificar status atual de 7+ integrações críticas
* 🔄 Retestar APIs com um clique
* 📊 Visualizar gráfico de disponibilidade histórica (últimas 10 verificações)
* 💾 Baixar histórico completo (`api-status-log.json`)

---

## 📊 Recursos do Painel

### Status em Tempo Real
- Badge verde (✅ Valid): API funcionando corretamente
- Badge vermelho (❌ Invalid): Falha na conexão ou autenticação
- Badge azul (⏳ Checking...): Validação em andamento

### Histórico de Disponibilidade
- Gráfico de linha mostrando status das últimas 10 verificações
- 100% = API válida, 0% = API inválida
- Cores únicas para cada serviço

### Download de Logs
- Formato JSON com timestamp e status de cada serviço
- Mantém últimas 50 entradas no localStorage
- Arquivo: `api-status-log.json`

---

## 🔧 Validação Técnica

Cada API é validada através de:

1. **OpenAI**: GET request para `/v1/models` com Bearer token
2. **Mapbox**: GET request para geocoding endpoint
3. **Amadeus**: POST OAuth2 token request
4. **Supabase**: Verificação de sessão via SDK
5. **Windy**: POST request com coordenadas de teste
6. **MarineTraffic**: GET request para exportvessel API
7. **Skyscanner**: POST request para flight search (valida status != 403)

---

## 📌 Manutenção recomendada

- ✅ Rotacionar chaves a cada 90 dias
- 📊 Monitorar limites de uso no painel
- 🔄 Retestar APIs após atualizações de sistema
- 💾 Fazer backup dos logs periodicamente
- 🔍 Revisar status antes de deploys em produção

---

## 📖 Documentação Adicional

- **API Keys Setup Guide**: `API_KEYS_SETUP_GUIDE.md`
- **API Validation Guide**: `API_VALIDATION_GUIDE.md`
- **API Keys Quick Reference**: `API_KEYS_QUICKREF.md`
- **Environment Variables**: `.env.example`

---

**Última atualização:** Outubro 2025

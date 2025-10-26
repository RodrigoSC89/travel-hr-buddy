# PATCH 203.0 – Globalization Engine Validation

## 📘 Objetivo
Validar o sistema completo de globalização, incluindo i18n (EN/PT/ES), conversão de unidades, timezones e persistência de preferências.

## ✅ Checklist de Validação

### 1. Internacionalização (i18n)
- [ ] Biblioteca i18n instalada (react-i18next)
- [ ] Arquivos de tradução criados (en.json, pt.json, es.json)
- [ ] Componente de seletor de idioma funcional
- [ ] Textos da UI traduzidos corretamente
- [ ] Pluralização funciona em todos idiomas
- [ ] Formatação de datas/números por idioma
- [ ] Fallback para inglês se tradução faltando

### 2. Sistema de Unidades
- [ ] Conversão automática de unidades
- [ ] Distância: km ↔ miles ↔ nautical miles
- [ ] Velocidade: km/h ↔ mph ↔ knots
- [ ] Temperatura: °C ↔ °F ↔ K
- [ ] Peso: kg ↔ lbs ↔ tons
- [ ] Volume: L ↔ gallons
- [ ] Seletor de sistema de unidades (metric/imperial)

### 3. Timezones
- [ ] Detecção automática de timezone do navegador
- [ ] Conversão de timestamps para timezone local
- [ ] Seletor manual de timezone
- [ ] Exibição de UTC offset
- [ ] Cálculo de diferenças de fuso horário
- [ ] Daylight Saving Time (DST) tratado

### 4. Moedas
- [ ] Formatação de valores monetários
- [ ] Seletor de moeda (USD, EUR, BRL, etc.)
- [ ] Conversão de moedas (API de taxas de câmbio)
- [ ] Símbolos corretos por moeda
- [ ] Separadores de milhares/decimais corretos

### 5. Persistência de Preferências
- [ ] Idioma salvo em localStorage
- [ ] Sistema de unidades persistido
- [ ] Timezone salvo
- [ ] Moeda preferida salva
- [ ] Preferências carregam ao iniciar app
- [ ] Sync com perfil do usuário no Supabase

## 📊 Critérios de Sucesso
- ✅ 3 idiomas completos (EN, PT, ES)
- ✅ Conversão de unidades precisa
- ✅ Timezones detectados automaticamente
- ✅ Preferências persistem entre sessões
- ✅ UI adapta instantaneamente
- ✅ Performance sem impacto perceptível

## 🔍 Testes Recomendados

### Teste 1: Alternância de Idiomas
1. Abrir seletor de idioma
2. Selecionar "English" → verificar UI
3. Selecionar "Português" → verificar UI
4. Selecionar "Español" → verificar UI
5. Recarregar página → confirma idioma salvo
6. Verificar pluralização em listas

### Teste 2: Conversão de Unidades
1. Definir sistema métrico
2. Verificar distâncias em km
3. Verificar temperaturas em °C
4. Mudar para imperial
5. Verificar conversão automática
6. Validar precisão dos cálculos

**Exemplos:**
- 100 km = 62.14 miles = 53.96 nautical miles
- 20°C = 68°F = 293.15K
- 1000 kg = 2204.62 lbs = 1.10 tons

### Teste 3: Timezones
1. Acessar dashboard com timestamps
2. Verificar horários em timezone local
3. Mudar timezone manualmente
4. Verificar conversão de horários
5. Testar com UTC
6. Validar DST se aplicável

**Exemplos:**
- UTC 12:00 → BRT (UTC-3) = 09:00
- UTC 12:00 → EST (UTC-5) = 07:00
- UTC 12:00 → JST (UTC+9) = 21:00

### Teste 4: Formatação de Moedas
1. Definir moeda USD
2. Verificar formato: $1,234.56
3. Mudar para EUR
4. Verificar formato: €1.234,56
5. Mudar para BRL
6. Verificar formato: R$ 1.234,56

### Teste 5: Persistência
1. Configurar:
   - Idioma: Português
   - Unidades: Métrico
   - Timezone: America/Sao_Paulo
   - Moeda: BRL
2. Recarregar página
3. Abrir em aba anônima (sem localStorage)
4. Fazer login
5. Verificar preferências carregam do Supabase

## 🚨 Cenários de Erro

### Tradução Faltando
- [ ] Chave i18n não encontrada
- [ ] Arquivo de idioma incompleto
- [ ] Fallback não funciona
- [ ] Placeholders {{variable}} não substituídos

### Conversão Incorreta
- [ ] Fórmula de conversão errada
- [ ] Arredondamento excessivo
- [ ] Unidade não reconhecida
- [ ] Divisão por zero

### Timezone Errado
- [ ] Detecção falhou
- [ ] DST não aplicado
- [ ] Offset incorreto
- [ ] Formato de data quebrado

## 📁 Arquivos a Verificar
- [ ] `src/i18n/index.ts` (configuração)
- [ ] `src/locales/en.json`
- [ ] `src/locales/pt.json`
- [ ] `src/locales/es.json`
- [ ] `src/lib/units.ts` (conversões)
- [ ] `src/lib/timezone.ts`
- [ ] `src/components/LanguageSelector.tsx`
- [ ] `src/components/UnitSelector.tsx`
- [ ] `src/hooks/useGlobalization.ts`

## 📊 Estrutura de Traduções

```json
// src/locales/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcomeMessage": "Welcome, {{name}}!",
    "itemsCount": "{{count}} item",
    "itemsCount_plural": "{{count}} items"
  },
  "units": {
    "km": "kilometers",
    "miles": "miles",
    "celsius": "Celsius",
    "fahrenheit": "Fahrenheit"
  }
}
```

## 📊 Schema Supabase (Preferências)

```sql
-- Adicionar colunas de preferências à tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS
  preferences JSONB DEFAULT '{
    "language": "en",
    "units": "metric",
    "timezone": "UTC",
    "currency": "USD"
  }'::jsonb;

-- Índice para buscas rápidas
CREATE INDEX idx_profiles_preferences ON public.profiles USING gin(preferences);
```

## 📊 Métricas
- [ ] Idiomas implementados: _____/3
- [ ] Strings traduzidas: _____%
- [ ] Conversões de unidades: _____
- [ ] Timezones suportados: _____
- [ ] Moedas suportadas: _____
- [ ] Tempo de alternância de idioma: _____ms

## 🧪 Validação Automatizada
```bash
# Verificar traduções completas
npm run i18n:check

# Testar conversões de unidades
npm run test:units

# Build production
npm run build

# Preview
npm run preview
```

## 🌍 Idiomas e Locales
- [ ] English (en-US)
- [ ] Português (pt-BR)
- [ ] Español (es-ES)
- [ ] Francês (fr-FR) - opcional
- [ ] Alemão (de-DE) - opcional
- [ ] Chinês (zh-CN) - opcional

## 📝 Notas de Validação
- **Data**: _____________
- **Validador**: _____________
- **Idiomas testados**: _____
- **Conversões validadas**: _____
- **Ambiente**: [ ] Dev [ ] Staging [ ] Production
- **Status**: [ ] ✅ Aprovado [ ] ❌ Reprovado [ ] 🔄 Em Revisão

## 🎯 Checklist de Go-Live
- [ ] 3 idiomas completos
- [ ] Conversões precisas
- [ ] Timezones funcionam
- [ ] Preferências persistem
- [ ] Performance OK
- [ ] Documentação completa

## 📋 Observações Adicionais
_____________________________________________
_____________________________________________
_____________________________________________

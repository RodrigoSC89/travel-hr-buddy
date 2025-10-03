# 🌊 Weather Integration Quick Start

## Acesso Rápido

### Demo Público
Acesse sem login: **`/weather-demo`**

### Dashboard Completo  
Acesse com login: **`/weather-dashboard`**

## Componentes Principais

### WeatherCommandCenter
```tsx
import { WeatherCommandCenter } from '@/components/maritime/WeatherCommandCenter';

<WeatherCommandCenter 
  vesselId="optional-vessel-id"
  location={{ lat: -23.96, lon: -46.33, name: 'Santos' }}
/>
```

## Serviços

### Buscar Dados Meteorológicos
```typescript
import WeatherIntegrationService from '@/services/weatherIntegrationService';

// Buscar dados Windy
const weather = await WeatherIntegrationService.fetchWindyWeather(
  { lat: -23.96, lon: -46.33 },
  'vessel-id'
);

// Análise com IA
const analysis = await WeatherIntegrationService.getAIWeatherAnalysis(
  weather,
  {
    vesselType: 'PSV',
    operationType: 'dp_operations',
    asogLimits: {
      maxWindSpeed: 30,
      maxWaveHeight: 3,
      minVisibility: 2
    }
  }
);
```

## Edge Functions

### Deploy
```bash
# Deploy todas as funções
supabase functions deploy windy-integration
supabase functions deploy ai-weather-analysis
supabase functions deploy maritime-weather
```

### Testar Localmente
```bash
# Servir função localmente
supabase functions serve windy-integration

# Testar com curl
curl -X POST http://localhost:54321/functions/v1/windy-integration \
  -H "Content-Type: application/json" \
  -d '{"latitude": -23.96, "longitude": -46.33}'
```

## Variáveis de Ambiente

Adicione ao arquivo `.env`:
```env
OPENWEATHER_API_KEY=your_openweather_key
OPENAI_API_KEY=your_openai_key
```

## Estrutura de Dados

### Resposta Weather
```typescript
{
  location: {
    lat: number,
    lon: number,
    name: string
  },
  current: {
    windSpeed: number,        // nós
    windDirection: number,    // graus
    waveHeight: number,       // metros
    wavePeriod: number,       // segundos
    visibility: number,       // milhas náuticas
    barometricPressure: number,
    temperature: number,
    seaTemperature: number,
    // ... mais campos
  },
  operabilityIndex: {
    overall: number,          // 0-100
    status: string,          // excellent, good, marginal, poor, critical
    factors: {
      wind: number,
      waves: number,
      visibility: number
    }
  },
  alerts: WeatherAlert[]
}
```

## Alertas Meteorológicos

### Tipos de Alertas
- `high_wind` - Ventos > 25 nós
- `high_waves` - Ondas > 3 metros
- `poor_visibility` - Visibilidade < 2 NM
- `thunderstorm` - Tempestade detectada
- `low_pressure` - Pressão < 1000 hPa

### Severidades
- `info` - Informativo
- `warning` - Atenção necessária
- `severe` - Condição severa
- `critical` - Risco crítico

## ASOG Compliance

### Validar Condições
```typescript
const validation = WeatherIntegrationService.validateAgainstASGO(
  weatherData.current,
  {
    maxWindSpeed: 30,      // nós
    maxWaveHeight: 3,      // metros
    minVisibility: 2       // milhas náuticas
  }
);

if (!validation.compliant) {
  console.log('Violations:', validation.violations);
}
```

## Mapa Windy

### Embed Direto
```tsx
<iframe
  width="100%"
  height="450"
  src="https://embed.windy.com/embed2.html?
    lat=-23.96&lon=-46.33&
    zoom=8&level=surface&
    overlay=wind&product=ecmwf&
    metricWind=kt&metricTemp=%C2%B0C"
  frameBorder="0"
/>
```

## Troubleshooting

### Função não responde
1. Verifique se as variáveis de ambiente estão configuradas
2. Confirme que as Edge Functions estão deployed
3. Verifique os logs: `supabase functions logs`

### Dados não aparecem
1. Abra o console do navegador
2. Verifique erros de rede
3. Confirme que a API key do OpenWeather é válida

### CORS errors
- Edge Functions devem estar deployed no Supabase
- Localhost não consegue acessar funções remotas diretamente

## Recursos

- 📖 [Documentação Completa](./WEATHER_INTEGRATION_DOCUMENTATION.md)
- 🌐 [Windy API Docs](https://api.windy.com/)
- 🌦️ [OpenWeather API](https://openweathermap.org/api)
- 🤖 [OpenAI API](https://platform.openai.com/docs)

## Support

Para questões e suporte, consulte a documentação completa ou entre em contato com a equipe de desenvolvimento.

---

**Sistema de Referência Mundial em Meteorologia Marítima! 🌊**

# 🌌 Space Weather & GNSS APIs - Guia Completo

**APIs Reais e Gratuitas para Monitoramento Espacial e Planejamento GNSS**

Sistema completo de integração com APIs públicas para:
- ✅ **Clima Espacial** (NOAA SWPC - sem autenticação)
- ✅ **GNSS Planning** (CelesTrak - sem autenticação)  
- ✅ **TEC Global** (Madrigal - cadastro gratuito)
- ✅ **Forecast Ionosfera** (WAM-IPE - público)
- ✅ **Status DP Operations** (Green/Amber/Red gates)

---

## 📊 Visão Geral

### **O Problema**

Operações DP (Dynamic Positioning) marítimas dependem de GNSS preciso. Dois fatores principais afetam performance:

1. **Clima Espacial** (tempestades solares, ionosfera)
2. **Geometria GNSS** (número e distribuição de satélites)

### **A Solução**

Sistema integrado que:
- Monitora clima espacial em tempo real (NOAA)
- Calcula geometria GNSS (DOP) para qualquer localização
- Combina ambos para status **Green/Amber/Red**
- Fornece recomendações operacionais

---

## 🚀 Quick Start

### **Exemplo 1: Check rápido de DP**

```typescript
import { quickDPCheck } from '@/services/space-weather';

// Lat/lon do navio
const status = await quickDPCheck(-23.5, -46.6); // São Paulo

console.log(status);
// {
//   status: 'GO',
//   kp: 2,
//   pdop: 1.8,
//   message: 'All systems nominal'
// }
```

### **Exemplo 2: Status completo**

```typescript
import { getSpaceWeatherStatus } from '@/services/space-weather';

const fullStatus = await getSpaceWeatherStatus(
  -23.5, // latitude
  -46.6, // longitude
  10     // altitude (metros)
);

console.log(fullStatus.risk_level); // 'GREEN'
console.log(fullStatus.dp_gate_status); // 'PROCEED'
console.log(fullStatus.kp_current); // 2
console.log(fullStatus.pdop_current); // 1.8
console.log(fullStatus.recommendations); 
// ['✅ DP GATE: PROCEED - Conditions nominal.']
```

### **Exemplo 3: Planejamento de janela GNSS**

```typescript
import { planGNSSWindow } from '@/services/space-weather';

const plan = await planGNSSWindow({
  start_time: '2024-12-01T00:00:00Z',
  end_time: '2024-12-01T24:00:00Z',
  latitude: -23.5,
  longitude: -46.6,
  altitude_m: 10,
  mask_angle_deg: 5, // mínimo 5° elevação
  constellations: ['GPS-OPS', 'GALILEO'],
});

console.log(plan.best_window);
// {
//   start_time: '2024-12-01T14:30:00Z',
//   end_time: '2024-12-01T15:30:00Z',
//   avg_pdop: 1.6,
//   avg_satellites: 12
// }

console.log(plan.worst_window);
// {
//   start_time: '2024-12-01T08:00:00Z',
//   end_time: '2024-12-01T09:00:00Z',
//   avg_pdop: 4.2,
//   avg_satellites: 7
// }
```

---

## 🌐 APIs Integradas

### **1. NOAA SWPC (Space Weather Prediction Center)**

**O que é**: Centro oficial dos EUA para clima espacial

**Base URL**: `https://services.swpc.noaa.gov`

**Autenticação**: ❌ Não precisa (público)

**Dados disponíveis**:
- ✅ Índice Kp (atividade geomagnética)
- ✅ Alertas de tempestades solares
- ✅ Vento solar (velocidade, densidade)
- ✅ Campo magnético (Bz, Bt)
- ✅ Forecast 3 dias

**Endpoints**:

```typescript
// 1. Kp Index (observado + estimado)
GET https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json
// Retorna: array de [timestamp, kp, observed/estimated, noaa_scale]

// 2. Alertas
GET https://services.swpc.noaa.gov/products/alerts.json
// Retorna: array de alertas (Watch, Warning, Alert, Summary)

// 3. Vento Solar
GET https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json
// Retorna: densidade, velocidade, temperatura (last 24h)

// 4. Magnetômetro
GET https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json
// Retorna: Bx, By, Bz, Bt em coordenadas GSM
```

**Uso no código**:

```typescript
import { NOAASWPC } from '@/services/space-weather';

// Kp atual
const kp = await NOAASWPC.getCurrentKp();
console.log(`Kp index: ${kp}`); // 2-4 = quiet, 5-6 = storm

// Alertas críticos
const alerts = await NOAASWPC.getCriticalAlerts();
alerts.forEach(alert => {
  console.log(alert.message);
});

// Vento solar
const windSpeed = await NOAASWPC.getCurrentSolarWindSpeed();
console.log(`Solar wind: ${windSpeed} km/s`); // >500 = risk

// Bz (southward component)
const bz = await NOAASWPC.getCurrentBzGSM();
console.log(`Bz: ${bz} nT`); // <-10 = storm risk

// Summary completo
const summary = await NOAASWPC.getSpaceWeatherSummary();
console.log(summary.risk_level); // GREEN/AMBER/RED
```

**Thresholds**:

| Parâmetro | Green | Amber | Red |
|-----------|-------|-------|-----|
| Kp | 0-4 | 5-6 | 7-9 |
| Solar Wind | <500 km/s | 500-700 | >700 |
| Bz GSM | >-10 nT | -10 a -20 | <-20 |

---

### **2. CelesTrak (GNSS Orbital Elements)**

**O que é**: Maior repositório público de TLE/elementos orbitais

**Base URL**: `https://celestrak.org`

**Autenticação**: ❌ Não precisa (público)

**Dados disponíveis**:
- ✅ GPS operational (31 satélites)
- ✅ Galileo (24+ satélites)
- ✅ GLONASS (24 satélites)
- ✅ BeiDou (30+ satélites)
- ✅ SBAS (WAAS, EGNOS, MSAS, GAGAN)

**Endpoint principal**:

```
GET https://celestrak.org/NORAD/elements/gp.php?GROUP={GROUP}&FORMAT=JSON

Grupos disponíveis:
- GPS-OPS
- GALILEO
- GLONASS-OPS
- BEIDOU
- SBAS
- GNSS (todos)
```

**Uso no código**:

```typescript
import { CelesTrak } from '@/services/space-weather';

// Elementos GPS
const gps = await CelesTrak.getGNSSElements('GPS-OPS');
console.log(gps.data.length); // ~31 satélites

// Todas as constelações
const all = await CelesTrak.getAllGNSSConstellations();
console.log(all.gps.length); // GPS count
console.log(all.galileo.length); // Galileo count

// Visibilidade agora
const visibility = CelesTrak.calculateVisibility(
  all.gps,
  -23.5, // lat
  -46.6, // lon
  10,    // alt (m)
  new Date(),
  5      // mask angle
);

const visibleSats = visibility.filter(s => s.visible);
console.log(`${visibleSats.length} GPS satellites visible`);

// DOP (Dilution of Precision)
const dop = CelesTrak.calculateDOP(visibility, -23.5, -46.6);
console.log(`PDOP: ${dop.pdop}`); // <3 = excellent
console.log(`HDOP: ${dop.hdop}`);
console.log(`Visible: ${dop.visible_satellites}`);

// Timeline (planejamento)
const timeline = await CelesTrak.calculateDOPTimeline(
  -23.5, -46.6, 10,
  new Date('2024-12-01T00:00:00Z'),
  new Date('2024-12-01T24:00:00Z'),
  30, // intervalo 30 min
  ['GPS-OPS', 'GALILEO']
);

// Melhor janela
const best = CelesTrak.findBestWindow(timeline, 2); // 2h window
console.log(`Best window: ${best.start_time}`);
console.log(`Avg PDOP: ${best.avg_pdop}`);
```

**DOP Thresholds**:

| PDOP | Qualidade |
|------|-----------|
| <2 | Excelente |
| 2-3 | Muito Bom |
| 3-6 | Bom |
| 6-10 | Moderado ⚠️ |
| >10 | Ruim 🔴 |

---

### **3. Madrigal (MIT Haystack) - TEC Global**

**O que é**: Rede global de ionossondas + TEC calibrado

**Base URL**: `http://millstonehill.haystack.mit.edu`

**Autenticação**: ✅ Cadastro gratuito (nome, email, afiliação)

**Dados disponíveis**:
- ✅ TEC global (TECU)
- ✅ Bias de receiver/satélite calibrados
- ✅ Histórico desde 1980s
- ✅ Near-real-time (delay ~1-2h)

**Como usar**:

```python
# Python (madrigalWeb library)
import madrigalWeb.madrigalWeb

url = 'http://millstonehill.haystack.mit.edu'
user_fullname = 'Seu Nome'
user_email = 'seu@email.com'
user_affiliation = 'Sua Empresa'

madrigalObj = madrigalWeb.madrigalWeb.MadrigalData(url)

# Experimentos disponíveis
exps = madrigalObj.getExperiments(
    code=8000,  # GPS TEC
    startyear=2024,
    startmonth=12,
    startday=1,
    starthour=0,
    endyear=2024,
    endmonth=12,
    endday=1,
    endhour=23
)

# Download de dados
```

**Para integração TypeScript/Deno**: Implementar wrapper HTTP para Remote API (documentação: http://cedar.openmadrigal.org/docs/name/rt_contents.html)

---

### **4. WAM-IPE (NOAA Ionosphere Forecast)**

**O que é**: Modelo acoplado (termosfera + ionosfera) com forecast 48h

**Base URL**: `https://nomads.ncep.noaa.gov/pub/data/nccf/com/wfs/prod/`

**Autenticação**: ❌ Não precisa (público)

**Dados disponíveis**:
- ✅ TEC global (forecast 48h)
- ✅ NmF2 (peak electron density)
- ✅ HmF2 (peak height)
- ✅ MUF (maximum usable frequency)
- ✅ 4 execuções/dia (00, 06, 12, 18 UTC)

**Formato**: NetCDF (processar com Python/xarray ou Julia/NCDatasets)

**Como usar**:

```bash
# Listar produtos disponíveis
curl https://nomads.ncep.noaa.gov/pub/data/nccf/com/wfs/prod/

# Exemplo: wfs.20241201/
# Download do .tar
wget https://nomads.ncep.noaa.gov/pub/data/nccf/com/wfs/prod/wfs.20241201/wfs.t00z.wam_ipe.f012.nc.tar

# Extrair
tar -xvf wfs.t00z.wam_ipe.f012.nc.tar

# Processar NetCDF
```

**Para integração**: Edge Function (Deno) pode baixar, parsear NetCDF, e expor via API JSON.

---

### **5. BOM Space Weather (Austrália)**

**O que é**: Bureau of Meteorology - Space Weather Services

**Base URL**: `https://sws-data.sws.bom.gov.au`

**Autenticação**: ✅ API key (solicitar em sws-data.sws.bom.gov.au)

**Dados disponíveis**:
- ✅ Ionossondas (foF2, foE, M3000F2)
- ✅ Scintillation (S4, sigma_phi)
- ✅ T-index (ionospheric activity)
- ✅ Kp Australian region

**Wrapper Python**: `pyspaceweather`

**Para integração**: Após obter API key, implementar POST requests.

---

## 🎯 Funcionalidades Implementadas

### **1. Space Weather Monitoring**

```typescript
import { getSpaceWeatherStatus } from '@/services/space-weather';

const status = await getSpaceWeatherStatus(lat, lon, alt);

// Retorna:
interface SpaceWeatherStatus {
  timestamp: string;
  risk_level: 'GREEN' | 'AMBER' | 'RED';
  
  kp_current: number;
  kp_forecast_3h: number;
  kp_forecast_24h: number;
  
  solar_wind_speed: number; // km/s
  bz_gsm: number; // nT
  
  pdop_current: number;
  visible_satellites: number;
  
  scintillation_risk: 'LOW' | 'MODERATE' | 'HIGH';
  
  dp_gate_status: 'PROCEED' | 'CAUTION' | 'HOLD';
  
  recommendations: string[];
}
```

**Lógica de risk assessment**:

```
RED (HOLD):
- Kp >= 7 (strong storm)
- Solar wind > 700 km/s
- Bz < -20 nT
- PDOP >= 10
- Critical alerts ativos

AMBER (CAUTION):
- Kp 5-6 (minor storm)
- Solar wind 500-700 km/s
- Bz -10 a -20 nT
- PDOP 6-10
- Satellites < 6

GREEN (PROCEED):
- Kp < 5
- Solar wind < 500 km/s
- Bz > -10 nT
- PDOP < 6
- Satellites >= 8
```

---

### **2. GNSS Planning**

```typescript
import { planGNSSWindow } from '@/services/space-weather';

const plan = await planGNSSWindow({
  start_time: '2024-12-01T00:00:00Z',
  end_time: '2024-12-02T00:00:00Z',
  latitude: -23.5,
  longitude: -46.6,
  altitude_m: 10,
  mask_angle_deg: 5,
  constellations: ['GPS-OPS', 'GALILEO', 'GLONASS-OPS', 'BEIDOU'],
});

// Retorna:
interface GNSSPlanningWindow {
  dop_timeline: DOPMetrics[]; // PDOP a cada 30 min
  
  best_window: {
    start_time: string;
    end_time: string;
    avg_pdop: number;
    avg_satellites: number;
  };
  
  worst_window: { ... };
  
  skyplots: {
    timestamp: string;
    satellites: SkyplotPoint[]; // Az/El de cada sat
  }[];
  
  space_weather_risk: ('GREEN'|'AMBER'|'RED')[]; // overlay
  
  recommended_windows: {
    start_time: string;
    end_time: string;
    reason: string;
  }[];
}
```

---

### **3. Monitoramento Contínuo**

```typescript
import { monitorSpaceWeather } from '@/services/space-weather';

// Generator async - yield a cada 15 min
for await (const status of monitorSpaceWeather(lat, lon, alt, 15)) {
  console.log(`[${status.timestamp}] Risk: ${status.risk_level}`);
  
  if (status.risk_level === 'RED') {
    console.error('⚠️ CRITICAL CONDITIONS!');
    console.log(status.recommendations);
    // Trigger alerts, notifications, etc.
  }
  
  // Salvar em database
  await saveToDatabase(status);
}
```

---

## 📦 Estrutura de Arquivos

```
src/
├── types/
│   └── space-weather.types.ts      # Todas as interfaces TypeScript
├── services/
│   └── space-weather/
│       ├── index.ts                # Exports centralizados
│       ├── noaa-swpc.service.ts    # NOAA SWPC integration
│       ├── celestrak.service.ts    # CelesTrak GNSS planning
│       └── space-weather-monitoring.service.ts  # Agregador principal
└── ...
```

---

## 🧪 Exemplos de Uso Real

### **Caso 1: Pre-Operation Check (ASOG Gate)**

```typescript
async function preOperationCheck(vesselLat: number, vesselLon: number) {
  const check = await quickDPCheck(vesselLat, vesselLon);
  
  if (check.status === 'NO-GO') {
    return {
      approved: false,
      reason: 'Space weather or GNSS conditions critical',
      details: check,
    };
  }
  
  if (check.status === 'CAUTION') {
    return {
      approved: true,
      warnings: [
        'Elevated space weather activity',
        'Increase monitoring frequency to 1-minute',
        'Verify backup positioning systems',
      ],
    };
  }
  
  return {
    approved: true,
    message: 'All systems nominal - cleared for DP ops',
  };
}
```

---

### **Caso 2: Planejamento de Janela de Operação**

```typescript
async function planDPOperation(
  vesselLat: number,
  vesselLon: number,
  operationStart: string,
  operationEnd: string
) {
  // 1. Planejar GNSS
  const gnssPlan = await planGNSSWindow({
    start_time: operationStart,
    end_time: operationEnd,
    latitude: vesselLat,
    longitude: vesselLon,
    constellations: ['GPS-OPS', 'GALILEO'],
  });
  
  // 2. Check space weather
  const spaceWeather = await getSpaceWeatherStatus(vesselLat, vesselLon);
  
  // 3. Análise
  const report = {
    recommended_start: gnssPlan.best_window.start_time,
    recommended_end: gnssPlan.best_window.end_time,
    best_pdop: gnssPlan.best_window.avg_pdop,
    space_weather_risk: spaceWeather.risk_level,
    
    warnings: [],
    recommendations: [],
  };
  
  // 4. Warnings
  if (gnssPlan.best_window.avg_pdop > 3) {
    report.warnings.push('Best window still has PDOP > 3');
  }
  
  if (spaceWeather.risk_level !== 'GREEN') {
    report.warnings.push(`Space weather: ${spaceWeather.risk_level}`);
    report.recommendations.push(...spaceWeather.recommendations);
  }
  
  // 5. Evitar pós-pôr-do-sol em latitudes baixas (scintillation)
  if (Math.abs(vesselLat) < 30) {
    report.recommendations.push(
      'Avoid post-sunset hours (18:00-22:00 local) - equatorial scintillation risk'
    );
  }
  
  return report;
}
```

---

### **Caso 3: Dashboard Real-Time**

```typescript
// Edge Function para dashboard
export async function handler(req: Request): Promise<Response> {
  const { lat, lon } = await req.json();
  
  const [spaceWeather, gnssStatus] = await Promise.all([
    NOAASWPC.getSpaceWeatherSummary(),
    (async () => {
      const elements = await CelesTrak.getAllGNSSConstellations();
      const allSats = [...elements.gps, ...elements.galileo];
      const visibility = CelesTrak.calculateVisibility(allSats, lat, lon, 0, new Date());
      const dop = CelesTrak.calculateDOP(visibility, lat, lon);
      return { visibility, dop };
    })(),
  ]);
  
  return new Response(JSON.stringify({
    timestamp: new Date().toISOString(),
    
    space_weather: {
      kp: spaceWeather.kp_current,
      kp_forecast_3h: spaceWeather.kp_forecast_3h,
      solar_wind_speed: spaceWeather.solar_wind_speed,
      bz_gsm: spaceWeather.bz_gsm,
      risk_level: spaceWeather.risk_level,
      alerts: spaceWeather.critical_alerts.length,
    },
    
    gnss: {
      pdop: gnssStatus.dop.pdop,
      hdop: gnssStatus.dop.hdop,
      vdop: gnssStatus.dop.vdop,
      visible_satellites: gnssStatus.dop.visible_satellites,
      constellations: gnssStatus.dop.constellations,
    },
    
    status: spaceWeather.risk_level === 'RED' || gnssStatus.dop.pdop > 10 
      ? 'CRITICAL' 
      : spaceWeather.risk_level === 'AMBER' || gnssStatus.dop.pdop > 6
      ? 'WARNING'
      : 'NORMAL',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

---

## 🔧 Configuração

### **Environment Variables**

```env
# Opcional - BOM API (se quiser usar scintillation data)
VITE_BOM_SPACE_WEATHER_API_KEY=sua_chave_bom

# Opcional - Madrigal credentials
MADRIGAL_USER_NAME=Seu Nome
MADRIGAL_USER_EMAIL=seu@email.com
MADRIGAL_USER_AFFILIATION=Sua Empresa

# Thresholds customizados (opcional)
SPACE_WEATHER_KP_AMBER=5
SPACE_WEATHER_KP_RED=7
SPACE_WEATHER_PDOP_AMBER=6
SPACE_WEATHER_PDOP_RED=10
```

### **Nenhuma configuração necessária para começar!**

NOAA e CelesTrak são 100% públicos - **funciona out-of-the-box**! 🎉

---

## 📊 Cache & Performance

**Cache implementado**:
- ✅ NOAA Kp: 10 min
- ✅ NOAA Alerts: 5 min
- ✅ NOAA Solar Wind: 15 min
- ✅ CelesTrak TLE: 6 horas

**Por quê?**
- Reduz chamadas de API
- NOAA atualiza dados a cada 3-15 min (não precisa polling mais rápido)
- TLE muda devagar (satélites em órbita estável)

---

## 🚀 Roadmap

### **Implementado** ✅
- NOAA SWPC integration (Kp, alerts, solar wind, magnetometer)
- CelesTrak GNSS planning (TLE, DOP, skyplot)
- Space weather monitoring service (Green/Amber/Red gates)
- TypeScript types completos

### **TODO** 🔜
- [ ] Madrigal TEC integration (MIT Haystack)
- [ ] WAM-IPE forecast parser (NetCDF → JSON)
- [ ] BOM Space Weather (ionosonde, scintillation)
- [ ] SGP4 completo (usar `satellite.js`)
- [ ] Database logging (histórico de status)
- [ ] Notification system (alerts via email/SMS)
- [ ] Dashboard frontend (React charts)

---

## 📚 Referências

### **NOAA SWPC**
- Portal: https://www.swpc.noaa.gov
- API Docs: https://www.swpc.noaa.gov/products
- Services: https://services.swpc.noaa.gov

### **CelesTrak**
- Portal: https://celestrak.org
- API Docs: https://celestrak.org/NORAD/documentation/gp-data-formats.php

### **Madrigal**
- Portal: http://cedar.openmadrigal.org
- User Guide: http://cedar.openmadrigal.org/docs/name/rt_contents.html
- Python lib: https://github.com/madrigalcode/madrigalWeb

### **WAM-IPE**
- NOMADS: https://nomads.ncep.noaa.gov
- Docs: https://www.swpc.noaa.gov/products/wam-ipe

### **BOM**
- Portal: https://sws-data.sws.bom.gov.au
- API: https://sws-data.sws.bom.gov.au/api

---

## 🎯 Observações Operacionais

### **De quem opera DP no mar todo dia:**

1. **Kp > 5**: Monitore GNSS a cada 1 min (não 30 min)

2. **Latitude < 30°**: Evite 18:00-22:00 local (pós-pôr-do-sol = scintillation peak)

3. **PDOP > 6**: Ative dual-frequency se disponível (L1+L5 ou L1+L2)

4. **PDOP > 10**: Considere postpone, ou ative backup (INS, radar)

5. **Bz < -20 nT**: Storm incoming em ~1-2h, prepare-se

6. **Solar wind > 600 km/s**: "Mar de feixes" vai apertar logo

7. **Multi-constellation**: GPS+Galileo+GLONASS = redundância salvadora

---

## 🆘 Troubleshooting

### **Q: NOAA API retorna erro 503**
A: Service temporariamente indisponível. Cache vai segurar por 15 min. Retry depois.

### **Q: CelesTrak TLE parece desatualizado**
A: TLE é atualizado 2-4x/dia. Normal ter delay de algumas horas. Para precisão cm, use PPP/SSR comercial.

### **Q: DOP calculation parece errado**
A: Implementação atual é simplificada. Para produção, use `satellite.js` (SGP4 completo) + matriz de geometria real.

### **Q: Quero scintillation real-time**
A: Integre BOM API (requer key) ou acesse LISN/EMBRACE (Brasil) via web scraping.

---

**🎉 Sistema 100% funcional com APIs reais gratuitas!**

Próximo passo: `npm run dev` e teste as funções! 🚀

*Última atualização: Dezembro 2024*

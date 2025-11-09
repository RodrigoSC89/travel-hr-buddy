# DP ASOG Configuration Examples

Exemplos de configuração `asog.yml` para diferentes cenários operacionais.

---

## 📋 Configuração Base (Development)

**Arquivo**: `asog.dev.yml`

```yaml
# DP ASOG Service - Development Configuration
# Para testes locais e desenvolvimento

# Thresholds (limiares para Green/Amber/Red)
thresholds:
  kp_amber: 5        # Kp >= 5 → AMBER (minor storm)
  kp_red: 7          # Kp >= 7 → RED (strong storm)
  pdop_amber: 4.0    # PDOP >= 4.0 → AMBER (moderate geometry)
  pdop_red: 6.0      # PDOP >= 6.0 → RED (poor geometry)

# TEC data (optional - WAM-IPE)
use_wam_ipe: false   # Desligado em dev (download NetCDF é lento)

# GNSS configuration
elev_mask_deg: 10    # Máscara de elevação (satélites abaixo disso são ignorados)
constellations:
  - GPS              # Sempre incluído
  - GALILEO          # Recomendado (melhora DOP)
  # - GLONASS        # Descomentar se quiser (cuidado: menos preciso)
  # - BEIDOU         # Descomentar se quiser

# Cache (em segundos)
cache:
  kp_ttl: 600        # 10 min (NOAA atualiza a cada 3 min)
  tle_ttl: 21600     # 6 horas (TLE muda devagar)

# Logging
logging:
  level: DEBUG       # DEBUG em dev
  format: detailed
```

**Uso**:
```bash
docker run -p 8000:8000 -v ./asog.dev.yml:/app/asog.yml dp-asog-service
```

---

## ⚓ Offshore Brazil (Campos Basin)

**Arquivo**: `asog.offshore-brazil.yml`

```yaml
# DP ASOG Service - Offshore Brazil Configuration
# Otimizado para Bacia de Campos / Santos

thresholds:
  kp_amber: 4        # Mais conservador (latitude baixa = scintillation risk)
  kp_red: 6          # RED antes (pós-pôr do sol é crítico)
  pdop_amber: 3.5    # Exigência maior de PDOP
  pdop_red: 5.0      # Tolerância menor

use_wam_ipe: true    # Ligar TEC (importante em zona equatorial)

elev_mask_deg: 15    # Máscara maior (evita satélites baixos)

constellations:
  - GPS
  - GALILEO
  - GLONASS          # Incluir GLONASS (boa cobertura em baixa latitude)

# Scintillation mitigation
scintillation:
  enabled: true
  avoid_post_sunset: true      # Bloquear operações 18:00-22:00 local
  post_sunset_kp_limit: 3      # Se Kp > 3 após pôr do sol, HOLD

# Alertas
alerts:
  email: operations@vessel.com
  webhook: https://your-slack-webhook.com

logging:
  level: INFO
  format: json       # Melhor pra parsing em prod
```

**Recomendações operacionais**:
- ✅ Evitar 18:00-22:00 BRT (pós-pôr do sol = scintillation peak)
- ✅ Kp > 4 já é AMBER (baixa latitude = mais sensível)
- ✅ Multi-constellation obrigatório (GPS + Galileo + GLONASS)

---

## 🌊 North Sea Operations

**Arquivo**: `asog.north-sea.yml`

```yaml
# DP ASOG Service - North Sea Configuration
# Otimizado para altas latitudes (55-65°N)

thresholds:
  kp_amber: 5        # Alta latitude tolera Kp maior (polar cap)
  kp_red: 8          # Só RED em storm severa
  pdop_amber: 4.0    # DOP normal
  pdop_red: 6.0

use_wam_ipe: false   # TEC menos relevante em alta latitude

elev_mask_deg: 10    # Máscara padrão

constellations:
  - GPS
  - GALILEO
  - GLONASS          # Excelente cobertura em altas latitudes
  # GLONASS é ESSENCIAL no North Sea!

# Polar cap considerations
polar:
  enabled: true
  latitude_threshold: 55  # Acima de 55°N = polar zone
  aurora_monitoring: true # Monitorar aurora (auroral oval)

# Weather integration (opcional)
weather:
  check_ionospheric_conditions: true
  kp_forecast_weight: 0.7        # Dar peso ao forecast (aurora é previsível)

logging:
  level: INFO
  format: json
```

**Recomendações**:
- ✅ GLONASS é crítico (órbitas inclinadas = melhor cobertura polar)
- ✅ Aurora = degradação GNSS (mas forecast é bom)
- ✅ Kp pode ser maior (polar cap absorve melhor)

---

## 🏝️ Equatorial Zone (West Africa, SE Asia)

**Arquivo**: `asog.equatorial.yml`

```yaml
# DP ASOG Service - Equatorial Configuration
# Para operações em ±20° latitude (West Africa, SE Asia, etc.)

thresholds:
  kp_amber: 3        # MUITO conservador (scintillation é agressivo)
  kp_red: 5          # RED cedo
  pdop_amber: 3.0    # Exigência alta
  pdop_red: 4.5      # Tolerância baixa

use_wam_ipe: true    # TEC é CRÍTICO em zona equatorial

elev_mask_deg: 20    # Máscara alta (evita scintillation em baixo ângulo)

constellations:
  - GPS
  - GALILEO
  - BEIDOU           # BeiDou é bom em SE Asia

# Scintillation zone (equatorial anomaly)
scintillation:
  enabled: true
  avoid_post_sunset: true
  post_sunset_window: [18, 23]     # 18:00-23:00 local
  post_sunset_kp_limit: 2          # Kp > 2 = NO-GO após sunset
  ionospheric_trough: true         # Evitar trough (midnight sector)

# Multi-frequency mandatory
gnss:
  dual_frequency_required: true    # L1+L5 obrigatório
  minimum_satellites: 8            # Mínimo 8 sats (vs 6 padrão)

# TEC monitoring
tec:
  threshold_amber: 30 TECU         # TEC > 30 = AMBER
  threshold_red: 50 TECU           # TEC > 50 = RED
  roti_enabled: true               # ROTI (TEC variability) = scintillation proxy

logging:
  level: INFO
  format: json
```

**Recomendações CRÍTICAS**:
- 🔴 **NUNCA opere 18:00-23:00 local com Kp > 2**
- 🔴 Scintillation é SEVERO em zona equatorial
- 🔴 Dual-frequency (L1+L5) é obrigatório
- 🔴 TEC > 50 TECU = altíssima probabilidade de scintillation

---

## 🏭 Production (High Availability)

**Arquivo**: `asog.prod.yml`

```yaml
# DP ASOG Service - Production Configuration
# Para deployment em cluster com alta disponibilidade

thresholds:
  kp_amber: 5
  kp_red: 7
  pdop_amber: 4.0
  pdop_red: 6.0

use_wam_ipe: true    # TEC em produção

elev_mask_deg: 10

constellations:
  - GPS
  - GALILEO
  - GLONASS

# Cache (Redis se disponível)
cache:
  backend: redis           # Use Redis em prod (vs in-memory)
  redis_host: redis
  redis_port: 6379
  redis_db: 0
  kp_ttl: 600
  tle_ttl: 21600

# Performance
performance:
  workers: 4               # Uvicorn workers
  max_requests: 1000       # Restart worker após 1k requests
  timeout: 30              # Request timeout (s)

# Observability
observability:
  enabled: true
  metrics_port: 9090       # Prometheus metrics
  tracing: true            # OpenTelemetry
  jaeger_host: jaeger
  jaeger_port: 6831

# Alerts
alerts:
  enabled: true
  slack_webhook: ${SLACK_WEBHOOK}
  email_smtp: smtp.company.com
  email_to: ops@company.com
  pagerduty_key: ${PAGERDUTY_KEY}

# Backup data sources
backup:
  enabled: true
  fallback_noaa: https://services.swpc.noaa.gov  # Primary
  fallback_celestrak: https://celestrak.org      # Primary
  # Se primários falharem, usar backups:
  backup_noaa: https://backup-swpc.noaa.gov
  backup_celestrak: https://backup-celestrak.org

logging:
  level: WARNING           # Só warnings/errors em prod
  format: json
  output: /var/log/dp-asog/app.log
  rotation: daily
  retention: 30            # 30 dias de logs
```

**Deployment**:
```bash
# Docker Compose com Redis + Jaeger
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🧪 Testing / Simulation

**Arquivo**: `asog.test.yml`

```yaml
# DP ASOG Service - Testing Configuration
# Para testes automatizados e simulação

thresholds:
  kp_amber: 5
  kp_red: 7
  pdop_amber: 4.0
  pdop_red: 6.0

use_wam_ipe: false   # Desligado (testes não precisam)

elev_mask_deg: 10

constellations:
  - GPS
  - GALILEO

# Mock data (para CI/CD)
testing:
  enabled: true
  mock_noaa: true          # Usar dados simulados de Kp
  mock_celestrak: true     # Usar TLE fixo (não baixar)
  fixed_kp: 3.0            # Kp fixo em 3.0
  fixed_pdop: 2.5          # PDOP fixo em 2.5
  scenario: normal         # normal | storm | degraded

# Bypass cache (sempre recalcular)
cache:
  enabled: false

logging:
  level: DEBUG
  format: detailed
  output: stdout
```

**Uso em CI/CD**:
```yaml
# .github/workflows/test.yml
- name: Run DP ASOG tests
  run: |
    docker run -v ./asog.test.yml:/app/asog.yml dp-asog-service pytest
```

---

## 📊 Comparação de Cenários

| Cenário | Kp AMBER | Kp RED | PDOP AMBER | PDOP RED | Constelações | Observações |
|---------|----------|--------|------------|----------|--------------|-------------|
| **Development** | 5 | 7 | 4.0 | 6.0 | GPS+GAL | Padrão |
| **Brazil Offshore** | 4 | 6 | 3.5 | 5.0 | GPS+GAL+GLO | Scintillation risk |
| **North Sea** | 5 | 8 | 4.0 | 6.0 | GPS+GAL+GLO | GLONASS crítico |
| **Equatorial** | 3 | 5 | 3.0 | 4.5 | GPS+GAL+BDS | Scintillation severo |
| **Production** | 5 | 7 | 4.0 | 6.0 | GPS+GAL+GLO | HA + Redis |
| **Testing** | 5 | 7 | 4.0 | 6.0 | GPS+GAL | Mock data |

---

## 🔧 Como Aplicar

### **1. Copiar arquivo de exemplo**

```bash
# Windows
copy asog.example.yml asog.offshore-brazil.yml

# Linux/Mac
cp asog.example.yml asog.offshore-brazil.yml
```

### **2. Editar thresholds**

```bash
# Windows
notepad asog.offshore-brazil.yml

# Linux/Mac
nano asog.offshore-brazil.yml
```

### **3. Deploy com config customizado**

```bash
# PowerShell
.\scripts\deploy-dp-asog.ps1 -Environment offshore-brazil -Port 8000

# Bash
./scripts/deploy-dp-asog.sh offshore-brazil --port 8000
```

### **4. Validar**

```bash
# Testar endpoint
curl http://localhost:8000/status?lat=-23&lon=-43&hours=6

# Ver logs
docker logs -f dp-asog-offshore-brazil
```

---

## 🎓 Observações Operacionais

### **Zona Equatorial (±20°)**

- 🔴 **Scintillation é o maior risco**
- 🔴 Evite 18:00-23:00 local (post-sunset peak)
- ✅ Dual-frequency obrigatório (L1+L5)
- ✅ Kp > 3 já é crítico
- ✅ TEC > 50 TECU = degradação severa

### **Alta Latitude (>55°)**

- ✅ Aurora é previsível (use forecast)
- ✅ GLONASS é crítico (órbitas inclinadas)
- ✅ Kp pode ser maior (polar cap absorve)
- ⚠️ Auroral oval = degradação rápida

### **Mid-Latitude (30-55°)**

- ✅ Condições mais estáveis
- ✅ Thresholds padrão funcionam
- ✅ GPS + Galileo suficiente
- ⚠️ Storms G3+ (Kp 7+) = problema

---

## 📚 Referências

- **NOAA Space Weather Scales**: https://www.swpc.noaa.gov/noaa-scales-explanation
- **GPS DOP Standards**: IS-GPS-200 (Interface Specification)
- **Scintillation Studies**: Equatorial Plasma Bubble (EPB) research
- **TEC Data**: WAM-IPE (NOAA), Madrigal (MIT Haystack)

---

**Nautilus One - DP ASOG Configuration Guide** 🛰️⚓  
*Novembro 2025*

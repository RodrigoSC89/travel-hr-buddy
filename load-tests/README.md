# Load Testing - Nauti One v4.0

## Configuração

### Pré-requisitos
```bash
# Instalar k6 (macOS)
brew install k6

# Instalar k6 (Linux)
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 379CE192D401AB61
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Instalar k6 (Windows)
choco install k6
```

### Variáveis de Ambiente
```bash
export BASE_URL="https://travel-hr-buddy.lovable.app"
export SUPABASE_URL="https://vnbptmixvwropvanyhdb.supabase.co"
export SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE"
```

## Executar Testes

### Smoke Test (Rápido - 1 minuto)
```bash
k6 run --config load-tests/scenarios.js --env SCENARIO=smoke load-tests/scenarios.js
```

### Load Test (Normal - 5 minutos)
```bash
k6 run load-tests/scenarios.js --tag scenario=load
```

### Stress Test (Encontrar Limites - 12 minutos)
```bash
k6 run load-tests/scenarios.js --tag scenario=stress
```

### Spike Test (Pico de Tráfego - 3 minutos)
```bash
k6 run load-tests/scenarios.js --tag scenario=spike
```

### Soak Test (Longa Duração - 1 hora)
```bash
k6 run load-tests/scenarios.js --tag scenario=soak
```

## SLOs (Service Level Objectives)

| Métrica | Target | Crítico |
|---------|--------|---------|
| HTTP Duration P95 | < 3s | > 5s |
| HTTP Duration P99 | < 5s | > 10s |
| Error Rate | < 1% | > 5% |
| Login Duration P95 | < 5s | > 10s |
| API Duration P95 | < 2s | > 5s |

## Interpretar Resultados

### ✅ Passou
```
✓ http_req_duration..............: avg=245ms min=12ms med=198ms max=2.3s p(90)=456ms p(95)=678ms
✓ http_req_failed................: 0.12%   ✓ 12    ✗ 9988
✓ error_rate.....................: 0.5%    ✓ 50    ✗ 9950
```

### ❌ Falhou
```
✗ http_req_duration..............: avg=4.5s  min=1.2s med=3.8s max=15s  p(90)=8s    p(95)=12s
✗ http_req_failed................: 8.5%    ✓ 850   ✗ 9150
✗ error_rate.....................: 12%     ✓ 1200  ✗ 8800
```

## Exportar Resultados

### JSON
```bash
k6 run --out json=results.json load-tests/scenarios.js
```

### InfluxDB (para Grafana)
```bash
k6 run --out influxdb=http://localhost:8086/k6 load-tests/scenarios.js
```

### Cloud (k6 Cloud)
```bash
k6 cloud load-tests/scenarios.js
```

## Troubleshooting

### Rate Limiting
Se encontrar erros 429, ajuste os stages do teste ou adicione delays.

### Timeout Errors
Aumente os timeouts ou verifique a conectividade.

### Memory Issues
Para testes de longa duração, use `--no-usage-report` para reduzir overhead.

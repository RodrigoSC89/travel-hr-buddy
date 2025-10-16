# Forecast List API - Quick Reference

## Endpoint
```
GET /api/forecast/list
```

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `source` | string | - | Filter by forecast source |
| `created_by` | string | - | Filter by creator |
| `limit` | number | 25 | Number of records to return |

## Quick Examples

### Get latest 25 forecasts
```bash
GET /api/forecast/list
```

### Filter by source
```bash
GET /api/forecast/list?source=dev-mock
GET /api/forecast/list?source=cron-job
GET /api/forecast/list?source=api-call
```

### Filter by creator
```bash
GET /api/forecast/list?created_by=admin
GET /api/forecast/list?created_by=engenharia@nautilus.system
```

### Custom limit
```bash
GET /api/forecast/list?limit=50
GET /api/forecast/list?limit=100
```

### Combined filters
```bash
GET /api/forecast/list?source=cron-job&limit=50
GET /api/forecast/list?created_by=admin&limit=100
GET /api/forecast/list?source=dev-mock&created_by=engenharia@nautilus.system&limit=100
```

## Common Use Cases

### Development & Testing
```bash
# View only test data
GET /api/forecast/list?source=dev-mock
```

### Monitor Cron Jobs
```bash
# Track automated forecasts
GET /api/forecast/list?source=cron-job
```

### User Analytics
```bash
# Analyze specific user activity
GET /api/forecast/list?created_by=admin
```

### Dashboard Filtering
```bash
# Dynamic filters based on user selection
GET /api/forecast/list?source=api-call&limit=50
```

### Analytical Reports
```bash
# Flexible datasets for analysis
GET /api/forecast/list?source=cron-job&limit=100
```

## Response Format

### Success (200)
```json
[
  {
    "id": 1,
    "forecast": "Análise preditiva completa...",
    "source": "cron-job",
    "created_by": "admin",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### Error (500)
```json
{
  "error": "Erro ao carregar previsões."
}
```

## Notes

- All parameters are **optional**
- Parameters can be **combined** in any way
- Results are always ordered by `created_at` **descending** (newest first)
- Default limit is **25** if not specified
- **Backward compatible** - works the same as before when no params provided

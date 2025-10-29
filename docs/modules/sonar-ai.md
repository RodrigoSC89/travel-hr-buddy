# Sonar AI Module

## Visão Geral

O Sonar AI é um módulo de análise inteligente de dados de sonar submarino, utilizando AI para detecção de objetos, classificação de alvos e mapeamento do fundo oceânico.

**Categoria**: AI / Ocean Technology  
**Rota**: `/sonar-ai`  
**Status**: Ativo  
**Versão**: 448.0

## Componentes Principais

### SonarViewer
- Visualização de dados de sonar em tempo real
- Waterfall display
- Sector scan visualization
- 3D ocean floor mapping

### ObjectDetector
- AI-powered object detection
- Target classification
- Size estimation
- Movement tracking

### PatternAnalyzer
- Pattern recognition no fundo oceânico
- Geological feature identification
- Anomaly detection
- Historical comparison

### DataProcessor
- Real-time sonar data processing
- Noise filtering
- Signal enhancement
- Data compression

## Banco de Dados Utilizado

### Tabelas Principais
```sql
CREATE TABLE sonar_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id UUID REFERENCES vessels(id),
  scan_type VARCHAR(50) NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  depth DECIMAL(8, 2),
  scan_data JSONB,
  processed_data JSONB,
  detected_objects INTEGER DEFAULT 0,
  scan_timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE detected_objects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scan_id UUID REFERENCES sonar_scans(id),
  object_type VARCHAR(100),
  classification VARCHAR(100),
  confidence DECIMAL(5, 4),
  position_x DECIMAL(10, 2),
  position_y DECIMAL(10, 2),
  position_z DECIMAL(10, 2),
  size_estimate JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Requisições API Envolvidas

### Sonar Data
- **GET /api/sonar/scans** - Lista scans
- **POST /api/sonar/scans** - Upload scan data
- **GET /api/sonar/scans/:id** - Detalhes do scan
- **POST /api/sonar/analyze** - Análise AI
- **WebSocket /ws/sonar** - Stream de dados

### Object Detection
- **GET /api/sonar/objects** - Lista objetos detectados
- **GET /api/sonar/objects/:id** - Detalhes do objeto
- **POST /api/sonar/classify** - Classificação de objeto

## Integrações

- **Underwater Drone**: Dados de ROV/AUV
- **Mission Control**: Missões de inspeção
- **Ocean Sonar**: Dados de sonar legacy

## Última Atualização

**Data**: 2025-10-29  
**Versão**: 448.0  
**Features**: Object detection, AI classification

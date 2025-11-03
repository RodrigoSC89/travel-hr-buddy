# Travel Intelligence Module

## Overview

O módulo Travel Intelligence é um sistema completo para gerenciamento de viagens corporativas, integrando busca de passagens aéreas, hospedagens, análise preditiva com IA e gestão de reservas.

## Features

### ✈️ Busca de Passagens Aéreas
- Integração com APIs de companhias aéreas (Amadeus)
- Comparação de preços em tempo real
- Fallback automático para dados de demonstração
- Cache de últimas 5 consultas (30 minutos)
- Validação inteligente de entrada
- Interface responsiva (mobile/tablet/desktop)

### 🏨 Busca de Hospedagens
- Integração com APIs de hotéis
- Filtros avançados (preço, comodidades, avaliação)
- Sistema de reservas
- Fallback automático
- Cache de consultas

### 🧠 IA Preditiva
- Análise de tendências de preços
- Recomendações inteligentes
- Otimização de custos
- Previsão de demanda

### 💾 Cache System
- Armazena últimas 5 consultas
- Validade de 30 minutos
- Armazenamento local (localStorage)
- Reduz chamadas de API

## API Integration

### Amadeus API
O módulo se integra com a API Amadeus para busca de voos e hotéis em tempo real.

#### Flight Search
```typescript
const { data, error } = await supabase.functions.invoke("amadeus-search", {
  body: {
    searchType: "flights",
    origin: "GRU",
    destination: "SDU",
    departureDate: "2024-01-15",
    adults: 1
  }
});
```

#### Hotel Search
```typescript
const { data, error } = await supabase.functions.invoke("amadeus-search", {
  body: {
    searchType: "hotels",
    cityName: "Rio de Janeiro",
    checkIn: "2024-01-15",
    checkOut: "2024-01-17",
    adults: 2,
    rooms: 1
  }
});
```

## Fallback Mechanism

### Quando o Fallback é Ativado
- Timeout da API (> 10 segundos)
- Erro de quota/rate limit
- Erro de rede/conexão
- Resposta inválida da API

### Comportamento do Fallback
1. Detecta tipo de erro
2. Exibe mensagem específica ao usuário
3. Carrega dados de demonstração
4. Salva no cache para uso offline

### Exemplo de Mensagens
- **Timeout**: "A API não respondeu a tempo. Exibindo resultados de demonstração."
- **Quota**: "Limite de requisições atingido. Exibindo resultados de demonstração."
- **Network**: "Erro de conexão. Verifique sua internet. Exibindo resultados de demonstração."

## Input Validation

### Validação de Origem/Destino
- Remove caracteres especiais
- Normaliza códigos IATA (3 letras)
- Formata cidade + código: "São Paulo (GRU)"
- Previne injeção de código

### Validação de Datas
- Check-in < Check-out
- Data de partida >= hoje
- Formato ISO 8601

### Validação de Passageiros/Hóspedes
- Mínimo: 1
- Máximo: 9 (padrão da indústria)

## Cache Implementation

### Estrutura do Cache
```typescript
interface SearchCache {
  params: {
    from: string;
    to: string;
    departure: string;
    return: string;
    passengers: number;
    class: string;
  };
  results: FlightOption[];
  timestamp: number;
}
```

### Cache Management
- **MAX_CACHE_ITEMS**: 5 consultas
- **CACHE_EXPIRY_MS**: 30 minutos (1.800.000ms)
- **Storage**: localStorage
- **Key**: `travel_search_cache` / `hotel_search_cache`

### Cache Operations
1. **loadCache()**: Carrega e filtra itens expirados
2. **saveToCache()**: Adiciona nova consulta (FIFO)
3. **findInCache()**: Busca consulta correspondente

## Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations
- Grid ajustável (1/2/4 colunas)
- Touch-friendly buttons
- Simplified forms
- Collapsible filters
- Bottom-sheet modals

## Security

### API Keys
- Armazenadas em variáveis de ambiente (.env)
- Nunca expostas no frontend
- Acesso via Supabase Edge Functions

### Input Sanitization
- Validação de entrada
- Escape de caracteres especiais
- Prevenção de XSS
- Rate limiting

### Environment Variables
```bash
# .env
AMADEUS_API_KEY=your_key_here
AMADEUS_API_SECRET=your_secret_here
```

## Testing

### E2E Tests (Playwright)
Arquivo: `e2e/travel-fallback.spec.ts`

#### Test Cases
1. ✅ API fallback quando servidor falha
2. ✅ Fallback de hotéis
3. ✅ Timeout handling
4. ✅ Cache functionality
5. ✅ Input validation
6. ✅ Mobile responsiveness

### Running Tests
```bash
# Run all travel tests
npm run test:e2e -- travel-fallback

# Run with UI
npm run test:e2e:ui -- travel-fallback

# Run headed mode
npm run test:e2e:headed -- travel-fallback
```

## Usage Examples

### Basic Flight Search
```typescript
import { FlightSearch } from '@/components/travel/flight-search';

function TravelPage() {
  return (
    <div>
      <FlightSearch />
    </div>
  );
}
```

### With Cache Pre-loading
```typescript
useEffect(() => {
  const cached = findInCache(searchParams);
  if (cached && cached.length > 0) {
    setFlights(cached);
    setFilteredFlights(cached);
  }
}, []);
```

### Custom Fallback Handler
```typescript
try {
  const { data, error } = await searchAPI();
  if (error) throw error;
  setResults(data);
} catch (error: any) {
  let errorMessage = "Falha ao buscar dados.";
  if (error?.message?.includes("Timeout")) {
    errorMessage = "A API não respondeu a tempo.";
  }
  setApiError(errorMessage);
  setResults(mockData);
}
```

## Performance

### Optimization Strategies
- Lazy loading de componentes
- Debounced search inputs
- Memoization de resultados
- Virtual scrolling para listas grandes
- Image lazy loading

### Metrics
- **First Load**: < 3s
- **API Response**: < 2s (with 10s timeout)
- **Cache Hit**: < 100ms
- **Fallback**: < 500ms

## Roadmap

### Phase 1 (✅ PATCH 608.1)
- [x] API fallback implementation
- [x] LLM input validation
- [x] Cache system (5 queries)
- [x] Responsive UI
- [x] E2E tests
- [x] Documentation

### Phase 2 (Planned)
- [ ] Multi-city searches
- [ ] Price alerts
- [ ] Calendar view
- [ ] Trip recommendations
- [ ] Integration with expense system

### Phase 3 (Future)
- [ ] ML price prediction
- [ ] Carbon footprint tracking
- [ ] Group bookings
- [ ] Mobile app (Capacitor)

## Troubleshooting

### Common Issues

#### API not responding
**Problema**: Timeout em todas as requisições  
**Solução**: Verificar .env e credenciais da API

#### Cache not working
**Problema**: Resultados não são salvos  
**Solução**: Verificar localStorage permissions

#### Validation errors
**Problema**: Inputs válidos são rejeitados  
**Solução**: Revisar regex em `validateAndRewriteInput()`

## Support

Para suporte e dúvidas:
- Issues: GitHub Issues
- Documentation: `/docs/modules/travel-intelligence.md`
- Tests: `/e2e/travel-fallback.spec.ts`

## License

Part of Travel HR Buddy System - Internal Use Only

---

**Last Updated**: PATCH 608.1  
**Version**: 1.0.0  
**Status**: ✅ Active

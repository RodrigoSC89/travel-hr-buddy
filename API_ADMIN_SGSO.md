# API Admin SGSO - Métricas de Risco

## 📋 Descrição

API REST que classifica automaticamente o nível de risco por embarcação baseado em falhas críticas detectadas pelo sistema SGSO (Sistema de Gestão de Segurança Operacional).

## 🎯 Funcionalidades

- ✅ Agrega falhas críticas por embarcação e mês
- ✅ Classifica automaticamente o nível de risco
- ✅ Retorna dados prontos para painéis interativos
- ✅ Suporta análise de até 12 meses de histórico

## 🔗 Endpoint

```
GET /api/admin/sgso
```

## 📊 Classificação de Risco

A API classifica automaticamente o risco baseado no total de falhas críticas:

| Nível | Condição | Emoji |
|-------|----------|-------|
| 🔴 **Alto** | 5+ falhas críticas | ⚠️ |
| 🟠 **Moderado** | 3–4 falhas | ⚡ |
| 🟢 **Baixo** | <3 falhas | ✅ |

## 📝 Formato de Resposta

```typescript
interface EmbarcacaoRisco {
  embarcacao: string;           // Nome da embarcação
  total: number;                // Total de falhas críticas
  por_mes: Record<string, number>;  // Falhas por mês (formato: "YYYY-MM")
  risco: "baixo" | "moderado" | "alto";  // Classificação de risco
}

type Response = EmbarcacaoRisco[];
```

## 📚 Exemplo de Uso

### Request

```bash
curl -X GET https://seu-dominio.com/api/admin/sgso
```

### Response (200 OK)

```json
[
  {
    "embarcacao": "Navio Atlântico",
    "total": 7,
    "por_mes": {
      "2025-10": 3,
      "2025-09": 2,
      "2025-08": 2
    },
    "risco": "alto"
  },
  {
    "embarcacao": "Navio Pacífico",
    "total": 4,
    "por_mes": {
      "2025-10": 2,
      "2025-09": 2
    },
    "risco": "moderado"
  },
  {
    "embarcacao": "Navio Índico",
    "total": 1,
    "por_mes": {
      "2025-10": 1
    },
    "risco": "baixo"
  }
]
```

## ❌ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 405 | Método não permitido (apenas GET é aceito) |
| 500 | Erro ao buscar ou processar métricas |

### Exemplo de Erro

```json
{
  "error": "Método não permitido."
}
```

## 🔧 Implementação Técnica

### Função RPC do Supabase

A API utiliza a função RPC `auditoria_metricas_risco()` que:

1. Busca incidentes de segurança dos últimos 12 meses
2. Filtra por severidade crítica/alta
3. Agrupa por embarcação e mês
4. Retorna contagem de falhas críticas

### Processamento no Servidor

O endpoint Node.js/Next.js:

1. Chama a função RPC do Supabase
2. Agrega os dados por embarcação
3. Calcula o total de falhas por embarcação
4. Classifica o nível de risco automaticamente
5. Retorna array com todos os dados processados

## 🔐 Autenticação

Esta é uma API administrativa que requer autenticação. Certifique-se de:

- Usar o `SUPABASE_SERVICE_ROLE_KEY` no servidor
- Implementar verificação de permissões de admin no frontend
- Não expor esta API publicamente sem autenticação adequada

## 📊 Uso em Dashboards

### Exemplo React/TypeScript

```typescript
import { useEffect, useState } from 'react';

interface EmbarcacaoRisco {
  embarcacao: string;
  total: number;
  por_mes: Record<string, number>;
  risco: "baixo" | "moderado" | "alto";
}

function SGSODashboard() {
  const [metricas, setMetricas] = useState<EmbarcacaoRisco[]>([]);

  useEffect(() => {
    fetch('/api/admin/sgso')
      .then(res => res.json())
      .then(data => setMetricas(data));
  }, []);

  return (
    <div>
      {metricas.map(m => (
        <div key={m.embarcacao} className={`risk-${m.risco}`}>
          <h3>{m.embarcacao}</h3>
          <p>Total de falhas: {m.total}</p>
          <p>Risco: {m.risco.toUpperCase()}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🎨 Sugestões de Visualização

### Indicadores Visuais por Nível de Risco

```css
.risk-alto {
  background-color: #fee;
  border-left: 4px solid #dc2626;
}

.risk-moderado {
  background-color: #fef3c7;
  border-left: 4px solid #f59e0b;
}

.risk-baixo {
  background-color: #dcfce7;
  border-left: 4px solid #16a34a;
}
```

## 📈 Casos de Uso

1. **Dashboard SGSO**: Visualização em tempo real do status de risco da frota
2. **Relatórios Gerenciais**: Identificação rápida de embarcações que requerem atenção
3. **Alertas Automáticos**: Acionamento de notificações quando embarcações atingem risco alto
4. **Análise de Tendências**: Acompanhamento de evolução do risco ao longo dos meses
5. **Planejamento de Auditorias**: Priorização de auditorias baseada no nível de risco

## 🔍 Monitoramento

Os logs incluem:

- ✅ Erros de chamada RPC
- ✅ Erros de processamento de dados
- ✅ Informações de console para debug

## 🚀 Próximos Passos

Possíveis melhorias futuras:

- [ ] Adicionar filtros por data
- [ ] Incluir detalhes dos incidentes
- [ ] Suporte a exportação em PDF/CSV
- [ ] Notificações automáticas por email
- [ ] Histórico de evolução do risco
- [ ] Comparação entre embarcações

## 📝 Notas Técnicas

- A função RPC é executada com `SECURITY DEFINER` para acesso aos dados
- Os dados são agregados no banco de dados para melhor performance
- A classificação de risco é calculada no servidor para consistência
- O endpoint não requer paginação (quantidade limitada de embarcações)

## 📞 Suporte

Para questões ou melhorias, consulte:

- Documentação do SGSO: `/docs/sgso/`
- Guia de APIs: `/docs/api/`
- Time de DevOps: devops@empresa.com

---

**Versão**: 1.0.0  
**Última atualização**: 2025-10-16  
**Pronto para uso**: ✅ Sim

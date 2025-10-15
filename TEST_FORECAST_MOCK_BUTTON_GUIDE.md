# TestForecastMockButton - Guia de Uso

## 📝 Descrição

O componente `TestForecastMockButton` permite testar a funcionalidade de previsão da IA usando dados simulados (mock), sem necessidade de dados reais do banco de dados. Ideal para desenvolvimento e testes.

## 🎯 Funcionalidade

- Botão para executar teste de previsão com dados mock
- Exibe loading durante a execução
- Mostra o resultado da IA em formato texto
- Tratamento de erros integrado

## 📦 Como usar

### 1. Importar o componente

```tsx
import { TestForecastMockButton } from '@/components/bi/TestForecastMockButton';
```

### 2. Adicionar no layout

```tsx
<TestForecastMockButton />
```

## 💻 Exemplo Completo

```tsx
import { TestForecastMockButton } from '@/components/bi/TestForecastMockButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MyBIPage() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Testar IA com Dados Mock</CardTitle>
        </CardHeader>
        <CardContent>
          <TestForecastMockButton />
        </CardContent>
      </Card>
    </div>
  );
}
```

## 🔧 API Endpoint

O componente faz uma chamada para o endpoint:

```
GET/POST /api/dev/test-forecast-with-mock
```

Este endpoint:
- Usa dados mock pré-configurados (tendências de jobs simuladas)
- Chama a API da OpenAI para gerar a previsão
- Retorna a previsão em formato texto

## 📊 Dados Mock Utilizados

Os dados mock incluem:
- **Tendência de Jobs**: 6 meses de dados simulados (Agosto a Janeiro)
- **Dados Históricos**: 
  - Total de jobs: 312
  - Jobs por status (pending, in_progress, completed, cancelled)
  - Jobs por componente (engine, hull, electrical, etc.)
  - Tendência recente (últimos 30 vs 60 dias)

## 🔑 Requisitos

- Variável de ambiente `OPENAI_API_KEY` configurada no servidor
- Modelo OpenAI: `gpt-4o-mini`

## 📍 Exemplo de Uso Real

O componente já está integrado na página de exemplo BI:

**Caminho**: `/src/pages/BIExportExample.tsx`

Você pode acessar esta página na aplicação para ver o componente em ação.

## ⚙️ Configuração

Não há configuração adicional necessária. O componente funciona out-of-the-box após a instalação, desde que a API Key da OpenAI esteja configurada.

## 🎨 Customização

O componente usa o design system do Shadcn/UI e suporta temas dark/light automaticamente através das classes Tailwind CSS.

## 🐛 Tratamento de Erros

O componente trata automaticamente os seguintes cenários:
- API Key não configurada
- Erro na chamada da API OpenAI
- Erro de rede
- Timeout

Em caso de erro, uma mensagem amigável é exibida no output.

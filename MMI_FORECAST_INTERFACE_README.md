# MMI Forecast IA - Interface de Manutenção Inteligente

## 📍 Localização
`/admin/mmi/forecast`

## 🎯 Objetivo
Interface web para geração de previsões de manutenção preventiva offshore utilizando IA (GPT-4). Permite inserir dados históricos de manutenção e características do sistema para receber recomendações técnicas em tempo real.

## ✨ Funcionalidades

### Formulário de Entrada
- **🚢 Embarcação**: Nome da embarcação/vessel
- **⚙️ Sistema**: Nome do sistema ou equipamento
- **⏱ Horímetro atual**: Horas de operação acumuladas
- **🧾 Histórico de Manutenções**: Lista de manutenções anteriores (uma por linha)

### Resposta IA
A interface exibe em tempo real (streaming) a análise da IA, incluindo:
1. Próxima intervenção recomendada
2. Justificativa técnica
3. Impacto de não executá-la
4. Prioridade sugerida
5. Frequência recomendada para o sistema

## 🔧 Implementação Técnica

### Frontend
- **Arquivo**: `/src/pages/admin/mmi/forecast/page.tsx`
- **Rota**: `/admin/mmi/forecast`
- **Componentes utilizados**:
  - `Input` - Campos de texto e número
  - `Textarea` - Área de texto para múltiplas linhas
  - `Button` - Botão de submissão
  - `Label` - Rótulos dos campos

### Backend API
- **Endpoint**: `/api/mmi/forecast`
- **Método**: POST
- **Arquivo**: `/pages/api/mmi/forecast/route.ts`
- **Tecnologia**: OpenAI GPT-4 com streaming SSE (Server-Sent Events)

### Formato da Requisição
```json
{
  "vessel_name": "PSV Ocean STAR",
  "system_name": "Motor Principal MAN B&W",
  "current_hourmeter": 12500,
  "last_maintenance_dates": [
    "15/01/2025 - Troca de óleo lubrificante",
    "22/03/2025 - Inspeção de válvulas",
    "10/05/2025 - Manutenção do sistema de refrigeração"
  ]
}
```

### Formato da Resposta
A resposta é transmitida via streaming usando Server-Sent Events (SSE):
```
data: {"content": "texto parcial..."}
data: {"content": "mais texto..."}
data: [DONE]
```

## 🧪 Testes

### Testes da Interface
- **Arquivo**: `/src/tests/pages/admin/mmi-forecast-page.test.tsx`
- Verifica renderização dos componentes
- Valida tipos de input
- Testa presença de todos os campos

### Testes da API
- **Arquivo**: `/src/tests/mmi-forecast-api.test.ts`
- Validação de campos obrigatórios
- Validação de tipos de dados
- Formatação de prompts
- Estrutura de resposta esperada

## 📸 Screenshots

### Interface Inicial
![Interface Vazia](https://github.com/user-attachments/assets/f59fff58-800c-434b-94f2-55dfc270d6c9)

### Formulário Preenchido
![Formulário Preenchido](https://github.com/user-attachments/assets/7fa0869a-dc22-4da6-8b5c-f9c580decc9a)

## 🚀 Como Usar

1. Navegue até `/admin/mmi/forecast`
2. Preencha os dados da embarcação e sistema
3. Insira o horímetro atual
4. Liste as últimas manutenções (uma por linha)
5. Clique em "📡 Gerar Forecast"
6. Acompanhe a geração da previsão em tempo real na área de texto à direita

## 🔑 Configuração

### Variáveis de Ambiente
É necessário configurar a chave da API OpenAI:
```
OPENAI_API_KEY=sua-chave-aqui
# ou
VITE_OPENAI_API_KEY=sua-chave-aqui
```

## 📝 Notas Técnicas

- A interface utiliza streaming SSE para exibir a resposta da IA em tempo real
- O parsing dos eventos SSE é feito manualmente para extrair o conteúdo JSON
- O botão é desabilitado durante o carregamento para evitar múltiplas requisições
- Tratamento de erros implementado com mensagens amigáveis ao usuário
- Layout responsivo com grid 2 colunas (desktop) e 1 coluna (mobile)

## 🔗 Arquivos Relacionados

- Interface: `/src/pages/admin/mmi/forecast/page.tsx`
- API: `/pages/api/mmi/forecast/route.ts`
- Rota: `/src/App.tsx` (linha ~118 e ~242)
- Testes: 
  - `/src/tests/pages/admin/mmi-forecast-page.test.tsx`
  - `/src/tests/mmi-forecast-api.test.ts`

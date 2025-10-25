# PATCH 174.0 – Remote Sensors Validation

## 📘 Objetivo
Testar ingestão de dados de sensores remotos para garantir coleta e processamento confiável.

## ✅ Checklist de Validação

### 1. Registro de Sensores
- [ ] Sensor pode ser registrado via interface
- [ ] Campos obrigatórios validados (ID, tipo, localização)
- [ ] ID único garantido (sem duplicatas)
- [ ] Tipo de sensor corretamente categorizado
- [ ] Localização GPS salva corretamente
- [ ] Status inicial definido (active/inactive)
- [ ] Confirmação de registro exibida

### 2. Dados em Tempo Real
- [ ] Dados recebidos via MQTT
- [ ] Frequência de atualização respeitada (< 5s)
- [ ] Valores dentro da faixa esperada
- [ ] Timestamp sincronizado corretamente
- [ ] Interface atualiza automaticamente
- [ ] Múltiplos sensores processados simultaneamente
- [ ] Nenhuma perda de dados durante transmissão

### 3. Gráficos Históricos
- [ ] Dados históricos carregam corretamente
- [ ] Período de tempo selecionável
- [ ] Gráficos renderizam sem lag
- [ ] Eixos e unidades corretos
- [ ] Zoom e navegação funcionais
- [ ] Exportação de dados disponível (CSV/JSON)
- [ ] Agregação de dados (média, min, max) funcional

### 4. Tratamento de Erros
- [ ] Sensor offline detectado
- [ ] Alerta gerado quando sem dados > 30s
- [ ] Valores anômalos identificados
- [ ] Tentativa de reconexão automática
- [ ] Logs de erro registrados
- [ ] Notificação ao operador
- [ ] Status visual atualizado (verde → vermelho)

## 📊 Critérios de Sucesso
- ✅ 100% dos sensores registrados aparecem no sistema
- ✅ Latência de dados < 5 segundos
- ✅ Gráficos carregam em < 2 segundos
- ✅ 0% de perda de dados em condições normais

## 🔍 Testes Recomendados
1. Registrar sensor de temperatura
2. Enviar dados via MQTT (simulado ou real)
3. Verificar atualização em tempo real na UI
4. Gerar gráfico histórico (últimas 24h)
5. Simular sensor offline (desconectar)
6. Validar alertas e reconexão
7. Testar 10+ sensores simultâneos

## 📡 Tipos de Sensores Suportados
- [ ] Temperatura (°C/°F)
- [ ] Pressão (hPa/psi)
- [ ] Movimento (acelerômetro/giroscópio)
- [ ] Clima (umidade, vento, precipitação)
- [ ] Qualidade da água (pH, turbidez, oxigênio)

## 🚨 Cenários de Falha
- [ ] Sensor envia dados corrompidos → ignorado + log
- [ ] Sensor sem calibração → alerta exibido
- [ ] Frequência de envio muito alta → throttling
- [ ] Bateria do sensor baixa → notificação
- [ ] Conexão intermitente → buffer local ativado

## 📊 Validação de Performance
- [ ] Sistema suporta 100+ sensores ativos
- [ ] Latência < 5s mesmo com carga alta
- [ ] Banco de dados não excede limite de armazenamento
- [ ] Consultas históricas < 3s para 1 mês de dados

## 📝 Notas
- Data da validação: _____________
- Validador: _____________
- Sensores testados: _____________
- MQTT Broker: _____________
- Ambiente: [ ] Dev [ ] Staging [ ] Production
- Status: [ ] Aprovado [ ] Reprovado [ ] Em Revisão

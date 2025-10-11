#!/bin/bash

echo "🧠 Iniciando configuração do envio automático de relatório de restaurações..."

# Diretório da função
FUNC_DIR="supabase/functions/daily-restore-report"

# Verifica se os arquivos existem
if [ ! -f "$FUNC_DIR/index.ts" ]; then
  echo "❌ ERRO: Função Edge 'daily-restore-report' não encontrada."
  exit 1
fi

if [ ! -f "$FUNC_DIR/cron.yaml" ]; then
  echo "❌ ERRO: Arquivo cron.yaml não encontrado."
  exit 1
fi

echo "📦 Deploy da função 'daily-restore-report'..."
supabase functions deploy daily-restore-report

echo "⏰ Agendamento do cron job..."
supabase functions schedule daily-restore-report

echo "✅ CRON configurado com sucesso!"
echo "📆 A função será executada diariamente às 08:00 UTC."

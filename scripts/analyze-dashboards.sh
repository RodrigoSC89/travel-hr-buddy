#!/bin/bash
# FASE B - Análise de Dashboards Redundantes
# Script automatizado para identificar e categorizar dashboards

echo "=================================================="
echo "   NAUTILUS ONE - ANÁLISE DE DASHBOARDS"
echo "   FASE B - Varredura Técnica Final"
echo "=================================================="
echo ""

REPORT_FILE="dashboard_analysis_report.txt"
REPORT_JSON="dashboard_analysis_report.json"

echo "Iniciando análise de dashboards..."
echo ""

# Criar arquivo de relatório
echo "# ANÁLISE DE DASHBOARDS - NAUTILUS ONE" > $REPORT_FILE
echo "# Data: $(date)" >> $REPORT_FILE
echo "# Repositório: /home/ubuntu/github_repos/travel-hr-buddy" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# 1. IDENTIFICAR TODOS OS DASHBOARDS
echo "=================================================" >> $REPORT_FILE
echo "1. DASHBOARDS IDENTIFICADOS" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "[1/7] Buscando arquivos com 'dashboard' no nome..."
find src -type f -iname "*dashboard*" | sort > /tmp/dashboards_by_name.txt
DASHBOARD_COUNT=$(wc -l < /tmp/dashboards_by_name.txt)

echo "Total de arquivos com 'dashboard' no nome: $DASHBOARD_COUNT" >> $REPORT_FILE
echo "" >> $REPORT_FILE
cat /tmp/dashboards_by_name.txt >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "   ✓ Encontrados $DASHBOARD_COUNT arquivos"

# 2. CATEGORIZAÇÃO POR FUNCIONALIDADE
echo "" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "2. CATEGORIZAÇÃO POR FUNCIONALIDADE" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "[2/7] Categorizando por funcionalidade..."

# Analytics Dashboards
echo "[2.1] ANALYTICS DASHBOARDS:" >> $REPORT_FILE
grep -i "analytics\|metric\|chart\|report\|statistic" /tmp/dashboards_by_name.txt >> $REPORT_FILE 2>/dev/null || echo "   Nenhum encontrado" >> $REPORT_FILE
ANALYTICS_COUNT=$(grep -i "analytics\|metric\|chart\|report\|statistic" /tmp/dashboards_by_name.txt 2>/dev/null | wc -l)
echo "   Total: $ANALYTICS_COUNT" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Monitoring Dashboards
echo "[2.2] MONITORING DASHBOARDS:" >> $REPORT_FILE
grep -i "monitor\|alert\|status\|health\|track" /tmp/dashboards_by_name.txt >> $REPORT_FILE 2>/dev/null || echo "   Nenhum encontrado" >> $REPORT_FILE
MONITORING_COUNT=$(grep -i "monitor\|alert\|status\|health\|track" /tmp/dashboards_by_name.txt 2>/dev/null | wc -l)
echo "   Total: $MONITORING_COUNT" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Management Dashboards
echo "[2.3] MANAGEMENT DASHBOARDS:" >> $REPORT_FILE
grep -i "manage\|admin\|control\|config" /tmp/dashboards_by_name.txt >> $REPORT_FILE 2>/dev/null || echo "   Nenhum encontrado" >> $REPORT_FILE
MANAGEMENT_COUNT=$(grep -i "manage\|admin\|control\|config" /tmp/dashboards_by_name.txt 2>/dev/null | wc -l)
echo "   Total: $MANAGEMENT_COUNT" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Operational Dashboards
echo "[2.4] OPERATIONAL DASHBOARDS:" >> $REPORT_FILE
grep -i "operation\|fleet\|crew\|vessel\|ship" /tmp/dashboards_by_name.txt >> $REPORT_FILE 2>/dev/null || echo "   Nenhum encontrado" >> $REPORT_FILE
OPERATIONAL_COUNT=$(grep -i "operation\|fleet\|crew\|vessel\|ship" /tmp/dashboards_by_name.txt 2>/dev/null | wc -l)
echo "   Total: $OPERATIONAL_COUNT" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "   ✓ Analytics: $ANALYTICS_COUNT | Monitoring: $MONITORING_COUNT | Management: $MANAGEMENT_COUNT | Operational: $OPERATIONAL_COUNT"

# 3. ANÁLISE DE COMPONENTES COMUNS
echo "[3/7] Analisando componentes comuns..."
echo "" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "3. COMPONENTES COMUNS POR CATEGORIA" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Buscar imports comuns
echo "[3.1] Imports mais comuns em dashboards:" >> $REPORT_FILE
for file in $(cat /tmp/dashboards_by_name.txt); do
  if [ -f "$file" ]; then
    grep -h "^import" "$file" 2>/dev/null
  fi
done | sort | uniq -c | sort -rn | head -20 >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "   ✓ Análise de componentes concluída"

# 4. ANÁLISE DE CÓDIGO (TAMANHO E COMPLEXIDADE)
echo "[4/7] Analisando tamanho e complexidade..."
echo "" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "4. TAMANHO E COMPLEXIDADE DOS DASHBOARDS" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Arquivo                                           | Linhas | Tamanho | Componentes React" >> $REPORT_FILE
echo "--------------------------------------------------|--------|---------|------------------" >> $REPORT_FILE

for file in $(cat /tmp/dashboards_by_name.txt); do
  if [ -f "$file" ]; then
    LINES=$(wc -l < "$file")
    SIZE=$(du -h "$file" | cut -f1)
    COMPONENTS=$(grep -c "const.*=.*=>\|function " "$file" 2>/dev/null || echo "0")
    printf "%-50s | %6s | %7s | %16s\n" "${file#src/}" "$LINES" "$SIZE" "$COMPONENTS" >> $REPORT_FILE
  fi
done

echo "" >> $REPORT_FILE
echo "   ✓ Análise de complexidade concluída"

# 5. IDENTIFICAR PADRÕES DE DUPLICAÇÃO
echo "[5/7] Identificando padrões de duplicação..."
echo "" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "5. PADRÕES DE DUPLICAÇÃO" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "[5.1] Dashboards com nomes similares:" >> $REPORT_FILE
cat /tmp/dashboards_by_name.txt | sed 's/[0-9]//g' | sed 's/-v.*//g' | sort | uniq -c | sort -rn | awk '$1 > 1' >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "   ✓ Padrões identificados"

# 6. ANÁLISE DE DEPENDÊNCIAS
echo "[6/7] Analisando dependências entre dashboards..."
echo "" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "6. ANÁLISE DE DEPENDÊNCIAS" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

for file in $(cat /tmp/dashboards_by_name.txt); do
  if [ -f "$file" ]; then
    DEPS=$(grep -h "from.*dashboard" "$file" 2>/dev/null | wc -l)
    if [ $DEPS -gt 0 ]; then
      echo "$file: $DEPS dependências de outros dashboards" >> $REPORT_FILE
      grep -h "from.*dashboard" "$file" 2>/dev/null | sed 's/^/  - /' >> $REPORT_FILE
      echo "" >> $REPORT_FILE
    fi
  fi
done

echo "   ✓ Dependências analisadas"

# 7. GERAR JSON ESTRUTURADO
echo "[7/7] Gerando relatório JSON estruturado..."

cat > $REPORT_JSON <<EOF
{
  "analysis_date": "$(date -Iseconds)",
  "repository": "/home/ubuntu/github_repos/travel-hr-buddy",
  "summary": {
    "total_dashboards": $DASHBOARD_COUNT,
    "analytics_dashboards": $ANALYTICS_COUNT,
    "monitoring_dashboards": $MONITORING_COUNT,
    "management_dashboards": $MANAGEMENT_COUNT,
    "operational_dashboards": $OPERATIONAL_COUNT
  },
  "files": [
EOF

# Adicionar cada arquivo ao JSON
FIRST=true
for file in $(cat /tmp/dashboards_by_name.txt); do
  if [ -f "$file" ]; then
    if [ "$FIRST" = true ]; then
      FIRST=false
    else
      echo "," >> $REPORT_JSON
    fi
    LINES=$(wc -l < "$file")
    SIZE=$(stat -c%s "$file" 2>/dev/null || echo "0")
    echo "    {" >> $REPORT_JSON
    echo "      \"path\": \"$file\"," >> $REPORT_JSON
    echo "      \"lines\": $LINES," >> $REPORT_JSON
    echo "      \"size_bytes\": $SIZE" >> $REPORT_JSON
    echo -n "    }" >> $REPORT_JSON
  fi
done

echo "" >> $REPORT_JSON
echo "  ]" >> $REPORT_JSON
echo "}" >> $REPORT_JSON

echo "   ✓ Relatório JSON gerado"

# SUMÁRIO FINAL
echo "" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "7. SUMÁRIO E RECOMENDAÇÕES" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Total de dashboards identificados: $DASHBOARD_COUNT" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Distribuição por categoria:" >> $REPORT_FILE
echo "  - Analytics:    $ANALYTICS_COUNT dashboards" >> $REPORT_FILE
echo "  - Monitoring:   $MONITORING_COUNT dashboards" >> $REPORT_FILE
echo "  - Management:   $MANAGEMENT_COUNT dashboards" >> $REPORT_FILE
echo "  - Operational:  $OPERATIONAL_COUNT dashboards" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "OPORTUNIDADES DE CONSOLIDAÇÃO:" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Alta Prioridade:" >> $REPORT_FILE
echo "  - Dashboards com nomes similares (remover sufixos -v2, -old, etc)" >> $REPORT_FILE
echo "  - Dashboards analytics (consolidar em dashboard único parametrizado)" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Média Prioridade:" >> $REPORT_FILE
echo "  - Dashboards de monitoramento (unificar componentes comuns)" >> $REPORT_FILE
echo "  - Dashboards operacionais (criar base genérica)" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Baixa Prioridade:" >> $REPORT_FILE
echo "  - Dashboards de management (avaliar caso a caso)" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo ""
echo "=================================================="
echo "   ANÁLISE CONCLUÍDA!"
echo "=================================================="
echo ""
echo "Relatórios gerados:"
echo "  - $REPORT_FILE (texto)"
echo "  - $REPORT_JSON (JSON estruturado)"
echo ""
echo "Dashboards encontrados: $DASHBOARD_COUNT"
echo ""

# Limpar arquivos temporários
rm -f /tmp/dashboards_by_name.txt

#!/bin/bash
# FASE B - Análise de Command Centers Redundantes
# Script automatizado para identificar e categorizar command centers

echo "=================================================="
echo "   NAUTILUS ONE - ANÁLISE DE COMMAND CENTERS"
echo "   FASE B - Varredura Técnica Final"
echo "=================================================="
echo ""

REPORT_FILE="command_center_analysis_report.txt"
REPORT_JSON="command_center_analysis_report.json"

echo "Iniciando análise de command centers..."
echo ""

# Criar arquivo de relatório
echo "# ANÁLISE DE COMMAND CENTERS - NAUTILUS ONE" > $REPORT_FILE
echo "# Data: $(date)" >> $REPORT_FILE
echo "# Repositório: /home/ubuntu/github_repos/travel-hr-buddy" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# 1. IDENTIFICAR TODOS OS COMMAND CENTERS
echo "=================================================" >> $REPORT_FILE
echo "1. COMMAND CENTERS IDENTIFICADOS" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "[1/7] Buscando arquivos com 'command' no nome..."
find src -type f -iname "*command*" | sort > /tmp/command_centers_by_name.txt
COMMAND_COUNT=$(wc -l < /tmp/command_centers_by_name.txt)

echo "Total de arquivos com 'command' no nome: $COMMAND_COUNT" >> $REPORT_FILE
echo "" >> $REPORT_FILE
cat /tmp/command_centers_by_name.txt >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "   ✓ Encontrados $COMMAND_COUNT arquivos"

# Também buscar por 'center' e 'control'
echo "[1.1] Buscando arquivos com 'center' ou 'control' no nome..."
find src -type f \( -iname "*center*" -o -iname "*control*" \) | grep -v "command" | sort > /tmp/centers_by_name.txt
CENTER_COUNT=$(wc -l < /tmp/centers_by_name.txt)

echo "Total de arquivos com 'center/control' no nome: $CENTER_COUNT" >> $REPORT_FILE
echo "" >> $REPORT_FILE
cat /tmp/centers_by_name.txt >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "   ✓ Encontrados $CENTER_COUNT arquivos adicionais"

# Combinar ambos
cat /tmp/command_centers_by_name.txt /tmp/centers_by_name.txt | sort > /tmp/all_command_centers.txt
TOTAL_COUNT=$(wc -l < /tmp/all_command_centers.txt)

echo "TOTAL GERAL: $TOTAL_COUNT arquivos" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# 2. CATEGORIZAÇÃO POR DOMÍNIO
echo "" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "2. CATEGORIZAÇÃO POR DOMÍNIO" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "[2/7] Categorizando por domínio..."

# Fleet Command
echo "[2.1] FLEET COMMAND:" >> $REPORT_FILE
grep -i "fleet" /tmp/all_command_centers.txt >> $REPORT_FILE 2>/dev/null || echo "   Nenhum encontrado" >> $REPORT_FILE
FLEET_COUNT=$(grep -i "fleet" /tmp/all_command_centers.txt 2>/dev/null | wc -l)
echo "   Total: $FLEET_COUNT" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Operations Command
echo "[2.2] OPERATIONS COMMAND:" >> $REPORT_FILE
grep -i "operation" /tmp/all_command_centers.txt >> $REPORT_FILE 2>/dev/null || echo "   Nenhum encontrado" >> $REPORT_FILE
OPS_COUNT=$(grep -i "operation" /tmp/all_command_centers.txt 2>/dev/null | wc -l)
echo "   Total: $OPS_COUNT" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Mission Command
echo "[2.3] MISSION COMMAND:" >> $REPORT_FILE
grep -i "mission" /tmp/all_command_centers.txt >> $REPORT_FILE 2>/dev/null || echo "   Nenhum encontrado" >> $REPORT_FILE
MISSION_COUNT=$(grep -i "mission" /tmp/all_command_centers.txt 2>/dev/null | wc -l)
echo "   Total: $MISSION_COUNT" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Control Centers
echo "[2.4] CONTROL CENTERS:" >> $REPORT_FILE
grep -i "control" /tmp/all_command_centers.txt >> $REPORT_FILE 2>/dev/null || echo "   Nenhum encontrado" >> $REPORT_FILE
CONTROL_COUNT=$(grep -i "control" /tmp/all_command_centers.txt 2>/dev/null | wc -l)
echo "   Total: $CONTROL_COUNT" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Generic Command Centers
echo "[2.5] GENERIC COMMAND/CENTERS:" >> $REPORT_FILE
grep -v -i "fleet\|operation\|mission\|control" /tmp/all_command_centers.txt >> $REPORT_FILE 2>/dev/null || echo "   Nenhum encontrado" >> $REPORT_FILE
GENERIC_COUNT=$(grep -v -i "fleet\|operation\|mission\|control" /tmp/all_command_centers.txt 2>/dev/null | wc -l)
echo "   Total: $GENERIC_COUNT" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "   ✓ Fleet: $FLEET_COUNT | Ops: $OPS_COUNT | Mission: $MISSION_COUNT | Control: $CONTROL_COUNT | Generic: $GENERIC_COUNT"

# 3. ANÁLISE DE PADRÕES COMUNS
echo "[3/7] Analisando padrões comuns..."
echo "" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "3. PADRÕES COMUNS" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "[3.1] Imports mais comuns em command centers:" >> $REPORT_FILE
for file in $(cat /tmp/all_command_centers.txt); do
  if [ -f "$file" ]; then
    grep -h "^import" "$file" 2>/dev/null
  fi
done | sort | uniq -c | sort -rn | head -20 >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "[3.2] Hooks mais utilizados:" >> $REPORT_FILE
for file in $(cat /tmp/all_command_centers.txt); do
  if [ -f "$file" ]; then
    grep -oh "use[A-Z][a-zA-Z]*" "$file" 2>/dev/null
  fi
done | sort | uniq -c | sort -rn | head -15 >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "   ✓ Padrões identificados"

# 4. ANÁLISE DE TAMANHO E COMPLEXIDADE
echo "[4/7] Analisando tamanho e complexidade..."
echo "" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "4. TAMANHO E COMPLEXIDADE" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Arquivo                                           | Linhas | Tamanho | Componentes" >> $REPORT_FILE
echo "--------------------------------------------------|--------|---------|-------------" >> $REPORT_FILE

for file in $(cat /tmp/all_command_centers.txt); do
  if [ -f "$file" ]; then
    LINES=$(wc -l < "$file")
    SIZE=$(du -h "$file" | cut -f1)
    COMPONENTS=$(grep -c "const.*=.*=>\|function " "$file" 2>/dev/null || echo "0")
    printf "%-50s | %6s | %7s | %11s\n" "${file#src/}" "$LINES" "$SIZE" "$COMPONENTS" >> $REPORT_FILE
  fi
done

echo "" >> $REPORT_FILE
echo "   ✓ Análise de complexidade concluída"

# 5. IDENTIFICAR DIFERENÇAS ESPECÍFICAS
echo "[5/7] Identificando diferenças específicas..."
echo "" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "5. DIFERENÇAS ESPECÍFICAS" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "[5.1] Command Centers com funcionalidades únicas:" >> $REPORT_FILE
for file in $(cat /tmp/all_command_centers.txt); do
  if [ -f "$file" ]; then
    # Buscar por features específicas
    HAS_REALTIME=$(grep -c "realtime\|websocket\|socket" "$file" 2>/dev/null)
    HAS_MAP=$(grep -c "map\|mapbox\|leaflet" "$file" 2>/dev/null)
    HAS_CHART=$(grep -c "chart\|recharts" "$file" 2>/dev/null)
    HAS_TABLE=$(grep -c "table\|datagrid" "$file" 2>/dev/null)
    
    FEATURES=""
    [ $HAS_REALTIME -gt 0 ] && FEATURES="$FEATURES realtime"
    [ $HAS_MAP -gt 0 ] && FEATURES="$FEATURES map"
    [ $HAS_CHART -gt 0 ] && FEATURES="$FEATURES chart"
    [ $HAS_TABLE -gt 0 ] && FEATURES="$FEATURES table"
    
    if [ -n "$FEATURES" ]; then
      echo "$file: $FEATURES" >> $REPORT_FILE
    fi
  fi
done
echo "" >> $REPORT_FILE

echo "   ✓ Diferenças identificadas"

# 6. ANÁLISE DE DEPENDÊNCIAS
echo "[6/7] Analisando dependências..."
echo "" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "6. ANÁLISE DE DEPENDÊNCIAS" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

for file in $(cat /tmp/all_command_centers.txt); do
  if [ -f "$file" ]; then
    DEPS=$(grep -h "from.*command\|from.*center\|from.*control" "$file" 2>/dev/null | wc -l)
    if [ $DEPS -gt 0 ]; then
      echo "$file: $DEPS dependências" >> $REPORT_FILE
      grep -h "from.*command\|from.*center\|from.*control" "$file" 2>/dev/null | sed 's/^/  - /' >> $REPORT_FILE
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
    "total_command_centers": $TOTAL_COUNT,
    "fleet_command": $FLEET_COUNT,
    "operations_command": $OPS_COUNT,
    "mission_command": $MISSION_COUNT,
    "control_centers": $CONTROL_COUNT,
    "generic_centers": $GENERIC_COUNT
  },
  "files": [
EOF

FIRST=true
for file in $(cat /tmp/all_command_centers.txt); do
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
echo "Total de command centers identificados: $TOTAL_COUNT" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Distribuição por domínio:" >> $REPORT_FILE
echo "  - Fleet Command:      $FLEET_COUNT" >> $REPORT_FILE
echo "  - Operations Command: $OPS_COUNT" >> $REPORT_FILE
echo "  - Mission Command:    $MISSION_COUNT" >> $REPORT_FILE
echo "  - Control Centers:    $CONTROL_COUNT" >> $REPORT_FILE
echo "  - Generic Centers:    $GENERIC_COUNT" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "OPORTUNIDADES DE CONSOLIDAÇÃO:" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Alta Prioridade:" >> $REPORT_FILE
echo "  - Unificar command centers de mesmo domínio" >> $REPORT_FILE
echo "  - Criar BaseCommandCenter genérico" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Média Prioridade:" >> $REPORT_FILE
echo "  - Parametrizar diferenças específicas" >> $REPORT_FILE
echo "  - Consolidar componentes comuns" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Baixa Prioridade:" >> $REPORT_FILE
echo "  - Avaliar necessidade de cada center" >> $REPORT_FILE
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
echo "Command Centers encontrados: $TOTAL_COUNT"
echo ""

# Limpar arquivos temporários
rm -f /tmp/command_centers_by_name.txt /tmp/centers_by_name.txt /tmp/all_command_centers.txt

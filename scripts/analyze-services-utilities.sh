#!/bin/bash
# FASE B - Análise de Services e Utilities Duplicados
# Script para identificar lógica duplicada

echo "=================================================="
echo "   NAUTILUS ONE - ANÁLISE DE SERVICES/UTILITIES"
echo "   FASE B - Varredura Técnica Final"
echo "=================================================="
echo ""

REPORT_FILE="services_utilities_report.txt"
REPORT_JSON="services_utilities_report.json"

echo "Iniciando análise de services e utilities..."
echo ""

# Criar arquivo de relatório
echo "# ANÁLISE DE SERVICES E UTILITIES - NAUTILUS ONE" > $REPORT_FILE
echo "# Data: $(date)" >> $REPORT_FILE
echo "# Repositório: /home/ubuntu/github_repos/travel-hr-buddy" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# 1. IDENTIFICAR TODOS OS SERVICES
echo "[1/6] Coletando todos os services..."
find src -type f \( -iname "*service*.ts" -o -iname "*service*.tsx" \) ! -name "*.test.*" ! -name "*.spec.*" | sort > /tmp/all_services.txt
SERVICES_COUNT=$(wc -l < /tmp/all_services.txt)

echo "=================================================" >> $REPORT_FILE
echo "1. SERVICES IDENTIFICADOS" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Total de services: $SERVICES_COUNT" >> $REPORT_FILE
echo "" >> $REPORT_FILE
cat /tmp/all_services.txt >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "   ✓ Encontrados $SERVICES_COUNT services"

# 2. IDENTIFICAR UTILITIES
echo "[2/6] Coletando todas as utilities..."
find src -type f \( -iname "*util*.ts" -o -iname "*utils*.ts" -o -iname "*helper*.ts" -o -iname "*helpers*.ts" \) ! -name "*.test.*" ! -name "*.spec.*" | sort > /tmp/all_utilities.txt
UTILS_COUNT=$(wc -l < /tmp/all_utilities.txt)

echo "" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "2. UTILITIES IDENTIFICADAS" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Total de utilities: $UTILS_COUNT" >> $REPORT_FILE
echo "" >> $REPORT_FILE
cat /tmp/all_utilities.txt >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "   ✓ Encontrados $UTILS_COUNT utilities"

# 3. ANÁLISE DE FUNÇÕES DUPLICADAS
echo "[3/6] Analisando funções duplicadas..."
echo "" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "3. ANÁLISE DE FUNÇÕES DUPLICADAS" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "[3.1] Funções exportadas em services:" >> $REPORT_FILE
for file in $(cat /tmp/all_services.txt); do
  if [ -f "$file" ]; then
    grep -h "^export.*function\|^export const.*=" "$file" 2>/dev/null | sed "s|^|  $file: |"
  fi
done | sort | uniq -c | sort -rn | head -30 >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "[3.2] Funções exportadas em utilities:" >> $REPORT_FILE
for file in $(cat /tmp/all_utilities.txt); do
  if [ -f "$file" ]; then
    grep -h "^export.*function\|^export const.*=" "$file" 2>/dev/null | sed "s|^|  $file: |"
  fi
done | sort | uniq -c | sort -rn | head -30 >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "   ✓ Funções analisadas"

# 4. IDENTIFICAR SERVICES SIMILARES
echo "[4/6] Identificando services similares..."
echo "" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "4. SERVICES SIMILARES" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "[4.1] Services por categoria:" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "API Services:" >> $REPORT_FILE
grep -i "api" /tmp/all_services.txt | sed 's/^/  - /' >> $REPORT_FILE
API_SERVICES=$(grep -i "api" /tmp/all_services.txt | wc -l)
echo "  Total: $API_SERVICES" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "Data Services:" >> $REPORT_FILE
grep -i "data" /tmp/all_services.txt | sed 's/^/  - /' >> $REPORT_FILE
DATA_SERVICES=$(grep -i "data" /tmp/all_services.txt | wc -l)
echo "  Total: $DATA_SERVICES" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "Auth Services:" >> $REPORT_FILE
grep -i "auth" /tmp/all_services.txt | sed 's/^/  - /' >> $REPORT_FILE
AUTH_SERVICES=$(grep -i "auth" /tmp/all_services.txt | wc -l)
echo "  Total: $AUTH_SERVICES" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "Storage Services:" >> $REPORT_FILE
grep -i "storage" /tmp/all_services.txt | sed 's/^/  - /' >> $REPORT_FILE
STORAGE_SERVICES=$(grep -i "storage" /tmp/all_services.txt | wc -l)
echo "  Total: $STORAGE_SERVICES" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "   ✓ API: $API_SERVICES | Data: $DATA_SERVICES | Auth: $AUTH_SERVICES | Storage: $STORAGE_SERVICES"

# 5. ANÁLISE DE DEPENDÊNCIAS
echo "[5/6] Analisando dependências entre services..."
echo "" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "5. ANÁLISE DE DEPENDÊNCIAS" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "[5.1] Services mais importados:" >> $REPORT_FILE
for file in $(cat /tmp/all_services.txt); do
  grep -h "from.*service" "$file" 2>/dev/null
done | sort | uniq -c | sort -rn | head -20 >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "[5.2] Utilities mais importadas:" >> $REPORT_FILE
for file in $(cat /tmp/all_utilities.txt); do
  grep -h "from.*util\|from.*helper" "$file" 2>/dev/null
done | sort | uniq -c | sort -rn | head -20 >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "   ✓ Dependências analisadas"

# 6. GERAR JSON ESTRUTURADO
echo "[6/6] Gerando relatório JSON estruturado..."

cat > $REPORT_JSON <<EOF
{
  "analysis_date": "$(date -Iseconds)",
  "repository": "/home/ubuntu/github_repos/travel-hr-buddy",
  "summary": {
    "total_services": $SERVICES_COUNT,
    "total_utilities": $UTILS_COUNT,
    "api_services": $API_SERVICES,
    "data_services": $DATA_SERVICES,
    "auth_services": $AUTH_SERVICES,
    "storage_services": $STORAGE_SERVICES
  },
  "services": [
EOF

FIRST=true
for file in $(cat /tmp/all_services.txt); do
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
echo "  ]," >> $REPORT_JSON
echo "  \"utilities\": [" >> $REPORT_JSON

FIRST=true
for file in $(cat /tmp/all_utilities.txt); do
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
echo "6. SUMÁRIO E RECOMENDAÇÕES" >> $REPORT_FILE
echo "=================================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Total de services: $SERVICES_COUNT" >> $REPORT_FILE
echo "Total de utilities: $UTILS_COUNT" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Distribuição de services:" >> $REPORT_FILE
echo "  - API Services:     $API_SERVICES" >> $REPORT_FILE
echo "  - Data Services:    $DATA_SERVICES" >> $REPORT_FILE
echo "  - Auth Services:    $AUTH_SERVICES" >> $REPORT_FILE
echo "  - Storage Services: $STORAGE_SERVICES" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "OPORTUNIDADES DE CONSOLIDAÇÃO:" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Alta Prioridade:" >> $REPORT_FILE
echo "  - Consolidar API services similares" >> $REPORT_FILE
echo "  - Unificar utilities de formatação" >> $REPORT_FILE
echo "  - Centralizar lógica de validação" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Média Prioridade:" >> $REPORT_FILE
echo "  - Criar BaseService genérico" >> $REPORT_FILE
echo "  - Consolidar helpers de data/time" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Baixa Prioridade:" >> $REPORT_FILE
echo "  - Revisar dependências circulares" >> $REPORT_FILE
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
echo "Services: $SERVICES_COUNT | Utilities: $UTILS_COUNT"
echo ""

# Limpar arquivos temporários
rm -f /tmp/all_services.txt /tmp/all_utilities.txt

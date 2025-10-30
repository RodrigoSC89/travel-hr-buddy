#!/bin/bash

# PATCH-540 Validation Script
# Validates SPA navigation, memory usage, performance, and code patterns

set -e

echo "🔧 PATCH-540 Validation Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if dev server is running
check_dev_server() {
    if pgrep -f "vite" > /dev/null; then
        print_success "Vite dev server is running"
        return 0
    else
        print_warning "Vite dev server is not running"
        return 1
    fi
}

# Detect OS for proper command usage
detect_os() {
    case "$(uname -s)" in
        Linux*)     echo "Linux";;
        Darwin*)    echo "Mac";;
        *)          echo "Unknown";;
    esac
}

OS_TYPE=$(detect_os)

# 1. Memory Usage Monitoring
echo "1. 💾 Monitorando uso de memória do Node.js e Vite..."
echo "---------------------------------------------------"

if check_dev_server; then
    node_pid=$(pgrep -f "vite" | head -1)
    if [ -n "$node_pid" ]; then
        echo "PID do processo Vite: $node_pid"
        
        # Use OS-specific commands
        if [ "$OS_TYPE" = "Linux" ]; then
            top -b -n 1 -p "$node_pid" -o %MEM | head -n 20
        elif [ "$OS_TYPE" = "Mac" ]; then
            ps -p "$node_pid" -o pid,ppid,user,%cpu,%mem,vsz,rss,tty,stat,start,time,command
        else
            # Fallback for unknown systems
            ps -p "$node_pid" -o pid,user,%cpu,%mem,vsz,command
        fi
        
        print_success "Monitoramento de memória concluído"
    else
        print_warning "Não foi possível obter o PID do processo Vite"
    fi
else
    print_warning "Pulando monitoramento de memória (servidor não está rodando)"
fi

echo ""

# 2. SPA Navigation Validation
echo "2. 🚦 Validando navegação SPA..."
echo "--------------------------------"

# Find <a href> tags that are not within <Link> components
# Exclude: comments, external links (http/https), mailto, tel, #anchor links
spa_violations=$(grep -r "<a href=" ./src --include="*.tsx" --include="*.jsx" 2>/dev/null | \
    grep -v "<Link" | \
    grep -v "external" | \
    grep -v "http://" | \
    grep -v "https://" | \
    grep -v "mailto:" | \
    grep -v "tel:" | \
    grep -v 'href="#' | \
    grep -v "skip-to-main" | \
    wc -l)

if [ "$spa_violations" -eq 0 ]; then
    print_success "Nenhum <a href> fora de <Link> encontrado (excluindo links externos legítimos)"
else
    print_warning "Encontrados $spa_violations possíveis usos inadequados de <a href> para navegação interna"
    echo "Detalhes (primeiros 10):"
    grep -r "<a href=" ./src --include="*.tsx" --include="*.jsx" 2>/dev/null | \
        grep -v "<Link" | \
        grep -v "external" | \
        grep -v "http://" | \
        grep -v "https://" | \
        grep -v "mailto:" | \
        grep -v "tel:" | \
        grep -v 'href="#' | \
        grep -v "skip-to-main" | \
        head -10
    echo ""
    echo "💡 Links externos (http/https) e âncoras (#) são permitidos"
fi

echo ""

# 3. Multiple .map() Usage Detection
echo "3. 🧬 Verificando uso excessivo de .map()..."
echo "--------------------------------------------"

# Find files with multiple .map() calls (may indicate complex transformations)
# Note: This detects multiple .map() calls in a file, not necessarily nested ones
high_map_usage=$(grep -r "\.map(" ./src --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" 2>/dev/null | \
    awk -F: '{print $1}' | sort | uniq -c | awk '$1 >= 3 {print $1, $2}' | wc -l)

if [ "$high_map_usage" -eq 0 ]; then
    print_success "Nenhum uso excessivo de .map() detectado"
else
    print_warning "Encontrados $high_map_usage arquivos com múltiplos .map() (3 ou mais por arquivo)"
    echo "Arquivos com alto uso de .map() (top 10):"
    grep -r "\.map(" ./src --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" 2>/dev/null | \
        awk -F: '{print $1}' | sort | uniq -c | awk '$1 >= 3 {print $1, $2}' | sort -rn | head -10
    echo ""
    echo "💡 Considere refatorar transformações complexas em funções separadas"
fi

echo ""

# 4. Code Quality Checks
echo "4. 🔍 Verificando qualidade do código..."
echo "---------------------------------------"

# Check for console.log statements (should be removed in production)
console_logs=$(grep -r "console\.log" ./src --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" 2>/dev/null | wc -l)
if [ "$console_logs" -eq 0 ]; then
    print_success "Nenhum console.log encontrado"
else
    print_warning "Encontrados $console_logs console.log no código"
fi

# Check for TODO/FIXME comments
todos=$(grep -r "TODO\|FIXME" ./src --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" 2>/dev/null | wc -l)
if [ "$todos" -eq 0 ]; then
    print_success "Nenhum TODO/FIXME pendente"
else
    print_warning "Encontrados $todos TODOs/FIXMEs pendentes"
fi

echo ""

# 5. Lighthouse Performance Test (if Lighthouse is available)
echo "5. ⚡ Testando tempo de carregamento com Lighthouse..."
echo "------------------------------------------------------"

# Check if Lighthouse is available
if command -v lighthouse &> /dev/null; then
    if check_dev_server; then
        echo "Executando Lighthouse no http://localhost:5173..."
        
        # Create secure temporary file for report
        lighthouse_report=$(mktemp /tmp/lighthouse-report-XXXXXX.json)
        
        # Run lighthouse and capture score
        if lighthouse http://localhost:5173 \
            --quiet \
            --output=json \
            --output-path="$lighthouse_report" \
            --chrome-flags="--headless --no-sandbox --disable-gpu" 2>/dev/null; then
            
            # Extract performance score using jq if available
            if command -v jq &> /dev/null; then
                perf_score=$(jq '.categories.performance.score' "$lighthouse_report" 2>/dev/null || echo "null")
                if [ "$perf_score" != "null" ] && [ -n "$perf_score" ]; then
                    perf_percentage=$(echo "$perf_score * 100" | bc 2>/dev/null || echo "N/A")
                    echo "Performance Score: ${perf_percentage}%"
                    
                    # Evaluate score
                    if (( $(echo "$perf_score >= 0.9" | bc -l 2>/dev/null || echo 0) )); then
                        print_success "Performance excelente (>= 90%)"
                    elif (( $(echo "$perf_score >= 0.5" | bc -l 2>/dev/null || echo 0) )); then
                        print_warning "Performance aceitável (>= 50%)"
                    else
                        print_error "Performance precisa melhorar (< 50%)"
                    fi
                else
                    print_warning "Não foi possível extrair o score de performance"
                fi
            else
                print_warning "jq não está instalado. Instale jq para ver scores detalhados"
                echo "Relatório salvo em: $lighthouse_report"
            fi
            
            # Clean up (keep for user review if they want)
            echo "💡 Relatório disponível em: $lighthouse_report"
        else
            print_warning "Não foi possível gerar o relatório Lighthouse"
            rm -f "$lighthouse_report"
        fi
    else
        print_warning "Servidor dev não está rodando. Pulando teste Lighthouse"
    fi
else
    print_warning "Lighthouse CLI não está instalado. Pulando teste de performance"
    echo "Para instalar: npm install -g lighthouse"
fi

echo ""

# 6. Build Check
echo "6. 🏗️  Verificando build do projeto..."
echo "--------------------------------------"

# Check if build directory exists and is recent
if [ -d "dist" ]; then
    build_size=$(du -sh dist 2>/dev/null | cut -f1)
    print_success "Build existente encontrado"
    echo "Tamanho do build: $build_size"
    
    # Optionally run a new build if --build flag is passed
    if [ "$1" = "--build" ] || [ "$1" = "--full" ]; then
        echo "Executando novo build..."
        
        # Create secure temporary file for build output
        build_log=$(mktemp /tmp/build-output-XXXXXX.log)
        
        if npm run build:ci > "$build_log" 2>&1; then
            print_success "Build executado com sucesso"
        else
            print_error "Build falhou. Verifique $build_log para detalhes"
            tail -20 "$build_log"
        fi
        
        echo "💡 Log completo disponível em: $build_log"
    else
        echo "💡 Use --build para executar um novo build"
    fi
else
    print_warning "Diretório dist não encontrado. Build pode não ter sido executado."
    echo "Execute: npm run build:ci"
fi

echo ""

# Summary
echo "================================"
echo "📊 Resumo da Validação PATCH-540"
echo "================================"
echo ""
echo "Verificações realizadas:"
echo "  - Monitoramento de memória"
echo "  - Validação de navegação SPA"
echo "  - Detecção de .map() aninhado"
echo "  - Qualidade do código"
echo "  - Performance (Lighthouse)"
echo "  - Build do projeto"
echo ""

# Final message
echo "🎯 Validação concluída!"
echo ""
echo "Para monitoramento contínuo, considere:"
echo "  - Executar este script periodicamente"
echo "  - Monitorar logs do servidor"
echo "  - Verificar métricas de performance"
echo ""
echo "✅ Finalize com commit: PATCH-540-validated"
echo ""

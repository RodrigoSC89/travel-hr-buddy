#!/bin/bash
# Script para arquivar documentação da raiz

echo "📚 Arquivando documentação da raiz..."

# Criar diretórios de arquivo
mkdir -p archive/legacy-docs/{ai,api,admin,audit,compliance,deployment,features,guides,patches,reports,system}

# Função para mover arquivos por padrão
move_by_pattern() {
    local pattern=$1
    local dest=$2
    for f in $pattern; do
        if [ -f "$f" ]; then
            mv "$f" "archive/legacy-docs/$dest/" 2>/dev/null && echo "  ✓ $f → $dest/"
        fi
    done
}

# AI docs
move_by_pattern "AI_*.md" "ai"

# API docs
move_by_pattern "API_*.md" "api"

# Admin docs
move_by_pattern "ADMIN_*.md" "admin"

# Audit docs
move_by_pattern "AUDIT*.md" "audit"
move_by_pattern "AUDITORIA_*.md" "audit"

# Compliance docs
move_by_pattern "COMPLIANCE_*.md" "compliance"

# Deployment docs
move_by_pattern "DEPLOY*.md" "deployment"
move_by_pattern "DEPLOYMENT_*.md" "deployment"

# Feature docs
move_by_pattern "FEATURE_*.md" "features"
move_by_pattern "COLLABORATION_*.md" "features"
move_by_pattern "DOCUMENT_*.md" "features"

# Patch docs
move_by_pattern "PATCH_*.md" "patches"

# Report docs
move_by_pattern "REPORT_*.md" "reports"
move_by_pattern "*_REPORT*.md" "reports"

# System docs
move_by_pattern "SYSTEM_*.md" "system"

echo ""
echo "✅ Documentação arquivada!"
echo ""
echo "📝 Arquivos essenciais mantidos na raiz:"
echo "   - README.md"
echo "   - CHANGELOG.md"
echo "   - CONTRIBUTING.md"
echo "   - REPOSITORY_CLEANUP.md"

#!/bin/bash

echo "🖼️  Corrigindo imagens sem alt text"
echo "===================================="
echo ""

# Encontrar todas as imagens sem alt
grep -r "<img" src/ --include="*.tsx" --include="*.jsx" -n | grep -v "alt=" | grep -v ".test." > /tmp/images_no_alt.txt

echo "📊 Encontradas $(wc -l < /tmp/images_no_alt.txt) linhas com imagens sem alt"
echo ""

# Mostrar os primeiros 10 arquivos
echo "📄 Arquivos com mais problemas:"
cat /tmp/images_no_alt.txt | cut -d: -f1 | sort | uniq -c | sort -rn | head -10

echo ""
echo "🔍 Listando todos os arquivos que precisam de correção:"
cat /tmp/images_no_alt.txt | cut -d: -f1 | sort -u


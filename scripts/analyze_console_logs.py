#!/usr/bin/env python3
"""
Script para analisar e categorizar todos os console.logs no projeto
"""
import os
import re
from collections import defaultdict
from pathlib import Path

PROJECT_ROOT = Path("/home/ubuntu/github_repos/travel-hr-buddy")
SRC_DIR = PROJECT_ROOT / "src"

# Padrões para detectar console.*
CONSOLE_PATTERN = re.compile(r'console\.(log|error|warn|info|debug|trace|table|dir|group|groupEnd)')

# Estatísticas
stats = {
    'by_type': defaultdict(int),
    'by_directory': defaultdict(int),
    'by_file': defaultdict(list),
    'total': 0
}

# Diretórios de produção prioritários
PRODUCTION_DIRS = ['pages', 'components', 'modules', 'lib', 'utils', 'hooks', 'services', 'store']

def analyze_file(file_path):
    """Analisa um arquivo e encontra todos os console.*"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        for line_num, line in enumerate(lines, 1):
            matches = CONSOLE_PATTERN.finditer(line)
            for match in matches:
                console_type = match.group(1)
                rel_path = file_path.relative_to(PROJECT_ROOT)
                
                # Verificar se está em bloco catch (contexto limitado)
                in_catch = 'catch' in lines[max(0, line_num-5):line_num]
                
                stats['by_type'][console_type] += 1
                stats['total'] += 1
                
                # Diretório principal (src/pages, src/components, etc)
                parts = rel_path.parts
                if len(parts) > 1:
                    main_dir = f"{parts[0]}/{parts[1]}"
                    stats['by_directory'][main_dir] += 1
                
                stats['by_file'][str(rel_path)].append({
                    'line': line_num,
                    'type': console_type,
                    'content': line.strip(),
                    'in_catch': in_catch
                })
    except Exception as e:
        print(f"Erro ao analisar {file_path}: {e}")

def main():
    print("🔍 Analisando console.* no projeto...\n")
    
    # Procurar todos os arquivos TypeScript/JavaScript
    for ext in ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']:
        for file_path in SRC_DIR.glob(ext):
            if 'node_modules' not in str(file_path):
                analyze_file(file_path)
    
    # Imprimir estatísticas
    print("=" * 80)
    print("📊 ESTATÍSTICAS DE CONSOLE.* NO PROJETO")
    print("=" * 80)
    print(f"\n✨ Total de ocorrências: {stats['total']}\n")
    
    print("📈 Por tipo:")
    for console_type, count in sorted(stats['by_type'].items(), key=lambda x: x[1], reverse=True):
        print(f"   console.{console_type}: {count}")
    
    print("\n📁 Por diretório (top 15):")
    sorted_dirs = sorted(stats['by_directory'].items(), key=lambda x: x[1], reverse=True)[:15]
    for directory, count in sorted_dirs:
        print(f"   {directory}: {count}")
    
    print(f"\n📄 Total de arquivos afetados: {len(stats['by_file'])}")
    
    # Arquivos com mais console.*
    print("\n🔥 Top 10 arquivos com mais console.*:")
    sorted_files = sorted(stats['by_file'].items(), key=lambda x: len(x[1]), reverse=True)[:10]
    for file_path, occurrences in sorted_files:
        print(f"   {file_path}: {len(occurrences)} ocorrências")
    
    # Salvar relatório detalhado
    report_path = PROJECT_ROOT / "console_analysis_report.txt"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("RELATÓRIO DETALHADO DE CONSOLE.* NO PROJETO\n")
        f.write("=" * 80 + "\n\n")
        f.write(f"Total: {stats['total']} ocorrências\n\n")
        
        f.write("POR TIPO:\n")
        for console_type, count in sorted(stats['by_type'].items(), key=lambda x: x[1], reverse=True):
            f.write(f"  console.{console_type}: {count}\n")
        
        f.write("\n\nPOR DIRETÓRIO:\n")
        for directory, count in sorted(stats['by_directory'].items(), key=lambda x: x[1], reverse=True):
            f.write(f"  {directory}: {count}\n")
        
        f.write("\n\nPOR ARQUIVO (todos):\n")
        for file_path, occurrences in sorted(stats['by_file'].items(), key=lambda x: len(x[1]), reverse=True):
            f.write(f"\n{file_path} ({len(occurrences)} ocorrências):\n")
            for occ in occurrences[:5]:  # Mostrar apenas as primeiras 5 de cada arquivo
                f.write(f"  Linha {occ['line']}: console.{occ['type']} - {occ['content'][:80]}\n")
            if len(occurrences) > 5:
                f.write(f"  ... e mais {len(occurrences) - 5} ocorrências\n")
    
    print(f"\n✅ Relatório detalhado salvo em: {report_path}")

if __name__ == "__main__":
    main()

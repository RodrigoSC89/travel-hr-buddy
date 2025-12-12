#!/usr/bin/env python3
"""
Script para corrigir erros ESLint automaticamente
"""

import os
import re
import subprocess
from pathlib import Path

# Diretório base do projeto
BASE_DIR = Path("/home/ubuntu/github_repos/travel-hr-buddy")

def get_files_with_console_errors():
    """Obtém lista de arquivos com erros no-console"""
    result = subprocess.run(
        ["npm", "run", "lint"],
        cwd=BASE_DIR,
        capture_output=True,
        text=True
    )
    
    files = set()
    for line in result.stdout.split('\n'):
        if 'no-console' in line and 'error' in line:
            # Extrai o caminho do arquivo da linha
            parts = line.strip().split()
            if parts:
                file_path = parts[0].split(':')[0]
                if file_path.startswith('/'):
                    files.add(file_path)
    
    return list(files)

def remove_console_logs_from_file(file_path):
    """Remove console.log mas preserva console.error e console.warn"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        new_lines = []
        modified = False
        
        for line in lines:
            # Preserva console.error e console.warn
            if re.search(r'console\.(error|warn)', line):
                new_lines.append(line)
            # Remove console.log, console.debug, console.info, etc.
            elif re.search(r'console\.(log|debug|info|table|dir|trace)', line):
                # Remove a linha se ela só contém console.log
                if line.strip().startswith('console.'):
                    modified = True
                    continue
                else:
                    # Comenta a linha se ela tem mais código
                    new_lines.append(f"// {line}")
                    modified = True
            else:
                new_lines.append(line)
        
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            return True
    except Exception as e:
        print(f"Erro ao processar {file_path}: {e}")
        return False
    
    return False

def remove_ts_nocheck(file_path):
    """Remove // @ts-nocheck dos arquivos"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove // @ts-nocheck
        new_content = re.sub(r'//\s*@ts-nocheck\s*\n?', '', content)
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
    except Exception as e:
        print(f"Erro ao processar {file_path}: {e}")
        return False
    
    return False

def fix_case_declarations(file_path):
    """Corrige declarações em case blocks adicionando braces"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        new_lines = []
        modified = False
        i = 0
        
        while i < len(lines):
            line = lines[i]
            
            # Detecta case statement
            if re.match(r'\s*case\s+', line):
                new_lines.append(line)
                i += 1
                
                # Verifica se a próxima linha tem declaração (const, let, var)
                if i < len(lines) and re.search(r'\s*(const|let|var)\s+', lines[i]):
                    # Adiciona abertura de bloco
                    new_lines.append(lines[i-1].replace('case', 'case').rstrip() + ' {\n')
                    modified = True
                    
                    # Adiciona linhas até o break
                    while i < len(lines):
                        if 'break' in lines[i]:
                            new_lines.append(lines[i])
                            new_lines.append(' ' * (len(lines[i]) - len(lines[i].lstrip())) + '}\n')
                            i += 1
                            break
                        else:
                            new_lines.append(lines[i])
                            i += 1
                    continue
            
            new_lines.append(line)
            i += 1
        
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            return True
    except Exception as e:
        print(f"Erro ao processar {file_path}: {e}")
        return False
    
    return False

def main():
    print("🔧 Iniciando correção de erros ESLint...")
    
    # 1. Remover console.log
    print("\n📝 Fase 1: Removendo console.log...")
    console_files = get_files_with_console_errors()
    console_fixed = 0
    for file_path in console_files:
        if remove_console_logs_from_file(file_path):
            console_fixed += 1
            print(f"  ✓ {file_path}")
    
    print(f"\n✅ {console_fixed} arquivos corrigidos (console.log)")
    
    # 2. Executar eslint --fix novamente
    print("\n📝 Fase 2: Executando eslint --fix...")
    subprocess.run(["npm", "run", "lint", "--", "--fix"], cwd=BASE_DIR)
    
    print("\n✅ Correções concluídas!")

if __name__ == "__main__":
    main()

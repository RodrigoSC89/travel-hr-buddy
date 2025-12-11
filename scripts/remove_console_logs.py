#!/usr/bin/env python3
"""
Script para remover console.logs do código de produção de forma inteligente
Mantém console.error em blocos catch críticos
"""
import os
import re
from pathlib import Path
from collections import defaultdict

PROJECT_ROOT = Path("/home/ubuntu/github_repos/travel-hr-buddy")
SRC_DIR = PROJECT_ROOT / "src"

# Estatísticas de remoção
removal_stats = {
    'removed': defaultdict(int),
    'kept': defaultdict(int),
    'files_modified': set(),
    'by_type': defaultdict(int)
}

def should_keep_console(line, lines, line_idx, console_type):
    """
    Determina se um console.* deve ser mantido
    - Mantém console.error em blocos catch
    - Mantém console.warn em blocos catch
    - Remove todos os console.log, console.info, console.debug, console.table, etc.
    """
    # Sempre remover estes tipos
    if console_type in ['log', 'info', 'debug', 'table', 'dir', 'trace', 'group', 'groupEnd', 'groupCollapsed']:
        return False
    
    # Para console.error e console.warn, verificar contexto
    if console_type in ['error', 'warn']:
        # Procurar por 'catch' nas linhas anteriores (contexto de ~15 linhas)
        start_idx = max(0, line_idx - 15)
        context_lines = lines[start_idx:line_idx + 1]
        
        # Verificar se está em bloco catch ou finally
        for ctx_line in context_lines:
            if re.search(r'\bcatch\s*\(', ctx_line) or re.search(r'\bfinally\s*\{', ctx_line):
                return True
        
        # Se não está em catch/finally, remover
        return False
    
    # Por padrão, remover
    return False

def remove_console_from_file(file_path):
    """Remove console.* de um arquivo de forma inteligente"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        modified = False
        new_lines = []
        i = 0
        
        while i < len(lines):
            line = lines[i]
            original_line = line
            
            # Procurar por console.*
            console_match = re.search(r'console\.(log|error|warn|info|debug|trace|table|dir|group|groupEnd|groupCollapsed)', line)
            
            if console_match:
                console_type = console_match.group(1)
                
                if should_keep_console(line, lines, i, console_type):
                    # Manter a linha
                    new_lines.append(line)
                    removal_stats['kept'][console_type] += 1
                else:
                    # Remover a linha
                    # Verificar se a linha inteira é apenas o console.*
                    stripped = line.strip()
                    
                    # Se a linha é apenas console.*, remover completamente
                    if re.match(r'^\s*console\.' + console_type, stripped):
                        # Verificar se tem ponto e vírgula no final
                        if stripped.endswith(';'):
                            # Pular esta linha completamente
                            modified = True
                            removal_stats['removed'][console_type] += 1
                            removal_stats['by_type'][console_type] += 1
                            i += 1
                            continue
                        else:
                            # Pode ser multi-linha, tentar encontrar o fechamento
                            paren_count = line.count('(') - line.count(')')
                            if paren_count > 0:
                                # Multi-linha, continuar até fechar
                                i += 1
                                while i < len(lines) and paren_count > 0:
                                    paren_count += lines[i].count('(') - lines[i].count(')')
                                    i += 1
                                modified = True
                                removal_stats['removed'][console_type] += 1
                                removal_stats['by_type'][console_type] += 1
                                continue
                            else:
                                # Linha simples sem ponto e vírgula
                                modified = True
                                removal_stats['removed'][console_type] += 1
                                removal_stats['by_type'][console_type] += 1
                                i += 1
                                continue
                    else:
                        # console.* está inline com outro código, tentar remover apenas o console.*
                        # Exemplo: const x = 5; console.log(x); return x;
                        # Remover apenas a parte do console.log
                        new_line = re.sub(
                            r'console\.' + console_type + r'\([^)]*\);?\s*',
                            '',
                            line
                        )
                        
                        # Se removeu algo e a linha não ficou vazia
                        if new_line != line and new_line.strip():
                            new_lines.append(new_line)
                            modified = True
                            removal_stats['removed'][console_type] += 1
                            removal_stats['by_type'][console_type] += 1
                        elif new_line.strip():
                            new_lines.append(new_line)
                            modified = True
                            removal_stats['removed'][console_type] += 1
                            removal_stats['by_type'][console_type] += 1
                        else:
                            # Linha ficou vazia, não adicionar
                            modified = True
                            removal_stats['removed'][console_type] += 1
                            removal_stats['by_type'][console_type] += 1
                        
                        i += 1
                        continue
            
            new_lines.append(line)
            i += 1
        
        # Se modificou, salvar arquivo
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            removal_stats['files_modified'].add(str(file_path.relative_to(PROJECT_ROOT)))
            return True
        
        return False
        
    except Exception as e:
        print(f"❌ Erro ao processar {file_path}: {e}")
        return False

def main():
    print("🚀 Removendo console.logs do código de produção...\n")
    
    # Diretórios prioritários
    priority_dirs = [
        'pages', 'components', 'modules', 'lib', 'utils', 
        'hooks', 'services', 'store', 'contexts', 'middleware'
    ]
    
    files_processed = 0
    
    for ext in ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']:
        for file_path in SRC_DIR.glob(ext):
            # Pular node_modules e arquivos de teste se necessário
            if 'node_modules' in str(file_path):
                continue
            
            # Processar apenas diretórios prioritários ou processar tudo
            rel_path = file_path.relative_to(SRC_DIR)
            if len(rel_path.parts) > 0:
                main_dir = rel_path.parts[0]
                # Processar todos os arquivos em src/
                remove_console_from_file(file_path)
                files_processed += 1
    
    # Imprimir estatísticas
    print("\n" + "=" * 80)
    print("📊 RELATÓRIO DE REMOÇÃO DE CONSOLE.*")
    print("=" * 80)
    
    total_removed = sum(removal_stats['removed'].values())
    total_kept = sum(removal_stats['kept'].values())
    
    print(f"\n✅ Total removido: {total_removed}")
    print(f"🔒 Total mantido (console.error/warn em catch): {total_kept}")
    print(f"📝 Arquivos modificados: {len(removal_stats['files_modified'])}")
    print(f"📄 Arquivos processados: {files_processed}")
    
    print("\n📈 Removidos por tipo:")
    for console_type, count in sorted(removal_stats['removed'].items(), key=lambda x: x[1], reverse=True):
        print(f"   console.{console_type}: {count}")
    
    print("\n🔒 Mantidos por tipo (em blocos catch):")
    for console_type, count in sorted(removal_stats['kept'].items(), key=lambda x: x[1], reverse=True):
        print(f"   console.{console_type}: {count}")
    
    # Salvar lista de arquivos modificados
    modified_files_path = PROJECT_ROOT / "modified_files_console_removal.txt"
    with open(modified_files_path, 'w', encoding='utf-8') as f:
        f.write("ARQUIVOS MODIFICADOS - REMOÇÃO DE CONSOLE.*\n")
        f.write("=" * 80 + "\n\n")
        for file_path in sorted(removal_stats['files_modified']):
            f.write(f"{file_path}\n")
    
    print(f"\n✅ Lista de arquivos modificados salva em: {modified_files_path}")
    
    # Salvar estatísticas detalhadas
    stats_path = PROJECT_ROOT / "console_removal_stats.txt"
    with open(stats_path, 'w', encoding='utf-8') as f:
        f.write("ESTATÍSTICAS DE REMOÇÃO DE CONSOLE.*\n")
        f.write("=" * 80 + "\n\n")
        f.write(f"Total removido: {total_removed}\n")
        f.write(f"Total mantido: {total_kept}\n")
        f.write(f"Arquivos modificados: {len(removal_stats['files_modified'])}\n")
        f.write(f"Arquivos processados: {files_processed}\n\n")
        
        f.write("REMOVIDOS POR TIPO:\n")
        for console_type, count in sorted(removal_stats['removed'].items(), key=lambda x: x[1], reverse=True):
            f.write(f"  console.{console_type}: {count}\n")
        
        f.write("\nMANTIDOS POR TIPO:\n")
        for console_type, count in sorted(removal_stats['kept'].items(), key=lambda x: x[1], reverse=True):
            f.write(f"  console.{console_type}: {count}\n")
    
    print(f"✅ Estatísticas detalhadas salvas em: {stats_path}\n")

if __name__ == "__main__":
    main()

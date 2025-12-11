#!/usr/bin/env python3
"""
Script de Migração para Componentes Unificados
FASE 2 - Consolidação de Componentes Duplicados

Este script migra automaticamente todos os imports de Skeleton e NotificationCenter
para as versões unificadas.
"""

import os
import re
import shutil
from datetime import datetime
from typing import List, Dict, Tuple

# Mapeamento de imports antigos para novos
SKELETON_MIGRATIONS = {
    # Imports antigos -> novo import unificado
    r'from ["\']@/components/dashboard/DashboardSkeleton["\']': 'from "@/components/unified/Skeletons.unified"',
    r'from ["\']@/components/RouteSkeletons["\']': 'from "@/components/unified/Skeletons.unified"',
    r'from ["\']@/components/ui/enhanced-skeletons["\']': 'from "@/components/unified/Skeletons.unified"',
    r'from ["\']@/components/ui/skeleton["\']': 'from "@/components/unified/Skeletons.unified"',
    r'from ["\']@/components/ui/skeleton-loader["\']': 'from "@/components/unified/Skeletons.unified"',
    r'from ["\']@/components/ui/skeleton-loaders["\']': 'from "@/components/unified/Skeletons.unified"',
    r'from ["\']@/components/ui/loading-skeleton["\']': 'from "@/components/unified/Skeletons.unified"',
    r'from ["\']@/components/ui/adaptive-skeleton["\']': 'from "@/components/unified/Skeletons.unified"',
    r'from ["\']@/components/ui/SkeletonPro["\']': 'from "@/components/unified/Skeletons.unified"',
    r'from ["\']@/components/ui/OptimizedSkeleton["\']': 'from "@/components/unified/Skeletons.unified"',
    r'from ["\']@/components/ux/Skeletons["\']': 'from "@/components/unified/Skeletons.unified"',
    r'from ["\']@/components/performance/SkeletonCard["\']': 'from "@/components/unified/Skeletons.unified"',
    r'from ["\']@/components/performance/SkeletonLoader["\']': 'from "@/components/unified/Skeletons.unified"',
    
    # Relative imports
    r'from ["\']\./SkeletonPro["\']': 'from "@/components/unified/Skeletons.unified"',
    r'from ["\']\./SkeletonLoader["\']': 'from "@/components/unified/Skeletons.unified"',
    r'from ["\']\.\./ui/skeleton["\']': 'from "@/components/unified/Skeletons.unified"',
}

NOTIFICATION_MIGRATIONS = {
    # Imports antigos -> novo import unificado
    r'from ["\']@/components/notifications/notification-center["\']': 'from "@/components/unified/NotificationCenter.unified"',
    r'from ["\']@/components/notifications/NotificationCenter["\']': 'from "@/components/unified/NotificationCenter.unified"',
    r'from ["\']@/components/notifications/NotificationCenterProfessional["\']': 'from "@/components/unified/NotificationCenter.unified"',
    r'from ["\']@/components/notifications/enhanced-notification-center["\']': 'from "@/components/unified/NotificationCenter.unified"',
    r'from ["\']@/components/notifications/real-time-notification-center["\']': 'from "@/components/unified/NotificationCenter.unified"',
    r'from ["\']@/components/communication/notification-center["\']': 'from "@/components/unified/NotificationCenter.unified"',
    r'from ["\']@/components/ui/NotificationCenter["\']': 'from "@/components/unified/NotificationCenter.unified"',
    r'from ["\']@/components/ui/real-time-notifications["\']': 'from "@/components/unified/NotificationCenter.unified"',
    r'from ["\']@/components/fleet/notification-center["\']': 'from "@/components/unified/NotificationCenter.unified"',
    r'from ["\']@/components/maritime/notification-center["\']': 'from "@/components/unified/NotificationCenter.unified"',
    
    # Relative imports
    r'from ["\']\./notification-center["\']': 'from "@/components/unified/NotificationCenter.unified"',
    r'from ["\']\./NotificationCenter["\']': 'from "@/components/unified/NotificationCenter.unified"',
}

def create_backup(filepath: str) -> str:
    """Cria backup do arquivo antes de modificar"""
    backup_dir = "backups_component_migration"
    os.makedirs(backup_dir, exist_ok=True)
    
    # Criar estrutura de diretórios no backup
    rel_path = os.path.relpath(filepath, "src")
    backup_path = os.path.join(backup_dir, rel_path)
    os.makedirs(os.path.dirname(backup_path), exist_ok=True)
    
    shutil.copy2(filepath, backup_path)
    return backup_path

def migrate_file(filepath: str, migrations: Dict[str, str]) -> Tuple[bool, List[str]]:
    """
    Migra um arquivo aplicando as regras de migração
    
    Returns:
        (modified, changes): Se foi modificado e lista de mudanças
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        changes = []
        
        for old_pattern, new_import in migrations.items():
            if re.search(old_pattern, content):
                # Criar backup apenas se houver mudança
                if not changes:
                    create_backup(filepath)
                
                # Aplicar substituição
                content, count = re.subn(old_pattern, new_import, content)
                
                if count > 0:
                    old_import = re.search(old_pattern, original_content)
                    if old_import:
                        changes.append(f"{old_import.group()} → {new_import}")
        
        # Escrever arquivo modificado
        if changes:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, changes
        
        return False, []
    
    except Exception as e:
        print(f"  ❌ Erro ao processar {filepath}: {e}")
        return False, []

def find_files_to_migrate(root_dir: str = "src") -> List[str]:
    """Encontra todos os arquivos .tsx e .ts que podem precisar migração"""
    files = []
    for dirpath, _, filenames in os.walk(root_dir):
        # Ignorar node_modules, dist, build, etc
        if 'node_modules' in dirpath or 'dist' in dirpath or 'build' in dirpath:
            continue
        
        for filename in filenames:
            if filename.endswith(('.tsx', '.ts')) and not filename.endswith('.d.ts'):
                files.append(os.path.join(dirpath, filename))
    
    return files

def main():
    print("=" * 80)
    print("🔄 MIGRAÇÃO AUTOMÁTICA PARA COMPONENTES UNIFICADOS")
    print("=" * 80)
    print()
    
    # Estatísticas
    stats = {
        'skeleton_files': 0,
        'notification_files': 0,
        'skeleton_changes': 0,
        'notification_changes': 0,
        'total_files_modified': 0,
    }
    
    modified_files = []
    
    # Encontrar arquivos
    print("📁 Buscando arquivos para migração...")
    files = find_files_to_migrate()
    print(f"   Encontrados {len(files)} arquivos para analisar")
    print()
    
    # Migrar Skeletons
    print("🔧 Migrando imports de Skeleton...")
    for filepath in files:
        modified, changes = migrate_file(filepath, SKELETON_MIGRATIONS)
        if modified:
            stats['skeleton_files'] += 1
            stats['skeleton_changes'] += len(changes)
            stats['total_files_modified'] += 1
            modified_files.append((filepath, 'Skeleton', changes))
            print(f"  ✅ {filepath}")
            for change in changes:
                print(f"     - {change}")
    
    print(f"\n  Migrados {stats['skeleton_files']} arquivos Skeleton")
    print()
    
    # Migrar NotificationCenter
    print("🔧 Migrando imports de NotificationCenter...")
    for filepath in files:
        modified, changes = migrate_file(filepath, NOTIFICATION_MIGRATIONS)
        if modified:
            stats['notification_files'] += 1
            stats['notification_changes'] += len(changes)
            if filepath not in [f[0] for f in modified_files]:
                stats['total_files_modified'] += 1
            modified_files.append((filepath, 'NotificationCenter', changes))
            print(f"  ✅ {filepath}")
            for change in changes:
                print(f"     - {change}")
    
    print(f"\n  Migrados {stats['notification_files']} arquivos NotificationCenter")
    print()
    
    # Relatório Final
    print("=" * 80)
    print("📊 RELATÓRIO DE MIGRAÇÃO")
    print("=" * 80)
    print(f"Arquivos Skeleton migrados: {stats['skeleton_files']}")
    print(f"Arquivos NotificationCenter migrados: {stats['notification_files']}")
    print(f"Total de arquivos modificados: {stats['total_files_modified']}")
    print(f"Total de mudanças: {stats['skeleton_changes'] + stats['notification_changes']}")
    print()
    
    # Salvar relatório
    report_file = f"migration_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write("RELATÓRIO DE MIGRAÇÃO - COMPONENTES UNIFICADOS\n")
        f.write(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("=" * 80 + "\n\n")
        
        f.write(f"Arquivos Skeleton migrados: {stats['skeleton_files']}\n")
        f.write(f"Arquivos NotificationCenter migrados: {stats['notification_files']}\n")
        f.write(f"Total de arquivos modificados: {stats['total_files_modified']}\n")
        f.write(f"Total de mudanças: {stats['skeleton_changes'] + stats['notification_changes']}\n\n")
        
        f.write("ARQUIVOS MODIFICADOS:\n")
        f.write("=" * 80 + "\n\n")
        
        for filepath, component_type, changes in modified_files:
            f.write(f"\n{filepath} ({component_type}):\n")
            for change in changes:
                f.write(f"  - {change}\n")
    
    print(f"📄 Relatório salvo em: {report_file}")
    print(f"💾 Backups salvos em: backups_component_migration/")
    print()
    print("✅ Migração concluída com sucesso!")
    print()
    print("⚠️  PRÓXIMOS PASSOS:")
    print("   1. Execute TypeScript compiler para verificar erros")
    print("   2. Execute testes se disponíveis")
    print("   3. Revise as mudanças antes de commitar")
    print()

if __name__ == "__main__":
    main()

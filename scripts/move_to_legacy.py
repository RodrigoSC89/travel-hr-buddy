#!/usr/bin/env python3
"""
Move componentes duplicados antigos para pasta legacy
"""

import os
import shutil

# Componentes Skeleton para mover
SKELETON_FILES = [
    "src/components/dashboard/DashboardSkeleton.tsx",
    "src/components/ui/enhanced-skeletons.tsx",
    "src/components/ui/skeleton.tsx",
    "src/components/ui/skeleton-loader.tsx",
    "src/components/ui/skeleton-loaders.tsx",
    "src/components/ui/loading-skeleton.tsx",
    "src/components/ui/adaptive-skeleton.tsx",
    "src/components/ui/SkeletonPro.tsx",
    "src/components/ui/OptimizedSkeleton.tsx",
    "src/components/ux/Skeletons.tsx",
    "src/components/performance/SkeletonCard.tsx",
    "src/components/performance/SkeletonLoader.tsx",
]

# Componentes NotificationCenter para mover
NOTIFICATION_FILES = [
    "src/components/notifications/notification-center.tsx",
    "src/components/notifications/NotificationCenter.tsx",
    "src/components/notifications/NotificationCenterProfessional.tsx",
    "src/components/notifications/enhanced-notification-center.tsx",
    "src/components/notifications/real-time-notification-center.tsx",
    "src/components/communication/notification-center.tsx",
    "src/components/ui/NotificationCenter.tsx",
    "src/components/ui/real-time-notifications.tsx",
    "src/components/fleet/notification-center.tsx",
    "src/components/maritime/notification-center.tsx",
]

def move_to_legacy(files, component_type):
    """Move arquivos para pasta legacy"""
    legacy_dir = "src/components/legacy"
    os.makedirs(legacy_dir, exist_ok=True)
    
    moved = []
    for filepath in files:
        if os.path.exists(filepath):
            # Criar subdiretórios se necessário
            basename = os.path.basename(filepath)
            legacy_path = os.path.join(legacy_dir, f"{component_type}_{basename}")
            
            # Mover arquivo
            shutil.move(filepath, legacy_path)
            
            # Criar arquivo README no lugar
            with open(filepath, 'w') as f:
                f.write(f"""/**
 * @deprecated Este componente foi movido para /src/components/legacy/
 * Use @/components/unified/{"Skeletons" if component_type == "skeleton" else "NotificationCenter"}.unified ao invés
 * 
 * Arquivo antigo: {legacy_path}
 */

export {{ /* Deprecated - use unified version */ }} from "@/components/unified/{"Skeletons" if component_type == "skeleton" else "NotificationCenter"}.unified";
""")
            
            moved.append((filepath, legacy_path))
            print(f"  ✅ {filepath} → {legacy_path}")
    
    return moved

print("=" * 80)
print("📦 MOVENDO COMPONENTES PARA LEGACY")
print("=" * 80)
print()

print("🔧 Movendo Skeletons...")
skeleton_moved = move_to_legacy(SKELETON_FILES, "skeleton")
print(f"  Movidos {len(skeleton_moved)} arquivos Skeleton")
print()

print("🔧 Movendo NotificationCenters...")
notification_moved = move_to_legacy(NOTIFICATION_FILES, "notification")
print(f"  Movidos {len(notification_moved)} arquivos NotificationCenter")
print()

print("=" * 80)
print("📊 RESUMO")
print("=" * 80)
print(f"Total de arquivos movidos: {len(skeleton_moved) + len(notification_moved)}")
print(f"Pasta legacy criada em: src/components/legacy/")
print()
print("✅ Componentes antigos movidos com sucesso!")

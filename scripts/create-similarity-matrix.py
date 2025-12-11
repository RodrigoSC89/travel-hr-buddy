#!/usr/bin/env python3
"""
FASE B - Criação de Matriz de Similaridade
Script para gerar matriz de similaridade entre módulos redundantes
"""

import json
import os
from collections import defaultdict
from typing import Dict, List, Set

def load_json_report(filename: str) -> dict:
    """Carrega relatório JSON"""
    with open(filename, 'r') as f:
        return json.load(f)

def calculate_similarity(module1: dict, module2: dict) -> float:
    """Calcula similaridade entre dois módulos (0-100%)"""
    similarity_score = 0.0
    factors = 0
    
    # Fator 1: Similaridade de tamanho (linhas de código)
    if 'lines' in module1 and 'lines' in module2:
        lines1 = module1['lines']
        lines2 = module2['lines']
        if lines1 > 0 and lines2 > 0:
            size_ratio = min(lines1, lines2) / max(lines1, lines2)
            similarity_score += size_ratio * 100
            factors += 1
    
    # Fator 2: Similaridade de caminho (mesmo diretório)
    if 'path' in module1 and 'path' in module2:
        path1_parts = module1['path'].split('/')
        path2_parts = module2['path'].split('/')
        
        # Contar quantos níveis de diretório são iguais
        common_levels = 0
        for p1, p2 in zip(path1_parts[:-1], path2_parts[:-1]):
            if p1 == p2:
                common_levels += 1
            else:
                break
        
        path_similarity = (common_levels / max(len(path1_parts) - 1, len(path2_parts) - 1)) * 100
        similarity_score += path_similarity
        factors += 1
    
    # Retornar média de todos os fatores
    return similarity_score / factors if factors > 0 else 0.0

def extract_name_base(filename: str) -> str:
    """Extrai o nome base removendo sufixos de versão"""
    basename = os.path.basename(filename)
    # Remover extensão
    name = os.path.splitext(basename)[0]
    # Remover sufixos comuns
    for suffix in ['-v2', '-v3', '-new', '-old', '-legacy', '-updated', '-improved', '-enhanced', 
                   '-professional', '-advanced', '-complete', '-integrated', '-unified']:
        if name.lower().endswith(suffix):
            name = name[:-len(suffix)]
    return name.lower()

def find_similar_groups(modules: List[dict], threshold: float = 60.0) -> Dict[str, List[dict]]:
    """Agrupa módulos similares"""
    groups = defaultdict(list)
    processed = set()
    
    for i, mod1 in enumerate(modules):
        if i in processed:
            continue
        
        # Usar nome base como chave do grupo
        base_name = extract_name_base(mod1.get('path', ''))
        group_key = f"group_{base_name}"
        groups[group_key].append(mod1)
        processed.add(i)
        
        # Encontrar módulos similares
        for j, mod2 in enumerate(modules):
            if j <= i or j in processed:
                continue
            
            similarity = calculate_similarity(mod1, mod2)
            if similarity >= threshold:
                groups[group_key].append(mod2)
                processed.add(j)
    
    # Remover grupos com apenas um elemento
    return {k: v for k, v in groups.items() if len(v) > 1}

def generate_similarity_matrix():
    """Gera matriz de similaridade completa"""
    print("=" * 70)
    print("   NAUTILUS ONE - MATRIZ DE SIMILARIDADE")
    print("   FASE B - Varredura Técnica Final")
    print("=" * 70)
    print()
    
    # Carregar relatórios JSON
    print("[1/4] Carregando relatórios...")
    
    dashboards_data = load_json_report('dashboard_analysis_report.json')
    command_centers_data = load_json_report('command_center_analysis_report.json')
    components_data = load_json_report('similar_components_report.json')
    services_data = load_json_report('services_utilities_report.json')
    
    print("   ✓ Relatórios carregados")
    
    # Analisar dashboards
    print("\n[2/4] Analisando similaridade entre dashboards...")
    dashboard_files = dashboards_data.get('files', [])
    dashboard_groups = find_similar_groups(dashboard_files, threshold=50.0)
    print(f"   ✓ {len(dashboard_groups)} grupos de dashboards similares encontrados")
    
    # Analisar command centers
    print("\n[3/4] Analisando similaridade entre command centers...")
    command_center_files = command_centers_data.get('files', [])
    command_center_groups = find_similar_groups(command_center_files, threshold=50.0)
    print(f"   ✓ {len(command_center_groups)} grupos de command centers similares encontrados")
    
    # Gerar relatório
    print("\n[4/4] Gerando relatório de matriz de similaridade...")
    
    report = {
        "analysis_date": dashboards_data.get('analysis_date', ''),
        "repository": "/home/ubuntu/github_repos/travel-hr-buddy",
        "summary": {
            "dashboard_groups": len(dashboard_groups),
            "command_center_groups": len(command_center_groups),
            "total_dashboards": len(dashboard_files),
            "total_command_centers": len(command_center_files),
            "total_components": components_data['summary']['total_components'],
            "total_services": services_data['summary']['total_services'],
            "total_utilities": services_data['summary']['total_utilities']
        },
        "dashboard_similarity_groups": {},
        "command_center_similarity_groups": {},
        "consolidation_priorities": []
    }
    
    # Adicionar grupos de dashboards
    for group_name, modules in dashboard_groups.items():
        report['dashboard_similarity_groups'][group_name] = {
            "count": len(modules),
            "total_lines": sum(m.get('lines', 0) for m in modules),
            "modules": [m['path'] for m in modules]
        }
    
    # Adicionar grupos de command centers
    for group_name, modules in command_center_groups.items():
        report['command_center_similarity_groups'][group_name] = {
            "count": len(modules),
            "total_lines": sum(m.get('lines', 0) for m in modules),
            "modules": [m['path'] for m in modules]
        }
    
    # Definir prioridades de consolidação
    all_groups = []
    
    # Dashboard groups
    for group_name, group_data in report['dashboard_similarity_groups'].items():
        if group_data['count'] >= 2:
            all_groups.append({
                "type": "dashboard",
                "name": group_name,
                "count": group_data['count'],
                "total_lines": group_data['total_lines'],
                "impact_score": group_data['count'] * group_data['total_lines']
            })
    
    # Command center groups
    for group_name, group_data in report['command_center_similarity_groups'].items():
        if group_data['count'] >= 2:
            all_groups.append({
                "type": "command_center",
                "name": group_name,
                "count": group_data['count'],
                "total_lines": group_data['total_lines'],
                "impact_score": group_data['count'] * group_data['total_lines']
            })
    
    # Ordenar por impacto
    all_groups.sort(key=lambda x: x['impact_score'], reverse=True)
    
    # Adicionar top 20 prioridades
    report['consolidation_priorities'] = all_groups[:20]
    
    # Salvar relatório JSON
    with open('similarity_matrix_report.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    # Gerar relatório texto
    with open('similarity_matrix_report.txt', 'w') as f:
        f.write("# MATRIZ DE SIMILARIDADE - NAUTILUS ONE\n")
        f.write(f"# Data: {report['analysis_date']}\n")
        f.write(f"# Repositório: {report['repository']}\n\n")
        
        f.write("=" * 70 + "\n")
        f.write("SUMÁRIO EXECUTIVO\n")
        f.write("=" * 70 + "\n\n")
        
        summary = report['summary']
        f.write(f"Total de arquivos analisados:\n")
        f.write(f"  - Dashboards:      {summary['total_dashboards']} arquivos\n")
        f.write(f"  - Command Centers: {summary['total_command_centers']} arquivos\n")
        f.write(f"  - Componentes:     {summary['total_components']} arquivos\n")
        f.write(f"  - Services:        {summary['total_services']} arquivos\n")
        f.write(f"  - Utilities:       {summary['total_utilities']} arquivos\n\n")
        
        f.write(f"Grupos de similaridade identificados:\n")
        f.write(f"  - Dashboard Groups:      {summary['dashboard_groups']} grupos\n")
        f.write(f"  - Command Center Groups: {summary['command_center_groups']} grupos\n\n")
        
        f.write("=" * 70 + "\n")
        f.write("TOP 20 PRIORIDADES DE CONSOLIDAÇÃO\n")
        f.write("=" * 70 + "\n\n")
        
        f.write(f"{'#':<4} {'Tipo':<15} {'Nome':<30} {'Módulos':<10} {'Linhas':<10} {'Impacto':<12}\n")
        f.write("-" * 91 + "\n")
        
        for i, priority in enumerate(report['consolidation_priorities'], 1):
            f.write(f"{i:<4} {priority['type']:<15} {priority['name']:<30} "
                   f"{priority['count']:<10} {priority['total_lines']:<10} {priority['impact_score']:<12}\n")
        
        f.write("\n\n")
        f.write("=" * 70 + "\n")
        f.write("DASHBOARD SIMILARITY GROUPS (DETALHADO)\n")
        f.write("=" * 70 + "\n\n")
        
        for group_name, group_data in sorted(report['dashboard_similarity_groups'].items(), 
                                            key=lambda x: x[1]['count'], reverse=True):
            f.write(f"\n{group_name}:\n")
            f.write(f"  Módulos: {group_data['count']}\n")
            f.write(f"  Total de linhas: {group_data['total_lines']}\n")
            f.write(f"  Arquivos:\n")
            for module_path in group_data['modules']:
                f.write(f"    - {module_path}\n")
        
        f.write("\n\n")
        f.write("=" * 70 + "\n")
        f.write("COMMAND CENTER SIMILARITY GROUPS (DETALHADO)\n")
        f.write("=" * 70 + "\n\n")
        
        for group_name, group_data in sorted(report['command_center_similarity_groups'].items(), 
                                            key=lambda x: x[1]['count'], reverse=True):
            f.write(f"\n{group_name}:\n")
            f.write(f"  Módulos: {group_data['count']}\n")
            f.write(f"  Total de linhas: {group_data['total_lines']}\n")
            f.write(f"  Arquivos:\n")
            for module_path in group_data['modules']:
                f.write(f"    - {module_path}\n")
    
    print("   ✓ Relatório gerado")
    
    print("\n" + "=" * 70)
    print("   ANÁLISE CONCLUÍDA!")
    print("=" * 70)
    print("\nRelatórios gerados:")
    print("  - similarity_matrix_report.txt")
    print("  - similarity_matrix_report.json")
    print(f"\nGrupos identificados:")
    print(f"  - Dashboards:      {len(dashboard_groups)} grupos")
    print(f"  - Command Centers: {len(command_center_groups)} grupos")
    print()

if __name__ == "__main__":
    generate_similarity_matrix()

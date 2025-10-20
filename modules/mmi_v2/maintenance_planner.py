"""
Maintenance Planner - MMI v2
Intelligent preventive plans with auto-generated tasks
"""
import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from core.logger import log_event


class MaintenancePlanner:
    """
    Manages preventive maintenance plans
    - Auto-generation based on history and usage
    - Intelligent scheduling
    - Task tracking
    """
    
    def __init__(self, asset_tree, file_path: str = "mmi_preventive_plans.json"):
        self.asset_tree = asset_tree
        self.file = file_path
        self.plans: List[Dict[str, Any]] = []
        self._load_plans()
    
    def _load_plans(self) -> None:
        """Load maintenance plans from JSON file"""
        try:
            if os.path.exists(self.file):
                with open(self.file, "r", encoding="utf-8") as f:
                    self.plans = json.load(f)
                log_event(f"Planos preventivos carregados: {len(self.plans)} planos")
            else:
                self.plans = []
                log_event("Nova base de planos preventivos criada.")
        except Exception as e:
            log_event(f"Erro ao carregar planos: {str(e)}", "ERROR")
            self.plans = []
    
    def salvar(self) -> None:
        """Save maintenance plans to JSON file"""
        try:
            with open(self.file, "w", encoding="utf-8") as f:
                json.dump(self.plans, f, indent=4, ensure_ascii=False)
            log_event(f"Planos salvos: {len(self.plans)} registros")
        except Exception as e:
            log_event(f"Erro ao salvar planos: {str(e)}", "ERROR")
    
    def criar_plano(self, ativo_id: int, descricao: str, 
                   intervalo_dias: int) -> None:
        """
        Create a new preventive maintenance plan
        
        Args:
            ativo_id: Asset ID
            descricao: Plan description
            intervalo_dias: Maintenance interval in days
        """
        proxima = (datetime.now() + timedelta(days=intervalo_dias)).isoformat()
        plano = {
            "id": len(self.plans) + 1,
            "ativo_id": ativo_id,
            "descricao": descricao,
            "intervalo": intervalo_dias,
            "proxima_execucao": proxima,
            "criado_em": datetime.now().isoformat()
        }
        self.plans.append(plano)
        self.salvar()
        log_event(f"Plano preventivo criado: {descricao}")
        print(f"✅ Plano criado: {descricao}")
    
    def listar_planos(self) -> None:
        """List all maintenance plans"""
        if not self.plans:
            print("📭 Nenhum plano cadastrado.")
            return
        
        print("\n📋 Planos Preventivos:")
        for p in self.plans:
            ativo = self.asset_tree.buscar_ativo(p['ativo_id'])
            ativo_nome = ativo['nome'] if ativo else f"Ativo {p['ativo_id']}"
            print(f"  • ID {p['id']} | {ativo_nome} – {p['descricao']}")
            print(f"    Próxima execução: {p['proxima_execucao'][:10]} (a cada {p['intervalo']} dias)")
    
    def listar_vencidos(self) -> List[Dict[str, Any]]:
        """
        List maintenance plans that are overdue
        
        Returns:
            List of overdue plans
        """
        hoje = datetime.now()
        vencidos = []
        
        for p in self.plans:
            proxima = datetime.fromisoformat(p['proxima_execucao'])
            if proxima < hoje:
                vencidos.append(p)
        
        return vencidos
    
    def executar_plano(self, plano_id: int) -> None:
        """
        Mark a plan as executed and schedule next occurrence
        
        Args:
            plano_id: Plan ID
        """
        for p in self.plans:
            if p['id'] == plano_id:
                # Update next execution date
                p['ultima_execucao'] = datetime.now().isoformat()
                proxima = datetime.now() + timedelta(days=p['intervalo'])
                p['proxima_execucao'] = proxima.isoformat()
                self.salvar()
                log_event(f"Plano executado: {p['descricao']}")
                print(f"✅ Plano executado. Próxima execução: {proxima.strftime('%d/%m/%Y')}")
                return
        
        print(f"❌ Plano {plano_id} não encontrado.")
    
    def menu(self) -> None:
        """Interactive menu for maintenance planning"""
        while True:
            print("\n🧭 Planos Preventivos – MMI v2")
            print("1. ➕ Criar plano")
            print("2. 📋 Listar planos")
            print("3. ⚠️  Ver planos vencidos")
            print("4. ✅ Executar plano")
            print("0. ⏹ Voltar")
            
            try:
                op = input("\nEscolha: ").strip()
                if op == "1":
                    try:
                        ativo = int(input("ID do ativo: ").strip())
                        desc = input("Descrição do plano: ").strip()
                        if not desc:
                            print("❌ Descrição não pode ser vazia.")
                            continue
                        dias = int(input("Intervalo (dias): ").strip())
                        if dias <= 0:
                            print("❌ Intervalo deve ser maior que zero.")
                            continue
                        self.criar_plano(ativo, desc, dias)
                    except ValueError:
                        print("❌ Entrada inválida. Use números para ID e intervalo.")
                elif op == "2":
                    self.listar_planos()
                elif op == "3":
                    vencidos = self.listar_vencidos()
                    if not vencidos:
                        print("✅ Nenhum plano vencido!")
                    else:
                        print(f"\n⚠️  {len(vencidos)} plano(s) vencido(s):")
                        for p in vencidos:
                            ativo = self.asset_tree.buscar_ativo(p['ativo_id'])
                            ativo_nome = ativo['nome'] if ativo else f"Ativo {p['ativo_id']}"
                            print(f"  • ID {p['id']} | {ativo_nome} – {p['descricao']}")
                            print(f"    Vencido em: {p['proxima_execucao'][:10]}")
                elif op == "4":
                    try:
                        plano_id = int(input("ID do plano a executar: ").strip())
                        self.executar_plano(plano_id)
                    except ValueError:
                        print("❌ ID inválido.")
                elif op == "0":
                    break
                else:
                    print("❌ Opção inválida.")
            except KeyboardInterrupt:
                print("\n⏹ Operação cancelada.")
                break

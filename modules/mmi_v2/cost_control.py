"""
Cost Control - MMI v2
Control of costs, parts, and labor hours
"""
import json
import os
from typing import List, Dict, Any
from core.logger import log_event


class CostControl:
    """
    Manages maintenance costs and resources
    - Parts tracking
    - Labor hours
    - Cost analysis
    """
    
    def __init__(self, file_path: str = "mmi_costs.json"):
        self.file = file_path
        self.costs: List[Dict[str, Any]] = []
        self._load_costs()
    
    def _load_costs(self) -> None:
        """Load costs from JSON file"""
        try:
            if os.path.exists(self.file):
                with open(self.file, "r", encoding="utf-8") as f:
                    self.costs = json.load(f)
                log_event(f"Custos carregados: {len(self.costs)} registros")
            else:
                self.costs = []
                log_event("Nova base de custos criada.")
        except Exception as e:
            log_event(f"Erro ao carregar custos: {str(e)}", "ERROR")
            self.costs = []
    
    def registrar_custo(self, os_id: int, tipo: str, valor: float, 
                       descricao: str = "") -> None:
        """
        Register a new cost entry
        
        Args:
            os_id: Work order ID
            tipo: Cost type (material/mão de obra/outros)
            valor: Cost value
            descricao: Cost description
        """
        custo = {
            "id": len(self.costs) + 1,
            "os_id": os_id,
            "tipo": tipo,
            "valor": valor,
            "descricao": descricao,
            "data": None
        }
        
        from datetime import datetime
        custo["data"] = datetime.now().isoformat()
        
        self.costs.append(custo)
        
        try:
            with open(self.file, "w", encoding="utf-8") as f:
                json.dump(self.costs, f, indent=4, ensure_ascii=False)
            log_event(f"Custo registrado: {tipo} – R${valor:.2f}")
            print(f"💰 Custo registrado: {tipo} – R${valor:.2f}")
        except Exception as e:
            log_event(f"Erro ao salvar custo: {str(e)}", "ERROR")
    
    def resumo(self) -> None:
        """Display cost summary"""
        if not self.costs:
            print("📭 Nenhum custo registrado.")
            return
        
        total = sum(c["valor"] for c in self.costs)
        print(f"\n📊 Total acumulado: R${total:.2f}")
        print(f"📈 Total de registros: {len(self.costs)}\n")
        
        # Group by type
        por_tipo: Dict[str, float] = {}
        for c in self.costs:
            tipo = c["tipo"]
            por_tipo[tipo] = por_tipo.get(tipo, 0) + c["valor"]
        
        print("📋 Por tipo:")
        for tipo, valor in por_tipo.items():
            print(f"  • {tipo}: R${valor:.2f}")
        
        print("\n💳 Últimos registros:")
        for c in self.costs[-5:]:
            print(f"  • OS {c['os_id']} – {c['tipo']}: R${c['valor']:.2f}")
            if c.get('descricao'):
                print(f"    {c['descricao']}")
    
    def custos_por_os(self, os_id: int) -> None:
        """
        Display costs for a specific work order
        
        Args:
            os_id: Work order ID
        """
        custos_os = [c for c in self.costs if c["os_id"] == os_id]
        
        if not custos_os:
            print(f"📭 Nenhum custo registrado para OS {os_id}.")
            return
        
        total = sum(c["valor"] for c in custos_os)
        print(f"\n💰 Custos da OS {os_id}:")
        print(f"📊 Total: R${total:.2f}\n")
        
        for c in custos_os:
            print(f"  • {c['tipo']}: R${c['valor']:.2f}")
            if c.get('descricao'):
                print(f"    {c['descricao']}")
    
    def menu(self) -> None:
        """Interactive menu for cost control"""
        while True:
            print("\n💰 Controle de Custos – MMI v2")
            print("1. ➕ Registrar custo")
            print("2. 📊 Exibir resumo")
            print("3. 🔍 Custos por OS")
            print("0. ⏹ Voltar")
            
            try:
                op = input("\nEscolha: ").strip()
                if op == "1":
                    try:
                        os_id = int(input("ID da OS: ").strip())
                        print("\nTipos disponíveis:")
                        print("  1. Material")
                        print("  2. Mão de obra")
                        print("  3. Outros")
                        tipo_op = input("Escolha o tipo (1-3): ").strip()
                        
                        tipo_map = {
                            "1": "material",
                            "2": "mão de obra",
                            "3": "outros"
                        }
                        tipo = tipo_map.get(tipo_op, "outros")
                        
                        valor = float(input("Valor (R$): ").strip())
                        if valor < 0:
                            print("❌ Valor não pode ser negativo.")
                            continue
                        
                        descricao = input("Descrição (opcional): ").strip()
                        self.registrar_custo(os_id, tipo, valor, descricao)
                    except ValueError:
                        print("❌ Entrada inválida. Use números para OS ID e valor.")
                elif op == "2":
                    self.resumo()
                elif op == "3":
                    try:
                        os_id = int(input("ID da OS: ").strip())
                        self.custos_por_os(os_id)
                    except ValueError:
                        print("❌ ID inválido.")
                elif op == "0":
                    break
                else:
                    print("❌ Opção inválida.")
            except KeyboardInterrupt:
                print("\n⏹ Operação cancelada.")
                break

"""
Asset Tree Management - MMI v2
Hierarchical structure for equipment and systems
"""
import json
import os
from typing import Optional, List, Dict, Any
from core.logger import log_event


class AssetTree:
    """
    Manages hierarchical asset structure
    - Motor systems
    - Propulsion systems
    - DP (Dynamic Positioning)
    - Electrical systems
    - Hydraulic systems
    """
    
    def __init__(self, file_path: str = "mmi_assets.json"):
        self.file = file_path
        self.assets: List[Dict[str, Any]] = []
        self._load_assets()
    
    def _load_assets(self) -> None:
        """Load assets from JSON file"""
        try:
            if os.path.exists(self.file):
                with open(self.file, "r", encoding="utf-8") as f:
                    self.assets = json.load(f)
                log_event(f"Árvore de ativos carregada: {len(self.assets)} ativos")
            else:
                self.assets = []
                log_event("Nova árvore de ativos criada.")
        except Exception as e:
            log_event(f"Erro ao carregar ativos: {str(e)}", "ERROR")
            self.assets = []
    
    def salvar(self) -> None:
        """Save assets to JSON file"""
        try:
            with open(self.file, "w", encoding="utf-8") as f:
                json.dump(self.assets, f, indent=4, ensure_ascii=False)
            log_event(f"Ativos salvos: {len(self.assets)} registros")
        except Exception as e:
            log_event(f"Erro ao salvar ativos: {str(e)}", "ERROR")
    
    def adicionar_ativo(self, nome: str, pai: Optional[int] = None, 
                       tipo: str = "Equipamento") -> None:
        """
        Add a new asset to the tree
        
        Args:
            nome: Asset name
            pai: Parent asset ID (None for root)
            tipo: Asset type (Equipamento/Sistema/Subsistema)
        """
        ativo = {
            "id": len(self.assets) + 1,
            "nome": nome,
            "pai": pai,
            "tipo": tipo
        }
        self.assets.append(ativo)
        self.salvar()
        log_event(f"Ativo adicionado: {nome}")
        print(f"✅ Ativo '{nome}' adicionado sob '{pai or 'raiz'}'.")
    
    def listar(self, pai: Optional[int] = None, nivel: int = 0) -> None:
        """
        List assets in hierarchical format
        
        Args:
            pai: Parent ID to filter by
            nivel: Indentation level
        """
        for ativo in [a for a in self.assets if a["pai"] == pai]:
            print("   " * nivel + f"• {ativo['nome']} ({ativo['tipo']})")
            self.listar(ativo["id"], nivel + 1)
    
    def buscar_ativo(self, ativo_id: int) -> Optional[Dict[str, Any]]:
        """
        Find asset by ID
        
        Args:
            ativo_id: Asset ID
            
        Returns:
            Asset dict or None if not found
        """
        for ativo in self.assets:
            if ativo["id"] == ativo_id:
                return ativo
        return None
    
    def menu(self) -> None:
        """Interactive menu for asset management"""
        while True:
            print("\n🌳 Árvore de Ativos – MMI v2")
            print("1. ➕ Adicionar ativo")
            print("2. 📜 Listar ativos")
            print("0. ⏹ Voltar")
            
            try:
                op = input("\nEscolha: ").strip()
                if op == "1":
                    nome = input("Nome do ativo: ").strip()
                    if not nome:
                        print("❌ Nome não pode ser vazio.")
                        continue
                    pai_input = input("ID do ativo pai (ou Enter para raiz): ").strip()
                    pai = int(pai_input) if pai_input else None
                    tipo = input("Tipo (Equipamento/Sistema/Subsistema): ").strip() or "Equipamento"
                    self.adicionar_ativo(nome, pai, tipo)
                elif op == "2":
                    if not self.assets:
                        print("📭 Nenhum ativo cadastrado.")
                    else:
                        print("\n📋 Estrutura de Ativos:")
                        self.listar()
                elif op == "0":
                    break
                else:
                    print("❌ Opção inválida.")
            except ValueError as e:
                print(f"❌ Entrada inválida: {str(e)}")
            except KeyboardInterrupt:
                print("\n⏹ Operação cancelada.")
                break

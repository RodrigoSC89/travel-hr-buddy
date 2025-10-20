"""
gi_dashboard.py - Global Dashboard

Painel consolidado de risco e performance global.
"""

from typing import List, Dict, Any


class GlobalDashboard:
    """
    Dashboard corporativo unificado.
    Exibe status de risco e conformidade da frota.
    """

    def mostrar(self, previsoes: List[Dict[str, Any]]) -> None:
        """
        Exibe painel global de risco e conformidade.

        Args:
            previsoes: Lista de previsões com embarcação e risco
        """
        print("\n📈 Painel Global de Risco e Conformidade:")
        print("=" * 60)

        if not previsoes:
            print("⚠️ Nenhuma previsão disponível.")
            print("=" * 60)
            return

        for navio in previsoes:
            risco = navio.get("risco", 0)
            embarcacao = navio.get("embarcacao", "N/A")

            # Define status baseado no nível de risco
            if risco > 70:
                status = "⚠️ ALTO"
            elif risco > 40:
                status = "🟡 MODERADO"
            else:
                status = "✅ BAIXO"

            print(f" - {embarcacao}: risco {risco}% {status}")

        print("=" * 60)

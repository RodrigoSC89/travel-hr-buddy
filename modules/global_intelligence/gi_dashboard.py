"""
Global Dashboard Module

Displays unified fleet view with risk levels and compliance status.
Provides corporate-level visualization of all vessels.
"""


class GlobalDashboard:
    """Corporate dashboard for fleet-wide risk and compliance monitoring"""

    def mostrar(self, previsoes):
        """
        Display global risk and compliance dashboard.

        Args:
            previsoes (list): Risk predictions for all vessels
        """
        if not previsoes:
            print("⚠️ Nenhuma previsão disponível para exibir.")
            return

        print("\n📈 Painel Global de Risco e Conformidade:")
        print("=" * 60)

        for navio in previsoes:
            embarcacao = navio.get("embarcacao", "Desconhecida")
            risco = navio.get("risco", 0)
            
            # Classify risk level
            status = self._classificar_risco(risco)
            
            print(f" - {embarcacao}: risco {risco}% {status}")

        print("=" * 60)

    def _classificar_risco(self, risco):
        """
        Classify risk level based on percentage.

        Args:
            risco (float): Risk percentage (0-100)

        Returns:
            str: Risk classification with emoji
        """
        if risco >= 81:
            return "🚨 CRÍTICO"
        elif risco >= 71:
            return "🔴 ALTO"
        elif risco >= 41:
            return "🟡 MODERADO"
        else:
            return "🟢 BAIXO"

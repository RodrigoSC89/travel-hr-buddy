"""
Nautilus One - Decision Core
Sistema de comando e controle inteligente para operações marítimas, offshore e industriais.

Ponto de entrada principal do sistema.
"""
from modules.decision_core import DecisionCore


def main():
    """Função principal de entrada do sistema."""
    try:
        print("\n🚀 Iniciando Nautilus One Decision Core...")
        nautilus = DecisionCore()
        nautilus.processar_decisao()
        print("\n" + "=" * 60)
        print("✅ Operação concluída com sucesso!")
        print("=" * 60 + "\n")
    except KeyboardInterrupt:
        print("\n\n⚠️  Operação cancelada pelo usuário.")
        print("=" * 60 + "\n")
    except Exception as e:
        print(f"\n❌ Erro inesperado: {str(e)}")
        print("=" * 60 + "\n")


if __name__ == "__main__":
    main()

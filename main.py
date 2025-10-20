"""
Nautilus One - Decision Core System
Main entry point for the decision-making system.
"""
from modules.decision_core import DecisionCore


if __name__ == "__main__":
    nautilus = DecisionCore()
    nautilus.processar_decisao()

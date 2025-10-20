#!/usr/bin/env python3
"""
Nautilus One - Decision Core
Main entry point for the intelligent command center.

Usage:
    python3 main.py
"""

from modules.decision_core import DecisionCore


def main():
    """Main function to start the Decision Core."""
    print("\n🚢 Nautilus One - Decision Core")
    print("Intelligent Command Center for Maritime Operations")
    print("-" * 60)
    
    # Initialize and run Decision Core
    core = DecisionCore()
    core.run()


if __name__ == "__main__":
    main()

"""
Logger module for Nautilus One System
Provides logging functionality for all modules
"""
from datetime import datetime


def log_event(message: str):
    """
    Logs an event with timestamp
    
    Args:
        message: The message to log
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

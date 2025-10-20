"""
Logger module for Nautilus One system.
Provides timestamped logging for audit trails.
"""
from datetime import datetime


def log_event(message):
    """
    Log an event with timestamp in the format [YYYY-MM-DD HH:MM:SS].
    
    Args:
        message (str): The message to log
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

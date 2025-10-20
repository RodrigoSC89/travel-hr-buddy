"""
Logger Module - Sistema Nautilus One
Simple, effective event logging with timestamps
"""
from datetime import datetime


def log_event(message: str) -> None:
    """
    Log an event with timestamp to console.
    
    Args:
        message: The message to log
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

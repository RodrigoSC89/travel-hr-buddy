"""
Logger module for Nautilus One Decision Core.
Provides event logging functionality with timestamps.
"""
from datetime import datetime


def log_event(msg: str) -> None:
    """
    Log an event with timestamp to the nautilus_logs.txt file.
    
    Args:
        msg: Message to log
    """
    with open("nautilus_logs.txt", "a", encoding="utf-8") as log:
        log.write(f"[{datetime.now()}] {msg}\n")

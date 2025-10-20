"""
Core Logger Module - Nautilus One
Provides logging functionality for the system.
"""

from datetime import datetime


def log_event(message: str) -> None:
    """
    Log an event with timestamp.
    
    Args:
        message: The message to log
    """
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    log_line = f"[{timestamp}] {message}"
    print(log_line)
    
    # Also write to log file
    try:
        with open("nautilus_system.log", "a", encoding="utf-8") as log_file:
            log_file.write(log_line + "\n")
    except Exception as e:
        print(f"Warning: Could not write to log file: {e}")

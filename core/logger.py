"""
Event logging system with timestamps for Nautilus One Decision Core.
Logs all events to nautilus_logs.txt for complete traceability and audit compliance.
"""

from datetime import datetime


def log_event(message: str) -> None:
    """
    Log an event with timestamp to nautilus_logs.txt.
    
    Args:
        message: The event message to log
    """
    timestamp = datetime.now().isoformat()
    log_entry = f"[{timestamp}] {message}\n"
    
    try:
        with open("nautilus_logs.txt", "a", encoding="utf-8") as f:
            f.write(log_entry)
    except Exception as e:
        print(f"Error writing to log file: {e}")


def get_logs(limit: int = 100) -> list[str]:
    """
    Retrieve recent log entries.
    
    Args:
        limit: Maximum number of log entries to return
        
    Returns:
        List of log entries
    """
    try:
        with open("nautilus_logs.txt", "r", encoding="utf-8") as f:
            lines = f.readlines()
            return lines[-limit:]
    except FileNotFoundError:
        return []
    except Exception as e:
        print(f"Error reading log file: {e}")
        return []

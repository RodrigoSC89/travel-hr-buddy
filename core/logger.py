"""
Logger Module - Event logging with timestamps
Provides centralized logging functionality for the Decision Core system
"""
from datetime import datetime


def log_event(message: str, log_file: str = "nautilus_logs.txt") -> None:
    """
    Log an event with timestamp to the specified log file
    
    Args:
        message: The message to log
        log_file: Path to the log file (default: nautilus_logs.txt)
    """
    timestamp = datetime.now().isoformat()
    log_entry = f"[{timestamp}] {message}\n"
    
    try:
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(log_entry)
    except Exception as e:
        print(f"Error writing to log file: {e}")


def get_logs(log_file: str = "nautilus_logs.txt", lines: int = 50) -> list[str]:
    """
    Retrieve the last N lines from the log file
    
    Args:
        log_file: Path to the log file
        lines: Number of lines to retrieve (default: 50)
        
    Returns:
        List of log entries
    """
    try:
        with open(log_file, "r", encoding="utf-8") as f:
            all_lines = f.readlines()
            return all_lines[-lines:] if len(all_lines) > lines else all_lines
    except FileNotFoundError:
        return []
    except Exception as e:
        print(f"Error reading log file: {e}")
        return []

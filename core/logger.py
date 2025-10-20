"""
Logger module for Nautilus One
Responsible for centralized event logging with timestamps.
"""
from datetime import datetime


def log_event(message: str, log_file: str = "nautilus_logs.txt"):
    """
    Log an event to the specified log file with timestamp.
    
    Args:
        message: The message to log
        log_file: The log file path (default: nautilus_logs.txt)
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] {message}\n"
    
    # Write to log file
    with open(log_file, "a", encoding="utf-8") as file:
        file.write(log_entry)
    
    # Also print to console for immediate feedback
    print(log_entry.rstrip())

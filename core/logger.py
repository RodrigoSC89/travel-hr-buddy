"""
Event logging service for Nautilus One Decision Core.
Maintains comprehensive audit trail of all operations.
"""

from datetime import datetime


class NautilusLogger:
    """Handles event logging for the Decision Core system."""
    
    def __init__(self, log_file: str = "nautilus_logs.txt"):
        """
        Initialize the logger.
        
        Args:
            log_file: Path to the log file
        """
        self.log_file = log_file
    
    def log(self, message: str) -> None:
        """
        Log a message with timestamp.
        
        Args:
            message: The message to log
        """
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {message}\n"
        
        with open(self.log_file, "a", encoding="utf-8") as f:
            f.write(log_entry)
        
        print(log_entry.strip())

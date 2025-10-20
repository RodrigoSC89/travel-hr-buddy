"""
Decision Core - Logger
Handles event logging for all system operations
"""

from datetime import datetime
import os


class Logger:
    """Event logging service for Decision Core"""
    
    def __init__(self, log_file="nautilus_logs.txt"):
        self.log_file = log_file
        
    def log(self, message: str) -> None:
        """
        Log an event with timestamp
        
        Args:
            message: Event message to log
        """
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {message}\n"
        
        with open(self.log_file, "a", encoding="utf-8") as f:
            f.write(log_entry)
            
    def get_logs(self, lines: int = 50) -> list:
        """
        Retrieve recent log entries
        
        Args:
            lines: Number of recent lines to retrieve
            
        Returns:
            List of log entries
        """
        if not os.path.exists(self.log_file):
            return []
            
        with open(self.log_file, "r", encoding="utf-8") as f:
            all_lines = f.readlines()
            return all_lines[-lines:] if len(all_lines) > lines else all_lines

"""
Event Logger for Nautilus One Decision Core
Provides comprehensive logging capabilities with timestamps
"""
from datetime import datetime
import os


class Logger:
    """Event logging system with file-based persistence"""
    
    def __init__(self, log_file="nautilus_logs.txt"):
        """
        Initialize the logger
        
        Args:
            log_file (str): Path to log file
        """
        self.log_file = log_file
        
    def log(self, message):
        """
        Log a message with timestamp
        
        Args:
            message (str): Message to log
        """
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {message}"
        
        # Print to console
        print(log_entry)
        
        # Append to file
        with open(self.log_file, "a", encoding="utf-8") as f:
            f.write(log_entry + "\n")
    
    def get_logs(self):
        """
        Retrieve all logged messages
        
        Returns:
            str: Content of log file
        """
        if not os.path.exists(self.log_file):
            return ""
        
        with open(self.log_file, "r", encoding="utf-8") as f:
            return f.read()

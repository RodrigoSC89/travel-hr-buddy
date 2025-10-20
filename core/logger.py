"""
Logger Module - Event logging with ISO 8601 timestamps

This module provides logging functionality for the Nautilus One Decision Core system.
All events are logged with ISO 8601 timestamps to nautilus_logs.txt.
"""

import datetime
import os


class Logger:
    """Event logger with ISO 8601 timestamp support"""
    
    def __init__(self, log_file="nautilus_logs.txt"):
        """
        Initialize the logger.
        
        Args:
            log_file (str): Path to the log file
        """
        self.log_file = log_file
    
    def log(self, message, level="INFO"):
        """
        Log a message with ISO 8601 timestamp.
        
        Args:
            message (str): The message to log
            level (str): Log level (INFO, WARNING, ERROR, DEBUG)
        """
        timestamp = datetime.datetime.now().isoformat()
        log_entry = f"[{timestamp}] [{level}] {message}\n"
        
        with open(self.log_file, "a", encoding="utf-8") as f:
            f.write(log_entry)
        
        # Also print to console
        print(log_entry.strip())
    
    def info(self, message):
        """Log an info message"""
        self.log(message, "INFO")
    
    def warning(self, message):
        """Log a warning message"""
        self.log(message, "WARNING")
    
    def error(self, message):
        """Log an error message"""
        self.log(message, "ERROR")
    
    def debug(self, message):
        """Log a debug message"""
        self.log(message, "DEBUG")
    
    def clear(self):
        """Clear the log file"""
        if os.path.exists(self.log_file):
            os.remove(self.log_file)
        self.info("Log file cleared")


# Global logger instance
logger = Logger()

"""
Logger Module - Nautilus One System
Provides timestamp-based event logging with dual output (file and console)
"""

import os
from datetime import datetime


def log_event(message):
    """
    Log an event with timestamp to both file and console
    
    Args:
        message (str): The message to log
    """
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    log_message = f"[{timestamp}] {message}"
    
    # Print to console
    print(log_message)
    
    # Write to log file with UTF-8 encoding
    log_file = "nautilus_system.log"
    try:
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(log_message + "\n")
    except Exception as e:
        print(f"Warning: Could not write to log file: {e}")

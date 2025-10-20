"""
Logger module for Nautilus One
Registers events and actions with timestamps
"""
from datetime import datetime


def log_event(msg):
    """
    Logs an event with timestamp to nautilus_logs.txt
    
    Args:
        msg (str): Message to log
    """
    with open("nautilus_logs.txt", "a") as log:
        log.write(f"[{datetime.now()}] {msg}\n")

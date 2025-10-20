from datetime import datetime

def log_event(msg):
    with open("nautilus_logs.txt", "a") as log:
        log.write(f"[{datetime.now()}] {msg}\n")

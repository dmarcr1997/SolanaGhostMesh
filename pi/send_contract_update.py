import os
import json
import requests
import time
from pathlib import Path
from watchdog.observers.polling import PollingObserver as Observer
from watchdog.events import FileSystemEventHandler

LOG_FILE_PATH = os.getenv("LOG_FILE", "/data/log.json")
WALLET_JSON_PATH = os.getenv("WALLET", "/secret/pub.json")
API_URL = os.getenv("API_URL", "http://localhost:8080/attestation/submit")
PUBKEY = ''

with open(WALLET_JSON_PATH, 'r') as file:
    try: 
        data = json.load(file)
        PUBKEY = data['pubkey']
    except Exception as e:
        raise RuntimeError(f"Failed to read pubkey from {WALLET_JSON_PATH}: {e}")

def read_latest_cid(log_path: str) -> dict | None:
    p = Path(log_path)
    if not p.exists() or p.stat().st_size == 0:
        return None
    try:
        with p.open("r", encoding="utf-8") as f:
            lines = [ln.strip() for ln in f.readlines() if ln.strip()]
        if lines:
            for ln in reversed(lines):
                try:
                    obj = json.loads(ln)
                    if isinstance(obj, dict) and "cid" in obj:
                        return obj
                except json.JSONDecodeError:
                    continue
    except Exception:
        pass
    with p.open("r", encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, list) and data:
        last = data[-1]
        if isinstance(last, dict) and "cid" in last:
            return last
        return None

    # If it's a single object
    if isinstance(data, dict) and "cid" in data:
        return data

    return None

def post_cid(cid_obj: dict) -> tuple[bool, str]:
    headers = {"Content-Type": "application/json"}

    payload = {
        "device_pubkey_str": PUBKEY,
        "ipfs_cid": cid_obj.get("cid"),
        "timestamp": int(time.time()),
    }

    try:
        r = requests.post(API_URL, headers=headers, json=payload, timeout=10)
        if 200 <= r.status_code < 300:
            return True, f"Posted CID {payload['cid']} (status {r.status_code})"
        return False, f"Post failed ({r.status_code}): {r.text}"
    except requests.RequestException as e:
        return False, f"Request error: {e}"

class LogFileHandler(FileSystemEventHandler):
    def __init__(self, log_path: str):
        super().__init__()
        self.log_path = str(Path(log_path).resolve())
        self._last_processed_dtime = 0.0
    
    def on_modified(self, event):
        if event.is_directory:
            return
        if str(Path(event.src_path).resolve()) != self.log_path:
            return
        try:
            mtime = Path(self.log_path).stat().st_mtime
        except FileNotFoundError:
            return
        if mtime <= self._last_processed_mtime:
            return
        self._last_processed_mtime = mtime

        latest = read_latest_cid(self.log_path)
        if not latest:
            print("[watcher] No valid CID found in log.")
            return

        cid_val = latest.get("cid")
        if not cid_val:
            print("[watcher] Latest entry missing 'cid'.")
            return

        ok, msg = post_cid(latest)
        print(f"[watcher] {msg}")

if __name__ == "__main__":
    log_path = Path(LOG_FILE_PATH)
    log_path.parent.mkdir(parents=True, exist_ok=True)

    if not log_path.exists():
        log_path.write_text("", encoding="utf-8")

    handler = LogFileHandler(str(log_path))
    observer = Observer()
    observer.schedule(handler, str(log_path.parent), recursive=False)
    observer.start()
    print(f"[watcher] Watching {log_path}")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[watcher] Stopping…")
        observer.stop()
    observer.join()

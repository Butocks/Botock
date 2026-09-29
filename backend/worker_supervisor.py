"""Start multiple isolated, one-account Flow workers on one machine.

Use this on a laptop, a Colab runtime, or a dedicated Azure worker container.
Each slot is a separate process so its Chromium browser and encrypted session
cannot be shared with another Flow account.
"""

import json
import os
import signal
import stat
import subprocess
import sys
import time
from pathlib import Path


REQUIRED_FIELDS = {
    "worker_id", "account_id", "worker_token", "session_path", "session_encryption_key"
}
children: list[subprocess.Popen] = []
stopping = False


def load_slots() -> tuple[str, list[dict[str, str]]]:
    path = Path(os.environ.get("WORKER_SLOTS_FILE", "worker-slots.json"))
    if not path.is_file():
        raise RuntimeError(f"Worker slot file not found: {path}")
    if os.name != "nt" and stat.S_IMODE(path.stat().st_mode) & 0o077:
        raise RuntimeError("Worker slot file must be owner-only (chmod 600 worker-slots.json)")

    data = json.loads(path.read_text(encoding="utf-8"))
    control_plane_url = str(data.get("control_plane_url", "")).rstrip("/")
    slots = data.get("slots")
    if not control_plane_url.startswith("https://") or not isinstance(slots, list) or not slots:
        raise RuntimeError("Slot file needs an HTTPS control_plane_url and at least one slot")

    worker_ids, account_ids, session_paths = set(), set(), set()
    for slot in slots:
        if not isinstance(slot, dict) or REQUIRED_FIELDS - slot.keys():
            raise RuntimeError("Every slot needs worker_id, account_id, worker_token, session_path, and session_encryption_key")
        for key in REQUIRED_FIELDS:
            if not isinstance(slot[key], str) or not slot[key]:
                raise RuntimeError(f"Invalid slot value: {key}")
        if slot["worker_id"] in worker_ids or slot["account_id"] in account_ids or slot["session_path"] in session_paths:
            raise RuntimeError("worker_id, account_id, and session_path must each be unique per slot")
        worker_ids.add(slot["worker_id"])
        account_ids.add(slot["account_id"])
        session_paths.add(slot["session_path"])
    return control_plane_url, slots


def start_slot(control_plane_url: str, slot: dict[str, str]) -> subprocess.Popen:
    env = os.environ.copy()
    env.update({
        "CONTROL_PLANE_URL": control_plane_url,
        "WORKER_ID": slot["worker_id"],
        "FLOW_ACCOUNT_ID": slot["account_id"],
        "WORKER_TOKEN": slot["worker_token"],
        "SESSION_PATH": slot["session_path"],
        "SESSION_ENCRYPTION_KEY": slot["session_encryption_key"],
        "FLOW_CONCURRENCY": "1",
    })
    # Credentials remain in environment of this child only; never print env.
    return subprocess.Popen([sys.executable, "worker.py"], env=env)


def stop_children(*_args) -> None:
    global stopping
    stopping = True
    for child in children:
        if child.poll() is None:
            child.terminate()


def main() -> None:
    control_plane_url, slots = load_slots()
    print(f"Starting {len(slots)} isolated Flow worker slots.")
    signal.signal(signal.SIGINT, stop_children)
    signal.signal(signal.SIGTERM, stop_children)

    slot_by_pid: dict[int, dict[str, str]] = {}
    for slot in slots:
        child = start_slot(control_plane_url, slot)
        children.append(child)
        slot_by_pid[child.pid] = slot

    while not stopping:
        for index, child in enumerate(list(children)):
            if child.poll() is None:
                continue
            slot = slot_by_pid.pop(child.pid)
            if stopping:
                break
            print(f"Worker {slot['worker_id']} exited; restarting in 5 seconds.")
            time.sleep(5)
            replacement = start_slot(control_plane_url, slot)
            children[index] = replacement
            slot_by_pid[replacement.pid] = slot
        time.sleep(1)

    for child in children:
        try:
            child.wait(timeout=15)
        except subprocess.TimeoutExpired:
            child.kill()


if __name__ == "__main__":
    main()

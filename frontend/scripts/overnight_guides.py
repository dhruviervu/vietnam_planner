"""
Overnight catalog generation: attractions, then activities.
Resumes if interrupted. Lite-only, paced to stay under free-tier RPM.
"""
from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path

FRONTEND = Path(__file__).resolve().parent.parent
PY = sys.executable
NPX = shutil.which("npx.cmd") or shutil.which("npx") or "npx"


def run(label: str, args: list[str]) -> int:
    print(f"\n===== {label} =====", flush=True)
    kwargs: dict = {"cwd": str(FRONTEND)}
    if os.name == "nt":
        kwargs["shell"] = True
        proc = subprocess.run(subprocess.list2cmdline(args), **kwargs)
    else:
        proc = subprocess.run(args, **kwargs)
    if proc.returncode != 0:
        print(f"{label} exited {proc.returncode}", file=sys.stderr, flush=True)
    return proc.returncode


def main() -> int:
    codes = []
    codes.append(run("export sights", [NPX, "tsx", "scripts/export-sight-guide-inputs.ts"]))
    codes.append(run("export hcmc skip", [NPX, "tsx", "scripts/export-hcmc-skip.ts"]))
    codes.append(run("export long-curated skip", [PY, "scripts/count_overnight.py"]))
    codes.append(run("export activities", [NPX, "tsx", "scripts/export-activity-guide-inputs.ts"]))
    codes.append(run("generate attractions", [PY, "-u", "scripts/generate_sight_guides.py", "--workers", "1"]))
    codes.append(run("generate activities", [PY, "-u", "scripts/generate_activity_guides.py"]))
    print(f"\n===== overnight done; step exits {codes} =====", flush=True)
    return 1 if any(codes) else 0


if __name__ == "__main__":
    raise SystemExit(main())

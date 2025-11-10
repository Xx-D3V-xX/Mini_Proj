# Python Environment Setup

The error you saw (`externally-managed-environment`) means Ubuntu locks down the system Python so `pip` cannot modify global packages. Use one of the safe options below instead of installing requirements system-wide.

## Option 1: Use the existing project virtual environment (recommended)
```bash
cd /home/divit/Desktop/Mini-Proj-Sem\ 5/Mini_Proj/ai-models
python3 -m venv .venv               # creates the env if it does not exist
source .venv/bin/activate           # activate the env
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```
Whenever you open a new terminal, re-run `source .venv/bin/activate` before using the AI models service.

## Option 2: Create a fresh venv somewhere else
If you prefer to keep virtual environments outside the repo:
```bash
python3 -m venv ~/venvs/mumbai-trails-ai
source ~/venvs/mumbai-trails-ai/bin/activate
python -m pip install --upgrade pip
python -m pip install -r /home/divit/Desktop/Mini-Proj-Sem\ 5/Mini_Proj/ai-models/requirements.txt
```

## Option 3: Override the safeguard (last resort)
Only if you fully understand the risk of modifying system packages:
```bash
cd /home/divit/Desktop/Mini-Proj-Sem\ 5/Mini_Proj/ai-models
python3 -m pip install --break-system-packages -r requirements.txt
```
This bypasses PEP 668 protections and might conflict with apt-managed Python libs, so prefer a virtual environment whenever possible.

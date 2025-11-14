#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PIDS_FILE="$ROOT_DIR/.pids"

echo "Stopping MumbAI Trails services..."
echo ""

if [ ! -f "$PIDS_FILE" ]; then
  echo "No .pids file found. Services may not be running or were started manually."
  echo ""
  echo "To manually find and kill processes by port:"
  echo "  lsof -iTCP:5173 -sTCP:LISTEN -t | xargs kill  # Frontend"
  echo "  lsof -iTCP:4000 -sTCP:LISTEN -t | xargs kill  # Backend"
  echo "  lsof -iTCP:8001 -sTCP:LISTEN -t | xargs kill  # AI Stub"
  exit 0
fi

# Read PIDs and kill them
while IFS= read -r PID; do
  if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
    echo "Stopping process $PID..."
    kill "$PID" 2>/dev/null || true
    
    # Wait up to 5 seconds for graceful shutdown
    for i in {1..5}; do
      if ! kill -0 "$PID" 2>/dev/null; then
        echo "  ✓ Process $PID stopped"
        break
      fi
      sleep 1
      if [ $i -eq 5 ]; then
        echo "  Force killing $PID..."
        kill -9 "$PID" 2>/dev/null || true
      fi
    done
  else
    echo "Process $PID is not running (skipped)"
  fi
done < "$PIDS_FILE"

# Clean up PIDs file
rm -f "$PIDS_FILE"

echo ""
echo "✓ All services stopped"

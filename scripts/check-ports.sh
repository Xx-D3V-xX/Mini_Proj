#!/usr/bin/env bash
set -euo pipefail

PORTS=(4000 5173 8001)
BUSY=()

echo "Checking ports: ${PORTS[*]}"

for PORT in "${PORTS[@]}"; do
  if lsof -iTCP:"$PORT" -sTCP:LISTEN -t >/dev/null 2>&1; then
    PID=$(lsof -iTCP:"$PORT" -sTCP:LISTEN -t)
    echo "❌ Port $PORT is BUSY (PID: $PID)"
    echo "   To kill: kill $PID"
    BUSY+=("$PORT")
  else
    echo "✓ Port $PORT is available"
  fi
done

if [ ${#BUSY[@]} -gt 0 ]; then
  echo ""
  echo "ERROR: ${#BUSY[@]} port(s) are occupied. Please stop those processes before starting services."
  exit 1
fi

echo ""
echo "All ports are available!"
exit 0

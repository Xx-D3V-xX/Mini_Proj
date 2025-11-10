#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
log(){ echo -e "[START] $1"; }
health(){ curl -sf "$1" >/dev/null 2>&1; }

log "Starting AI Models..."
(cd "$ROOT_DIR/ai-models" && python -m uvicorn app.main:app --port 8001 > "$ROOT_DIR/ai-models.out" 2>&1 &)
sleep 2
until health "http://localhost:8001/health"; do echo "Waiting for ai-models..."; sleep 1; done

log "Starting Backend..."
(cd "$ROOT_DIR/backend" && npm run start > "$ROOT_DIR/backend.out" 2>&1 &)
sleep 2
until curl -sf http://localhost:4000/docs >/dev/null 2>&1; do echo "Waiting for backend..."; sleep 1; done

log "Starting Frontend..."
(cd "$ROOT_DIR/frontend" && npm run dev > "$ROOT_DIR/frontend.out" 2>&1 &)
sleep 2
log "All services started:
  Frontend: http://localhost:5173
  Backend : http://localhost:4000 (Swagger at /docs)
  AI      : http://localhost:8001"

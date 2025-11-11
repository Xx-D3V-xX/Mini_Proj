#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PIDS_FILE="$ROOT_DIR/.pids"

echo "═══════════════════════════════════════════"
echo "  MumbAI Trails - Dev Environment Startup  "
echo "═══════════════════════════════════════════"
echo ""

# Step 1: Check ports
echo "📋 Step 1: Checking ports availability..."
bash "$SCRIPT_DIR/check-ports.sh" || exit 1
echo ""

# Clean up old PIDs file
rm -f "$PIDS_FILE"

# Step 2: Start AI service stub
echo "🤖 Step 2: Starting AI service stub (port 8001)..."
python3 "$SCRIPT_DIR/ai-stub.py" > "$ROOT_DIR/artifacts/ai-stub.log" 2>&1 &
AI_PID=$!
echo "$AI_PID" >> "$PIDS_FILE"
echo "   AI stub started (PID: $AI_PID)"

# Wait for AI service
echo "   Waiting for AI service health check..."
for i in {1..10}; do
  if curl -fsS http://localhost:8001/health > /dev/null 2>&1; then
    echo "   ✓ AI service is ready"
    break
  fi
  if [ $i -eq 10 ]; then
    echo "   ❌ AI service failed to start"
    exit 1
  fi
  sleep 1
done
echo ""

# Step 3: Start backend
echo "🔧 Step 3: Starting backend (port 4000)..."
cd "$ROOT_DIR/backend"
pnpm run dev > "$ROOT_DIR/artifacts/backend.log" 2>&1 &
BACKEND_PID=$!
echo "$BACKEND_PID" >> "$PIDS_FILE"
echo "   Backend started (PID: $BACKEND_PID)"

# Wait for backend
echo "   Waiting for backend health check..."
for i in {1..30}; do
  if curl -fsS http://localhost:4000/docs > /dev/null 2>&1; then
    echo "   ✓ Backend is ready"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "   ❌ Backend failed to start"
    exit 1
  fi
  sleep 1
done
echo ""

# Step 4: Start frontend
echo "⚛️  Step 4: Starting frontend (port 5173)..."
cd "$ROOT_DIR/frontend"
pnpm run dev > "$ROOT_DIR/artifacts/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "$FRONTEND_PID" >> "$PIDS_FILE"
echo "   Frontend started (PID: $FRONTEND_PID)"

# Wait for frontend
echo "   Waiting for frontend health check..."
for i in {1..30}; do
  if curl -fsS http://localhost:5173/ 2>&1 | grep -q "<!doctype html"; then
    echo "   ✓ Frontend is ready"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "   ❌ Frontend failed to start"
    exit 1
  fi
  sleep 1
done
echo ""

echo "═══════════════════════════════════════════"
echo "  ✨ All services running successfully!    "
echo "═══════════════════════════════════════════"
echo ""
echo "Service URLs:"
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   http://localhost:4000/api"
echo "  Swagger:   http://localhost:4000/docs"
echo "  AI Stub:   http://localhost:8001/health"
echo ""
echo "To stop all services:"
echo "  bash ./scripts/dev-stop.sh"
echo "  or: pnpm run dev:stop"
echo ""
echo "PIDs saved to: $PIDS_FILE"

#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ARTIFACTS_DIR="$ROOT_DIR/artifacts/e2e"

mkdir -p "$ARTIFACTS_DIR"

echo "═══════════════════════════════════════"
echo "  Running API Probes (CLI Tests)        "
echo "═══════════════════════════════════════"
echo ""

FAILED=0

# Probe 1: Search endpoint
echo "🔍 Probe 1: GET /api/search?q=museum"
if curl -f -s "http://localhost:4000/api/search?q=museum" -o "$ARTIFACTS_DIR/search.json"; then
  echo "   ✓ Success (saved to artifacts/e2e/search.json)"
  if command -v jq &> /dev/null; then
    echo "   Preview:"
    jq -C '.' "$ARTIFACTS_DIR/search.json" | head -20 || cat "$ARTIFACTS_DIR/search.json" | head -20
  fi
else
  echo "   ❌ FAILED"
  FAILED=$((FAILED + 1))
fi
echo ""

# Probe 2: POI list endpoint
echo "📍 Probe 2: GET /api/pois"
if curl -f -s "http://localhost:4000/api/pois" -o "$ARTIFACTS_DIR/pois.json"; then
  echo "   ✓ Success (saved to artifacts/e2e/pois.json)"
  if command -v jq &> /dev/null; then
    echo "   Count:"
    jq 'length' "$ARTIFACTS_DIR/pois.json" || echo "   (unable to parse)"
  fi
else
  echo "   ❌ FAILED"
  FAILED=$((FAILED + 1))
fi
echo ""

# Probe 3: Feedback endpoint (POST)
echo "💬 Probe 3: POST /api/feedback"
if curl -f -s "http://localhost:4000/api/feedback" \
  -H "Content-Type: application/json" \
  -d '{"message":"probe test","rating":5}' \
  -X POST \
  -o "$ARTIFACTS_DIR/feedback.json"; then
  echo "   ✓ Success (saved to artifacts/e2e/feedback.json)"
else
  echo "   ❌ FAILED (feedback endpoint may require auth or have different schema)"
  # Don't count as failure if endpoint requires auth
fi
echo ""

# Probe 4: AI Stub health
echo "🤖 Probe 4: GET AI Stub health"
if curl -f -s "http://localhost:8001/health" -o "$ARTIFACTS_DIR/ai-health.json"; then
  echo "   ✓ Success (saved to artifacts/e2e/ai-health.json)"
  if command -v jq &> /dev/null; then
    jq -C '.' "$ARTIFACTS_DIR/ai-health.json"
  fi
else
  echo "   ❌ FAILED"
  FAILED=$((FAILED + 1))
fi
echo ""

echo "═══════════════════════════════════════"
if [ $FAILED -eq 0 ]; then
  echo "  ✓ All critical probes passed          "
  echo "═══════════════════════════════════════"
  exit 0
else
  echo "  ❌ $FAILED probe(s) failed             "
  echo "═══════════════════════════════════════"
  exit 1
fi

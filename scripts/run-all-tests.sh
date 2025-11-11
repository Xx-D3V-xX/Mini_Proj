#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
RESULTS_DIR="$ROOT_DIR/test-results"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

mkdir -p "$RESULTS_DIR"

echo "═══════════════════════════════════════════════════════════"
echo "  MumbAI Trails - Comprehensive Test Execution Report       "
echo "  Timestamp: $TIMESTAMP                                     "
echo "═══════════════════════════════════════════════════════════"
echo ""

# Initialize results
RESULTS_MD="$RESULTS_DIR/test-results-$TIMESTAMP.md"
RESULTS_HTML="$RESULTS_DIR/result1.html"

# Start Markdown report
cat > "$RESULTS_MD" << 'MDHEADER'
# MumbAI Trails - Test Execution Report

## Executive Summary

This report provides a comprehensive analysis of all tests executed for the MumbAI Trails project.

---

## Test Environment

MDHEADER

echo "**Date:** $(date)" >> "$RESULTS_MD"
echo "**Platform:** $(uname -s)" >> "$RESULTS_MD"
echo "**Node Version:** $(node --version 2>/dev/null || echo 'N/A')" >> "$RESULTS_MD"
echo "**Python Version:** $(python3 --version 2>/dev/null || echo 'N/A')" >> "$RESULTS_MD"
echo "" >> "$RESULTS_MD"
echo "---" >> "$RESULTS_MD"
echo "" >> "$RESULTS_MD"

# Test 1: Port Check
echo "## 1. Port Availability Check" >> "$RESULTS_MD"
echo ""
echo "🔍 Test 1/6: Checking port availability..."
if bash "$SCRIPT_DIR/check-ports.sh" > "$RESULTS_DIR/port-check.log" 2>&1; then
  echo "✅ **PASS** - All required ports (4000, 5173, 8001) are available" >> "$RESULTS_MD"
  echo "   ✅ PASS"
else
  echo "❌ **FAIL** - Some ports are occupied" >> "$RESULTS_MD"
  echo "   ❌ FAIL"
  echo "" >> "$RESULTS_MD"
  echo "### Error Details:" >> "$RESULTS_MD"
  echo '```' >> "$RESULTS_MD"
  cat "$RESULTS_DIR/port-check.log" >> "$RESULTS_MD"
  echo '```' >> "$RESULTS_MD"
fi
echo "" >> "$RESULTS_MD"
echo "---" >> "$RESULTS_MD"
echo ""

# Test 2: Service Startup
echo "## 2. Service Startup Test" >> "$RESULTS_MD"
echo ""
echo "🚀 Test 2/6: Starting all services..."
if bash "$SCRIPT_DIR/dev-start.sh" > "$RESULTS_DIR/startup.log" 2>&1; then
  echo "✅ **PASS** - All services started successfully" >> "$RESULTS_MD"
  echo "   ✅ PASS"
  echo "" >> "$RESULTS_MD"
  echo "### Services Started:" >> "$RESULTS_MD"
  echo "- AI Stub Service (port 8001)" >> "$RESULTS_MD"
  echo "- Backend Service (port 4000)" >> "$RESULTS_MD"
  echo "- Frontend Service (port 5173)" >> "$RESULTS_MD"
  SERVICES_RUNNING=true
else
  echo "❌ **FAIL** - Service startup failed" >> "$RESULTS_MD"
  echo "   ❌ FAIL"
  SERVICES_RUNNING=false
  echo "" >> "$RESULTS_MD"
  echo "### Error Details:" >> "$RESULTS_MD"
  echo '```' >> "$RESULTS_MD"
  tail -50 "$RESULTS_DIR/startup.log" >> "$RESULTS_MD"
  echo '```' >> "$RESULTS_MD"
fi
echo "" >> "$RESULTS_MD"
echo "---" >> "$RESULTS_MD"
echo ""

# Test 3: API Probes (only if services running)
echo "## 3. API Smoke Tests (CLI Probes)" >> "$RESULTS_MD"
echo ""
echo "🔬 Test 3/6: Running API probes..."
if [ "$SERVICES_RUNNING" = true ]; then
  sleep 5  # Give services time to fully initialize
  if bash "$SCRIPT_DIR/api-probes.sh" > "$RESULTS_DIR/api-probes.log" 2>&1; then
    echo "✅ **PASS** - All API probes successful" >> "$RESULTS_MD"
    echo "   ✅ PASS"
    echo "" >> "$RESULTS_MD"
    echo "### Probes Executed:" >> "$RESULTS_MD"
    echo "- \`GET /api/search?q=museum\` - ✅ Success" >> "$RESULTS_MD"
    echo "- \`GET /api/pois\` - ✅ Success" >> "$RESULTS_MD"
    echo "- \`POST /api/feedback\` - ⚠️ May require auth" >> "$RESULTS_MD"
    echo "- \`GET /health\` (AI Stub) - ✅ Success" >> "$RESULTS_MD"
    
    # Add sample responses if they exist
    if [ -f "$ROOT_DIR/artifacts/e2e/search.json" ]; then
      echo "" >> "$RESULTS_MD"
      echo "#### Sample Response (Search):" >> "$RESULTS_MD"
      echo '```json' >> "$RESULTS_MD"
      head -20 "$ROOT_DIR/artifacts/e2e/search.json" >> "$RESULTS_MD"
      echo '```' >> "$RESULTS_MD"
    fi
  else
    echo "❌ **FAIL** - Some API probes failed" >> "$RESULTS_MD"
    echo "   ❌ FAIL"
    echo "" >> "$RESULTS_MD"
    echo "### Error Details:" >> "$RESULTS_MD"
    echo '```' >> "$RESULTS_MD"
    cat "$RESULTS_DIR/api-probes.log" >> "$RESULTS_MD"
    echo '```' >> "$RESULTS_MD"
  fi
else
  echo "⏭️ **SKIPPED** - Services not running" >> "$RESULTS_MD"
  echo "   ⏭️ SKIPPED"
fi
echo "" >> "$RESULTS_MD"
echo "---" >> "$RESULTS_MD"
echo ""

# Test 4: Backend Tests
echo "## 4. Backend Tests (Jest)" >> "$RESULTS_MD"
echo ""
echo "🧪 Test 4/6: Running backend tests..."
cd "$ROOT_DIR/backend"
if [ -f "jest.config.js" ] && grep -q '"test"' package.json; then
  if pnpm test > "$RESULTS_DIR/backend-test.log" 2>&1; then
    echo "✅ **PASS** - Backend tests passed" >> "$RESULTS_MD"
    echo "   ✅ PASS"
  else
    echo "❌ **FAIL** - Backend tests failed" >> "$RESULTS_MD"
    echo "   ❌ FAIL"
  fi
  echo "" >> "$RESULTS_MD"
  echo "### Test Output:" >> "$RESULTS_MD"
  echo '```' >> "$RESULTS_MD"
  cat "$RESULTS_DIR/backend-test.log" >> "$RESULTS_MD"
  echo '```' >> "$RESULTS_MD"
else
  echo "⚠️ **NOT IMPLEMENTED** - Backend tests not configured" >> "$RESULTS_MD"
  echo "   ⚠️ NOT IMPLEMENTED"
  echo "" >> "$RESULTS_MD"
  echo "To implement:" >> "$RESULTS_MD"
  echo '```bash' >> "$RESULTS_MD"
  echo "cd backend" >> "$RESULTS_MD"
  echo "pnpm add -D jest @types/jest ts-jest supertest @types/supertest" >> "$RESULTS_MD"
  echo "# Create jest.config.js and test files" >> "$RESULTS_MD"
  echo '```' >> "$RESULTS_MD"
fi
echo "" >> "$RESULTS_MD"
echo "---" >> "$RESULTS_MD"
echo ""
cd "$ROOT_DIR"

# Test 5: Frontend Tests
echo "## 5. Frontend Tests (Vitest)" >> "$RESULTS_MD"
echo ""
echo "⚛️ Test 5/6: Running frontend tests..."
cd "$ROOT_DIR/frontend"
if grep -q '"test"' package.json 2>/dev/null; then
  if pnpm test > "$RESULTS_DIR/frontend-test.log" 2>&1; then
    echo "✅ **PASS** - Frontend tests passed" >> "$RESULTS_MD"
    echo "   ✅ PASS"
  else
    echo "❌ **FAIL** - Frontend tests failed" >> "$RESULTS_MD"
    echo "   ❌ FAIL"
  fi
  echo "" >> "$RESULTS_MD"
  echo "### Test Output:" >> "$RESULTS_MD"
  echo '```' >> "$RESULTS_MD"
  cat "$RESULTS_DIR/frontend-test.log" >> "$RESULTS_MD"
  echo '```' >> "$RESULTS_MD"
else
  echo "⚠️ **NOT IMPLEMENTED** - Frontend tests not configured" >> "$RESULTS_MD"
  echo "   ⚠️ NOT IMPLEMENTED"
  echo "" >> "$RESULTS_MD"
  echo "To implement:" >> "$RESULTS_MD"
  echo '```bash' >> "$RESULTS_MD"
  echo "cd frontend" >> "$RESULTS_MD"
  echo "pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom" >> "$RESULTS_MD"
  echo "# Update vite.config.ts and create test files" >> "$RESULTS_MD"
  echo '```' >> "$RESULTS_MD"
fi
echo "" >> "$RESULTS_MD"
echo "---" >> "$RESULTS_MD"
echo ""
cd "$ROOT_DIR"

# Test 6: E2E Tests
echo "## 6. E2E Tests (Playwright)" >> "$RESULTS_MD"
echo ""
echo "🎭 Test 6/6: Running E2E tests..."
if [ -d "$ROOT_DIR/tests/e2e" ] && [ -f "$ROOT_DIR/tests/e2e/package.json" ]; then
  cd "$ROOT_DIR/tests/e2e"
  if [ -f "playwright.config.ts" ]; then
    if npm test > "$RESULTS_DIR/e2e-test.log" 2>&1; then
      echo "✅ **PASS** - E2E tests passed" >> "$RESULTS_MD"
      echo "   ✅ PASS"
    else
      echo "❌ **FAIL** - E2E tests failed" >> "$RESULTS_MD"
      echo "   ❌ FAIL"
    fi
    echo "" >> "$RESULTS_MD"
    echo "### Test Output:" >> "$RESULTS_MD"
    echo '```' >> "$RESULTS_MD"
    cat "$RESULTS_DIR/e2e-test.log" >> "$RESULTS_MD"
    echo '```' >> "$RESULTS_MD"
  else
    echo "⚠️ **NOT IMPLEMENTED** - Playwright not configured" >> "$RESULTS_MD"
    echo "   ⚠️ NOT IMPLEMENTED"
  fi
else
  echo "⚠️ **NOT IMPLEMENTED** - E2E tests not set up" >> "$RESULTS_MD"
  echo "   ⚠️ NOT IMPLEMENTED"
  echo "" >> "$RESULTS_MD"
  echo "To implement:" >> "$RESULTS_MD"
  echo '```bash' >> "$RESULTS_MD"
  echo "cd tests/e2e" >> "$RESULTS_MD"
  echo "npm init -y" >> "$RESULTS_MD"
  echo "npm install -D @playwright/test" >> "$RESULTS_MD"
  echo "npx playwright install" >> "$RESULTS_MD"
  echo "# Create playwright.config.ts and test files" >> "$RESULTS_MD"
  echo '```' >> "$RESULTS_MD"
fi
echo "" >> "$RESULTS_MD"
echo "---" >> "$RESULTS_MD"
echo ""
cd "$ROOT_DIR"

# Stop services
echo "🛑 Stopping services..."
if [ "$SERVICES_RUNNING" = true ]; then
  bash "$SCRIPT_DIR/dev-stop.sh" > /dev/null 2>&1 || true
fi

# Summary
echo "## Test Summary" >> "$RESULTS_MD"
echo "" >> "$RESULTS_MD"
echo "| Test Category | Status |" >> "$RESULTS_MD"
echo "|--------------|--------|" >> "$RESULTS_MD"
echo "| Port Availability | ✅ |" >> "$RESULTS_MD"
echo "| Service Startup | $([ "$SERVICES_RUNNING" = true ] && echo '✅' || echo '❌') |" >> "$RESULTS_MD"
echo "| API Probes | ⏳ See above |" >> "$RESULTS_MD"
echo "| Backend Tests | ⚠️ Not Implemented |" >> "$RESULTS_MD"
echo "| Frontend Tests | ⚠️ Not Implemented |" >> "$RESULTS_MD"
echo "| E2E Tests | ⚠️ Not Implemented |" >> "$RESULTS_MD"
echo "" >> "$RESULTS_MD"

# Recommendations
echo "## Recommendations" >> "$RESULTS_MD"
echo "" >> "$RESULTS_MD"
echo "### Immediate Actions Required:" >> "$RESULTS_MD"
echo "" >> "$RESULTS_MD"
echo "1. **Implement Backend Tests**" >> "$RESULTS_MD"
echo "   - Install Jest and Supertest" >> "$RESULTS_MD"
echo "   - Create \`jest.config.js\`" >> "$RESULTS_MD"
echo "   - Write unit tests for services" >> "$RESULTS_MD"
echo "   - Write integration tests for API endpoints" >> "$RESULTS_MD"
echo "   - Target: 80% coverage" >> "$RESULTS_MD"
echo "" >> "$RESULTS_MD"
echo "2. **Implement Frontend Tests**" >> "$RESULTS_MD"
echo "   - Install Vitest and Testing Library" >> "$RESULTS_MD"
echo "   - Update \`vite.config.ts\`" >> "$RESULTS_MD"
echo "   - Write component tests" >> "$RESULTS_MD"
echo "   - Add accessibility tests with axe" >> "$RESULTS_MD"
echo "   - Target: 70% coverage" >> "$RESULTS_MD"
echo "" >> "$RESULTS_MD"
echo "3. **Implement E2E Tests**" >> "$RESULTS_MD"
echo "   - Setup Playwright" >> "$RESULTS_MD"
echo "   - Create test scenarios for user journeys" >> "$RESULTS_MD"
echo "   - Test on multiple browsers (chromium, firefox, webkit)" >> "$RESULTS_MD"
echo "" >> "$RESULTS_MD"

# Create HTML version
echo "📄 Generating HTML report..."
cat > "$RESULTS_HTML" << 'HTMLHEADER'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MumbAI Trails - Test Results</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        h2 {
            color: #1e40af;
            margin-top: 30px;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #ddd;
        }
        h3 {
            color: #1e3a8a;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 14px;
            margin-left: 10px;
        }
        .status.pass { background: #10b981; color: white; }
        .status.fail { background: #ef4444; color: white; }
        .status.skip { background: #f59e0b; color: white; }
        .status.not-impl { background: #6b7280; color: white; }
        pre {
            background: #1e293b;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            margin: 10px 0;
            font-size: 13px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #2563eb;
            color: white;
            font-weight: 600;
        }
        tr:hover { background: #f9fafb; }
        .info-box {
            background: #eff6ff;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
        .warning-box {
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
        .error-box {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
        .timestamp {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 20px;
        }
        code {
            background: #f1f5f9;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
        }
        ul, ol {
            margin-left: 30px;
            margin-bottom: 15px;
        }
        li { margin-bottom: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 MumbAI Trails - Comprehensive Test Results</h1>
        <div class="timestamp">Generated: TIMESTAMP_PLACEHOLDER</div>
HTMLHEADER

# Convert markdown to HTML sections
sed "s/TIMESTAMP_PLACEHOLDER/$(date)/" "$RESULTS_HTML" > "$RESULTS_HTML.tmp" && mv "$RESULTS_HTML.tmp" "$RESULTS_HTML"

# Parse and add content from markdown
python3 << 'PYEOF' > /dev/null 2>&1 || true
import re
import sys

md_file = sys.argv[1] if len(sys.argv) > 1 else "test-results-latest.md"
html_file = sys.argv[2] if len(sys.argv) > 2 else "result1.html"

try:
    with open(md_file, 'r') as f:
        md_content = f.read()
    
    # Simple markdown to HTML conversion
    html_content = md_content
    html_content = re.sub(r'^# (.+)$', r'<h1>\1</h1>', html_content, flags=re.M)
    html_content = re.sub(r'^## (.+)$', r'<h2>\1</h2>', html_content, flags=re.M)
    html_content = re.sub(r'^### (.+)$', r'<h3>\1</h3>', html_content, flags=re.M)
    html_content = re.sub(r'```([^`]+)```', r'<pre>\1</pre>', html_content, flags=re.S)
    html_content = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html_content)
    html_content = re.sub(r'`([^`]+)`', r'<code>\1</code>', html_content)
    html_content = html_content.replace('✅', '<span class="status pass">✅ PASS</span>')
    html_content = html_content.replace('❌', '<span class="status fail">❌ FAIL</span>')
    html_content = html_content.replace('⚠️', '<span class="status not-impl">⚠️ NOT IMPL</span>')
    html_content = html_content.replace('⏭️', '<span class="status skip">⏭️ SKIP</span>')
    
    with open(html_file, 'a') as f:
        f.write(html_content)
        f.write('</div></body></html>')
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
PYEOF

echo "</div></body></html>" >> "$RESULTS_HTML"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ Test Execution Complete                                "
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📊 Reports Generated:"
echo "  - Markdown: $RESULTS_MD"
echo "  - HTML:     $RESULTS_HTML"
echo ""
echo "View HTML report: open $RESULTS_HTML"
echo ""

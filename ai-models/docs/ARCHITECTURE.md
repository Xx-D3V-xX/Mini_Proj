# MumbAI Trails Agent System

This document describes how the multi-agent system inside `/ai-models` collaborates with the NestJS backend. The goal is to keep every response grounded on database facts, emit repeatable outputs, and capture enough telemetry for later auditing.

## Control Flow

1. **Policy Gate** – Incoming chat or tool requests are first inspected by the policy agent. It blocks disallowed content, redacts PII, and tags potentially risky user intents. Only approved payloads advance to orchestration.
2. **Router** – The router agent reads conversation state plus the latest user input and produces a structured `router_plan`. The plan lists the downstream agents that should run (retriever, recommender, planner, routing, weather, chat, admin CMS, summarizer, etc.) and the order in which they must be called. The router enforces the budget in `configs/agents.yaml`.
3. **Tool Chain** – The orchestrator executes each plan step sequentially:
   - **Retriever** queries Postgres through `tools/db.ts` and must return `poi_result.schema.json` with evidence IDs.
   - **Geo Filter** removes items outside the requested bounding box or time window using helpers in `tools/hours.ts`.
   - **Recommender** re-ranks the surviving POIs to balance diversity, price fit, and mood.
   - **Planner** stitches selected POIs into an itinerary, honoring `opening_hours`, routing estimates, and weather.
   - **Routing & Weather** agents rely on `tools/routing_estimator.ts` and `tools/weather_adapter.ts` to estimate travel time and latest conditions.
   - **Chat** turns the structured data into Markdown replies while referencing only the evidence IDs supplied by upstream agents.
   - **Admin CMS** is reserved for bulk import / quality tasks. No user traffic should hit it unless the router explicitly plans the step.
4. **Summarizer** – After the chat agent responds, the summarizer agent converts the exchange into compact memories that can be stored in the `agent_memories` table for future personalization.

## Evidence Discipline

- Every agent response that surfaces POIs must include an `evidence` array containing the canonical `poi_id` strings from Postgres.
- The orchestrator persists each agent run plus its evidence links inside `agent_runs` and `agent_run_evidence` so we can replay conversations later.
- The chat agent may only mention POIs that appear in the accumulated evidence store. Guardrails in `runners/guardrails.ts` enforce this at runtime.
- The planner records all assumptions, weather notes, and conflicts in its JSON output. The chat agent must surface these caveats verbatim.

## Error Handling & Budgets

- All Gemini calls are wrapped by `GeminiClient` with per-agent token limits defined in `configs/agents.yaml`.
- If a downstream agent fails schema validation, the orchestrator retries once (after trimming the prompt). Persistent failures trigger a graceful fallback reply explaining the issue to the user.
- The router may set `needs_clarification` fields. In that case the chat agent bypasses the rest of the plan and immediately asks the follow-up question.

## Data Sources & Tools

| Tool | Purpose |
| ---- | ------- |
| `tools/db.ts` | Parameterized POI lookups, tag/category expansion, opening-hour queries |
| `tools/hours.ts` | Determining whether a POI is open at a given timestamp |
| `tools/routing_estimator.ts` | Fast Haversine-based distance + ETA heuristics per travel mode |
| `tools/weather_adapter.ts` | Cached weather lookups backed by the `weather_cache` table |
| `tools/maps_link.ts` | Creates deep links for Google Maps share buttons |

## Integration with Backend

- The NestJS `/api/chat` route calls `orchestrator.handleAIRequest`. The orchestrator receives `{ user, sessionId, message, params }` and returns `{ session_id, reply_markdown, poi_ids_referenced }`.
- Each agent invocation is stored through Prisma. The backend can later list sessions, runs, and associated POIs for governance.
- The AI layer loads env vars from `.env.local` (API keys, timezone, weather provider) so no secrets leak into source control.

Keeping these invariants ensures that every experience users see in the frontend can be traced back to structured evidence from the normalized database.

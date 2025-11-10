- 10-minute demo script:
  1) Start: bash ./start-all.sh  (Windows: ./start-all.ps1)
  2) Open FE 5173 → Landing → select “Chill” → verify results in <2s
  3) Explore: search “Marine Drive” → select → map centers; Add to Plan
  4) Planner: Generate Itinerary → see ordered stops with times; Save; Export PDF; Show QR
  5) ItineraryView: open QR route → verify map polyline and totals
  6) Admin: login as admin → Import CSV → add/edit/delete POI → see analytics cards
  7) Chatbot: “family-friendly places near Bandra” → shows suggestions + reasons
  8) Swagger: http://localhost:4000/docs → try GET /pois and POST /itineraries/generate
- Acceptance checklist (tick boxes):
  [ ] Landing recs render
  [ ] Explore filters + map OK
  [ ] Planner generate + PDF + QR OK
  [ ] Single-destination ETA + Google Maps link
  [ ] Admin CSV import + CRUD + analytics
  [ ] Chatbot answers from local corpus
  [ ] Swagger reachable
  [ ] start-all works
- curl smoke tests (after login token):
  curl -s http://localhost:4000/pois | head
  curl -s http://localhost:8001/health

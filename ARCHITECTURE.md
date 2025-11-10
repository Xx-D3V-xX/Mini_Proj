- Mermaid diagrams:
  ```mermaid
  flowchart LR
    FE[Frontend React] <--> BE[NestJS API]
    BE <--> DB[(PostgreSQL)]
    BE <--> AI[FastAPI Models]
    AI -->|optional| OSRM[(Local OSRM)]
    AI -->|optional| Ollama[(Local LLM)]
  ```
- ERD (Mermaid):
  ```mermaid
  erDiagram
    User ||--o{ Itinerary : owns
    User ||--o{ Review : writes
    User ||--o{ Feedback : sends
    Poi  ||--o{ Review : receives
    Poi  ||--o{ Feedback : receives
  ```
- Algorithms: recommendation = weighted(similarity, category fit, distance, price, rating)
- Itinerary: greedy nearest-insertion + 2-opt improvement; respect opening_hours
- Security: JWT access+refresh; httpOnly cookie mode toggle; role guards

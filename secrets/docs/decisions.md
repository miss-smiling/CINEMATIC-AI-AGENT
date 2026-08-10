# Decisions Log

Keep this updated as the source of truth. Don't rely on chat history for decisions — write them here.

## Locked

- Drift scoring method: Gemini Vision comparison (agreed by team, Aug 07)
- Team structure: one member per full vertical (agents / data / frontend / infra), not per week

## Pending

- [ ] Image generation model — benchmark cost/quality, lock before Cinematographer agent is built
- [ ] Cloud Run deployment — blocked on Google Cloud hackathon credit form (submitted, ~5 business days)
- [ ] Secret Manager setup — same blocker as above
- [ ] API key check on Cloud Run endpoint — code can be written now, wiring blocked on deployment
- [ ] Job queue (BullMQ/Redis) — only add if synchronous pipeline proves too slow on 50-shot test

## Cut from scope (with reasoning)

- Confluent Kafka — built for scale we don't need, adds setup/debug overhead, likely not free
- Vertex AI Search / RAG + BigQuery — nothing in our problem needs semantic search or a separate analytics warehouse
- Full API Gateway layer — a basic key check on the Cloud Run endpoint is enough for a hackathon demo

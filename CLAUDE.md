# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

This is a **vanilla monorepo** (no Lerna/Nx) of four independently deployable services under `src/packages/`. There is no root-level `package.json` — each service owns its own `node_modules` and dependency graph.

```
src/packages/
├── auth/      — JWT auth service (port 3000)
├── marvel/    — Marvel heroes API (port 3001)
├── dc/        — DC heroes API (port 3002)
└── cockpit/   — NGINX reverse proxy gateway (port 8080)
```

**cockpit** (NGINX) routes all external traffic and falls back to a homolog environment when a service is down:
- `/api/auth/*` → `auth_api:3000`
- `/api/marvel/*` → `marvel_api:3001`
- `/api/DC/*` → `dc_api:3002`

## Service Communication

Marvel and DC services validate Bearer tokens by making a synchronous HTTP GET to the auth service:
```
GET ${TOKEN_VERIFY_SVC}/verify/{token}
```
This is implemented in each service's `src/auth.guard.ts` using NestJS `HttpModule` + RxJS `lastValueFrom()`.

The auth service stores users in-memory (no database). Hero data is hardcoded static arrays.

## Development Commands

All commands are run **inside each service directory** (e.g., `cd src/packages/auth`):

```bash
npm run start:dev      # watch mode (local)
npm run start:debug    # watch + debug on 0.0.0.0:9229
npm run build          # compile to dist/
npm run lint           # ESLint --fix
npm run test           # unit tests (jest)
npm run test:cov       # coverage report
npm run test:e2e       # e2e tests (jest-e2e.json)
```

## Running with Docker

```bash
# All services
docker-compose up

# Selective startup (auth required for token validation)
docker-compose up auth_api marvel_api
docker-compose up auth_api dc_api
```

Services communicate over the `monorepo_network` bridge. The DNS names (`auth_api`, `marvel_api`, `dc_api`) match the compose service names.

## Environment Variables

Create a `.env` file at the repo root (loaded as `../.env` relative to each service's `src/`):

| Variable | Used by | Purpose |
|---|---|---|
| `JWT_SECRET_KEY` | auth | JWT signing secret |
| `JWT_EXPIRATION_TIME` | auth | Token TTL (e.g. `3600s`) |
| `TOKEN_VERIFY_SVC` | marvel, dc | Base URL of auth verify endpoint (e.g. `http://auth_api:3000/auth`) |

## Swagger / API Docs

Each service exposes Swagger UI at `/api` when running locally:
- Auth: `http://localhost:3000/api`
- Marvel: `http://localhost:3001/api`
- DC: `http://localhost:3002/api`

## CI/CD

Three independent GitHub Actions workflows in `.github/workflows/` trigger on path-scoped pushes to `main`:

| Workflow | Trigger path | Docker image tag |
|---|---|---|
| `docker-image-auth_api.yml` | `src/packages/auth/**` | `monorepo_auth:$(date +%s)` |
| `docker-image-marvel_api.yml` | `src/packages/marvel/**` | `monorepo_marvel:$(date +%s)` |
| `docker-image-dc_api.yml` | `src/packages/dc/**` | `monorepo_dc:$(date +%s)` |

## Key Design Decisions

- **Services do not import from each other.** Shared code belongs in scoped npm packages published to a private registry (e.g., Azure Artifacts), not cross-service imports.
- **NGINX fallback:** If a service container is unreachable, cockpit proxies the request to a homolog (staging) environment defined in `nginx.conf`.
- **Debug ports:** auth=9229, marvel=9230, dc=9231. VSCode attach configs are in `.vscode/launch.json`.

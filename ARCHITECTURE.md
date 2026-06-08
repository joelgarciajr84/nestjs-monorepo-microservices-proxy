# Architecture

## Overview

This project implements the **API Gateway + independent Microservices** pattern without any monorepo framework. Each service is a standalone NestJS application with its own `node_modules`, built and deployed independently via Docker.

```
                        ┌─────────────────────────────────┐
                        │         cockpit (NGINX)          │
  Client Request        │           port 8080              │
  ──────────────►       │                                  │
  /api/auth/*           │  /api/auth/*   → auth_api:3000   │
  /api/marvel/*         │  /api/marvel/* → marvel_api:3001 │
  /api/DC/*             │  /api/DC/*     → dc_api:3002     │
                        │                                  │
                        │  If 502 → fallback to homolog    │
                        └─────────┬───────────────────────┘
                                  │ monorepo_network (bridge)
              ┌───────────────────┼───────────────┐
              ▼                   ▼               ▼
       ┌─────────────┐   ┌──────────────┐  ┌───────────┐
       │  auth_api   │   │  marvel_api  │  │   dc_api  │
       │  port 3000  │   │  port 3001   │  │ port 3002 │
       └─────────────┘   └──────┬───────┘  └─────┬─────┘
                                │                 │
                                └────────┬────────┘
                                         │ HTTP GET /auth/verify/:token
                                         ▼
                                  ┌─────────────┐
                                  │  auth_api   │
                                  │  port 3000  │
                                  └─────────────┘
```

## Authenticated request flow

When a client calls `GET /api/marvel/hero/` with a Bearer token:

1. **NGINX** receives the request on port 8080 and proxies it to `marvel_api:3001/marvel/hero/`
2. **NestJS `AuthGuard`** (`src/packages/marvel/src/auth.guard.ts`) intercepts the request
3. The guard extracts the token from the `Authorization: Bearer <token>` header
4. The guard makes a synchronous HTTP call to `${TOKEN_VERIFY_SVC}/verify/<token>` using NestJS `HttpModule`
5. **auth_api** verifies the JWT signature and returns `true` (HTTP 200) or throws HTTP 403
6. If valid, the guard allows the request through to `MarvelController`
7. The controller returns a random hero from the static array

```
Client → NGINX → marvel_api (AuthGuard) → auth_api /verify/:token
                                        ← 200 OK / 403 Forbidden
                 marvel_api (Controller) ← (if 200)
Client ←────────────────────────────────── { hero data }
```

The guard implementation uses RxJS `lastValueFrom()` to convert the `Observable` from `HttpService.get()` into a `Promise`, since NestJS guards use async/await.

## NGINX fallback mechanism

If a service container is unreachable (returns HTTP 502 Bad Gateway), NGINX transparently proxies the request to a homologation URL instead of returning an error to the client.

```nginx
location ~ ^/api/marvel(/?.*)$ {
    proxy_pass http://marvel_api:3001/marvel$1?args;
    error_page 502 = @fallback_marvel_api;   # ← triggers on 502
}
location @fallback_marvel_api {
    proxy_set_header Host $hml_base_url;
    proxy_pass https://$hml_base_url/api/marvel$1?args;  # ← homolog
}
```

This allows a developer to run only the service they are working on locally (e.g., `docker-compose up auth_api marvel_api`) while the remaining services are transparently served from the staging environment.

## Docker networking

All containers share the `monorepo_network` Docker bridge network. Docker's embedded DNS resolver (`127.0.0.11`) allows containers to reach each other by service name (e.g., `auth_api`, `marvel_api`). This is why `TOKEN_VERIFY_SVC=http://auth_api:3000/auth` works inside the network but must be changed to `http://localhost:3000/auth` when running services outside Docker.

## Design decisions

| Decision | Rationale |
|---|---|
| No root `package.json` | Each service deploys independently; shared dependencies would couple release cycles |
| In-memory user store (no DB) | This is a demonstration project focused on architecture, not production persistence |
| Static hero arrays (no DB) | Same reason — the data layer is intentionally trivial to keep focus on the infra pattern |
| No cross-service imports | Shared code must be published as a versioned npm package; direct imports create hidden coupling |
| Path-scoped CI workflows | Only the pipeline for the changed service runs on each push, enabling truly independent deployments |
| NGINX as gateway | Avoids adding a NestJS gateway service that would need its own auth and routing logic; NGINX handles this declaratively |

## Debug ports

| Service | App port | Debug port (host) |
|---|---|---|
| auth_api | 3000 | 9229 |
| marvel_api | 3001 | 9230 |
| dc_api | 3002 | 9231 |

VSCode attach configurations are in `.vscode/launch.json`.

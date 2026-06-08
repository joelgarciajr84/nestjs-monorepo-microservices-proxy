# NestJS Monorepo — Independent Microservices with NGINX Proxy & Homolog Fallback

[![Auth API](https://github.com/joelgarciajr84/nestjs-monorepo-microservices-proxy/actions/workflows/docker-image-auth_api.yml/badge.svg)](https://github.com/joelgarciajr84/nestjs-monorepo-microservices-proxy/actions/workflows/docker-image-auth_api.yml)
[![Marvel API](https://github.com/joelgarciajr84/nestjs-monorepo-microservices-proxy/actions/workflows/docker-image-marvel_api.yml/badge.svg)](https://github.com/joelgarciajr84/nestjs-monorepo-microservices-proxy/actions/workflows/docker-image-marvel_api.yml)
[![DC API](https://github.com/joelgarciajr84/nestjs-monorepo-microservices-proxy/actions/workflows/docker-image-dc_api.yml/badge.svg)](https://github.com/joelgarciajr84/nestjs-monorepo-microservices-proxy/actions/workflows/docker-image-dc_api.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://choosealicense.com/licenses/mit/)

> A reference implementation showing how to run multiple independent NestJS APIs in a single repository — with **no monorepo framework lock-in** — using Docker, NGINX reverse proxy, and per-service CI/CD pipelines.

The core idea: each service is fully independent (its own `package.json`, `node_modules`, Dockerfile, and CI pipeline). The NGINX gateway ties them together for local development and adds a **homolog fallback** so you can run only the service you are working on while the rest are transparently served from staging.

---

## Architecture

```
                      ┌─────────────────────────────────────┐
                      │          cockpit (NGINX)             │
  HTTP Client         │            port 8080                 │
  ─────────────►      │                                      │
                      │  /api/auth/*   → auth_api:3000       │
                      │  /api/marvel/* → marvel_api:3001     │
                      │  /api/DC/*     → dc_api:3002         │
                      │                                      │
                      │  If service is down (502)            │
                      │      → fallback to homolog URL       │
                      └──────────┬──────────────────────────┘
                                 │  monorepo_network (Docker bridge)
             ┌───────────────────┼──────────────┐
             ▼                   ▼              ▼
      ┌─────────────┐   ┌──────────────┐  ┌──────────┐
      │  auth_api   │   │  marvel_api  │  │  dc_api  │
      │  port 3000  │   │  port 3001   │  │ port 3002│
      └─────────────┘   └──────────────┘  └──────────┘
```

Marvel and DC services validate Bearer tokens by calling `auth_api` directly via HTTP. See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full request flow.

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) + [Docker Compose](https://docs.docker.com/compose/install/)
- Node.js 14+ (only needed for running services outside Docker)

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/joelgarciajr84/nestjs-monorepo-microservices-proxy

# 2. Set up environment variables
cp .env.example .env
# Edit .env and set a strong JWT_SECRET_KEY

# 3. Run all services
docker-compose up
```

Gateway is available at `http://localhost:8080`.

---

## Selective Startup

You only need to run the services you are actively working on. Missing services fall back to the homolog environment automatically.

```bash
# Auth + Marvel only
docker-compose up auth_api marvel_api

# Auth + DC only
docker-compose up auth_api dc_api

# Everything including the NGINX gateway
docker-compose up
```

---

## API Endpoints

All requests go through the NGINX gateway at `http://localhost:8080`.

| Method | Path | Auth required | Description |
|--------|------|:---:|---|
| `POST` | `/api/auth/signup` | No | Register a new user |
| `POST` | `/api/auth/signin` | No | Sign in and receive a JWT |
| `GET`  | `/api/auth/verify/:token` | No | Verify a JWT (used internally by other services) |
| `GET`  | `/api/marvel/hero/` | Bearer token | Returns a random Marvel superhero |
| `GET`  | `/api/DC/hero/` | Bearer token | Returns a random DC superhero |

**Swagger UI** is available on each service while running:
- Auth: `http://localhost:3000/api`
- Marvel: `http://localhost:3001/api`
- DC: `http://localhost:3002/api`

---

## Environment Variables

Copy `.env.example` to `.env` at the repo root. All services load this file.

| Variable | Used by | Description |
|---|---|---|
| `JWT_SECRET_KEY` | auth | Secret used to sign and verify JWTs |
| `JWT_EXPIRATION_TIME` | auth | Token TTL, e.g. `3600s` or `1d` |
| `TOKEN_VERIFY_SVC` | marvel, dc | Base URL of auth service, e.g. `http://auth_api:3000/auth` |

---

## Development (without Docker)

Commands are run inside each service directory:

```bash
cd src/packages/auth   # or marvel, dc

npm run start:dev      # watch mode
npm run start:debug    # watch + debugger on 0.0.0.0:9229
npm run test           # unit tests
npm run test:e2e       # end-to-end tests
npm run lint           # ESLint with auto-fix
```

When running outside Docker, set `TOKEN_VERIFY_SVC=http://localhost:3000/auth` in your `.env`.

---

## NGINX Homolog Fallback

When a service container is down, NGINX returns a 502, which triggers a transparent redirect to the homologation environment — the client never sees the error.

```nginx
location ~ ^/api/auth(/?.*)$ {
    proxy_pass http://auth_api:3000/auth$1?args;
    error_page 502 = @fallback_auth_api;
}

location @fallback_auth_api {
    proxy_set_header Host $hml_base_url;
    proxy_pass https://$hml_base_url/api/auth$1?args;
}
```

Configure the fallback URL in `src/packages/cockpit/nginx.conf` by editing the `$hml_base_url` map.

---

## Shared Code

Microservices must not import directly from each other. Shared logic belongs in **scoped npm packages** published to a private registry such as [Azure Artifacts](https://docs.microsoft.com/en-us/azure/devops/artifacts/get-started-npm). This keeps each container lightweight and each service independently testable and deployable.

---

## Independent CI/CD Pipelines

Each service has its own GitHub Actions workflow triggered only when its source files change:

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'src/packages/auth/**'   # only fires when auth changes
```

| Service | Workflow file | Docker image |
|---|---|---|
| auth_api | `docker-image-auth_api.yml` | `monorepo_auth:<timestamp>` |
| marvel_api | `docker-image-marvel_api.yml` | `monorepo_marvel:<timestamp>` |
| dc_api | `docker-image-dc_api.yml` | `monorepo_dc:<timestamp>` |

This means pushing a change to `marvel_api` only triggers the Marvel build — auth and DC pipelines stay silent.

![CI pipelines screenshot](https://i.postimg.cc/zBVKsznz/2022-02-23-21-03.png)

---

## Debugging with VSCode

Run a service in debug mode:

```bash
cd src/packages/marvel
npm run start:debug   # listens on 0.0.0.0:9229
```

Or via Docker Compose (debug mode is the default `command` in `docker-compose.yml`):

```bash
docker-compose up marvel_api
```

Then attach VSCode using the configurations in `.vscode/launch.json`:

| Configuration | Port |
|---|---|
| Debug MARVEL_API | 9230 |
| Debug AUTH_API | 9229 |
| Debug DC_API | 9231 |

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to add a new service and the branch/PR conventions.

## License

[MIT](https://choosealicense.com/licenses/mit/)

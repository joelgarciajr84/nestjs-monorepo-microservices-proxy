# Contributing

## Service isolation rule

Services must **not** import code from each other. If logic needs to be shared, publish it as a scoped npm package to a private registry (e.g., Azure Artifacts) and install it as a regular dependency. This keeps containers lightweight and deployments independent.

## Adding a new microservice

Follow these steps to add a service (e.g., `star_wars_api` on port 3003):

1. **Create the service** under `src/packages/star_wars/` using NestJS CLI or manually, mirroring the structure of `marvel/` or `dc/`.

2. **Add a Dockerfile** at the repo root (e.g., `Dockerfile.StarWars`), copying the pattern from `Dockerfile.Marvel`.

3. **Register in `docker-compose.yml`**:
   ```yaml
   star_wars_api:
     container_name: star_wars_api
     build:
       context: ./
       dockerfile: ./Dockerfile.StarWars
     volumes:
       - ./src/packages/star_wars/:/usr/src/app/
     networks:
       - monorepo_network
     ports:
       - 3003:3003
       - 9232:9229
     command: npm run start:debug
   ```

4. **Add NGINX routing** in `src/packages/cockpit/nginx.conf`:
   ```nginx
   location ~ ^/api/star_wars(/?.*)$ {
       proxy_pass http://star_wars_api:3003/star_wars$1?args;
       error_page 502 = @fallback_star_wars_api;
   }
   location @fallback_star_wars_api {
       proxy_set_header Host $hml_base_url;
       proxy_pass https://$hml_base_url/api/star_wars$1?args;
   }
   ```

5. **Add a GitHub Actions workflow** at `.github/workflows/docker-image-star_wars_api.yml`, using an existing workflow as template and adjusting the `paths` filter and Docker tag.

6. **Add a VSCode debug config** in `.vscode/launch.json` for the new debug port.

## Running tests

Tests are run **inside each service directory**:

```bash
cd src/packages/<service>
npm test           # unit tests
npm run test:e2e   # end-to-end tests
npm run test:cov   # coverage report
```

## Branch and PR conventions

| Type | Prefix | Example |
|---|---|---|
| New feature | `feature/` | `feature/add-star-wars-api` |
| Bug fix | `fix/` | `fix/auth-guard-error-handling` |
| Documentation | `docs/` | `docs/improve-readme` |
| Refactor | `refactor/` | `refactor/dc-service-cleanup` |

Open PRs against `main`. Each service has a path-scoped CI workflow, so only the pipeline relevant to your changes will trigger.

# One App Service (Docker Compose) — UI + API

## What you deploy

One Azure Web App using [`azure/docker-compose.appservice.yml`](docker-compose.appservice.yml):

| Service | Image | Role |
|---------|-------|------|
| `web` | `projectsag/project-loop` | nginx UI + reverse proxy |
| `backend` | `projectsag/project-loop-backend` | NestJS API (internal) |

Browser uses **one URL**. nginx proxies `/meeting`, `/video`, `/notifications`, `/api` to backend.

LiveKit is **not** in this compose (Hostinger VPS later).

## 1. Build and push images

```powershell
# Optional: set DOCKERHUB_USER=yourhubuser in azure/.env.azure
.\azure\rebuild-one-app.ps1
```

## 2. Portal — create one Web App (container)

1. Create **Web App**
2. Publish: **Docker Container** → **Docker Compose**
3. OS: **Linux**, plan **B1+**
4. Resource group: `vba_group` (or your active RG)
5. Paste / upload [`docker-compose.appservice.yml`](docker-compose.appservice.yml)
6. Images must be `projectsag/project-loop` and `projectsag/project-loop-backend` (already in compose)
7. App setting (optional): `WEBSITES_PORT` = `80`
8. Save → wait for pull → open `https://<app>.azurewebsites.net`
9. Swagger: `https://<app>.azurewebsites.net/api`

## 3. After app name is known

Update `CORS_ORIGINS` in the compose `backend` environment (or App Settings override) to your real `https://<app>.azurewebsites.net`, then restart.

## Local test (same pattern)

```bash
docker compose up --build
```

Open http://localhost:8080

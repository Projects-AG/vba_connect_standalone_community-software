# Backend deploy — Azure VM Scale Set (`loop`)

Deploy NestJS as a Docker container to the **loop** Flexible VMSS in South India, with GitHub Actions CI/CD.

Public IP (scale set overview): `20.41.248.216` — confirm in Azure if it changes.

## One-time Azure setup

### 1. Networking

In the **loop** scale set → **Networking**:

- Allow inbound **22** (SSH) from your IP (or GitHub Actions — prefer IP allowlist / jump host later).
- Allow inbound **3000** (or **80** if you terminate HTTP on a load balancer) from the internet / your clients.
- If a load balancer is attached, add a frontend rule: public port → backend pool port **3000**.

### 2. Scale (cost)

For early use, set **instance count = 1** under the scale set capacity. You can raise it later; the workflow deploys to every host in `VM_HOSTS`.

### 3. Per-instance bootstrap (SSH once each)

From **Instances**, connect to each VM:

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# log out / back in so docker works without sudo

sudo mkdir -p /opt/vba-backend
sudo tee /opt/vba-backend/.env >/dev/null <<'EOF'
PORT=3000
LIVEKIT_HOST=https://your-livekit-host
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
CORS_ORIGINS=https://your-frontend-origin
EOF
sudo chown $USER:$USER /opt/vba-backend/.env
chmod 600 /opt/vba-backend/.env
```

Use your real LiveKit cloud values (not local `localhost:7880`) on the VM.

### 4. Find SSH targets

Flexible VMSS instances often have their own public IPs. Use those in `VM_HOSTS`, not only the scale-set overview IP (that IP may be LB-only).

```text
VM_HOSTS=10.0.0.1,10.0.0.2   # example — use real public IPs
```

If only one instance: `VM_HOSTS=x.x.x.x`.

## GitHub secrets

Repo → **Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|--------|---------|
| `VM_HOSTS` | Comma-separated SSH hosts (instance public IPs) |
| `VM_USER` | Linux username (e.g. `azureuser`) |
| `VM_SSH_KEY` | Private SSH key (PEM) that can log into those VMs |
| `GHCR_READ_TOKEN` | PAT with `read:packages` so VMs can `docker pull` private GHCR images |

`GITHUB_TOKEN` is used automatically to **push** images to GHCR. VMs need `GHCR_READ_TOKEN` to pull.

Optional: make the GHCR package public (Package settings → Change visibility) and you can skip `GHCR_READ_TOKEN` / `docker login` on the VM — then remove the login line from the workflow deploy step.

## CI/CD flow

1. Push changes under `backend/` to `main` or `feature/loop-ui` (or run **workflow_dispatch**).
2. Job **build-and-push** builds `backend/Dockerfile` and pushes:
   - `ghcr.io/<owner-lowercase>/vba-backend:latest`
   - `ghcr.io/<owner-lowercase>/vba-backend:<git-sha>`
3. Job **deploy** SSHs to each host in `VM_HOSTS`, runs `backend/scripts/remote-deploy.sh`, which pulls and restarts container `vba-backend` on port **3000**.

If `VM_HOSTS` / `VM_SSH_KEY` are missing, deploy is skipped and only the image is published.

## Manual smoke test

```bash
curl http://<public-or-lb-ip>:3000/
# expect hello from AppController

# Swagger
open http://<public-or-lb-ip>:3000/api
```

## Local image test

```bash
cd backend
docker build -t vba-backend:local .
docker run --rm -p 3000:3000 --env-file .env vba-backend:local
```

## Files

| Path | Role |
|------|------|
| `backend/Dockerfile` | Multi-stage Nest production image |
| `backend/scripts/remote-deploy.sh` | Pull + restart container on a VM |
| `.github/workflows/deploy-backend.yml` | Build → GHCR → SSH deploy |

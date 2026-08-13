# Hostinger KVM2 — full-stack deploy (Loop)

Deploy **frontend (nginx) + backend (NestJS) + MySQL + LiveKit** on one VPS.

| Phase | Goal |
|-------|------|
| **1 (now)** | Production stack on **public IP** (`http://` / `ws://`) |
| **2 (later)** | Domain + HTTPS / `wss://` |

## Architecture

```
Browser ──http://VPS_IP:80──► web (nginx SPA + API proxy)
Browser ──ws://VPS_IP:7880──► livekit
web ──► backend:8080 ──► mysql
backend ──► livekit:7880
```

Files in this folder:

| File | Purpose |
|------|---------|
| [docker-compose.prod.yml](docker-compose.prod.yml) | Production services |
| [.env.prod.example](.env.prod.example) | Secrets template → copy to `.env.prod` |
| [livekit.prod.yaml.example](livekit.prod.yaml.example) | LiveKit template → copy to `livekit.prod.yaml` (gitignored) |
| [backup-mysql.sh](backup-mysql.sh) | Daily DB dump helper |
| [vps-update.sh](vps-update.sh) | `git pull` + rebuild (used by GitHub Actions too) |

---

## Phase 1 — IP launch (Hostinger KVM2)

### 1. VPS prep

1. Create Ubuntu **22.04** or **24.04** KVM2 VPS.
2. Note the **public IP**.
3. SSH in as root (or sudo user).

Install Docker:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker "$USER"
# log out / in so docker group applies
```

Firewall (UFW):

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 7880:7881/tcp
sudo ufw allow 50000:50020/udp
sudo ufw enable
sudo ufw status
```

Do **not** open MySQL `3306` to the internet.

### 2. Clone and configure

```bash
sudo mkdir -p /opt/loop
sudo chown "$USER":"$USER" /opt/loop
cd /opt/loop
git clone <YOUR_REPO_URL> .
# or scp/rsync the project onto the VPS

cp deploy/.env.prod.example deploy/.env.prod
cp deploy/livekit.prod.yaml.example deploy/livekit.prod.yaml
nano deploy/.env.prod
nano deploy/livekit.prod.yaml
```

Generate secrets:

```bash
openssl rand -hex 16   # LIVEKIT_API_KEY
openssl rand -hex 32   # LIVEKIT_API_SECRET and JWT_SECRET / DB passwords
```

In `deploy/.env.prod` set at least:

- `PUBLIC_HOST=<VPS_PUBLIC_IP>`
- `VITE_LIVEKIT_URL=ws://<VPS_PUBLIC_IP>:7880`
- `CORS_ORIGINS=http://<VPS_PUBLIC_IP>`
- `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` / `JWT_SECRET` / DB passwords

In `deploy/livekit.prod.yaml`, set the **same** key/secret under `keys:`:

```yaml
keys:
  <LIVEKIT_API_KEY>: <LIVEKIT_API_SECRET>
```

### 3. Build and start

From **repo root** (`/opt/loop`):

```bash
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod up -d --build
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod ps
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod logs -f --tail=100
```

### 4. Smoke checks

- UI: `http://<VPS_PUBLIC_IP>/`
- Swagger: `http://<VPS_PUBLIC_IP>/api`
- Register two users → Chat → **Call** / **Video** → confirm LiveKit connects

### 5. After first successful boot

1. Set `DB_SYNC=false` in `deploy/.env.prod`
2. Recreate backend only:

```bash
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod up -d backend
```

### 6. MySQL backups

```bash
chmod +x deploy/backup-mysql.sh
./deploy/backup-mysql.sh
```

Cron (daily 02:15 UTC):

```bash
crontab -e
# add:
15 2 * * * cd /opt/loop && ./deploy/backup-mysql.sh >> /var/log/loop-mysql-backup.log 2>&1
```

### 7. Hardening checklist (Phase 1)

- [ ] Strong unique secrets (never leave `CHANGE_ME_*` or local `devkey`)
- [ ] UFW rules as above; MySQL not published
- [ ] `restart: unless-stopped` (already in compose)
- [ ] `DB_SYNC=false` after schema is stable
- [ ] Optional: Fail2ban for SSH
- [ ] Optional: disable password SSH; use keys only

**IP-only note:** browsers prefer HTTPS for camera/mic. Some browsers allow media on `http://IP`; treat **Phase 2** as required for polished production calls.

---

## Phase 2 — Domain + TLS (when ready)

1. Point DNS `A` record for `app.example.com` (and optionally `calls.example.com`) → VPS IP.
2. Install Caddy or Certbot + nginx for **HTTPS on :443**.
3. Rebuild frontend with:

   `VITE_LIVEKIT_URL=wss://calls.example.com`  
   (or same host if LiveKit is reverse-proxied with TLS)

4. Terminate TLS for LiveKit (Caddy reverse proxy to `:7880` or LiveKit TLS config).
5. Update:

   - `CORS_ORIGINS=https://app.example.com`
   - Redirect HTTP → HTTPS

6. Redeploy:

```bash
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod up -d --build
```

---

## Useful commands

```bash
# Status
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod ps

# Logs
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod logs -f backend web livekit mysql

# Stop
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod down

# Rebuild after git pull (keeps .env.prod and livekit.prod.yaml)
bash deploy/vps-update.sh
```

---

## CI/CD (GitHub Actions)

| Workflow | When | What |
|----------|------|------|
| [ci.yml](../.github/workflows/ci.yml) | Push/PR; deploy on `main` after CI is green | Build + test; then SSH rebuild on the VPS |
| [deploy-vps.yml](../.github/workflows/deploy-vps.yml) | **Actions → Deploy VPS → Run workflow** | Manual deploy (same SSH rebuild) |

Secrets on the VPS (`deploy/.env.prod`, `deploy/livekit.prod.yaml`) are **backed up and restored** on each deploy so `git reset` does not wipe them.

### 1. Deploy SSH key (on your PC)

```powershell
ssh-keygen -t ed25519 -C "github-actions-loop-deploy" -f $HOME\.ssh\loop-deploy-key -N ""
```

Copy the **public** key to the VPS:

```powershell
type $HOME\.ssh\loop-deploy-key.pub
```

On the VPS:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys   # paste the .pub line, save
chmod 600 ~/.ssh/authorized_keys
```

### 2. GitHub secrets

Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret | Value |
|--------|--------|
| `VPS_HOST` | VPS public IP (e.g. `200.234.34.73`) |
| `VPS_USER` | `root` (or your sudo user) |
| `VPS_SSH_PRIVATE_KEY` | Full contents of `loop-deploy-key` (**private** file, including `BEGIN`/`END` lines) |

Do **not** add `.env.prod` or LiveKit keys to GitHub. They stay on the VPS.

### 3. First deploy after this lands

1. Add the three secrets.
2. Push to `main` (or **Actions** → **Deploy VPS** → **Run workflow**).
3. Watch **Actions** until it is green, then open `http://<VPS_IP>/`.

If SSH fails: confirm `authorized_keys`, UFW allows **22/tcp**, and the private key secret has no extra quotes.

## Troubleshooting

| Symptom | Check |
|---------|--------|
| UI loads, API 502 | `docker compose ... logs backend`; MySQL healthy? |
| Calls fail to connect | `VITE_LIVEKIT_URL` baked at **build** time; rebuild `web` after changing it; UDP 50000–50020 open; LiveKit keys match yaml |
| Blank login after rebuild | Hard-refresh browser; confirm nginx serves `/` |
| CORS errors | `CORS_ORIGINS` must match exact browser origin (`http://IP` not `https`) |

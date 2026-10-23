#!/usr/bin/env bash
# Run ON THE VM as root: sudo bash gcp-vm-bootstrap.sh
# Installs Docker, mounts the data disk, clones the repo, and prints next steps.
set -euo pipefail

echo "=== 1. Install Docker ==="
apt-get update
apt-get install -y ca-certificates curl gnupg git
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker
usermod -aG docker "${SUDO_USER:-ubuntu}"

echo "=== 2. Mount data disk ==="
DATA_DISK=$(lsblk -dpno NAME,TYPE | awk '$2=="disk" && $1!~/sda/ {print $1; exit}')
if [ -z "$DATA_DISK" ]; then
  echo "No secondary disk found; skipping mount."
else
  if ! blkid "$DATA_DISK" | grep -q ext4; then
    mkfs.ext4 -F "$DATA_DISK"
  fi
  mkdir -p /srv
  if ! grep -q "$DATA_DISK" /etc/fstab; then
    echo "$DATA_DISK /srv ext4 defaults 0 2" >> /etc/fstab
  fi
  mount -a
  mkdir -p /srv/recordings /srv/meetnote /srv/mysql /srv/backups
  chown -R 1000:1000 /srv 2>/dev/null || true
fi

echo "=== 3. Clone repo ==="
APP_DIR=/opt/loop
if [ ! -d "$APP_DIR/.git" ]; then
  git clone --branch sakshi https://github.com/Projects-AG/vba_connect_standalone_community-software.git "$APP_DIR" 2>/dev/null || true
  # The integrated repo (Loop root) also contains MeetNote; if the clone above
  # is the standalone repo only, ensure MeetNote is present.
  if [ ! -d "$APP_DIR/MeetNote" ]; then
    echo "NOTE: MeetNote directory not found in clone. Place the full Loop repo at $APP_DIR."
  fi
fi
chown -R "${SUDO_USER:-ubuntu}:${SUDO_USER:-ubuntu}" "$APP_DIR"

echo "=== 4. Done ==="
cat <<'EOF'
Next:
  cd /opt/loop/vba_connect_standalone_community-software/deploy
  cp .env.gcp.example .env.gcp
  cp livekit.prod.yaml.example livekit.prod.yaml
  # edit both files with your domains/secrets
  nano .env.gcp
  nano livekit.prod.yaml
  # first boot
  docker compose -f docker-compose.gcp.yml --env-file .env.gcp up -d --build
EOF

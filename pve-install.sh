#!/usr/bin/env bash
# DeepNotes LXC Installer for Proxmox VE
# Usage: bash -c "$(wget -qLO - https://raw.githubusercontent.com/Emilien-Etadam/DeepNotes/dev/pve-install.sh)"

set -euo pipefail

APP="DeepNotes"
REPO="https://github.com/Emilien-Etadam/DeepNotes.git"
BRANCH="dev"

# ─── Colors ───
RD="\033[01;31m"
GN="\033[01;32m"
YW="\033[01;33m"
BL="\033[01;34m"
CL="\033[m"

function msg_info() { echo -e "${BL}[info]${CL} $1"; }
function msg_ok()   { echo -e "${GN}[ok]${CL} $1"; }
function msg_error(){ echo -e "${RD}[error]${CL} $1"; }

# ─── Checks ───
if [[ $(id -u) -ne 0 ]]; then
  msg_error "Run this script as root from the Proxmox VE shell."
  exit 1
fi

if ! command -v pct &>/dev/null; then
  msg_error "pct not found. This script must run on a Proxmox VE host."
  exit 1
fi

echo -e "\n${GN}╔═══════════════════════════════════════════╗${CL}"
echo -e "${GN}║         DeepNotes LXC Installer           ║${CL}"
echo -e "${GN}║   Encrypted Infinite Canvas Note-Taking   ║${CL}"
echo -e "${GN}╚═══════════════════════════════════════════╝${CL}\n"

# ─── Configuration ───
DEFAULT_CTID=$(pvesh get /cluster/nextid 2>/dev/null || echo 100)
read -rp "Container ID [${DEFAULT_CTID}]: " CTID
CTID=${CTID:-$DEFAULT_CTID}

read -rp "Hostname [deepnotes]: " CT_HOSTNAME
CT_HOSTNAME=${CT_HOSTNAME:-deepnotes}

read -rp "Disk size in GB [10]: " DISK_SIZE
DISK_SIZE=${DISK_SIZE:-10}

read -rp "CPU cores [2]: " CPU_CORES
CPU_CORES=${CPU_CORES:-2}

read -rp "RAM in MB [2048]: " RAM
RAM=${RAM:-2048}

# Storage selection
msg_info "Available storages:"
pvesm status -content rootdir 2>/dev/null | awk 'NR>1 {print "  " $1}'
read -rp "Storage [local-lvm]: " STORAGE
STORAGE=${STORAGE:-local-lvm}

# Network
read -rp "Bridge [vmbr0]: " BRIDGE
BRIDGE=${BRIDGE:-vmbr0}

read -rp "IP address (CIDR) or 'dhcp' [dhcp]: " IP_ADDR
IP_ADDR=${IP_ADDR:-dhcp}

if [[ "$IP_ADDR" != "dhcp" ]]; then
  read -rp "Gateway: " GATEWAY
  NET_CONF="name=eth0,bridge=${BRIDGE},ip=${IP_ADDR},gw=${GATEWAY}"
else
  NET_CONF="name=eth0,bridge=${BRIDGE},ip=dhcp"
fi

# App URL
read -rp "Public URL (e.g., https://notes.example.com) [http://localhost]: " APP_URL
APP_URL=${APP_URL:-http://localhost}

# ─── Download template ───
TEMPLATE="debian-12-standard_12.7-1_amd64.tar.zst"
TEMPLATE_STORAGE="local"

if ! pveam list "$TEMPLATE_STORAGE" 2>/dev/null | grep -q "$TEMPLATE"; then
  msg_info "Downloading Debian 12 template..."
  pveam download "$TEMPLATE_STORAGE" "$TEMPLATE"
  msg_ok "Template downloaded"
else
  msg_ok "Template already available"
fi

# ─── Summary ───
echo ""
echo -e "${YW}─── Configuration Summary ───${CL}"
echo -e "  CTID:      ${GN}${CTID}${CL}"
echo -e "  Hostname:  ${GN}${CT_HOSTNAME}${CL}"
echo -e "  CPU:       ${GN}${CPU_CORES} cores${CL}"
echo -e "  RAM:       ${GN}${RAM} MB${CL}"
echo -e "  Disk:      ${GN}${DISK_SIZE} GB${CL}"
echo -e "  Storage:   ${GN}${STORAGE}${CL}"
echo -e "  Network:   ${GN}${NET_CONF}${CL}"
echo -e "  App URL:   ${GN}${APP_URL}${CL}"
echo ""

read -rp "Create container and install DeepNotes? [y/N]: " CONFIRM
if [[ ! "${CONFIRM,,}" =~ ^(y|yes)$ ]]; then
  msg_info "Cancelled."
  exit 0
fi

# ─── Create LXC ───
msg_info "Creating LXC container ${CTID}..."

pct create "$CTID" "${TEMPLATE_STORAGE}:vztmpl/${TEMPLATE}" \
  --hostname "$CT_HOSTNAME" \
  --cores "$CPU_CORES" \
  --memory "$RAM" \
  --rootfs "${STORAGE}:${DISK_SIZE}" \
  --net0 "$NET_CONF" \
  --ostype debian \
  --unprivileged 1 \
  --features nesting=1,keyctl=1 \
  --onboot 1 \
  --start 0

msg_ok "Container ${CTID} created"

# ─── Enable nesting (required for Docker-in-LXC) ───
msg_info "Starting container..."
pct start "$CTID"

# Wait for container to boot
sleep 5
for i in $(seq 1 30); do
  if pct exec "$CTID" -- test -f /etc/os-release 2>/dev/null; then
    break
  fi
  sleep 2
done

msg_ok "Container running"

# ─── Upload and run install script ───
msg_info "Running install script inside container..."

pct exec "$CTID" -- bash -c "
export DEBIAN_FRONTEND=noninteractive
export APP_URL='${APP_URL}'
export REPO='${REPO}'
export BRANCH='${BRANCH}'

$(cat << 'INSTALL_EOF'

set -euo pipefail

RD='\033[01;31m'
GN='\033[01;32m'
BL='\033[01;34m'
CL='\033[m'
msg_info() { echo -e \"\${BL}[info]\${CL} \$1\"; }
msg_ok()   { echo -e \"\${GN}[ok]\${CL} \$1\"; }
msg_error(){ echo -e \"\${RD}[error]\${CL} \$1\"; }

# ── System update ──
msg_info 'Updating system...'
apt-get update -qq
apt-get upgrade -y -qq
msg_ok 'System updated'

# ── Install dependencies ──
msg_info 'Installing dependencies (curl, git, ca-certificates)...'
apt-get install -y -qq curl git ca-certificates gnupg lsb-release
msg_ok 'Dependencies installed'

# ── Install Docker ──
msg_info 'Installing Docker...'
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
apt-get update -qq
apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin docker-buildx-plugin
systemctl enable --now docker
msg_ok 'Docker installed'

# ── Clone repo ──
msg_info "Cloning DeepNotes (${BRANCH})..."
git clone --branch "${BRANCH}" --depth 1 "${REPO}" /opt/deepnotes
cd /opt/deepnotes
msg_ok 'Repository cloned'

# ── Generate secrets ──
msg_info 'Generating .env with secure secrets...'
cp template.env .env

generate_secret() { openssl rand -hex 32; }
generate_b64_key() { openssl rand -base64 32; }

sed -i "s|DEV=true|DEV=false|" .env
sed -i "s|CLIENT_APP_URL=.*|CLIENT_APP_URL=${APP_URL}|" .env
sed -i "s|access_token_secret_here|$(generate_secret)|" .env
sed -i "s|refresh_token_secret_here|$(generate_secret)|" .env
sed -i "s|email_secret_here|$(generate_secret)|" .env
sed -i "s|postgres_password_here|$(generate_secret)|g" .env
sed -i "s|keydb_password_here|$(generate_secret)|" .env

# Replace all base64 encryption keys
for key in USER_EMAIL_ENCRYPTION_KEY USER_REHASHED_LOGIN_HASH_ENCRYPTION_KEY USER_AUTHENTICATOR_SECRET_ENCRYPTION_KEY USER_RECOVERY_CODES_ENCRYPTION_KEY GROUP_REHASHED_PASSWORD_HASH_ENCRYPTION_KEY; do
  NEW_KEY=$(generate_b64_key)
  sed -i "s|${key}=\"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=\"|${key}=\"${NEW_KEY}\"|" .env
done

# Also update docker-compose postgres password to match
POSTGRES_PW=$(grep '^POSTGRES_PASSWORD=' .env | head -1 | cut -d'"' -f2)
sed -i "s|POSTGRES_PASSWORD: postgres_password_here|POSTGRES_PASSWORD: ${POSTGRES_PW}|" docker-compose.yml

# Remove host port bindings for postgres and keydb (internal only)
sed -i "/ports:/,/volumes:/{/- '5432:5432'/d}" docker-compose.yml
sed -i "/ports:/,/volumes:/{/- '6379:6379'/d}" docker-compose.yml

msg_ok '.env generated with unique secrets'

# ── Build and start ──
msg_info 'Building DeepNotes (this may take 5-10 minutes)...'
docker compose up -d --build
msg_ok 'DeepNotes is running'

# ── Version tracking ──
echo "$(git rev-parse --short HEAD)" > /opt/deepnotes/.version

msg_ok 'Installation complete'

INSTALL_EOF
"

msg_ok "DeepNotes installed inside container ${CTID}"

# ─── Get container IP ───
sleep 3
CT_IP=$(pct exec "$CTID" -- hostname -I 2>/dev/null | awk '{print $1}')

# ─── Set container description ───
pct set "$CTID" --description "DeepNotes - Encrypted Infinite Canvas
URL: ${APP_URL}
Internal: http://${CT_IP:-unknown}:80
Repo: ${REPO} (${BRANCH})"

# ─── Done ───
echo ""
echo -e "${GN}╔═══════════════════════════════════════════╗${CL}"
echo -e "${GN}║       DeepNotes installed successfully    ║${CL}"
echo -e "${GN}╚═══════════════════════════════════════════╝${CL}"
echo ""
echo -e "  Container ID:  ${GN}${CTID}${CL}"
echo -e "  Internal URL:  ${GN}http://${CT_IP:-<pending>}:80${CL}"
echo -e "  Public URL:    ${GN}${APP_URL}${CL}"
echo ""
echo -e "  ${YW}Next steps:${CL}"
echo -e "  1. Point your reverse proxy (NPM) to ${GN}http://${CT_IP:-<IP>}:80${CL}"
echo -e "  2. Enable SSL via Let's Encrypt in NPM"
echo -e "  3. Open ${APP_URL} and create your account"
echo ""
echo -e "  ${YW}Management:${CL}"
echo -e "  pct enter ${CTID}"
echo -e "  cd /opt/deepnotes && docker compose logs -f"
echo ""

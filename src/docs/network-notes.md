# Home Network & Homelab Documentation

> 📄 This is an **example file** to illustrate how this document is intended to be used.
> Replace all values with your own. Do not commit real credentials, API keys, or sensitive IPs.

---

## Overview

Remote access is handled via **WireGuard VPN** running on the Raspberry Pi. A **Pi-hole** instance provides network-wide ad blocking and local DNS. All services are reverse-proxied through **Caddy**.

---

## Network Topology

```
Devices (LAN 10.0.0.0/24)
    └── Router/Firewall (10.0.0.1) — running OpenWRT
        └── Modem (WAN: 203.0.113.x)
            └── ISP
```

---

## Key Devices

| Device | Hostname | Local IP | Notes |
|---|---|---|---|
| Home Server | `homeserver.local` | `10.0.0.2` | Main compute, Docker host |
| Raspberry Pi | `pi.local` | `10.0.0.3` | Pi-hole, WireGuard |
| NAS | `nas.local` | `10.0.0.4` | Synology DS923+ |
| Router | — | `10.0.0.1` | OpenWRT |
| Work Laptop | `worklaptop.local` | DHCP | macOS |
| Desktop | `desktop.local` | `10.0.0.20` | Static lease via router |

---

## Router — OpenWRT

- **Admin UI:** `http://10.0.0.1` or `http://router.home`
- **SSH:** `ssh root@10.0.0.1`
- DHCP range: `10.0.0.100 – 10.0.0.200`
- Static leases configured for all key devices (by MAC address)

### Static Lease Example

In OpenWRT: Network → DHCP & DNS → Static Leases

| Hostname | MAC | IP |
|---|---|---|
| homeserver | `aa:bb:cc:dd:ee:01` | `10.0.0.2` |
| pi | `aa:bb:cc:dd:ee:02` | `10.0.0.3` |
| nas | `aa:bb:cc:dd:ee:03` | `10.0.0.4` |

---

## Pi-hole

- Running on Raspberry Pi 4 at `10.0.0.3`
- Version: Pi-hole FTL v6.x
- Web UI: `http://pihole.home` (proxied via Caddy)
- Upstream DNS: Quad9 (`9.9.9.9`, `149.112.112.112`)

### Router DNS Config

Router DHCP hands out `10.0.0.3` as the only DNS server so all devices use Pi-hole automatically.

### Local DNS Records

| Domain | IP |
|---|---|
| `pihole.home` | `10.0.0.3` |
| `homeserver.home` | `10.0.0.2` |
| `nas.home` | `10.0.0.4` |
| `jellyfin.home` | `10.0.0.2` |
| `vaultwarden.home` | `10.0.0.2` |

### Pi-hole Troubleshooting

```bash
# Check status
pihole status

# Restart FTL
sudo systemctl restart pihole-FTL

# Test resolution
nslookup jellyfin.home 10.0.0.3

# Update blocklists
pihole -g
```

---

## WireGuard VPN

Running on the Raspberry Pi, allows remote access to the full LAN.

- **Endpoint:** `203.0.113.55:51820`
- **VPN subnet:** `10.8.0.0/24`
- **Config location:** `/etc/wireguard/wg0.conf`

### Peer Table

| Device | VPN IP | Notes |
|---|---|---|
| Phone | `10.8.0.2` | Always-on |
| Work Laptop | `10.8.0.3` | On-demand |
| Tablet | `10.8.0.4` | On-demand |

### Useful Commands

```bash
# Check VPN status
sudo wg show

# Restart VPN
sudo systemctl restart wg-quick@wg0

# Add a new peer
sudo wg set wg0 peer <pubkey> allowed-ips 10.8.0.5/32
```

---

## Caddy Reverse Proxy

Caddy runs on the home server (`10.0.0.2`) on ports 80 and 443, handling TLS automatically via Let's Encrypt for internal `.home` domains using DNS challenge.

- **Config:** `/etc/caddy/Caddyfile`
- **Logs:** `journalctl -u caddy`

### Caddyfile Example

```caddyfile
pihole.home {
    reverse_proxy 10.0.0.3:8080
}

jellyfin.home {
    reverse_proxy localhost:8096
}

vaultwarden.home {
    reverse_proxy localhost:8200
}

nas.home {
    reverse_proxy 10.0.0.4:5000
}
```

### Caddy Commands

```bash
# Reload config (no downtime)
sudo systemctl reload caddy

# Check status
sudo systemctl status caddy

# Validate config
caddy validate --config /etc/caddy/Caddyfile
```

---

## Docker Services (Home Server)

All services run via Docker Compose on `10.0.0.2`. Compose files live in `~/services/`.

| Service | Container | Port | URL |
|---|---|---|---|
| Jellyfin | `jellyfin` | `8096` | `jellyfin.home` |
| Vaultwarden | `vaultwarden` | `8200` | `vaultwarden.home` |
| Uptime Kuma | `uptime-kuma` | `3001` | `status.home` |
| Portainer | `portainer` | `9000` | `portainer.home` |
| Actual Budget | `actual` | `5006` | `budget.home` |

### Common Docker Commands

```bash
# Start a service
cd ~/services/jellyfin && docker compose up -d

# View logs
docker logs -f jellyfin

# Update all images
docker compose pull && docker compose up -d

# Check all running containers
docker ps
```

---

## NAS — Synology DS923+

- **Admin UI:** `http://nas.home` or `http://10.0.0.4:5000`
- **SMB shares:** `\\nas.home\media`, `\\nas.home\backups`
- **SSH:** `ssh admin@10.0.0.4`

### Shares

| Share | Purpose |
|---|---|
| `media` | Jellyfin media library |
| `backups` | Server and device backups |
| `documents` | Family documents |
| `docker` | Docker volume mounts |

---

## Backups

| What | Method | Destination | Frequency |
|---|---|---|---|
| NAS data | Synology Hyper Backup | Backblaze B2 | Daily |
| Docker volumes | `~/scripts/backup-volumes.sh` | NAS `/backups` | Daily via cron |
| Pi config | `~/scripts/backup-pi.sh` | NAS `/backups` | Weekly |
| Router config | Manual export | NAS `/backups` | On change |

### Docker Volume Backup Script Location

```bash
~/scripts/backup-volumes.sh
```

---

## SSH Access

| Target | Command |
|---|---|
| Home Server | `ssh alice@10.0.0.2` |
| Raspberry Pi | `ssh alice@10.0.0.3` |
| NAS | `ssh admin@10.0.0.4` |
| Remote (via WireGuard) | Connect VPN first, then use LAN IPs |

---

## Useful One-Liners

```bash
# Check what's using a port
sudo lsof -i :8096

# Watch live network traffic on a device
sudo tcpdump -i eth0 host 10.0.0.20

# Check disk usage
df -h

# Check Pi temperature
vcgencmd measure_temp

# Check for throttling/undervoltage (0x0 = healthy)
vcgencmd get_throttled

# Find all devices on the LAN
nmap -sn 10.0.0.0/24
```

---

## Change Log

| Date | Change |
|---|---|
| 2024-01-15 | Initial setup |
| 2024-03-02 | Added Vaultwarden |
| 2024-06-10 | Migrated from nginx to Caddy |
| 2024-09-22 | Added Actual Budget |
| 2025-01-08 | Upgraded NAS drives to 8TB |

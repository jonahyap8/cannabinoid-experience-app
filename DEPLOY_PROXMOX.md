# Proxmox LXC: Static Site Host (nginx)

## Instructions for Claude Code

You are creating and configuring a general-purpose LXC container on a Proxmox server for hosting static websites via nginx. This container will serve multiple static sites over time — the first one being the Cannabinoid Experience App.

**Your scope:** Phases 1 and 2 only (create the LXC and configure nginx). Phase 3 (building and deploying the app files) is done locally by the user and is documented here for their reference.

Follow each phase sequentially. Verify each command succeeds before proceeding. If a command fails, diagnose and resolve before moving on.

### SSH Access Note

The `maint` user on this host lacks sudo privileges. All `pct` commands require root. Either:
- SSH as root directly: `ssh root@192.168.0.130`
- Or grant maint sudo for pct: `echo 'maint ALL=(root) NOPASSWD: /usr/sbin/pct' >> /etc/sudoers.d/maint` (run as root first)

### Connection Details

```
PROXMOX_HOST=192.168.0.130
PROXMOX_USER=root
CT_ID=203
CT_HOSTNAME=static-sites
CT_IP=192.168.0.51/24
CT_GATEWAY=192.168.0.1
CT_BRIDGE=vmbr0
CT_STORAGE=local-lvm
CT_TEMPLATE_STORAGE=local
CT_DNS=192.168.0.5
```

---

### Phase 1: Create the LXC Container

SSH into the Proxmox host, then:

```bash
# 1. Download Ubuntu 24.04 template if not already cached
pveam update
pveam download $CT_TEMPLATE_STORAGE ubuntu-24.04-standard_24.04-2_amd64.tar.zst

# If the exact filename above fails (version may differ), find it:
#   pveam available --section system | grep ubuntu-24.04
# and download the correct one.

# 2. Identify the template path
TEMPLATE=$(pveam list $CT_TEMPLATE_STORAGE | grep ubuntu-24.04 | awk '{print $1}' | head -1)
echo "Using template: $TEMPLATE"
# If TEMPLATE is empty, the download failed — troubleshoot before continuing.

# 3. Create the container
#    - 512MB RAM, 1 core, 8GB disk (room for multiple static sites)
#    - Unprivileged, nesting enabled, auto-start on boot
pct create $CT_ID $TEMPLATE \
  --hostname $CT_HOSTNAME \
  --memory 512 \
  --swap 256 \
  --cores 1 \
  --rootfs $CT_STORAGE:8 \
  --net0 name=eth0,bridge=$CT_BRIDGE,ip=$CT_IP,gw=$CT_GATEWAY \
  --nameserver $CT_DNS \
  --unprivileged 1 \
  --features nesting=1 \
  --onboot 1 \
  --start 0

# 4. Start and verify
pct start $CT_ID
sleep 5
pct status $CT_ID

# 5. Confirm networking is up inside the container
pct exec $CT_ID -- ping -c 2 1.1.1.1
```

---

### Phase 2: Install and Configure nginx

All commands run via `pct exec` from the Proxmox host (or `pct enter` for an interactive shell).

```bash
# 1. Update packages and install nginx
pct exec $CT_ID -- bash -c "apt update && apt upgrade -y && apt install -y nginx"

# 2. Create web root directories (one per site)
pct exec $CT_ID -- mkdir -p /var/www/strain-app

# 3. Write nginx config for the strain app
pct exec $CT_ID -- bash -c 'cat > /etc/nginx/sites-available/strain-app << '\''NGINX'\''
server {
    listen 80;
    listen [::]:80;
    server_name strain-app.local;

    root /var/www/strain-app;
    index index.html;

    # Next.js static export: try exact path, .html suffix, directory, then 404
    location / {
        try_files $uri $uri.html $uri/ /404.html;
    }

    # Aggressive caching for hashed static assets
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
NGINX'

# 4. Enable strain-app site, remove default
pct exec $CT_ID -- ln -sf /etc/nginx/sites-available/strain-app /etc/nginx/sites-enabled/strain-app
pct exec $CT_ID -- rm -f /etc/nginx/sites-enabled/default

# 5. Test config, enable and start nginx
pct exec $CT_ID -- nginx -t
pct exec $CT_ID -- systemctl enable nginx
pct exec $CT_ID -- systemctl restart nginx

# 6. Verify nginx is listening
pct exec $CT_ID -- systemctl status nginx --no-pager
pct exec $CT_ID -- curl -s -o /dev/null -w "%{http_code}" http://localhost/
# Will return 403 (no files yet) — that's expected and correct.
```

**Claude Code: your work is done here.** Report the container IP back to the user and confirm nginx is running. Phases 3 and 4 below are performed locally by the user.

---

### Phase 3: Build and Deploy (User Does This Locally)

On your Windows machine:

```powershell
# 1. Build the static export
cd C:\Projects\cannabinoid-experience-app
npm run build
# Produces an `out\` directory

# 2. Tar the output (use Git Bash, WSL, or install tar)
tar czf strain-app-build.tar.gz -C out .

# 3. Copy tarball to Proxmox host
scp strain-app-build.tar.gz root@192.168.0.130:/tmp/

# 4. SSH into Proxmox host and push files into the container
ssh root@192.168.0.130
CT_ID=203
pct exec $CT_ID -- rm -rf /var/www/strain-app/*
cat /tmp/strain-app-build.tar.gz | pct exec $CT_ID -- tar xzf - -C /var/www/strain-app
pct exec $CT_ID -- chown -R www-data:www-data /var/www/strain-app

# 5. Verify
pct exec $CT_ID -- ls /var/www/strain-app/
curl -s -o /dev/null -w "%{http_code}" http://192.168.0.51/
# Should return 200

# 6. Clean up
rm /tmp/strain-app-build.tar.gz
```

---

### Phase 4: Point Caddy at the Container

In your Caddy LXC, add a reverse proxy entry in your Caddyfile:

```
strains.home.arpa {
    import lan_rp
    reverse_proxy 192.168.0.51:80
}
```

Reload Caddy. The app will be accessible at `https://strains.home.arpa` via your LAN. Add a DNS rewrite in AdGuard (192.168.0.5) pointing `strains.home.arpa` to `192.168.0.50` (Caddy) if not already handled by a wildcard.

---

### Adding Future Static Sites

To add another site to this container:

1. Create the directory: `pct exec $CT_ID -- mkdir -p /var/www/new-app`

2. Add an nginx server block at `/etc/nginx/sites-available/new-app` with its own `server_name`

3. Symlink it: `ln -sf /etc/nginx/sites-available/new-app /etc/nginx/sites-enabled/new-app`

4. Reload nginx: `pct exec $CT_ID -- nginx -s reload`

5. Add a matching Caddy entry pointing at the same container IP

Each site is isolated by directory and server_name. Nginx routes based on the Host header that Caddy forwards.

---

### Updating the Strain App

One-liner from the Proxmox host after scp'ing a new tarball:

```bash
pct exec $CT_ID -- rm -rf /var/www/strain-app/* && \
cat /tmp/strain-app-build.tar.gz | pct exec $CT_ID -- tar xzf - -C /var/www/strain-app && \
pct exec $CT_ID -- chown -R www-data:www-data /var/www/strain-app
```

No nginx reload needed for static file changes.

---

### Troubleshooting

- **Container won't start**: Check `pct config $CT_ID` — common issues are IP conflicts or wrong storage pool
- **Can't ping from container**: Bridge or gateway misconfigured — verify `CT_BRIDGE` matches your Proxmox network setup
- **nginx 403**: Files exist but permissions are wrong → `chown -R www-data:www-data /var/www/strain-app`
- **nginx 404**: Files not deployed, or `try_files` path mismatch → check `ls /var/www/strain-app/` for `index.html`
- **Blank page in browser**: JS errors in console, likely a `basePath` issue if serving from a subpath
- **Can't reach from LAN**: Container firewall or Proxmox firewall blocking port 80

---

## Execution Log

### Date: 2026-02-12

**Executed by**: Claude Code
**Target**: Proxmox host at 192.168.0.130
**Container ID**: 203
**Result**: ✅ Success

#### Phase 1: LXC Container Creation

1. **Attempted template update**:
   ```bash
   ssh root@192.168.0.130 "pveam update"
   ```
   - Failed (update error logged to /var/log/pveam.log) - non-critical, proceeded with available templates

2. **Checked available Ubuntu 24.04 templates**:
   ```bash
   ssh root@192.168.0.130 "pveam available --section system | grep ubuntu-24.04"
   ```
   - Found: `ubuntu-24.04-standard_24.04-2_amd64.tar.zst`

3. **Verified local template cache**:
   ```bash
   ssh root@192.168.0.130 "pveam list local | grep ubuntu-24.04"
   ```
   - Template not found locally, download required

4. **⚠️ Issue Encountered: DNS Resolution Failure**
   ```bash
   ssh root@192.168.0.130 "pveam download local ubuntu-24.04-standard_24.04-2_amd64.tar.zst"
   ```
   - **Error**: `Temporary failure in name resolution` for download.proxmox.com
   - **Diagnosis**: `/etc/resolv.conf` was empty (only comment present)
   - **Root Cause**: NetworkManager generated empty resolv.conf, no nameserver configured

5. **Resolution: Fixed DNS Configuration**:
   ```bash
   ssh root@192.168.0.130 "ping -c 2 1.1.1.1"  # Verified internet connectivity
   ssh root@192.168.0.130 "nslookup download.proxmox.com 192.168.0.5"  # Verified DNS server works
   ssh root@192.168.0.130 "echo 'nameserver 192.168.0.5' >> /etc/resolv.conf"  # Added DNS server
   ```

6. **Template download (retry)**:
   ```bash
   ssh root@192.168.0.130 "pveam download local ubuntu-24.04-standard_24.04-2_amd64.tar.zst"
   ```
   - ✅ Success: Downloaded 135.03 MB in 28 seconds (~4.90 MB/s)
   - Checksum verified
   - Template path: `local:vztmpl/ubuntu-24.04-standard_24.04-2_amd64.tar.zst`

7. **Created LXC container**:
   ```bash
   ssh root@192.168.0.130 'pct create 203 local:vztmpl/ubuntu-24.04-standard_24.04-2_amd64.tar.zst \
     --hostname static-sites \
     --memory 512 \
     --swap 256 \
     --cores 1 \
     --rootfs local-lvm:8 \
     --net0 name=eth0,bridge=vmbr0,ip=192.168.0.51/24,gw=192.168.0.1 \
     --nameserver 192.168.0.5 \
     --unprivileged 1 \
     --features nesting=1 \
     --onboot 1 \
     --start 0'
   ```
   - ✅ Container created successfully
   - Warnings about thin pool space (non-critical)
   - SSH host keys generated
   - Container filesystem: 8GB (2,097,152 4k blocks)

8. **Started and verified container**:
   ```bash
   ssh root@192.168.0.130 "pct start 203 && sleep 5 && pct status 203"
   ```
   - ✅ Status: running

9. **Verified networking**:
   ```bash
   ssh root@192.168.0.130 "pct exec 203 -- ping -c 2 1.1.1.1"
   ```
   - ✅ Internet connectivity confirmed (2 packets transmitted, 0% loss)

#### Phase 2: nginx Installation and Configuration

1. **Updated packages and installed nginx**:
   ```bash
   ssh root@192.168.0.130 'pct exec 203 -- bash -c "apt update && apt upgrade -y && apt install -y nginx"'
   ```
   - ✅ Successfully installed nginx and dependencies
   - Minor locale warnings (non-critical)

2. **Created web root directory**:
   ```bash
   ssh root@192.168.0.130 "pct exec 203 -- mkdir -p /var/www/strain-app"
   ```
   - ✅ Directory created

3. **Created nginx site configuration**:
   ```bash
   ssh root@192.168.0.130 "pct exec 203 -- bash -c 'cat > /etc/nginx/sites-available/strain-app << \"NGINX\"
   [full nginx config with Next.js static export settings]
   NGINX
   '"
   ```
   - ✅ Configuration file created successfully

4. **Enabled site and removed default**:
   ```bash
   ssh root@192.168.0.130 "pct exec 203 -- ln -sf /etc/nginx/sites-available/strain-app /etc/nginx/sites-enabled/strain-app"
   ssh root@192.168.0.130 "pct exec 203 -- rm -f /etc/nginx/sites-enabled/default"
   ```
   - ✅ Symlink created, default removed

5. **Tested nginx configuration**:
   ```bash
   ssh root@192.168.0.130 "pct exec 203 -- nginx -t"
   ```
   - ✅ Configuration syntax OK, test successful

6. **Enabled and restarted nginx**:
   ```bash
   ssh root@192.168.0.130 "pct exec 203 -- systemctl enable nginx"
   ssh root@192.168.0.130 "pct exec 203 -- systemctl restart nginx"
   ```
   - ✅ nginx enabled for auto-start on boot
   - ✅ nginx service restarted successfully

7. **Verified nginx status**:
   ```bash
   ssh root@192.168.0.130 "pct exec 203 -- systemctl status nginx --no-pager"
   ```
   - ✅ Status: active (running)
   - PID: 6604 (master) + 6605 (worker)
   - Memory: 1.7M

8. **Installed curl (for testing)**:
   ```bash
   ssh root@192.168.0.130 "pct exec 203 -- apt install -y curl"
   ```
   - ✅ curl and dependencies installed

9. **Verified nginx response - localhost**:
   ```bash
   ssh root@192.168.0.130 "pct exec 203 -- curl -s -o /dev/null -w '%{http_code}' http://localhost/"
   ```
   - ✅ HTTP 403 (expected - no files deployed yet)

10. **Verified nginx response - network IP**:
    ```bash
    ssh root@192.168.0.130 "curl -s -o /dev/null -w '%{http_code}' http://192.168.0.51/"
    ```
    - ✅ HTTP 403 (container accessible over network)

#### Phase 3: Build and Deploy

**Executed by**: Claude Code (second session)
**Date**: 2026-02-12

1. **Built Next.js static export**:
   ```bash
   npm run build
   ```
   - ✅ Compiled successfully, 3 static pages generated (/, /_not-found, /404)

2. **Created tarball and copied to Proxmox host**:
   ```bash
   tar czf strain-app-build.tar.gz -C out .
   scp strain-app-build.tar.gz maint@192.168.0.130:/tmp/
   ```
   - ✅ 221KB tarball transferred

3. **Deployed to container**:
   ```bash
   ssh maint@192.168.0.130 "cat /tmp/strain-app-build.tar.gz | sudo pct exec 203 -- tar xzf - -C /var/www/strain-app"
   ssh maint@192.168.0.130 "sudo pct exec 203 -- chown -R www-data:www-data /var/www/strain-app"
   ```
   - ✅ Files extracted and ownership set
   - Tar ownership warnings (Windows UID mismatch) — non-critical, chown fixed it

4. **Verified deployment**:
   - ✅ `curl http://localhost/` from container: HTTP 200
   - ✅ `curl http://192.168.0.51/` from Proxmox host: HTTP 200

#### Phase 4: Caddy Reverse Proxy + DNS

1. **Added Caddyfile entry** (container 202):
   ```
   strains.home.arpa {
           tls internal
           import lan_only
           route {
                   handle @lan {
                           reverse_proxy 192.168.0.51:80
                   }
                   handle {
                           respond 403
                   }
           }
   }
   ```
   - ✅ Appended to `/etc/caddy/Caddyfile`, validated, Caddy restarted

2. **Added DNS rewrite in AdGuard** (container 102):
   - Added `strains.home.arpa → 192.168.0.50` to `/opt/AdGuardHome/AdGuardHome.yaml`
   - ✅ AdGuard restarted, DNS resolves correctly

3. **End-to-end verification**:
   - ✅ `nslookup strains.home.arpa 192.168.0.5` → 192.168.0.50
   - ✅ HTTPS request through Caddy returns HTTP 200 with app content

#### Final Status

- **Container IP**: 192.168.0.51
- **nginx**: Running and serving app at HTTP 200
- **Caddy**: Reverse proxying `strains.home.arpa` → 192.168.0.51:80
- **DNS**: `strains.home.arpa` → 192.168.0.50 (Caddy)
- **App URL**: `https://strains.home.arpa`
- **Status**: ✅ Fully deployed and accessible

#### Notes

- **DNS Issue on Proxmox Host**: The Proxmox host's `/etc/resolv.conf` was empty. Added `nameserver 192.168.0.5` to enable template downloads. This may need to be made persistent via NetworkManager configuration or `/etc/network/interfaces` if not already handled.
- **Locale Warnings**: Minor locale warnings appeared during package installations (LANG=en_US.UTF-8 not fully configured). These are cosmetic and do not affect functionality.
- **curl TLS Bug on Proxmox Host**: `curl -k` fails against Caddy's internal TLS certs with `tlsv1 alert internal error` (OpenSSL 3.0.18 / curl 7.88.1). This is a client-side curl/OpenSSL compatibility issue — openssl s_client and browsers work fine. Does not affect functionality.

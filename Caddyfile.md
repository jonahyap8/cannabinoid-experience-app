# The Caddyfile is an easy way to configure your Caddy web server.
#
# Unless the file starts with a global options block, the first
# uncommented line is always the address of your site.
#
# To use your own domain name (with automatic HTTPS), first make
# sure your domain's A/AAAA DNS records are properly pointed to
# this machine's public IP, then replace ":80" below with your
# domain name.

# Disable admin
{
        admin off
}

# Reusable matcher: allow only your LAN + loopback + Tailscale CGNAT range
(lan_only) {
        @lan remote_ip 192.168.0.0/24 100.64.0.0/10 127.0.0.1 ::1
}

# qBittorrent
torrent.home.arpa {
        tls internal
        import lan_only
        route {
                handle @lan {
                        reverse_proxy 192.168.0.145:8080
                }
                handle {
                        respond 403
                }
        }
}

# n8n
n8n.home.arpa {
        tls internal
        import lan_only
        route {
                handle @lan {
                        reverse_proxy 192.168.0.88:5678
                }
                handle {
                        respond 403
                }
        }
}
# n8n public edge (ONLY webhooks & OAuth callback)
:8080 {
  encode zstd gzip

  # log requests so we can see what's happening
  log {
    output stdout
    level INFO
    format console
  }

  route {
    # quick health endpoint to prove we’re in the right server
    respond /_health "ok" 200

    @allow path /webhook* /webhook-test* /rest/oauth2-credential/callback*
    handle @allow {
      reverse_proxy 192.168.0.88:5678
    }

    # everything else blocked (keeps editor private)
    handle {
      respond 403
    }
  }
}

# Mealie
mealie.home.arpa {
        tls internal
        import lan_only
        route {
                handle @lan {
                        reverse_proxy 192.168.0.155:9925
                }
                handle {
                        respond 403
                }
        }
}

# Immich
immich.home.arpa {
        tls internal
        import lan_only
        route {
                handle @lan {
                        reverse_proxy 192.168.0.77:2283
                }
                handle {
                        respond 403
                }
        }
}

# AdGuard
adguard.home.arpa {
        tls internal
        import lan_only
        route {
                handle @lan {
                        reverse_proxy 192.168.0.5:3000
                }
                handle {
                        respond 403
                }
        }
}

#Homarr
dashboard.home.arpa {
        tls internal
        import lan_only
        route {
                handle @lan {
                        reverse_proxy 192.168.0.55:7575
                }
                handle {
                        respond 403
                }
        }
}

#Uptime
uptime.home.arpa {
        tls internal
        import lan_only
        route {
                handle @lan {
                        reverse_proxy 192.168.0.55:3001
                }
                handle {
                        respond 403
                }
        }
}

# Plex
plex.home.arpa {
        tls internal
        import lan_only
        route {
                handle @lan {
                        reverse_proxy 192.168.0.210:32400
                }
                handle {
                        respond 403
                }
        }
}

#Sonarr
sonarr.home.arpa {
        tls internal
        import lan_only
        route {
                handle @lan {
                        reverse_proxy 192.168.0.147:8989
                }
                handle {
                        respond 403
                }
        }
}

#Radarr
radarr.home.arpa {
        tls internal
        import lan_only
        route {
                handle @lan {
                        reverse_proxy 192.168.0.147:7878
                }
                handle {
                        respond 403
                }
        }
}

#Prowlarr
prowlarr.home.arpa {
        tls internal
        import lan_only
        route {
                handle @lan {
                        reverse_proxy 192.168.0.147:9696
                }
                handle {
                        respond 403
                }
        }
}

#Bazarr
bazarr.home.arpa {
        tls internal
        import lan_only
        route {
                handle @lan {
                        reverse_proxy 192.168.0.147:6767
                }
                handle {
                        respond 403
                }
        }
}

#Home Assistant
hass.home.arpa {
        tls internal
        import lan_only
        route {
                handle @lan {
                        reverse_proxy 192.168.0.94:8123
                }
                handle {
                        respond 403
                }
        }
}

#Jellyseerr
mediarequests.home.arpa {
        tls internal
        import lan_only
        route {
                handle @lan {
                        reverse_proxy 192.168.0.147:5055
                }
                handle {
                        respond 403
                }
        }
}

#Proxmox
proxmox.home.arpa {
        tls internal
        import lan_only
        handle @lan {
                reverse_proxy https://192.168.0.130:8006 {
                        transport http {
                                tls_insecure_skip_verify
                        }
                }
        }
        handle {
                respond 403
        }
}

#Router
router.home.arpa {
        tls internal
        import lan_only
        handle @lan {
                reverse_proxy https://192.168.0.1 {
                        transport http {
                                tls_insecure_skip_verify
                        }
                }
        }
        handle {
                respond 403
        }
}

#TrueNAS
truenas.home.arpa {
        tls internal
        import lan_only
        handle @lan {
                reverse_proxy https://192.168.0.70 {
                        transport http {
                                tls_insecure_skip_verify
                        }
                }
        }
        handle {
                respond 403
        }
}

# Refer to the Caddy docs for more information:
# https://caddyserver.com/docs/caddyfile
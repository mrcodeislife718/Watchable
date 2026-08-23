# Watchable TV Architecture

```text
Web / Mobile-PWA / Smart-TV / Watchable Streamer
                  |
             Watchable API
                  |
  +---------------+----------------+
  |               |                |
Identity      Billing/Commissions  Content/Rights
  |               |                |
Profiles      $75 subscription      +-- LICENSED_LINEAR
Devices       Rep attribution       +-- PREMIUM
Favorites     Invoice residuals     +-- FAST_AVOD
History                              +-- VOD
                                      +-- LOCAL_OTA
                                          |
                                      EPG / Search
                                          |
                                  Playback authorization
                                          |
                               Authorized supplier feed
```

Programming is normalized into Watchable schemas. The player never treats a raw feed URL as proof of entitlement. Playback requires both an active subscription and valid content rights.

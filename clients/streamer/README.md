# Watchable Streamer software target

The Watchable Streamer is an HDMI compute device for old or non-smart TVs. The first hardware image can use a minimal Linux build with Chromium in kiosk mode and hardware video decoding enabled. The device boots straight into the Watchable TV living-room client.

Production hardware requirements: HDMI 2.0+, hardware H.264/H.265/AV1 decode as required by licensed feeds, 2 GB+ RAM, 8 GB+ flash, dual-band Wi-Fi, Bluetooth remote support, secure boot where supported, OTA image updates, unique device identity, and HDCP support required by programming contracts.

Replace `WATCHABLE_PRODUCTION_HOST` in the provided systemd unit during image creation.

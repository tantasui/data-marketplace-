# WSL Port Forwarding Setup for Wokwi Private IoT Gateway

## Overview

This guide helps you set up port forwarding from Windows to WSL so that Wokwi's Private IoT Gateway can access your backend server running in WSL.

## Step 1: Find Your WSL IP Address

Run this in WSL to get your IP address:
```bash
hostname -I | awk '{print $1}'
```

Or check it manually:
```bash
ip addr show eth0 | grep "inet " | awk '{print $2}' | cut -d/ -f1
```

**Your WSL IP:** `172.30.179.68` (or whatever the command returns)

## Step 2: Set Up Port Forwarding on Windows

Open **PowerShell as Administrator** and run:

```powershell
netsh interface portproxy add v4tov4 listenport=3001 listenaddress=0.0.0.0 connectport=3001 connectaddress=172.30.179.68
```

**Replace `172.30.179.68` with your actual WSL IP address from Step 1.**

### Verify Port Forwarding

Check if port forwarding is set up:
```powershell
netsh interface portproxy show all
```

### Remove Port Forwarding (if needed)

If you need to remove it later:
```powershell
netsh interface portproxy delete v4tov4 listenport=3001 listenaddress=0.0.0.0
```

## Step 3: Configure Backend Server

✅ **Already Done!** Your backend is configured to listen on `0.0.0.0:3001` in `backend/src/index.ts`.

The server will accept connections from:
- `localhost:3001` (local access)
- `host.wokwi.internal:3001` (Wokwi Private IoT Gateway)
- `0.0.0.0:3001` (all network interfaces)

## Step 4: Update Wokwi Sketch

Update your `wokwi/sketch.ino` to use:

```cpp
const char* serverUrl = "http://host.wokwi.internal:3001/api/iot/feeds/YOUR_FEED_ID/update";
```

## Step 5: Start Your Backend

```bash
cd backend
npm run dev
```

You should see:
```
Server running on: http://0.0.0.0:3001 (all interfaces)
Wokwi access: http://host.wokwi.internal:3001
```

## Step 6: Test from Wokwi

1. Open your Wokwi simulation
2. The ESP32 should connect to `host.wokwi.internal:3001`
3. Check the serial monitor for connection status

## Troubleshooting

### Port forwarding not working?

1. **Check Windows Firewall:**
   ```powershell
   # Allow port 3001 through firewall
   New-NetFirewallRule -DisplayName "WSL Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
   ```

2. **Verify WSL IP hasn't changed:**
   - WSL IP can change after restart
   - Re-run the port forwarding command with new IP

3. **Check if backend is running:**
   ```bash
   # In WSL
   curl http://localhost:3001/health
   ```

4. **Test from Windows:**
   ```powershell
   # From Windows PowerShell
   curl http://localhost:3001/health
   ```

### WSL IP Changed?

If your WSL IP changes, update the port forwarding:
```powershell
# Remove old rule
netsh interface portproxy delete v4tov4 listenport=3001 listenaddress=0.0.0.0

# Add new rule with new IP
netsh interface portproxy add v4tov4 listenport=3001 listenaddress=0.0.0.0 connectport=3001 connectaddress=NEW_IP
```

## Quick Setup Script

Save this as `setup-port-forward.ps1` and run as Administrator:

```powershell
# Get WSL IP (requires WSL to be running)
$wslIp = (wsl hostname -I).Trim().Split()[0]

if ($wslIp) {
    Write-Host "WSL IP: $wslIp"
    
    # Remove existing rule if any
    netsh interface portproxy delete v4tov4 listenport=3001 listenaddress=0.0.0.0 2>$null
    
    # Add new rule
    netsh interface portproxy add v4tov4 listenport=3001 listenaddress=0.0.0.0 connectport=3001 connectaddress=$wslIp
    
    Write-Host "Port forwarding configured: 0.0.0.0:3001 -> $wslIp:3001"
    netsh interface portproxy show all
} else {
    Write-Host "Error: Could not get WSL IP. Make sure WSL is running."
}
```

## Notes

- Port forwarding persists until you remove it or restart Windows
- WSL IP may change after system restart - you may need to update port forwarding
- The backend must be running in WSL for this to work
- `host.wokwi.internal` is a special DNS name that Wokwi resolves to your Windows host


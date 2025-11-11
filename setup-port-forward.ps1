# WSL Port Forwarding Setup Script
# Run this as Administrator in PowerShell

Write-Host "Setting up port forwarding for Wokwi Private IoT Gateway..." -ForegroundColor Cyan

# Get WSL IP address
Write-Host "`nGetting WSL IP address..." -ForegroundColor Yellow
$wslIp = (wsl hostname -I).Trim().Split()[0]

if (-not $wslIp) {
    Write-Host "Error: Could not get WSL IP address. Make sure WSL is running." -ForegroundColor Red
    exit 1
}

Write-Host "WSL IP Address: $wslIp" -ForegroundColor Green

# Remove existing rule if any
Write-Host "`nRemoving existing port forwarding rule (if any)..." -ForegroundColor Yellow
netsh interface portproxy delete v4tov4 listenport=3001 listenaddress=0.0.0.0 2>$null

# Add new port forwarding rule
Write-Host "Adding port forwarding rule..." -ForegroundColor Yellow
netsh interface portproxy add v4tov4 listenport=3001 listenaddress=0.0.0.0 connectport=3001 connectaddress=$wslIp

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Port forwarding configured successfully!" -ForegroundColor Green
    Write-Host "   Forwarding: 0.0.0.0:3001 -> $wslIp:3001" -ForegroundColor Cyan
    Write-Host "`nCurrent port forwarding rules:" -ForegroundColor Yellow
    netsh interface portproxy show all
    Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Start your backend: cd backend && npm run dev" -ForegroundColor White
    Write-Host "   2. Update wokwi/sketch.ino with your feed ID and API key" -ForegroundColor White
    Write-Host "   3. Use serverUrl: http://host.wokwi.internal:3001/api/iot/feeds/YOUR_FEED_ID/update" -ForegroundColor White
} else {
    Write-Host "`n❌ Failed to configure port forwarding. Make sure you're running as Administrator." -ForegroundColor Red
    exit 1
}

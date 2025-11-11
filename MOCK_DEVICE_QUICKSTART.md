# 🚀 Quick Start: Mock IoT Device

## Run the Mock Device

```bash
cd backend
IOT_FEED_ID=0x2fca1ed29725e582fd31525e2e98523b735722f50ce846ed8528bdb8ce27caff \
IOT_PROVIDER_ADDRESS=0xe7b5873257c12797d22f21fe8a4f81270d21c2678b94d89432df05e3c2f97ed8 \
API_URL=http://localhost:3001 \
npm run mock-device
```

## What It Does

- ✅ Sends weather data every 30 seconds
- ✅ Connects directly to your local backend
- ✅ Uploads to Walrus storage
- ✅ Updates blockchain feed
- ✅ Shows detailed logs

## Output Example

```
╔════════════════════════════════════════╗
║   Mock IoT Weather Station v1.0        ║
║   Data Marketplace Device Simulator    ║
╚════════════════════════════════════════╝

📡 Configuration:
   API URL: http://localhost:3001
   Feed ID: 0x2fca1ed29725e582fd31525e2e98523b735722f50ce846ed8528bdb8ce27caff
   Provider: 0xe7b5873257c12797d22f21fe8a4f81270d21c2678b94d89432df05e3c2f97ed8
   Device ID: mock-device-001
   Update Interval: 30s

🚀 Starting data transmission...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Reading #1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🌡️  Temperature: 72.3°F
   💧 Humidity: 45.2%
   🌬️  Pressure: 1013.15 hPa
   💨 Wind: 5.3 mph NE
   ☁️  Conditions: Clear
   📍 Location: Virtual IoT Lab
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Data uploaded successfully!
   🗄️  Walrus Blob ID: abc123...
```

## Stop the Device

Press `Ctrl+C` to stop gracefully.

## Check Your Backend Logs

You should see in your backend terminal:
```
📡 [req_...] ===== IoT Update Request Received =====
[req_...] 📋 Parsed request data: {...}
[req_...] ✅ Walrus upload successful!
[req_...] ⛓️  Provider address provided, updating on-chain...
[req_...] ✅ On-chain update successful!
```

## Verify in Frontend

1. Go to http://localhost:3000/consumer
2. Find your feed
3. Click "Preview Data"
4. You should see the latest data from the mock device!


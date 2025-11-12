# 🌡️ Wokwi IoT Device Integration Guide

Complete guide to setting up and demoing the IoT device simulator for your Data Marketplace.

## 🎯 Overview

You have **two options** for simulating IoT devices:

1. **Wokwi Simulator** (Recommended for demos) - Visual hardware simulation
2. **Mock Device Script** (Backup) - Simple Node.js script

Both send real data to your marketplace via the `/api/iot/update` endpoint.

---

## Option 1: Wokwi Simulator (Recommended)

### Step 1: Prepare Your Backend

1. **Start your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Expose it with ngrok** (Wokwi needs public URL):
   ```bash
   # Install ngrok if you haven't
   npm install -g ngrok

   # Expose port 3001
   ngrok http 3001
   ```

3. **Copy the ngrok URL** (e.g., `https://abc123.ngrok-free.app`)

### Step 2: Create a Feed

1. Start your frontend: `cd frontend && npm run dev`
2. Go to http://localhost:3000/provider
3. Connect your wallet
4. Create a new feed:
   - Name: "Wokwi Weather Station"
   - Category: Weather
   - Location: "Virtual Lab"
   - Monthly Price: 0.1 SUI
   - Initial Data: `{"temperature": 72, "humidity": 45}`
5. **Copy the Feed ID** from the success message or URL

### Step 3: Set Up Wokwi

1. Go to https://wokwi.com/projects/new/esp32

2. **Load the circuit:**
   - Click the gear icon ⚙️ next to "diagram.json"
   - Copy contents from `wokwi/diagram.json`
   - Paste and save

3. **Load the code:**
   - Copy contents from `wokwi/sketch.ino`
   - Paste into the code editor

4. **Configure the code** (lines 13-15):
   ```cpp
   const char* serverUrl = "https://YOUR-NGROK-URL.ngrok-free.app/api/iot/update";
   const char* feedId = "0xYOUR_FEED_ID";
   const char* providerAddress = "0xYOUR_WALLET_ADDRESS";
   ```

5. **Start the simulation!** ▶️

### Step 4: Verify It's Working

You should see in the Wokwi Serial Monitor:
```
╔════════════════════════════════════════╗
║   IoT Weather Station v1.0             ║
║   Data Marketplace Device              ║
╚════════════════════════════════════════╝

🌡️  DHT22 sensor initialized
📶 Connecting to WiFi... ✅
   IP Address: 192.168.1.100

📡 Starting data transmission...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Reading #1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🌡️  Temperature: 72.3°F
   💧 Humidity: 45.2%
   🌬️  Pressure: 1013.15 hPa
   💨 Wind: 5.3 mph NE
   ☁️  Conditions: Clear
   📍 Location: Wokwi Simulation Lab
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 Sending to API...
   URL: https://abc123.ngrok-free.app/api/iot/update
   Payload size: 387 bytes
✅ Response Code: 200
   ✅ Data uploaded successfully!
   🗄️  Walrus Blob ID: some-blob-id-here
```

### Step 5: Check Your Marketplace

1. Go to http://localhost:3000/consumer
2. Find your "Wokwi Weather Station" feed
3. Click "Preview Data"
4. You should see the live data from Wokwi!

---

## Option 2: Mock Device Script (Backup)

Simpler option if Wokwi has issues or for automated testing.

### Setup

1. **Configure environment variables** in `backend/.env`:
   ```bash
   IOT_FEED_ID=0xYOUR_FEED_ID
   IOT_PROVIDER_ADDRESS=0xYOUR_WALLET_ADDRESS
   API_URL=http://localhost:3001
   ```

2. **Run the mock device:**
   ```bash
   cd backend
   npm run mock-device
   ```

You'll see similar output to Wokwi, sending data every 30 seconds.

### Stopping the Mock Device

Press `Ctrl+C` to stop gracefully.

---

## 🎬 Demo Tips

### For Live Presentations

1. **Keep Both Open:**
   - Wokwi simulation (left side)
   - Your marketplace (right side)

2. **Interact with the Sensor:**
   - In Wokwi, click the DHT22 sensor
   - Drag temperature/humidity sliders
   - Show data updating in marketplace

3. **Point Out:**
   - The circuit diagram (real hardware)
   - Serial monitor showing transmissions
   - LED indicators (blue=reading, green=success, red=error)
   - Walrus blob IDs being generated
   - Real-time marketplace updates

### For Recorded Demos

1. Record side-by-side view
2. Narrate what's happening:
   - "Here's our ESP32 reading real sensor data"
   - "It uploads to Walrus every 5 minutes"
   - "Smart contract verifies the transaction"
   - "Consumers see live updates instantly"

### For Testing

Run multiple mock devices:
```bash
# Terminal 1
IOT_FEED_ID=feed1 npm run mock-device

# Terminal 2
IOT_FEED_ID=feed2 npm run mock-device

# Terminal 3
IOT_FEED_ID=feed3 npm run mock-device
```

Now you have 3 "devices" sending data!

---

## 🐛 Troubleshooting

### Wokwi Issues

**"HTTP Error -1"**
- Check ngrok is running: `curl https://YOUR-URL.ngrok-free.app/health`
- Verify URL in sketch.ino has no trailing slash
- Check CORS settings in backend

**"WiFi not connected"**
- Wokwi WiFi is automatic - restart simulation
- Check Serial Monitor for errors

**"Failed to read from DHT sensor"**
- Check diagram.json is loaded correctly
- Verify wiring in circuit diagram
- Restart simulation

### Mock Device Issues

**"ECONNREFUSED"**
- Backend not running: `npm run dev`
- Wrong API_URL in .env

**"Feed not found"**
- Feed ID is wrong
- Feed was deleted
- Check with: `curl http://localhost:3001/api/feeds`

### Data Not Showing in Marketplace

**Check these in order:**

1. Backend logs show data received?
   ```
   📡 IoT device data received: { feedId: '0x...', ... }
   ```

2. Walrus upload successful?
   ```
   ✅ Uploaded to Walrus: blob_id_here
   ```

3. Refresh marketplace page

4. Check browser console for errors

---

## 📊 Customization

### Change Update Frequency

**Wokwi (sketch.ino line 18):**
```cpp
const unsigned long updateInterval = 60000; // 1 minute
```

**Mock Device (mock-iot-device.ts line 11):**
```typescript
const UPDATE_INTERVAL = 60000; // 1 minute
```

### Add More Sensor Data

Edit the data payload in either file. Example adding CO2:

```cpp
// Wokwi
data["co2"] = 400 + random(0, 200);

// Or TypeScript
data: {
  ...weatherData,
  co2: 400 + Math.random() * 200
}
```

### Simulate Multiple Locations

Change `location` variable in either simulator:
```cpp
const char* location = "San Francisco, CA";
// or
const LOCATION = 'Oakland, CA';
```

---

## 🏆 Making it Production-Ready

For a real deployment:

1. **Use real hardware** (ESP32 + DHT22 costs ~$15)
2. **Set longer intervals** (5-15 minutes to save battery/bandwidth)
3. **Add battery monitoring**
4. **Implement sleep modes**
5. **Add error recovery and retries**
6. **Use proper authentication** (API keys, device certificates)

The code is structured to easily port to real hardware - just upload the sketch.ino to a physical ESP32!

---

## 📸 Screenshots to Take

For your submission/demo:

1. ✅ Wokwi circuit diagram
2. ✅ Serial Monitor showing successful uploads
3. ✅ Marketplace showing live data
4. ✅ Provider dashboard showing revenue
5. ✅ Side-by-side comparison

---

## 🎓 Key Points for Judges

Emphasize these during your demo:

- "This ESP32 simulates a real $15 IoT device"
- "Data goes directly to Walrus - fully decentralized"
- "Smart contracts handle all payments automatically"
- "Any device maker can plug into this marketplace"
- "Same code works on real hardware - just upload it"

---

**Questions?** Check the [API.md](./API.md) for endpoint details or [README.md](./README.md) for general setup.

**Ready to demo?** Start with Option 1 (Wokwi) - it looks the most impressive! 🚀

# 🚀 Wokwi Private IoT Gateway Setup Guide

## Step 1: Download and Run the Gateway

1. **Download the Wokwi IoT Gateway:**
   - Go to: https://github.com/wokwi/wokwi-features/releases
   - Download the version for your OS (Windows/macOS/Linux)
   - Extract the ZIP file
   - Run the executable

2. **Verify it's running:**
   You should see:
   ```
   Listening on TCP port 9011
   ```

## Step 2: Enable Private Gateway in Wokwi

1. Open your Wokwi project
2. Press **F1** (or Cmd+F1 on Mac)
3. Select **"Enable Private Wokwi IoT Gateway"**
4. Click **"OK"** when prompted

## Step 3: Update Your Sketch

With Private Gateway, you can connect directly to your local backend using `host.wokwi.internal`:

```cpp
// Use host.wokwi.internal to connect to your local machine
const char* serverUrl = "http://host.wokwi.internal:3001/api/iot/update";
```

**Key changes:**
- Use `http://` (not `https://`) - no SSL needed for localhost
- Use `host.wokwi.internal` instead of ngrok URL
- Use port `3001` (your backend port)
- Use regular `WiFiClient` (not `WiFiClientSecure`)

## Step 4: Update Your Sketch Code

Replace the HTTPS code with HTTP code:

```cpp
void sendDataToAPI(...) {
  WiFiClient client;  // Regular client, not WiFiClientSecure
  HTTPClient http;
  
  http.begin(client, "http://host.wokwi.internal:3001/api/iot/update");
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(20000);
  
  // Rest of your code...
}
```

## Benefits of Private Gateway

✅ **No ngrok needed** - Direct connection to your local backend  
✅ **Faster** - No cloud routing  
✅ **More reliable** - Direct connection  
✅ **Private** - No monitoring  
✅ **Simpler** - Just HTTP, no SSL certificates  

## Testing

1. Make sure backend is running: `cd backend && npm run dev`
2. Make sure Private Gateway is running (shows "Listening on TCP port 9011")
3. Enable Private Gateway in Wokwi (F1)
4. Run your simulation
5. Check backend logs - you should see:
   ```
   📡 [req_...] ===== IoT Update Request Received =====
   ```

## Troubleshooting

**Gateway not connecting?**
- Check gateway is running (should show "Listening on TCP port 9011")
- Make sure you enabled it in Wokwi (F1 → Enable Private Gateway)
- Restart Wokwi simulation

**Connection refused?**
- Verify backend is running on port 3001
- Check URL is exactly: `http://host.wokwi.internal:3001/api/iot/update`
- Make sure you're using `WiFiClient` not `WiFiClientSecure`

**Still not working?**
- Check gateway output for connection messages
- Verify backend logs show incoming requests
- Try accessing `http://localhost:3001/api/iot/status` from browser

const char* ssid = "Wokwi-GUEST";
const char* password = "";
const char* serverUrl = "https://unlugged-janise-universally.ngrok-free.dev/api/iot/update";
const char* feedId = "0x2fca1ed29725e582fd31525e2e98523b735722f50ce846ed8528bdb8ce27caff";
const char* providerAddress = "0xe7b5873257c12797d22f21fe8a4f81270d21c2678b94d89432df05e3c2f97ed8";

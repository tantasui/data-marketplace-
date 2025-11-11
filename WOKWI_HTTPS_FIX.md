# 🔧 Wokwi HTTPS Connection Issue - Alternative Solutions

## The Problem
Wokwi's ESP32 simulator may have limitations with HTTPS/SSL connections to external services like ngrok. The "-1" error means the TCP connection couldn't be established.

## Solution 1: Use ngrok HTTP (Not HTTPS) - Quick Fix

If Wokwi has HTTPS issues, try using HTTP instead:

1. **Start ngrok with HTTP:**
   ```bash
   ngrok http 3001 --scheme=http
   ```

2. **Update sketch.ino:**
   ```cpp
   const char* serverUrl = "http://YOUR-NGROK-URL.ngrok-free.dev/api/iot/update";
   ```

3. **Use regular WiFiClient instead of WiFiClientSecure:**
   ```cpp
   WiFiClient client;
   HTTPClient http;
   http.begin(client, serverUrl);
   ```

## Solution 2: Check Backend is Receiving Requests

Check your backend terminal/logs when Wokwi tries to connect. You should see:
```
📡 [req_...] ===== IoT Update Request Received =====
```

If you DON'T see this, the request isn't reaching your backend.

## Solution 3: Test with Mock Device First

Verify your backend works with the mock device:
```bash
cd backend
IOT_FEED_ID=0x2fca1ed29725e582fd31525e2e98523b735722f50ce846ed8528bdb8ce27caff npm run mock-device
```

If this works, the issue is specifically with Wokwi's HTTPS handling.

## Solution 4: Use ngrok Static Domain (If Available)

If you have an ngrok account, use a static domain:
```bash
ngrok http 3001 --domain=your-static-domain.ngrok-free.app
```

This might have better SSL support.

## Solution 5: Check ngrok Status

Make sure ngrok is still running:
```bash
curl http://localhost:4040/api/tunnels
```

Check the public_url matches what's in your sketch.

## Debugging Steps

1. **Add more serial output** - The updated sketch now shows more connection details
2. **Check backend logs** - Look for incoming requests
3. **Test endpoint manually** - Use curl to verify it works
4. **Check ngrok web interface** - Visit http://localhost:4040 to see requests

## Most Likely Fix

Try **Solution 1** first - use HTTP instead of HTTPS. Wokwi's simulator might not fully support SSL/TLS to external services.




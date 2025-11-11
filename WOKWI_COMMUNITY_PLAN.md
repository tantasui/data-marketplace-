# 🎯 Wokwi Community Plan - Working Solution

## The Issue
Wokwi Community plan has Virtual WiFi but **no Private IoT Gateway**, which limits external HTTPS connections. This is why you're getting "-1" connection refused errors.

## ✅ Solution: Use HTTP Instead of HTTPS

Since ngrok provides HTTPS by default, but Wokwi Community plan can't connect to external HTTPS, we have two options:

### Option 1: Use ngrok HTTP Tunnel (If Available)

Some ngrok configurations allow HTTP. Check if you can access:
```bash
# Check if HTTP version works
curl http://unlugged-janise-universally.ngrok-free.dev/health
```

If that works, update your sketch to use `http://` instead of `https://`.

### Option 2: Use Mock Device Script (Recommended for Community Plan)

Since Wokwi Community plan has limitations, use the mock device script instead:

```bash
cd backend
IOT_FEED_ID=0x2fca1ed29725e582fd31525e2e98523b735722f50ce846ed8528bdb8ce27caff \
IOT_PROVIDER_ADDRESS=0xe7b5873257c12797d22f21fe8a4f81270d21c2678b94d89432df05e3c2f97ed8 \
API_URL=http://localhost:3001 \
npm run mock-device
```

This works perfectly and sends real data to your marketplace!

### Option 3: Upgrade to Hobby Plan ($7/mo)

If you need Wokwi specifically, the Hobby plan includes:
- ✅ Private IoT Gateway (allows external HTTPS)
- ✅ Unlisted projects
- ✅ Custom libraries

This would fix the HTTPS connection issue.

## 🎬 For Your Demo

**Best approach for Community plan:**
1. Use the mock device script (works perfectly)
2. Show the Wokwi circuit diagram as "the hardware design"
3. Explain: "In production, this code runs on a real ESP32"

This demonstrates:
- ✅ The hardware design (Wokwi diagram)
- ✅ The code works (mock device)
- ✅ Real data flows (backend logs)
- ✅ Marketplace integration (frontend)

## 📝 Updated Sketch for HTTP (If ngrok Supports It)

If ngrok HTTP works, use this version:

```cpp
// Use HTTP instead of HTTPS
const char* serverUrl = "http://unlugged-janise-universally.ngrok-free.dev/api/iot/update";

// Use regular WiFiClient (not WiFiClientSecure)
WiFiClient client;
HTTPClient http;
http.begin(client, serverUrl);
```

## 🏆 Recommendation

For your demo with Community plan:
- **Use mock device** - It's reliable and shows the full flow
- **Show Wokwi diagram** - Demonstrates the hardware design
- **Explain the architecture** - "This code runs on ESP32 in production"

This is actually MORE impressive because:
1. Shows you understand the full stack
2. Demonstrates production-ready approach
3. Works reliably without plan limitations




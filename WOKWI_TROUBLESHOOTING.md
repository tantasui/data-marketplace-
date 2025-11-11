# 🔧 Wokwi Connection Troubleshooting Guide

## Common Issues and Solutions

### ❌ Error: "HTTP Error: -1" or "connection refused"

This usually means one of these issues:

#### 1. **Backend Not Running**
```bash
# Check if backend is running
cd backend
npm run dev

# Should see:
# ╔════════════════════════════════════════════════════════════╗
# ║  IoT Data Marketplace API Server                          ║
# ║  Server running on: http://localhost:3001                 ║
```

#### 2. **ngrok Not Running or Wrong URL**
```bash
# Check ngrok status
curl https://YOUR-NGROK-URL.ngrok-free.dev/health

# Should return: {"success":true,"status":"healthy",...}

# If not working:
# 1. Restart ngrok: ngrok http 3001
# 2. Copy the NEW https URL (it changes each time)
# 3. Update sketch.ino with the new URL
```

#### 3. **Wrong URL Format in sketch.ino**
Make sure your URL is:
- ✅ `https://unlugged-janise-universally.ngrok-free.dev/api/iot/update`
- ❌ NOT `http://...` (must be https)
- ❌ NOT `...ngrok-free.dev/` (no trailing slash before api)

#### 4. **CORS Issues (Fixed in Latest Code)**
The backend now allows all origins. If you still see CORS errors:
- Make sure you've pulled the latest code
- Restart the backend server
- Check backend logs for CORS errors

### ✅ Quick Test Steps

1. **Test Backend Locally:**
```bash
curl http://localhost:3001/api/iot/status
# Should return: {"success":true,"status":"online",...}
```

2. **Test Through ngrok:**
```bash
curl -X POST https://YOUR-NGROK-URL.ngrok-free.dev/api/iot/status \
  -H "ngrok-skip-browser-warning: true"
# Should return: {"success":true,"status":"online",...}
```

3. **Test Full IoT Endpoint:**
```bash
curl -X POST https://YOUR-NGROK-URL.ngrok-free.dev/api/iot/update \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{
    "feedId": "0xYOUR_FEED_ID",
    "deviceId": "test-device",
    "data": {"temperature": 72, "humidity": 45}
  }'
```

### 🔍 Debug Checklist

- [ ] Backend is running (`npm run dev` in backend folder)
- [ ] ngrok is running (`ngrok http 3001`)
- [ ] ngrok URL is HTTPS (not HTTP)
- [ ] URL in sketch.ino matches ngrok URL exactly
- [ ] No trailing slash in URL before `/api/iot/update`
- [ ] Feed ID is correct (check in frontend or via API)
- [ ] Backend logs show incoming requests
- [ ] WiFi connected in Wokwi (should show IP address)

### 📝 Updated sketch.ino Configuration

Make sure your sketch.ino has:
```cpp
const char* serverUrl = "https://YOUR-NGROK-URL.ngrok-free.dev/api/iot/update";
//                                                              ^^^ NO trailing slash
//                                                              ^^^ Must be https
```

### 🐛 Check Backend Logs

When Wokwi sends data, you should see in backend logs:
```
📡 [req_1234567890_abc] ===== IoT Update Request Received =====
[req_1234567890_abc] Headers: {...}
[req_1234567890_abc] Body: {...}
```

If you DON'T see this, the request isn't reaching your backend.

### 🔄 Still Not Working?

1. **Restart Everything:**
   - Stop backend (Ctrl+C)
   - Stop ngrok (Ctrl+C)
   - Restart ngrok: `ngrok http 3001`
   - Copy NEW ngrok URL
   - Update sketch.ino
   - Restart backend: `npm run dev`
   - Restart Wokwi simulation

2. **Check Firewall:**
   - Make sure port 3001 isn't blocked
   - Try: `netstat -an | grep 3001`

3. **Try Mock Device Instead:**
   ```bash
   cd backend
   IOT_FEED_ID=0xYOUR_FEED_ID npm run mock-device
   ```
   If this works, the issue is with Wokwi/ngrok, not your backend.

### 📞 Need More Help?

Check backend logs for detailed error messages. The new logging shows exactly where requests fail.




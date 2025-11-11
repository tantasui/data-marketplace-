# Using Your Subscriber API Key

**Your API Key:** `sk_Nk8HBCHNmkqhZpTJYX0MTQ61GiJOvFaE`

## 🔑 What You Can Do With This API Key

Your subscriber API key (`sk_...`) allows you to:
- ✅ Access data from feeds you've subscribed to
- ✅ Get historical data
- ✅ Connect to WebSocket for real-time updates
- ✅ Track your usage statistics

---

## 📡 API Endpoints

### 1. Get Feed Data (Current)

**Endpoint:** `GET /api/data/:feedId`

**Using cURL:**
```bash
curl -X GET "http://localhost:3001/api/data/YOUR_FEED_ID" \
  -H "X-API-Key: sk_Nk8HBCHNmkqhZpTJYX0MTQ61GiJOvFaE"
```

**Using JavaScript/TypeScript:**
```javascript
const feedId = '0x...'; // Your feed ID
const apiKey = 'sk_Nk8HBCHNmkqhZpTJYX0MTQ61GiJOvFaE';

const response = await fetch(`http://localhost:3001/api/data/${feedId}`, {
  headers: {
    'X-API-Key': apiKey
  }
});

const data = await response.json();
console.log(data);
```

**Response:**
```json
{
  "success": true,
  "data": {
    "temperature": 72.3,
    "humidity": 45.2,
    "pressure": 1013.15,
    "timestamp": 1234567890
  },
  "feed": {
    "id": "0x...",
    "name": "Weather Station",
    "category": "weather",
    "lastUpdated": "2024-01-01T00:00:00Z"
  }
}
```

---

### 2. Get Historical Data

**Endpoint:** `GET /api/data/:feedId/history`

**Using cURL:**
```bash
curl -X GET "http://localhost:3001/api/data/YOUR_FEED_ID/history?limit=50" \
  -H "X-API-Key: sk_Nk8HBCHNmkqhZpTJYX0MTQ61GiJOvFaE"
```

**Query Parameters:**
- `limit` - Number of records (default: 100, max: 1000)
- `startDate` - Start date (ISO format)
- `endDate` - End date (ISO format)

**Example:**
```bash
curl -X GET "http://localhost:3001/api/data/YOUR_FEED_ID/history?limit=10&startDate=2024-01-01&endDate=2024-01-31" \
  -H "X-API-Key: sk_Nk8HBCHNmkqhZpTJYX0MTQ61GiJOvFaE"
```

---

### 3. WebSocket Real-Time Data

**Endpoint:** `ws://localhost:3001/ws`

**JavaScript Example:**
```javascript
const apiKey = 'sk_Nk8HBCHNmkqhZpTJYX0MTQ61GiJOvFaE';
const feedId = '0x...'; // Your feed ID

const ws = new WebSocket('ws://localhost:3001/ws');

ws.onopen = () => {
  // Subscribe to feed
  ws.send(JSON.stringify({
    type: 'subscribe',
    feedId: feedId,
    apiKey: apiKey
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'subscribed') {
    console.log('✅ Subscribed to feed:', message.feedId);
  } else if (message.type === 'data') {
    console.log('📊 New data:', message.data);
  } else if (message.type === 'error') {
    console.error('❌ Error:', message.error);
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

---

## 🧪 Test Your API Key

### Quick Test Script

Create a file `test-api-key.js`:

```javascript
const apiKey = 'sk_Nk8HBCHNmkqhZpTJYX0MTQ61GiJOvFaE';
const baseUrl = 'http://localhost:3001';

// Replace with your actual feed ID
const feedId = 'YOUR_FEED_ID_HERE';

async function testApiKey() {
  try {
    // Test 1: Get current data
    console.log('📡 Testing API key...\n');
    
    const response = await fetch(`${baseUrl}/api/data/${feedId}`, {
      headers: {
        'X-API-Key': apiKey
      }
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ API Key is valid!');
      console.log('📊 Data:', JSON.stringify(data.data, null, 2));
    } else {
      console.error('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testApiKey();
```

Run it:
```bash
node test-api-key.js
```

---

## 🔍 Find Your Feed ID

To find which feeds you have access to:

1. **Via Subscriber Dashboard:**
   - Go to `/subscriber` in your frontend
   - View your subscriptions
   - Each subscription shows the feed ID

2. **Via API:**
```bash
# Get your subscriptions (replace with your wallet address)
curl "http://localhost:3001/api/subscriber/YOUR_WALLET_ADDRESS/subscriptions"
```

---

## 📊 Usage Statistics

View your API usage:

```bash
curl "http://localhost:3001/api/subscriber/YOUR_WALLET_ADDRESS/usage" \
  -H "X-API-Key: sk_Nk8HBCHNmkqhZpTJYX0MTQ61GiJOvFaE"
```

**Response includes:**
- Total requests
- Total queries used
- Data transferred
- Usage by feed
- Usage by date

---

## 🛡️ Security Best Practices

1. **Never commit API keys to git**
   - Add `.env` to `.gitignore`
   - Use environment variables

2. **Store API keys securely**
   ```javascript
   // ✅ Good
   const apiKey = process.env.API_KEY;
   
   // ❌ Bad
   const apiKey = 'sk_Nk8HBCHNmkqhZpTJYX0MTQ61GiJOvFaE';
   ```

3. **Use HTTPS in production**
   - Always use `https://` for API calls in production
   - Never send API keys over unencrypted connections

4. **Rotate keys regularly**
   - Revoke old keys via `/api/api-keys/:keyId` (DELETE)
   - Create new keys when needed

---

## 🚨 Troubleshooting

### Error: "Access denied"
- ✅ Check that your API key is correct
- ✅ Verify you're subscribed to the feed
- ✅ Ensure subscription hasn't expired
- ✅ Check that feed ID matches your subscription

### Error: "Invalid API key"
- ✅ Verify the API key format (`sk_...`)
- ✅ Check for typos or extra spaces
- ✅ Ensure the key hasn't been revoked

### Error: "Feed not found"
- ✅ Verify the feed ID is correct
- ✅ Check that the feed is active
- ✅ Ensure you're using the correct network (testnet/mainnet)

---

## 📝 Next Steps

1. **Test your API key** with one of your subscribed feeds
2. **Set up WebSocket** for real-time updates
3. **Monitor usage** via the subscriber dashboard
4. **Integrate into your application** using the examples above

---

## 💡 Example: Complete Integration

```javascript
class DataMarketplaceClient {
  constructor(apiKey, baseUrl = 'http://localhost:3001') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async getFeedData(feedId) {
    const response = await fetch(`${this.baseUrl}/api/data/${feedId}`, {
      headers: { 'X-API-Key': this.apiKey }
    });
    return response.json();
  }

  async getHistory(feedId, options = {}) {
    const params = new URLSearchParams({
      limit: options.limit || 100,
      ...(options.startDate && { startDate: options.startDate }),
      ...(options.endDate && { endDate: options.endDate })
    });
    
    const response = await fetch(
      `${this.baseUrl}/api/data/${feedId}/history?${params}`,
      { headers: { 'X-API-Key': this.apiKey } }
    );
    return response.json();
  }

  subscribeToFeed(feedId, onData) {
    const ws = new WebSocket(`${this.baseUrl.replace('http', 'ws')}/ws`);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'subscribe',
        feedId,
        apiKey: this.apiKey
      }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'data') {
        onData(message.data);
      }
    };

    return ws;
  }
}

// Usage
const client = new DataMarketplaceClient('sk_Nk8HBCHNmkqhZpTJYX0MTQ61GiJOvFaE');

// Get current data
const data = await client.getFeedData('YOUR_FEED_ID');

// Subscribe to real-time updates
client.subscribeToFeed('YOUR_FEED_ID', (data) => {
  console.log('New data:', data);
});
```

---

**🎉 You're all set! Start using your API key to access data feeds.**


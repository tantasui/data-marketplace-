#!/usr/bin/env node
/**
 * Quick test script for API key
 * Usage: node test-api-key.js YOUR_FEED_ID
 */

const apiKey = 'sk_Nk8HBCHNmkqhZpTJYX0MTQ61GiJOvFaE';
const baseUrl = process.env.API_URL || 'http://localhost:3001';
const feedId = process.argv[2];

if (!feedId) {
  console.error('❌ Usage: node test-api-key.js YOUR_FEED_ID');
  console.error('   Example: node test-api-key.js 0x2fca1ed29725e582fd31525e2e98523b735722f50ce846ed8528bdb8ce27caff');
  process.exit(1);
}

async function testApiKey() {
  console.log('🔑 Testing API Key:', apiKey.substring(0, 20) + '...');
  console.log('📡 Feed ID:', feedId);
  console.log('🌐 Base URL:', baseUrl);
  console.log('');

  try {
    // Test 1: Get current data
    console.log('📊 Test 1: Getting current feed data...');
    const response = await fetch(`${baseUrl}/api/data/${feedId}`, {
      headers: {
        'X-API-Key': apiKey
      }
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Success! API Key is valid');
      console.log('📦 Data:', JSON.stringify(data.data, null, 2));
      console.log('📋 Feed Info:', JSON.stringify(data.feed, null, 2));
    } else {
      console.error('❌ Error:', data.error || 'Unknown error');
      console.error('📄 Response:', JSON.stringify(data, null, 2));
      process.exit(1);
    }

    // Test 2: Get history (optional)
    console.log('\n📜 Test 2: Getting historical data...');
    const historyResponse = await fetch(`${baseUrl}/api/data/${feedId}/history?limit=5`, {
      headers: {
        'X-API-Key': apiKey
      }
    });

    const historyData = await historyResponse.json();
    
    if (historyResponse.ok && historyData.success) {
      console.log('✅ History retrieved!');
      console.log(`📊 Found ${historyData.count} records`);
      if (historyData.data.length > 0) {
        console.log('📝 Latest record:', JSON.stringify(historyData.data[0], null, 2));
      }
    } else {
      console.warn('⚠️  History test failed:', historyData.error || 'Unknown error');
    }

    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.error('💡 Make sure:');
    console.error('   1. Backend server is running (npm run dev)');
    console.error('   2. Feed ID is correct');
    console.error('   3. You have an active subscription to this feed');
    process.exit(1);
  }
}

testApiKey();


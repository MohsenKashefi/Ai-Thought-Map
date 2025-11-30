#!/usr/bin/env node
/**
 * Script to register a workers.dev subdomain via Cloudflare API
 * 
 * Usage:
 * 1. Get your Cloudflare API token from: https://dash.cloudflare.com/profile/api-tokens
 * 2. Create a token with "Workers:Edit" permissions
 * 3. Run: CLOUDFLARE_API_TOKEN=your-token node register-subdomain.js
 */

const https = require('https');

const ACCOUNT_ID = 'b73758cf519e76a1062533b1244ca587';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

if (!API_TOKEN) {
  console.error('❌ Error: CLOUDFLARE_API_TOKEN environment variable is required');
  console.error('\nTo get an API token:');
  console.error('1. Visit: https://dash.cloudflare.com/profile/api-tokens');
  console.error('2. Create a token with "Workers:Edit" permissions');
  console.error('3. Run: CLOUDFLARE_API_TOKEN=your-token node register-subdomain.js');
  process.exit(1);
}

const options = {
  hostname: 'api.cloudflare.com',
  path: `/client/v4/accounts/${ACCOUNT_ID}/workers/subdomain`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
  },
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.success) {
        console.log('✅ Successfully registered workers.dev subdomain!');
        console.log('📝 Subdomain:', response.result?.subdomain || 'registered');
        console.log('\n🚀 You can now deploy with: npm run release');
      } else {
        console.error('❌ Failed to register subdomain:');
        console.error(JSON.stringify(response, null, 2));
        if (response.errors) {
          response.errors.forEach(err => {
            if (err.code === 10000) {
              console.error('\n💡 Subdomain may already be registered. Try deploying now.');
            }
          });
        }
      }
    } catch (e) {
      console.error('❌ Error parsing response:', e);
      console.error('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.end();

console.log('🔄 Registering workers.dev subdomain...');


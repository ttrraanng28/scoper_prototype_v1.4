#!/usr/bin/env node

/**
 * Deployment Test Script
 * Tests the deployed Claude Chat UI endpoints
 */

const https = require('https');
const http = require('http');

// Configuration
const config = {
  // Update these URLs after deployment
  backendUrl: process.env.BACKEND_URL || 'https://claude-chat-backend.YOUR_SUBDOMAIN.workers.dev',
  frontendUrl: process.env.FRONTEND_URL || 'https://YOUR_APP.vercel.app',
  testMessage: 'Hello, can you help me with my business?'
};

console.log('🚀 Testing Claude Chat UI Deployment\n');

// Test 1: Backend Health Check
async function testBackendHealth() {
  console.log('1. Testing backend health endpoint...');
  
  return new Promise((resolve, reject) => {
    const url = new URL(config.backendUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: '/',
      method: 'GET',
      headers: {
        'User-Agent': 'deployment-test/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.status === 'ok') {
            console.log('   ✅ Backend health check passed');
            console.log(`   📊 Environment: ${response.environment || 'unknown'}`);
            resolve(true);
          } else {
            console.log('   ❌ Backend health check failed - unexpected response');
            resolve(false);
          }
        } catch (error) {
          console.log('   ❌ Backend health check failed - invalid JSON response');
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Backend health check failed - ${error.message}`);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.log('   ❌ Backend health check failed - timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Test 2: CORS Preflight
async function testCORS() {
  console.log('\n2. Testing CORS configuration...');
  
  return new Promise((resolve, reject) => {
    const url = new URL(config.backendUrl + '/chat');
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: '/chat',
      method: 'OPTIONS',
      headers: {
        'Origin': config.frontendUrl,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    };

    const req = https.request(options, (res) => {
      const corsHeaders = {
        origin: res.headers['access-control-allow-origin'],
        methods: res.headers['access-control-allow-methods'],
        headers: res.headers['access-control-allow-headers']
      };

      if (corsHeaders.origin && corsHeaders.methods && corsHeaders.headers) {
        console.log('   ✅ CORS preflight passed');
        console.log(`   🌐 Allowed origin: ${corsHeaders.origin}`);
        resolve(true);
      } else {
        console.log('   ❌ CORS preflight failed - missing headers');
        console.log('   📋 Received headers:', corsHeaders);
        resolve(false);
      }
    });

    req.on('error', (error) => {
      console.log(`   ❌ CORS test failed - ${error.message}`);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.log('   ❌ CORS test failed - timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Test 3: Chat API (if API key is configured)
async function testChatAPI() {
  console.log('\n3. Testing chat API endpoint...');
  
  return new Promise((resolve, reject) => {
    const url = new URL(config.backendUrl + '/chat');
    const postData = JSON.stringify({
      message: config.testMessage,
      conversationHistory: []
    });

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: '/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Origin': config.frontendUrl
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.error) {
            if (response.error.includes('Authentication') || response.error.includes('API configuration')) {
              console.log('   ⚠️  Chat API test skipped - API key not configured');
              console.log('   💡 This is expected if ANTHROPIC_API_KEY is not set');
            } else {
              console.log(`   ❌ Chat API test failed - ${response.error}`);
            }
            resolve(false);
          } else if (response.response) {
            console.log('   ✅ Chat API test passed');
            console.log(`   💬 Response length: ${response.response.length} characters`);
            resolve(true);
          } else {
            console.log('   ❌ Chat API test failed - unexpected response format');
            resolve(false);
          }
        } catch (error) {
          console.log('   ❌ Chat API test failed - invalid JSON response');
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Chat API test failed - ${error.message}`);
      resolve(false);
    });

    req.setTimeout(30000, () => {
      console.log('   ❌ Chat API test failed - timeout (30s)');
      req.destroy();
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Test 4: Frontend Accessibility
async function testFrontend() {
  console.log('\n4. Testing frontend accessibility...');
  
  return new Promise((resolve, reject) => {
    const url = new URL(config.frontendUrl);
    const protocol = url.protocol === 'https:' ? https : http;
    const port = url.port || (url.protocol === 'https:' ? 443 : 80);

    const options = {
      hostname: url.hostname,
      port: port,
      path: '/',
      method: 'GET',
      headers: {
        'User-Agent': 'deployment-test/1.0'
      }
    };

    const req = protocol.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log('   ✅ Frontend accessible');
        console.log(`   📊 Status: ${res.statusCode}`);
        resolve(true);
      } else {
        console.log(`   ❌ Frontend test failed - Status: ${res.statusCode}`);
        resolve(false);
      }
    });

    req.on('error', (error) => {
      console.log(`   ❌ Frontend test failed - ${error.message}`);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.log('   ❌ Frontend test failed - timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log(`Backend URL: ${config.backendUrl}`);
  console.log(`Frontend URL: ${config.frontendUrl}\n`);

  const results = {
    health: await testBackendHealth(),
    cors: await testCORS(),
    chat: await testChatAPI(),
    frontend: await testFrontend()
  };

  console.log('\n📊 Test Results Summary:');
  console.log(`   Backend Health: ${results.health ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   CORS Config: ${results.cors ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Chat API: ${results.chat ? '✅ PASS' : '⚠️  SKIP/FAIL'}`);
  console.log(`   Frontend: ${results.frontend ? '✅ PASS' : '❌ FAIL'}`);

  const passCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  console.log(`\n🎯 Overall: ${passCount}/${totalTests} tests passed`);

  if (passCount >= 3) {
    console.log('🎉 Deployment appears to be working correctly!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check the deployment configuration.');
    process.exit(1);
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Usage: node test-deployment.js [options]

Environment Variables:
  BACKEND_URL   - Backend worker URL (default: placeholder)
  FRONTEND_URL  - Frontend Vercel URL (default: placeholder)

Examples:
  BACKEND_URL=https://your-worker.workers.dev FRONTEND_URL=https://your-app.vercel.app node test-deployment.js
  
Note: Update the URLs in this script or use environment variables before running.
`);
  process.exit(0);
}

// Validate URLs
if (config.backendUrl.includes('YOUR_SUBDOMAIN') || config.frontendUrl.includes('YOUR_APP')) {
  console.log('❌ Please update the URLs in test-deployment.js or set environment variables:');
  console.log('   BACKEND_URL=https://your-worker.workers.dev');
  console.log('   FRONTEND_URL=https://your-app.vercel.app');
  console.log('\nThen run: node test-deployment.js');
  process.exit(1);
}

runTests().catch(console.error);
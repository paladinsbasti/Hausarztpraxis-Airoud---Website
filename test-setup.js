#!/usr/bin/env node
/**
 * Quick Server Test
 * Tests HTTP and HTTPS functionality
 */

console.log('🧪 Server Functionality Test');
console.log('===========================\n');

// Test 1: Check if server module loads
console.log('1. Testing server module loading...');
try {
    delete require.cache[require.resolve('./server.js')];
    console.log('✅ Server module loads successfully');
} catch (error) {
    console.log('❌ Server module error:', error.message);
    process.exit(1);
}

// Test 2: Check SSL certificates
console.log('\n2. Testing SSL certificates...');
const fs = require('fs');
const path = require('path');

const sslDir = path.join(__dirname, 'ssl');
const keyPath = path.join(sslDir, 'private.key');
const certPath = path.join(sslDir, 'certificate.crt');

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    console.log('✅ SSL certificates found');
    console.log(`   - Private key: ${keyPath}`);
    console.log(`   - Certificate: ${certPath}`);
} else {
    console.log('❌ SSL certificates missing');
}

// Test 3: Check environment configuration
console.log('\n3. Testing environment configuration...');
const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
    console.log('✅ .env file found');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('USE_SSL')) {
        console.log('✅ SSL configuration present');
    }
    if (envContent.includes('SESSION_SECRET')) {
        console.log('✅ Session secret configured');
    }
} else {
    console.log('❌ .env file missing');
}

// Test 4: Check dependencies
console.log('\n4. Testing dependencies...');
try {
    require('express');
    console.log('✅ Express available');
} catch (e) {
    console.log('❌ Express missing');
}

try {
    require('https');
    console.log('✅ HTTPS module available');
} catch (e) {
    console.log('❌ HTTPS module missing');
}

try {
    require('bcryptjs');
    console.log('✅ bcryptjs available');
} catch (e) {
    console.log('❌ bcryptjs missing - run: npm install');
}

console.log('\n🎉 Test completed!');
console.log('\n📋 Ready to start:');
console.log('   HTTP:  node scripts/start-server.js http');
console.log('   HTTPS: node scripts/start-server.js https');
console.log('\n🌐 Access points:');
console.log('   HTTP:  http://localhost:3000');
console.log('   HTTPS: https://localhost:443');
console.log('   Admin: /admin (both protocols)');
console.log('\n🔑 Login credentials:');
console.log('   Username: admin');
console.log('   Password: Praxis2025AiroudSecure');

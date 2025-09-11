#!/usr/bin/env node
/**
 * Windows Development Server Launcher
 * Handles both HTTP and HTTPS modes properly
 */

const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const mode = args[0] || 'http';

console.log('🚀 Hausarztpraxis Airoud Server Launcher');
console.log('=======================================');

let command, serverArgs, envVars;

switch (mode.toLowerCase()) {
    case 'https':
    case 'ssl':
        console.log('🔒 Starte HTTPS Development Server...');
        envVars = {
            ...process.env,
            NODE_ENV: 'development',
            USE_SSL: 'true',
            HTTPS_PORT: '443',
            REDIRECT_HTTP: 'false'
        };
        break;
        
    case 'production':
    case 'prod':
        console.log('🏭 Starte Production HTTPS Server...');
        envVars = {
            ...process.env,
            NODE_ENV: 'production',
            USE_SSL: 'true',
            HTTPS_PORT: '443',
            REDIRECT_HTTP: 'true'
        };
        break;
        
    default:
        console.log('🌐 Starte HTTP Development Server...');
        envVars = {
            ...process.env,
            NODE_ENV: 'development',
            USE_SSL: 'false',
            PORT: '3000'
        };
}

console.log('');

// Start the server
const serverProcess = spawn('node', ['server.js'], {
    env: envVars,
    stdio: 'inherit',
    shell: true
});

serverProcess.on('error', (err) => {
    console.error('❌ Fehler beim Starten des Servers:', err.message);
    process.exit(1);
});

serverProcess.on('close', (code) => {
    console.log(`\n📊 Server beendet mit Code: ${code}`);
    process.exit(code);
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
    console.log('\n🛑 Server wird beendet...');
    serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Server wird beendet...');
    serverProcess.kill('SIGTERM');
});

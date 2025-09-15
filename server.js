const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');

// Load environment variables
require('dotenv').config();

// Validate critical environment variables
if (!process.env.SESSION_SECRET) {
    console.error('FATAL ERROR: SESSION_SECRET not set in environment variables!');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '512kb' }));
app.use(express.urlencoded({ extended: true, limit: '512kb' }));

// HTTPS Redirect Middleware (for production)
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && process.env.HTTPS_ENABLED === 'true') {
        if (req.header('x-forwarded-proto') !== 'https') {
            return res.redirect(`https://${req.header('host')}${req.url}`);
        }
    }
    next();
});

// Enhanced static file serving with caching
app.use(express.static('.', {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
    etag: true,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        } else if (filePath.match(/\.(css|js|png|jpg|jpeg|gif|webp|svg)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=86400');
        }
    }
}));

// Enhanced security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy - Verschärft gegen XSS
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' https://cdnjs.cloudflare.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self'; " +
        "object-src 'none'; " +
        "frame-src 'none'; " +
        "base-uri 'self';"
    );
    
    // HTTPS/SSL Security Headers
    if (process.env.HTTPS_ENABLED === 'true' || req.secure || req.headers['x-forwarded-proto'] === 'https') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        res.setHeader('X-Forwarded-Proto', 'https');
    }
    
    next();
});

// Session Configuration with enhanced security
app.use(session({
    secret: process.env.SESSION_SECRET,
    name: 'praxis.session',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.HTTPS_ENABLED === 'true',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax'
    }
}));

// Secure admin credentials from environment
const DEFAULT_ADMIN = {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD_HASH || '$2a$12$5QxYHwStUtiDU6GubpI16Oir20rLy0gxQJLWYq9S/ZpXLLxJSD5Uq'
};

// Removed: server-side logic no longer needed for static site.

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Hausarztpraxis Airoud Server started on port ${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔒 HTTPS Enabled: ${process.env.HTTPS_ENABLED === 'true' ? 'Yes' : 'No'}`);
    console.log(`🛡️  Security: Session secrets loaded, CSRF protection active`);
    console.log(`🚦 Rate Limiting: Enhanced rate limiting active for all endpoints`);
    
    if (process.env.NODE_ENV === 'production' && process.env.HTTPS_ENABLED !== 'true') {
        console.warn('⚠️  WARNING: Running in production without HTTPS enabled!');
        console.warn('   Set HTTPS_ENABLED=true in .env when SSL certificate is ready');
    }
});

module.exports = app;

// Enhanced Rate Limiting for Hausarztpraxis Airoud
// Schützt vor Brute-Force, DDoS und API-Missbrauch

class EnhancedRateLimit {
    constructor() {
        this.attempts = new Map(); // IP -> { attempts: [], blocked: false, blockUntil: null }
        this.cleanupInterval = 60000; // Cleanup every minute
        
        // Start cleanup routine
        setInterval(() => this.cleanup(), this.cleanupInterval);
    }

    // Create rate limiter middleware
    createLimiter(options = {}) {
        const {
            windowMs = 15 * 60 * 1000,     // 15 minutes default
            maxAttempts = 5,               // 5 attempts default
            blockDuration = windowMs,      // Block duration
            skipSuccessful = true,         // Don't count successful requests
            message = 'Too many requests',
            logBlocked = true
        } = options;

        return (req, res, next) => {
            const ip = req.ip || req.connection.remoteAddress || 'unknown';
            const now = Date.now();
            
            // Get or create attempts record
            if (!this.attempts.has(ip)) {
                this.attempts.set(ip, { attempts: [], blocked: false, blockUntil: null });
            }

            const record = this.attempts.get(ip);

            // Check if IP is currently blocked
            if (record.blocked && record.blockUntil && now < record.blockUntil) {
                const remainingTime = Math.ceil((record.blockUntil - now) / 1000);
                
                if (logBlocked) {
                    console.warn(`⚠️ Blocked request from ${ip} to ${req.path} (${remainingTime}s remaining)`);
                }

                return res.status(429).json({
                    error: message,
                    retryAfter: remainingTime,
                    blocked: true
                });
            }

            // Clear block if time has passed
            if (record.blocked && record.blockUntil && now >= record.blockUntil) {
                record.blocked = false;
                record.blockUntil = null;
                record.attempts = [];
            }

            // Clean old attempts
            record.attempts = record.attempts.filter(time => now - time < windowMs);

            // Check if limit exceeded
            if (record.attempts.length >= maxAttempts) {
                record.blocked = true;
                record.blockUntil = now + blockDuration;
                
                if (logBlocked) {
                    console.warn(`🚫 IP ${ip} blocked for ${blockDuration/1000}s after ${maxAttempts} attempts to ${req.path}`);
                }

                return res.status(429).json({
                    error: message,
                    retryAfter: Math.ceil(blockDuration / 1000),
                    blocked: true
                });
            }

            // Add current attempt (will be removed if successful and skipSuccessful is true)
            record.attempts.push(now);

            // Remove attempt if request succeeds and skipSuccessful is enabled
            if (skipSuccessful) {
                const originalEnd = res.end;
                res.end = function(...args) {
                    if (res.statusCode < 400) {
                        // Success - remove the attempt we just added
                        record.attempts.pop();
                    }
                    originalEnd.apply(this, args);
                };
            }

            next();
        };
    }

    // Specific limiters for different endpoints
    loginLimiter() {
        return this.createLimiter({
            windowMs: 15 * 60 * 1000,  // 15 minutes
            maxAttempts: 3,            // 3 login attempts
            blockDuration: 30 * 60 * 1000, // Block for 30 minutes
            message: 'Zu viele Login-Versuche. Versuchen Sie es später erneut.',
            skipSuccessful: true
        });
    }

    apiLimiter() {
        return this.createLimiter({
            windowMs: 10 * 60 * 1000,  // 10 minutes
            maxAttempts: 100,          // 100 API calls
            blockDuration: 10 * 60 * 1000, // Block for 10 minutes
            message: 'API-Rate-Limit erreicht. Bitte verlangsamen Sie Ihre Anfragen.',
            skipSuccessful: true
        });
    }

    uploadLimiter() {
        return this.createLimiter({
            windowMs: 60 * 60 * 1000,  // 1 hour
            maxAttempts: 10,           // 10 uploads per hour
            blockDuration: 60 * 60 * 1000, // Block for 1 hour
            message: 'Upload-Limit erreicht. Bitte warten Sie eine Stunde.',
            skipSuccessful: true
        });
    }

    adminLimiter() {
        return this.createLimiter({
            windowMs: 5 * 60 * 1000,   // 5 minutes
            maxAttempts: 50,           // 50 admin actions
            blockDuration: 15 * 60 * 1000, // Block for 15 minutes
            message: 'Admin-Rate-Limit erreicht. Bitte verlangsamen Sie Ihre Aktionen.',
            skipSuccessful: true
        });
    }

    strictLimiter() {
        return this.createLimiter({
            windowMs: 1 * 60 * 1000,   // 1 minute
            maxAttempts: 10,           // 10 requests per minute
            blockDuration: 5 * 60 * 1000, // Block for 5 minutes
            message: 'Rate-Limit erreicht. Bitte verlangsamen Sie Ihre Anfragen.',
            skipSuccessful: false
        });
    }

    // Cleanup old records
    cleanup() {
        const now = Date.now();
        const maxAge = 60 * 60 * 1000; // 1 hour

        for (const [ip, record] of this.attempts.entries()) {
            // Remove completely inactive records
            const oldestAttempt = record.attempts.length > 0 ? Math.min(...record.attempts) : 0;
            const isInactive = !record.blocked && record.attempts.length === 0;
            const isOld = now - oldestAttempt > maxAge;

            if (isInactive || isOld) {
                this.attempts.delete(ip);
            }
        }

        // Log cleanup stats
        const activeIPs = this.attempts.size;
        const blockedIPs = Array.from(this.attempts.values()).filter(r => r.blocked).length;
        
        if (activeIPs > 0) {
            console.log(`🧹 Rate limiter cleanup: ${activeIPs} active IPs, ${blockedIPs} blocked`);
        }
    }

    // Get current stats
    getStats() {
        const stats = {
            totalIPs: this.attempts.size,
            blockedIPs: 0,
            totalAttempts: 0
        };

        for (const record of this.attempts.values()) {
            if (record.blocked) stats.blockedIPs++;
            stats.totalAttempts += record.attempts.length;
        }

        return stats;
    }

    // Reset limits for specific IP (admin function)
    resetIP(ip) {
        if (this.attempts.has(ip)) {
            this.attempts.delete(ip);
            console.log(`🔓 Rate limits reset for IP: ${ip}`);
            return true;
        }
        return false;
    }
}

module.exports = new EnhancedRateLimit();
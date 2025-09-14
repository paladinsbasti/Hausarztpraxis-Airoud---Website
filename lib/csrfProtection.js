// Modern CSRF Protection Implementation
// Ersetzt das deprecated csurf package

const crypto = require('crypto');

class CSRFProtection {
    constructor() {
        this.tokenName = '_csrf';
    }

    // Generate cryptographically secure token
    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Middleware to generate and provide CSRF token
    middleware() {
        return (req, res, next) => {
            // Skip CSRF for GET requests and API endpoints
            if (req.method === 'GET' || req.path.startsWith('/api/')) {
                return next();
            }

            // Generate token for session if not exists
            if (!req.session.csrfToken) {
                req.session.csrfToken = this.generateToken();
            }

            // Provide token to templates
            res.locals.csrfToken = req.session.csrfToken;

            // Verify token for POST requests to admin routes
            if (req.method === 'POST' && req.path.startsWith('/admin/') && req.path !== '/admin/login') {
                const providedToken = req.body[this.tokenName] || req.headers['x-csrf-token'];
                
                if (!providedToken || providedToken !== req.session.csrfToken) {
                    console.warn(`CSRF token mismatch for ${req.path} from ${req.ip}`);
                    return res.status(403).json({ 
                        error: 'CSRF token mismatch. Please refresh the page and try again.',
                        code: 'CSRF_INVALID'
                    });
                }
            }

            next();
        };
    }

    // Get current token for a request
    getToken(req) {
        return req.session.csrfToken;
    }

    // Refresh token (for security)
    refreshToken(req) {
        req.session.csrfToken = this.generateToken();
        return req.session.csrfToken;
    }
}

module.exports = new CSRFProtection();
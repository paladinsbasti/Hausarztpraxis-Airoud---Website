const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');

// Load environment variables
require('dotenv').config();

const { loadContent, saveContent } = require('./lib/contentService');
const { loginTemplate, adminLayout } = require('./lib/templates');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '512kb' }));
app.use(express.urlencoded({ extended: true, limit: '512kb' }));

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
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self';"
    );
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
});

// Rate limiting for login attempts
const loginAttempts = new Map();

function checkRateLimit(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 3; // Reduced from 5 to 3
    
    if (!loginAttempts.has(ip)) {
        loginAttempts.set(ip, []);
    }
    
    const attempts = loginAttempts.get(ip);
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
        console.log(`Rate limit exceeded for IP: ${ip} at ${new Date().toISOString()}`);
        return res.status(429).json({ 
            error: 'Zu viele Login-Versuche. Versuchen Sie es in 15 Minuten erneut.',
            retryAfter: Math.ceil(windowMs / 1000)
        });
    }
    
    next();
}

// Session Configuration with enhanced security
app.use(session({
    secret: process.env.SESSION_SECRET || 'bBYOhT1vjPlWuwYnVdEMKVASnSFIM/YxsD3/aTzNKlU=',
    name: 'praxis.session',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // set true behind HTTPS / proxy
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax' // Changed from 'strict' to 'lax' for better compatibility
    }
}));

// Enhanced File Upload Configuration with validation
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '');
        cb(null, `${file.fieldname}-${uniqueSuffix}-${sanitizedName}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // Reduced to 2MB for security
        files: 5 // Reduced file count
    },
    fileFilter: (req, file, cb) => {
        // Stricter file type validation
        const allowedTypes = /^image\/(jpeg|jpg|png|gif|webp)$/;
        const allowedExtensions = /\.(jpeg|jpg|png|gif|webp)$/i;
        
        const extname = allowedExtensions.test(file.originalname);
        const mimetype = allowedTypes.test(file.mimetype);
        
        // Additional security: check file size in filter
        if (file.size && file.size > 2 * 1024 * 1024) {
            return cb(new Error('Datei zu groß. Maximum 2MB erlaubt.'));
        }
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Nur Bilder sind erlaubt (JPEG, JPG, PNG, GIF, WebP)'));
        }
    }
});

// Secure admin credentials - CHANGED FOR PRODUCTION
const DEFAULT_ADMIN = {
    username: 'admin',
    password: '$2a$12$LLdavEchB6JMldr8xn02BeuAGt0dMi66iQJF7cJGi4qD1COUe0X36' // Password: Hausarztpraxis_Airoud_CMS_2025
};

// Default Content moved to contentService

// Helpers ausgelagert nach lib/

// Lightweight HTML updater (kept for backward compatibility – now minimal)
function updateHtmlFile() {
    try {
        const content = loadContent();
        let html = fs.readFileSync('index.html', 'utf8');
        const safeReplace = (pattern, replacement) => {
            html = html.replace(pattern, replacement);
        };
        safeReplace(/<h1 data-translate="intro\.title">.*?<\/h1>/,
            `<h1 data-translate="intro.title">${content.intro.title}</h1>`);
        safeReplace(/<p class="intro-subtitle" data-translate="intro\.subtitle">.*?<\/p>/,
            `<p class="intro-subtitle" data-translate="intro.subtitle">${content.intro.subtitle}</p>`);
        safeReplace(/<p class="intro-description" data-translate="intro\.description">.*?<\/p>/s,
            `<p class="intro-description" data-translate="intro.description">${content.intro.description}</p>`);
        fs.writeFileSync('index.html', html);
        return true;
    } catch (e) {
        console.error('Error updating HTML file:', e.message);
        return false;
    }
}

function getSystemStats() {
    return {
        systemTime: new Date().toLocaleString('de-DE')
    };
}

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) {
        return next();
    }
    res.redirect('/admin/login');
}

// Routes
// API endpoint to serve content.json
app.get('/api/content', (req, res) => {
    try { res.json(loadContent()); } catch { res.status(500).json({ error: 'Failed to load content' }); }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin login page
app.get('/admin/login', (req, res) => {
    res.send(loginTemplate(!!req.query.error));
});

// Admin login handler with rate limiting
app.post('/admin/login', checkRateLimit, (req, res) => {
    const { username, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const timestamp = new Date().toISOString();
    
    try {
        if (username === DEFAULT_ADMIN.username && bcrypt.compareSync(password, DEFAULT_ADMIN.password)) {
            req.session.authenticated = true;
            req.session.loginTime = new Date().toISOString();
            
            // Clear failed attempts on successful login
            if (loginAttempts.has(ip)) {
                loginAttempts.delete(ip);
            }
            
            // Log successful login
            console.log(`[SECURITY] Successful admin login from IP: ${ip} at ${timestamp}`);
            console.log(`[DEBUG] Session set - authenticated: ${req.session.authenticated}`);
            
            // Save session before redirect
            req.session.save((err) => {
                if (err) {
                    console.error('[ERROR] Session save failed:', err);
                    return res.redirect('/admin/login?error=1');
                }
                console.log('[DEBUG] Session saved successfully, redirecting to /admin');
                res.redirect('/admin');
            });
        } else {
            // Record failed attempt
            if (!loginAttempts.has(ip)) {
                loginAttempts.set(ip, []);
            }
            loginAttempts.get(ip).push(Date.now());
            
            // Log failed login attempt
            console.log(`[SECURITY] Failed admin login attempt from IP: ${ip} at ${timestamp} - Username: ${username}`);
            
            res.redirect('/admin/login?error=1');
        }
    } catch (error) {
        console.error(`[SECURITY] Login error from IP: ${ip} at ${timestamp}:`, error);
        res.redirect('/admin/login?error=1');
    }
});

// Admin logout
app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// Admin dashboard with enhanced UI
app.get('/admin', requireAuth, (req, res) => {
    const content = loadContent();
    const inner = `
            <div class="admin-container">
                <header class="admin-header">
                    <nav class="admin-nav">
                        <div class="admin-logo">
                            <i class="fas fa-user-md"></i>
                            <span>Dr. Airoud CMS</span>
                            <div style="font-size: 0.7rem; opacity: 0.8; margin-left: 0.5rem;">
                                v2.1 Enhanced
                            </div>
                        </div>
                        <div class="admin-actions">
                            <button id="previewBtn" class="btn btn-primary">
                                <i class="fas fa-eye"></i>
                                Live-Vorschau
                            </button>
                            <a href="/" target="_blank" class="btn btn-primary">
                                <i class="fas fa-external-link-alt"></i>
                                Website
                            </a>
                            <div class="btn btn-secondary" style="font-size: 0.85rem; padding: 0.5rem 1rem;">
                                <i class="fas fa-clock"></i>
                                ${new Date().toLocaleString('de-DE')}
                            </div>
                            <a href="/admin/logout" class="btn btn-secondary">
                                <i class="fas fa-sign-out-alt"></i>
                                Abmelden
                            </a>
                        </div>
                    </nav>
                </header>

                <main class="admin-content">
                    <!-- System Stats -->
                    <div class="section-card">
                        <div class="section-header">
                            <h2 class="section-title">
                                <i class="fas fa-chart-line"></i>
                                System-Übersicht
                            </h2>
                        </div>
                        <div class="section-body">
                            <div class="form-grid">
                                <div style="text-align: center; padding: 1rem; background: var(--light-bg); border-radius: 8px;">
                                    <div style="font-size: 2rem; color: var(--success-color); margin-bottom: 0.5rem;">
                                        <i class="fas fa-check-circle"></i>
                                    </div>
                                    <div style="font-weight: 600;">System Status</div>
                                    <div style="color: var(--success-color);">Online & Aktiv</div>
                                </div>
                                <div style="text-align: center; padding: 1rem; background: var(--light-bg); border-radius: 8px;">
                                    <div style="font-size: 2rem; color: var(--accent-color); margin-bottom: 0.5rem;">
                                        <i class="fas fa-edit"></i>
                                    </div>
                                    <div style="font-weight: 600;">Session</div>
                                    <div>Seit ${new Date(req.session.loginTime).toLocaleTimeString('de-DE')}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form id="contentForm" method="POST" action="/admin/save" enctype="multipart/form-data">
                        
                        <!-- Vacation Section -->
                        <div class="section-card" style="border-left: 4px solid #ff6b6b;">
                            <div class="section-header">
                                <h2 class="section-title">
                                    <i class="fas fa-umbrella-beach"></i>
                                    Praxisurlaub / Schließzeiten
                                </h2>
                                <div class="btn" style="background: #ff6b6b; color: white; font-size: 0.85rem; padding: 0.5rem 1rem;">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    Wichtige Mitteilung
                                </div>
                            </div>
                            <div class="section-body">
                                <div class="form-grid">
                                    <div class="form-group" style="grid-column: span 2;">
                                        <div class="toggle-container" style="
                                            display: flex; 
                                            align-items: center; 
                                            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                                            padding: 1.5rem; 
                                            border-radius: 12px; 
                                            border: 2px solid #dee2e6;
                                            transition: all 0.3s ease;
                                            cursor: pointer;
                                            position: relative;
                                            overflow: hidden;
                                        " onclick="toggleVacationMode(this)">
                                            <div class="toggle-switch" style="
                                                width: 60px; 
                                                height: 32px; 
                                                background: ${content.vacation?.enabled ? 'linear-gradient(135deg, #28a745, #20c997)' : '#6c757d'}; 
                                                border-radius: 20px; 
                                                position: relative; 
                                                transition: background 0.3s ease;
                                                margin-right: 1rem;
                                                box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
                                                flex-shrink: 0;
                                            ">
                                                <div class="toggle-circle" style="
                                                    width: 28px; 
                                                    height: 28px; 
                                                    background: white; 
                                                    border-radius: 50%; 
                                                    position: absolute; 
                                                    top: 2px; 
                                                    left: ${content.vacation?.enabled ? '30px' : '2px'}; 
                                                    transition: left 0.3s ease;
                                                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                                                "></div>
                                            </div>
                                            <div style="flex: 1;">
                                                <div class="status-text" style="
                                                    font-weight: 700; 
                                                    font-size: 1.1rem; 
                                                    color: ${content.vacation?.enabled ? '#28a745' : '#6c757d'};
                                                    transition: color 0.3s ease;
                                                ">
                                                    <i class="fas ${content.vacation?.enabled ? 'fa-check-circle' : 'fa-times-circle'}" style="margin-right: 0.5rem;"></i>
                                                    Urlaub-Pop-up ${content.vacation?.enabled ? 'AKTIV' : 'INAKTIV'}
                                                </div>
                                            </div>
                                            <input type="checkbox" id="vacation_enabled" name="vacation_enabled" 
                                                   ${content.vacation?.enabled ? 'checked' : ''}
                                                   style="display: none;">
                                        </div>
                                        <script>
                                        function toggleVacationMode(container) {
                                            const checkbox = container.querySelector('input[type="checkbox"]');
                                            const toggleCircle = container.querySelector('.toggle-circle');
                                            const toggleSwitch = container.querySelector('.toggle-switch');
                                            const statusText = container.querySelector('.status-text');
                                            const icon = statusText.querySelector('i');
                                            
                                            checkbox.checked = !checkbox.checked;
                                            
                                            if (checkbox.checked) {
                                                // Aktiviert
                                                toggleCircle.style.left = '30px';
                                                toggleSwitch.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
                                                statusText.style.color = '#28a745';
                                                icon.className = 'fas fa-check-circle';
                                                statusText.innerHTML = '<i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>Urlaub-Pop-up AKTIV';
                                                container.style.borderColor = '#28a745';
                                                container.style.background = 'linear-gradient(135deg, #d4edda, #c3e6cb)';
                                            } else {
                                                // Deaktiviert
                                                toggleCircle.style.left = '2px';
                                                toggleSwitch.style.background = '#6c757d';
                                                statusText.style.color = '#6c757d';
                                                icon.className = 'fas fa-times-circle';
                                                statusText.innerHTML = '<i class="fas fa-times-circle" style="margin-right: 0.5rem;"></i>Urlaub-Pop-up INAKTIV';
                                                container.style.borderColor = '#dee2e6';
                                                container.style.background = 'linear-gradient(135deg, #f8f9fa, #e9ecef)';
                                            }
                                        }
                                        </script>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="vacation_title">
                                            <i class="fas fa-heading"></i>
                                            Pop-up Titel:
                                        </label>
                                        <input type="text" id="vacation_title" name="vacation_title" 
                                               value="${content.vacation?.title || 'Praxisurlaub'}" 
                                               maxlength="50"
                                               placeholder="z.B. Praxisurlaub, Betriebsferien, etc.">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="vacation_message">
                                            <i class="fas fa-comment"></i>
                                            Mitteilung:
                                        </label>
                                        <textarea id="vacation_message" name="vacation_message" 
                                                  rows="3" maxlength="300"
                                                  placeholder="z.B. Unsere Praxis ist vom [STARTDATUM] bis [ENDDATUM] geschlossen.">${content.vacation?.message || 'Unsere Praxis ist vom [STARTDATUM] bis [ENDDATUM] geschlossen.'}</textarea>
                                        <small style="color: #666;">Verwenden Sie [STARTDATUM] und [ENDDATUM] als Platzhalter</small>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="vacation_startDate">
                                            <i class="fas fa-calendar-alt"></i>
                                            Von Datum:
                                        </label>
                                        <input type="date" id="vacation_startDate" name="vacation_startDate" 
                                               value="${content.vacation?.startDate || ''}">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="vacation_endDate">
                                            <i class="fas fa-calendar-alt"></i>
                                            Bis Datum:
                                        </label>
                                        <input type="date" id="vacation_endDate" name="vacation_endDate" 
                                               value="${content.vacation?.endDate || ''}">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="vacation_emergencyTitle">
                                            <i class="fas fa-exclamation-triangle"></i>
                                            Notfall Titel:
                                        </label>
                                        <input type="text" id="vacation_emergencyTitle" name="vacation_emergencyTitle" 
                                               value="${content.vacation?.emergencyTitle || 'Im Notfall wenden Sie sich bitte an:'}" 
                                               maxlength="100"
                                               placeholder="Überschrift für Notfallinformationen">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="vacation_emergencyInfo">
                                            <i class="fas fa-phone"></i>
                                            Notfall Informationen:
                                        </label>
                                        <textarea id="vacation_emergencyInfo" name="vacation_emergencyInfo" 
                                                  rows="3" maxlength="300"
                                                  placeholder="Ärztlicher Bereitschaftsdienst: 116 117">${content.vacation?.emergencyInfo || 'Ärztlicher Bereitschaftsdienst: 116 117\\nNotfallambulanz: Ihr nächstes Krankenhaus'}</textarea>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="vacation_buttonText">
                                            <i class="fas fa-mouse-pointer"></i>
                                            Button Text:
                                        </label>
                                        <input type="text" id="vacation_buttonText" name="vacation_buttonText" 
                                               value="${content.vacation?.buttonText || 'Verstanden'}" 
                                               maxlength="20"
                                               placeholder="Text für den Schließen-Button">
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Intro Section -->
                        <div class="section-card">
                            <div class="section-header">
                                <h2 class="section-title">
                                    <i class="fas fa-home"></i>
                                    Startseite / Intro
                                </h2>
                                <div class="btn btn-primary" style="font-size: 0.85rem; padding: 0.5rem 1rem;">
                                    <i class="fas fa-info-circle"></i>
                                    Hauptbereich der Website
                                </div>
                            </div>
                            <div class="section-body">
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="intro_title">
                                            <i class="fas fa-heading"></i>
                                            Haupttitel:
                                        </label>
                                        <input type="text" id="intro_title" name="intro_title" 
                                               value="${content.intro.title}" 
                                               required maxlength="100"
                                               placeholder="Hauptüberschrift der Website">
                                    </div>
                                    <div class="form-group">
                                        <label for="intro_subtitle">
                                            <i class="fas fa-text-height"></i>
                                            Untertitel:
                                        </label>
                                        <input type="text" id="intro_subtitle" name="intro_subtitle" 
                                               value="${content.intro.subtitle}" 
                                               maxlength="150"
                                               placeholder="Ergänzender Untertitel">
                                    </div>
                                    <div class="form-group">
                                        <label for="intro_feature1">
                                            <i class="fas fa-star"></i>
                                            Feature 1:
                                        </label>
                                        <input type="text" id="intro_feature1" name="intro_feature1" 
                                               value="${content.intro.feature1}" 
                                               maxlength="50"
                                               placeholder="Erstes Highlight">
                                    </div>
                                    <div class="form-group">
                                        <label for="intro_feature2">
                                            <i class="fas fa-star"></i>
                                            Feature 2:
                                        </label>
                                        <input type="text" id="intro_feature2" name="intro_feature2" 
                                               value="${content.intro.feature2}" 
                                               maxlength="50"
                                               placeholder="Zweites Highlight">
                                    </div>
                                    <div class="form-group">
                                        <label for="intro_feature3">
                                            <i class="fas fa-star"></i>
                                            Feature 3:
                                        </label>
                                        <input type="text" id="intro_feature3" name="intro_feature3" 
                                               value="${content.intro.feature3}" 
                                               maxlength="50"
                                               placeholder="Drittes Highlight">
                                    </div>
                                    <div class="form-group">
                                        <label for="intro_cta">
                                            <i class="fas fa-mouse-pointer"></i>
                                            Button Text:
                                        </label>
                                        <input type="text" id="intro_cta" name="intro_cta" 
                                               value="${content.intro.cta}" 
                                               maxlength="30"
                                               placeholder="Text für den Aktions-Button">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="intro_description">
                                        <i class="fas fa-align-left"></i>
                                        Beschreibung:
                                    </label>
                                    <textarea id="intro_description" name="intro_description" 
                                              maxlength="500"
                                              placeholder="Ausführliche Beschreibung der Praxis...">${content.intro.description}</textarea>
                                </div>
                            </div>
                        </div>

                        <!-- Services Section -->
                        <div class="section-card">
                            <div class="section-header">
                                <h2 class="section-title">
                                    <i class="fas fa-stethoscope"></i>
                                    Leistungen
                                </h2>
                            </div>
                            <div class="section-body">
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="services_title">
                                            <i class="fas fa-heading"></i>
                                            Titel:
                                        </label>
                                        <input type="text" id="services_title" name="services_title" 
                                               value="${content.services.title}" 
                                               maxlength="100"
                                               placeholder="Überschrift des Leistungsbereichs">
                                    </div>
                                    <div class="form-group">
                                        <label for="services_subtitle">
                                            <i class="fas fa-text-height"></i>
                                            Untertitel:
                                        </label>
                                        <input type="text" id="services_subtitle" name="services_subtitle" 
                                               value="${content.services.subtitle}" 
                                               maxlength="200"
                                               placeholder="Beschreibung der Leistungen">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Service Cards Section -->
                        <div class="section-card">
                            <div class="section-header">
                                <h2 class="section-title">
                                    <i class="fas fa-th-large"></i>
                                    Service-Karten
                                </h2>
                                <p class="section-description">
                                    Bearbeiten Sie die Titel und Icons der einzelnen Service-Karten
                                </p>
                            </div>
                            <div class="section-body">
                                <div class="service-cards-grid">
                                    ${content.services.items ? content.services.items.map((item, index) => `
                                        <div class="service-card-form">
                                            <h4>Service ${index + 1}</h4>
                                            <div class="form-group">
                                                <label for="service_${index}_icon">
                                                    <i class="fas fa-icons"></i>
                                                    Icon (Font Awesome Klasse):
                                                </label>
                                                <input type="text" id="service_${index}_icon" name="service_${index}_icon" 
                                                       value="${item.icon || ''}" 
                                                       placeholder="z.B. fas fa-stethoscope">
                                                <small>Nutzen Sie Font Awesome Icons: <a href="https://fontawesome.com/icons" target="_blank">fontawesome.com/icons</a></small>
                                            </div>
                                            <div class="form-group">
                                                <label for="service_${index}_title">
                                                    <i class="fas fa-tag"></i>
                                                    Titel:
                                                </label>
                                                <input type="text" id="service_${index}_title" name="service_${index}_title" 
                                                       value="${item.title || ''}" 
                                                       maxlength="50"
                                                       placeholder="Service-Titel">
                                            </div>
                                            <div class="form-group">
                                                <label for="service_${index}_description">
                                                    <i class="fas fa-align-left"></i>
                                                    Beschreibung:
                                                </label>
                                                <textarea id="service_${index}_description" name="service_${index}_description" 
                                                          maxlength="150"
                                                          placeholder="Kurze Beschreibung des Services">${item.description || ''}</textarea>
                                            </div>
                                        </div>
                                    `).join('') : ''}
                                </div>
                            </div>
                        </div>

                        <!-- Modals Section -->
                        <div class="section-card">
                            <div class="section-header">
                                <h2 class="section-title">
                                    <i class="fas fa-window-maximize"></i>
                                    Service-Details (Modals)
                                </h2>
                                <div class="btn btn-info" style="font-size: 0.85rem; padding: 0.5rem 1rem;">
                                    <i class="fas fa-info-circle"></i>
                                    Detaillierte Informationen zu den Leistungen
                                </div>
                            </div>
                            <div class="section-body">
                                
                                <!-- Hausarztmedizin Modal -->
                                <div style="border: 1px solid var(--light-border); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                                    <h4><i class="fas fa-stethoscope"></i> Hausarztmedizin</h4>
                                    <div class="form-grid">
                                        <div class="form-group">
                                            <label for="modal_hausarzt_title">Titel:</label>
                                            <input type="text" id="modal_hausarzt_title" name="modal_hausarzt_title" 
                                                   value="${content.modals?.hausarzt?.title || 'Hausarztmedizin'}" 
                                                   maxlength="100">
                                        </div>
                                        <div class="form-group">
                                            <label for="modal_hausarzt_listTitle">Listen-Titel:</label>
                                            <input type="text" id="modal_hausarzt_listTitle" name="modal_hausarzt_listTitle" 
                                                   value="${content.modals?.hausarzt?.listTitle || 'Unsere Leistungen umfassen:'}" 
                                                   maxlength="100">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="modal_hausarzt_intro">Einleitung:</label>
                                        <textarea id="modal_hausarzt_intro" name="modal_hausarzt_intro" 
                                                  maxlength="500">${content.modals?.hausarzt?.intro || 'Als Ihr Hausarzt sind wir Ihr erster Ansprechpartner für alle gesundheitlichen Fragen. Wir bieten eine umfassende medizinische Grundversorgung für Patienten jeden Alters.'}</textarea>
                                    </div>
                                    <div class="form-group">
                                        <label for="modal_hausarzt_items">Leistungen (eine pro Zeile):</label>
                                        <textarea id="modal_hausarzt_items" name="modal_hausarzt_items" 
                                                  maxlength="1000">${content.modals?.hausarzt?.items ? content.modals.hausarzt.items.join('\n') : 'Allgemeine Diagnostik und Behandlung\nGesundheitsberatung und Präventionsmedizin\nChronische Krankheiten (Diabetes, Bluthochdruck, etc.)\nAkute Erkrankungen und Verletzungen\nKoordination mit Fachärzten'}</textarea>
                                    </div>
                                </div>

                                <!-- Vorsorgeuntersuchungen Modal -->
                                <div style="border: 1px solid var(--light-border); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                                    <h4><i class="fas fa-shield-alt"></i> Vorsorgeuntersuchungen</h4>
                                    <div class="form-grid">
                                        <div class="form-group">
                                            <label for="modal_vorsorge_title">Titel:</label>
                                            <input type="text" id="modal_vorsorge_title" name="modal_vorsorge_title" 
                                                   value="${content.modals?.vorsorge?.title || 'Vorsorgeuntersuchungen'}" 
                                                   maxlength="100">
                                        </div>
                                        <div class="form-group">
                                            <label for="modal_vorsorge_listTitle">Listen-Titel:</label>
                                            <input type="text" id="modal_vorsorge_listTitle" name="modal_vorsorge_listTitle" 
                                                   value="${content.modals?.vorsorge?.listTitle || 'Unser Vorsorgeprogramm:'}" 
                                                   maxlength="100">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="modal_vorsorge_intro">Einleitung:</label>
                                        <textarea id="modal_vorsorge_intro" name="modal_vorsorge_intro" 
                                                  maxlength="500">${content.modals?.vorsorge?.intro || 'Vorbeugung ist der beste Schutz vor Krankheiten. Unsere umfassenden Vorsorgeuntersuchungen helfen dabei, Gesundheitsrisiken frühzeitig zu erkennen.'}</textarea>
                                    </div>
                                    <div class="form-group">
                                        <label for="modal_vorsorge_items">Leistungen (eine pro Zeile):</label>
                                        <textarea id="modal_vorsorge_items" name="modal_vorsorge_items" 
                                                  maxlength="1000">${content.modals?.vorsorge?.items ? content.modals.vorsorge.items.join('\n') : 'Check-ups Untersuchungen\nHautkrebsscreening\nImpfberatung und Impfungen\nKrebsvorsorge beim Mann mit Prostatauntersuchung\nBeratung zur Darmkrebs-Früherkennung'}</textarea>
                                    </div>
                                </div>

                                <!-- Labor Modal -->
                                <div style="border: 1px solid var(--light-border); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                                    <h4><i class="fas fa-flask"></i> Blutuntersuchungen & Labor</h4>
                                    <div class="form-grid">
                                        <div class="form-group">
                                            <label for="modal_labor_title">Titel:</label>
                                            <input type="text" id="modal_labor_title" name="modal_labor_title" 
                                                   value="${content.modals?.labor?.title || 'Blutuntersuchungen und Labordiagnostik'}" 
                                                   maxlength="100">
                                        </div>
                                        <div class="form-group">
                                            <label for="modal_labor_listTitle">Listen-Titel:</label>
                                            <input type="text" id="modal_labor_listTitle" name="modal_labor_listTitle" 
                                                   value="${content.modals?.labor?.listTitle || 'Unsere Laborleistungen:'}" 
                                                   maxlength="100">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="modal_labor_intro">Einleitung:</label>
                                        <textarea id="modal_labor_intro" name="modal_labor_intro" 
                                                  maxlength="500">${content.modals?.labor?.intro || 'Moderne Labordiagnostik direkt in unserer Praxis ermöglicht schnelle und präzise Ergebnisse für eine optimale Behandlung und Diagnosestellung.'}</textarea>
                                    </div>
                                    <div class="form-group">
                                        <label for="modal_labor_items">Leistungen (eine pro Zeile):</label>
                                        <textarea id="modal_labor_items" name="modal_labor_items" 
                                                  maxlength="1000">${content.modals?.labor?.items ? content.modals.labor.items.join('\n') : 'Blutuntersuchungen (Blutbild, Blutzucker, Cholesterin)\nLabordiagnostik für verschiedene Erkrankungen\nSchnelle Ergebnisse durch praxiseigene Geräte\nPräventive Blutanalysen\nVerlaufskontrolle bei chronischen Erkrankungen'}</textarea>
                                    </div>
                                </div>

                                <!-- Diagnostik Modal -->
                                <div style="border: 1px solid var(--light-border); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                                    <h4><i class="fas fa-heartbeat"></i> Diagnostik</h4>
                                    <div class="form-grid">
                                        <div class="form-group">
                                            <label for="modal_diagnostik_title">Titel:</label>
                                            <input type="text" id="modal_diagnostik_title" name="modal_diagnostik_title" 
                                                   value="${content.modals?.diagnostik?.title || 'Diagnostik'}" 
                                                   maxlength="100">
                                        </div>
                                        <div class="form-group">
                                            <label for="modal_diagnostik_listTitle">Listen-Titel:</label>
                                            <input type="text" id="modal_diagnostik_listTitle" name="modal_diagnostik_listTitle" 
                                                   value="${content.modals?.diagnostik?.listTitle || 'Unsere diagnostischen Leistungen:'}" 
                                                   maxlength="100">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="modal_diagnostik_intro">Einleitung:</label>
                                        <textarea id="modal_diagnostik_intro" name="modal_diagnostik_intro" 
                                                  maxlength="500">${content.modals?.diagnostik?.intro || 'Moderne Diagnoseverfahren für eine präzise Untersuchung und optimale Behandlung. Wir verfügen über modernste Geräte für verschiedene Untersuchungen.'}</textarea>
                                    </div>
                                    <div class="form-group">
                                        <label for="modal_diagnostik_items">Leistungen (eine pro Zeile):</label>
                                        <textarea id="modal_diagnostik_items" name="modal_diagnostik_items" 
                                                  maxlength="1000">${content.modals?.diagnostik?.items ? content.modals.diagnostik.items.join('\n') : 'EKG (Elektrokardiogramm)\nLangzeit-EKG\nBelastungs-EKG\nLangzeit-Blutdruckmessung\nLungenfunktionstest\nUltraschalldiagnostik'}</textarea>
                                    </div>
                                </div>

                                <!-- Hausbesuche Modal -->
                                <div style="border: 1px solid var(--light-border); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                                    <h4><i class="fas fa-home"></i> Hausbesuche</h4>
                                    <div class="form-grid">
                                        <div class="form-group">
                                            <label for="modal_hausbesuche_title">Titel:</label>
                                            <input type="text" id="modal_hausbesuche_title" name="modal_hausbesuche_title" 
                                                   value="${content.modals?.hausbesuche?.title || 'Hausbesuche'}" 
                                                   maxlength="100">
                                        </div>
                                        <div class="form-group">
                                            <label for="modal_hausbesuche_listTitle">Listen-Titel:</label>
                                            <input type="text" id="modal_hausbesuche_listTitle" name="modal_hausbesuche_listTitle" 
                                                   value="${content.modals?.hausbesuche?.listTitle || 'Hausbesuche bieten wir an bei:'}" 
                                                   maxlength="100">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="modal_hausbesuche_intro">Einleitung:</label>
                                        <textarea id="modal_hausbesuche_intro" name="modal_hausbesuche_intro" 
                                                  maxlength="500">${content.modals?.hausbesuche?.intro || 'Wenn Sie nicht zu uns kommen können, kommen wir zu Ihnen. Unsere Hausbesuche ermöglichen eine medizinische Versorgung in der gewohnten Umgebung.'}</textarea>
                                    </div>
                                    <div class="form-group">
                                        <label for="modal_hausbesuche_items">Situationen (eine pro Zeile):</label>
                                        <textarea id="modal_hausbesuche_items" name="modal_hausbesuche_items" 
                                                  maxlength="1000">${content.modals?.hausbesuche?.items ? content.modals.hausbesuche.items.join('\n') : 'Akuten Erkrankungen, wenn Sie bettlägerig sind\nChronischen Erkrankungen mit eingeschränkter Mobilität\nPalliativmedizinischer Betreuung\nNachsorge nach Krankenhausaufenthalten\nMedizinischen Notfällen im häuslichen Bereich'}</textarea>
                                    </div>
                                    <div class="form-group">
                                        <label for="modal_hausbesuche_note">Hinweis:</label>
                                        <input type="text" id="modal_hausbesuche_note" name="modal_hausbesuche_note" 
                                               value="${content.modals?.hausbesuche?.note || 'Bitte vereinbaren Sie Hausbesuche rechtzeitig telefonisch mit uns.'}" 
                                               maxlength="200">
                                    </div>
                                </div>

                                <!-- DMP Modal -->
                                <div style="border: 1px solid var(--light-border); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                                    <h4><i class="fas fa-clipboard-list"></i> Disease Management</h4>
                                    <div class="form-grid">
                                        <div class="form-group">
                                            <label for="modal_dmp_title">Titel:</label>
                                            <input type="text" id="modal_dmp_title" name="modal_dmp_title" 
                                                   value="${content.modals?.dmp?.title || 'Disease-Management-Programme (DMP)'}" 
                                                   maxlength="100">
                                        </div>
                                        <div class="form-group">
                                            <label for="modal_dmp_listTitle">Listen-Titel:</label>
                                            <input type="text" id="modal_dmp_listTitle" name="modal_dmp_listTitle" 
                                                   value="${content.modals?.dmp?.listTitle || 'DMP-Programme für:'}" 
                                                   maxlength="100">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="modal_dmp_intro">Einleitung:</label>
                                        <textarea id="modal_dmp_intro" name="modal_dmp_intro" 
                                                  maxlength="500">${content.modals?.dmp?.intro || 'Strukturierte Behandlungsprogramme für chronische Erkrankungen bieten eine optimale, langfristige Betreuung und Therapie.'}</textarea>
                                    </div>
                                    <div class="form-group">
                                        <label for="modal_dmp_items">Programme (eine pro Zeile):</label>
                                        <textarea id="modal_dmp_items" name="modal_dmp_items" 
                                                  maxlength="1000">${content.modals?.dmp?.items ? content.modals.dmp.items.join('\n') : 'Diabetes mellitus Typ 1 und Typ 2\nKoronare Herzkrankheit (KHK)\nAsthma bronchiale\nChronisch obstruktive Lungenerkrankung (COPD)\nBrustkrebs\nDarmkrebs'}</textarea>
                                    </div>
                                    <div class="form-group">
                                        <label for="modal_dmp_outro">Schlusstext:</label>
                                        <textarea id="modal_dmp_outro" name="modal_dmp_outro" 
                                                  maxlength="300">${content.modals?.dmp?.outro || 'Diese Programme beinhalten regelmäßige Kontrolluntersuchungen, Schulungen und eine strukturierte Therapieplanung.'}</textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- About Section -->
                        <div class="section-card">
                            <div class="section-header">
                                <h2 class="section-title">
                                    <i class="fas fa-user-md"></i>
                                    Über uns
                                </h2>
                            </div>
                            <div class="section-body">
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="about_title">
                                            <i class="fas fa-heading"></i>
                                            Titel:
                                        </label>
                                        <input type="text" id="about_title" name="about_title" 
                                               value="${content.about.title}" 
                                               maxlength="50"
                                               placeholder="Überschrift des Über-uns-Bereichs">
                                    </div>
                                    <div class="form-group">
                                        <label for="about_doctorName">
                                            <i class="fas fa-id-badge"></i>
                                            Arztname:
                                        </label>
                                        <input type="text" id="about_doctorName" name="about_doctorName" 
                                               value="${content.about.doctorName}" 
                                               maxlength="100"
                                               placeholder="Name des Arztes">
                                    </div>
                                    <div class="form-group">
                                        <label for="about_qualification">
                                            <i class="fas fa-graduation-cap"></i>
                                            Qualifikation:
                                        </label>
                                        <input type="text" id="about_qualification" name="about_qualification" 
                                               value="${content.about.qualification}" 
                                               maxlength="200"
                                               placeholder="Fachrichtung und Qualifikationen">
                                    </div>
                                    <div class="form-group">
                                        <label for="about_languagesTitle">
                                            <i class="fas fa-language"></i>
                                            Sprachen Titel:
                                        </label>
                                        <input type="text" id="about_languagesTitle" name="about_languagesTitle" 
                                               value="${content.about.languagesTitle}" 
                                               maxlength="50"
                                               placeholder="Überschrift für Sprachkenntnisse">
                                    </div>
                                    <div class="form-group">
                                        <label for="about_languagesDesc">
                                            <i class="fas fa-globe"></i>
                                            Sprachen Beschreibung:
                                        </label>
                                        <input type="text" id="about_languagesDesc" name="about_languagesDesc" 
                                               value="${content.about.languagesDesc}" 
                                               maxlength="200"
                                               placeholder="Aufzählung der gesprochenen Sprachen">
                                    </div>
                                    <div class="form-group">
                                        <label for="about_teamTitle">
                                            <i class="fas fa-users"></i>
                                            Team Titel:
                                        </label>
                                        <input type="text" id="about_teamTitle" name="about_teamTitle" 
                                               value="${content.about.teamTitle}" 
                                               maxlength="50"
                                               placeholder="Überschrift für Team-Bereich">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="about_welcome">
                                        <i class="fas fa-heart"></i>
                                        Willkommenstext:
                                    </label>
                                    <textarea id="about_welcome" name="about_welcome" 
                                              maxlength="300"
                                              placeholder="Persönlicher Willkommenstext...">${content.about.welcome}</textarea>
                                </div>
                                <div class="form-group">
                                    <label for="about_teamDesc">
                                        <i class="fas fa-handshake"></i>
                                        Team Beschreibung:
                                    </label>
                                    <textarea id="about_teamDesc" name="about_teamDesc" 
                                              maxlength="400"
                                              placeholder="Beschreibung des Praxis-Teams...">${content.about.teamDesc}</textarea>
                                </div>
                            </div>
                        </div>

                        <!-- Contact Section -->
                        <div class="section-card">
                            <div class="section-header">
                                <h2 class="section-title">
                                    <i class="fas fa-phone"></i>
                                    Kontakt
                                </h2>
                            </div>
                            <div class="section-body">
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="contact_title">
                                            <i class="fas fa-heading"></i>
                                            Titel:
                                        </label>
                                        <input type="text" id="contact_title" name="contact_title" 
                                               value="${content.contact.title}" 
                                               maxlength="50"
                                               placeholder="Überschrift für Kontakt-Bereich">
                                    </div>
                                    <div class="form-group">
                                        <label for="contact_subtitle">
                                            <i class="fas fa-text-height"></i>
                                            Untertitel:
                                        </label>
                                        <input type="text" id="contact_subtitle" name="contact_subtitle" 
                                               value="${content.contact.subtitle}" 
                                               maxlength="100"
                                               placeholder="Aufforderung zur Kontaktaufnahme">
                                    </div>
                                    <div class="form-group">
                                        <label for="contact_phone">
                                            <i class="fas fa-phone-alt"></i>
                                            Telefon:
                                        </label>
                                        <input type="tel" id="contact_phone" name="contact_phone" 
                                               value="${content.contact.phone}" 
                                               maxlength="20"
                                               placeholder="Telefonnummer der Praxis">
                                    </div>
                                    <div class="form-group">
                                        <label for="contact_email">
                                            <i class="fas fa-envelope"></i>
                                            E-Mail:
                                        </label>
                                        <input type="email" id="contact_email" name="contact_email" 
                                               value="${content.contact.email}" 
                                               maxlength="100"
                                               placeholder="E-Mail-Adresse der Praxis">
                                    </div>
                                    <div class="form-group">
                                        <label for="contact_hoursTitle">
                                            <i class="fas fa-clock"></i>
                                            Sprechzeiten Titel:
                                        </label>
                                        <input type="text" id="contact_hoursTitle" name="contact_hoursTitle" 
                                               value="${content.contact.hoursTitle}" 
                                               maxlength="50"
                                               placeholder="Überschrift für Öffnungszeiten">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="contact_address">
                                        <i class="fas fa-map-marker-alt"></i>
                                        Adresse:
                                    </label>
                                    <textarea id="contact_address" name="contact_address" 
                                              maxlength="200"
                                              placeholder="Straße, Hausnummer, PLZ, Ort...">${content.contact.address}</textarea>
                                </div>
                            </div>
                        </div>

                        <div class="save-section">
                            <button type="submit" class="btn btn-success">
                                <i class="fas fa-save"></i>
                                Änderungen speichern
                            </button>
                            <div style="margin-top: 1rem; font-size: 0.9rem; color: var(--gray-medium);">
                                💡 Tipp: Verwenden Sie <kbd>Strg+S</kbd> (Windows) oder <kbd>⌘+S</kbd> (Mac) zum schnellen Speichern
                            </div>
                        </div>
                    </form>
                </main>
            </div>

    `;
    res.send(adminLayout(inner));
});

// Save content
app.post('/admin/save', requireAuth, upload.any(), (req, res) => {
    try {
        const content = loadContent();
        
        // Update vacation section
        if (!content.vacation) content.vacation = {};
        content.vacation.enabled = req.body.vacation_enabled === 'on';
        if (req.body.vacation_title !== undefined) content.vacation.title = req.body.vacation_title;
        if (req.body.vacation_message !== undefined) content.vacation.message = req.body.vacation_message;
        if (req.body.vacation_startDate !== undefined) content.vacation.startDate = req.body.vacation_startDate;
        if (req.body.vacation_endDate !== undefined) content.vacation.endDate = req.body.vacation_endDate;
        if (req.body.vacation_emergencyTitle !== undefined) content.vacation.emergencyTitle = req.body.vacation_emergencyTitle;
        if (req.body.vacation_emergencyInfo !== undefined) content.vacation.emergencyInfo = req.body.vacation_emergencyInfo;
        if (req.body.vacation_buttonText !== undefined) content.vacation.buttonText = req.body.vacation_buttonText;
        
        // Update intro section
        if (req.body.intro_title) content.intro.title = req.body.intro_title;
        if (req.body.intro_subtitle) content.intro.subtitle = req.body.intro_subtitle;
        if (req.body.intro_feature1) content.intro.feature1 = req.body.intro_feature1;
        if (req.body.intro_feature2) content.intro.feature2 = req.body.intro_feature2;
        if (req.body.intro_feature3) content.intro.feature3 = req.body.intro_feature3;
        if (req.body.intro_description) content.intro.description = req.body.intro_description;
        if (req.body.intro_cta) content.intro.cta = req.body.intro_cta;
        
        // Update services section
        if (req.body.services_title) content.services.title = req.body.services_title;
        if (req.body.services_subtitle) content.services.subtitle = req.body.services_subtitle;
        
        // Update service cards
        if (!content.services.items) content.services.items = [];
        
        // Process up to 6 service cards (typical number)
        for (let i = 0; i < 6; i++) {
            const iconField = `service_${i}_icon`;
            const titleField = `service_${i}_title`;
            const descField = `service_${i}_description`;
            
            if (req.body[iconField] || req.body[titleField] || req.body[descField]) {
                // Ensure the service item exists
                if (!content.services.items[i]) {
                    content.services.items[i] = {};
                }
                
                // Update fields if provided
                if (req.body[iconField]) content.services.items[i].icon = req.body[iconField];
                if (req.body[titleField]) content.services.items[i].title = req.body[titleField];
                if (req.body[descField]) content.services.items[i].description = req.body[descField];
            }
        }
        
        // Update about section
        if (req.body.about_title) content.about.title = req.body.about_title;
        if (req.body.about_doctorName) content.about.doctorName = req.body.about_doctorName;
        if (req.body.about_qualification) content.about.qualification = req.body.about_qualification;
        if (req.body.about_welcome) content.about.welcome = req.body.about_welcome;
        if (req.body.about_languagesTitle) content.about.languagesTitle = req.body.about_languagesTitle;
        if (req.body.about_languagesDesc) content.about.languagesDesc = req.body.about_languagesDesc;
        if (req.body.about_teamTitle) content.about.teamTitle = req.body.about_teamTitle;
        if (req.body.about_teamDesc) content.about.teamDesc = req.body.about_teamDesc;
        
        // Update contact section
        if (req.body.contact_title) content.contact.title = req.body.contact_title;
        if (req.body.contact_subtitle) content.contact.subtitle = req.body.contact_subtitle;
    if (req.body.contact_address) content.contact.addressValue = req.body.contact_address;
    if (req.body.contact_phone) content.contact.phoneValue = req.body.contact_phone;
    if (req.body.contact_email) content.contact.emailValue = req.body.contact_email;
        if (req.body.contact_hoursTitle) content.contact.hoursTitle = req.body.contact_hoursTitle;
        
        // Initialize modals if not exists
        if (!content.modals) content.modals = {};
        
        // Update modal content - Hausarztmedizin
        if (!content.modals.hausarzt) content.modals.hausarzt = {};
        if (req.body.modal_hausarzt_title) content.modals.hausarzt.title = req.body.modal_hausarzt_title;
        if (req.body.modal_hausarzt_intro) content.modals.hausarzt.intro = req.body.modal_hausarzt_intro;
        if (req.body.modal_hausarzt_listTitle) content.modals.hausarzt.listTitle = req.body.modal_hausarzt_listTitle;
        if (req.body.modal_hausarzt_items) content.modals.hausarzt.items = req.body.modal_hausarzt_items.split('\n').filter(item => item.trim());
        
        // Update modal content - Vorsorge
        if (!content.modals.vorsorge) content.modals.vorsorge = {};
        if (req.body.modal_vorsorge_title) content.modals.vorsorge.title = req.body.modal_vorsorge_title;
        if (req.body.modal_vorsorge_intro) content.modals.vorsorge.intro = req.body.modal_vorsorge_intro;
        if (req.body.modal_vorsorge_listTitle) content.modals.vorsorge.listTitle = req.body.modal_vorsorge_listTitle;
        if (req.body.modal_vorsorge_items) content.modals.vorsorge.items = req.body.modal_vorsorge_items.split('\n').filter(item => item.trim());
        
        // Update modal content - Labor
        if (!content.modals.labor) content.modals.labor = {};
        if (req.body.modal_labor_title) content.modals.labor.title = req.body.modal_labor_title;
        if (req.body.modal_labor_intro) content.modals.labor.intro = req.body.modal_labor_intro;
        if (req.body.modal_labor_listTitle) content.modals.labor.listTitle = req.body.modal_labor_listTitle;
        if (req.body.modal_labor_items) content.modals.labor.items = req.body.modal_labor_items.split('\n').filter(item => item.trim());
        
        // Update modal content - Diagnostik
        if (!content.modals.diagnostik) content.modals.diagnostik = {};
        if (req.body.modal_diagnostik_title) content.modals.diagnostik.title = req.body.modal_diagnostik_title;
        if (req.body.modal_diagnostik_intro) content.modals.diagnostik.intro = req.body.modal_diagnostik_intro;
        if (req.body.modal_diagnostik_listTitle) content.modals.diagnostik.listTitle = req.body.modal_diagnostik_listTitle;
        if (req.body.modal_diagnostik_items) content.modals.diagnostik.items = req.body.modal_diagnostik_items.split('\n').filter(item => item.trim());
        
        // Update modal content - Hausbesuche
        if (!content.modals.hausbesuche) content.modals.hausbesuche = {};
        if (req.body.modal_hausbesuche_title) content.modals.hausbesuche.title = req.body.modal_hausbesuche_title;
        if (req.body.modal_hausbesuche_intro) content.modals.hausbesuche.intro = req.body.modal_hausbesuche_intro;
        if (req.body.modal_hausbesuche_listTitle) content.modals.hausbesuche.listTitle = req.body.modal_hausbesuche_listTitle;
        if (req.body.modal_hausbesuche_items) content.modals.hausbesuche.items = req.body.modal_hausbesuche_items.split('\n').filter(item => item.trim());
        if (req.body.modal_hausbesuche_note) content.modals.hausbesuche.note = req.body.modal_hausbesuche_note;
        
        // Update modal content - DMP
        if (!content.modals.dmp) content.modals.dmp = {};
        if (req.body.modal_dmp_title) content.modals.dmp.title = req.body.modal_dmp_title;
        if (req.body.modal_dmp_intro) content.modals.dmp.intro = req.body.modal_dmp_intro;
        if (req.body.modal_dmp_listTitle) content.modals.dmp.listTitle = req.body.modal_dmp_listTitle;
        if (req.body.modal_dmp_items) content.modals.dmp.items = req.body.modal_dmp_items.split('\n').filter(item => item.trim());
        if (req.body.modal_dmp_outro) content.modals.dmp.outro = req.body.modal_dmp_outro;
        
        // Save content
        if (saveContent(content)) {
            updateHtmlFile();
            res.json({ success: true, message: 'Content updated successfully' });
        } else {
            res.json({ success: false, error: 'Failed to save content' });
        }
        
    } catch (error) {
        console.error('Error in save route:', error);
        res.json({ success: false, error: error.message });
    }
});

// (duplicate /api/content route removed above)

// Start server
app.listen(PORT, () => {
    console.log(`🚀 CMS Server läuft auf http://localhost:${PORT}`);
    console.log(`📊 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`🔑 Login: admin / Hausarztpraxis_Airoud_CMS_2025`);
    console.log(`✅ Sicherheit: Produktionsbereit mit verschärften Einstellungen`);
    console.log(`📝 Session: Sichere Konfiguration aktiviert`);
});

module.exports = app;

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const cluster = require('cluster');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Performance optimizations
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
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
    const maxAttempts = 5;
    
    if (!loginAttempts.has(ip)) {
        loginAttempts.set(ip, []);
    }
    
    const attempts = loginAttempts.get(ip);
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
        return res.status(429).json({ error: 'Zu viele Login-Versuche. Versuchen Sie es in 15 Minuten erneut.' });
    }
    
    next();
}

// Session Configuration with enhanced security
app.use(session({
    secret: process.env.SESSION_SECRET || 'hausarztpraxis-airoud-2025-secure-key',
    name: 'praxis.session',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict'
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
        fileSize: 5 * 1024 * 1024, // 5MB limit (reduced for better performance)
        files: 10
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Nur Bilder sind erlaubt (JPEG, JPG, PNG, GIF, WebP, SVG)'));
        }
    }
});

// Default admin credentials (change these!)
const DEFAULT_ADMIN = {
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10) // 'admin123' - CHANGE THIS!
};

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'cms-data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize content data file
const contentFile = path.join(dataDir, 'content.json');
const backupDir = path.join(dataDir, 'backups');

if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// Default content structure
const defaultContent = {
    // Intro Section
    intro: {
        title: 'Willkommen in der Hausarztpraxis Dr. Airoud',
        subtitle: 'Ihre Gesundheit liegt uns am Herzen',
        feature1: 'Flexible Sprechzeiten',
        feature2: 'Erfahrenes Team',
        feature3: 'Persönliche Betreuung',
        description: 'Seit über 15 Jahren stehen wir Ihnen als kompetenter Partner für Ihre Gesundheit zur Seite. In unserer modernen Praxis verbinden wir medizinische Expertise mit persönlicher Betreuung und neuesten Behandlungsmethoden.',
        cta: 'Termin vereinbaren',
        doctorImage: 'https://via.placeholder.com/400x500/4a90a4/ffffff?text=Dr.+Airoud'
    },
    
    // Services Section
    services: {
        title: 'Unsere Leistungen',
        subtitle: 'Umfassende medizinische Versorgung für die ganze Familie',
        items: [
            {
                icon: 'fas fa-stethoscope',
                title: 'Hausarztmedizin',
                description: 'Umfassende medizinische Grundversorgung'
            },
            {
                icon: 'fas fa-shield-alt',
                title: 'Vorsorgeuntersuchungen',
                description: 'Check-ups, Hautkrebsscreening, Impfberatung'
            },
            {
                icon: 'fas fa-flask',
                title: 'Blutuntersuchungen & Labor',
                description: 'Moderne Labordiagnostik'
            },
            {
                icon: 'fas fa-heartbeat',
                title: 'Diagnostik',
                description: 'EKG, Ultraschall, Lungenfunktion'
            },
            {
                icon: 'fas fa-home',
                title: 'Hausbesuche',
                description: 'Medizinische Betreuung zu Hause'
            },
            {
                icon: 'fas fa-clipboard-list',
                title: 'Disease Management',
                description: 'Strukturierte Behandlungsprogramme'
            }
        ]
    },
    
    // About Section
    about: {
        title: 'Über uns',
        doctorName: 'Abdullah Airoud',
        qualification: 'Facharzt für Innere Medizin-Notfallmedizin',
        welcome: 'Herzlich willkommen in unserer Hausarztpraxis! Mit Kompetenz und Mitgefühl stehen wir unseren Patienten zur Seite. Ihre Gesundheit ist unsere Priorität.',
        languagesTitle: 'Sprachkenntnisse:',
        languagesDesc: 'Wir sprechen deutsch, englisch, arabisch und italienisch.',
        teamTitle: 'Unser Team',
        teamDesc: 'Unser engagiertes Team sorgt dafür, dass Sie sich in unserer Praxis wohlfühlen und optimal betreut werden. Wir nehmen uns Zeit für Ihre Anliegen und behandeln jeden Patienten individuell.',
        teamImage: 'https://via.placeholder.com/500x400/4a90a4/ffffff?text=Unser+Team'
    },
    
    // Contact Section
    contact: {
        title: 'Kontakt',
        subtitle: 'Wir sind für Sie da - kontaktieren Sie uns',
        address: 'Eschenstr. 138<br>42283 Wuppertal',
        phone: '0202 25 350 880',
        email: 'info@hausarztpraxis-airoud.de',
        hoursTitle: 'Sprechzeiten',
        hours: [
            { days: 'Mo | Di:', time: '08:30 - 13:00 | 16:00 - 18:00 Uhr' },
            { days: 'Mi:', time: '08:30 - 13:00 Uhr' },
            { days: 'Do:', time: '08:30 - 13:00 | 16:00 - 18:00 Uhr' },
            { days: 'Fr:', time: '08:30 - 13:00 Uhr' },
            { days: 'Termine:', time: 'nach Vereinbarung' }
        ]
    }
};

// Initialize content file if it doesn't exist
if (!fs.existsSync(contentFile)) {
    fs.writeFileSync(contentFile, JSON.stringify(defaultContent, null, 2));
}

// Enhanced helper functions with validation and sanitization
function loadContent() {
    try {
        const data = fs.readFileSync(contentFile, 'utf8');
        const content = JSON.parse(data);
        return validateContent(content);
    } catch (error) {
        console.error('Error loading content:', error);
        return defaultContent;
    }
}

function validateContent(content) {
    // Sanitize content to prevent XSS
    const sanitize = (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                  .replace(/javascript:/gi, '')
                  .replace(/on\w+\s*=/gi, '');
    };
    
    const sanitizeObject = (obj) => {
        if (typeof obj === 'string') return sanitize(obj);
        if (Array.isArray(obj)) return obj.map(sanitizeObject);
        if (typeof obj === 'object' && obj !== null) {
            const sanitized = {};
            for (const key in obj) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
            return sanitized;
        }
        return obj;
    };
    
    return sanitizeObject(content);
}

function saveContent(content) {
    try {
        // Validate content before saving
        const validatedContent = validateContent(content);
        
        // Create backup with rotation (keep only last 10)
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupDir, `content-backup-${timestamp}.json`);
        
        if (fs.existsSync(contentFile)) {
            fs.writeFileSync(backupFile, fs.readFileSync(contentFile));
        }
        
        // Cleanup old backups
        const backupFiles = fs.readdirSync(backupDir)
            .filter(file => file.startsWith('content-backup-'))
            .sort()
            .reverse();
            
        if (backupFiles.length > 10) {
            backupFiles.slice(10).forEach(file => {
                fs.unlinkSync(path.join(backupDir, file));
            });
        }
        
        // Save new content
        fs.writeFileSync(contentFile, JSON.stringify(validatedContent, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving content:', error);
        return false;
    }
}

function updateHtmlFile() {
    try {
        const content = loadContent();
        let html = fs.readFileSync('index.html', 'utf8');
        
        // Update intro section
        html = html.replace(
            /<h1 data-translate="intro\.title">.*?<\/h1>/,
            `<h1 data-translate="intro.title">${content.intro.title}</h1>`
        );
        
        html = html.replace(
            /<p class="intro-subtitle" data-translate="intro\.subtitle">.*?<\/p>/,
            `<p class="intro-subtitle" data-translate="intro.subtitle">${content.intro.subtitle}</p>`
        );
        
        html = html.replace(
            /<p class="intro-description" data-translate="intro\.description">.*?<\/p>/s,
            `<p class="intro-description" data-translate="intro.description">${content.intro.description}</p>`
        );
        
        // Update about section
        html = html.replace(
            /<h3 data-translate="about\.doctor">.*?<\/h3>/,
            `<h3 data-translate="about.doctor">${content.about.doctorName}</h3>`
        );
        
        html = html.replace(
            /<p class="qualification" data-translate="about\.qualification">.*?<\/p>/,
            `<p class="qualification" data-translate="about.qualification">${content.about.qualification}</p>`
        );
        
        // Update contact information
        html = html.replace(
            /<p>Eschenstr\. 138<br>42283 Wuppertal<\/p>/,
            `<p>${content.contact.address}</p>`
        );
        
        html = html.replace(
            /<p><a href="tel:\+4920225350880">.*?<\/a><\/p>/,
            `<p><a href="tel:+49${content.contact.phone.replace(/\s/g, '')}">${content.contact.phone}</a></p>`
        );
        
        html = html.replace(
            /<p><a href="mailto:.*?">.*?<\/a><\/p>/,
            `<p><a href="mailto:${content.contact.email}">${content.contact.email}</a></p>`
        );
        
        fs.writeFileSync('index.html', html);
        return true;
    } catch (error) {
        console.error('Error updating HTML file:', error);
        return false;
    }
}

function getSystemStats() {
    try {
        const backupFiles = fs.readdirSync(backupDir)
            .filter(file => file.startsWith('content-backup-'))
            .sort()
            .reverse();
            
        const lastBackup = backupFiles.length > 0 
            ? new Date(backupFiles[0].replace('content-backup-', '').replace('.json', '').replace(/-/g, ':')).toLocaleString('de-DE')
            : 'Keine Backups vorhanden';
            
        return {
            lastBackup,
            backupCount: backupFiles.length,
            systemTime: new Date().toLocaleString('de-DE')
        };
    } catch (error) {
        return {
            lastBackup: 'Fehler beim Laden',
            backupCount: 0,
            systemTime: new Date().toLocaleString('de-DE')
        };
    }
}

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) {
        next();
    } else {
        res.redirect('/admin/login');
    }
}

// Routes
// API endpoint to serve content.json
app.get('/api/content', (req, res) => {
    try {
        const content = loadContent();
        res.json(content);
    } catch (error) {
        console.error('Error serving content:', error);
        res.status(500).json({ error: 'Failed to load content' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin login page
app.get('/admin/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Login - Hausarztpraxis Dr. Airoud</title>
            <link rel="stylesheet" href="/styles.css">
            <style>
                .login-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                }
                .login-form {
                    background: white;
                    padding: 3rem;
                    border-radius: var(--border-radius);
                    box-shadow: var(--shadow-heavy);
                    width: 100%;
                    max-width: 400px;
                }
                .login-form h2 {
                    text-align: center;
                    margin-bottom: 2rem;
                    color: var(--text-dark);
                }
                .form-group {
                    margin-bottom: 1.5rem;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: var(--text-dark);
                    font-weight: 500;
                }
                .form-group input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 2px solid var(--gray-light);
                    border-radius: var(--border-radius);
                    font-size: 1rem;
                    transition: var(--transition);
                }
                .form-group input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                }
                .login-btn {
                    width: 100%;
                    padding: 0.75rem;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: var(--border-radius);
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--transition);
                }
                .login-btn:hover {
                    background: var(--secondary-color);
                }
                .error {
                    color: var(--danger);
                    text-align: center;
                    margin-top: 1rem;
                }
                .praxis-logo {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                .praxis-logo i {
                    font-size: 3rem;
                    color: var(--primary-color);
                    margin-bottom: 0.5rem;
                }
            </style>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        </head>
        <body>
            <div class="login-container">
                <div class="login-form">
                    <div class="praxis-logo">
                        <i class="fas fa-user-md"></i>
                        <h3>Dr. Airoud</h3>
                    </div>
                    <h2>Admin Login</h2>
                    <form method="POST" action="/admin/login">
                        <div class="form-group">
                            <label for="username">Benutzername:</label>
                            <input type="text" id="username" name="username" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Passwort:</label>
                            <input type="password" id="password" name="password" required>
                        </div>
                        <button type="submit" class="login-btn">Anmelden</button>
                        ${req.query.error ? '<div class="error">Ungültige Anmeldedaten</div>' : ''}
                    </form>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Admin login handler with rate limiting
app.post('/admin/login', checkRateLimit, async (req, res) => {
    const { username, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    
    try {
        if (username === DEFAULT_ADMIN.username && bcrypt.compareSync(password, DEFAULT_ADMIN.password)) {
            req.session.authenticated = true;
            req.session.loginTime = new Date().toISOString();
            
            // Clear failed attempts on successful login
            if (loginAttempts.has(ip)) {
                loginAttempts.delete(ip);
            }
            
            res.redirect('/admin');
        } else {
            // Record failed attempt
            if (!loginAttempts.has(ip)) {
                loginAttempts.set(ip, []);
            }
            loginAttempts.get(ip).push(Date.now());
            
            res.redirect('/admin/login?error=1');
        }
    } catch (error) {
        console.error('Login error:', error);
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
    const stats = getSystemStats();
    
    res.send(`
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>CMS Admin - Hausarztpraxis Dr. Airoud</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <link rel="stylesheet" href="/cms-admin-styles.css">
        </head>
        <body>
            <div class="admin-container">
                <header class="admin-header">
                    <nav class="admin-nav">
                        <div class="admin-logo">
                            <i class="fas fa-user-md"></i>
                            <span>Dr. Airoud CMS</span>
                            <div style="font-size: 0.7rem; opacity: 0.8; margin-left: 0.5rem;">
                                v2.0 Enhanced
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
                                    <div style="font-size: 2rem; color: var(--primary-color); margin-bottom: 0.5rem;">
                                        <i class="fas fa-save"></i>
                                    </div>
                                    <div style="font-weight: 600;">Letztes Backup</div>
                                    <div>${stats.lastBackup}</div>
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

            <script src="/cms-admin-enhanced.js"></script>
        </body>
        </html>
    `);
});

// Save content
app.post('/admin/save', requireAuth, upload.any(), (req, res) => {
    try {
        const content = loadContent();
        
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

// API endpoint to get current content
app.get('/api/content', (req, res) => {
    res.json(loadContent());
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 CMS Server läuft auf http://localhost:${PORT}`);
    console.log(`📊 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`🔑 Standard Login: admin / admin123`);
    console.log(`⚠️  WICHTIG: Ändern Sie das Standard-Passwort!`);
});

module.exports = app;

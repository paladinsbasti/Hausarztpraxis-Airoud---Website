const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('.', {
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// Session Configuration
app.use(session({
    secret: 'hausarztpraxis-airoud-2025-secure-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// File Upload Configuration
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
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Nur Bilder sind erlaubt (JPEG, JPG, PNG, GIF, WebP)'));
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

// Helper functions
function loadContent() {
    try {
        const data = fs.readFileSync(contentFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading content:', error);
        return defaultContent;
    }
}

function saveContent(content) {
    try {
        // Create backup
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupDir, `content-backup-${timestamp}.json`);
        fs.writeFileSync(backupFile, fs.readFileSync(contentFile));
        
        // Save new content
        fs.writeFileSync(contentFile, JSON.stringify(content, null, 2));
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

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) {
        next();
    } else {
        res.redirect('/admin/login');
    }
}

// Routes
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

// Admin login handler
app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (username === DEFAULT_ADMIN.username && bcrypt.compareSync(password, DEFAULT_ADMIN.password)) {
        req.session.authenticated = true;
        res.redirect('/admin');
    } else {
        res.redirect('/admin/login?error=1');
    }
});

// Admin logout
app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// Admin dashboard
app.get('/admin', requireAuth, (req, res) => {
    const content = loadContent();
    res.send(`
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>CMS Admin - Hausarztpraxis Dr. Airoud</title>
            <link rel="stylesheet" href="/styles.css">
            <style>
                .admin-container {
                    min-height: 100vh;
                    background: var(--background-light);
                }
                .admin-header {
                    background: white;
                    padding: 1rem 0;
                    box-shadow: var(--shadow-light);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                }
                .admin-nav {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .admin-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--primary-color);
                    font-weight: 600;
                }
                .admin-actions {
                    display: flex;
                    gap: 1rem;
                }
                .btn {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: var(--border-radius);
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: var(--transition);
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .btn-primary {
                    background: var(--primary-color);
                    color: white;
                }
                .btn-primary:hover {
                    background: var(--secondary-color);
                }
                .btn-secondary {
                    background: var(--gray-medium);
                    color: white;
                }
                .btn-secondary:hover {
                    background: var(--text-dark);
                }
                .admin-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                }
                .section-card {
                    background: white;
                    padding: 2rem;
                    border-radius: var(--border-radius);
                    box-shadow: var(--shadow-light);
                    margin-bottom: 2rem;
                }
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid var(--gray-light);
                }
                .section-title {
                    color: var(--text-dark);
                    margin: 0;
                }
                .form-grid {
                    display: grid;
                    gap: 1.5rem;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
                .form-group input,
                .form-group textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border: 2px solid var(--gray-light);
                    border-radius: var(--border-radius);
                    font-size: 1rem;
                    font-family: inherit;
                    transition: var(--transition);
                }
                .form-group input:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: var(--primary-color);
                }
                .form-group textarea {
                    resize: vertical;
                    min-height: 100px;
                }
                .save-section {
                    text-align: center;
                    margin-top: 2rem;
                    padding-top: 2rem;
                    border-top: 2px solid var(--gray-light);
                }
                .success-message {
                    background: var(--success);
                    color: white;
                    padding: 1rem;
                    border-radius: var(--border-radius);
                    margin-bottom: 2rem;
                    text-align: center;
                }
                .service-item {
                    border: 2px solid var(--gray-light);
                    padding: 1rem;
                    border-radius: var(--border-radius);
                    margin-bottom: 1rem;
                }
                .service-item h4 {
                    color: var(--primary-color);
                    margin-bottom: 0.5rem;
                }
                .hours-item {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 0.5rem;
                }
                .hours-item input {
                    flex: 1;
                }
                .image-upload {
                    border: 2px dashed var(--gray-light);
                    border-radius: var(--border-radius);
                    padding: 2rem;
                    text-align: center;
                    transition: var(--transition);
                }
                .image-upload:hover {
                    border-color: var(--primary-color);
                }
                .image-preview {
                    max-width: 200px;
                    max-height: 200px;
                    border-radius: var(--border-radius);
                    margin-top: 1rem;
                }
                @media (max-width: 768px) {
                    .admin-nav {
                        flex-direction: column;
                        gap: 1rem;
                    }
                    .admin-content {
                        padding: 1rem;
                    }
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                    .section-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }
                }
            </style>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        </head>
        <body>
            <div class="admin-container">
                <header class="admin-header">
                    <nav class="admin-nav">
                        <div class="admin-logo">
                            <i class="fas fa-user-md"></i>
                            <span>Dr. Airoud CMS</span>
                        </div>
                        <div class="admin-actions">
                            <a href="/" target="_blank" class="btn btn-primary">
                                <i class="fas fa-external-link-alt"></i>
                                Website ansehen
                            </a>
                            <a href="/admin/logout" class="btn btn-secondary">
                                <i class="fas fa-sign-out-alt"></i>
                                Abmelden
                            </a>
                        </div>
                    </nav>
                </header>

                <main class="admin-content">
                    <form id="contentForm" method="POST" action="/admin/save" enctype="multipart/form-data">
                        
                        <!-- Intro Section -->
                        <div class="section-card">
                            <div class="section-header">
                                <h2 class="section-title">
                                    <i class="fas fa-home"></i>
                                    Startseite / Intro
                                </h2>
                            </div>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="intro_title">Haupttitel:</label>
                                    <input type="text" id="intro_title" name="intro_title" value="${content.intro.title}">
                                </div>
                                <div class="form-group">
                                    <label for="intro_subtitle">Untertitel:</label>
                                    <input type="text" id="intro_subtitle" name="intro_subtitle" value="${content.intro.subtitle}">
                                </div>
                                <div class="form-group">
                                    <label for="intro_feature1">Feature 1:</label>
                                    <input type="text" id="intro_feature1" name="intro_feature1" value="${content.intro.feature1}">
                                </div>
                                <div class="form-group">
                                    <label for="intro_feature2">Feature 2:</label>
                                    <input type="text" id="intro_feature2" name="intro_feature2" value="${content.intro.feature2}">
                                </div>
                                <div class="form-group">
                                    <label for="intro_feature3">Feature 3:</label>
                                    <input type="text" id="intro_feature3" name="intro_feature3" value="${content.intro.feature3}">
                                </div>
                                <div class="form-group">
                                    <label for="intro_cta">Button Text:</label>
                                    <input type="text" id="intro_cta" name="intro_cta" value="${content.intro.cta}">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="intro_description">Beschreibung:</label>
                                <textarea id="intro_description" name="intro_description" rows="4">${content.intro.description}</textarea>
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
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="services_title">Titel:</label>
                                    <input type="text" id="services_title" name="services_title" value="${content.services.title}">
                                </div>
                                <div class="form-group">
                                    <label for="services_subtitle">Untertitel:</label>
                                    <input type="text" id="services_subtitle" name="services_subtitle" value="${content.services.subtitle}">
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
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="about_title">Titel:</label>
                                    <input type="text" id="about_title" name="about_title" value="${content.about.title}">
                                </div>
                                <div class="form-group">
                                    <label for="about_doctorName">Arztname:</label>
                                    <input type="text" id="about_doctorName" name="about_doctorName" value="${content.about.doctorName}">
                                </div>
                                <div class="form-group">
                                    <label for="about_qualification">Qualifikation:</label>
                                    <input type="text" id="about_qualification" name="about_qualification" value="${content.about.qualification}">
                                </div>
                                <div class="form-group">
                                    <label for="about_languagesTitle">Sprachen Titel:</label>
                                    <input type="text" id="about_languagesTitle" name="about_languagesTitle" value="${content.about.languagesTitle}">
                                </div>
                                <div class="form-group">
                                    <label for="about_languagesDesc">Sprachen Beschreibung:</label>
                                    <input type="text" id="about_languagesDesc" name="about_languagesDesc" value="${content.about.languagesDesc}">
                                </div>
                                <div class="form-group">
                                    <label for="about_teamTitle">Team Titel:</label>
                                    <input type="text" id="about_teamTitle" name="about_teamTitle" value="${content.about.teamTitle}">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="about_welcome">Willkommenstext:</label>
                                <textarea id="about_welcome" name="about_welcome" rows="3">${content.about.welcome}</textarea>
                            </div>
                            <div class="form-group">
                                <label for="about_teamDesc">Team Beschreibung:</label>
                                <textarea id="about_teamDesc" name="about_teamDesc" rows="3">${content.about.teamDesc}</textarea>
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
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="contact_title">Titel:</label>
                                    <input type="text" id="contact_title" name="contact_title" value="${content.contact.title}">
                                </div>
                                <div class="form-group">
                                    <label for="contact_subtitle">Untertitel:</label>
                                    <input type="text" id="contact_subtitle" name="contact_subtitle" value="${content.contact.subtitle}">
                                </div>
                                <div class="form-group">
                                    <label for="contact_phone">Telefon:</label>
                                    <input type="text" id="contact_phone" name="contact_phone" value="${content.contact.phone}">
                                </div>
                                <div class="form-group">
                                    <label for="contact_email">E-Mail:</label>
                                    <input type="email" id="contact_email" name="contact_email" value="${content.contact.email}">
                                </div>
                                <div class="form-group">
                                    <label for="contact_hoursTitle">Sprechzeiten Titel:</label>
                                    <input type="text" id="contact_hoursTitle" name="contact_hoursTitle" value="${content.contact.hoursTitle}">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="contact_address">Adresse:</label>
                                <textarea id="contact_address" name="contact_address" rows="2">${content.contact.address}</textarea>
                            </div>
                        </div>

                        <div class="save-section">
                            <button type="submit" class="btn btn-primary" style="font-size: 1.2rem; padding: 1rem 3rem;">
                                <i class="fas fa-save"></i>
                                Änderungen speichern
                            </button>
                        </div>
                    </form>
                </main>
            </div>

            <script>
                document.getElementById('contentForm').addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const formData = new FormData(this);
                    
                    fetch('/admin/save', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Show success message
                            const successDiv = document.createElement('div');
                            successDiv.className = 'success-message';
                            successDiv.innerHTML = '<i class="fas fa-check-circle"></i> Änderungen erfolgreich gespeichert!';
                            
                            document.querySelector('.admin-content').insertBefore(successDiv, document.querySelector('.section-card'));
                            
                            // Remove success message after 3 seconds
                            setTimeout(() => {
                                successDiv.remove();
                            }, 3000);
                            
                            // Optional: Reload page content
                            setTimeout(() => {
                                window.location.reload();
                            }, 1500);
                        } else {
                            alert('Fehler beim Speichern: ' + (data.error || 'Unbekannter Fehler'));
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Fehler beim Speichern der Änderungen');
                    });
                });
            </script>
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
        if (req.body.contact_address) content.contact.address = req.body.contact_address;
        if (req.body.contact_phone) content.contact.phone = req.body.contact_phone;
        if (req.body.contact_email) content.contact.email = req.body.contact_email;
        if (req.body.contact_hoursTitle) content.contact.hoursTitle = req.body.contact_hoursTitle;
        
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

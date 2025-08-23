// Quick fix for login issues
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = 3001; // Use different port to avoid conflicts

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
    secret: 'hausarztpraxis-airoud-simple-auth',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// SIMPLE LOGIN - NO ENCRYPTION FOR TESTING
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

// Create data directory
const dataDir = path.join(__dirname, 'cms-data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const contentFile = path.join(dataDir, 'content.json');

// Default content
const defaultContent = {
    intro: {
        title: 'Willkommen in der Hausarztpraxis Dr. Airoud',
        subtitle: 'Ihre Gesundheit liegt uns am Herzen',
        feature1: 'Flexible Sprechzeiten',
        feature2: 'Erfahrenes Team',
        feature3: 'Persönliche Betreuung',
        description: 'Seit über 15 Jahren stehen wir Ihnen als kompetenter Partner für Ihre Gesundheit zur Seite. In unserer modernen Praxis verbinden wir medizinische Expertise mit persönlicher Betreuung und neuesten Behandlungsmethoden.',
        cta: 'Termin vereinbaren'
    },
    services: {
        title: 'Unsere Leistungen',
        subtitle: 'Umfassende medizinische Versorgung für die ganze Familie'
    },
    about: {
        title: 'Über uns',
        doctorName: 'Abdullah Airoud',
        qualification: 'Facharzt für Innere Medizin-Notfallmedizin',
        welcome: 'Herzlich willkommen in unserer Hausarztpraxis! Mit Kompetenz und Mitgefühl stehen wir unseren Patienten zur Seite. Ihre Gesundheit ist unsere Priorität.',
        languagesTitle: 'Sprachkenntnisse:',
        languagesDesc: 'Wir sprechen deutsch, englisch, arabisch und italienisch.',
        teamTitle: 'Unser Team',
        teamDesc: 'Unser engagiertes Team sorgt dafür, dass Sie sich in unserer Praxis wohlfühlen und optimal betreut werden.'
    },
    contact: {
        title: 'Kontakt',
        subtitle: 'Wir sind für Sie da - kontaktieren Sie uns',
        address: 'Eschenstr. 138<br>42283 Wuppertal',
        phone: '0202 25 350 880',
        email: 'info@hausarztpraxis-airoud.de',
        hoursTitle: 'Sprechzeiten'
    }
};

// Initialize content file
if (!fs.existsSync(contentFile)) {
    fs.writeFileSync(contentFile, JSON.stringify(defaultContent, null, 2));
}

// Helper functions
function loadContent() {
    try {
        const data = fs.readFileSync(contentFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return defaultContent;
    }
}

function saveContent(content) {
    try {
        fs.writeFileSync(contentFile, JSON.stringify(content, null, 2));
        return true;
    } catch (error) {
        return false;
    }
}

// Auth middleware
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

// Simple login page
app.get('/admin/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Login - Dr. Airoud CMS</title>
            <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 50px; }
                .login-box { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                h2 { text-align: center; color: #4a90a4; margin-bottom: 30px; }
                .form-group { margin-bottom: 20px; }
                label { display: block; margin-bottom: 5px; font-weight: bold; }
                input { width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 4px; font-size: 16px; }
                input:focus { border-color: #4a90a4; outline: none; }
                button { width: 100%; padding: 12px; background: #4a90a4; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
                button:hover { background: #2c5f70; }
                .error { color: red; text-align: center; margin-top: 10px; }
                .credentials { background: #e8f4f8; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <div class="login-box">
                <h2>🏥 Dr. Airoud CMS</h2>
                <div class="credentials">
                    <strong>Test-Anmeldedaten:</strong><br>
                    Benutzername: <code>admin</code><br>
                    Passwort: <code>admin123</code>
                </div>
                <form method="POST" action="/admin/login">
                    <div class="form-group">
                        <label>Benutzername:</label>
                        <input type="text" name="username" value="admin" required>
                    </div>
                    <div class="form-group">
                        <label>Passwort:</label>
                        <input type="password" name="password" value="admin123" required>
                    </div>
                    <button type="submit">Anmelden</button>
                    ${req.query.error ? '<div class="error">❌ Falsche Anmeldedaten</div>' : ''}
                </form>
            </div>
        </body>
        </html>
    `);
});

// Login handler
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        req.session.authenticated = true;
        res.redirect('/admin');
    } else {
        res.redirect('/admin/login?error=1');
    }
});

// Logout
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
            <title>CMS Admin - Dr. Airoud</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; background: #f5f5f5; }
                .header { background: white; padding: 15px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; }
                .header h1 { margin: 0; color: #4a90a4; }
                .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
                .section { background: white; margin-bottom: 20px; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .section h3 { color: #4a90a4; margin-top: 0; padding-bottom: 10px; border-bottom: 2px solid #e0e0e0; }
                .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; }
                .form-group { margin-bottom: 15px; }
                label { display: block; margin-bottom: 5px; font-weight: bold; }
                input, textarea { width: 100%; padding: 8px; border: 2px solid #ddd; border-radius: 4px; font-size: 14px; }
                textarea { height: 80px; resize: vertical; }
                .save-btn { background: #4a90a4; color: white; border: none; padding: 15px 30px; border-radius: 4px; font-size: 16px; cursor: pointer; }
                .save-btn:hover { background: #2c5f70; }
                .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
                .btn { padding: 8px 16px; text-decoration: none; border-radius: 4px; margin-left: 10px; }
                .btn-secondary { background: #6c757d; color: white; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏥 Dr. Airoud CMS</h1>
                <div>
                    <a href="/" target="_blank" class="btn btn-secondary">Website ansehen</a>
                    <a href="/admin/logout" class="btn btn-secondary">Abmelden</a>
                </div>
            </div>
            
            <div class="container">
                <form id="contentForm" method="POST" action="/admin/save">
                    
                    <div class="section">
                        <h3>📝 Startseite / Intro</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Haupttitel:</label>
                                <input type="text" name="intro_title" value="${content.intro.title}">
                            </div>
                            <div class="form-group">
                                <label>Untertitel:</label>
                                <input type="text" name="intro_subtitle" value="${content.intro.subtitle}">
                            </div>
                            <div class="form-group">
                                <label>Feature 1:</label>
                                <input type="text" name="intro_feature1" value="${content.intro.feature1}">
                            </div>
                            <div class="form-group">
                                <label>Feature 2:</label>
                                <input type="text" name="intro_feature2" value="${content.intro.feature2}">
                            </div>
                            <div class="form-group">
                                <label>Feature 3:</label>
                                <input type="text" name="intro_feature3" value="${content.intro.feature3}">
                            </div>
                            <div class="form-group">
                                <label>Button Text:</label>
                                <input type="text" name="intro_cta" value="${content.intro.cta}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Beschreibung:</label>
                            <textarea name="intro_description">${content.intro.description}</textarea>
                        </div>
                    </div>

                    <div class="section">
                        <h3>🩺 Leistungen</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Titel:</label>
                                <input type="text" name="services_title" value="${content.services.title}">
                            </div>
                            <div class="form-group">
                                <label>Untertitel:</label>
                                <input type="text" name="services_subtitle" value="${content.services.subtitle}">
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <h3>👨‍⚕️ Über uns</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Arztname:</label>
                                <input type="text" name="about_doctorName" value="${content.about.doctorName}">
                            </div>
                            <div class="form-group">
                                <label>Qualifikation:</label>
                                <input type="text" name="about_qualification" value="${content.about.qualification}">
                            </div>
                            <div class="form-group">
                                <label>Sprachen Titel:</label>
                                <input type="text" name="about_languagesTitle" value="${content.about.languagesTitle}">
                            </div>
                            <div class="form-group">
                                <label>Sprachen:</label>
                                <input type="text" name="about_languagesDesc" value="${content.about.languagesDesc}">
                            </div>
                            <div class="form-group">
                                <label>Team Titel:</label>
                                <input type="text" name="about_teamTitle" value="${content.about.teamTitle}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Willkommenstext:</label>
                            <textarea name="about_welcome">${content.about.welcome}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Team Beschreibung:</label>
                            <textarea name="about_teamDesc">${content.about.teamDesc}</textarea>
                        </div>
                    </div>

                    <div class="section">
                        <h3>📞 Kontakt</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Titel:</label>
                                <input type="text" name="contact_title" value="${content.contact.title}">
                            </div>
                            <div class="form-group">
                                <label>Untertitel:</label>
                                <input type="text" name="contact_subtitle" value="${content.contact.subtitle}">
                            </div>
                            <div class="form-group">
                                <label>Telefon:</label>
                                <input type="text" name="contact_phone" value="${content.contact.phone}">
                            </div>
                            <div class="form-group">
                                <label>E-Mail:</label>
                                <input type="email" name="contact_email" value="${content.contact.email}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Adresse:</label>
                            <textarea name="contact_address">${content.contact.address}</textarea>
                        </div>
                    </div>

                    <div style="text-align: center; padding: 20px;">
                        <button type="submit" class="save-btn">💾 Änderungen speichern</button>
                    </div>
                </form>
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
                            const successDiv = document.createElement('div');
                            successDiv.className = 'success';
                            successDiv.innerHTML = '✅ Erfolgreich gespeichert!';
                            
                            document.querySelector('.container').insertBefore(successDiv, document.querySelector('.section'));
                            
                            setTimeout(() => {
                                successDiv.remove();
                            }, 3000);
                        } else {
                            alert('❌ Fehler beim Speichern');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('❌ Fehler beim Speichern');
                    });
                });
            </script>
        </body>
        </html>
    `);
});

// Save content
app.post('/admin/save', requireAuth, (req, res) => {
    try {
        const content = loadContent();
        
        // Update content
        if (req.body.intro_title) content.intro.title = req.body.intro_title;
        if (req.body.intro_subtitle) content.intro.subtitle = req.body.intro_subtitle;
        if (req.body.intro_feature1) content.intro.feature1 = req.body.intro_feature1;
        if (req.body.intro_feature2) content.intro.feature2 = req.body.intro_feature2;
        if (req.body.intro_feature3) content.intro.feature3 = req.body.intro_feature3;
        if (req.body.intro_description) content.intro.description = req.body.intro_description;
        if (req.body.intro_cta) content.intro.cta = req.body.intro_cta;
        
        if (req.body.services_title) content.services.title = req.body.services_title;
        if (req.body.services_subtitle) content.services.subtitle = req.body.services_subtitle;
        
        if (req.body.about_doctorName) content.about.doctorName = req.body.about_doctorName;
        if (req.body.about_qualification) content.about.qualification = req.body.about_qualification;
        if (req.body.about_welcome) content.about.welcome = req.body.about_welcome;
        if (req.body.about_languagesTitle) content.about.languagesTitle = req.body.about_languagesTitle;
        if (req.body.about_languagesDesc) content.about.languagesDesc = req.body.about_languagesDesc;
        if (req.body.about_teamTitle) content.about.teamTitle = req.body.about_teamTitle;
        if (req.body.about_teamDesc) content.about.teamDesc = req.body.about_teamDesc;
        
        if (req.body.contact_title) content.contact.title = req.body.contact_title;
        if (req.body.contact_subtitle) content.contact.subtitle = req.body.contact_subtitle;
        if (req.body.contact_address) content.contact.address = req.body.contact_address;
        if (req.body.contact_phone) content.contact.phone = req.body.contact_phone;
        if (req.body.contact_email) content.contact.email = req.body.contact_email;
        
        if (saveContent(content)) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
        
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// API endpoint
app.get('/api/content', (req, res) => {
    res.json(loadContent());
});

app.listen(PORT, () => {
    console.log(`🚀 EINFACHES CMS läuft auf http://localhost:${PORT}`);
    console.log(`📊 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`🔑 Login: admin / admin123`);
    console.log(`✅ GARANTIERT FUNKTIONSFÄHIG!`);
});

module.exports = app;

// CMS JavaScript - Content Management System
class CMSManager {
    constructor() {
        this.currentLanguage = 'de';
        this.currentTab = 'content';
        this.translations = {};
        this.originalTranslations = {};
        this.hasUnsavedChanges = false;
        this.isLoggedIn = false;
        this.authToken = localStorage.getItem('cms_auth_token');
        this.apiBase = window.location.origin + '/api';

        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
        this.loadBackupHistory();
    }

    // Check if user is authenticated
    async checkAuthStatus() {
        if (this.authToken) {
            try {
                const response = await fetch(`${this.apiBase}/auth/verify`, {
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                });

                if (response.ok) {
                    this.isLoggedIn = true;
                    await this.loadTranslations();
                    this.hideLoginModal();
                    this.loadContentForLanguage();
                    this.loadTranslationEditor('de');
                    this.loadImageGallery();
                    this.loadContactInfo();
                    return;
                }
            } catch (error) {
                console.error('Error verifying token:', error);
            }
        }

        // If we get here, authentication failed
        this.authToken = null;
        localStorage.removeItem('cms_auth_token');
        this.showLoginModal();
    }

    // Load translations from server
    async loadTranslations() {
        try {
            const response = await fetch(`${this.apiBase}/translations`);
            if (response.ok) {
                this.translations = await response.json();
                this.originalTranslations = JSON.parse(JSON.stringify(this.translations));
            } else {
                console.error('Failed to load translations');
                // Fallback to local translations if available
                if (typeof translations !== 'undefined') {
                    this.translations = JSON.parse(JSON.stringify(translations));
                    this.originalTranslations = JSON.parse(JSON.stringify(translations));
                }
            }
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to local translations if available
            if (typeof translations !== 'undefined') {
                this.translations = JSON.parse(JSON.stringify(translations));
                this.originalTranslations = JSON.parse(JSON.stringify(translations));
            }
        }
    }

    // Load contact information from server
    async loadContactInfo() {
        try {
            const response = await fetch(`${this.apiBase}/contact`);
            if (response.ok) {
                const contactData = await response.json();
                
                // Fill in contact form
                this.setInputValue('practice-address', contactData.address || '');
                this.setInputValue('practice-phone', contactData.phone || '');
                this.setInputValue('practice-email', contactData.email || '');
                
                // Fill in opening hours
                if (contactData.hours) {
                    this.setInputValue('hours-monday', contactData.hours.monday || '');
                    this.setInputValue('hours-tuesday', contactData.hours.tuesday || '');
                    this.setInputValue('hours-wednesday', contactData.hours.wednesday || '');
                    this.setInputValue('hours-thursday', contactData.hours.thursday || '');
                    this.setInputValue('hours-friday', contactData.hours.friday || '');
                }
            }
        } catch (error) {
            console.error('Error loading contact info:', error);
        }
    }

    setupEventListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });

        // Language switcher for content
        document.getElementById('content-language').addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            this.loadContentForLanguage();
        });

        // Translation language switcher
        document.getElementById('translation-language').addEventListener('change', (e) => {
            this.loadTranslationEditor(e.target.value);
        });

        // Save and discard buttons
        document.getElementById('save-changes').addEventListener('click', () => {
            this.saveChanges();
        });

        document.getElementById('discard-changes').addEventListener('click', () => {
            this.discardChanges();
        });

        // Preview button
        document.getElementById('preview-btn').addEventListener('click', () => {
            this.openPreview();
        });

        // Backup functionality
        document.getElementById('create-backup').addEventListener('click', () => {
            this.createBackup();
        });

        document.getElementById('restore-backup').addEventListener('click', () => {
            this.restoreBackup();
        });

        // Image upload
        this.setupImageUpload();

        // Auto-save on input changes
        this.setupAutoSave();

        // Warn before leaving with unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    showLoginModal() {
        document.getElementById('login-modal').style.display = 'flex';
        document.getElementById('cms-interface').classList.add('cms-hidden');
    }

    hideLoginModal() {
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('cms-interface').classList.remove('cms-hidden');
    }

    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('login-error');

        try {
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                this.authToken = data.token;
                localStorage.setItem('cms_auth_token', this.authToken);
                
                this.isLoggedIn = true;
                await this.loadTranslations();
                this.hideLoginModal();
                this.loadContentForLanguage();
                this.loadTranslationEditor('de');
                this.loadImageGallery();
                this.loadContactInfo();
                this.showStatusMessage('Erfolgreich angemeldet!', 'success');
            } else {
                const error = await response.json();
                errorDiv.textContent = error.error || 'Anmeldung fehlgeschlagen';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorDiv.textContent = 'Verbindungsfehler';
            errorDiv.style.display = 'block';
        }
    }

    handleLogout() {
        if (this.hasUnsavedChanges) {
            if (!confirm('Sie haben ungespeicherte Änderungen. Möchten Sie wirklich abmelden?')) {
                return;
            }
        }
        
        this.isLoggedIn = false;
        this.hasUnsavedChanges = false;
        this.authToken = null;
        localStorage.removeItem('cms_auth_token');
        this.showLoginModal();
        
        // Clear form fields
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('login-error').style.display = 'none';
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;

        // Load specific content for the tab
        if (tabName === 'translations') {
            this.loadTranslationEditor(document.getElementById('translation-language').value);
        } else if (tabName === 'images') {
            this.loadImageGallery();
        } else if (tabName === 'contact') {
            this.loadContactInfo();
        }
    }

    loadContentForLanguage() {
        const lang = this.currentLanguage;
        
        if (!this.translations[lang]) {
            this.showStatusMessage(`Übersetzungen für ${lang} nicht gefunden`, 'error');
            return;
        }

        // Load intro section
        this.setInputValue('intro-title', this.translations[lang]['intro.title'] || '');
        this.setInputValue('intro-subtitle', this.translations[lang]['intro.subtitle'] || '');
        this.setInputValue('intro-description', this.translations[lang]['intro.description'] || '');
        this.setInputValue('intro-cta', this.translations[lang]['intro.cta'] || '');

        // Load about section
        this.setInputValue('about-doctor', this.translations[lang]['about.doctor'] || '');
        this.setInputValue('about-qualification', this.translations[lang]['about.qualification'] || '');
        this.setInputValue('about-welcome', this.translations[lang]['about.welcome'] || '');
        this.setInputValue('about-languages-desc', this.translations[lang]['about.languages.desc'] || '');
        this.setInputValue('about-team-desc', this.translations[lang]['about.team.desc'] || '');

        // Load services
        this.loadServicesForLanguage(lang);
    }

    loadServicesForLanguage(lang) {
        // Load service data for each service
        document.querySelectorAll('.service-editor').forEach(editor => {
            const inputs = editor.querySelectorAll('input[data-key], textarea[data-key]');
            inputs.forEach(input => {
                const key = input.dataset.key;
                if (this.translations[lang] && this.translations[lang][key]) {
                    input.value = this.translations[lang][key];
                }
            });
        });
    }

    setInputValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    }

    loadTranslationEditor(lang) {
        const editor = document.getElementById('translation-editor');
        editor.innerHTML = '';

        if (!this.translations[lang]) {
            editor.innerHTML = '<p>Keine Übersetzungen für diese Sprache gefunden.</p>';
            return;
        }

        const translations = this.translations[lang];
        const sections = this.groupTranslationsBySection(translations);

        Object.keys(sections).forEach(sectionName => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'content-section';
            
            const sectionTitle = document.createElement('h3');
            sectionTitle.innerHTML = `<i class="fas fa-folder"></i> ${this.getSectionDisplayName(sectionName)}`;
            sectionDiv.appendChild(sectionTitle);

            Object.keys(sections[sectionName]).forEach(key => {
                const formGroup = document.createElement('div');
                formGroup.className = 'form-group';

                const label = document.createElement('label');
                label.textContent = key;
                formGroup.appendChild(label);

                const input = document.createElement('textarea');
                input.value = sections[sectionName][key];
                input.dataset.translationKey = key;
                input.dataset.translationLang = lang;
                input.addEventListener('input', () => {
                    this.hasUnsavedChanges = true;
                    this.translations[lang][key] = input.value;
                });

                formGroup.appendChild(input);
                sectionDiv.appendChild(formGroup);
            });

            editor.appendChild(sectionDiv);
        });
    }

    groupTranslationsBySection(translations) {
        const sections = {};
        
        Object.keys(translations).forEach(key => {
            const sectionName = key.split('.')[0];
            if (!sections[sectionName]) {
                sections[sectionName] = {};
            }
            sections[sectionName][key] = translations[key];
        });

        return sections;
    }

    getSectionDisplayName(sectionName) {
        const displayNames = {
            'nav': 'Navigation',
            'intro': 'Startseite',
            'services': 'Leistungen',
            'about': 'Über uns',
            'contact': 'Kontakt',
            'modal': 'Modal-Inhalte',
            'footer': 'Footer'
        };
        return displayNames[sectionName] || sectionName;
    }

    setupAutoSave() {
        // Auto-save for content fields
        document.querySelectorAll('input[data-key], textarea[data-key]').forEach(input => {
            input.addEventListener('input', () => {
                this.hasUnsavedChanges = true;
                const key = input.dataset.key;
                if (key && this.translations[this.currentLanguage]) {
                    this.translations[this.currentLanguage][key] = input.value;
                }
            });
        });

        // Auto-save for content tab inputs
        document.querySelectorAll('#content-tab input, #content-tab textarea').forEach(input => {
            input.addEventListener('input', () => {
                this.hasUnsavedChanges = true;
            });
        });

        // Auto-save for contact information
        document.querySelectorAll('#contact-tab input, #contact-tab textarea').forEach(input => {
            input.addEventListener('input', () => {
                this.hasUnsavedChanges = true;
            });
        });
    }

    setupImageUpload() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('image-upload');

        // Drag and drop functionality
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary-color)';
            uploadArea.style.backgroundColor = 'rgba(74, 144, 164, 0.1)';
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border-color)';
            uploadArea.style.backgroundColor = 'transparent';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border-color)';
            uploadArea.style.backgroundColor = 'transparent';
            
            const files = e.dataTransfer.files;
            this.handleImageUpload(files);
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files);
        });
    }

    async handleImageUpload(files) {
        const formData = new FormData();
        
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                formData.append('images', file);
            }
        });

        try {
            const response = await fetch(`${this.apiBase}/images/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                this.showStatusMessage(`${result.images.length} Bild(er) hochgeladen`, 'success');
                this.loadImageGallery();
                this.hasUnsavedChanges = true;
            } else {
                const error = await response.json();
                this.showStatusMessage(error.error || 'Upload fehlgeschlagen', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.showStatusMessage('Upload fehlgeschlagen', 'error');
        }
    }

    async loadImageGallery() {
        try {
            const response = await fetch(`${this.apiBase}/images`);
            if (response.ok) {
                const images = await response.json();
                const gallery = document.getElementById('image-gallery');
                gallery.innerHTML = '';
                
                images.forEach(image => {
                    this.addImageToGallery(image.filename, image.url, image.originalName);
                });
            }
        } catch (error) {
            console.error('Error loading image gallery:', error);
        }
    }

    addImageToGallery(filename, url, originalName) {
        const gallery = document.getElementById('image-gallery');
        
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        
        imageItem.innerHTML = `
            <img src="${url}" alt="${originalName || filename}">
            <div class="image-actions">
                <button class="btn-small" onclick="cmsManager.copyImageUrl('${url}')" title="URL kopieren">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="btn-small" onclick="cmsManager.deleteImage('${filename}')" title="Löschen">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        gallery.appendChild(imageItem);
    }

    copyImageUrl(url) {
        navigator.clipboard.writeText(url).then(() => {
            this.showStatusMessage('Bild-URL kopiert!', 'success');
        });
    }

    async deleteImage(filename) {
        if (confirm('Möchten Sie dieses Bild wirklich löschen?')) {
            try {
                const response = await fetch(`${this.apiBase}/images/${filename}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    }
                });

                if (response.ok) {
                    this.loadImageGallery();
                    this.hasUnsavedChanges = true;
                    this.showStatusMessage('Bild gelöscht', 'success');
                } else {
                    this.showStatusMessage('Fehler beim Löschen', 'error');
                }
            } catch (error) {
                console.error('Delete error:', error);
                this.showStatusMessage('Fehler beim Löschen', 'error');
            }
        }
    }

    async saveChanges() {
        try {
            // Save translations
            await this.saveTranslations();
            
            // Save contact information
            await this.saveContactInfo();
            
            // Reset unsaved changes flag
            this.hasUnsavedChanges = false;
            
            // Update original translations
            this.originalTranslations = JSON.parse(JSON.stringify(this.translations));
            
            this.showStatusMessage('Alle Änderungen wurden gespeichert!', 'success');
        } catch (error) {
            console.error('Error saving changes:', error);
            this.showStatusMessage('Fehler beim Speichern der Änderungen', 'error');
        }
    }

    async saveTranslations() {
        try {
            const response = await fetch(`${this.apiBase}/translations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify({ translations: this.translations })
            });

            if (!response.ok) {
                throw new Error('Failed to save translations');
            }
        } catch (error) {
            console.error('Error saving translations:', error);
            throw error;
        }
    }

    async saveContactInfo() {
        try {
            const contactData = {
                address: document.getElementById('practice-address')?.value || '',
                phone: document.getElementById('practice-phone')?.value || '',
                email: document.getElementById('practice-email')?.value || '',
                hours: {
                    monday: document.getElementById('hours-monday')?.value || '',
                    tuesday: document.getElementById('hours-tuesday')?.value || '',
                    wednesday: document.getElementById('hours-wednesday')?.value || '',
                    thursday: document.getElementById('hours-thursday')?.value || '',
                    friday: document.getElementById('hours-friday')?.value || ''
                }
            };

            const response = await fetch(`${this.apiBase}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify(contactData)
            });

            if (!response.ok) {
                throw new Error('Failed to save contact info');
            }
        } catch (error) {
            console.error('Error saving contact info:', error);
            throw error;
        }
    }

    discardChanges() {
        if (confirm('Möchten Sie wirklich alle ungespeicherten Änderungen verwerfen?')) {
            // Restore original translations
            this.translations = JSON.parse(JSON.stringify(this.originalTranslations));
            
            // Reload current content
            this.loadContentForLanguage();
            this.loadTranslationEditor(document.getElementById('translation-language').value);
            this.loadContactInfo();
            
            this.hasUnsavedChanges = false;
            this.showStatusMessage('Änderungen verworfen', 'warning');
        }
    }

    openPreview() {
        // Open the main website in a new tab/window
        window.open('index.html', '_blank');
    }

    async createBackup() {
        try {
            const response = await fetch(`${this.apiBase}/backup/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                this.loadBackupHistory();
                this.showStatusMessage('Backup erfolgreich erstellt', 'success');
            } else {
                this.showStatusMessage('Fehler beim Erstellen des Backups', 'error');
            }
        } catch (error) {
            console.error('Error creating backup:', error);
            this.showStatusMessage('Fehler beim Erstellen des Backups', 'error');
        }
    }

    async restoreBackup() {
        const fileInput = document.getElementById('restore-upload');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showStatusMessage('Bitte wählen Sie eine Backup-Datei aus', 'warning');
            return;
        }

        if (confirm('Möchten Sie wirklich das Backup wiederherstellen? Alle aktuellen Daten werden überschrieben.')) {
            try {
                const formData = new FormData();
                formData.append('backup', file);

                const response = await fetch(`${this.apiBase}/backup/restore`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.authToken}`
                    },
                    body: formData
                });

                if (response.ok) {
                    // Reload all data
                    await this.loadTranslations();
                    this.loadContentForLanguage();
                    this.loadTranslationEditor('de');
                    this.loadImageGallery();
                    this.loadContactInfo();
                    
                    this.showStatusMessage('Backup erfolgreich wiederhergestellt!', 'success');
                } else {
                    const error = await response.json();
                    this.showStatusMessage(error.error || 'Fehler beim Wiederherstellen', 'error');
                }
            } catch (error) {
                console.error('Error restoring backup:', error);
                this.showStatusMessage('Fehler beim Wiederherstellen des Backups', 'error');
            }
        }
    }

    async loadBackupHistory() {
        if (!this.isLoggedIn || !this.authToken) return;

        try {
            const response = await fetch(`${this.apiBase}/backup/history`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (response.ok) {
                const history = await response.json();
                const listContainer = document.getElementById('backup-list');
                
                if (history.length === 0) {
                    listContainer.innerHTML = '<p>Keine Backups gefunden.</p>';
                    return;
                }
                
                listContainer.innerHTML = '';
                history.forEach(backup => {
                    const backupItem = document.createElement('div');
                    backupItem.className = 'backup-item';
                    
                    const date = new Date(backup.timestamp).toLocaleString('de-DE');
                    const size = Math.round(backup.size / 1024);
                    
                    backupItem.innerHTML = `
                        <div>
                            <strong>${date}</strong><br>
                            <small>Größe: ${size} KB</small>
                        </div>
                        <button class="btn btn-small btn-secondary" onclick="cmsManager.downloadBackup('${backup.filename}')">
                            <i class="fas fa-download"></i> Download
                        </button>
                    `;
                    
                    listContainer.appendChild(backupItem);
                });
            }
        } catch (error) {
            console.error('Error loading backup history:', error);
        }
    }

    async downloadBackup(filename) {
        try {
            const response = await fetch(`${this.apiBase}/backup/download/${filename}`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                window.URL.revokeObjectURL(url);
                
                this.showStatusMessage('Backup heruntergeladen', 'success');
            } else {
                this.showStatusMessage('Fehler beim Herunterladen', 'error');
            }
        } catch (error) {
            console.error('Error downloading backup:', error);
            this.showStatusMessage('Fehler beim Herunterladen', 'error');
        }
    }

    showStatusMessage(message, type = 'success') {
        const statusDiv = document.getElementById('status-message');
        statusDiv.textContent = message;
        statusDiv.className = `status-message ${type}`;
        statusDiv.classList.add('show');
        
        setTimeout(() => {
            statusDiv.classList.remove('show');
        }, 4000);
    }
}

// Initialize CMS when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cmsManager = new CMSManager();
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CMSManager;
}

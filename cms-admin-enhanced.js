// Enhanced CMS Admin JavaScript
class CMSAdmin {
    constructor() {
        this.isAutoSaving = false;
        this.hasUnsavedChanges = false;
        this.previewWindow = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAutoSave();
        this.setupCharacterCounters();
        this.setupFormValidation();
        this.setupKeyboardShortcuts();
        this.loadSavedDraft();
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('contentForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Track changes
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.hasUnsavedChanges = true;
                this.updateSaveButton();
                this.saveDraft();
            });
        });

        // Preview button
        const previewBtn = document.getElementById('previewBtn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => this.openPreview());
        }

        // Prevent accidental page leave
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = 'Sie haben ungespeicherte Änderungen. Möchten Sie die Seite wirklich verlassen?';
                return e.returnValue;
            }
        });

        // Auto-resize textareas
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            this.autoResize(textarea);
            textarea.addEventListener('input', () => this.autoResize(textarea));
        });
    }

    setupAutoSave() {
        setInterval(() => {
            if (this.hasUnsavedChanges && !this.isAutoSaving) {
                this.autoSave();
            }
        }, 30000); // Auto-save every 30 seconds
    }

    setupCharacterCounters() {
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            const maxLength = textarea.getAttribute('maxlength') || 500;
            const counter = document.createElement('div');
            counter.className = 'char-counter';
            counter.textContent = `${textarea.value.length}/${maxLength}`;
            
            textarea.parentNode.style.position = 'relative';
            textarea.parentNode.appendChild(counter);
            
            textarea.addEventListener('input', () => {
                counter.textContent = `${textarea.value.length}/${maxLength}`;
                if (textarea.value.length > maxLength * 0.9) {
                    counter.style.color = 'var(--warning-color)';
                } else {
                    counter.style.color = 'var(--gray-medium)';
                }
            });
        });
    }

    setupFormValidation() {
        const form = document.getElementById('contentForm');
        if (!form) return;

        const inputs = form.querySelectorAll('input[required], textarea[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+S oder Cmd+S zum Speichern
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveContent();
            }
            
            // Ctrl+P oder Cmd+P für Vorschau
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                this.openPreview();
            }
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const isValid = field.checkValidity();
        
        this.clearFieldError(field);
        
        if (!isValid) {
            this.showFieldError(field, field.validationMessage);
            return false;
        }
        
        // Custom validations
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showFieldError(field, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
                return false;
            }
        }
        
        if (field.name.includes('phone') && value) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(value)) {
                this.showFieldError(field, 'Bitte geben Sie eine gültige Telefonnummer ein.');
                return false;
            }
        }
        
        return true;
    }

    showFieldError(field, message) {
        field.style.borderColor = 'var(--danger-color)';
        
        let errorDiv = field.parentNode.querySelector('.field-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.style.color = 'var(--danger-color)';
            errorDiv.style.fontSize = '0.85rem';
            errorDiv.style.marginTop = '0.25rem';
            field.parentNode.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
    }

    clearFieldError(field) {
        field.style.borderColor = '';
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight + 2) + 'px';
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        const form = e.target;
        const inputs = form.querySelectorAll('input, textarea');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            this.showMessage('Bitte korrigieren Sie die Eingabefehler.', 'error');
            return;
        }
        
        await this.saveContent();
    }

    async saveContent() {
        if (this.isAutoSaving) return;
        
        this.isAutoSaving = true;
        this.updateSaveButton(true);
        
        try {
            const form = document.getElementById('contentForm');
            const formData = new FormData(form);
            
            const response = await fetch('/admin/save', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.hasUnsavedChanges = false;
                this.showMessage('✅ Änderungen erfolgreich gespeichert!', 'success');
                this.clearDraft();
                
                // Update preview if open
                if (this.previewWindow && !this.previewWindow.closed) {
                    this.previewWindow.location.reload();
                }
            } else {
                throw new Error(data.error || 'Unbekannter Fehler');
            }
        } catch (error) {
            console.error('Save error:', error);
            this.showMessage(`❌ Fehler beim Speichern: ${error.message}`, 'error');
        } finally {
            this.isAutoSaving = false;
            this.updateSaveButton(false);
        }
    }

    async autoSave() {
        if (this.isAutoSaving) return;
        
        this.saveDraft();
        
        // Show subtle auto-save indicator
        const indicator = document.createElement('div');
        indicator.textContent = '💾 Entwurf gespeichert';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            font-size: 0.85rem;
            z-index: 3000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(indicator);
        
        requestAnimationFrame(() => {
            indicator.style.opacity = '1';
            setTimeout(() => {
                indicator.style.opacity = '0';
                setTimeout(() => indicator.remove(), 300);
            }, 2000);
        });
    }

    saveDraft() {
        const form = document.getElementById('contentForm');
        if (!form) return;
        
        const formData = new FormData(form);
        const draftData = {};
        
        for (let [key, value] of formData.entries()) {
            draftData[key] = value;
        }
        
        localStorage.setItem('cms_draft', JSON.stringify(draftData));
        localStorage.setItem('cms_draft_timestamp', Date.now().toString());
    }

    loadSavedDraft() {
        const draft = localStorage.getItem('cms_draft');
        const timestamp = localStorage.getItem('cms_draft_timestamp');
        
        if (draft && timestamp) {
            const draftAge = Date.now() - parseInt(timestamp);
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            if (draftAge < maxAge) {
                const draftData = JSON.parse(draft);
                const shouldRestore = confirm('Es wurde ein ungespeicherter Entwurf gefunden. Möchten Sie ihn wiederherstellen?');
                
                if (shouldRestore) {
                    this.restoreDraft(draftData);
                }
            }
        }
    }

    restoreDraft(draftData) {
        Object.keys(draftData).forEach(key => {
            const field = document.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = draftData[key];
                this.autoResize(field);
            }
        });
        
        this.hasUnsavedChanges = true;
        this.updateSaveButton();
        this.showMessage('📝 Entwurf wiederhergestellt', 'success');
    }

    clearDraft() {
        localStorage.removeItem('cms_draft');
        localStorage.removeItem('cms_draft_timestamp');
    }

    updateSaveButton(loading = false) {
        const saveBtn = document.querySelector('.btn-success');
        if (!saveBtn) return;
        
        if (loading) {
            saveBtn.innerHTML = '<span class="loading-spinner"></span>Speichert...';
            saveBtn.disabled = true;
        } else {
            saveBtn.innerHTML = '<i class="fas fa-save"></i>Änderungen speichern';
            saveBtn.disabled = false;
            
            if (this.hasUnsavedChanges) {
                saveBtn.style.background = 'var(--warning-color)';
                saveBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i>Ungespeicherte Änderungen';
            } else {
                saveBtn.style.background = 'var(--success-color)';
            }
        }
    }

    showMessage(text, type = 'success') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
        messageDiv.innerHTML = `<i class="${icon}"></i>${text}`;
        
        const container = document.querySelector('.admin-content');
        container.insertBefore(messageDiv, container.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateY(-20px)';
            setTimeout(() => messageDiv.remove(), 300);
        }, 5000);
    }

    openPreview() {
        const previewUrl = `${window.location.origin}/?preview=true`;
        
        if (this.previewWindow && !this.previewWindow.closed) {
            this.previewWindow.focus();
            this.previewWindow.location.reload();
        } else {
            this.previewWindow = window.open(previewUrl, 'cms-preview', 'width=1200,height=800,scrollbars=yes,resizable=yes');
        }
    }

    // Export functionality
    exportContent() {
        fetch('/api/content')
            .then(response => response.json())
            .then(data => {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `cms-content-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showMessage('📁 Inhalte erfolgreich exportiert', 'success');
            })
            .catch(error => {
                console.error('Export error:', error);
                this.showMessage('❌ Fehler beim Exportieren', 'error');
            });
    }

    // Import functionality
    importContent(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate imported data structure
                if (!data.intro || !data.services || !data.about || !data.contact) {
                    throw new Error('Ungültige Dateistruktur');
                }
                
                // Fill form with imported data
                Object.keys(data).forEach(section => {
                    Object.keys(data[section]).forEach(key => {
                        const fieldName = `${section}_${key}`;
                        const field = document.querySelector(`[name="${fieldName}"]`);
                        if (field && data[section][key]) {
                            field.value = data[section][key];
                            this.autoResize(field);
                        }
                    });
                });
                
                this.hasUnsavedChanges = true;
                this.updateSaveButton();
                this.showMessage('📂 Inhalte erfolgreich importiert', 'success');
                
            } catch (error) {
                console.error('Import error:', error);
                this.showMessage(`❌ Fehler beim Importieren: ${error.message}`, 'error');
            }
        };
        
        reader.readAsText(file);
    }
}

// Initialize CMS Admin when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cmsAdmin = new CMSAdmin();
    
    // Add export/import buttons if they don't exist
    const header = document.querySelector('.admin-actions');
    if (header && !document.getElementById('exportBtn')) {
        const exportBtn = document.createElement('button');
        exportBtn.id = 'exportBtn';
        exportBtn.className = 'btn btn-secondary';
        exportBtn.innerHTML = '<i class="fas fa-download"></i>Export';
        exportBtn.onclick = () => window.cmsAdmin.exportContent();
        header.appendChild(exportBtn);
        
        const importLabel = document.createElement('label');
        importLabel.className = 'btn btn-secondary';
        importLabel.innerHTML = '<i class="fas fa-upload"></i>Import';
        importLabel.style.cursor = 'pointer';
        
        const importInput = document.createElement('input');
        importInput.type = 'file';
        importInput.accept = '.json';
        importInput.style.display = 'none';
        importInput.onchange = (e) => {
            if (e.target.files[0]) {
                window.cmsAdmin.importContent(e.target.files[0]);
            }
        };
        
        importLabel.appendChild(importInput);
        header.appendChild(importLabel);
    }
});

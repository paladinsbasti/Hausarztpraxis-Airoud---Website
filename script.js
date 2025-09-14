// DOM Elements
const hamburgerMenu = document.getElementById('hamburger-menu');
const mobileMenu = document.getElementById('mobile-menu');
const navbar = document.getElementById('navbar');
const doctorImage = document.getElementById('doctor-image');
const contactForm = document.getElementById('contact-form');

// CMS Content Management
let cmsContent = null;

// Load CMS content from server
async function loadCMSContent() {
    try {
        const response = await fetch('/api/content');
        if (response.ok) {
            cmsContent = await response.json();
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

// Apply CMS content to the page
function applyCMSContent() {
    if (!cmsContent) return;
    
    applyIntroContent();
    applyServicesContent();
    applyAboutContent();
    applyContactContent();
    applyVacationModal();
}

// Apply intro section content
function applyIntroContent() {
    if (!cmsContent.intro) return;
    const introSection = document.getElementById('intro');
    if (!introSection) return;

    // Update text content directly
    const title = introSection.querySelector('h1');
    if (title && cmsContent.intro.title) title.textContent = cmsContent.intro.title;
    
    const subtitle = introSection.querySelector('.intro-subtitle');
    if (subtitle && cmsContent.intro.subtitle) subtitle.textContent = cmsContent.intro.subtitle;
    
    const description = introSection.querySelector('.intro-description');
    if (description && cmsContent.intro.description) description.textContent = cmsContent.intro.description;
    
    const ctaButton = introSection.querySelector('.cta-button');
    if (ctaButton && cmsContent.intro.cta) ctaButton.textContent = cmsContent.intro.cta;
    
    // Update features
    const features = introSection.querySelectorAll('.feature span');
    if (features.length >= 3) {
        if (cmsContent.intro.feature1) features[0].textContent = cmsContent.intro.feature1;
        if (cmsContent.intro.feature2) features[1].textContent = cmsContent.intro.feature2;
        if (cmsContent.intro.feature3) features[2].textContent = cmsContent.intro.feature3;
    }
    
    // Update doctor image
    if (cmsContent.intro.doctorImage) {
        const img = introSection.querySelector('.doctor-image');
        if (img) img.src = cmsContent.intro.doctorImage;
    }
}

// Apply services section content
function applyServicesContent() {
    if (!cmsContent.services) return;
    const servicesSection = document.getElementById('services');
    if (!servicesSection) return;

    const title = servicesSection.querySelector('h2');
    if (title && cmsContent.services.title) title.textContent = cmsContent.services.title;

    const subtitle = servicesSection.querySelector('.section-subtitle');
    if (subtitle && cmsContent.services.subtitle) subtitle.textContent = cmsContent.services.subtitle;

    // Update service items if they exist in CMS
    if (cmsContent.services.items && Array.isArray(cmsContent.services.items)) {
        const serviceGrid = servicesSection.querySelector('.services-grid');
        if (serviceGrid) {
            // Clear existing content safely (we lose inline onclick handlers, will re-add programmatically)
            while (serviceGrid.firstChild) serviceGrid.removeChild(serviceGrid.firstChild);

            cmsContent.services.items.forEach(service => {
                const serviceElement = document.createElement('div');
                serviceElement.className = 'service-card';

                // Map service title to modal key/id
                const modalKey = deriveModalKey(service.title);
                if (modalKey) {
                    serviceElement.dataset.modalKey = modalKey; // store for debugging
                }

                // Create elements
                const iconDiv = document.createElement('div');
                iconDiv.className = 'service-icon';
                const icon = document.createElement('i');
                icon.className = service.icon || 'fas fa-heartbeat';
                iconDiv.appendChild(icon);

                const titleEl = document.createElement('h3');
                titleEl.textContent = service.title || '';

                const description = document.createElement('p');
                description.textContent = service.description || '';

                serviceElement.appendChild(iconDiv);
                serviceElement.appendChild(titleEl);
                serviceElement.appendChild(description);
                serviceGrid.appendChild(serviceElement);

                // Attach click handler if modal known
                serviceElement.addEventListener('click', () => {
                    if (!modalKey) return;
                    ensureModalExists(modalKey);
                    openModal('modal-' + modalKey);
                });
            });
        }
    }
}

// Apply about section content
function applyAboutContent() {
    if (!cmsContent.about) return;
    const aboutSection = document.getElementById('about');
    if (!aboutSection) return;

    // Update text content directly
    const title = aboutSection.querySelector('h2');
    if (title && cmsContent.about.title) title.textContent = cmsContent.about.title;
    
    const doctorName = aboutSection.querySelector('h3');
    if (doctorName && cmsContent.about.doctorName) doctorName.textContent = cmsContent.about.doctorName;
    
    const qualification = aboutSection.querySelector('.qualification');
    if (qualification && cmsContent.about.qualification) qualification.textContent = cmsContent.about.qualification;
    
    const welcome = aboutSection.querySelector('.welcome-text');
    if (welcome && cmsContent.about.welcome) welcome.textContent = cmsContent.about.welcome;
    
    const languagesTitle = aboutSection.querySelector('.languages h4');
    if (languagesTitle && cmsContent.about.languagesTitle) languagesTitle.textContent = cmsContent.about.languagesTitle;
    
    const languagesDesc = aboutSection.querySelector('.languages p');
    if (languagesDesc && cmsContent.about.languagesDesc) languagesDesc.textContent = cmsContent.about.languagesDesc;
    
    const teamTitle = aboutSection.querySelector('.team-info h4');
    if (teamTitle && cmsContent.about.teamTitle) teamTitle.textContent = cmsContent.about.teamTitle;
    
    const teamDesc = aboutSection.querySelector('.team-info p');
    if (teamDesc && cmsContent.about.teamDesc) teamDesc.textContent = cmsContent.about.teamDesc;
    
    // Update team image
    if (cmsContent.about.teamImage) {
        const img = aboutSection.querySelector('.team-image');
        if (img) {
            img.src = cmsContent.about.teamImage;
            if (!img.dataset.fallbackBound) {
                img.dataset.fallbackBound = '1';
                img.addEventListener('error', () => {
                    if (img.src.includes('team02')) {
                        console.warn('[TeamImage] team02.jpg nicht ladbar – Fallback auf ursprüngliches Team_Export.jpg');
                        img.src = 'images/Team_Export.jpg';
                    }
                });
            }
        }
    }
}

// Apply contact section content
function applyContactContent() {
    if (!cmsContent.contact) return;
    const contactSection = document.getElementById('contact');
    if (!contactSection) return;

    // Update text content directly
    const title = contactSection.querySelector('h2');
    if (title && cmsContent.contact.title) title.textContent = cmsContent.contact.title;
    
    const subtitle = contactSection.querySelector('.section-subtitle');
    if (subtitle && cmsContent.contact.subtitle) subtitle.textContent = cmsContent.contact.subtitle;
    
    const address = contactSection.querySelector('.address');
    if (address && cmsContent.contact.address) {
        // Safely handle address with line breaks
        address.textContent = '';
        const lines = cmsContent.contact.address.split('\n');
        lines.forEach((line, index) => {
            if (index > 0) address.appendChild(document.createElement('br'));
            address.appendChild(document.createTextNode(line));
        });
    }
    
    const phone = contactSection.querySelector('.phone');
    if (phone && cmsContent.contact.phone) phone.textContent = cmsContent.contact.phone;
    
    const email = contactSection.querySelector('.email');
    if (email && cmsContent.contact.email) email.textContent = cmsContent.contact.email;
    
    const hoursTitle = contactSection.querySelector('.hours h4');
    if (hoursTitle && cmsContent.contact.hoursTitle) hoursTitle.textContent = cmsContent.contact.hoursTitle;

    // Update opening hours
    if (cmsContent.contact.hours && Array.isArray(cmsContent.contact.hours)) {
        const hoursList = contactSection.querySelector('.hours-list');
        if (hoursList) {
            // Clear existing content safely
            while (hoursList.firstChild) {
                hoursList.removeChild(hoursList.firstChild);
            }
            
            cmsContent.contact.hours.forEach(hour => {
                const hourElement = document.createElement('div');
                hourElement.className = 'hour-item';
                
                // Create elements safely without innerHTML
                const daySpan = document.createElement('span');
                daySpan.className = 'day';
                daySpan.textContent = hour.day || '';
                
                const timeSpan = document.createElement('span');
                timeSpan.className = 'time';
                timeSpan.textContent = hour.time || '';
                
                hourElement.appendChild(daySpan);
                hourElement.appendChild(timeSpan);
                hoursList.appendChild(hourElement);
            });
        }
    }
}

// Vacation Modal
function applyVacationModal() {
    // Immer anzeigen – forcierter Modus
    if (!cmsContent.vacation) return; // minimale Sicherung
    try {
        // Duplikate verhindern (z.B. bei Hot-Reload oder doppelten Aufrufen)
        const existing = document.getElementById('vacation-modal');
        if (existing) {
            console.info('[VacationModal] Bereits vorhanden – erneutes Erstellen übersprungen.');
            return;
        }

        console.info('[VacationModal] Erstelle Urlaubs-Popup...');

        const modal = document.createElement('div');
        modal.id = 'vacation-modal';
        modal.className = 'vacation-modal';

        // Content Wrapper entsprechend Styles (.vacation-modal-content in CSS)
        const content = document.createElement('div');
        content.className = 'vacation-modal-content';

        // Header
        const header = document.createElement('div');
        header.className = 'vacation-modal-header';
        const icon = document.createElement('div');
        icon.className = 'vacation-icon';
        icon.innerHTML = '<i class="fas fa-umbrella-beach"></i>';
        const title = document.createElement('h2');
        title.textContent = cmsContent.vacation.title || 'Praxisurlaub';
    // Close X Button
    const closeX = document.createElement('button');
    closeX.type = 'button';
    closeX.className = 'vacation-close-x';
    closeX.setAttribute('aria-label','Fenster schließen');
    closeX.innerHTML = '&times;';
    closeX.addEventListener('click', closeVacationModal);

    header.appendChild(icon);
    header.appendChild(title);
    header.appendChild(closeX);

        // Body
        const body = document.createElement('div');
        body.className = 'vacation-modal-body';

        const message = document.createElement('p');
        message.className = 'vacation-message';
        message.style.whiteSpace = 'pre-line';
        message.textContent = formatVacationMessage(
            cmsContent.vacation.message,
            cmsContent.vacation.startDate,
            cmsContent.vacation.endDate
        );

        const emergency = document.createElement('div');
        emergency.className = 'vacation-emergency';
        const emergencyTitle = document.createElement('h3');
        emergencyTitle.textContent = cmsContent.vacation.emergencyTitle || 'Im Notfall:';
        const emergencyInfo = document.createElement('p');
        emergencyInfo.style.whiteSpace = 'pre-line';
        emergencyInfo.textContent = cmsContent.vacation.emergencyInfo || 'Ärztlicher Bereitschaftsdienst: 116 117';
        emergency.appendChild(emergencyTitle);
        emergency.appendChild(emergencyInfo);

        body.appendChild(message);
        body.appendChild(emergency);

        // Footer
        const footer = document.createElement('div');
        footer.className = 'vacation-modal-footer';
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'vacation-close';
        closeBtn.textContent = cmsContent.vacation.buttonText || 'Verstanden';
        closeBtn.addEventListener('click', closeVacationModal);
        footer.appendChild(closeBtn);

        content.appendChild(header);
        content.appendChild(body);
        content.appendChild(footer);
        modal.appendChild(content);
        document.body.appendChild(modal);

        // Aktivieren (CSS nutzt .vacation-modal.active)
        requestAnimationFrame(() => modal.classList.add('active'));
        console.info('[VacationModal] Anzeige aktiviert.');
    } catch (err) {
        console.error('[VacationModal] Fehler beim Erstellen:', err);
    }
}

function formatVacationMessage(message, startDate, endDate) {
    if (!message) return '';
    let formatted = message;
    if (startDate) {
        const start = new Date(startDate).toLocaleDateString('de-DE');
        formatted = formatted.replace(/\[STARTDATUM\]/g, start);
    }
    if (endDate) {
        const end = new Date(endDate).toLocaleDateString('de-DE');
        formatted = formatted.replace(/\[ENDDATUM\]/g, end);
    }
    return formatted;
}

function closeVacationModal() {
    const modal = document.getElementById('vacation-modal');
    if (modal) {
        modal.classList.remove('active');
        // optional: kleiner Fade-Out via inline style falls nötig
        setTimeout(() => {
            if (modal && !modal.classList.contains('active')) modal.remove();
        }, 200);
    }
}

// Modal functionality
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Use CSS class for consistent styling/centering
        modal.classList.add('active');
        // Remove any inline style remnants from previous implementation
        if (modal.style.display === 'block') modal.style.removeProperty('display');
        document.body.style.overflow = 'hidden';
        // Focus first heading for accessibility
        const focusTarget = modal.querySelector('h3, h2, .close, button');
        if (focusTarget) {
            try { focusTarget.focus(); } catch (e) {}
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        // Small timeout allows CSS transitions if later added
        setTimeout(() => {
            // Ensure hidden (fallback)
            if (!modal.classList.contains('active')) modal.style.display = 'none';
        }, 10);
        document.body.style.overflow = 'auto';
    }
}

// Derive modal key from a service title (lowercase / simple mapping)
function deriveModalKey(title) {
    if (!title) return null;
    const raw = title.toLowerCase().trim();
    // Direct matches to CMS modals keys
    const directMap = {
        'vorsorgeuntersuchungen': 'vorsorge',
        'blutuntersuchungen & labor': 'labor',
        'blutuntersuchungen & labor.': 'labor',
        'diagnostik': 'diagnostik',
        'hausbesuche': 'hausbesuche',
        'disease management': 'dmp',
        'disease-management-programme (dmp)': 'dmp',
        'disease-management-programme': 'dmp',
        // Neue/ausgeweitete Einzelleistungen (statische Modals in index.html)
        'ekg (elektrokardiogramm)': 'ekg',
        'langzeit-ekg': 'langzeit-ekg',
        'belastungs-ekg': 'belastungs-ekg',
        'langzeit-blutdruckmessung': 'blutdruck',
        'lungenfunktionstest': 'lungenfunktion',
        'ultraschalldiagnostik': 'ultraschall',
        'hautkrebsscreening': 'hautkrebsscreening',
        'psychosomatische grundversorgung': 'psychosomatik'
    };
    if (directMap[raw]) return directMap[raw];
    // Fallback: remove non letters
    const simplified = raw.replace(/[^a-z0-9]+/g, '-');
    if (['vorsorge','labor','diagnostik','hausbesuche','dmp','ekg','langzeit-ekg','belastungs-ekg','blutdruck','lungenfunktion','ultraschall','hautkrebsscreening','psychosomatik'].includes(simplified)) return simplified;
    return null;
}

// Ensure modal element exists in DOM for given modal key based on cmsContent.modals
function ensureModalExists(modalKey) {
    const existing = document.getElementById('modal-' + modalKey);
    if (existing) return existing;
    if (!cmsContent || !cmsContent.modals || !cmsContent.modals[modalKey]) return null;
    const data = cmsContent.modals[modalKey];
    const modal = document.createElement('div');
    modal.id = 'modal-' + modalKey;
    modal.className = 'modal';

    const content = document.createElement('div');
    content.className = 'modal-content';

    const closeSpan = document.createElement('span');
    closeSpan.className = 'close';
    closeSpan.innerHTML = '&times;';
    closeSpan.addEventListener('click', () => closeModal(modal.id));
    content.appendChild(closeSpan);

    const heading = document.createElement('h3');
    heading.textContent = data.title || '';
    content.appendChild(heading);

    const body = document.createElement('div');
    body.className = 'modal-body';

    if (data.intro) {
        const p = document.createElement('p');
        p.textContent = data.intro;
        body.appendChild(p);
    }
    if (data.listTitle) {
        const h4 = document.createElement('h4');
        h4.textContent = data.listTitle;
        body.appendChild(h4);
    }
    if (Array.isArray(data.items)) {
        const ul = document.createElement('ul');
        data.items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.replace(/\r?\n/g,' ').trim();
            ul.appendChild(li);
        });
        body.appendChild(ul);
    }
    if (data.note) {
        const p = document.createElement('p');
        p.textContent = data.note;
        body.appendChild(p);
    }
    if (data.outro) {
        const p = document.createElement('p');
        p.textContent = data.outro;
        body.appendChild(p);
    }

    content.appendChild(body);
    modal.appendChild(content);
    document.body.appendChild(modal);
    return modal;
}

// Mobile menu toggle
function toggleMobileMenu() {
    mobileMenu.classList.toggle('active');
    hamburgerMenu.classList.toggle('active');
}

// Scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
    // Close mobile menu if open
    if (mobileMenu.classList.contains('active')) {
        toggleMobileMenu();
    }
}

// Navbar scroll effect
function handleScroll() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Contact form submission
function handleContactSubmission(event) {
    event.preventDefault();
    
    const name = document.getElementById('contact-name')?.value;
    const email = document.getElementById('contact-email')?.value;
    const message = document.getElementById('contact-message')?.value;
    
    if (!name || !email || !message) {
        alert('Bitte füllen Sie alle Felder aus.');
        return;
    }
    
    // Create mailto link
    const subject = `Anfrage von ${name}`;
    const body = `Name: ${name}%0D%0AEmail: ${email}%0D%0ANachricht: ${message}`;
    const mailtoLink = `mailto:info@hausarztpraxis-airoud.de?subject=${encodeURIComponent(subject)}&body=${body}`;
    
    window.location.href = mailtoLink;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async function() {
    // Load CMS content
    const cmsLoaded = await loadCMSContent();
    if (cmsLoaded) {
        applyCMSContent();
    }
    
    // Mobile menu
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', toggleMobileMenu);
    }
    
    // Scroll effects
    window.addEventListener('scroll', handleScroll);
    
    // Contact form
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmission);
    }
    
    // Modal close functionality
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            const id = event.target.id;
            if (id) closeModal(id);
        } else if (event.target.classList.contains('close')) {
            const modal = event.target.closest('.modal');
            if (modal && modal.id) closeModal(modal.id);
        }
    });

    // ESC key closes the topmost active modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
                // Normale Service-Modals
                const activeModals = Array.from(document.querySelectorAll('.modal.active'));
                if (activeModals.length) {
                    const top = activeModals[activeModals.length - 1];
                    closeModal(top.id);
                    return;
                }
                // Vacation Modal
                const vacation = document.getElementById('vacation-modal');
                if (vacation && vacation.classList.contains('active')) {
                    closeVacationModal();
                }
        }
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!hamburgerMenu.contains(event.target) && !mobileMenu.contains(event.target)) {
            if (mobileMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        }
    });
});

// Close mobile menu when window is resized
window.addEventListener('resize', function() {
    if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
        toggleMobileMenu();
    }
});